

const allocationQueries = require('../../../infrastructure/DB/allocationQueries')

const allocationUseCases = require('../../../application/allocation/index')

// THIS CONTROLLER WILL HANDLE THE REQUESTS SPECIFICALLY FOR ALLOCATION FROM PANEL (MANAGERIAL LOGIN)

const main = {

    upload_case_data:async (req,res,next) =>{

    try{

    if (!req.file) throw new Error("No file uploaded");


        // add case for xlsx & csv based on ext
    let file_type = req.file.originalname.split(".").pop().toLowerCase()

    if(!file_type || !file_type?.length) throw new Error("No File Type Defined, Error Uploading File");
 

    file_type = ['xlsx','xls'].includes(file_type)?'xlsx':file_type;

    const rules = req.body?.rules;


    const{processed,existing_data,message,batch_id,details,error} = await allocationUseCases.uploadBulkCases(req,file_type,rules);


    console.log("PROCESSS",processed)
      return res.json({
      message:message ,
      inserted: processed,
      failed:existing_data,
      details:details,
      batch_id:batch_id,
      error_data:error
    })

    }

    catch(err){

    console.error("Error Uploading XLSX Case File",err);

    next(err);

    }
    },


upload_pending_allocation:async(req,res,next) =>{

  try{

    const{batch_id,data} = req.body;

    if(!batch_id || !data) throw new Error("Invalid Data! Cannot Process");

    const result = await allocationUseCases.allocate_pending_requests(req);

    return res.json({
      message:"Success",
      result:result
    })


  }

  catch(err){

console.log("ERROR For Pending Allocation",err)
    next(err);

  }
},

  get_allocation_list:async(req,res,next) =>{     // for view allocation
          try{

  const {skip,take,from,to} = req.query;

    // providing all details as of now ** rules will be applied later


 const allocation_data = await allocationUseCases.allocationList(skip,take,from,to,true,req.query);



    return res.json({
      message:"Success",
      allocation_list:allocation_data
    })
  }

  catch(err){

    console.log("Error Fetching Allocation Data",err);

    next(err);
  }
    },

    allocation_approval:async(req,res,next) =>{
          try{

    const{type,id} =req.params;

    const{user_id,role} = req?.user || {};

    const{approved,remarks} = req.body || {};

    if(approved === false && !remarks?.length) throw new Error("Remarks is Mandatory For Rejection!")

     let query_type;

     let user = {};

     const approved_data = await allocationUseCases.approveAllocation(type,role,user_id,id,approved,remarks);


    return res.json({
      message:approved==false?"Rejected":"Successfully Approved",
      updated:approved_data || {}
    })


  }

  catch(err){

    console.log("Error Approving Request",err);

    next(err);
  }
    },

//   get_allocation_list:async(req,res,next) =>{
//           try{

//     const{skip,take} = req.query;
    

// const allocation_data = await allocationQueries.findManyMaster(null,{
//   skip: Number(skip) || 0,
//   ...(take ? { take: Number(take) } : {})
// })

//     return res.json({
//       message:"Success",
//       case_history:allocation_data
//     });

//   }

//   catch(err){

//     console.log("Error fetching Dashboard Allocation Data",err);

//     next(err)

//   }
//     },

    add_rule:async(req,res,next)=>{

      try{
        const{body} = req;

        if(!body?.rule_info || !body?.conditions)  throw new Error("Invalid Rule Data!");

        const added_data = await allocationUseCases.addRule(body);

        return res.json({
          message:"Rule Added Successfully",
          rule:added_data
        })
      }

      catch(err){

        console.log("ERROR ADDING RULE",err)

        next(err);
      }
    },

    get_reassign_list:async(req,res,next) =>{

      try{

        const{from,to,skip,take} = req.query;

        // if(!from || !to) throw new Error("No Date Range Specified");


        const result = await allocationUseCases.getCaseAssignData(req.query);

        return res.json(result)
      }

      catch(err){

        next(err);

      }
    },


    get_soa_case_details:async(req,res,next) =>{

      try{

        const{id} = req.params;

        if(!id) throw new Error("Missing Parameters for SOA");

        const data = await allocationUseCases.getSoaDetails(req);

        return res.json({
          message:"Success",
          result:data
        })

      }

      catch(err){

        console.log("Error Fetching SOA data",err);

        next(err);
      }
    },



    get_allocation_history:async(req,res,next)=>{


      try{

        // const data = await allocationUseCases.allocationHistory(req?.query?.skip,req?.query?.take,req?.query?.from,req?.query?.to);

          const {skip,take,from,to} = req.query;

        const data = await allocationUseCases.allocationList(skip,take,from,to);

        return res.json({
          message:"Success",
          result:data
        })


      }

      catch(err){


        console.log("ERROR",err)


        next(err);


      }
    },


    get_mapped_co_list:async(req,res,next) =>{

      try{

        const data = await allocationUseCases.lo_mapped({id:req.user.id});

        return res.json({
          message:"Success",
          result:data
        })
      }

      catch(err){

        console.log("ERROR FINDING MAPPED LIST",err);

        next(err)
      }

    },


    get_soa_details:async(req,res,next) =>{

      try{

        const data = await allocationUseCases.getSoaDetails(req);

        return res.json({
          message:"Success",
          result:data
        })

      }

      catch(err){

        console.log("Error Fetching Soa Details",err);

        next(err);

      }
    },

     get_soa_case_details:async(req,res,next) =>{

      try{

        const data = await allocationUseCases.getSoaDetails(req);

        return res.json({
          message:"Success",
          result:data
        })

      }

      catch(err){

        console.log("Error Fetching Soa Details",err);

        next(err);

      }
    },


    add_manual_allocate:async(req,res,next)=>{

      try{

      const{loan_number,application_id,co_code,person_email,id} = req.body;

    if(!loan_number || !application_id || !co_code) throw new Error("Missing Parameters for Allocation!");

    const result = await allocationUseCases.manual_allocate({loan_number,application_id,co_code,person_email,id});

    return res.json({
      message:"Success",
      result:result
    })
        
      }

      catch(err){


        next(err)
      }

    },


  get_allocation_data: async(req,res,next) =>{


    try{

      const{id} = req.params;

      if(!id) throw new Error("Invalid Parameters!");
    
      const result = await allocationUseCases.allocation_data(id);

      return res.json({
        message:"Success",
        result:result
      })
    }

    catch(err){

      next(err);
    }
  },

   edit_rule:async(req,res,next) =>{

        try{

        const{id} = req.params;

        if(!id) throw new Error('No Id Found!');

        const value = req.body;

        if(!value) throw new Error('No Request Body Found!');


        const result = await allocationUseCases.edit_allocation_rule(id,value);

        return res.json(result)

        }

        catch(err){

          throw err;

        }
    },

    approve_reassign_request:async(req,res,next)=>{


      try{

        const{id,loan_number,status} = req.body;

        if(!id || !loan_number || !status) throw new Error("Missing Parameters!")

        const result = await allocationUseCases.approve_reassignment_request(id,loan_number,status);

        return res.json(result);

      }

      catch(err){

        console.log(err)

        next(err);


      }
    }
    


}


module.exports = main;