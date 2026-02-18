const adminmaster = require('../../infrastructure/DB/masterQueries')



const get_zone_master = async (req) => {
    try {

        const data = await adminmaster.findManyZone({})
        return data;
        
    } catch (error) {

        throw error;
        
    }
}

const get_version_master = async (req) => {
    try {

        const data = await adminmaster.findManyVersionMaster({})
        return data;
        
    } catch (error) {

        throw error;
        
    }
}

// get_followup_type_master

const get_followup_type_master = async (req) => {
    try {

        const data = await adminmaster.findManyFollowup({})
        return data;
        
    } catch (error) {

        throw error;
        
    }
}


const get_region_master = async (req) => {
    try {

        const data = await adminmaster.findManyRegion({})
        return data;
        
    } catch (error) {

        throw error;
        
    }
}


const add_followup_type_master = async(req) => {
    try {
        const {
            follow_up_name, 
            display_value, 
            follow_up_type, 
            generic_key, 
            is_remark_required,
            is_image_required, 
            is_next_followup_required
        } = req.body;

        if (!follow_up_name || !follow_up_type || !Array.isArray(follow_up_type) || follow_up_type.length === 0) {
            throw new Error("Follow up name and at least one follow up type are required");
        }

        const existingData = await adminmaster.FollowUpMasterfindFirst({
            where: {
                follow_up_name: follow_up_name
            }
        });

        if (existingData) {
            throw new Error("Follow Up Name Already Exists");
        }

        const results = await adminmaster.createFollowUPMaster({
            follow_up_name: follow_up_name,
            display_value: display_value, 
           follow_up_type: follow_up_type[0],
            generic_key: generic_key,
            is_remark_required: is_remark_required[0], 
            is_image_required: is_image_required[0],
            is_next_followup_required: is_next_followup_required[0] 
        });

        return results; 

    } catch (error) {
        throw error;
    }
}


const addbranchmaster = async (req) => {

    try {

        const {branch_name,branch_code, recipt_prefix, branch_value, branch_display_value, zone_id, branch_phone_1,branch_phone_2 ,region_id,branch_address_1,branch_address_2,branch_emp_id,branch_lat,branch_ion,dept_bank_account_id,bank_account_id} = req.body;


        const exisitingbranchdata = await adminmaster.findFirstMaster({
            where : {
                branch_code : branch_code
            }
        })

        if(exisitingbranchdata){
            throw new Error("Branch Code Already Exists");
        }


        const zone = await adminmaster.findfirstZone({

            where : {
                zone_name : zone_id

            }
          
        })


        if(!zone){
            throw new Error("Zone Not Found");
        }


        const region = await adminmaster.findFirstRegion({
            where : {
                REGION_NAME :region_id
            }
        })

        if(!region){
            throw new Error("Region Not Found");
        }


        const results = await adminmaster.createBranchMaster({
            branch_name:branch_name,
            branch_code:branch_code,
            recipt_prefix:recipt_prefix,
            branch_value:branch_value,
            branch_display_value:branch_display_value,
            zone_id:zone.id,
            branch_phone_1:branch_phone_1,
            branch_phone_2:branch_phone_2,
            region_id:region.id,
            branch_address_1 :branch_address_1,
            branch_address_2 : branch_address_2,
            branch_emp_id:branch_emp_id,
            branch_lat:branch_lat,
            branch_ion:branch_ion,
            dept_bank_account_id:dept_bank_account_id,
            bank_account_id:bank_account_id,
            created_at : new Date()     
            
        })

        return results;

        
    } catch (error) {

        throw error;
        
    }

}


const updatebranchmaster = async (req) =>{

    try {
         const {id} = req.params;
    const {branch_name, branch_code, recipt_prefix, branch_value, branch_display_value, zone_id, branch_phone_1,branch_phone_2 ,region_id,branch_address_1,branch_address_2,branch_emp_id,branch_lat,branch_ion,dept_bank_account_id,bank_account_id } = req.body;
  

    const updatedata = {
        branch_name,
        branch_code,
        recipt_prefix,
        branch_value,
        branch_display_value,
        zone_id,
        branch_phone_1,
        branch_phone_2,
        region_id,
        branch_address_1,
        branch_address_2,
        branch_emp_id,
        branch_lat,
        branch_ion,
        dept_bank_account_id,
        bank_account_id
    }


   Object.keys(updatedata).forEach(key => {
            if (updatedata[key] === undefined) {
                delete updatedata[key];
            }
        });


          const updatedBranch = await adminmaster.updateBranchMaster(id, updatedata);


    return updatedBranch
        
    } catch (error) {
        throw(error)
    }

}



const add_version_master = async(req) =>{

    try {
        const { application ,platform, current_version_update, updated_app_url } = req.body;
        const exisitingdata = await adminmaster.VersionMasterfindFirst({
            where : {
                application : application,
                platform : platform
            }
        })
        if(exisitingdata){
            throw new Error("Version Already Exists");
        }
        const results = await adminmaster.createVersionMaster({
            application : application,
            platform : platform,
            current_version_update : current_version_update,
            updated_app_url : updated_app_url
        })
        return results; 

        
    } catch (error) {
        
        throw error;
    }

}

const update_version_master= async (req)=>{
    try {
        const {id} = req.params;
           const { application ,platform, current_version_update, updated_app_url } = req.body;

        const updatedata = {
        application,
        platform,
        current_version_update,
        updated_app_url,
    }


   Object.keys(updatedata).forEach(key => {
            if (updatedata[key] === undefined) {
                delete updatedata[key];
            }
        });


          const updatedBranch = await adminmaster.updateVersionMaster(id, updatedata);


    return updatedBranch
        
    } catch (error) {
        throw(error)
    }
}

const add_bank_master= async(req) =>{
    try {
        const { bank_name, bank_id, display_name} = req.body;
        const exisitingdata = await adminmaster.BankMasterfindFirst({
            where : {
                bank_name : bank_name
            }
        })
        if(exisitingdata){
            throw new Error("Bank Already Exists");

        }
        const results = await adminmaster.createBankMaster({
            bank_name:bank_name,
            bank_id:bank_id,
            display_name:display_name
        })
        return results;

        
    } catch (error) {
        throw error;
        
    }
}


const update_bank_master= async (req)=>{
    try {
        const {id} = req.params;
         const { bank_name, bank_id, display_name} = req.body;

        const updatedata = {
       bank_name, bank_id, display_name
    }


   Object.keys(updatedata).forEach(key => {
            if (updatedata[key] === undefined) {
                delete updatedata[key];
            }
        });


          const updatedBranch = await adminmaster.updateBankMaster(id, updatedata);


    return updatedBranch
        
    } catch (error) {
        throw(error)
    }
}


const get_branch_master = async (req) =>{
    try {
        const data = await adminmaster.findManyBranchMaster({})
        return data;
        
    } catch (error) {
        throw error;
    }


}


const get_bank_master = async (req) =>{
    try {
        const data = await adminmaster.findManyBankMaster({})
        return data;
        
    } catch (error) {
        throw error;
    }


}

const get_bank_branch_master = async (req) =>{
    try {
        const data = await adminmaster.findManyBankBranchMaster({})
        
        return data;
        
    } catch (error) {
        throw error;
    }


}

const add_bank_branch_master = async(req)=>{
    try {

        const {BANK_ID, BANK_BRANCH_NAME, DISPLAY_VALUE, BRANCH_MICR_CODE,BRANCH_IFCS_CODE,ADDRESS_1,ADDRESS_2,ADDRESS_3, REGION_ID,BRANCH_PINCODE} = req.body;

       const existingbankbranch = await adminmaster.BankBranchfindFirst({
        where : {
            BANK_BRANCH_NAME : BANK_BRANCH_NAME
        }
       })

       if(existingbankbranch){
        throw new Error("Bank Branch Already Exists");
       }

       const bank = await adminmaster.BankMasterfindFirst({
        where  : {
            bank_name : BANK_ID
        }
       })

       if(!bank){
        throw new Error("Bank Not Found");
       }

       const region = await adminmaster.findFirstRegion({
        where : {
            REGION_NAME : REGION_ID
        }
       })

       const results = await adminmaster.createBankBranchMaster({
        BANK_ID : bank.id,
        BANK_BRANCH_NAME : BANK_BRANCH_NAME,
         DISPLAY_VALUE : DISPLAY_VALUE,
        BRANCH_MICR_CODE : BRANCH_MICR_CODE,
        BRANCH_IFCS_CODE : BRANCH_IFCS_CODE,
        ADDRESS_1 : ADDRESS_1,
        ADDRESS_2 : ADDRESS_2,
        ADDRESS_3 : ADDRESS_3,
         REGION_ID : region.id,
        BRANCH_PINCODE : BRANCH_PINCODE,
        created_at : new Date(),
       })

         return results;

        
    } catch (error) {

        throw error;
        
    }
}

const add_permission_master = async(req)=>{
    try {
        const { names, type } = req.body;

        let failed = [];

                // validate name matches parent (type in JSON);

        const json_ref = require('../../domain/permissions.json');

        if(!json_ref[type]) throw new Error("Invalid Category!");

        let req_batch = [];

        for(const name of names){
         const existingpermission = await adminmaster.PermissionMasterfindFirst({
            where : {
                name : name,
                status:true
            }
        })
        if(existingpermission){

            failed.push(name)
            console.warn("Permission Already Exists");
            continue;
        };

        // validate name is attached to correct type format **

        if(!json_ref?.[type]?.[name]){
            failed.push(name);
            continue;
        };

        
        req_batch.push(adminmaster.createPermissionMaster({
            type:type,
            name:name,
            status:true
        }));

        }


        let results;

        if(req_batch?.length){

            results = await Promise.all(req_batch);

        }

        else{

            return {message:"Failed",failed:failed,inserted:0}
        }
       

        return {message:"Success",failed:failed,inserted:results?.length} 
    } catch (error) {
        throw error;
    }
}

const get_permission_master = async (req) =>{
    try {
        const data = await adminmaster.findManyPermissionMaster({})
        return data;

    } catch (error) {
        throw error;
    }

}

const update_permission_master= async (req)=>{
    try {
        const {id} = req.params;
         const { name, type } = req.body;
        const updatedata = {
         name, type
    }
    Object.keys(updatedata).forEach(key => {
            if (updatedata[key] === undefined) {
                delete updatedata[key];
            }

        });
          const updatedPermission = await adminmaster.updatePermissionMaster(id, updatedata);
    return updatedPermission
        
    } catch (error) {
        throw(error)
    }
}
                
const get_create_master_requisites = async(type) =>{

    try{


        let model;

        switch(type){

            case('role'):
            model = 'roleMaster'

            break;

            case('department'):

            model = 'departmentMaster';

            break;

            default:
            throw new Error("No Query!")
        }


        if(!model) throw new Error("No Model Found!")

        const result = await adminmaster.findMany(model);

        return {message:"Success",result:result}
    }

    catch(err){

        throw err;
    }
}

const get_roles_and_users_permissions = async (req, res) => {
    try {
       
        const rolesWithPermissions = await adminmaster.findRolesWithPermissions({});

      
        const usersWithPermissions = await adminmaster.findUsersWithPermissions({});

        //  roles data
        const formattedRoles = rolesWithPermissions.map(role => ({
            id: role.id,
            name: role.name,
            type: 'role',
            permissions: role.PermissionMapping
                .filter(mapping => mapping.PermissionMaster)
                .map(mapping => ({
                    id: mapping.PermissionMaster.id,
                    name: mapping.PermissionMaster.name,
                    type: mapping.PermissionMaster.type,
                    status: mapping.PermissionMaster.status
                }))
        }));

        //  users data
        const formattedUsers = usersWithPermissions.map(user => ({
            id: user.id,
            name: user.name,
            type: 'user',
            permissions: user.PermissionMapping
                .filter(mapping => mapping.PermissionMaster) 
                .map(mapping => ({
                    id: mapping.PermissionMaster.id,
                    name: mapping.PermissionMaster.name,
                    type: mapping.PermissionMaster.type,
                    status: mapping.PermissionMaster.status
                }))
        }));

           const response = {
            success: true,
            data: {
                roles: formattedRoles,
                users: formattedUsers
            }
        };

                return response;


    } catch (error) {
        next(error);
    }
};

const create_department = async(req) => {
    try {
        const { department_name} = req.body;
        const existingdepartment = await adminmaster.DepartmentMasterfindFirst({
            where : {
                department_name : department_name
            }
        })
        if(existingdepartment){
            throw new Error("Department Already Exists");
        }
        const results = await adminmaster.createDepartmentMaster({
            department_name : department_name,
           
            status : true
        })
        return results; 
    }   
    catch (error) {
        throw error;
    }
}


const get_department = async (req) =>{
    try {
        const data = await adminmaster.findManyDepartmentMaster({})
        return data;
    } catch (error) {
        throw error;
    }
}


const update_bank_branch_master= async (req)=>{
    try {
        const {id} = req.params;
         const {BANK_ID, BANK_BRANCH_NAME, DISPLAY_VALUE, BRANCH_MICR_CODE,BRANCH_IFCS_CODE,ADDRESS_1,ADDRESS_2,ADDRESS_3, REGION_ID,BRANCH_PINCODE} = req.body;
         
   
       const bank = await adminmaster.BankMasterfindFirst({
        where  : {
            bank_name : BANK_ID
        }
       })

       if(!bank){
        throw new Error("Bank Not Found");
       }

        const region = await adminmaster.findFirstRegion({
        where : {
            REGION_NAME : REGION_ID
        }
       })
       if(!region){ 
        throw new Error("Region Not Found");
         }

        const updatedata = {
            BANK_ID : bank.id, 
            BANK_BRANCH_NAME, DISPLAY_VALUE, BRANCH_MICR_CODE,BRANCH_IFCS_CODE,ADDRESS_1,ADDRESS_2,ADDRESS_3, 
            REGION_ID : region.id,
            BRANCH_PINCODE
    }
    Object.keys(updatedata).forEach(key => {
            if (updatedata[key] === undefined) {
                delete updatedata[key];
            }
        });
          const updatedPermission = await adminmaster.updateBankBranchMaster(id, updatedata);
    return updatedPermission
    } catch (error) {
        throw(error)
    }
}


const update_followup_type_master= async (req)=>{
    try {
        const {id} = req.params;
            const {
            follow_up_name, 
            display_value, 
            follow_up_type,
            generic_key,
            is_remark_required,
            is_image_required, 
            is_next_followup_required
        } = req.body;
        const updatedata = {
        follow_up_name,
        display_value,
        follow_up_type : follow_up_type[0],
        generic_key,
        is_remark_required : is_remark_required[0],
        is_image_required : is_image_required[0],
        is_next_followup_required : is_next_followup_required[0]
    }
    Object.keys(updatedata).forEach(key => {
            if (updatedata[key] === undefined) {
                delete updatedata[key];
            }
        });
            const updatedBranch = await adminmaster.updateFollowupMaster(id, updatedata);
    return updatedBranch
        
    } catch (error) {
        throw(error)
    }
}



const add_exotel_master = async(req) => {
    try {
        const { excotelcalledid} = req.body;
        const existingexotel = await adminmaster.ExotelMasterfindFirst({
            where : {
                excotelcalledid : excotelcalledid
            }
        })
        if(existingexotel){
            throw new Error("Exotel Already Exists");
        }
        const results = await adminmaster.createExotelMaster({
            excotelcalledid : excotelcalledid
            
        })
        return results; 
    }
    catch (error) {
        throw error;
    }
}
const get_exotel_master = async (req) =>{
    try {
        const data = await adminmaster.findManyExotelMaster({})
        return data;

    }
    catch (error) {
        throw error;
    }
}

const update_exotel_master= async (req)=>{
    try {   
        const {id} = req.params;
            const { excotelcalledid} = req.body;
        const updatedata = {
        excotelcalledid
    }
    Object.keys(updatedata).forEach(key => {
            if (updatedata[key] === undefined) {
                delete updatedata[key];
            }
        });
            const updatedExotel = await adminmaster.updateExotelMaster(id, updatedata);
    return updatedExotel    
    }
    catch (error) {
        throw(error)
    }
}


const add_case_type_master = async(req) => {
    try {
        const { case_type_name, display_name, startdate, enddate} = req.body;
        const parsedStart = startdate ? new Date(startdate) : undefined;
const parsedEnd = enddate ? new Date(enddate) : undefined;
if (parsedStart && isNaN(parsedStart.getTime())) {
  throw new Error('Invalid startdate; expected YYYY-MM-DD or ISO datetime');
}
if (parsedEnd && isNaN(parsedEnd.getTime())) {
  throw new Error('Invalid enddate; expected YYYY-MM-DD or ISO datetime');
}
        const existingcasetype = await adminmaster.CaseTypeMasterfindFirst({
            where : {
                case_type_name : case_type_name
            }
        })


        if(existingcasetype){
            throw new Error("Case Type Already Exists");
        }
        const results = await adminmaster.createCaseTypeMaster({
            case_type_name : case_type_name,
            display_name : display_name,
            startdate : parsedStart,
            enddate : parsedEnd
        })
        return results; 
    }
    catch (error) {
        throw error;
    }
}

const get_case_type_master = async (req) =>{
    try {
        const data = await adminmaster.findManyCaseTypeMaster({})
        return data;        
    }
    catch (error) {
        throw error;
    }
}


const update_case_type_master= async (req)=>{
    try {   
        const {id} = req.params;
            const { case_type_name, display_name, startdate, enddate} = req.body; 

               

        const updatedata = {
        case_type_name,
        display_name,
    
       
    }
    Object.keys(updatedata).forEach(key => {
            if (updatedata[key] === undefined) {
                delete updatedata[key];
            }
        });
            const updatedCaseType = await adminmaster.updateCaseTypeMaster(id, updatedata);
    return updatedCaseType    
    }
    catch (error) {
        throw(error)
    }
}



const create_role = async(name,permissions)=>{

    try{

    const result = await adminmaster.createRoleMasterAndMap(name,permissions);


    return {message:"Success",result:result}

    }

    catch(err){

        throw err;
    }
}  // need transaction ** 

const getAvailablePermissions = async()=>{

    try{
        
       const dummy = require('../../domain/permissions.json');
       
       const existing_permissions = await adminmaster.findManyPermissionMaster();

       let modified_result = structuredClone(dummy);

       if(existing_permissions?.length){

        for(const item of existing_permissions){

            const type = item?.type?.split(' ').join('_').toLocaleLowerCase()

            const name = item?.name?.split(' ').join('_').toLowerCase();

            if(!dummy?.[type]) continue;
            
            if(dummy?.[type] && dummy?.[type]?.[name]) delete modified_result[type][name];
        }

       };

       console.log("MODIFIED",modified_result)
       const result = Object.keys(modified_result).map((item)=>{

        const inner_values = Object.keys(modified_result?.[item]).map((inner)=>{
            return {name:inner}
        });

        return {type:item,values:inner_values}
       })

       return {message:"Success",result:result}
    }

    catch(err){

        throw err;

    }
}


const edit_role = async(id,body) =>{

    try{

    const available_data = await adminmaster.findRoleById(id);

    if(!available_data?.role?.id) throw new Error("Invalid Role!");

    let normal_edit = [];

    let resultObj = {
        message:"Success",
        edited:{
        }
    }

    if(body?.name) normal_edit.push(adminmaster.editTableById(id,'RoleMaster',{name:body.name}));

    if(body?.add_permissions){

        //sample : - [10,20]

        //first find if the permission was previously mapped or not if yes check active and make it true otherwise map new

    const added = await adminmaster.checkAndMapPermissions(id,body?.add_permissions);

    if(added?.code && added?.code == 200) resultObj.edited.add_permissions = 'Success'

    }

    if(body?.remove_permissions){

        const removed = await adminmaster.findAndRemovePermissions(id,body?.remove_permissions);
        (removed?.code && removed?.code == 200)? resultObj.edited.remove_permissions = 'Success':resultObj.edited.remove_permissions = 'Failed'

    }

    return resultObj;
    

    }

    catch(err){

        throw err;

    }

}   // need transaction ** 


const get_generic_key = async (req)=>{
     try {
        const data = await adminmaster.findManyGenericKey({})
        return data;        
    }
    catch (error) {
        throw error;
    }
}


//.................................................        Bulk Branch Mapping Upload Route ................................................
const branchMappingUpload = async (req) => {
  const fs = require("fs");
  const xlsx = require("xlsx");
 
  try {
    if (!req.file) {
      throw new Error("No file uploaded");
    }
 
    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const ext = originalName.split(".").pop().toLowerCase();
 
    if (!["xlsx", "xls", "csv"].includes(ext)) {
      throw new Error(
        "Invalid file type. Only .xlsx, .xls, and .csv are supported.",
      );
    }
 
    let sheetData = [];
 
    if (ext === "csv") {
      const workbook = xlsx.readFile(filePath, { codepage: 65001 });
      const sheetName = workbook.SheetNames[0];
      sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
        defval: "",
      });
    } else {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
        defval: "",
      });
    }
 
    if (!sheetData || sheetData.length === 0) {
      throw new Error("File is empty or contains no data rows");
    }
 
    const firstRow = sheetData[0];
    const headers = Object.keys(firstRow).map((h) => h.trim().toLowerCase());
    const originalHeaders = Object.keys(firstRow); // Keep original column names
 
    const empCodeKeys = [
      "employeecode",
      "employee_code",
      "empcode",
      "emp_code",
      "employee id",
      "employee_id",
      "empid",
      "emp_id",
      "code",
    ];
 
    const branchKeys = [
      "branchname",
      "branch_name",
      "branch",
      "branchcode",
      "branch_code",
      "branch id",
      "branch_id",
    ];
 
    let employeeCodeCol = null;
    let branchNameCol = null;
 
    for (const key of empCodeKeys) {
      const foundIndex = headers.findIndex((h) => h.includes(key));
      if (foundIndex !== -1) {
        employeeCodeCol = originalHeaders[foundIndex]; // Get the original column name
        break;
      }
    }
 
    for (const key of branchKeys) {
      const foundIndex = headers.findIndex((h) => h.includes(key));
      if (foundIndex !== -1) {
        branchNameCol = originalHeaders[foundIndex]; // Get the original column name
        break;
      }
    }
 
    if (!employeeCodeCol || !branchNameCol) {
      throw new Error(
        `Required columns not found.\n` +
          `Expected something like: employeeCode / empCode / employee_code\n` +
          `and branchName / branch / branch_name\n` +
          `Found headers: ${headers.join(", ")}`,
      );
    }
 
    const mappingArray = [];
    const skippedRows = [];
 
    sheetData.forEach((row, index) => {
      const employeeCode = (row[employeeCodeCol] || "").toString().trim();
      const branchName = (row[branchNameCol] || "").toString().trim();
 
      if (!employeeCode || !branchName) {
        skippedRows.push(index + 2); // +2 because Excel row 1 = header, row 2 = first data
        return;
      }
 
      mappingArray.push({
        employeeCode,
        branchName,
      });
    });
 
    if (mappingArray.length === 0) {
      throw new Error("No valid rows found after validation");
    }
 
   
    const syncResult = await adminmaster.bulkBranchMappingUpload(mappingArray);
 
   
 
    // Clean up file
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting uploaded file:", err);
    });
 
    return {
      success: true,
      message: "Branch mapping file processed successfully",
      file: originalName,
      file_type: ext,
      total_rows_in_file: sheetData.length,
      valid_records: mappingArray.length,
      skipped_rows: skippedRows.length > 0 ? skippedRows : undefined,
      sync_result: syncResult,
    };
  } catch (error) {
    if (req.file?.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file on failure:", err);
      });
    }
 
    console.error("Branch mapping upload error:", error);
 
    throw new Error(error.message || "Failed to process branch mapping file");
  }
};


module.exports = {
    addbranchmaster, 
    get_branch_master,
    get_zone_master,
    get_region_master,
    get_branch_master, 
    add_version_master, 
    get_version_master, 
    add_bank_master, 
    get_bank_master,
    add_bank_branch_master,
    get_bank_branch_master,
    add_followup_type_master,
    get_followup_type_master,
    updatebranchmaster,
    update_version_master,
    update_bank_master,
    add_permission_master,
    get_permission_master,
    update_permission_master,
    get_create_master_requisites,
    get_roles_and_users_permissions,
    create_department,
    get_department,
    update_bank_branch_master,
    update_followup_type_master,
    add_exotel_master,
    get_exotel_master,
    update_exotel_master,
    add_case_type_master,
    get_case_type_master,
    update_case_type_master,
    create_role,
    getAvailablePermissions,
    edit_role,
    branchMappingUpload
}  
   