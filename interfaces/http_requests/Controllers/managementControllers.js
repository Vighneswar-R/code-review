const managementCases = require('../../../application/management/index')


//THIS CONTROLLER WILL HANDLE ALL REQUESTS COMING FROM PANEL (MANAGERIAL LOGIN)

const main = {

    log_in:async(req,res,next)=>{

        try{

    const {username,password} = req.body;

    if(!username || !password) throw new Error("Missing Credentials");

    const result = await managementCases.login(req);

    return res.json(result)

    }

        catch(err){

            console.log("ERR",err)
            next(err);
        }

    },


    otp_verify:async(req,res,next) =>{

        try{
    
            const{username,password,otp} = req.body;

            if(!username || !otp) throw new Error("Missing Credentials");

            const result = await managementCases.login_otp_verify(req);

            return res.json({
                message:"Successfully Authenticated",
                result:result
            })

        }

        catch(err){

            console.log("Error Verifying SMS",err)

            next(err);

        }
    },

    log_out:async(req,res,next) =>{

        try{

            const result = await managementCases.log_out(req);

            return res.json({
                message:"Successfully Logged out!",
                result:result
            })

        }

        catch(err){

            console.log("Error in Log Out!",err)
            next(err)

        }
    },

    
    getReports:async(req,res,next)=>{

        try{

        const {type,skip,take,from,to,sub_type} = req.query;

        const id = req?.user?.id || 2;

        if(!id) throw new Error("Unauthorized Access");
        
        if(!type) throw new Error("Please Specify Report Type");

        const result = await managementCases.get_reports(id,type,skip,take,from,to,sub_type || "normal",req.body);

        return res.json(result);

        }

        catch(err){

            console.log(err)
             next(err);

        }
    },


        dashboard_data:async(req,res,next)=>{

        try{

        const id = req?.user?.id

        if(!id) throw new Error("Unauthorized Access");
        
        const result = await managementCases.get_dashboard_main();
        return res.json(result);

        }

        catch(err){

            console.log(err)
            throw err;

        }
    },


        branchReport:async(req,res,next)=>{

        try{

        const user_id = req?.user?.id

        if(!user_id) throw new Error("Unauthorized Access");


        const state_report = req.query.state_report;


        const {id} = req.params;

        if(!id) throw new Error("Unauthorized Access");

        
        const result = await managementCases.get_branch_report(id,state_report);

        return res.json(result);

        }

        catch(err){

            console.log(err)
            next(err);

        }
    },


    
        stateReport:async(req,res,next)=>{

        try{

        const user_id = req?.user?.id

        if(!user_id) throw new Error("Unauthorized Access");


        const {id} = req.params;

        if(!id) throw new Error("Unauthorized Access");

        
        const result = await managementCases.get_reports(id,type,skip,take,from,to,sub_type || "normal",req.body);

        return res.json(result);

        }

        catch(err){

            console.log(err)
            next(err);

        }
    },

}






module.exports = main;