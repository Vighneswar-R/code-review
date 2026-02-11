
const allocationQueries = require('../../infrastructure/DB/allocationQueries');

const managementQueries = require('../../infrastructure/DB/managementQueries');

const genericQueries = require('../../infrastructure/DB/genericQueries')


const {calculatePaymentRecieved,calculateTotalDues} = require('../../domain/formulas')


const xlsx = require('xlsx');

const { DateTime } = require("luxon");




// helper

const getIstTime = () => {
  const now = new Date();

  // UTC timestamp
const utcTime = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
const istTime = new Date(utcTime + 5.5 * 60 * 60 * 1000);

return istTime
};


function getIstString() {
  const now = new Date();
  const offset = 5.5 * 60; // IST offset in minutes
  const ist = new Date(now.getTime() + (offset + now.getTimezoneOffset()) * 60000);

  const pad = (n) => n.toString().padStart(2, '0');
  const year = ist.getFullYear();
  const month = pad(ist.getMonth() + 1);
  const day = pad(ist.getDate());
  const hours = pad(ist.getHours());
  const minutes = pad(ist.getMinutes());
  const seconds = pad(ist.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}



const bulkCaseUpload = async (req,file_type,rules) =>{

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


    let failed = [];



    // process batch request first ** allocationMaster

//     const last = await prisma.allocation.findFirst({
//   orderBy: { batch_id: 'desc' },
//   select: { batch_id: true }
// });
  
    const last = await allocationQueries.findFirstOrder({ batch_id: 'desc' }, { batch_id: true })



    const batch_creation = await allocationQueries.createMaster({
        type:'BRE',
        active:true,
        fileName:req?.file?.originalname,
        uploaded_by:req?.user?.employee_id || null,
        created_at:getIstTime(),
        updated_at: getIstTime()
      })


    // check if rules existing

    const if_rules = rules?.length?true:false;


      // example structure expected - {bucket:[{name:"",type:"DPD",value:10,co_id:"xyz222"}],portfolio:[name:"",type:"pincode",value:'673005',co_id:"xyz2121"]}



    // run query on db ** once schema confirmed to update

for (const row of final_set) {
  // Try to find existing row by loan_number

  try{
//   const existing = await prisma.allocation.findFirst({
//     where: { loan_number: row.loan_number,status:'in process' },
//   });

const loan_number = row.loan_number || ""

const existing = await allocationQueries.findFirst({ loan_number: loan_number,status:'in process',active:true });

console.log("EXISRTING",row.loan_number);

console.log("ENTIRE",row)

  delete row.__empty

  if (!existing) {
    // Doesn't exist → create new]


let row_copy = { ...row };

// Build base query
let queries = {
  where: {
    loan_number: row?.loan_number,
  },
  include:{
    SoaApplicantDetail:{
      include:{
        SoaAddressDetail:true
      }
    },
    SoaEmiMapping:true,
    SoaPropertyDetail:true
  }
};

// Pull related SOA data if rules exist
if (if_rules) {


  const soaData = await managementQueries.soaFindSpecific(queries);

  if (!soaData) {

    console.log("SOA FOUND -2")

    failed.push(row);

    continue;


  }
  // get rule data and conditions

  const rules_info = await allocationQueries.findManyRules(JSON.parse(rules));


  if(!rules_info || !rules_info?.length){
    
    failed.push(row);

    continue;
  }

  let rule_type;

  let rule_count = 0;

  for(const rule of rules_info){

    if(rule_type && rule_type!= rule?.rule_type){
      rule_count++
      continue;
    }

    rule_type = rule?.rule_type;

    let condition = rule?.RuleConditions?.[0];  // assuming one conditions as discussed on 30-10 **

    let table = null;

    let key = null;

    let {type,operator,value} = condition;

     switch(rule_type){
      case('pincode'):

      table = 'soaPropertyDetail'

      key = 'property_pincode'

      break;
      
      case('Bucket'):

      if(type == 'DPD') key = 'bucket'

      if(type == 'loan_amount'){
        key = 'loan_principal_balance'
      }
      break;

      default:
        console.log("No Rule Type Found* Moving to Next Rule");

        continue;

    }


    const compare_values = (tableValue,args,operator) =>{

      if(!tableValue || !args || !operator) return false;

      let result;

      switch(operator){
      case('>'):

      result = tableValue > args?true:false

      break;

      case('<'):

      result = tableValue < args?true:false;

      break;

      case('='):

      result = args == tableValue?true:false

      break;

    
    }

    return result

    }


    if(!key){
      console.log("Invalid Query Skipping:")
      continue;
    }


let is_match;

    if(!table){

      is_match = compare_values(soaData[key],key=='bucket'?value?.split('-')?.length?value?.split('-')?.[0]:value:value,operator);

      console.log("MATCHING>>>",is_match)

    }

    else{

    is_match = compare_values(soaData[table][key],value,operator);
    }


    if(is_match){
      row_copy.co_code = rule?.assigned_to;
      break;
    }

  }

  if(rule_count == rules_info?.length){
    
    failed.push(row);

    continue;
  }

}


    // check for rule if provided

    console.log("CODE",row.co_code)

    row_copy.status = "in process";
    row_copy.batch_id = batch_creation.id;
    row_copy.master_id = batch_creation.id
    row_copy.active = true;
    row_copy.created_at = getIstTime();
    row_copy.updated_at = getIstTime();

    console.log("ROW COPY",row_copy)
    // const inserted = await prisma.allocation.create({ data: row_copy });

    const inserted = await allocationQueries.create(row_copy)

    processed = [...processed,inserted];

  } 

  else{


    existing_data = [...existing_data,existing]
  }

}  // 2 and pro - 1

catch(err){

    // existing_data = [...existing_data,existing]
      console.log("ERROR",err)
}
  // else: exists and pending → do nothing
}

console.log("PROCESS",processed)

if(!processed?.length || processed?.length == 0) {


  await allocationQueries.updateMaster({
        id:Number(batch_creation.id)
,
    data:{
      active:false,
      total_cases:0,
      status:"Failed",
      successful_allocation:0,
      updated_at:getIstTime()
    }
  })


  console.log("EXISTING DATA",existing_data)


console.log("FAILED",failed)
return {processed:processed,existing_data:existing_data,batch_id:batch_creation.id,message:"Failed",details:"Failed",error:failed}

}
  

  await allocationQueries.updateMaster({
    id:batch_creation.id,
    data:{
      total_cases:processed?.length,
      successful_allocation:processed?.length,
      status:"in process",
      failed_allocation:existing_data?.length
    }
  });

  console.log( "TESTING",{processed:processed,existing_data:existing_data})

  return {processed:processed,existing_data:existing_data,batch_id:batch_creation.id,message:"Success",error:failed}
}



const allocate_pending_requests = async(req) =>{   // if concent is given to add existing in process data to be updated in latest batch ** stage 2 bulk upload call


  try{

    const{batch_id,data} = req.body;

    if(!batch_id || !data) throw new Error("Invalid Parameters!");


    const existingMaster = await allocationQueries.findFirstMaster({
        id:Number(batch_id)
      });

    if(!existingMaster) throw new Error("No Stage 1 record found!");



    const final_count = (existingMaster.successful_allocation || 0) + data.length;

    const updateMaster = await allocationQueries.updateMaster({
   id:batch_id,data:{
        total_cases:final_count,
        successful_allocation:final_count,
        failed_allocation:0,
        status:"in process",
        updated_at:new Date()
      }
    });



 
const updateActive = await allocationQueries.updateManybyId({
    id: {
      in: data
        .filter((ele) => ele.id)       
        .map((ele) => ele.id),
    },
    status: "in process",
  }, {
    active: false,
  });

    console.log(updateActive,"POPPP")

const createAllocation = await allocationQueries.createMany(
  data.map((ele) => {
    const { id, ...rest } = ele; 

    return {
      ...rest,
      batch_id: batch_id,
      master_id: batch_id,
      created_at: new Date(),
      updated_at: new Date(),
    };
  })
);
    return createAllocation;

  }

  catch(err){

    throw err;
  }
}


const allocationList = async(skip,take,from,to,viewAllocation,query) =>{    // need work  

    try{

  // if(!from || !to) throw new Error("No Date Range Specified");

  let where = {};

  console.log("EXEC")


if (from && to) {
  where.created_at = {};
  if (from) where.created_at.gte = new Date(from);
  if (to) where.created_at.lte = new Date(to);

}


if(!viewAllocation)  {
  
  where.type = {in:['BRE','Bulk']}

}

else{

  const query_keys = Object.keys(query || {});

  console.log("KEY",query_keys)

  if(query_keys && query_keys?.length){
    
    for(const key of query_keys){

      if(['from','to'].includes(key)) continue;
      where[key] = parseInt(query[key]) == query[key]?Number(query[key]):query[key]    // exact casing required ** for filter search

      console.log("WHERE",where[key])
    }
  }
}

// manage the cases for stage 2 performed


console.log("WHERE DATA1",where)

    let data = await allocationQueries.findManyMaster(where,skip,take);

    if(data && data?.length){
    data = await allocationQueries.findAndUpdateBatchonNumbers(data.map((i)=>i?.id) || [],where)
    }

return data;
    }

    catch(err){

      console.log(err);

        throw new Error("*** Error Finding Allocation List ***")
    }
}

const allocationHistory = async(skip,take,from,to) =>{
      try{

  if(!from || !to) throw new Error("No Date Range Specified");

  const where = {};

if (from && to) {
  where.created_at = {};
  if (from) where.created_at.gte = new Date(from);
  if (to) where.created_at.lte = new Date(to);
}

    const data = await allocationQueries.findMany(where,skip,take)

return data;
    }

    catch(err){

        throw err;
    }
}


// const approveAllocation = async(type,role,user_id,id,approved,remarks) =>{    // need transaction **

//     try{

//     let query_type;   
//      let user = {};

//     //  if(user_id){

//     //   user = await prisma.user.findUnique({
//     //     where:{
//     //       id:Number(user_id)
//     //     }
//     //   })

//     //  }

//     let whereClause = {};
//     switch(type){
//       case('BRE'):
//       whereClause.type = 'batch_id'
//       whereClause.value = Number(id)
//       query_type = 'updateMany'
//       break;

//       case('Bulk'):
//       whereClause.type = 'batch_id'
//       whereClause.value = Number(id)      
//       query_type = 'updateMany'
//       break;

//       case('reassignment'):
      
//       const reassignment = await allocationQueries.findFirst({batch_id:Number(id)});
// ;
//       if(!reassignment) throw new Error("Error Fetching the Manual Case!");

//       whereClause.type = 'id'
//       whereClause.value = Number(reassignment.id)      
//       query_type = 'update'
//       break;

//       case('manual'):

//       // get the particular case id **

//       const manualData = await allocationQueries.findFirst({batch_id:Number(id)});
// ;
//       if(!manualData) throw new Error("Error Fetching the Manual Case!");

//       whereClause.type = 'id'
//       whereClause.value = Number(manualData.id)      
//       query_type = 'update'
//       break;
//     }

//     let data = {};

//     let master_data = {};

//     if(approved === false) {

//       data = {
//         status:"Rejected",
//          ho_code:(role && role == 'HO')?user_id:null,
//         zcm_code:(role && role == 'ZCM')?user_id:null,
//         updated_at:getIstTime(),
//       }

//       master_data = {
//         status:"Rejected",
//         rejected_by:user?.employee_id,
//         updated_at:getIstTime(),
//         remarks:remarks
//       }
//     }

//     else{
//       data = {
//         status:"allocated",
//         approved_by:user?.employee_id,
//         ho_code:(role && role == 'HO')?user_id:null,
//         zcm_code:(role && role == 'ZCM')?user_id:null,
//         updated_at:getIstTime(),

//       }

//        master_data = {
//         status:"allocated",
//         approved_by:user?.employee_id_id,
//         updated_at:getIstTime()
//       }


//       const batch = await allocationQueries.findManyWithUser(id);

//       console.log("BATCH",batch)

//       let promises = [];


//       if(batch && batch?.length){
      
//         for(const item of batch){
//           if(!item?.loan_number) continue;

//           if(!item?.User.id) continue;

//           promises.push(allocationQueries.mapCoToCase(item?.loan_number,{co_id:item?.User?.id,udpated_at:new Date()}))

//         }
//       };


//       if(promises?.length){

//         console.log("YES ONGOING")

//         await Promise.allSettled(promises);
//       }
//       else{

//         throw new Error("Error Approving Case!",err)
//       }

//     }


//     console.log("QUERY",query_type);


//     const processed = await allocationQueries[query_type]([whereClause.type],whereClause.value,
//       data)


//       // // find if case exist in DB

//       // const case_data = await allocationQueries.findCaseByLoan()
//       // case_data = {
//       //   updated_at:new Date(),
//       //   co_id:
//       // }

//     const master_update = await allocationQueries.updateMaster({
//       id:Number(id),
//       data:master_data
//     });

//     return master_update;

//     }

//     catch(err){

//         console.log("Error in approval",err);

//         throw new Error(err)

//     }
// }


const approveAllocation = async(type,role,user_id,id,approved,remarks) =>{

    try{


    console.log("APPROVE",approved)

    let query_type;   
     let user = {};

    let whereClause = {};
    switch(type){
      case('BRE'):
      whereClause.type = 'batch_id'
      whereClause.value = Number(id)
      query_type = 'updateMany'
      break;

      case('Bulk'):
      whereClause.type = 'batch_id'
      whereClause.value = Number(id)      
      query_type = 'updateMany'
      break;

      case('Reassignment'):
      
      const reassignment = await allocationQueries.findFirst({batch_id:Number(id)});
;
      if(!reassignment) throw new Error("Error Fetching the Manual Case!");

      whereClause.type = 'id'
      whereClause.value = Number(reassignment.id)      
      query_type = 'update'
      break;

      case('manual'):

      // get the particular case id **

      const manualData = await allocationQueries.findFirst({batch_id:Number(id)});
;
      if(!manualData) throw new Error("Error Fetching the Manual Case!");

      whereClause.type = 'id'
      whereClause.value = Number(manualData.id)      
      query_type = 'update'
      break;
    }

    let data = {};

    let master_data = {};

    let batch;

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


      batch = await allocationQueries.findManyWithUser(id);

      console.log("BATCH",batch)

    }


    const approve_query = await allocationQueries.approveAndMapAllocationQuery(batch,query_type,whereClause.type,whereClause.value,data,id,master_data,approved)


    return approve_query;

    }

    catch(err){

        console.log("Error in approval",err);

        throw new Error(err)

    }
}

const addAllocationRule = async(body)=>{

  try{

    const{rule_info} = body;


    let conditions = structuredClone(body.conditions);

    return await allocationQueries.addRuleAndConditions(rule_info,conditions);
 
  }

  catch(err){

    throw err;
  }
}


const getCaseReassignData = async(query) =>{

  try{

// const data = await genericQueries.findMany('ReAssignment',where,skip,take)

const data = await allocationQueries.findReassignedList(query);



return data;

  }

  catch(err){

    console.log(err)

    throw err;
  }

}


const getSoaDetails = async(req) =>{

  try{

    const {type,from,to,skip,take} = req.query;
    const{id} = req.params;

    let data;

    let {loan_number,customer_name,mobile_number,application_id,co_emp_id} = req.query;

    let filtered = (loan_number || customer_name || mobile_number || application_id || co_emp_id)?true:false;

    

    if(type && type == 'unassigned-cases') {

      data = allocationQueries.getSoaDetailCases({from,to,skip,take})


    }

      else if(type && type == 'assigned-cases') {

         if(filtered){

        data = allocationQueries.getFilteredCases(req.query)

      }

      else{

        let count = req.query?.count;

      data = allocationQueries.getSoaDetailCasesAssigned({from,to,skip,take,count})

      }

    }

    else {

      if(!id) throw new Error("Invalid Parameters For SOA");
     data = await allocationQueries.getSoaDetails(id);

    }


    return data;
  }

  catch(err){

    throw err;

  }


  
}



// const get_lo_list_for_assign = async(user) =>{       // use case * - Manual allocation get lo list to find and allocate

//     try{

// // acm,rcm logged in - fetch mapped lo's under them to allocate **


// // bypassing with static id **


// // call user to find the user data of logged in person **

// const userData = await genericQueries.findById('User',user?.id);


// const mapped_co = await genericQueries.findCoMapped(userData.employee_id,true);


// let sanitized = mapped_co;



// if(sanitized && sanitized?.length){


//   sanitized = sanitized.map((count)=>{
//     let count_json = {assigned_cases:0,efficiency_rate:0};

//     count_json.assigned_cases = count?.SoaCaseMapping?.length || 0;

//     count.branch_name = count?.BranchMaster?.branch_name;

    
//     // efficiency calculator;

//     const caseData = count?.SoaCaseMapping;

//     let efficiency = 0;  // initial declaration;
//     let recieved = 0;

//     let total_emi = 0;

//     if(caseData?.length){

//       for(const data of caseData){  // iteration on assigned cases;

//       const emi = data?.SoaEmiMapping?.[0];

//       if(!emi) continue;

//       const calculatedEmi = calculateTotalDues(emi);

//       total_emi += calculatedEmi;

//       const payments = data?.PaymentCollect;

//       if(!payments?.length) continue;

//      const totalPay = payments.reduce((acc, obj) => acc + Number(obj.amount), 0);

//     recieved+= totalPay;

//       }
//     }

//     efficiency = (recieved/total_emi) * 100;

//     count_json.efficiency_rate = `${efficiency?.toFixed(0)}%`

    
//     let newObj = {};

//     newObj.data = count;

//     newObj.count = count_json;

//     newObj?.data?.SoaCaseMapping?delete newObj.data.SoaCaseMapping:null

//     newObj?.data?.BranchMaster?delete newObj.data.BranchMaster:null


//     return newObj;
//   })
// }


// return sanitized;


//     }

//     catch(err){

//       throw err;
//     }
// };


const get_lo_list_for_assign = async (user) => {
  try {
    const userData = await genericQueries.findById("User", user?.id);

    const mapped_co = await genericQueries.findCoMapped(userData.employee_id, true);

    if (!mapped_co?.length) return [];

    const sanitized = mapped_co.map((co) => {
      const assignedCases = co?.SoaCaseMapping?.length || 0;

      let totalEmi = 0;
      let totalReceived = 0;

      co?.SoaCaseMapping?.forEach((caseData) => {
        const emi = caseData?.SoaEmiMapping?.[0];
        if (!emi) return;

        totalEmi += calculateTotalDues(emi);

        const payments = caseData?.PaymentCollect || [];
        const receivedAmount = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
        totalReceived += receivedAmount;
      });

      const efficiencyRate = totalEmi ? `${((totalReceived / totalEmi) * 100).toFixed(0)}%` : "0%";

      const countJson = {
        assigned_cases: assignedCases,
        efficiency_rate: efficiencyRate,
      };

      const { SoaCaseMapping, BranchMaster, ...restData } = co; // destructure to remove unwanted keys
      const newObj = {
        data: { ...restData, Branch_Details: BranchMaster },
        count: countJson,
      };

      return newObj;
    });

    return sanitized;
  } catch (err) {
    throw err;
  }
};


const manual_allocate = async({loan_number,application_id,co_code,person_email,id}) =>{  // need transaction ** 

  try{


    if(!loan_number || !application_id || !co_code) throw new Error("Missing Parameters for Allocation!");


      // check if already in process for allocation ** run transaction

    const result = await allocationQueries.manualAllocateQueryMerge({
        loan_number:loan_number,
        status:"in process"
      },
      
      {
        active:true,
        type:"manual",
        status:"in process",
        total_cases:1,
        created_at:new Date(),
        updated_at:new Date(),
      },

{
      loan_number:loan_number,
      application_id:application_id,
      person_email:person_email || "",
      co_code:co_code,
      status:"in process",
      created_at:new Date(),
      updated_at:new Date(),
      active:true,
      case_id:id || null
    }
    )

    // const findAllocationHistory = await allocationQueries.findFirst({
    //     loan_number:loan_number,
    //     status:"in process"
    //   });

    // if(findAllocationHistory?.status == 'in process'){

    //   throw new Error("Request Already Pending!");
    // }

    // const addMaster = await allocationQueries.createMaster({
    //     active:true,
    //     type:"manual",
    //     status:"in process",
    //     total_cases:1,
    //     created_at:new Date(),
    //     updated_at:new Date(),
    //   });

    // const master_id = addMaster.id;



    // const addAllocation = await allocationQueries.create({
    //   loan_number:loan_number,
    //   application_id:application_id,
    //   person_email:person_email || "",
    //   co_code:co_code,
    //   status:"in process",
    //   created_at:new Date(),
    //   updated_at:new Date(),
    //   batch_id:master_id,
    //   master_id:master_id,
    //   case_id:id || null
    // });

    return result;
  }

  catch(err){

    console.log("ERR",err)

    throw err;

  }

}



const allocation_data = async(id) =>{
  
  try{

    const result = await allocationQueries.findMany({
        master_id:Number(id)
      });

    return result;
  }

  catch(err){

    throw err;
  }

}



const edit_allocation_rule = async(id,value)=>{


  try{

    const conditions = value.conditions || null;

    console.log(conditions)

    const rule_info = value?.["rule_info"] || null


    const result = await allocationQueries.updateRulesAndConditions(rule_info,conditions,id);

    return result;

  }

  catch(err){

    console.log(err)

    throw err;
  }
}


 // need transaction ** 
const approve_reassignment_request = async(id,loan_number,status) =>{

  try{

    const findData = await allocationQueries.findTable('ReAssignment',{id:Number(id),status:"pending"});

    if(!findData) throw new Error("Invalid Data Approval Request!");

    let approve_body = {};



    
      approve_body = {status:status}
    


    let promises = [];


    const promiseFunction = (table,method,where,data,master) =>{

      return {
        table:table,
        method:method,
        where:where,
        data:data,
        master:master
      }

    }


    promises.push(promiseFunction('ReAssignment','update',{id:Number(id),status:'pending'},approve_body))




    if(['approved','Approved'].includes(status)){
     
      promises.push(promiseFunction('allocation','create',{},{
      loan_number:loan_number,person_email:findData?.person_email,active:true,co_code:findData?.new_employee_id,status:'in process',created_at:getIstTime(),updated_at:getIstTime()
    },true))
    }


    
    await allocationQueries.updateReassignmentAndAllocation(promises,{active:true,status:'in process',type:"Reassignment",total_cases:1,successful_allocation:1,failed_allocation:0,uploaded_by:null,created_at:getIstTime(),updated_at:getIstTime()});
   



    return {"Message":"Success",status:status}
    
  }

  catch(err){

    throw err
  }

}




module.exports = {bulkCaseUpload,allocationList,approveAllocation,addAllocationRule,getCaseReassignData,getSoaDetails,allocationHistory,get_lo_list_for_assign,allocate_pending_requests,manual_allocate,allocation_data,edit_allocation_rule,approve_reassignment_request}