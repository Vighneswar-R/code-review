const userQueries = require('../../infrastructure/DB/userQueries');
const { get } = require('../../interfaces/http_requests/Routes/managementRoutes');

const case_reassign_request = async(id,loan_number,remarks,user_id,employee_id)=>{

    try{

        const getLoanData = await userQueries.findFirst('SoaCaseMapping',{id:Number(id),loan_number:loan_number});

        if(!getLoanData) throw new Error("No Loan Data Found!");

        if(getLoanData.co_id !== co_id) throw new Error("Unauthorized for making the request!");

        // check if any pending allocation request is already there for the existing

if (
  existingData.length > 0 &&
  (existingData[0].id || existingData[0].allocation_details?.id)
) {
  throw new Error("Request Already Exists for Approval!");
}


        const result = await userQueries.createSingle('ReAssignment',{user_id:user_id,employee_id:employee_id,case_id:getLoanData.id,loan_number:loan_number,status:'pending'});

        return result;

    }


    catch(err){

        throw err;
    }
}

const getSchedulerMaster = async() =>{

  try{

  let result = await userQueries.findSchedulerOptions();

  let sanitized = {};


  if(result && result?.length){


    for(const item of result){

      if(!sanitized[item?.type]) sanitized[item.type] = [];

      console.log("SAN",item?.type)

      sanitized[item.type].push(item)
    }
  };

  result = sanitized;

  return {message:"Success",result:result}

}

catch(err){

  throw err;
}

}


module.exports = {case_reassign_request,getSchedulerMaster}