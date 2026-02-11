const userQueries = require('../../infrastructure/DB/userQueries');



const getExistingLegalCases = async(id,from,to) =>{

    try {

      let result = await userQueries.getLegalCases(id,from,to);


      if(result && result?.length){

        result = result.map((item)=>{
            let obj = {};


            obj.id = item?.id
            let applicant = item?.SoaCaseMapping?.SoaApplicantDetail?.[0] || [];

            let emi = item?.SoaCaseMapping?.SoaEmiMapping?.[0] || [];

            obj.loan_number = item?.SoaCaseMapping?.loan_number || null
            obj.name = applicant?.first_name || null
            obj.due_amount = emi?.due_for_month || null
            obj.collectable = emi?.total_dues_ftm || null
            obj.foreclosure = emi?.foreclosure_charges || null
            obj.legal_stage = item?.LegalMaster?.stage_name || null


            return obj;

        })
      }

      return {message:"Success",result:result }
    }


    catch(err){

        throw err;

    }
}


const getLegalCaseData = async(id) =>{

    try {

      let result = await userQueries.getLegalCase(id);


      if(result?.data){

            let obj = {};

            let applicant = result?.data?.SoaCaseMapping?.SoaApplicantDetail?.[0] || [];


            let emi = result?.data?.SoaCaseMapping?.SoaEmiMapping?.[0] || [];

            obj.loan_number = result?.data?.loan_number || null
            obj.name = applicant?.first_name || null
            obj.dpd = result?.data?.SoaCaseMapping?.bucket|| null
            obj.collectable = emi?.total_dues_ftm || null
            obj.foreclosure = emi?.foreclosure_charges || null
            obj.legal_stage = result?.data?.LegalMaster?.stage_name || null
            obj.remarks = result?.data?.remarks || null

            obj.contact = result?.data?.contact || null


            let stage = {};

            if(result?.stage){

                result = {data:obj,stage_list:result?.stage}

            }

            else{
                result = {data:obj}
            }

     }

      return {message:"Success",result:result }
    }


    catch(err){

        throw err;

    }
}


const updateLegalCaseData = async(id,body,files) =>{

    try {

      let result = await userQueries.updateLegalCase(id,body,files);


    //   if(result?.data){

    //         let obj = {};

    //         let applicant = result?.data?.SoaCaseMapping?.SoaApplicantDetail?.[0] || [];


    //         let emi = result?.data?.SoaCaseMapping?.SoaEmiMapping?.[0] || [];

    //         obj.loan_number = result?.data?.loan_number || null
    //         obj.name = applicant?.first_name || null
    //         obj.dpd = result?.data?.SoaCaseMapping?.bucket|| null
    //         obj.collectable = emi?.total_dues_ftm || null
    //         obj.foreclosure = emi?.foreclosure_charges || null
    //         obj.legal_stage = result?.data?.LegalMaster?.stage_name || null
    //         obj.remarks = result?.data?.remarks || null

    //         obj.contact = result?.data?.contact || null


    //         let stage = {};

    //         if(result?.stage){

    //             result = {data:obj,stage_list:result?.stage}

    //         }

    //         else{
    //             result = {data:obj}
    //         }

    //  }

      return {message:(result?.errors?.data_update && result?.errors?.evidence)?"Failed":"Success",result:result}
    }


    catch(err){

        throw err;

    }
}

module.exports = {getExistingLegalCases,getLegalCaseData,updateLegalCaseData}