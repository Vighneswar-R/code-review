const userQueries = require('../../infrastructure/DB/userQueries');

const structureRules = require('../../domain/index')

const queryGeneral = require('../../infrastructure/DB/genericQueries');



const sanitize_result = (data, type) => {

    console.log("TYPE H",type)
  switch (type) {
    case "bureau": {
      const keys = new Set([
        "bureau_balances_current",
        "bureau_balances_overdue",
        "bureau_accounts_total",
        "bureau_accounts_overdue",
        "bureau_accounts_zero_balance",
        "bureau_date_opened_recent",
        "bureau_date_opened_oldest",
        "bureau_active_acc",
        "bureau_new_delinquent_acc",
        "bureau_account_status",
        "bureau_name",
        "bureau_mobile",
        "bureau_address"
      ]);

      const bureauData = {};
      const otherData = {};


      for (const key in data) {
        if (keys.has(key)) {
          bureauData[key] = data[key];
        } else {
          otherData[key] = data[key];
        }
      }

            console.log("B DATA",bureauData)


      return {
        ...otherData,
        bureau_data: bureauData,
      };
    }

    default:
      return data;
  }
};


const get_dashboard_cases = async(id,type,sub_type,skip,take,from,to,team,member_id) =>{


    try{

        const selected_bcp = await userQueries.findExistingBCP("data");

        console.log("BCP",selected_bcp)

        if(selected_bcp.type_id == null || selected_bcp.type_id == undefined) throw new Error("No Plan Selected!");

        let result;

        let count;

        let collections;

        let type_count;

        let inner = {};

        let mapped = [];

        let total_cash = 0;

        if(team == "true"){

            const userData = await queryGeneral.findById('User',id);

            if(!userData?.id) throw new Error("Invalid Manager Code!")


            mapped = await queryGeneral.findCoMapped(userData?.employee_id);

            console.log("MAPPED DATA",mapped)

        }

        switch(selected_bcp.type_id){

            case(0):

            result = await userQueries.findCaseList(id,type,sub_type,skip,take,from,to,team,mapped,member_id); // id represents the CO id


            count = await userQueries.findCaseNumbers(id,from,to,team,mapped,member_id);

            collections = await userQueries.getCollectionData(id,from,to,team,mapped,member_id);


            if(result && result?.length){


               for (const item of result) {
  if (!item?.PaymentCollect?.length) continue;

  const total = item.PaymentCollect.reduce((sum, a) => {
    const amount = Number(a?.amount);

    if (Number.isNaN(amount)) return sum;

    return sum + amount;
  }, 0);

  total_cash += total;
}

            };



            switch(type){
                case('incentive'):
                
                  inner = {Low:0,Medium:0,High:0};

                let json = {0:"Low",1:"Medium",2:"High"};

                for(const item of result){

                    if(item["incentive"] || item["incentive"] == 0){
                        inner[json[item["incentive"]]] = inner[json[item["incentive"]]] + 1;
                    }
                }

            
            type_count = inner;

            break;

            case('follow_up'):

            inner = {completed:0,pending:0};

            for(const item of result){

                inner[item["status"]] = inner[item["status"]] + 1;
            }

            type_count = inner;

            break;

            case('bucket'):


            // filter based on sub type **

            inner = {
                "Charges Dues":0,"Current":0,"31-60":0,"61-90":0,"NPA":0,"91-120":0
            }

            if(!inner[sub_type] && !inner[sub_type] == 0) throw new Error("Invalid Sub Type!");

            let newResult = [];

            for(const item of result){


                console.log("SUB",sub_type)

                if(item?.bucket == sub_type) newResult.push(item);

                if(item["bucket"]){

                    inner[item["bucket"]] = inner[item["bucket"]] + 1;
                }
            };

            type_count = inner;

            result = newResult;

            console.log("RES",result)

            break;

            }


            result = {data:result,count:count,collection:collections,chart_count:type_count,total_cash:total_cash}


            break;

            case(1):

            result = await userQueries.getOldSoaCaseData(loan);
            

            break;


        }

        if(!result) throw new Error("No Case List Found");

        return {message:"Success",result:result}

    }

    catch(err){

        throw err;

    }
}


const get_case_data_by_id = async(loan) =>{


    try{

       const selected_bcp = await userQueries.findExistingBCP("data");


        if(selected_bcp.type_id == null || selected_bcp.type_id == undefined) throw new Error("No Plan Selected!");

        let result;

        switch(selected_bcp.type_id){

            case(0):

            result = await userQueries.getCaseData(loan); // id represents the CO id

            console.log("RESULT",result)

            // sanitize result for reference and property

            result.SoaReferenceDetail?.length? result.SoaReferenceDetail = result.SoaReferenceDetail[0]:result.SoaReferenceDetail = {}

            
            result.SoaPropertyDetail?.length? result.SoaPropertyDetail = result.SoaPropertyDetail[0]:result.SoaPropertyDetail = {}

            // sanitize bureau fields as well ** 27-11

            result = sanitize_result(result,"bureau");

            break;

            case(1):

            result = await userQueries.getOldSoaCaseData(loan);

            let newResult = await userQueries.getCaseData(loan);

            // verify domain rule structure before sending the data
            

            if(!result){
                throw new Error("No Data Found!");

                break;
            }

            result = structureRules.sending_structure({soaMapping:result,newMapping:newResult});

            break;


        }

        if(!result) throw new Error("No Case Data Found!");

        return {message:"Success",result:result}
    }

    catch(err){

        throw err;

    }
}



const get_nearby_loans = async(lat,lon,user_id)=>{ 

    try{

       const nearby_data = await userQueries.nearbyCases(user_id,lat,lon);

       return {
        message:"Success",
        result:nearby_data
       }

    }

    catch(err){

        throw err;

    }
}


const update_soa_applicant_details_by_id = async(id,model,data) =>{

    try{

        console.log("EXEC")

        const existing_data = await userQueries.getSoaApplicant(id);

        if(!existing_data) throw new Error("No Existing Data to Update!");

        const loan = existing_data.loan_number;

        const old_table_data = await userQueries.getOldSoaCaseData(loan);

        const mobile_number = existing_data.mobile_number;

        if(!mobile_number) throw new Error("No Record Found!");


          let seq_num = existing_data.sequence_number;

          if(!seq_num){     // in case of missing referfnce sequence number it will check for matching mobile number as its unique**
        const key_arr = ['COAPP1_MOBILE','COAPP2_MOBILE','COAPP3_MOBILE','COAPP4_MOBILE','COAPP5_MOBILE'];
          for(const key of key_arr){


            if(old_table_data[key] == mobile_number) {

                const first = key.split('_')?.[0];

                seq_num = first[first.length-1];
            }
          }
        }

          // applicant gets updated with mobile or email address

          const data_copy = {};

          if(data.mobile_number) data_copy[`COAPP${seq_num}_MOBILE`] = data.mobile_number;

          if(data.email) data_copy[`COAPP${seq_num}_EMAIL_ID`] = data.email;

          if(data.address) data_copy[`COAPP${seq_num}_ADDRESS`] = data.address;


          let address_err = false;


               let batch = [userQueries.updateTable('SoaApplicantDetail',id,data),userQueries.updateTable('SoaMappingOld',old_table_data.id,data_copy)]

          //additionally check if address need to be updated **

          if(data.address){

            const copy2 = {...data};

            delete copy2.address;



            let address_row = await userQueries.findAddressForApplicant(id);

            if(!address_row) {

                batch.push(userQueries.createSingle('soaAddressDetail',{
                    applicant_id:Number(id),
                    address_line_1:data.address,
                    is_active:true
                })
                )

    }

}
          await Promise.allSettled(batch)

        // update old table for BCP as well

        return {message:"Successfully Updated"}

    }


    catch(err){

        console.log("Error Updating Applicant SOA",err)

        throw err;

    }


}


const get_follow_up_details = async(id,type,skip,take)=>{

    try{

    let result = await userQueries.getFollowUpDetails(id,type,skip,take);


    console.log("RESULT",result)

    if(result && result?.length){


        result = result.map((item)=>{

            const mapping = item?.SoaCaseMapping;

            const emi = item?.SoaCaseMapping?.SoaEmiMapping?.[0]

            const applicant = item?.SoaCaseMapping?.SoaApplicantDetail?.[0]
         let obj = {
            loan_number:mapping?.loan_number,name:applicant?.first_name,mobile_number:applicant?.mobile_number,due_amount:emi?.due_for_month,total_collectable:emi?.total_dues_ftm
        }

        return obj;

        })

    }

    return {message:"Success",result:result}
    
    }

    catch(err){

        throw err;

    }
}


const get_follow_up_history = async(id,loan_number,from,to)=>{

  try {

  let result = await userQueries.getFollowUpHistory(id,loan_number,from,to);


  if(result && result?.length){

    result = result.map((item)=>{

        let obj = structuredClone(item);

        let case_mapping = obj?.SoaCaseMapping;

        let images = obj?.DocumentStorage;

        if(images?.length){

            obj.documents = images;

            delete obj.DocumentStorage;
        }

        else{
            obj.documents = [];
        }

        delete obj.SoaCaseMapping;

        obj.name = case_mapping?.SoaApplicantDetail?.[0]?.first_anme;

        obj.mobile_number = case_mapping?.SoaApplicantDetail?.[0]?.mobile_number;

        return obj;


    })
  }

  return {message:"Success",result:result}

  }

  catch(err){

    throw err;
    
  }
}


const transaction_history_by_loan = async(id,loan_number,from,to)=>{

  try {

  let result = await userQueries.findTransactionHistory(id,loan_number,from,to);

  console.log("RESULT",result)

  if(result && result?.length){

    result = result.map((item)=>{

        let obj = structuredClone(item);

        obj = {...obj,disposition:
           [{type:"Best",  date_time:"",status:""},{type:"Latest", date_time:"",
                status:""}] 
        };

        return obj;


    })
  }

  return {message:"Success",result:result}

  }

  catch(err){

    throw err;
    
  }
}


const get_team_members = async(id)=>{


    try{

    const userData = await queryGeneral.findById('User',id);

    if(!userData?.id) throw new Error("Invalid Manager Code!");

    let mapped = await queryGeneral.findCoMapped(userData?.employee_id);

    if(mapped && mapped?.length){

        mapped = mapped.map((user)=>user?.employee_id);
    }

    return {message:"Success",result:mapped}

    }

    catch(err){

        throw err;

    }
}


const advance_search = async(id,query) =>{

    try{


        const result = await userQueries.findCaseUsingFilters(id,query);


        return {message:"Success",result:result}
    

    }

    catch(err){


        throw err;


    }
}


const raise_reassign_request = async(id,body) =>{

    try{

        const result = await userQueries.addReassignment(id,body);

        return {message:"Success",result:result}
    }

    catch(err){

        throw err;

    }

}


const payments_done = async(id,date) =>{

    try{

    let result = await userQueries.findCompletedPayments(id,date);


    if(result && result?.length){

        result = result.map((r)=>{

            let employee_id = r?.SoaCaseMapping?.User?.employee_id || "";

            let applicant_name = r?.SoaCaseMapping?.SoaApplicantDetail?.[0]?.first_name || "";

            if(r?.SoaCaseMapping) delete r.SoaCaseMapping;

            r.employee_id = employee_id;
            r.applicant_name = applicant_name;

            return r

        })
    }

    return {message:"Success",result:result};


    }

    catch(err){

        throw err;

    }

}


const schedule_message = async(id,date,time,repeat_id,recipients,message_type_id,follow_up_id) =>{

    try{

    // sanitize requests for multiple applicants
    let request_body = recipients.map((r)=>{

        let obj = {loan_number:r?.loan_number,
            user_id:Number(id),
            repeat_master_id:Number(repeat_id),
            message_type_id:Number(message_type_id),
            follow_up_id:follow_up_id,
            date:date,
            time:time,
            PTP:r?.PTP || "",
            is_active:true}

   
            if(follow_up_id) obj.follow_up_id = follow_up_id;

            return obj;
    });

    const result = await userQueries.createSchedule(request_body,recipients);

    return {message:"Success",result:result}


    }

    catch(err){

       throw err; 


    }
}


const get_search_options = async(id) =>{


    try{

      const result = await userQueries.getSearch(id);

      return {message:"Success",result:result}

    }

    catch(err){


        console.log("Error fetching search options!!",err);

        throw err;

    }

}


const filter_based_search = async(body) =>{


    try{


        const result = await userQueries.searchByFilters(body);

        console.log("RES",result)

        return {message:"Success",result:result};


    }

    catch(err){

        console.log("Error Fetching Data on Filters",err);

        throw err;

    }
}



// .......................advanced filter ...................
const get_all_search_options = async() =>{
    try{
        const result = await userQueries.getAllSearchMaster();
        return {message:"Success",result:result}
    }
    catch(err){
        console.log("Error Fetching All Search Master",err);
        throw err;
    }
}
const create_search_options = async( data) =>{
 
 
    try{
 
      const result = await userQueries.createSearchMaster(data);
 
      return {message:"Success",result:result}
 
    }
 
    catch(err){
 
 
        console.log("Error fetching search options!!",err);
 
        throw err;
 
    }
 
}
const update_search_options = async(id,data) =>{
    try{
       
      const result = await userQueries.updateSearchMaster(id,data);
        return {message:"Success",result:result}
    }
    catch(err){
        console.log("Error updating search options!!",err);
        throw err;
    }
}
const delete_search_options = async(id) =>{
    try{
       
      const result = await userQueries.deleteSearchMaster(id);
        return {message:"Success",result:result}
    }
    catch(err){
        console.log("Error updating search options!!",err);
        throw err;
    }
}

const add_follow_up = async(req)=>{

 require('dotenv').config();

const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

const { v4: uuidv4 } = require('uuid');


try{

//  const {Readable} = require("stream");

    const s3Client = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
    }
});

const { Upload } = require( "@aws-sdk/lib-storage");


const fs = require('fs')


let files = req.files;

console.log("REQ",req.files);


let doc_body = [];

if(files?.length){    // only execute if file is there otherwise normal data create **

    for(const file of files){
  
        try{
        

const uniqueFilename = `${uuidv4()}`;

const path = require('path');

const ext = path.extname(file.originalname) 
  || `.${file.mimetype.split("/")[1]}`;

const upload = new Upload({
  client: s3Client,
  params: {
    Bucket: process.env.S3_BUCKET,
    Key: `${process.env.S3_FOLDER}/${uniqueFilename}${ext}`,
    Body: file.buffer,
    ContentType:file.mimetype
  }
});

await upload.done();


const s3_url = `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${process.env.S3_FOLDER}/${uniqueFilename}${ext}`


const fetch_url = `${process.env.PRODUCTION_URL}api-collect/user/get-doc/${process.env.S3_FOLDER}/${uniqueFilename}${ext}`;

// if successful update it to the body

doc_body.push({
    loan_number:req.body.loan_number,
    s3_url:s3_url,
    fetch_url:fetch_url,
    is_active:true,
    created_at:new Date(),
    updated_at:new Date()
})

        }

        catch(err){
            console.warn(`Error Uploding Doc to S3 - ${file.originalname}`,err);
        }
    }


}



let body_modified = {...req.body,follow_up_date_time:new Date(),co_id:Number(req.user.id)}

const result = await userQueries.addFollowUpWithImage(body_modified,doc_body);

return result;

 
}


              catch(err){

                console.log("Error in uploading to s3",err);

                throw err;
              }

}
 



module.exports = {get_dashboard_cases,get_case_data_by_id,get_nearby_loans,update_soa_applicant_details_by_id,get_follow_up_details,get_follow_up_history,transaction_history_by_loan,get_team_members,advance_search,raise_reassign_request,payments_done,schedule_message,get_search_options,filter_based_search, create_search_options, update_search_options,get_all_search_options, delete_search_options,add_follow_up}
