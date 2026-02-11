// this module/file handles the legal use case related routes


const legalQueries = require('../../infrastructure/DB/legalQueries')

const create_legal_master = async(body) =>{

    try{

     const{legal_act,stage_name,sub_stages} = body;
     
     const result = await legalQueries.createMasterAndSubMaster({legal_act:legal_act,stage_name:stage_name},sub_stages);

     return result;

    }

    catch(err){

        throw err;
    }
}


const get_legal_cases = async(query) =>{

try{

    let result = await legalQueries.findLegalCaseList(query);

   
    result = result.map((item)=>{

        let soaCase = item?.SoaCaseMapping || {};
        
        if(item?.SoaCaseMapping) delete item?.SoaCaseMapping;

        item.borrower_name =  soaCase?.SoaApplicantDetail?.[0]?.first_name || "";
        
        item.outstanding = soaCase?.principal_outstanding || ""

        let sub_status = item?.LegalSubStageMaster?.name || "";

        delete item?.LegalSubStageMaster;

        item.sub_stage = sub_status;

        return item;
    })

    return {message:"Success",result:result}

}

catch(err){


    throw err;

}

}

 
const dashboard_data = async(from,to) =>{

    try{

        let case_data = await legalQueries.getDashBoardCount(from,to);


        let count_json = {total_cases:0};

        if(case_data && case_data?.length){

            for(const cases of case_data){
                count_json.total_cases +=1   // basic total update first **

                if(!cases?.LegalMaster) continue;

                if(!count_json[cases?.LegalMaster?.stage_name]) count_json[cases.LegalMaster.stage_name] = 0;


                count_json[cases.LegalMaster.stage_name] += 1
            }
        };

        return {message:"Success",dashboard_count:count_json}

    }

    catch(err){

        throw err;

    }
}


module.exports = {create_legal_master,get_legal_cases,dashboard_data}