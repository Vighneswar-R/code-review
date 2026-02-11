const http = require('http');


const express = require('express');

const app = express();

const cookieParser = require('cookie-parser')


const {initSocket} = require('./infrastructure/socket/server');

const {attachSocketAuth } = require('./infrastructure/socket/auth');

const {bindBinlogSocketBridge} = require('./infrastructure/socket/bridge')


const server = http.createServer(app);

app.use(cookieParser())


const startBinlog = require("./binlog");


const cors = require('cors');

const prisma = require('./prisma/global');

const{encrypt,decrypt} = require('./crypto')

const cron = require('node-cron');

const routes = require('./interfaces/http_requests/Routes/main');

const {payment_cron} = require('./domain/schedulers');




app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS']
}));


// const BLOCKED_UA_PATTERNS = [
//   /postman/i,
//   /insomnia/i,
//   /paw/i,
//   /httpclient/i,
//   /curl/i,
//   /wget/i
// ];

// app.use((req, res, next) => {
//   const ua = req.headers['user-agent'] || '';

//   console.log("HEADERS REQ",req.headers)

//   const isBlocked = BLOCKED_UA_PATTERNS.some(pattern =>
//     pattern.test(ua)
//   );


//   if (isBlocked || !req.headers['origin']) {
//     return res.status(403).json({
//       error: 'Forbidden client'
//     });
//   }

//   next();
// });


startBinlog();
app.use((req, res, next) => {
  console.log('HIT:', req.method, req.originalUrl);
  next();
});


app.post('/test-send',async (req, res, next) => {

    const jwt = require("jsonwebtoken")

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // keep in .env
    try {
       
        const token = req?.cookies?.authToken;

        console.log("TOKEN H",req?.cookies)
 
        if (!token) {
           
            let secretKey = "supersecretkey"//process.env.ACCESS_TOKEN;
            const payload = {
                userId: req.body.number,
                // iat: moment().valueOf(),
                // exp: moment().add(10, 'm').valueOf()
            };
 
            const newToken = jwt.sign(payload, secretKey);
           
           
            res.cookie('authToken', newToken, {
                httpOnly: true,
                  secure: false,     // MUST be false on http
  sameSite: 'lax',   // MUST NOT be strict for localhost cross-port
                // maxAge: 10 * 60 * 1000
            });
 
            return res.status(200).send({
                status: 'SUCCESS!',
                authorized: false,
                message: 'Token generated, please retry'
            });
        }
 
        // Verify JWT token
        let decoded;
        try {
            decoded = jwt.verify(token, "supersecretkey");
        } catch (err) {
 
            res.cookie('authToken', '');
            return res.status(401).json({
                status: "ERROR",
                message: 'Invalid or expired token'
            });
 
 
        }
 
        // Validate request body
        // const schema = Joi.object({
        //     number: Joi.string().required().trim().min(10).max(10)
        // });
 
        // const { error } = schema.validate(req.body);
        // if (error) return res.status(400).json({ error: error.details[0].message });
 
        // // Verify the number matches the token
        // if (decoded.userId !== req.body.number) {
        //     return res.status(403).json({
        //         status: CONSTANT.REQUESTED_CODES.ERROR,
        //         message: 'Unauthorized request'
        //     });
        // }
 
        // // Process OTP
        // let otp = await otpModel.findOne({ where: { number: req.body.number } });
        // if (otp) otp = UTILS.cloneObject(otp);
       
        // let randomNumber = await UTILS.getRandomNumber();
        // const expiryTime = moment().add(10, 'm').valueOf();
 
        // if (otp) {
        //     // Update existing OTP
        //     await otpModel.update(
        //         { token: randomNumber, expiry: expiryTime },
        //         { where: { number: req.body.number } }
        //     );
        // } else {
        //     // Create new OTP entry
        //     otp = {
        //         token: randomNumber,
        //         number: req.body.number,
        //         expiry: expiryTime,
        //     };
        //     await otpModel.create(otp);
        // }
 
        // let mobile = '+91' + req.body.number;
 
       
        // const request = require('request');
        //  let options = {
        //     'method': 'POST',
        //     'url': ``,
        //     'headers': {
        //     }
        // };


              return res.status(200).send({
                    status: 'SUCCESS!',
                    authorized: true,
                    result: 'OTP sent successfully'
                });


                // returning **
        request(options, function (error, response) {
            if (error) {
                console.error('SMS API Error:', error);
                return res.status(400).send({
                    status: CONSTANT.REQUESTED_CODES.ERROR,
                    error: 'Failed to send OTP'
                });
            }
           
           
                return res.status(200).send({
                    status: CONSTANT.REQUESTED_CODES.SUCCESS,
                    authorized: true,
                    result: 'OTP sent successfully'
                });
            
        });
 
    } catch (error) {
        console.error('Send OTP Error:', error);
        return res.status(400).json(UTILS.errorHandler(error));
    }

})  


//testing socket io **

const io = initSocket(server);

attachSocketAuth(io);


bindBinlogSocketBridge();

// override response as encrypted ** throughout application before sending to client

// app.use((req, res, next) => {
//   const originalJson = res.json.bind(res);

//   console.log(JSON.stringify(originalJson))

//   res.json = (body) => {
//     // optional: allow bypass if needed
//     if (res.locals.skipEncrypt) return originalJson(body);

//     try {
//       const encrypted = encrypt(body);
//       res.setHeader("Content-Type", "application/json");
//       res.end(JSON.stringify(encrypted));
//     } catch (err) {
//       console.error("Encryption failed:", err);
//       res.status(500).json({ error: "Response encryption failed" });
//     }
//   };

//   next();
// });



app.use('/api-collect/',(req,res,next)=>{

// decrypt all requests before forwarding to routes **


// if(req?.body?.data){

//     const decrypted = decrypt(req.body.data);

//     console.log("FINAL",decrypted)


//     req.body = decrypted;

// }

    next();

},routes())




app.use((err,req,res,next)=>{


    console.log("included",err?.message.includes('prisma'))

    if(err?.message.includes('prisma')) err.message = 'Database Validation Error!'

    return res.status(500).json({"Message":err.message})
});


// app.listen(process.env.PORT || 8000,()=>{
//     console.log(`App Started at ${process.env.PORT || 8000}`)
// });


server.listen(process.env.PORT || 8000,()=>{
        console.log(`App Started at ${process.env.PORT || 8000}`)

});


// cron.schedule('*/ * * * *',payment_cron);