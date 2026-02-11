const express = require('express');

const router = express.Router();


const prisma = require('../../prisma/global')

const xlsx = require('xlsx');

const { DateTime } = require("luxon");


// helper

const getIstTime = () =>{
  const now = new Date();

// IST offset is +5:30 → 330 minutes
const IST_OFFSET_MINUTES = 330;

const updated_at_ist = new Date(now.getTime() + IST_OFFSET_MINUTES * 60 * 1000 - now.getTimezoneOffset() * 60 * 1000);

return updated_at_ist
}


// controllers

const uploadCaseData = async (req,res,next) =>{

    try{

    if (!req.file) throw new Error("No file uploaded");


        // add case for xlsx & csv based on ext
    let file_type = req.file.originalname.split(".").pop().toLowerCase()

    if(!file_type || !file_type?.length) throw new Error("No File Type Defined, Error Uploading File");
 

    file_type = ['xlsx','xls'].includes(file_type)?'xlsx':file_type;


    let sheet_data;

    switch(file_type){


        case('xlsx'):
        const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0]; // First sheet
    sheet_data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    break;


    case('csv'):
    const workbook_csv = xlsx.readFile(req.file.path, { type: "file", codepage: 65001 });
    const sheetName_csv = workbook_csv.SheetNames[0];
    sheet_data = xlsx.utils.sheet_to_json(workbook_csv.Sheets[sheetName_csv], { defval: "" });

    break;

    }


    if(!sheet_data) throw new Error("Error Reading File, Please Try Again");


    console.log("SHEET DATA HERE",sheet_data);


    const sanitizeData = (obj) =>{

      if(!obj) return {}

      for(const key in obj) {
        const new_key = key.trim().split(' ').join('_').toLocaleLowerCase();

        obj[new_key] = obj[key];

        delete obj[key]
      };

      console.log("OBJ",obj)

      return obj;
    }

    const final_set = sheet_data.map((data)=>sanitizeData(data));

    console.log("FINAL",sheet_data);

    let existing_data = [];

    let processed = [];


    // process batch request first ** allocationMaster

    const last = await prisma.allocation.findFirst({
  orderBy: { batch_id: 'desc' },
  select: { batch_id: true }
});

console.log("LAST ID ",last)


    const batch_creation = await prisma.allocationMaster.create({
      data:{
        type:'BRE',
        active:true,
        fileName:req?.file?.originalname,
        uploaded_by:req?.user?.employee_id || null,
        created_at:getIstTime(),
      }
    });

    // run query on db ** once schema confirmed to update

for (const row of final_set) {
  // Try to find existing row by loan_number

  try{
  const existing = await prisma.allocation.findFirst({
    where: { loan_number: row.loan_number,status:'in process' },
  });

  console.log("EXISTING",row);

  delete row.__empty

  if (!existing) {
    // Doesn't exist → create new

    let row_copy = {...row};

    row_copy.status = "in process";
    row_copy.batch_id = batch_creation.id;
    row_copy.master_id = batch_creation.id

    console.log("ROW COPY",row_copy)
    const inserted = await prisma.allocation.create({ data: row_copy });

    processed = [...processed,inserted];

  } 

  else{

    existing_data = [...existing_data,{loan_number:existing?.loan_number,message:"Loan Number has pending allocation request"}]
  }

}

catch(err){
      existing_data = [...existing_data,{loan_number:row?.loan_number,message:"Error Inserting data"}]

      console.log("ERROR",err)
}
  // else: exists and pending → do nothing
}

console.log("PROCESS",processed)

if(!processed?.length || processed?.length == 0) {


  await prisma.allocationMaster.update({
    where:{
      id:Number(batch_creation.id)
    },
    data:{
      active:false,
      total_cases:0,
      updated_at:getIstTime()
    }
  })


  throw new Error("Allocation Request Unsuccessful");
}


  await prisma.allocationMaster.update({
    where:{
      id:Number(batch_creation.id)
    },
    data:{
      total_cases:processed?.length,
      successful_allocation:processed?.length,
      status:"in process",
      failed_allocation:existing_data?.length
    }
  })

      res.json({
      message: "Excel processed",
      inserted: processed,
      failed:existing_data
    });

    }

    catch(err){

    console.error("Error Uploading XLSX Case File",err);

    next(err);

    }
}



const getAllocationList = async (req,res,next) =>{

  try{

    const {skip,take,from,to} = req.query;

    // providing all details as of now ** rules will be applied later

const allocation_data = await prisma.allocationMaster.findMany({
  skip: Number(skip) || 0,
  ...(take ? { take: Number(take) } : {})
});


    return res.json({
      message:"Success",
      allocation_list:allocation_data
    })
  }

  catch(err){

    console.log("Error Fetching Allocation Data",err);

    next(err);
  }
}

const get_allocated_data_by_id = async(req,res,next)=>{

  try{

    const{type,id} = req.params;

    if(!type || !id) throw new Error("Missing ID Type, unable to process");

    let id_type;

    switch(type){
      case('BRE'):
      id_type = "batch_id"

      break;

      case('Bulk'):
      id_type = "batch_id";
      break;

      case('Manual'):
      id_type = "master_id";
      break;
    }

    const case_data = await prisma.allocation.findMany({
      where:{
        [id_type]:Number(id)
      }
    })

    if(!case_data || !case_data?.length) throw new Error("No Data Found");

    return res.json(case_data)

  }

  catch(err){
    next(err)
  }
}

const manualAllocate = async(req,res,next) =>{

  try{

    const{data} = req.body;

    const allocateMaster = await prisma.allocationMaster.create({
      data:{...data,status:"in process"}
    })

    let body = {status:"in process",master_id:allocateMaster.id}

    const allocated = await prisma.allocation.create({
      data:body
    });

    return res.json({
      message:"Successfully Allocated Data",
      allocations:allocated
    })

  }

  catch(err){

    console.log("*** Error in manual Allocation ***",err)
next(err);
  }
}

const ho_zcm_approval = async(req,res,next) =>{

  try{

    const{type,id} =req.params;

    const{user_id,role} = req?.user || {};

    const{approved,remarks} = req.body || {};

    if(approved === false && !remarks?.length) throw new Error("Remarks is Mandatory For Rejection!")

     let query_type;

     let user = {};

     if(user_id){

      user = await prisma.user.findUnique({
        where:{
          id:Number(user_id)
        }
      })

     }
    switch(type){
      case('BRE'):
      query_type = 'updateMany'
      break;

      case('Bulk'):
      query_type = 'updateMany'
      break;

      case('Manual'):
      query_type = 'update'
      break;
    }

    let data = {};

    let master_data = {}

    if(approved === false) {
      data = {
        status:"Rejected",
         ho_code:(role && role == 'HO')?user_id:null,
        zcm_code:(role && role == 'ZCM')?user_id:null,
        updated_at:getIstTime(),
      }

      master_data = {
        status:"Rejected",
        rejected_by:user?.employee_id,
        updated_at:getIstTime(),
        remarks:remarks
      }
    }

    else{
      data = {
        status:"allocated",
        approved_by:user?.employee_id,
        ho_code:(role && role == 'HO')?user_id:null,
        zcm_code:(role && role == 'ZCM')?user_id:null,
        updated_at:getIstTime(),

      }

       master_data = {
        status:"allocated",
        approved_by:user?.employee_id_id,
        updated_at:getIstTime()
      }
    }

    const processed = await prisma.allocation[query_type]({
      where:{
        id:Number(id)
      },
      data:data
    });




    const master_update = await prisma.allocationMaster.update({
      where:{
        id:Number(id)
      },
      data:master_data
    });


    return res.json({
      message:"Successfully Approved",
      updated:master_update || {}
    })


  }

  catch(err){

    console.log("Error Approving Request",err);

    next(err);
  }
}


// const view_allocation_details = async(req,res,next) =>{

//   try{

//     const{id}
//   }

//   catch(err){

//   }
// }

const get_allocation_dashboard = async(req,res,next)=>{

  try{

    const{from,to} = req.query;
    

    if(!from || !to) throw new Error("No Filter Dates Present!");

   
const fromDate = DateTime.fromISO(from, { zone: "Asia/Kolkata" }).toJSDate();
const toDate = DateTime.fromISO(to, { zone: "Asia/Kolkata" })
  .endOf("day")
  .toJSDate();

    const allocation_data = await prisma.allocation.findMany({
      where:{
          created_at: {
          gte: fromDate,
          lte: toDate
        }
      },
      select:{
        id:true,
        status:true,
        loan_number:true,
        application_id:true,
        created_at:true,
        co_code:true
      }
    });

    if(allocation_data?.length == 0 || !allocation_data?.length){
      let customError = new Error();

      customError.message = "No Data Found!"
      customError.errorCode = 1;

      throw customError;
    }

    let filered_obj = {};

    for(const data of allocation_data){

      const key = data.status?.trim().replace(/\s+/g, "_");

      if(!key) continue;

      if(!filered_obj[key]){
        filered_obj[key] = [];
      }
      filtered_obj[key].push(data);
    }

    return res.json({
      message:"Success",
      case_data:filered_obj
    });

  }

  catch(err){

    console.log("Error fetching Dashboard Allocation Data",err);

    next(err)

  }
}

const get_allocation_history = async(req,res,next)=>{

  try{

    const{skip,take} = req.query;
    

const allocation_data = await prisma.allocationMaster.findMany({
  skip: Number(skip) || 0,
  ...(take ? { take: Number(take) } : {})
});

    return res.json({
      message:"Success",
      case_history:allocation_data
    });

  }

  catch(err){

    console.log("Error fetching Dashboard Allocation Data",err);

    next(err)

  }
}


module.exports = {uploadCaseData,getAllocationList,get_allocated_data_by_id,manualAllocate,ho_zcm_approval,get_allocation_dashboard,get_allocation_history}