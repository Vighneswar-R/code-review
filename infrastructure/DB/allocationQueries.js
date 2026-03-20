const prisma = require('../../prisma/global')

const main = {
  createMaster: async (data) => {

    return await prisma.allocationMaster.create({
      data: data
    });

  },

  createMany: async (data) => {
    return await prisma.allocation.createMany({
      data: data
    });
  },

  create: async (data) => {
    return await prisma.allocation.create({ data: data })
  },

  findFirst: async (where) => {

    return await prisma.allocation.findFirst({
      where: where
    });
  },

  findManyWithUser: async (id) => {
    return await prisma.allocation.findMany({
      where: {
        batch_id: Number(id)
      },
      include: {
        User: true
      }
    });
  },

  mapCoToCase: async (loan, data) => {

    return await prisma.soaCaseMapping.update({
      where: {
        loan_number: loan
      },
      data: data
    })

  },

  findFirstOrder: async (orderBy, select) => {

    const data = await prisma.allocation.findFirst({
      orderBy: orderBy,
      select: select
    });

    return data;

  },


  findFirstMaster: async (where) => {

    return await prisma.allocationMaster.findFirst({ where: where });
  },

  findMany: async (where, skip, take) => {

    if (skip && take) {
      return await prisma.allocation.findMany({
        where: where,
        skip: Number(skip) || 0,
        ...(take ? { take: Number(take) } : {})
      });

    }
    else {
      return await prisma.allocation.findMany({
        where: where
      })

    }
  },


  findManyMaster: async (where, skip, take) => {

    console.log("WHERE", where)

    if (where) {
      return await prisma.allocationMaster.findMany({
        where: where,
        skip: Number(skip) || 0,
        ...(take ? { take: Number(take) } : {})
      });
    }

    else {
      return await prisma.allocationMaster.findMany({
        skip: Number(skip) || 0,
        ...(take ? { take: Number(take) } : {})
      });
    }

  },



  updateMany: async (type, value, data) => {

    return await prisma.allocation.updateMany({
      where: {
        [type]: value
      },
      data: data
    },
    );
  },


  updateManybyId: async (where, data) => {

    return await prisma.allocation.updateMany({
      where: where,
      data: data
    })
  },


  updateMaster: async ({ id, data }) => {

    return await prisma.allocationMaster.update({
      where: {
        id: Number(id)
      },
      data: data
    },
    );
  },


  getSoaDetails: async (id) => {

    return await prisma.soaCaseMapping.findFirst({
      where: {
        id: Number(id)
      },
      include: {
        SoaApplicantDetail: {
          include: {
            SoaAddressDetail: true
          }
        },
        SoaBankingDetails: true
      }
    })
  },

  getSoaDetailCases: async ({ from, to, skip, take, queries }) => {

    //       let whereClause = {
    //          OR: [
    //     { co_id: null }]
    //       };

    //        if (from) whereClause.created_at.gte = new Date(from);
    //        if (to) whereClause.created_at.lte = new Date(to);

    //       return await prisma.soaCaseMapping.findMany({
    //       where: whereClause,
    //   select: {
    //    id:true,
    //    loan_number:true,
    //    application_id:true,
    //    loan_purpose:true,
    //     SoaApplicantDetail: {
    //       where:{
    //          is_primary:true
    //       },
    //       select: {
    //          is_primary:true,
    //          first_name:true,
    //          middle_name:true,
    //          last_name:true,
    //          mobile_number:true,
    //         SoaAddressDetail: {
    //          select:{
    //             city:true,
    //             state:true,
    //             pincode:true
    //          }
    //         }
    //       }
    //     },
    //     SoaBankingDetails: true
    //   },
    //          skip: Number(skip) || 0,
    //   ...(take ? { take: Number(take) } : {})
    //       })
    //     }


let query = `

  SELECT 

    s.id AS id,

    s.loan_number AS loan_number,

    s.application_id AS application_id,

    s.loan_purpose AS loan_purpose,

    s.dpd_opening AS dpd,

    s.balance_collectible AS amount,

    s.created_at AS created_at,

    sad.id AS applicant_id,

    sad.is_primary AS is_primary,

    sad.first_name AS first_name,

    sad.middle_name AS middle_name,

    sad.last_name AS last_name,

    sad.mobile_number AS mobile_number

  FROM SoaCaseMapping s

  LEFT JOIN SoaApplicantDetail sad

    ON sad.case_id = s.id

   AND sad.is_primary = 1

  WHERE s.co_id IS NULL

`;
 
const params = [];
 
if (from) {

  query += ` AND s.created_at >= ?`;

  params.push(new Date(from));

}
 
if (to) {

  query += ` AND s.created_at <= ?`;

  params.push(new Date(to));

}
 
query += `

  ORDER BY s.created_at DESC

  LIMIT ${take ?? 100} OFFSET ${skip ?? 0}

`;

 
    const results = await prisma.$queryRawUnsafe(query, ...params);
    return results;

  },


  update: async (type, value, data) => {

    console.log("TYPE+VALUE+DATA", type, value, data)

    return await prisma.allocation.update({
      where: {
        [type]: value
      },
      data: data
    })

  },


  getSoaDetailCasesAssigned: async ({ from, to, skip, take, count }) => {


    let query = `
  SELECT 
    s.id AS id,
    s.loan_number AS loan_number,
    s.application_id AS application_id,
    s.loan_purpose AS loan_purpose,
    s.created_at AS created_at,
    s.co_id AS co_id,
    u.name AS co_name,
    u.employee_id AS co_emp_id,
    sad.id AS applicant_id,
    sad.is_primary AS is_primary,
    sad.first_name AS first_name,
    sad.middle_name AS middle_name,
    sad.last_name AS last_name,
    sad.mobile_number AS mobile_number,
    a.updated_at AS assigned_date,
(
  SELECT COALESCE(JSON_ARRAYAGG(JSON_OBJECT(
      'id', sa2.id,
      'city', sa2.city,
      'state', sa2.state,
      'pincode', sa2.pincode
    )), JSON_ARRAY())
  FROM SoaAddressDetail sa2
  WHERE sa2.applicant_id = sad.id
) AS address_detail,

(
  SELECT COALESCE(JSON_OBJECT(
      'id', u.id,
      'name', u.name,
      'employee_id', u.employee_id
      ))
  FROM User u
  WHERE s.co_id = u.id
) AS Co_Details,

(
  SELECT COALESCE(
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'id', sb2.id,
        'account_number', sb2.account_number
      )
    ),
    JSON_ARRAY()
  )
  FROM SoaBankingDetails sb2
  WHERE sb2.applicant_id = sad.id
) AS banking_detail
  FROM SoaCaseMapping s
  LEFT JOIN User u ON u.id = s.co_id
  LEFT JOIN SoaApplicantDetail sad
    ON sad.case_id = s.id AND sad.is_primary = 1
  LEFT JOIN SoaAddressDetail sa
    ON sa.applicant_id = sad.id
  LEFT JOIN SoaBankingDetails sb
    ON sb.applicant_id = sad.id
 LEFT JOIN (
    SELECT *
    FROM (
        SELECT *,
               ROW_NUMBER() OVER (PARTITION BY loan_number ORDER BY updated_at DESC) AS rn
        FROM Allocation
        WHERE status = 'allocated'
    ) t
    WHERE rn = 1
) a ON s.loan_number = a.loan_number
  WHERE s.co_id IS NOT NULL
`;
    const params = [];

    if (from) {
      query += ` AND s.created_at >= ?`;
      params.push(new Date(from));
    }

    if (to) {
      query += ` AND s.created_at <= ?`;
      params.push(new Date(to));
    }

    //   query += ` ORDER BY s.created_at DESC LIMIT ? OFFSET ?`;
    //   params.push(take ?? 100, skip ?? 0);


    //  LIMIT ${take ?? 100} OFFSET ${skip ?? 0}


    if (count == 'true') {
      query += `
  GROUP BY 
    s.id, s.loan_number, s.application_id, s.loan_purpose, s.created_at,
    sad.id, sad.is_primary, sad.first_name, sad.middle_name, sad.last_name, sad.mobile_number,
    a.id, a.updated_at
  ORDER BY s.id DESC
`;
    }

    else {
      query += `
  GROUP BY 
    s.id, s.loan_number, s.application_id, s.loan_purpose, s.created_at,
    sad.id, sad.is_primary, sad.first_name, sad.middle_name, sad.last_name, sad.mobile_number,
    a.id, a.updated_at
  ORDER BY s.id  DESC
  
`;


      console.log("HERE ACC")

    }



    let results = await prisma.$queryRawUnsafe(query, ...params);

    let result_obj = {};

    if (count == 'true') {

      result_obj.count = results?.length;


      const s = Number(skip);
      const t = Number(take);

      (t && s)
        ? result_obj = { ...result_obj, data: results?.slice(s, s + t) }
        : result_obj = { ...result_obj, data: results };
    }

    else {
      result_obj = { ...result_obj, data: results }
    }
    return result_obj;

  },


  updateTable: async (table, id, value, clause) => {

    if (clause) {

      return await prisma[table].update({
        where: { ...{ id: Number(id) }, ...clause },
        data: value
      })

    }

    else {

      return await prisma[table].update({
        where: { id: Number(id) },
        data: value
      })
    }

  },


  createTable: async (table, value) => {
    return await prisma[table].create({ data: value })
  },

  findTable: async (table, where) => {
    return await prisma[table].findFirst({ where: where });
  },

  findManyRules: async (ids) => {
    return await prisma.allocationRules.findMany({
      where: {
        id: {
          in: ids
        }
      },
      include: {
        RuleConditions: true
      }
    })
  },

  findAndUpdateBatchonNumbers: async (batches, where) => {

    const data = await prisma.allocationMaster.findMany({
      where: {
        id: {
          in: batches
        }
      }
    });

    let to_update = [];

    let to_update_active = [];

    if (data && data?.length) {

      for (const item of data) {

        if (!item?.id) continue;

        const allocation = await prisma.allocation.findMany({
          where: {
            batch_id: Number(item.id),
            active: true
          }
        });

        if (!allocation?.length) {
          to_update.push(item?.id);
        }
        else {
          to_update_active.push({ id: item?.id, status: item?.status });
        }

      };

    };

    let promises = [];

    console.log("TO UPDATE", to_update_active)

    if (to_update?.length) {
      promises.push(prisma.allocationMaster.updateMany({
        where: {
          id: {
            in: to_update
          }
        },
        data: {
          active: false
        }
      }));
    }

    if (to_update_active?.length) {

      let obj = { active: true };


      // if(obj?.status !== 'allocated') {

      //   obj = {...obj,status:'in process'}

      // }

      promises.push(prisma.allocationMaster.updateMany({
        where: {
          id: {
            in: to_update_active.map((i) => i?.id)
          }
        },
        data: obj
      }));
    }


    if (promises?.length) {

      let final = await Promise.allSettled(promises);

      return await prisma.allocationMaster.findMany({
        where: { ...where, active: true }
      })
    }



    return null;
  },

  findUserByCode: async (employee_id) => {
    return await prisma.user.findFirst({
      where: {
        employee_id: employee_id
      }
    })
  },

  findCaseByLoan: async (loan) => {
    return await prisma.soaCaseMapping.findFirst({
      where: {
        loan_number: loan
      }
    })
  },

  addRuleAndConditions: async (rule_info, conditions) => {

    const data = await prisma.$transaction(async (tx) => {

      const added_rule = await tx.AllocationRules.create({
        data: rule_info
      });

      if (!added_rule.id) throw new Error("Error Creating Rule!");

      const map_conditions = await tx.ruleConditions.createMany({
        data: conditions.map((ele) => {
          return { ...ele, rule_id: added_rule.id }
        })
      });

      return { ...added_rule, map_conditions }


    });

    return data;

  },

  approveAndMapAllocationQuery: async (batch, aQueryType, valueType, value, data, batch_id, master_data, status) => {

    const result = await prisma.$transaction(async (tx) => {

      if (!batch?.length && status !== false) throw new Error("No Users Found For Allocation!");

      let promises = [];


      if (status !== false) {

        for (const item of batch) {
          if (!item?.loan_number) continue;

          if (!item?.User.id) continue;
          promises.push(tx.soaCaseMapping.update({
            where: {
              loan_number: item?.loan_number
            },
            data: { co_id: item?.User?.id, udpated_at: new Date() }
          }))

        }

        const mapped = await Promise.all(promises);

      }


      console.log("VALUE TYPE", valueType, aQueryType, data, value)
      const updateAllocations = await tx.allocation[aQueryType]({
        where: {
          [valueType]: Number(value)
        },
        data: data
      });


      const updateMaster = await tx.allocationMaster.update({
        where: {
          id: Number(batch_id)
        },
        data: master_data
      });


      return updateMaster;

    });

    return result;

  },


  manualAllocateQueryMerge: async (existing_body, masterBody, allocateBody) => {


    const data = await prisma.$transaction(async (tx) => {

      const find_existing = await tx.allocation.findFirst({
        where: existing_body
      });

      if (find_existing?.status == 'in process') {

        throw new Error("Request Already Pending!");
      }

      const addMaster = await tx.allocationMaster.create({
        data: masterBody
      });

      const master_id = addMaster.id;

      if (!master_id) throw new Error("Error Allocating Master!");

      allocateBody.master_id = master_id;

      allocateBody.batch_id = master_id;

      const addAllocation = await tx.allocation.create({
        data: allocateBody
      });


      return addAllocation;


    });

    return data;
  },

  updateRulesAndConditions: async (rule_info, conditions, id) => {


    const data = await prisma.$transaction(async (tx) => {

      let batch_1 = [];      // if condition need to be updated

      let batch_2 = [];      // new condition adding


      let condition_copy = structuredClone(conditions);


      if (condition_copy && condition_copy?.length) {

        for (const data of condition_copy) {

          if (data?.id) {

            let modified = { ...data };

            delete modified.id;

            batch_1.push(tx.ruleConditions.update({
              where: {
                id: Number(data.id)
              },
              data: modified
            }))

            // batch_1.push(allocationQueries.updateTable('RuleConditions',data?.id,modified))

          }

          else {

            data.rule_id = Number(id);

            batch_2.push(tx.ruleConditions.create({
              data: data
            }))

            // batch_2.push(allocationQueries.createTable('RuleConditions',data))
          }
        }

      };

      const merged = [...batch_1, ...batch_2];


      let result = {};


      if (merged.length) {

        const data = await Promise.all(merged);

        console.log(data)

        if (data) result.message = "Successfully Updated!"

      }

      if (rule_info) {
        // const data = await allocationQueries.updateTable('AllocationRules',id,value?.["rule_info"]);

        const data = await tx.allocationRules.update({
          where: {
            id: Number(id)
          },
          data: rule_info
        });
        if (data) result.message = "Successfully Updated!"
      }

      return result;
    });

    return data;

  },

  updateReassignmentAndAllocation: async (batch, masterData) => {
    const data = prisma.$transaction(async (tx) => {

      if (!batch?.length) throw new Error("No Data recieved to update! Error Approving Request!");


      const master_table = await tx.allocationMaster.create({
        data: masterData
      });



      const sanitized_batch = batch.map((ele) => {

        let { table, method, where, data, master } = ele;

        let query = {};



        switch (method) {
          case ('create'):
            query.data = data;

            break;

          case ('update'):
            query.where = where;
            query.data = data;
            break;

          default:
            throw new Error("Error Approving Request - No Method Found!");
        }

        if (master == true) {
          query.data.batch_id = master_table.id
          query.data.master_id = master_table.id
        }

        console.log("TABLE-data", table, data)

        return tx[table][method](query)
      })

      return await Promise.all(sanitized_batch)

    });

    return data;
  },


  getFilteredCases: async (filters) => {


    let query_obj = {
      where: {

      }
    }


    if (filters.loan_number) {

      query_obj.where.loan_number = filters?.loan_number;
    }

    if (filters?.customer_name) {

      query_obj.where?.SoaApplicantDetail?.some ? query_obj.where.SoaApplicantDetail.some = {
        ...query_obj.where.soaApplicantDetail.some, ...{
          is_primary: true,
          first_name: filters.customer_name
        }
      } : query_obj.where.SoaApplicantDetail = {
        some: {
          is_primary: true,
          first_name: filters.customer_name
        }
      }
    }

    if (filters?.mobile_number) {
      query_obj.where?.SoaApplicantDetail?.some ? query_obj.where.SoaApplicantDetail.some = {
        ...query_obj.where.SoaApplicantDetail.some, ...{
          is_primary: true,
          mobile_number: filters.mobile_number
        }
      } : query_obj.where.soaApplicantDetail = {
        some: {
          is_primary: true,
          mobile_number: filters.mobile_number
        }
      }
    }


    if (filters?.application_id) {

      query_obj.where.application_id = filters?.application_id
    }


    if (filters?.co_emp_id) {

      query_obj.where.User = {
        employee_id: co_emp_id
      }
    }


    // include the required data for screen

    query_obj.select = {
      loan_number: true,
      id: true,
      application_id: true,
      loan_purpose: true,
      created_at: true,
      SoaApplicantDetail: {
        where: {
          is_primary: true
        },
        select: {
          id: true,
          first_name: true,
          middle_name: true,
          last_name: true,
          mobile_number: true
        }
      },
      User: {
        select: {
          name: true,
          employee_id: true,
          id: true
        }
      }
    }


    let caseData = await prisma.soaCaseMapping.findMany(query_obj);

    console.log("CASE", caseData)

    if (!caseData?.length) return [];

    let filtered = [];

    for (const item of caseData) {

      // fetch allocation data and sanitize data

      if (!item?.loan_number) continue;
      const allocation = await prisma.allocation.findFirst({
        where: {
          loan_number: item?.loan_number,
          active: true
        },
        orderBy: {
          id: "desc"
        }
      });


      if (!allocation || !['allocated', 'rejected'].includes(allocation?.status)) continue;

      let assigned_date = allocation?.updated_at;

      let newObj = {};

      console.log("REACHJ")

      for (const e in item) {

        if (!["SoaApplicantDetail", "User"].includes(e)) {

          newObj[e] = item[e]
        }

        if (e == "User") {
          newObj.co_id = item[e]?.id;
          newObj.co_name = item[e]?.name;
          newObj.co_emp_id = item[e]?.employee_id;

          newObj.Co_details = item[e]
        }

        if (e == "SoaApplicantDetail") {

          newObj.first_name = item[e]?.[0]?.first_name;
          newObj.middle_name = item[e]?.[0]?.middle_name;
          newObj.last_name = item[e]?.[0]?.last_name;
          newObj.mobile_number = item[e]?.[0]?.mobile_number;
        }
      }

      newObj.assigned_date = assigned_date || "";

      filtered.push(newObj)
    };

    return filtered

  },

  findReassignedList: async (query) => {


    let query_obj = { where: {} };

    if (query?.status) {
      query_obj.where = { ...query_obj.where, status: query?.status };
    }

    if (query?.id) {
      query_obj.where = { ...query_obj.where, id: Number(query?.id) };
    }


    // if date range selected



    if (query?.from && query?.to) {
      query_obj.where.created_at = {};
      if (query?.from) query_obj.where.created_at.gte = new Date(query?.from);
      if (query?.to) query_obj.where.created_at.lte = new Date(query?.to);
    }

    console.log("QUERY", query_obj)

    return await prisma.reAssignment.findMany(query_obj);
  },
  
  
  
  fetchSoaMoreInfo:async(loan)=>{

    const soaCase = await prisma.soaCaseMapping.findFirst({
      where:{
        loan_number:loan
      },
      select:{
        SoaApplicantDetail:{
          select:{
              id:true,
              first_name:true,
              email:true,
              mobile_number:true,
              SoaAddressDetail:{
                id:true,
                address_line1:true,
                address_line2:true,
                address_line3:true,
                city:true,
                state:true,
                pincode:true,
                geo_lat:true,
                geo_long:true
              }
          }
        },
        sanctioned_amount:true,
        loan_tenure:true,
        rate_of_interest:true,
        disbursed_amount:true,
        SoaEmiMapping:{
          select:{
            id:true,
            due_for_month:true,
            arrear_emi:true,
            bounce_charges:true,
            arrear_bounce_emi:true,
            cash_handling_charges:true,
            lpp_charges:true,
            visit_charges:true
          }
        },
        SoaPropertyDetail:{
          id:true,
          property_address:true,
          property_pincode:true,
          state:true,
          city:true
        },
        PaymentCollect:{
          id:true,
          payment_date:true,
          amount:true,
          payment_type:true,
          status:true,
          payment_mode:true,
          gateway_verify_transaction_id:true
        }
      }
    });


    if(!soaCase) throw new Error("No Loan Info Found!");

    return soaCase;
    
  }
};


module.exports = main;