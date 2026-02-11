// ** This consists of crete user and user data related routes for admin to handle


const adminQueries = require('../../infrastructure/DB/adminQueries')

const userQueries = require('../../infrastructure/DB/userQueries');

const genericQueries = require('../../infrastructure/DB/genericQueries');

const managementQueries = require('../../infrastructure/DB/managementQueries');

const xlsx = require('xlsx');



const create_user = async(name,email,employee_code,department_id,branches,mobile_number,manager_code,role_ids,cancel_permissions)=>{
    try{

    // check if there is any existing user;

    console.log("MOB",mobile_number)

    const existing = await adminQueries.get_user(mobile_number);

    if(existing) throw new Error("Cannot Add This User! Please Try Again");


    // check if admin is included in the role list

    const if_admin = adminQueries.checkIfAdmin(role_ids);



    if(!if_admin && (!manager_code || !department_id || !!branches?.length)) throw new Error("Unable to create user - Missing required fields!");

    let manager;

    if(!if_admin){

     manager = await adminQueries.get_user_by_code(manager_code);

    if(!manager) throw new Error("Invalid Manager Code!")

    }


    // const user = await adminQueries.add_user({name:name,email_id:email,mobile_number:mobile_number,department_id:department_id,
    //     branch_id:branch_id,employee_id:employee_code,username:mobile_number,status:'active'
    // });   // done

    // const user_id = user.id;

    let request_batch = [];


    let invalid_roles = [];


    // check and map role

    for(const id of role_ids){


        try{

        const existing_role = await adminQueries.get_role(id);

        if(!existing_role){
             throw new Error("Invalid Role");
        }

        // request_batch.push(adminQueries.userroles_mapping({
        //         type:1,
        //         status:1,
        //         role_id:Number(id),
        //         user_id:user_id,
        //         user_code:employee_code
        //     }))

              request_batch.push({
              condition:{
                table:'userRoles',
                method:'create',
                key:"role_mapping"
              },
              data:{
                type:1,
                status:1,
                role_id:Number(id),
                user_code:employee_code
              }
            })

        }

        catch(err){

            invalid_roles.push(id)
            console.log(err);
        }
    }

    if(cancel_permissions && cancel_permissions?.length){

        // cancel_permissions = cancel_permissions.map((p)=>{
        //     p.type_id = user_id;

        //     return p
        // })

        console.log("CANCEL",cancel_permissions);

             request_batch.push({
              condition:{
                table:'permissonMapping',
                method:'createMany',
                key:"permission_mapping"
              },
              data:cancel_permissions
            })

        // request_batch.push(adminQueries.map_permissons(cancel_permissions))

    }


    
    if(branches?.length){

        request_batch.push({
              condition:{
                table:'branchMapping',
                method:'createMany',
                key:"branch_mapping"
              },
              data:branches.map((b)=>{
                return {branch_id:Number(b),is_active:true,user_id:""}
              })
            })
    }

    // request_batch.push(adminQueries.add_mapping({manager_code:manager_code,employee_code:employee_code}));

    
    request_batch.push({
              condition:{
                table:'userMapping',
                method:'create',
                key:"user_mapping"
              },
              data:{
                manager_code:manager_code,
                employee_code:employee_code
              }
            });


    // const result = await Promise.allSettled(request_batch);

    const result = await adminQueries.addUserAndMapPermissions({name:name,email_id:email,mobile_number:mobile_number,department_id:department_id,employee_id:employee_code,username:mobile_number,status:'active'
    },request_batch)

    let resp = {message:"Success",result:result}


//     if(invalid_roles.length == role_ids.length) resp.error_message = 'No Role Assigned For This User!'

//     if(invalid_roles.length) {
// resp.unassigned_roles = invalid_roles
// resp.role_error = true;
//     }

    return resp;

    }

    catch(err){

        throw err;
           
    }
} 

const edit_user = async(body) =>{

    try{

    let batch_requests = [];

    console.log("EDITING")

    if(!body.id) throw new Error("Invalid Parameter!");

    const user_id = body?.id;

    const user = await userQueries.getUserById(user_id);

    if(!user) throw new Error("No User Found!");

    //parameters based validation

    let valid_obj = {};


    if(body?.cancel_permissions?.length){

        valid_obj.cancel_permissions = true;

        for(const item of body?.cancel_permissions){

            body.cancel_permissions = body.cancel_permissions.map((p)=>{
            p.type_id = user_id;

            return p
        })

        item.type_id = user_id;

            // batch_requests.push(adminQueries.map_permission_single(item));

            batch_requests.push({
                condition:{
                    table:"permissionMapping",
                    method:"create",
                    key:"cancel_permissions"
                },
                data:item
            });

        }
    }

    if(body.role_ids && body?.role_ids?.length){

        valid_obj.add_role = true;

        for(const id of body.role_ids){
    //   const existing_role = await adminQueries.get_role(id);

    //     if(!existing_role){
    //          throw new Error("Invalid Role");
    //     }

  
        batch_requests.push({
            condition:{
                add_role:true,
                table:"userRoles",
                method:"create",
                key:"role_mapping"
            },
            data:{
                type:1,
                status:1,
                role_id:Number(id),
                user_id:user_id,
                user_code:user.employee_id
            }
        })
        }


    }

    //delete role for the user

    if(body?.delete_roles && body?.delete_roles?.length){

        valid_obj.delete_roles = true;

        for(const id of body?.delete_roles){

            // batch_requests.push(adminQueries.updateRoleById(id,{status:0}))

                        batch_requests.push({
                            condition:{
                                table:"userRoles",
                                method:"updateMany",
                                key:"delete_roles"
                            },
                            where:{
                                role_id:Number(id),
                                user_id:Number(user_id)
                            },
                            data:{
                                status:0
                            }
                        })


        }
    }


    // edit existing role mapped

    if(body?.edit_role && body?.edit_role?.length){
           for(const item of body?.edit_role){

            valid_obj.edit_role = true;

            const id = item?.id;

            if(!id) continue;

            let item_copy = {...item};

            delete item_copy.id;

            console.log("(ITEM copy",id)

            // batch_requests.push(adminQueries.updateRoleById(id,item_copy))

            batch_requests.push({
                condition:{
                    table:"userRoles",
                    method:'update',
                    key:'edit_role'
                },
                where:{
                    id:Number(id)
                },
                data:item_copy
            })


        }
    }


    // if any deleted permisson is to be re added 

    if(body?.re_initiate_permissions){

        valid_obj.re_initiate_permissions = true;

        // batch_requests.push(adminQueries.updateManyPermissonMap(body.re_initiate_permissions,user_id));

    batch_requests.push({
        condition:{
            table:'permissionMapping',
            method:"updateMany",
            key:"re_initiate_permissions"
        },
        where:{
            id:{
                in:body.re_initiate_permissions
            },
            map_type:'user',
            type_id:Number(user_id)
        },
        data:{status:false}
    })

    }


    if(body?.remove_branches){

           batch_requests.push({
        condition:{
            table:'branchMapping',
            method:"updateMany",
            key:"remove_branches"
        },
        where:{
            branch_id:{
                in:body?.remove_branches
            },
            user_id:user_id
        },
        data:{is_active:false}
    })

    }

    if(body?.add_branches){


        let many_body = [];

        for(const branch of body?.add_branches){
    //     batch_requests.push({
    //     condition:{
    //         table:'branchMapping',
    //         method:"create",
    //         key:"add_branches"
    //     },
    //     data:{user_id:user_id,branch_id:branch,is_active:true}
    // });

    let obj = {branch_id:branch,user_id:user_id,is_active:true};

    many_body.push(obj);

        }

              batch_requests.push({
        condition:{
            table:'branchMapping',
            method:"createMany",
            key:"add_branches"
        },
        data:many_body
    });


        
    }

    if(body?.re_initiate_branches){

        batch_requests.push({
        condition:{
            table:'branchMapping',
            method:"updateMany",
            key:"re_initiate_branches"
        },
        where:{
            branch_id:{
                in:body?.re_initiate_branches
            },
            user_id:user_id
        },
        data:{is_active:true}
    })
        
    }




    //normal update

    let body_copy = structuredClone(body);

    const keys = Object.keys(body_copy);

    let payload = {};

    for(const key of keys){

        if(['edit_role','cancel_permissions','role_ids','delete_roles','re_initiate_permissions','add_branches','remove_branches','re_initiate_branches'].includes(key)){
            delete body_copy[key]
        }
        else{

            if(["id","manager_code"].includes(key)) continue;

            payload[key] = body_copy[key];
        }
    }


    if(body?.manager_code){

        valid_obj.manager_code = true;

        // batch_requests.push(adminQueries.checkAndUpdateManagerMapping(user.employee_id,body.manager_code))

     batch_requests.push({
        condition:{
            table:"userMapping",
            method:"update",
            key:"manager_code_update"
        },
        data:{
            code:user.employee_id,
            manager:body.manager_code
        }
     })

    }


    if(Object.keys(payload)?.length){

        valid_obj.general = true;

        // batch_requests.push(genericQueries.update('user',{id:Number(user.id)},payload))

                batch_requests.push({
                    condition:{
                        table:"user",
                        method:"update",
                        key:"general"
                    },
                    where:{
                        id:Number(user.id)
                    },
                    data:payload
                })

    }

    if(batch_requests?.length){

        // console.log("REQUEST EXECUTE")
        // await Promise.all(batch_requests);

        await adminQueries.editUserWithPermissions(valid_obj,batch_requests)

        return {message:"Successfully Updated!"}
    }

    else{
        
        throw new Error("No Update Done!")
    }

    }

    catch(err){

        console.log(err)

        throw err;
    }
}   // need transaction ** 

const get_user = async(id,queries) =>{

    try{

        const user = await managementQueries.findUserSpecific(id,queries);

        return {message:"Success",result:user}
    }

    catch(err){

        throw err;
    }

}


const get_user_list = async(skip,take,query) =>{

    try{

    const result = await adminQueries.getAllUser(skip,take,query);

    return {message:"Success",result:result}

    }

    catch(err){

        throw err;
    }
}


const bulk_upload_user = async(req,file_type)=>{

    try{

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
        
        
     const sanitizeData = (obj) => {

  if (!obj) return {};

  let copy = {};

  for (let key in obj) {
    // Only rename if key contains a space

    let new_key = key.toLocaleLowerCase();
    if (key.includes(' ')) {
       new_key = new_key.trim().split(' ').join('_').toLowerCase();
      copy[new_key] = obj[key];
      console.log("WRONG",new_key)
    }

    else{

    console.log("NEW",obj[key]);
    copy[new_key] = obj[key];
    console.log("AFTER")

    }

  }

  console.log("OBJ", copy);

  if(copy.mobile_number) copy.mobile_number = String(copy.mobile_number);

    if(copy.username) copy.username = String(copy.username);


  return copy;
};
        
            const final_set = sheet_data.map((data)=>sanitizeData(data));

            console.log("FINAL",final_set)
        

  let failed = [];

  let promise_batch = [];

  let all_map = [];

  let role_obj  = {};
            for (const row of final_set) {
  // Try to find existing row by loan_number



  try{


const existing = await adminQueries.findUserbyPhone(row.mobile_number);


console.log("ENTIRE",row)

  delete row.__empty

    // Doesn't exist → create new]


let row_copy = { ...row };


// check if manager code is valid or not **

if(existing){

    let obj = {error:"Existing User",data:row}
    failed.push(obj);
    continue;
}


if(row?.manager_code){

const valid_manager = await adminQueries.checkManager(row?.manager_code);

if(!valid_manager) throw new Error("Invalid Manager Code!");


all_map.push({manager_code:row?.manager_code,employee_code:row?.employee_id})

}
if(row?.role){
    // single role assign in bulk upload ** for Collection Officers

    const roleData = await adminQueries.findRoleByName(row?.role);

    if(!roleData?.id){
        failed.push({error:"Invalid Role",data:row});
        continue;
    };

    role_obj[row?.employee_id] = roleData.id

}

//validate department passed is valid or not and sanitize the row **

if(row?.department){

    const valid_department = await adminQueries.findDepartmentByName(String(row?.department));

    if(!valid_department?.id) throw new Error("Invalid Department");

    delete row_copy.department;

    row_copy.department_id = Number(valid_department.id);
};

// validate branch name passed if valid and sanitize the row **

if(row?.branch){

    const valid_branch = await adminQueries.findBranchByName(String(row?.branch));

    if(!valid_branch?.id) throw new Error("Invalid Branch");

    delete row_copy.branch;

    row_copy.branch_id = Number(valid_branch.id);


};


if(row?.employee_code){

    let stored = row?.employee_code || ""

    delete row?.employee_code;

    row_copy.employee_id = stored;
}

    row_copy.created_at = new Date()
    row_copy.updated_at = new Date();

    row_copy.username = row_copy.mobile_number;

    delete row_copy.role
    delete row_copy.manager_code;

    console.log("ROW COPY",row_copy)

    promise_batch.push(adminQueries.createUserByRow(row_copy));

}

catch(err){

    console.log(err)
    let obj = {error:err?.message,data:row}
    failed.push(obj);

}



}

// check promise batch is empty of not

if(!promise_batch?.length){

    console.log("YESHERE")

    return {message:"Failed",failed:failed,insert_count:promise_batch?.length-1};
}

await Promise.all(promise_batch);


if(all_map?.length) await Promise.all(all_map.map((ele)=>{
    return adminQueries.updateMapping(ele)
}));

let role_promises = [];

if(Object.keys(role_obj)?.length){

    console.log("EMP",Object.keys(role_obj))

    const all_users = await adminQueries.findManyByEmployeeId(Object.keys(role_obj));

    for(const users of all_users){

        role_promises.push(adminQueries.mapUserRoles(users.id,role_obj[users.employee_id],users?.employee_id))
    };


            console.log("promuises",role_promises)

                        console.log("USERS",all_users)



    if(role_promises.length) await Promise.all(role_promises);
}

return {message:"successfully uploaded",failed:failed}
    }

    catch(err){

        throw err;

    }
}


const change_status = async(body)=>{

    try{

    let clone = body?.updates || [];

    let ids_active = [];

    let ids_inactive = [];

      if(clone?.length){

        // additional sanitize data

        for(const item of clone){

            if(!item?.status || !item?.id) continue;

            item?.status == 'Active'?ids_active.push(item.id):item?.status == 'In-Active'?ids_inactive.push(item.id):null;
        };

        //execute query in single transaction

        const result = await adminQueries.updateStatus(ids_active,ids_inactive);

        return result;


      } 

      else{
        throw new Error("No Data For Update!");
      }

    }

    catch(err){

        throw err;

    }
}


module.exports = {create_user,edit_user,get_user,get_user_list,bulk_upload_user,change_status};