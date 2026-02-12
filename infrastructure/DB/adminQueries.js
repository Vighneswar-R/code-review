const prisma = require('../../prisma/global');



const main = {


add_user:async(data)=>{

    return await prisma.user.create({data:data})
},

get_user:async(mobile_number)=>{
    return await prisma.user.findFirst({where:{mobile_number:mobile_number}})

},

get_user_by_code:async(code)=>{
    return await prisma.user.findFirst({where:{employee_id:code}})

},

add_mapping:async(data) =>{

    console.log("MAPPING PAY",data)
    return await prisma.userMapping.create({data:data})
},

userroles_mapping:async(data)=>{

    const existing = await prisma.userRoles.findFirst({
        where:{
            user_id:Number(data?.user_id),
            status:1,
            role_id:data?.role_id
        }
    });

    if(existing) return null;

    return await prisma.userRoles.create({data:data});
},

get_role:async(id)=>{
    return await prisma.roleMaster.findUnique({where:{id:Number(id)}})
},

map_permissons:async(data)=>{

    return await prisma.permissionMapping.createMany({data:data})
},

map_permission_single:async(data)=>{

    const existing = await prisma.permissionMapping.findFirst({
        where:{
            type_id:Number(data?.type_id),
            map_type:"user",
            status:true,
            permission_id:data?.permission_id
        }
    })

    if(existing) return null

    return await prisma.permissionMapping.create({data:data})
},

updateRoleById:async(id,data)=>{

    console.log("USER ROLE",data)
    return await prisma.userRoles.update({
        where:{
            id:Number(id)
        },
        data:data
    })
},

updateManyPermissonMap:async(permission_ids,id)=>{

    console.log("ID",id,permission_ids)

    return await prisma.permissionMapping.updateMany({
        where:{
            permission_id:{
                in:permission_ids
            },
            map_type:"user",
            type_id:Number(id)
        },
        data:{
            status:false
        }
    })
},

getAllUser:async(skip,take,query)=>{

    let queryObj = {where:{},
include:{
    BranchMapping:{
        where:{
            is_active:true
        },
        select:{
            BranchMaster:{
                select:{
                    branch_name:true,
                    id:true
                }
            }
        }
    },
    UserRoles:{
                where:{
            status:1
        },
        select:{
            role_id:true,
            id:true,
            RoleMaster:{
                select:{
                    name:true
                }
            }
        }
    }
}};

    if(skip && take) {
        queryObj.skip = Number(skip);

        queryObj.take = Number(take)
    }


    // filter based validation

    if(query?.name){
        queryObj.where.name = {contains:query.name}
    }

    
    if(query?.email){
        queryObj.where.email_id = {contains:query.email};
    }

        
    if(query?.role){
       queryObj.where.UserRoles = {
  some: {
     RoleMaster: {
      name: {
        contains: query?.role
          }
    }
  }

};
    }

     result = await prisma.user.findMany(queryObj) || {}

    if(result?.length){


        result = result.map((res)=>{
                   let branch_name = res?.BranchMaster?.branch_name || "";

        delete res.BranchMaster;

        let roles = res?.UserRoles?.map((r)=>{
            let name = r?.RoleMaster?.name || "";

            delete r.RoleMaster;

            return {...r,name:name}
        })


        res.UserRoles = roles;

        let branches = res.BranchMapping || [];

        branches = branches.map((b)=>{
            return b?.BranchMaster
        });

        res.branches = branches;

        if(res?.BranchMapping) delete res.BranchMapping;
        return res;
        }) 

 
    }

    return result;
},

checkAndUpdateManagerMapping:async(db,code,manager)=>{

    const existing = await db.userMapping.findFirst({
        where:{
            employee_code:code
        },
        select:{
            id:true
        }
    });


    console.log("ID EM{",manager)
    const if_employee = await db.user.findFirst({
        where:{
            employee_id:manager
        },
        select:{id:true}
    });

    if(!if_employee) throw new Error("Invalid Manager Code!")

    let data;

    if(existing){
        data = await db.userMapping.update({
            where:{
                id:Number(existing.id)
            },
            data:{manager_code:manager}
        })

    }

    else{

        console.log("CODE",code)
        data = await db.userMapping.create({
            data:{manager_code:manager,employee_code:code}
        })
    };

    return data;
},


findUserbyPhone:async(phone)=>{

    return await prisma.user.findFirst({
        where:{
            mobile_number:String(phone)
        }
    })
},


createUserByRow:async(data) =>{

    return await prisma.user.create({
        data:data
    })
},

checkManager:async(code)=>{

    const data = await prisma.user.findFirst({
        where:{
            employee_id:code
        }
    });

    return data?.id;
},


updateMapping:async(data)=>{
    return await prisma.userMapping.create({
        data:data
    })
},

findRoleByName:async(name)=>{

    return await prisma.roleMaster.findFirst({
        where:{
            name:name
        }
    })
},


findManyByEmployeeId:async(employee_ids)=>{

    return await prisma.user.findMany({
        where:{
            employee_id:{
                in:employee_ids
            }
        }
    })
},

mapUserRoles:async(id,role_id,emp_id)=>{

    return await prisma.userRoles.create({
        data:{
            user_id:Number(id),
            role_id:Number(role_id),
            status:1,
            display_order:1,
            type:1,
            user_code:emp_id,
            updated_at:new Date()
        }
    })
},


findDepartmentByName:async(name)=>{

    return await prisma.departmentMaster.findFirst({
        where:{
            department_name:{
                contains:name
            }
        },
        select:{
            id:true,
            department_name:true
        }
    })
},

findBranchByName:async(name)=>{

    return await prisma.branchMaster.findFirst({
        where:{
            branch_name:{
                contains:name
            }
        },
        select:{
            id:true,
            branch_name:true
        }
    })
},

updateStatus:async(active,inactive)=>{




  const result = await prisma.$transaction(async (tx) => {


      let active_count = { count: 0 };
    let inactive_count = { count: 0 };

       if(active?.length){
    
   active_count =  await tx.user.updateMany({
    where: {
      id:{
        in:active
      }
    },
    data: { status: 'Active' }
  });
       } 
  

    await tx.user.create({
        data:{
            name:"Rollback",
            status:"Active",
            employee_id:"1221212",
            username:"xyz",
            mobile_number:"09987858233"
        }
    })   

    if(inactive?.length){
    
   inactive_count =  await tx.user.updateMany({
    where: {
      id:{
        in:1
      }
    },
    data: { status: 'In-Active' }
  });
       } 



    return {
      active: active_count.count,
      inactive: inactive_count.count,
      message: "Success"
    };
});

return result
},

addUserAndMapPermissions:async(user_body,promises) =>{

    const data = await prisma.$transaction(async(tx)=>{


        const new_user = await tx.user.create({
            data:user_body
        });

        if(!new_user.id) throw new Error("Error Creating User- Stage 1");
        console.log("MODIFIELD",JSON.stringify(promises))


        let modified_promises = promises.map((p)=>{

            // conditionally attach and modify to settle the promises;

               const key = p?.condition?.key;

               console.log("KEY HERE",key)

                const table = p?.condition?.table;

                const method = p?.condition?.method;

            switch(key){

                case('role_mapping'):

                const data_rm = p?.data;

                let query_obj_rm = {data:{...data_rm,user_id:new_user.id}};

                return tx[table][method](query_obj_rm);

                break;


                case('permission_mapping'):

                const data_pm = p?.data;

                let query_obj_pm = {data:data_pm.map((ele)=>{
                    return {...ele,type_id:new_user.id}
                })};

                console.log("DATA_PM",query_obj_pm)

                return tx.permissionMapping?.createMany(query_obj_pm);

                break;

                
                case('user_mapping'):

                const data_um = p?.data;

                let query_obj_um = {data:data_um}

                console.log("query",query_obj_um)

                return tx[table][method](query_obj_um);

                break;


                 case('branch_mapping'):

                const data_bm = p?.data || {};

                
                let query_obj_bm = {data:data_bm?.map((data)=>{
                    return {...data,user_id:Number(new_user.id)}
                })}


                console.log("QIERY",query_obj_bm)

                return tx[table][method](query_obj_bm);

                break;


            }
        });



        const result = await Promise.all(modified_promises);

        return new_user
        
    });

    return data;

},

editUserWithPermissions:async(obj,promises)=>{

    const data = await prisma.$transaction(async(tx)=>{

        const sanitized = promises.map(async(p)=>{

            const key = p?.condition?.key;

            const table = p?.condition?.table;

            const method = p?.condition?.method;

            switch(key){

                case('cancel_permissions'):

                let query_cp = {data:p?.data};

                console.log("PROMISE",p)

                // find if existing

                const existing_entries = await tx.permissionMapping.findMany({
                    where:{
                        map_type:"user",
                        type_id:Number(p?.data?.type_id),
                        permission_id:Number(p?.data?.permission_id)
                    }
                });

                console.log("ENTRY",existing_entries)

                if(existing_entries?.length){
                    return tx.permissionMapping.updateMany({
                        where:{
                            id:{
                                in:existing_entries.map((ent)=>ent.id)
                            }
                        },
                        data:{
                            status:true
                        }
                    })
                }

                else{

                    console.log("CREATE MODE")

                return tx[table][method](query_cp)

                }

                break;

                case('role_mapping'):

                const role_id_rm = p?.data?.role_id;

                if(!role_id_rm) throw new Error("Invalid Role!");

                const valid_role = await tx.roleMaster.findFirst({
                    where:{
                        id:Number(role_id_rm)
                    }
                });

                if(!valid_role) throw new Error("Error Updating! Invalid Role");

                let query_rm = {data:p?.data};

                return tx[table][method](query_rm);

                break;

                case('delete_roles'):  

                let query_dr = {where:p?.where,data:p?.data}

                console.log("WHREE",table,method,query_dr);

                return tx[table][method](query_dr);

                break;

                case('edit_role'):

                let query_er = {where:p?.where,data:p?.data}

                return tx.userRoles.updateMany(query_er)

                break;

                case('re_initiate_permissions'):

                let query_rp = {where:p?.where,data:p?.data};


                return tx[table][method](query_rp);

                break;


                case('remove_branches'):

                let query_rb = {where:p?.where,data:p?.data};


                return tx[table][method](query_rb);

                break;


                case('add_branches'):

                let query_ab = {data:p?.data};


                let body_data = p?.data || [];


                // check if already exists or not to avoid duplicates;


                let existing_branches = await tx.branchMapping.findMany({
                    where:{
                        branch_id:{
                            in:p?.data.map((pd)=>{
                            return pd?.branch_id
                        })
                        },
                        user_id:p?.data?.[0]?.user_id,
                        is_active:true
                    },
                    select:{
                        branch_id:true
                    }
                })

                existing_branches = existing_branches.map((data)=>data?.branch_id)

                if(existing_branches?.length){

                    body_data = body_data.filter((df)=>!existing_branches.includes(df.branch_id));

                    query_ab = {data:body_data}
                }


                return tx[table][method](query_ab);

                break;


                case('re_initiate_branches'):

                let query_rib = {where:p?.where,data:p?.data};

                return tx[table][method](query_rib);

                break;
                case('manager_code_update'):


                return main.checkAndUpdateManagerMapping(tx,p?.data?.code,p?.data?.manager);

                break;
                

                case('general'):

                let query_general = {where:p?.where,data:p?.data};

                return tx[table][method](query_general)

                break;

                
            }
        });

        console.log(JSON.stringify(sanitized))

        return await Promise.all(sanitized);
    });

    return data;

},

  findManyGenericKey:async(query)=>{
         return await prisma.genericMaster.findMany(query);
    },

        checkIfAdmin:async(roles)=>{

        const data = await prisma.userRoles.findMany({
            where:{
                role_id:{
                    in:roles
                }
            },
            include:{
                RoleMaster:{
                    select:{
                        id:true,
                        name:true
                    }
                }
            }
        });


        if(!data?.length) throw new Error("No roles Assigned for the user");

        let ifAdmin = data.filter((roles)=>{
            return roles?.RoleMaster?.name.toLocaleLowerCase() == "admin" 
        });

        if(ifAdmin?.length){
            return true;
        }

        else{
            return false;
        }

    }

}


module.exports = main;