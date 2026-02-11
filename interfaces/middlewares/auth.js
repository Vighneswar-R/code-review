const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // keep in .env

const jwksClient = require("jwks-rsa");

const client = jwksClient({
  jwksUri: "https://login.microsoftonline.com/common/discovery/v2.0/keys",
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

function verifyMicrosoftToken(idToken) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      idToken,
      getKey,
      {
        audience: process.env.AZURE_CLIENT_ID,
        issuer: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0`,
        algorithms: ["RS256"],
      },
      (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      }
    );
  });
}

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

            // in case of temp token issued at otp generation

        let temp_verify = req.baseUrl.includes('verify-admin-otp')?true:false;

        let token = req.headers?.["authorization"];

        if(!token) throw getCustomError(401,"No Token Found")

         token = token.split(" ")[1];
    if (!token) throw new Error("Invalid token format");

        const decoded = jwt.verify(token, JWT_SECRET);

        const id = decoded.id;


        if(temp_verify){

            const user_data = await prisma.User.findUnique({
                where:{
                    id:Number(id)
                },
                select:{
                    temp_token:true
                }
            });

            if(user_data.temp_token !== token) throw getCustomError(401,"Invalid Token")

            // ip validation required
const valid_ip = validate_ip(req,decoded?.ip);

if(!valid_ip)  throw getCustomError(401,"Invalid Token")


        }

        else{
            const user_data = await prisma.Session.findMany({
                where:{
                    user_id:Number(id),
                    logged_out_at:{
                        in:['',null]
                    },
                    active:true
                },

            });

            if(!user_data)  throw getCustomError(401,"Invalid Token")

            // if multiple logins found throw errors as one active only allowed

            if(user_data?.length > 1) throw getCustomError(401,"Invalid Token");

            let existing_token = user_data?.[0]?.token;

            if(token !== existing_token) throw getCustomError(401,"Invalid Token");

            // verify ip as well if token ip and request ip is same

            const valid = validate_ip(req,decoded?.ip);

            if(!valid) throw getCustomError(401,"Invalid Token");

        }

        req.user = decoded;

        next();

    }

    catch(err){

         return res.status(401).json({
            message:"Unauthorized"
         })
    }
}

const verify_ms_token = async (req, res, next) => {

  if (req.query?.sso === "true" && req.query?.id_token) {

    try {
      const decoded = await verifyMicrosoftToken(req.query.id_token);

      if (!decoded.sub || !decoded.tid) {
        return res.status(403).json({ message: "Invalid token claims" });
      }

      if (decoded.tid !== process.env.AZURE_TENANT_ID) {
        return res.status(403).json({ message: "Invalid tenant" });
      }

      const email =
        decoded.email ||
        decoded.preferred_username ||
        null;

      if (!email) {
        return res.status(403).json({ message: "Email not present" });
      }
      req.ssoUser = {
        provider: "microsoft",
        sub: decoded.sub,
        email,
        name: decoded.name || null,
      };

      return next();

    } catch (err) {
      console.error("Error validating MS token", err.message);
      return res.status(403).json({ message: "Unauthorized" });
    }
  }

  return next();
};

module.exports = {verify_token,verify_ms_token}