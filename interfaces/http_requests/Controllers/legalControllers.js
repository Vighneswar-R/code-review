const legalUseCases = require('../../../application/management')

const main = {


    add_master:async(req,res,next)=>{

        try{


     const{legal_act,stage_name,sub_stages} = req.body;

     if(!legal_act?.length || !stage_name?.length || !sub_stages) throw new Error("Missing Parameters!");


     const result = await legalUseCases.create_legal_master(req.body);

     return res.json({message:"Success",result:result})

        }

        catch(err){

        console.log(err);

        next(err);

        }
    },


    get_case_list:async(req,res,next)=>{

        try{

     const result = await legalUseCases.get_legal_cases(req.query);

     return res.json({message:"Success",result:result})

        }

        catch(err){

        console.log(err);

        next(err);

        }
    },


        get_dashboard_data:async(req,res,next)=>{

        try{

     const result = await legalUseCases.dashboard_data(req.query?.from, req.query?.to);

     return res.json({message:"Success",result:result})

        }

        catch(err){

        console.log(err);

        next(err);

        }
    }


}





module.exports = main;