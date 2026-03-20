const jwt = require("jsonwebtoken")

const JWT_SECRET = process.env.JWT_SECRET // keep in .env

const prisma = require('../../prisma/global');



const validate_ip = (req,value) =>{

    let incoming_ip = (req.headers["x-forwarded-for"] || req.ip || "").toString().split(",")[0].trim();


    let valid = incoming_ip === value?true:false;

    return valid;
}


const getCustomError = (status,message) =>{

    let errorObj = new Error();

    errorObj.status = status;
    errorObj.message = message;

    return errorObj;
}

const verify_token = async(req,res,next)=>{


    try{

        // in case of login and otp-verify bypass the verify  ** for all users


        let split_path = req.originalUrl.split('/')

        console.log(split_path[split_path.length-1])
        if(['login-otp-verify','login','login-otp-verify?sso=true'].includes(split_path[split_path.length-1])){
             return next()
        }



        let token = req.headers?.["authorization"];



        if(!token) throw getCustomError(401,"No Token Found")

        console.log(":TOKENB",token)

    if (!token) throw new Error("Invalid token format");


        const decoded = jwt.verify(token, JWT_SECRET);

        const id = decoded.id;



            const user_data = await prisma.UserSessions.findMany({
                where:{
                    user_id:Number(id),
                    token:token,
                    logged_out_at:null,
                    active:true
                },

            });

            if(!user_data)  throw getCustomError(401,"Invalid Token")

            // verify ip as well if token ip and request ip is same
        

        req.user = decoded;

        next();

    }

    catch(err){

        console.log("ERR",err)

         return res.status(401).json({
            message:"Unauthorized"
         })
    }
}




const issue_login_token = (id,role,employee_id) =>{

    try{

    
        //   const token =  jwt.sign(tokenPayLoad, JWT_SECRET, {
        //   expiresIn: Number(process.env.TEMP_TOKEN_EXPIRES_SEC || 300) || process.env.TEMP_TOKEN_EXPIRES_SEC,
        // });

        // return new Promise((res,rej)=>{

        // });


    const token = jwt.sign(
      {
          id: id,
          role: role,
          employee_id:employee_id,
          iat: Math.floor(Date.now() / 1000),
        },
      process.env.JWT_SECRET,
      { expiresIn: Number(process.env.TEMP_TOKEN_EXPIRES_SEC || 300) }
    );
    return token
    }

    catch(err){

        throw err;

    }


}




module.exports = {verify_token,issue_login_token}