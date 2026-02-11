
const userQueries = require('../infrastructure/DB/userQueries')





const validate_mobile_app = (req,res,next) =>{

try{
 const appSignature = req.headers['x-app-signature'];   // validate the signature extracted from app
  const userAgent = req.headers['user-agent'];     // validate weather the request is genuinely sent from a mobile application ** no postman or windows allowed

  const SSAID = req.headers['x-app-id'];

  if (appSignature !== process.env.APP_SIGNATURE_HASH) {
    return res.status(403).json({ error: 'Invalid app signature' });
  }

  if (!['android', 'ios'].includes(userAgent.toLowerCase())) {
    return res.status(403).json({ error: 'Invalid device type' });
  }


console.log("BASE",req.url)

  if(['/login','/login-otp-verify'].includes(req.url)){

    const user = userQueries.getUser(req.body.username);

    if(!user) throw new Error("No User Found for Device Validation!");

    if((user.device_id !== null || user.device_id?.length) && SSAID !== user.device_id) {
    return res.status(403).json({ error: 'Invalid Device Detected!' });
  }

  }

  else{
    const user = userQueries.getUserById(req.user.id);

    if(!user) throw new Error("No User Found for Device Validation!");

    if(SSAID !== user.device_id) {
    return res.status(403).json({ error: 'Invalid Device Detected!' });
  }

}

  next();
}

catch(err){

    console.log("ERROR",err)
    throw err;

}

}


const structure_login_data = (user,type) =>{

const user_data = structuredClone(user);

const roles = user_data.UserRoles;

if(!roles?.length){   // in case of no roles assigned yet for the user **
  user_data.UserRoles = [];
  return user_data
}

console.log("EXEC")

let permissonObj = {};

let typeMapping = {};

for(const role of roles){

  const filtered = role?.permissons?.filter((r)=>{
    let info = r.PermissionMaster;

    permissonObj[info.id] = info;
  });

  delete role?.permissons;
  
}


const entries = Object.values(permissonObj);

if(!entries?.length) return user_data;

const flattened =  entries.flat();

user_data.permissions = flattened;


if(type == "app_user"){    // dedicated structure for app users ** permissions

}

return user_data

}


module.exports = {validate_mobile_app,structure_login_data}

