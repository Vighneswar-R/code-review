
const userCases = require('../../../application/user')



// THIS CONTROLLER WILL HANDLE REQUESTS RELATED TO SOA BY THE USER (CO)

const main = {
        case_reassign:async(req,res,next)=>{
        try{

        const{id,loan_number} = req.body;

        const user = req.user;

        if(!id || !loan_number) throw new Error("Invalid Case Parameters!");

        const result = await userCases.case_reassign_request(id,loan_number,remarks,user.id,user.employee_id);

        return res.json({
            message:"Success",
            result:result
        })

        }

        catch(err){

            next(err);
        }
    },

    dashboard_cases:async(req,res,next)=>{

        try{

        const id = req.user?.id || 2;

        console.log("ID",id)

        if(!id) throw new Error("No User Found!");

        const {type,sub_type,skip,take,team,from,to,member_id} = req.query;

        if(!type) throw new Error("No Filters Found!");

        if(type == 'bucket' && (!sub_type || !sub_type?.length)) throw new Error("Sub Type is required for the query!");

        if(team == 'true' && member_id?.length) throw new Error("Invalid Request! Please specify the user details for data")

        const result = await userCases.get_dashboard_cases(id,type,sub_type,skip,take,from,to,team,member_id);

        return res.json(result);

        }

        catch(err){

            console.log(err)
            next(err)

        }
    },

    get_soa_case:async(req,res,next) =>{
        try{

        const loan = req.params.loan;

        if(!loan) throw new Error("Invalid Search!");


        const result = await userCases.get_case_data_by_id(loan);

        return res.json(result);

        }

        catch(err){

            console.log(err)
            next(err)

        }
    },


    get_nearby_loans:async(req,res,next)=>{
        try{

        const{lat,lon} = req.query;

        const user_id = req.user?.id || 2

        if(!lat || !lon) throw new Error("Missing Geo Location!");


        const result = await userCases.get_nearby_loans(lat,lon,user_id);

        return res.json(result)


        }

        catch(err){

            console.log(err);

            next(err)
        }
    },

    updateSoaApplicant:async(req,res,next) => {

        try{

            console.log("EXEC!")

        const{id} = req.params;

        const data = req.body;

        const model = 'SoaApplicantDetail'

        const result = await userCases.update_soa_applicant_details_by_id(id,model,data);


        return res.json(result)

        }

        catch(err){

            console.log(err)

            next(err);

        }
    },


    get_follow_up_data:async(req,res,next)=>{

        try{

          const{type,skip,take} = req.query;

          const{id} = req.user;
          
          if(!id || !type) throw new Error("No Query Type Defined!");

          const result = await userCases.get_follow_up_details(id,type,skip,take);

          return res.json(result);

        }

        catch(err){

            console.log(err);
            next(err);
        }
    },


    get_legal_case_list:async(req,res,next)=>{

        try {
            
          const {id} = req.user;
          
          const {from,to} = req.query;


          if(!id) throw new Error("Unauthorized access!");

          const result = await userCases.getExistingLegalCases(id,from,to);

          return res.json(result)
 
        }

        catch(err){
            console.log(err);

            next(err);
        }
    },

        get_legal_case_data:async(req,res,next)=>{

        try {
            
          const {id} = req.params;
          

          if(!id) throw new Error("Invalid Parameter");

          const result = await userCases.getLegalCaseData(id);

          return res.json(result)
 
        }

        catch(err){
            console.log(err);

            next(err);
        }
    },


        update_legal_case:async(req,res,next)=>{

        try {
            
          const {id} = req.params;
          

          if(!id) throw new Error("Invalid Parameter");

          const result = await userCases.updateLegalCaseData(id,req?.body,req?.files);

          return res.json(result)
 
        }

        catch(err){
            console.log(err);

            next(err);
        }
    },


    
        get_follow_up_history:async(req,res,next)=>{

        try {
            
          const {id} = req.user;
        
          const {from,to} = req.query;

          const {loan_number} = req.params;

          if(!id) throw new Error("Unauthorized User!");

          if(!loan_number) throw new Error("No Loan Details Found!");

          const result = await userCases.get_follow_up_history(id,loan_number,from,to);

          return res.json(result)
 
        }

        catch(err){
            console.log(err);

            next(err);
        }
    },

       
        get_transaction_history:async(req,res,next)=>{

        try {
            
          const {id} = req.user;
        
          const {from,to} = req.query;

          const {loan_number} = req.params;

          if(!id) throw new Error("Unauthorized User!");

          if(!loan_number) throw new Error("No Loan Details Found!");

          const result = await userCases.transaction_history_by_loan(id,loan_number,from,to);

          return res.json(result)
 
        }

        catch(err){
            console.log(err);

            next(err);
        }
    },

    get_team_member_list:async(req,res,next)=>{

        try{

         const id = req?.user?.id;
         
         if(!id) throw new Error("No User Data Found!");

         const result = await userCases.get_team_members(id);

         return res.json(result)
            
        }

        catch(err){

            console.log("Error in Fetching Member List",err);

            next(err);
        }
    },

    
    advance_search_loans:async(req,res,next)=>{

        try{

         const id = req?.user?.id;
         
         if(!id) throw new Error("No User Data Found!");

         const query = req.query || {};

         if(!Object.keys(query)?.length) throw new Error("No Search Filters Found!");

         const result = await userCases.advance_search(id,query);

         return res.json(result)
            
        }

        catch(err){

            console.log("Error Searching Loan",err);

            next(err);
        }
    },

    reassign_request:async(req,res,next) =>{

        try{

        const{id} = req.user;

         const {loan_number,new_employee_id} = req.body;

         if(!id || !loan_number || !new_employee_id) throw new Error("Invalid Parameters!");

         const result = await userCases.raise_reassign_request(id,req.body);

         return res.json(result);

        }

        catch(err){

            console.log("Error raising reassignment request",err);

            next(err);
        }
    },

    get_payments_done:async(req,res,next)=>{

        try{

            const {id} = req.user;

            const {date} = req.query;

            if(!id) throw new Error("Unauthorized");

            const result = await userCases.payments_done(id,date);

            return res.json(result);
        }

        catch(err){

            console.log("Error Fetching Payments Done",err);

            next(err);

        }
    },


    createScheduler:async(req,res,next)=>{

        try{

          const {id} = req.user;
          
          if(!id) throw new Error("Unauthorized User!");


          const {date,time,repeat_id,recipients,message_type_id,follow_up_id} = req.body;


          if(!date || ! time || ! repeat_id || !recipients?.length || !message_type_id) throw new Error("Missing Required Parameters!")

        const result = await userCases.schedule_message(id,date,time,repeat_id,recipients,message_type_id,follow_up_id);

        return res.json(result);

        }

        catch(err){

            console.log("Error Creating Schedule!",err);

            next(err);
        }
    },

     GetScheduleOptions:async(req,res,next)=>{

        try{

          const {id} = req.user;
          
          if(!id) throw new Error("Unauthorized User!");

          const result = await userCases.getSchedulerMaster();

          return res.json(result)

        }

        catch(err){

            console.log("Error Fetching Scheduler Options",err);

            next(err);
        }
    }
}

module.exports = main;