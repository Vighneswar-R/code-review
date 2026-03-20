

const userQueries = require('../../infrastructure/DB/userQueries');

const genericQueries = require('../../infrastructure/DB/genericQueries');

const {issue_login_token } = require('../../infrastructure/JWT/services')
const bcrypt = require('bcrypt'); // or require('bcryptjs')
const{encrypt,decrypt} = require('../../crypto')


const getIstTime = () =>{
  const now = new Date();

// IST offset is +5:30 → 330 minutes
const IST_OFFSET_MINUTES = 330;

const updated_at_ist = new Date(now.getTime() + IST_OFFSET_MINUTES * 60 * 1000 - now.getTimezoneOffset() * 60 * 1000);

return updated_at_ist
}


const adminRegister = async (req) => {
    try {
        const { username, password, name, employee_id } = req.body;
 
 
        if (!username || !password || !name || !employee_id) {
            throw new Error('All fields (username, password, name, employee_id) are required');
        }
 
 
        const existingUser = await userQueries.findUniqueUser(username);
 
        if (existingUser) {
            throw new Error('Username already exists');
        }
 
 
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
 
 
        const newUser = await genericQueries.create('User', {
            username: username,
            password: hashedPassword,
            name: name,
            employee_id: employee_id,
            status: "Active"
        });
 
        return {
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                username: newUser.username,
                name: newUser.name,
                employee_id: newUser.employee_id
            }
        };
 
    } catch (err) {
        throw err;
    }
};
 



const adminLogin = async (req) =>{

    try{


    const {username,password} = req.body;


    const user = await userQueries.findUniqueUser(username);

    if(!user) throw new Error("Invalid Username or Password");

    const isMatch = await bcrypt.compare(password, user.password.trim());

    console.log("USER",user.password);

    console.log("SENT",password)

    if(!isMatch) throw new Error("Invalid Username or Password");

    // bypass otp

    const otp = 123456;


    let encrypted_otp = encrypt(String(otp));


        const updateUser = await genericQueries.update('User',{
            where:{
                id:Number(user.id)
            },
            data:{
            otp:encrypted_otp,
        }
        })


        return {message:"Success"}

    }

    catch(err){

        throw err;
    }

};



const admin_login_otp_verify = async(req) =>{

    try{



    const {username,password,otp} = req.body;


    const User = await userQueries.findUniqueUser(username);

    if(!User) throw new Error("Invalid Username or Password");

    const isMatch = await bcrypt.compare(password, User.password);

    if(!isMatch) throw new Error("Invalid Username or Password");

    //admin role specify once finalised**

        let decrypted_otp = decrypt(User.otp);


    if(decrypted_otp !== otp) throw new Error("Invalid OTP");

    
    const new_token = issue_login_token(User.id,User.role,User.employee_id);

    console.log("NEW TOKEN",new_token)

    // find existing sessions

    const sessions = await userQueries.findSesssions(User.id);

    let resp = {token:new_token,
        user:User,active_sessions:false};

    if(sessions.length){
        resp.active_sessions = true;

        // update session info and logged in

        await userQueries.createSession({
            user_id:User.id,
            token:new_token,
            active:false,
            created_at:getIstTime(),
            updated_at:getIstTime(),
        });

    }

    else{

        // update session info and logged in

        await userQueries.createSession({
            user_id:User.id,
            token:new_token,
            logged_in_at:getIstTime(),
            active:true,
            created_at:getIstTime(),
            updated_at:getIstTime(),
        });
    }


    // clear otp once verified

    await userQueries.updateUser(User.id,{
        otp:null
    })

        // update the token in session 

        return resp;

    }

    catch(err){

        throw err;

    }
}


const admin_log_out = async(req) =>{

    try{

    const active_session = req.query.active_session


    const token = req?.headers?.['authorization']



    // decrypt the id and store it

    const user_id = req?.user?.id || 1;

    console.log("USER ID",token)



    if(active_session == "true"){


        const sessions = await userQueries.updateSessionsToken(user_id,token,{
            logged_out_at:getIstTime(),
            active:false,
            updated_at:getIstTime()
        },{
              active:true,
            updated_at:getIstTime(),
            logged_in_at:getIstTime()
        });


    }

    else{
          
        const sessions = await userQueries.updateSessions(user_id,{
            logged_out_at:getIstTime(),
            active:false,
            updated_at:getIstTime()
        });
    };

    return {message:"Success"};

    }

    catch(err){

        throw err;

    }
}


module.exports = {adminLogin,admin_login_otp_verify,admin_log_out,adminRegister}