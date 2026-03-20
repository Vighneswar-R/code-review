const http = require('http');


const express = require('express');

const app = express();


const {initSocket} = require('./infrastructure/socket/server');

const {attachSocketAuth } = require('./infrastructure/socket/auth');

const {bindBinlogSocketBridge} = require('./infrastructure/socket/bridge')

const cookieParser = require("cookie-parser");

const server = http.createServer(app);

app.use(cookieParser())


const startBinlog = require("./binlog");


const cors = require('cors');

const prisma = require('./prisma/global');

const{encrypt,decrypt} = require('./crypto')

const cron = require('node-cron');

const routes = require('./interfaces/http_requests/Routes/main');

const {payment_cron} = require('./domain/schedulers');


 console.log = () => {};
 console.error = () => {};


app.set("trust proxy", 1);

app.use(cookieParser());

app.use(express.json());

// app.use(cors({
//   origin: 'http://localhost:5173',
//   credentials: true,
//   methods: ['GET', 'POST', 'OPTIONS']
// }));


const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

app.use(cors({
  origin: function (origin, callback) {

    // allow server-to-server or Postman (no origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    
    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With"
  ]
}));


app.options("*", cors());
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




//testing socket io **

const io = initSocket(server);

attachSocketAuth(io);


bindBinlogSocketBridge();

// override response as encrypted ** throughout application before sending to client

app.use((req, res, next) => {
  const originalJson = res.json.bind(res);

  console.log(JSON.stringify(originalJson))

  res.json = (body) => {
    // optional: allow bypass if needed
    if (res.locals.skipEncrypt) return originalJson(body);

    try {
      const encrypted = encrypt(body);
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(encrypted));
    } catch (err) {
      console.error("Encryption failed:", err);
      res.status(500).json({ error: "Response encryption failed" });
    }
  };

  next();
});



app.use('/api-collect/',(req,res,next)=>{

// decrypt all requests before forwarding to routes **


if(req?.body?.data){

    const decrypted = decrypt(req.body.data);

    console.log("FINAL",decrypted)


    req.body = decrypted;

}

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