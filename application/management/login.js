

const managementQueries = require('../../infrastructure/DB/managementQueries');

const genericQueries = require('../../infrastructure/DB/genericQueries');

const {issue_login_token } = require('../../infrastructure/JWT/services')
const bcrypt = require('bcrypt'); // or require('bcryptjs');

const {structure_login_data} = require('../../domain/user')


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
 



const login = async (req) =>{

    try{


    const {username,password} = req.body;


    const user = await managementQueries.findUniqueUser(username);

    if(!user) throw new Error("Invalid Username or Password");

    // const isMatch = await bcrypt.compare(password, user.password.trim());

    // console.log("USER",user.password);

    // console.log("SENT",password)

    // if(!isMatch) throw new Error("Invalid Username or Password");

    // bypass otp

    const otp = 123456;


        

        const updateUser = await genericQueries.update('User',
{
                id:Number(user.id)
            },    {
            otp:String(otp),
        })


        return {message:"Success"}

    }

    catch(err){

        throw err;
    }

};



const login_otp_verify = async(req) =>{

    try{

    const {username,otp} = req.body;


    const User = await managementQueries.findUniqueUser(username);

    console.log("UNIQUE User",User)

    if(!User) throw new Error("Invalid Username or Password");

    // const isMatch = await bcrypt.compare(password, User.password);

    // if(!isMatch) throw new Error("Invalid Username or Password");

    //admin role specify once finalised**

    // if(User.otp !== otp) throw new Error("Invalid OTP");

    
    const new_token = issue_login_token(User.id,User.role,User.employee_id);

    console.log("NEW TOKEN",new_token)

    // find existing sessions

    const sessions = await managementQueries.findSesssions(User.id);

    let resp = {token:new_token,
        user:User,active_sessions:false};

    if(sessions.length){
        resp.active_sessions = true;

        // update session info and logged in

        await managementQueries.createSession({
            user_id:User.id,
            token:new_token,
            active:false,
            created_at:getIstTime(),
            updated_at:getIstTime(),
        });

    }

    else{

        // update session info and logged in

        await managementQueries.createSession({
            user_id:User.id,
            token:new_token,
            logged_in_at:getIstTime(),
            active:true,
            created_at:getIstTime(),
            updated_at:getIstTime(),
        });
    }


    // clear otp once verified

    await managementQueries.updateUser(User.id,{
        otp:null
    })

        // update the token in session 


        console.log("USER DATA",resp.user)

        resp.user = structure_login_data(resp.user);


        // sanitize branches for only management login

        if(resp.user?.BranchMapping?.length){

            resp.user.branches = resp.user?.BranchMapping?.map((b)=>{
                let obj = {};

                obj.id = b?.BranchMaster?.id;

                obj.branch_name = b?.BranchMaster?.branch_name;

                obj.state_id = b?.BranchMaster?.AvailableStates?.id;

                obj.state_name = b?.BranchMaster?.AvailableStates?.state_name;

                return obj;

            });

            delete resp.user.BranchMapping;
        }

        return resp;

    }

    catch(err){

        throw err;

    }
}


const log_out = async(req) =>{

    try{

    const active_session = req.query.active_session


    const token = req?.headers?.['authorization']



    // decrypt the id and store it

    const user_id = req?.user?.id || 1;

    console.log("USER ID",token)



    if(active_session == "true"){


        const sessions = await managementQueries.updateSessionsToken(user_id,token,{
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
          
        const sessions = await managementQueries.updateSessions(user_id,{
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


module.exports = {login,login_otp_verify,log_out,adminRegister}