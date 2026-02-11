const bcrypt = require('bcrypt'); // or require('bcryptjs')

const jwt = require("jsonwebtoken");


const prisma = require('../../prisma/global')

const JWT_SECRET = process.env.JWT_SECRET;


const getRequestIp = (req) => {
  return (req.headers["x-forwarded-for"] || req.ip || "").toString().split(",")[0].trim();
};

const admin_login = async (req,res,next) =>{

    try{

    const{username} = req?.params;

    if(!username) throw new Error("Missing Credentials");

    const {password} = req.body;

    if(!password) throw new Error("Missing Credentials");

    const user_data = await prisma.User.findFirst({
        where:{
            mobile_number:username
        }
    });
    

    if(!user_data) throw new Error("Invalid Credentials");

    const isMatch = await bcrypt.compare(password, user_data.password);

    if(!isMatch) throw new Error("Invalid Credentials");


    // initiate otp to the mobile number and store it ** no need of additional call from frontend

    // exotel - kaleyra - jio logic here

    const otp = "2000"  // dummy as of now;


    // initiate temp token with ip for additional security while verifying otp; ** changes to avoid attacks
    

    const ip = getRequestIp(req);

      const tempTokenPayload = {
      id: String(user_data.id),
      type: "generate_otp_temp",
      ip,
      iat: Math.floor(Date.now() / 1000),
    };

      const tempToken = jwt.sign(tempTokenPayload, JWT_SECRET, {
      expiresIn: Number(process.env.TEMP_TOKEN_EXPIRES_SEC || 300) || process.env.TEMP_TOKEN_EXPIRES_SEC,
    });


    await prisma.User.update({
        where:{
            id:Number(user_data.id)
        },
        data:{
            otp:otp,
            otp_sent_at:new Date(),
            temp_token:tempToken
        }
    });

    return res.json({
        message:"OTP sent successfully",
        temp_token:tempToken,
        status:200
    })


    }

    catch(err){

        next(err)
    }
}


const verify_admin_login_otp = async(req,res,next) =>{

    try{

    const {otp} = req.body;

    // const{id} = req.user || 1

    const id = 1

    if(!otp || !id) throw new Error("Missing Login Info");

    const user_data = await prisma.User.findUnique({
        where:{
            id:Number(id)
        }
    });

    if(!user_data) throw new Error("Invalid Credentials");

    if(otp !== user_data?.otp) throw new Error("Invalid OTP");

    if(!['ACM','RCM','ZCM'].includes(user_data?.role)){

        let customError = new Error();

        customError.status = 401;

        customError.message = "Unauthorized Login Attempt Detected";

        throw customError;
    }

    // successfully log in scenario check active sesssions

    const active_sessions = await prisma.Session.findMany({
        where:{
            user_id:Number(id),
            logged_out_at:null
        }
    });

    const ip = getRequestIp(req);

      const token_payload = {
      id: String(user_data.id),
      type: "log_in_token",
      ip,
      iat: Math.floor(Date.now() / 1000),
    };

      const token = jwt.sign(token_payload, JWT_SECRET, {
      expiresIn: Number(process.env.TOKEN_EXPIRY || 1000) || process.env.TEMP_TOKEN_EXPIRES_SEC,
    });


    if(active_sessions?.length) return res.json({
        active_sessions:true,
        token:token,
        message:"You have active sessions, would you like to log out and proceed here ?"
    });


    // normal login if no sessions active


       await prisma.Session.create({
        data:{
            user_id:Number(id),
            token:token,
            logged_in_at: new Date(),
            active:true,
            created_at: new Date(),
            updated_at:new Date(),
        }
    });

    return res.json({
    active_sessions:false,
    token:token,
    message:"Successfully Logged In",
    user:user_data
    })


    }

    catch(err){

        next(err);

    }

}


const admin_log_out = async (req,res,next) =>{


    try{

        const{session_login} = req.query;

        const{id} = req.user;

        if(session_login){      // case where user had active sessions hence logging out to login to new session

            const active_sessions = await prisma.Session.updateMany({
                where:{
                    user_id:Number(id),
                        logged_out_at:{
                in:['',null]
            }
                },

                data:{
                    logged_out_at:new Date(),
                    active:false

                }

            });

             const ip = getRequestIp(req);

      const token_payload = {
      id: String(user_data.id),
      type: "log_in_token",
      ip,
      iat: Math.floor(Date.now() / 1000),
    };

      const token = jwt.sign(token_payload, JWT_SECRET, {
      expiresIn: Number(process.env.TOKEN_EXPIRY || 300) || process.env.TEMP_TOKEN_EXPIRES_SEC,
    });


    // additionally create a new row with new token

    await prisma.Session.create({
        data:{
            user_id:Number(id),
            token:token,
            logged_in_at: new Date(),
            active:true,
            created_at: new Date(),
            updated_at:new Date(),
        }
    });

    return res.json({
        message:"Successfully Logged in",
        token:token
    })

            
        }

    // normal log out request for admin **

    await prisma.Session.updateMany({
        where:{
            user_id:Number(id),
            logged_out_at:{
                in:['',null]
            }
        },
        data:{
            logged_out_at: new Date(),
            active:false
        }
    });

    return res.json({
        message:"Successfully Logged Out",
        status:200
    })
    }

    catch(err){

        next(err)
    }
}


module.exports = {admin_login,verify_admin_login_otp}