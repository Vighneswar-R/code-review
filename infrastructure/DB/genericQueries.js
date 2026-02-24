const prisma = require('../../prisma/global')

const main = {
    create:async(model,data)=>{

        return await prisma[model].create({
      data:data
    });

    },

    createMany:async(model,data)=>{

        return await prisma[model].createMany({
      data:data
    });

    },

    findFirst:async(query)=>{

       return await prisma[model].findFirst(query);
    },

    findMany:async(model,where,skip,take) =>{
      return await prisma[model].findMany({
      where:where,
  skip: Number(skip) || 0,
  ...(take ? { take: Number(take) } : {})
});
    },

    update:async(model,where,data) =>{

      console.log("MODEL-1",data)
        return await prisma[model].update({
          where:where,
          data:data
        });
    },

    findById:async(model,id)=>{

      const data = await prisma[model].findUnique({
        where:{
          id:Number(id)
        }
      });

      return data;
    },

//   findCoMapped:async (loggedInEmpId) => {
//   const result = await prisma.$queryRaw`
//     WITH RECURSIVE hierarchy AS (
//       -- start from the logged-in user
//       SELECT 
//         u.id AS user_id,
//         u.employee_id,
//         u.name,
//         um.manager_code
//       FROM User u
//       LEFT JOIN UserMapping um ON um.employee_code = u.employee_id
//       WHERE u.employee_id = ${loggedInEmpId}

//       UNION ALL

//       -- recursively get subordinates
//       SELECT 
//         u2.id AS user_id,
//         u2.employee_id,
//         u2.name,
//         um2.manager_code
//       FROM User u2
//       JOIN UserMapping um2 ON um2.employee_code = u2.employee_id
//       JOIN hierarchy h ON um2.manager_code = h.employee_id
//     )
//     SELECT * 
//     FROM hierarchy 
//     WHERE role = 'CO';
//   `;

//   return result;
// },

// findCoMapped: async (loggedInEmpId) => {
//   const result = await prisma.$queryRaw`
//     WITH RECURSIVE hierarchy AS (
//       -- start from the logged-in user
//       SELECT 
//         u.id AS user_id,
//         u.employee_id,
//         u.name,
//         um.manager_code
//       FROM User u
//       LEFT JOIN UserMapping um ON um.employee_code = u.employee_id
//       WHERE u.employee_id = ${loggedInEmpId}

//       UNION ALL

//       -- recursively get subordinates
//       SELECT 
//         u2.id AS user_id,
//         u2.employee_id,
//         u2.name,
//         um2.manager_code
//       FROM User u2
//       JOIN UserMapping um2 ON um2.employee_code = u2.employee_id
//       JOIN hierarchy h ON um2.manager_code = h.employee_id
//     )

//     SELECT DISTINCT h.*
//     FROM hierarchy h
//     JOIN UserRoles ur ON ur.user_id = h.user_id
//     JOIN RoleMaster rm ON rm.id = ur.role_id
//     WHERE rm.name = 'Collection Officer';
//   `;

//   return result;
// },

findCoMapped: async (loggedInEmpId,getCount) => {

  console.log("LOGGEDIN",loggedInEmpId)

  // 1. Find users who report to loggedInEmpId
  const mapped = await prisma.userMapping.findMany({
    where: { manager_code: loggedInEmpId,employee_code:{not:null} },
    select: { employee_code: true }
  });

  console.log("MAP",mapped)

  if (!mapped.length) return [];

  // 2. Extract list of employee IDs
  const employeeCodes = mapped.map(m => m.employee_code);

  console.log("EMPLOYEE",employeeCodes)

  // 3. Find matching users with CO role

  let includeQuery = { UserRoles: true, BranchMapping:{
    where:{
      is_active:true
    },
    select:{
      BranchMaster:{
        select:{
          id:true,
          branch_name:true
        }
      }
    }
  } };



  if(getCount){

    const startOfMonth = new Date();
startOfMonth.setDate(1);
startOfMonth.setHours(0, 0, 0, 0);

const today = new Date();

includeQuery = {
  ...includeQuery,
  SoaCaseMapping: {
    select: {
      loan_number: true,
      id: true,
      SoaEmiMapping: {
        where: {
          updated_at: {
            gte: startOfMonth,
            lte: today,
          },
        },
      },
      PaymentCollect: {
        where: {
          payment_date: {
            gte: startOfMonth,
            lte: today,
          },
        },
      },
    },
  },
};
}

console.log("employeeCodes",employeeCodes)
  const result = await prisma.user.findMany({
    where: {
      employee_id: { in: employeeCodes },
      UserRoles: {
        some: {
          RoleMaster: { name: "Collection Officer" }
        }
      }
    },
    include:includeQuery
  });

  console.log("RES",result)

  return result;
},
findManyInclude:async(model,include) =>{

  return await prisma[model].findMany({
    where:{
      active:true
    },
    include:{...include,RuleConditions:{where:{active:true}}}
  })
}

};



module.exports = main;