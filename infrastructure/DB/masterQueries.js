const prisma = require('../../prisma/global');
const { findMany } = require('./genericQueries');

const main = {
    createBranchMaster:async(data)=>{
        return await prisma.branchMaster.create({
            data:data
        })
    },


    updateBranchMaster:async(id,data)=>{
        return await prisma.branchMaster.update({
            where : {
                id : parseInt(id)
            },
            data : data
        }) 
    },

    // updateBankMaster

    updateBankMaster:async(id,data)=>{
        return await prisma.bankmaster.update({
            where : {
                id : parseInt(id)
            },
            data : data
        }) 
    },


    updateVersionMaster:async(id,data)=>{
        return await prisma.versionmaster.update({
            where : {
                id : parseInt(id)
            },
            data : data
        })
    },



    createVersionMaster:async(data)=>{
        return await prisma.versionmaster.create({
            data:data
        })

    },

 PermissionMasterfindFirst:async(query)=>{
         return await prisma.permissionMaster.findFirst(query);
    },

    createPermissionMaster:async(data)=>{
        return await prisma.permissionMaster.create({
            data:data
        })
    },
    findManyPermissionMaster:async(query)=>{
         return await prisma.permissionMaster.findMany(
            {
                where : {
                    status : true
                }
            }
         );
    },

    updatePermissionMaster:async(id,data)=>{
        return await prisma.permissionMaster.update({
            where : {
                id : parseInt(id)
            },
            data : data
        })
    },


    createBankMaster:async(data)=>{
        return await prisma.bankmaster.create({
            data : data
        })
    },

    BankMasterfindFirst:async(query)=>{

       return await prisma.bankmaster.findFirst(query);
    },

    findManyBankMaster:async(query)=>{

       return await prisma.bankmaster.findMany(query);
    },


     VersionMasterfindFirst:async(query)=>{

       return await prisma.versionmaster.findFirst(query);
    },


FollowUpMasterfindFirst:async(query)=>{
 
       return await prisma.followUpMaster.findFirst(query);
    },
  findManyFollowup: async () => {
    return await prisma.followUpMaster.findMany({
        include: {
            GenericMaster: true,
        },
    });
},
   createFollowUPMaster:async(data)=>{
        return await prisma.followUpMaster.create({
            data:data
        })
 
    },
 


    findManyVersionMaster:async(query)=>{
         return await prisma.versionmaster.findMany(query);
    },

    
    findFirst:async(query)=>{

       return await prisma.branchMaster.findFirst(query);
    },

    findFirstMaster:async(query)=>{

       return await prisma.branchMaster.findFirst(query);
    },

    findManyBranchMaster:async(query)=>{

       return await prisma.branchMaster.findMany(query);
    },

    findfirstZone:async(query)=>{
        return await prisma.masterZone.findFirst(query);
    },

    findManyZone:async(query)=>{
        return await prisma.masterZone.findMany(query);
    },

    findFirstRegion:async(query)=>{
     return await prisma.masterRegion.findFirst(query);
    },

    findManyRegion:async(query)=>{
        return await prisma.masterRegion.findMany(query);
    },


    BankBranchfindFirst:async(query)=>{
     return await prisma.bankBranchMaster.findFirst(query);
    },

    createBankBranchMaster:async(data)=>{
        return await prisma.bankBranchMaster.create({
            data:data
        })
    },


          findManyBankBranchMaster: async(query) => {
    const bankbranch = await prisma.bankBranchMaster.findMany({
        include: {
            bankmaster: true,    
            MasterRegion: true  
        }
    });

    return bankbranch;
},


    findMany:async(model)=>{

        return await prisma[model].findMany()

    },


    findRole: async (query = {}) => {
    return await prisma.roleMaster.findMany({
        select: { id: true, name: true },
        ...query
    });
},

 findRolesWithPermissions : async (query) => {
    
    const roles = await prisma.roleMaster.findMany({
        where: {
            ...query.where
        }
    });


    const roleIds = roles.map(role => role.id);

   
    const permissionMappings = await prisma.permissionMapping.findMany({
        where: {
            type_id: { in: roleIds },
            map_type: 'role',
            status: true
        },
        include: {
            PermissionMaster: true
        }
    });

  
    return roles.map(role => ({
        ...role,
        PermissionMapping: permissionMappings.filter(pm => pm.type_id === role.id)
    }));
},


  findUsersWithPermissions : async (query) => {
 
    const users = await prisma.user.findMany({
        where: {
            ...query.where
        }
    });


    const userIds = users.map(user => user.id);

   
    const permissionMappings = await prisma.permissionMapping.findMany({
        where: {
            type_id: { in: userIds },
            map_type: 'user',
            status: true
        },
        include: {
            PermissionMaster: true
        }
    });

   
    return users.map(user => ({
        ...user,
        PermissionMapping: permissionMappings.filter(pm => pm.type_id === user.id)
    }));
},


DepartmentMasterfindFirst:async(query)=>{
       return await prisma.departmentMaster.findFirst(query);
    },

    createDepartmentMaster:async(data)=>{
        return await prisma.departmentMaster.create({
            data:data
        })
    },

        findManyDepartmentMaster:async(query)=>{
         return await prisma.departmentMaster.findMany(query);
    },


    updateBankBranchMaster:async(id,data)=>{
        return await prisma.bankBranchMaster.update({
            where : {
                id : parseInt(id)
            },
            data : data
        }) 
    },

updateFollowupMaster:async(id,data)=>{
        return await prisma.followUpMaster.update({
            where : {
                id : parseInt(id)
            },
            data : data
        })
    },

    createExotelMaster:async(data)=>{
        return await prisma.excotelmaster.create({
            data:data
        })
    },

    
   ExotelMasterfindFirst:async(query)=>{

         return await prisma.excotelmaster.findFirst(query);
    },

    findManyExotelMaster:async(query)=>{
         return await prisma.excotelmaster.findMany(query);
    },

    updateExotelMaster:async(id,data)=>{
        return await prisma.excotelmaster.update({
            where : {
                id : parseInt(id)
            },
            data : data
        }) 
    },


    CaseTypeMasterfindFirst:async(query)=>{

         return await prisma.casetypemaster.findFirst(query);
    },
    
    createCaseTypeMaster:async(data)=>{
        return await prisma.casetypemaster.create({
            data:data
        })
    },
    findManyCaseTypeMaster:async(query)=>{
         return await prisma.casetypemaster.findMany(query);
    },

    updateCaseTypeMaster:async(id,data)=>{
        return await prisma.casetypemaster.update({
            where : {
                id : parseInt(id)
            },
            data : data
        }) 
    },


    createRoleMasterAndMap:async(name,permissions)=>{


       const existing = await prisma.roleMaster.findFirst({
        where:{
            name:{
                contains:name
            }
        }
       });

       if(existing) throw new Error("Role Already Exist!");

       const createRole = await prisma.roleMaster.create({
        data:{
            name:name,
            created_at:new Date(),
            updated_at:new Date()
        }
       });

       const role_id = createRole.id;

       const payload = permissions.map((item)=>{

        return {status:true,created_at:new Date(),updated_at:new Date(),permission_id:item?.id,map_type:'role',type_id:role_id}
       });

       const mapped = await prisma.permissionMapping.createMany({
        data:payload
       });

       return createRole;
    },

    findRoleById:async(id)=>{


  let data = {role:null,permissions:[]}

  data.role = await prisma.roleMaster.findUnique({
    where:{
      id:Number(id)
    }
  });

  if(!data?.role?.id) throw new Error("No Role Data Found!");

  data.permissions = await prisma.permissionMapping.findMany({
    where:{
      map_type:'role',
      type_id:Number(data.role.id)
    },
    select:{
        id:true,
        status:true,
        type_id:true,
        map_type:true
    }
  });

  return data;
},

editTableById:async(id,model,data)=>{

    return await prisma[model].update({
        where:{
            id:Number(id)
        },
        data:data
    })

},

checkAndMapPermissions: async (id, permission_ids) => {

    const existing = await prisma.permissionMapping.findMany({
        where: {
            type_id: Number(id),
            map_type: 'role',
            permission_id: { in: permission_ids }
        },
        select: {
            id: true,
            status: true,
            permission_id: true
        }
    });

    let batch = [];
    let toEnable = [];             // IDs to update status=true
    let existingPermissionSet = {}; // Tracks existing permissions

    // Collect permissions already present
    for (const row of existing) {
        existingPermissionSet[row.permission_id] = true;

        // If permission exists but is disabled then enable it
        if (!row.status) {
            toEnable.push(row.id);
        }
    }

    if (toEnable.length) {
        batch.push(
            prisma.permissionMapping.updateMany({
                where: { id: { in: toEnable } },
                data: { status: true }
            })
        );
    }

    const filtered = permission_ids.filter(p => !existingPermissionSet[p]);

    if (filtered.length) {
        batch.push(
            prisma.permissionMapping.createMany({
                data: filtered.map(p => ({
                    map_type: 'role',
                    type_id: Number(id),
                    permission_id: p,
                    status: true
                }))
            })
        );
    }

    await Promise.all(batch);

    return { message: "Success",code:200 };
},


    // const data = await prisma.permissionMapping.findMany({
    //     where:{
    //         type_id:Number(id),
    //         type:'role',
    //         status:true,
    //         permission_id:{
    //             in:permission_ids
    //         }
    //     }
    // });



findAndRemovePermissions:async(id,permission_ids)=>{

        const updated = await prisma.permissionMapping.updateMany({
            where:{
                type_id:Number(id),
                map_type:'role',
                permission_id:{
                    in:permission_ids
                }
            },
            data:{
                status:false
            }
        })
    


        
    if (updated.count > 0) {
        return {
            message: "Success",
            code: 200,
            data: updated
        };
    }

    return {
        message: "No matching permissions found",
        code: 404,
        data: updated
    };
    

},

//.................................................        Bulk Branch Mapping Upload ................................................

bulkBranchMappingUpload: async (mappingArray) => {
    if (!mappingArray || mappingArray.length === 0) {
      return { message: "No data provided", code: 400 };
    }
 
    const employeeCodes = [
      ...new Set(
        mappingArray.map((m) => m.employeeCode?.trim()).filter(Boolean),
      ),
    ];
    const branchNames = [
      ...new Set(mappingArray.map((m) => m.branchName?.trim()).filter(Boolean)),
    ];
 
    if (employeeCodes.length === 0) {
      return { message: "No valid employeeCode found", code: 400 };
    }
 
    try {
      const result = await prisma.$transaction(async (tx) => {
        const errors = [];
 
        const users = await tx.user.findMany({
          where: { employee_id: { in: employeeCodes } },
          select: { id: true, employee_id: true },
        });
 
        const userMap = new Map(users.map((u) => [u.employee_id, u.id]));
        const missingEmployees = employeeCodes.filter(
          (code) => !userMap.has(code),
        );
 
        if (missingEmployees.length > 0) {
          errors.push(
            `Employee code(s) not found: ${missingEmployees.join(", ")}`,
          );
        }
 
        const branches = await tx.branchMaster.findMany({
          where: { branch_name : { in: branchNames } },
          select: { id: true, branch_name: true },
        });
 
        const branchMap = new Map(branches.map((b) => [b.branch_name, b.id]));
        const missingBranches = branchNames.filter(
          (name) => !branchMap.has(name),
        );
 
        if (missingBranches.length > 0) {
          errors.push(
            `Branch name(s) not found: ${missingBranches.join(", ")}`,
          );
        }
 
        if (errors.length > 0) {
          throw new Error(errors.join(" | "));
        }
 
        const currentMappings = await tx.branchMapping.findMany({
          where: {
            user_id: { in: Array.from(userMap.values()) },
            is_active: true,
          },
          select: {
            id: true,
            user_id: true,
            branch_id: true,
          },
        });
 
        const currentActive = new Map();
        currentMappings.forEach((m) => {
          if (!currentActive.has(m.user_id)) {
            currentActive.set(m.user_id, new Set());
          }
          currentActive.get(m.user_id).add(m.branch_id);
        });
 
        const desired = new Map();
        mappingArray.forEach((item) => {
          const empCode = item.employeeCode?.trim();
          const brName = item.branchName?.trim();
 
          if (!empCode || !brName) return;
 
          const userId = userMap.get(empCode);
          const branchId = branchMap.get(brName);
 
          if (!userId || !branchId) return;
 
          if (!desired.has(userId)) {
            desired.set(userId, new Set());
          }
          desired.get(userId).add(branchId);
        });
 
        const toDisable = [];
        const toCreate = [];
 
        for (const [userId, desiredBranches] of desired) {
          const currentBranches = currentActive.get(userId) || new Set();
 
          for (const branchId of desiredBranches) {
            if (!currentBranches.has(branchId)) {
              toCreate.push({ user_id: userId, branch_id: branchId });
            }
          }
 
          for (const branchId of currentBranches) {
            if (!desiredBranches.has(branchId)) {
              const mapping = currentMappings.find(
                (m) => m.user_id === userId && m.branch_id === branchId,
              );
              if (mapping?.id) {
                toDisable.push(mapping.id);
              }
            }
          }
        }
 
        if (toDisable.length > 0) {
          await tx.branchMapping.updateMany({
            where: { id: { in: toDisable } },
            data: { is_active: false },
          });
        }
 
        if (toCreate.length > 0) {
          const batchSize = 500;
          for (let i = 0; i < toCreate.length; i += batchSize) {
            const batch = toCreate.slice(i, i + batchSize);
            await tx.branchMapping.createMany({
              data: batch.map((m) => ({ ...m, is_active: true })),
              skipDuplicates: true,
            });
          }
        }
 
        const totalChanges = toCreate.length + toDisable.length;
        return {
          message:
            totalChanges > 0
              ? `Sync completed: ${toCreate.length} added, ${toDisable.length} disabled`
              : "No changes needed - already in sync",
          code: 200,
        };
      });
 
      return result;
    } catch (err) {
      console.error(err);
      return {
        message: "Sync failed: " + (err.message || "Unknown error"),
        code: 400,
      };
    }
  }


}


module.exports = main;