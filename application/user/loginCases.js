
const userQueries = require('../../infrastructure/DB/userQueries');

const {issue_login_token } = require('../../infrastructure/JWT/services')
const bcrypt = require('bcrypt'); // or require('bcryptjs')




const {getIstTime} = require('../../infrastructure/helper');

const jwksClient =  require('jwks-rsa');


const client = jwksClient({
  jwksUri: 'https://login.microsoftonline.com/40c38e7e-7a74-4a92-aa6e-5cb451ab6db7/discovery/v2.0/keys',
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5
});

const axios = require('axios')

const MICROSOFT_TENANT = process.env.MICROSOFT_TENANT;
const CLIENT_ID = process.env.MS_CLIENT_ID;
const CLIENT_SECRET = process.env.MS_CLIENT_SECRET;
const REDIRECT_URI = process.env.MS_REDIRECT_URI;

const {structure_login_data} = require('../../domain/user');

const jwt = require("jsonwebtoken")


const login = async (req) =>{


    try{

    const {username} = req.body;


    const user = await userQueries.getUser(username);

    if(!user) throw new Error("Invalid Username or Password");

    // const isMatch = await bcrypt.compare(password, user.password.trim());

    // if(!isMatch) throw new Error("Invalid Username or Password");

    // bypass otp

    const otp = 12345;

    await userQueries.updateUser(user.id,{otp:String(otp)});

    return {message:"Successfully Sent!"}

    }

    catch(err){

        throw err;

    }
}


const verify_login_otp = async(req) =>{


    try{

    const {username,otp,access_token,id_token,email} = req.body;


    let sso_login = req.query?.sso == 'true'?true:false;


    console.log("IF SSPO",sso_login)
    

    let User;


    if(sso_login == true){

      User = await userQueries.getUser(email,"email");

    }
    else{

     User = await userQueries.getUser(username);

    }


    if(!User) throw new Error("Invalid Username or Password");

    // const isMatch = await bcrypt.compare(password, User.password);

    // if(!isMatch) throw new Error("Invalid Username or Password");

    //admin role specify once finalised**

    // if((User.otp !== otp)) throw new Error("Invalid OTP");



    if(sso_login == true){

      const token_verified = await verifyMicrosoftIdToken(id_token);

      console.log("TOKEN VERIFIED",token_verified);

      if(!token_verified || token_verified?.email !== email){
        let error = new Error();

        error.status = 403;

        error.message = 'UNAUTHORIZED';

        throw error;
      }
    }

    else{
     if((User.otp !== otp)) throw new Error("Invalid OTP");
    }


    const new_token = issue_login_token(User.id,User.role,User.employee_id);

    console.log("NEW TOKEN",new_token);

    // find existing sessions

    const sessions = await userQueries.getSessions(User.id);

    let resp = {token:new_token,
        user:User};

    if(sessions.length){
        let error = new Error();

        error.message = "Unauthorized";
        error.status = 403;

        // throw error;
    }


        // update session info and logged in

        await userQueries.createSession({
            user_id:User.id,
            token:new_token,
            logged_in_at:getIstTime(),
            active:true,
            device_id:req.headers['x-app-id'],
            created_at:getIstTime(),
            updated_at:getIstTime()
        });
    

  const ua = req.headers['user-agent'];

  let os = null;
  let osVersion = null;
  let deviceModel = null;

  if (ua && ua.includes('Android')) {
    const match = ua.match(/Android\s([0-9.]+);\s([^;]+)/);
    if (match) {
      os = 'android';
      osVersion = match[1];     // e.g., '14'
      deviceModel = match[2];   // e.g., 'Pixel 7'
    }
  } else if (ua && ua.includes('iPhone')) {
    os = 'ios';
    const match = ua.match(/iPhone OS\s([0-9_]+)/);
    if (match) {
      osVersion = match[1].replace(/_/g, '.'); // e.g., '16.5'
      deviceModel = 'iPhone';
    }
  }


    // clear otp once verified

    await userQueries.updateUser(User.id,{
        otp:null,
        device_id:req.headers['x-app-id'],
        os_version:osVersion,
        model_name:deviceModel,
        updated_at:getIstTime(),
    })

        // update the token in session 

        resp.user = structure_login_data(resp.user,"app_user")

        return resp;

    }

    catch(err){

        throw err;

    }
}


const punch_in = async(id,lat,long,active,type) =>{       // Hourly Punch in Log

    try{

    const user = await userQueries.getUserById(id);

    if(!user) throw new Error("No Record Found!");

    const attendance = await userQueries.getAttendance(id,new Date());

    console.log("ATTENDANCVE",attendance)

    if(!attendance) {

        let error = new Error();

        error.code = 1;

        error.message = "Please Log in your attendance to continue!"


        throw error;
    }


    const attendance_id = attendance?.id || 1

const now = new Date();

// Convert to IST timezone
const istDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

// Format as YYYY-MM-DD HH:mm:ss
const year = istDate.getFullYear();
const month = String(istDate.getMonth() + 1).padStart(2, "0");
const day = String(istDate.getDate()).padStart(2, "0");
const hours = String(istDate.getHours()).padStart(2, "0");
const minutes = String(istDate.getMinutes()).padStart(2, "0");
const seconds = String(istDate.getSeconds()).padStart(2, "0");

const formattedIST = `${hours}:${minutes}:${seconds}`;

console.log(formattedIST);


// determine the sequence of punch hour by calculating the current time

function toMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

// IST time in  minutes

const hour = istDate.getHours();
const min = istDate.getMinutes();
const currentMinutes = hour * 60 + min;
const start = toMinutes(user?.shift_start_time || '09:00');
const end = toMinutes(user?.shift_end_time || '23:00');

let hourNumber;

if (currentMinutes < start) {
  console.log("Shift hasn’t started yet");
  throw new Error("Invalid Request!");
} else if (currentMinutes > end) {
  console.log("Shift is over");
  throw new Error("Invalid Request!");
} else {
  const elapsed = currentMinutes - start;
  hourNumber = Math.floor(elapsed / 60) + 1;
  console.log(`Currently in hour ${hourNumber} of the shift`);
}



    const updateLog = await userQueries.createPunchIn({
        co_id:Number(id),
        punch_time:formattedIST,
        record_type:type || "Regular",
        active:active || false,
        punch_hour:hourNumber,
        attendance_log_id:attendance_id,
        created_at:new Date(),
        updated_at:new Date(),
        geo_lat:lat,
        geo_long:long
    })

    return {message:"Success",result:updateLog}


    }

    catch(err){

        throw err;
    }
}

const mark_attendance = async(id,lat,long) =>{
    try{

    const user = await userQueries.findFirst('user',{id:Number(id)});

    if(!user) throw new Error("Invalid User Request!");

    const create_log = await userQueries.log_attenance({
        co_id:user.id,
        log_type:"Regular",
        created_at:new Date(),
        updated_at:new Date(),
        active:true,
        geo_lat:lat,
        geo_long:long,
        start_time:user.shift_start_time,
        end_time:user.shift_end_time
    });

    return {message:"Success",result:create_log}


    }
    catch (err){

        throw err;

    }
}


function getKey(header, callback) {  // ** Helper
  client.getSigningKey(header.kid, function (err, key) {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

// handler to verify MS token and extract data

async function verifyMicrosoftIdToken(id_token) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      id_token,
      getKey,
      {
        audience: CLIENT_ID,
        issuer: [
          `https://login.microsoftonline.com/${MICROSOFT_TENANT}/v2.0`,
          `https://sts.windows.net/${MICROSOFT_TENANT}/`,
        ],
      },
      (err, decoded) => {
        if (err) return reject("Invalid Microsoft token");

        const email = decoded.preferred_username || decoded.email;
        const name = decoded.name || decoded.given_name || "Unknown";

        if (!email) return reject("Email not found in Microsoft token");

        resolve({ email, name, sub: decoded.sub, oid: decoded.oid });
      }
    );
  });
}

const SSO_log_in = async(code) =>{
 try {
    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${MICROSOFT_TENANT}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: CLIENT_ID,
        scope: "openid profile email",
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
        client_secret: CLIENT_SECRET,
      })
    );

    const { id_token, access_token } = tokenResponse.data;

    const verifiedUser = await verifyMicrosoftIdToken(id_token);

    const {email} = verifiedUser;

    if(!email) throw new Error("No Username Found to Verify! Invalid Data");   // sso here

    const User = await userQueries.getUserByEmail(email);

    if(!User) throw new Error("No User Data Found!");

    const new_token = issue_login_token(User.id,User.role,User.employee_id);

    let resp = {message:"Success",user:structure_login_data(User),token:new_token};

    return resp;


  } catch (err) {
    console.error("Microsoft verification failed:", err.response?.data || err);
    throw new Error("Microsoft SSO verification failed");
  }
}
 

module.exports = {login,verify_login_otp,punch_in,mark_attendance,SSO_log_in};