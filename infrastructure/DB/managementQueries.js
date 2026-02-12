
const prisma = require('../../prisma/global');

const months = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december"
];


const main = {

  soafindFirst: async (where, select) => {    // need refinement **

    let data;

    if (select) {
      data = await prisma.SoaCaseMapping.findFirst({
        where: where,
        select: select
      });
    }

    else {

      data = await prisma.SoaCaseMapping.findFirst({
        where: where
      });

    }

    return data;

  },

  soaFindSpecific: async (where) => {

    return await prisma.soaCaseMapping.findFirst(where)
  },



  findUserbyId: async (id) => {

    const data = await prisma.user.findUnique({
      where: {
        id: id
      }
    })

    return data;
  },

  findUniqueUser: async (username) => {

    const data = await prisma.user.findFirst({
      where: {
        username: username
      },
      include: {
        UserRoles: {
          select: {
            RoleMaster: true
          },

        }
      }
    });

    if (data && data?.UserRoles?.length) {

      const roles = data?.UserRoles

      for (const role of roles) {


        role.role_info = role.RoleMaster;

        delete role.RoleMaster

        // get removed permissons

        const removed_permissons = await prisma.permissionMapping.findMany({
          where: {
            type_id: Number(data.id),
            map_type: "user",
            status: true
          },
          select: {
            id: true,
            permission_id: true
          }
        });

        const permissons = await prisma.permissionMapping.findMany({
          where: {
            type_id: role.role_info.id,
            map_type: "role",
            status: true,
            permission_id: {
              notIn: removed_permissons.map((ele) => ele?.permission_id)
            }
          },
          select: {
            PermissionMaster: true
          }
        });

        role.permissons = permissons;
      }
    }


    return data;
  },

  findUserSpecific: async (id, queries) => {


    let query_obj = { where: { id: Number(id) } };




    query_obj.include = {
      UserRoles: {
        where: {
          role_id: queries.role_id,
          status: 1
        },
        select: {
          RoleMaster: true
        }
      },
      UserMapping: {
        select: {
          manager_code: true
        }
      },
      BranchMapping:{
         where:{
          is_active:true
        },
        select:{
          id:true,
          user_id:true,
          BranchMaster:{
            select:{
              id:true,
              branch_name:true
            }
          }
        }
      }
    }

    let data = await prisma.user.findUnique(query_obj);


    let excludedPermissons = await prisma.permissionMapping.findMany({
      where: {
        type_id: Number(id),
        map_type: "user",
        status: true
      },
      include: {
        PermissionMaster: true
      }
    });

    excludedPermissons = excludedPermissons.map((item) => {
      return { id: item.id, permission_id: item.permission_id, name: item?.PermissionMaster?.name }
    })

    data.UserRoles = data.UserRoles.map((role) => {

      let obj = role.RoleMaster;

      return obj
    });

    data.managerEmployeeCode = data?.UserMapping?.[0]?.manager_code || null;


      data.branches = data?.BranchMapping?.map((bm)=>{
    return bm?.BranchMaster?.id
  })

  if(data?.BranchMapping)   delete data.BranchMapping;

    return { ...data, restricted_permissons: excludedPermissons }

  },

  findSesssions: async (id) => {

    const data = await prisma.userSessions.findMany({
      where: {
        user_id: Number(id),
        active: true,
        logged_out_at: null
      }
    })

    return data;

  },

  updateUser: async (id, data) => {
    const result = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: data
    });

    return result;
  },

  updateSessions: async (id, data) => {

    const result = await prisma.userSessions.updateMany({
      where: {
        user_id: Number(id),
      },
      data: data
    })

    return result;
  },

  createSession: async (data) => {
    const result = await prisma.userSessions.create({
      data: data
    });

    return result;
  },


  updateSessionsToken: async (id, token, data, data2) => {
    try {
      const [result1, result2] = await prisma.$transaction([
        prisma.userSessions.updateMany({
          where: {
            user_id: Number(id),
            token: {
              not: token,
            },
          },
          data: data,
        }),
        prisma.userSessions.update({
          where: {
            token: token,
          },
          data: data2,
        }),
      ]);

      return { result1, result2 };
    } catch (err) {
      // If any operation fails, both will be rolled back
      console.error('Transaction failed:', err);
      throw err;
    }
  },


  getPermissonBytext: async (text) => {

    return await prisma.permissionMaster.findFirst({
      where: {
        name: text
      }
    })
  },

  getMappingExcluded: async (id, permission_id) => {

    const data = await prisma.permissionMapping.findFirst({
      where: {
        type_id: Number(id),
        permission_id: Number(permission_id),
        map_type: "user",
        status: true
      }
    });

    return data?.id ? data : null
  },

  getReports: async (model, where, skip, take, from, to, type, sub_type, body) => {


    let query_obj = { where: where || {} };

    let exclude = false;


    switch (type) {

      case ('follow_ups'):

        let sub = sub_type || 'normal';

        let include = null;

        if (sub_type == 'archive') {
          query_obj.where.status = { not: 'pending' };
        }

        else if (sub_type == 'dashboard') {   // only take numbers and return ** for dashboard charts


          query_obj.select = {
            status: true,
            loan_number: true,
            ptp_mode: true,
            ptp_amount: true,
            SoaCaseMapping: {
              select: {
                bucket: true,
                SoaEmiMapping: true
              }
            }
          };

          if (from && to && !exclude) {

            query_obj.where.created_at = {};
            query_obj.where.created_at.lte = new Date(to);
            query_obj.where.created_at.gte = new Date(from);

          };



          console.log("QUERY", query_obj)

          return await prisma[model].findMany(query_obj)

        }
        else {
          query_obj.where.status = 'pending'
        }

        if (body?.branch_id || body?.employee_id) {

          let incldueQuery = {};
          body?.branch_id ? incldueQuery.branch_id = { in: body?.branch_id } : incldueQuery;

          body?.employee_id ? incldueQuery.employee_id = { in: body?.employee_id || [] } : incldueQuery;

          !query_obj.where.User ? query_obj.where.User = incldueQuery : query_obj.where.User = { ...query_obj.where.User, ...incldueQuery }

          //   query_obj.include = {SoaCaseMapping:
          //     {select:
          //     {SoaApplicantDetail:{
          //       select:{
          //         first_name:true,
          //         mobile_number:true,

          //       }
          //     },
          //       User:true,
          //       BranchMaster:{
          //         select:{
          //           branch_name
          //         }
          //       },
          //               loan_number:true,
          //   bucket:true,
          //     },

          //   }
          // }
        }

        if (body?.loan_number) {  // filters refer to SOA table
          let incldueQuery = {};
          body?.loan_number ? incldueQuery.loan_number = body?.loan_number : incldueQuery;

          query_obj.where.SoaCaseMapping = incldueQuery
        }

        !query_obj.include ? query_obj.include = {
          SoaCaseMapping:
          {
            select:
            {
              SoaApplicantDetail: {
                where: { is_primary: true },
                select: {
                  first_name: true,
                  mobile_number: true,

                }
              },
              User: {
                select: {
                  employee_id: true,
                  BranchMapping:{
                    where:{
                      is_active:true
                    },
                    select:{
      BranchMaster: {
                    select: {
                      branch_name: true,
                      id:true
                    }
                  },
                    }
                  }
                }
              },

              loan_number: true,
              bucket: true,
              SoaEmiMapping: {
                select: {
                  emi_pemi_dues: true
                }
              }
            }
          }
        } : query_obj.include = {
          ...query_obj.include, ...{
            SoaCaseMapping:
            {
              select:
              {
                SoaApplicantDetail: {
                  where: { is_primary: true }, select: {
                    first_name: true,
                    mobile_number: true,

                  }
                },
                User: {
                  select: {
                    employee_id: true,
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
                    }
                  }
                },
                loan_number: true,
                bucket: true,
                SoaEmiMapping: {
                  select: {
                    emi_pemi_dues: true
                  }
                }
              }
            }
          }
        }


        if (body?.customer_name || body?.mobile_number) {   // filters refer to Soa Applicant Table
          let incldueQuery = {};
          body?.customer_name ? incldueQuery.first_name = body?.customer_name : incldueQuery;
          body?.mobile_number ? incldueQuery.mobile_number = body?.mobile_number : incldueQuery;

          const case_included = query_obj?.where?.SoaCaseMapping ? true : false;

          !case_included ? query_obj.where.SoaCaseMapping = {
            is: {
              SoaApplicantDetail: {
                some: {
                  ...incldueQuery
                }
              }
            }
          } : query_obj.where.SoaCaseMapping = { ...query_obj.where.SoaCaseMapping, ...{ SoaApplicantDetail: { some: incldueQuery } } }

          // query_obj.include = !include?incldueQuery:include = {...include,...incldueQuery}
        }


        break;

      case ('user'):

        const sub_1 = sub_type || "normal"

        if (sub_1 == 'count') {
          query_obj.select = { id: true, status: true, created_at: true }

          let innerQuery = {};

          if (!body?.range) throw new Error("No Default Range Provided!")

          let monthName = body?.range?.split(" ")?.[0]

          let year = body?.range?.split(" ")?.[1]

          console.log("MONBTH", monthName)

          // monthName = months.indexOf(monthName.toLowerCase()) + 1
          const monthIndex = months.indexOf(monthName.toLowerCase());
          if (monthIndex === -1) throw new Error("Invalid month");

          const start = new Date(Number(year), monthIndex, 1, 0, 0, 0); // 1st day of month
          const end = new Date(Number(year), monthIndex + 1, 1, 0, 0, 0); // first day of next month

          console.log("START END", start, end)
          innerQuery.created_at = { gte: start, lt: end };

          query_obj.where = innerQuery;


        }

        else {

          if (body?.status) query_obj.where.status = body.status;

          if (body?.user_name) query_obj.where.employee_id = {
            in: body?.user_name || []
          }

          query_obj.select = {
            created_at: true,
            email_id: true,
            employee_id: true,
            status: true
          }



        }

        break;
      case ('payment'):


        if (body?.loan_number) query_obj.where.loan_number = body.loan_number;

        if (body?.mobile_number) query_obj.where.mobile_number = body.mobile_number;

        if (body?.status) query_obj.where.status = body.status;

        if (body?.user_name) {

          query_obj.where.SoaCaseMapping = {
            User: {
              employee_id: { in: body?.user_name || [] }
            }
          }
        }


        query_obj.select = {
          SoaCaseMapping: {
            select: {
              User: {
                select: {
                  email_id: true,
                  employee_id: true,
                  BranchMapping:{
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
                  }
                }
              },
              id: true
            },
          },


          payment_mode: true,
          amount: true,
          invoice_number: true,
          status: true,
          mobile_number: true,
          loan_number: true,
          is_reciept_generated: true,
          receipt_number: true,
          order_id: true,
          qr_expiry_time: true,
          merchant_request_number: true
        }


        if (sub_type == 'dashboard') {    // dashboard chat data filter ** payment

          query_obj.where = {
            payment_mode: 'Digital',
            status: {
              in: ['completed', 'failed']
            }
          };


          // if (from && to) {
          //   query_obj.where = {
          // gte: new Date(from),
          // lte: new Date(to)
          //   }
          // }

          query_obj.select = {
            status: true,
            amount: true,
            is_reciept_generated: true,
            qr_code: true,
            payment_link: true
          }

        }

        break;

      case ('attendance'):


        let sub_4 = sub_type || "normal"

        if (sub_4 == "details") {

          const attendance_id = body?.id;

          if (!attendance_id) throw new Error("No Data Found!");

          model = 'hourlyLog';

          console.log("EXECUTED!")

          query_obj.where.attendance_log_id = attendance_id;
        }

        else if (sub_4 == 'dashboard') {

          // specific for dashboard chart **

          query_obj.select = {
            co_id: true,
            created_at: true,
            HourlyLog: {
              select: {
                active: true,
                attendance_log_id: true,
                geo_lat: true,
                geo_long: true
              }
            }
          }
        }

        else {


          if (body?.user_name || body?.status) {

            let user = [];

            if (body?.user_name) {

              user = await prisma.user.findMany({
                where: {
                  employee_id: { in: body?.user_name || [] }
                }
              });

            }


            if (!user && body?.user_name) throw new Error("No User Found!");

            if (body?.user_name) query_obj.where.co_id = { in: user.map((item) => item?.id) || [] }

            if (body?.status) query_obj.where = { ...query_obj.where, active: body?.status == 'Active' ? true : false }

            // query_obj.where.co_id = user.id;
          };

          query_obj.include = {
            User: {
              select: {
                name: true,
                employee_id: true,
                email_id: true,
              }
            },
            HourlyLog: {
              select: {
                geo_lat: true,
                geo_long: true,
                punch_time: true,
                created_at: true,
                active: true
              }
            }
          }


        }

        break;

      case ('collection'):

        let innerQuery = {};

        if (from && to) {
          query_obj.where.updated_at = {
            gte: new Date(from),
            lte: new Date(to)
          };

          exclude = true;

        }


        // for dashboard data : - 

        if (sub_type == 'dashboard') {

          query_obj.select = {
            amount: true,
            status: true,
            cash_handling_charges: true,
            payment_mode: true,
            loan_number: true,
            payment_date: true,
            SoaCaseMapping: {
              select: {
                bucket: true,
                SoaEmiMapping: {
                  select: {
                    bounce_charges: true,
                    visit_charges: true,
                    odi_charges: true,
                    charges_for_month: true,
                    arrear_emi: true
                  }
                }
              }
            }
          }
        }

        if (body?.user_name) {
          query_obj?.where?.SoaCaseMapping ? { ...query_obj.where.soaCaseMapping, User: { employee_id: { in: body?.user_name || [] } } } : query_obj.where = { ...query_obj.where, SoaCaseMapping: { User: { employee_id: { in: body?.user_name || [] } } } }
        }

        if (body?.branch_name) {
          innerQuery?.SoaCaseMapping ? { ...innerQuery.SoaCaseMapping, branch_id: { in: body?.branch_name } } : innerQuery = { ...innerQuery, SoaCaseMapping: { branch_id: { in: body?.branch_name } } }
        }

        if (body?.payment_type) {
          innerQuery.payment_mode = body?.payment_type
        }

        if (body?.primary_mobile_number) {
          if (innerQuery?.SoaCaseMapping) {
            innerQuery = {
              ...innerQuery,
              SoaCaseMapping: {
                ...innerQuery.SoaCaseMapping,
                SoaApplicantDetail: {
                  some: {
                    is_primary: true,
                    mobile_number: body.primary_mobile_number
                  }
                }
              }
            };
          } else {
            innerQuery = {
              ...innerQuery,
              SoaCaseMapping: {
                SoaApplicantDetail: {
                  some: { is_primary: true, mobile_number: body.primary_mobile_number }
                }
              }
            };
          }
        }


        if (body?.customer_name) {
          innerQuery?.SoaCaseMapping ? { ...innerQuery.soaCaseMapping, SoaApplicantDetail: { some: { is_primary: true, first_name: body?.customer_name } } } : innerQuery = { ...innerQuery, SoaCaseMapping: { SoaApplicantDetail: { some: { is_primary: true, first_name: body?.customer_name } } } }
        }


        query_obj.where = query_obj.where ? { ...query_obj.where, ...innerQuery } : innerQuery

        if (sub_type != 'dashboard') {
          query_obj.select = {

            SoaCaseMapping: {
              select:
              {
                bucket: true,
                dpd_opening: true,
                SoaApplicantDetail: {
                  where: {
                    is_primary: true,
                  },
                  select: {
                    is_primary: true,
                    first_name: true,
                    mobile_number: true,
                  }
                },
                SoaEmiMapping: {
                  select: {
                    id: true,
                    emi_for_month: true,
                    due_for_month: true,
                    charges_for_month: true,
                    arrear_emi: true,
                    arrear_bounce_emi: true,
                    future_emi: true,
                    total_payment: true,
                    visit_charges: true,
                    odi_charges: true
                  }
                },
                User: {
                  select: {
                    email_id: true,
                    employee_id: true,
                    mobile_number: true,
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
                    }
                  }
                }
              }
            },
            invoice_number: true,
            receipt_number: true,
            gateway_verify_transaction_time: true,
            loan_number: true,
            payment_mode: true,
            created_at: true,
            gateway_verify_transaction_id: true,
            payment_mode: true,
            updated_at: true,
            status: true,
            amount: true,
            cheque_number: true,
            geo_lat: true,
            geo_long: true,
            cash_handling_charges: true,
            bounce_charges: true
          }
        }

        //  query_obj.select = {
        //   invoice_number:true,
        //   receipt_number:true,
        //   gateway_verify_transaction_time:true,
        //   loan_number:true,
        //   created_at:true,
        //   status:true,
        //   SoaCaseMapping:{
        //     select:{
        //       bucket:true,
        //       dpd_opening:true,
        //       SoaApplicantDetail:{
        //         where:{
        //           is_primary:true,
        //         },
        //         select:{
        //           is_primary:true,
        //           first_name:true,
        //           mobile_number:true
        //         }
        //       },
        //       SoaEmiMapping:{
        //         select:{
        //           emi_for_month:true,
        //           due_for_month:true,
        //           charges_for_month:true,
        //           arrear_emi:true,
        // arrear_bounce_emi:true,
        // future_emi:true,
        // total_payment:true
        //         }
        //       }
        //     }
        //   }
        //  }


        break;

    }




    if (skip && take) {
      query_obj.skip = Number(skip);
      query_obj.take = Number(take);
    }

    if ((to || from) && !exclude) {
      query_obj.where.created_at = {};

      if (from) {
        query_obj.where.created_at.gte = new Date(from);
      }

      if (to) {
        query_obj.where.created_at.lte = new Date(to);
      }
    }
    console.log("QUERY", JSON.stringify(query_obj))

    return await prisma[model].findMany(query_obj)
  },





}





module.exports = main;