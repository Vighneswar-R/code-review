const prisma = require('../../prisma/global');

const { role_names } = require('../../domain/namings');


const sf_helper = require('../Salesforce/index')


const main = {

  updateUser: async (id, data) => {


    return await prisma.user.update({
      where: {
        id: Number(id)
      },
      data: data
    })


  },

  // getUser:async(username)=>{

  //     return await prisma.user.findFirst({
  //         where:{
  //             username:username
  //         }
  //     })
  // },
  getUser: async (value,type) => {

    
    let whereClause = {};

    if(type == "email"){
      key = "email_id"
    }

    else{
      key = "username"
    }

    const data = await prisma.user.findFirst({
      where: {
        [key]: value
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




  getUserByEmail: async (email) => {

    const data = await prisma.user.findFirst({
      where: {
        email: email
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
            map_type: "user"
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

  getSessions: async (id) => {

    return await prisma.userSessions.findMany({
      where: {
        user_id: Number(id),
        active: true,
        logged_out_at: null
      }
    })

  },

  getAttendance: async (id, date) => {

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.userAttendanceLog.findFirst({
      where: {
        co_id: Number(id),
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      }
    })
  },

  createPunchIn: async (data) => {

    return await prisma.hourlyLog.create({ data: data })

  },

  getUserById: async (id) => {
    return await prisma.user.findUnique({
      where: {
        id: Number(id)
      }
    })
  },

  createSession: async (data) => {
    return await prisma.userSessions.create({
      data: data
    })
  },

  createSingle: async (model, data) => {

    console.log("MODEL", data);

    if (model == 'collectionFollowUp') {

      const existing_case = await prisma.soaCaseMapping.findFirst({
        where: {
          loan_number: data.loan_number
        }
      });

      if (!existing_case) throw new Error("No Case Found!");

      data.case_id = existing_case?.id;
    }

    return await prisma[model].create({ data: data })
  },

  log_attenance: async (data) => {

    const id = data.co_id;


    const data_final = await prisma.$transaction(async(tx)=>{
    const existing = await tx.userAttendanceLog.findFirst({
      where: {
        co_id: Number(id),
        created_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // today 00:00:00
          lt: new Date(new Date().setHours(23, 59, 59, 999)), // today 23:59:59
        },
      }
    });

    if(existing) throw new Error("Attendance Already Marked For Today");


    const marked = await tx.userAttendanceLog.create({ data: data });

    // add to salesforce

    let sf_body = {};

    const sf_add = await sf_helper.add_attendance(sf_body);

    return marked;

    })


    return data_final;

  },


  findFirst: async (model, where) => {
    return await prisma[model].findFirst({ where: where });
  },

  findReassignmentRaw: async (loan_number) => {
    const data = await prisma.$queryRaw`
    SELECT
      r.id AS id,
      r.loan_number AS loan_number,
      r.case_id AS case_id,
      r.co_id AS co_id,
      r.status AS status,
      a.id AS allocation_id,
      a.active AS allocation_active,
      json_build_object(
        'id', a.id,
        'loan_number', a.loan_number,
        'active', a.active
      ) AS allocation_details
    FROM Reassignment r
    INNER JOIN Allocation a
      ON a.loan_number = r.loan_number
      AND a.active = true
    WHERE r.status = 'pending'
      AND r.loan_number = ${loan_number};
  `;

    return data;

  },

  findCaseList: async (id, type, sub_type, skip, take, from, to, team, mapped, member_id) => {


    let table = 'SoaCaseMapping';

    let queryObj = {
      where: {
        co_id: Number(id)
      },
      include: {
        SoaApplicantDetail: {
          where: {
            is_primary: true
          },
          select: {
            first_name: true,
            middle_name: true,
            last_name: true,
            mobile_number:true
          }
        },
        SoaEmiMapping: true,
        PaymentCollect: {
          where: {
            payment_mode: "cash",
            OR: [
              { status: { notIn: ["Completed", "Failed"] } },
              { status: null },
            ],
            created_at: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(24, 0, 0, 0)),
            },
          },
          select: {
            id: true,
            amount: true
          }
        }
      },
      skip: Number(skip) || 0,
      ...(take ? { take: Number(take) } : {})
    }



    // if team data to be shows

    if (team == "true") {

      if (!mapped?.length) return [];

      queryObj.where.co_id = { in: mapped.map((i) => i.id) }
    }

    if (member_id?.length) {
      // specific case of team member! 

      const team_user = await prisma.user.findFirst({
        where: {
          employee_id: member_id
        }
      });

      if (!team_user?.id) throw new Error("Invalid Team Member!");

      queryObj.where.co_id = team_user.id;

    }

    switch (type) {

      case ('bucket'):

        // queryObj.where.bucket = sub_type;

        if (from || to) {
          queryObj.created_at = {};
          if (from) queryObj.created_at.gte = new Date(from);
          if (to) queryObj.created_at.lte = new Date(to);
        }


        break;

      case ('incentive'):

        if (from || to) {
          queryObj.created_at = {};
          if (from) queryObj.created_at.gte = new Date(from);
          if (to) queryObj.created_at.lte = new Date(to);
        }

        queryObj.orderBy = { incentive: 'desc' }

        break;

      case ('follow_up'):

        table = 'CollectionFollowUp'
        queryObj = {
          where: {
            co_id: Number(id)
          },
          include: {
            SoaCaseMapping: {
              include: {
                SoaApplicantDetail: {
                  where: {
                    is_primary: true
                  },
                  select: {
                    first_name: true,
                    middle_name: true,
                    last_name: true
                  }
                },
                SoaEmiMapping: true,
              }
            }
          }
        }

        if (from || to) {
          queryObj.created_at = {};
          if (from) queryObj.created_at.gte = new Date(from);
          if (to) queryObj.created_at.lte = new Date(to);
        }

    }

    console.log("QUErY OBJ", queryObj)

    return await prisma[table].findMany(queryObj)

  },

  findCaseNumbers: async (id, from, to, team, mapped, member_id) => {

    let whereClause = {
      where: { co_id: Number(id) },
      include: {
        CollectionFollowUp: {
          select: { id: true }
        }
      }
    }

    if (from || to) {
      whereClause.created_at = {};
      if (from) whereClause.created_at.gte = new Date(from);
      if (to) whereClause.created_at.lte = new Date(to);
    }


    if (team == "true") {

      if (!mapped?.length) return {
        total_cases: 0,
        follow_up: 0
      };

      whereClause.where.co_id = { in: mapped.map((i) => i.id) }
    }

    if(member_id?.length){
        const team_user = await prisma.user.findFirst({
        where: {
          employee_id: member_id
        }
      });

      if (!team_user?.id) throw new Error("Invalid Team Member!");

      whereClause.where.co_id = team_user.id;
    }

    const total_cases = await prisma.soaCaseMapping.findMany(whereClause);

    console.log("TOTAL CASES LENGH", whereClause)

    const follow_up_number = total_cases.reduce(
      (acc, item) => acc + (item.CollectionFollowUp?.length ? 1 : 0),
      0
    );

    console.log("QUERY", whereClause)

    return {
      total_cases: total_cases.length,
      follow_up: follow_up_number
    };
  },



  getCaseData: async (loan) => {

    const data = await prisma.soaCaseMapping.findFirst({
      where: {
        loan_number: loan
      },
      include: {
        SoaApplicantDetail: {
          include: {
            SoaAddressDetail: true,
          }
        },
        SoaEmiMapping: true,
        SoaReferenceDetail: true,
        SoaPropertyDetail: true,
        SoaBankingDetails: true,
        SoaAdditionalAddressMapping: true,
        PaymentCollect:{
          where:{
            status:"completed"
          },
          select:{
            id:true,
            mobile_number:true,
            updated_at:true
          },
          orderBy:{
            id:'desc'
          },
          take:1
        },
        CollectionFollowUp:{
          where:{
            follow_up_type:'Call',
            status:'completed'
          },
          select:{
            id:true,
            follow_up_date_time:true,
            contact:true
          },
          orderBy:{
            id:'desc'
          },
          take:1
        }
      }
    });

    // identify latest used mobile **

    let latest_contact = null;

    if(data?.PaymentCollect?.length && data?.CollectionFollowUp?.length){

      let pdate = data?.PaymentCollect?.[0]?.updated_at;

      let fdate = data?.CollectionFollowUp?.[0]?.follow_up_date_time;


  const paymentDate = new Date(pdate);
  const followupDate = new Date(fdate);

   if (paymentDate > followupDate) {
    latest_contact = data?.PaymentCollect?.[0]?.mobile_number;
  } else {
    latest_contact = data?.CollectionFollowUp?.[0]?.mobile_number;
  }
    }

    else{

      console.log("YESY",data?.CollectionFollowUp)
      latest_contact = data?.PaymentCollect?.[0]?.mobile_number || data?.CollectionFollowUp?.[0]?.contact || null
    }
    

    data.latest_contact = latest_contact;

    


    return data;
  },

  findCaseListCombinedBcp: async (id) => {

    return ""   // temp

  },

  findExistingBCP: async (type) => {

    return await prisma.bcpCollection.findFirst({
      where: {
        type: type
      },
      select: {
        type_id: true
      }
    })
  },

  // nearbyCases:async(id,lat,lon) =>{

  //     return await prisma.soaCaseMapping.findMany({
  //         where:{
  //             co_id:Number(id)
  //         },
  //         include:{
  //             SoaApplicantDetail:{
  //                 where:{
  //                     is_primary:true
  //                 },
  //                 include:{
  //                     SoaAddressDetail:{
  //                         where:{

  //                         }
  //                     }
  //                 }
  //             }
  //         }
  //     })

  // }

  nearbyCases: async (id, lat, lon, radiusKm = 6) => {
    const cases = await prisma.$queryRawUnsafe(`
  SELECT scm.*, sad.geo_lat, sad.geo_long
  FROM SoaCaseMapping AS scm
  JOIN SoaApplicantDetail AS sadet ON scm.id = sadet.case_id
  JOIN SoaAddressDetail AS sad ON sadet.id = sad.applicant_id
  WHERE scm.co_id = ${Number(id)}
    AND sadet.is_primary = TRUE
    AND (
      6371 * ACOS(
        COS(RADIANS(${lat})) * COS(RADIANS(CAST(sad.geo_lat AS DECIMAL(10,6)))) *
        COS(RADIANS(CAST(sad.geo_long AS DECIMAL(10,6))) - RADIANS(${lon})) +
        SIN(RADIANS(${lat})) * SIN(RADIANS(CAST(sad.geo_lat AS DECIMAL(10,6))))
      )
    ) < ${radiusKm};
`);
    return cases;
  },

  updateTable: async (model, id, data) => {

    return await prisma[model].update({ where: { id: Number(id) }, data: data })

  },


  getOldSoaCaseData: async (loan) => {

    return await prisma.soaMappingOld.findFirst({ where: { LAN: loan } });

  },


  getOldSoaCaseDataList: async (id) => {


    const user = await prisma.user.findUnique({
      where: {
        id: Number(id)
      },
      select: {
        id: true,
        employee_id: true
      }
    });

    return await prisma.soaMappingOld.findFirst({
      where: {
        OR: [{ USER_NAME: user.employee_id }, { USER_ACCOUNT_ID: Number(id) }]
      }
    });

  },


  getSoaApplicant: async (id) => {
    return await prisma.soaApplicantDetail.findUnique({ where: { id: Number(id) } })
  },

  getCollectionData: async (id, from, to, team, mapped,member_id) => {


    let whereClause = {
      where: {
        id: Number(id)
      },
      include: {
        SoaCaseMapping: {
          select: {
            id: true,
            loan_number: true,
            SoaEmiMapping: {
              select: {
                id: true,
                due_for_month: true,
                updated_at: true
              }
            }
          }
        }
      }
    };

    if (from || to) {
      whereClause.created_at = {};
      if (from) whereClause.created_at.gte = new Date(from);
      if (to) whereClause.created_at.lte = new Date(to);
    }


    if (team == "true") {

    if (!mapped?.length) return { total: 0, pending: 0, collected: 0 };

      whereClause.where.id = { in: mapped.map((i) => i.id) }
    }

   if(member_id?.length){
               const team_user = await prisma.user.findFirst({
        where: {
          employee_id: member_id
        }
      });

      if (!team_user?.id) throw new Error("Invalid Team Member!");

      whereClause.where.id = team_user.id;
    }

    let data = await prisma.user.findMany(whereClause);

    data = data?.[0];

    if (!data) return {};


    let counts = { total: 0, pending: 0, collected: 0 };

    for (const items of data.SoaCaseMapping) {

      const emi_mapping = items.SoaEmiMapping?.[0]

      console.log("EMI", emi_mapping);

      if (!emi_mapping) continue


      counts.total = counts.total + Number(emi_mapping?.due_for_month)    // adding to total amount for cases this month

      // find collected amount

      console.log("HERE HHH")

      function getMonthWiseData() {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);               // 1st date of this month
        startOfMonth.setHours(0, 0, 0, 0);     // 00:00:00.000

        const now = new Date();                // current date & time

        return {
          gte: startOfMonth,
          lte: now,
        }
      }



      const paymentCollect = await prisma.paymentCollect.findMany({
        where: {
          loan_number: items.loan_number,
          // month:getMonthNumberFromDate(emi_mapping?.updated_at),
          updated_at: getMonthWiseData(),
          status: "completed"
        }
      });

      if (!paymentCollect?.length) continue;

      const total = paymentCollect.reduce((sum, item) => {
        return sum + Number(item.amount || 0);
      }, 0);

      console.log("TOTAL AM", total)

      counts.collected = counts.collected + total;
    };

    counts.pending = (counts.total - counts.collected).toLocaleString('en-Us')

    counts.total = counts.total.toLocaleString('en-Us')

    counts.collected = counts.collected.toLocaleString('en-Us')


    return counts;
  },


  findAddressForApplicant: async (applicant_id) => {

    return await prisma.soaAddressDetail.findFirst({ where: { applicant_id: Number(applicant_id) } });
  },


  getPunchTimeline: async (id) => {


    const startOfDay = new Date(new Date());
    startOfDay.setHours(0, 0, 0, 0);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(new Date());
    endOfDay.setHours(23, 59, 59, 999);


    const attendance = await prisma.userAttendanceLog.findFirst({
      where: {
        co_id: Number(id),
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      }
    });


    if (!attendance?.id) throw new Error("No Attendance Marked For Today!");

    const timeline = await prisma.hourlyLog.findMany({
      where: {
        attendance_log_id: Number(attendance.id)
      }
    });

    return timeline;
  },


  getFollowUpDetails: async (id, type) => {

    let result = [];

    const now = new Date();

    // Get first and last day of current month
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    switch (type) {

      case ('completed'):

        result = await prisma.collectionFollowUp.findMany({
          where: {
            co_id: Number(id),
            follow_up_date_time: {
              gte: firstDay,
              lte: lastDay,
            },
            status: 'completed'
          },
          select: {
            SoaCaseMapping: {
              select: {
                id: true,
                loan_number: true,
                SoaApplicantDetail: {
                  where: {
                    is_primary: true
                  },
                  select: {
                    mobile_number: true,
                    first_name: true
                  }
                },
                SoaEmiMapping: {
                  select: {
                    due_for_month: true,
                    total_dues_ftm: true
                  }
                }
              }
            }
          }
        })

        break;

      case ('today'):

        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        result = await prisma.collectionFollowUp.findMany({
          where: {
            co_id: Number(id),
            follow_up_date_time: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          select: {
            SoaCaseMapping: {
              select: {
                id: true,
                loan_number: true,
                SoaApplicantDetail: {
                  where: {
                    is_primary: true
                  },
                  select: {
                    mobile_number: true,
                    first_name: true
                  }
                },
                SoaEmiMapping: {
                  select: {
                    due_for_month: true,
                    total_dues_ftm: true
                  }
                }
              }
            }
          }
        });

        break;

      case ('upcoming'):
        const startOfTomorrow = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1, // tomorrow
          0, 0, 0, 0
        );

        console.log(startOfTomorrow)

        result = await prisma.collectionFollowUp.findMany({
          where: {
            co_id: Number(id),
            follow_up_date_time: {
              gte: startOfTomorrow,
            },

          },
          select: {
            SoaCaseMapping: {
              select: {
                id: true,
                loan_number: true,
                SoaApplicantDetail: {
                  where: {
                    is_primary: true
                  },
                  select: {
                    mobile_number: true,
                    first_name: true
                  }
                },
                SoaEmiMapping: {
                  select: {
                    due_for_month: true,
                    total_dues_ftm: true
                  }
                }
              }
            }
          }
        });

        break;

      default:
        throw new Error("Invalid Query!")
    }

    return result || [];

  },


  findEfficiency: async (id) => {

    const now = new Date();

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const user = await prisma.user.findUnique({
      where: {
        id: Number(id)
      },
      select: {
        UserAttendanceLog: {
          where: {
            created_at: {
              gte: startOfDay,
              lte: endOfDay,
            }
          },
          select: {
            HourlyLog: {
              select: {
                geo_lat: true,
                geo_long: true,
                active: true
              }
            }
          }
        },
        CollectionFollowUp: {
          where: {
            follow_up_date_time: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          select: {
            follow_up_date_time: true,
            id: true,
            loan_number: true,
            current_follow_up: true
          }
        }
      }
    })

    console.log("START", startOfDay, "end", endOfDay)

    // get collected amount based on payment details

    const paymentData = await prisma.paymentCollect.findMany({
      where: {
        OR: [{
          payment_date: {
            gte: startOfDay,
            lte: endOfDay,
          }
        }, {
          gateway_verify_transaction_time: {
            gte: startOfDay?.toISOString(),
            lte: endOfDay?.toISOString(),
          }
        }],
        SoaCaseMapping: {
          co_id: user.id
        }
      },
      select: {
        id: true,
        status: true,
        payment_date: true,
        gateway_verify_transaction_time: true,
        amount: true
      }
    });

    return { user: user, paymentData: paymentData }
  },


  getLegalCases: async (id, from, to) => {

    let query = {
      where: {
        SoaCaseMapping: {
          co_id: Number(id)
        }
      },
      select: {
        id: true,
        legal_status_id: true,
        LegalMaster: {
          select: {
            stage_name: true
          }
        },
        SoaCaseMapping: {
          select: {
            loan_number: true,
            SoaApplicantDetail: {
              where: {
                is_primary: true
              },
              select: {
                first_name: true,
                mobile_number: true
              }
            },
            SoaEmiMapping: {
              select: {
                due_for_month: true,
                total_dues_ftm: true,
                foreclosure_charges: true
              }
            }
          }
        },
      }
    };

    if (from && to) {
      query.where.updated_at = {
        gte: new Date(from),
        lte: new Date(to),
      }
    }

    const data = await prisma.legalCases.findMany(query)

    return data
  },


  getLegalCase: async (id) => {

    const data = await prisma.legalCases.findFirst({
      where: {
        id: Number(id)
      },
      select: {
        loan_number: true,
        legal_status_id: true,
        contact: true,
        remarks: true,
        LegalMaster: {
          select: {
            stage_name: true
          }
        },
        SoaCaseMapping: {
          select: {
            SoaEmiMapping: {
              select: {
                due_for_month: true,
                total_dues_ftm: true,
                foreclosure_charges: true
              }
            },
            SoaApplicantDetail: {
              where: {
                is_primary: true
              },
              select: {
                first_name: true,
                mobile_number: true
              }
            },
            bucket: true
          },

        }
      }
    });

    const stage_data = await prisma.legalMaster.findMany({
      where: {
        is_active: true
      }
    });

    return { data: data, stage: stage_data } || {}
  },

  updateLegalCase: async (id, data, files) => {

    let updated;

    let errors = {};

    try {

      if (Object.keys(data || {})?.length) {

        if (data?.legal_status_id) data.legal_status_id = Number(data.legal_status_id)
        updated = await prisma.legalCases.update({
          where: {
            id: Number(id)
          },
          data: data
        });
      }
    }

    catch (err) {

      errors.data_update = true;

    }


    let fileData;

    try {

      if (files?.length) {

        fileData = await prisma.legalCaseEvidences.createMany({
          data: files
        });

      };

    }

    catch (err) {

      errors.evidence = true;

    };

    return errors;

  },


  getFollowUpHistory: async (id, loan_number, from, to) => {

    let query = {
      where: {
        co_id: Number(id),
        loan_number: loan_number
      },
      select: {
        current_follow_up: true,
        remarks: true,
        next_follow_up_date: true,
        next_follow_up_objective: true,
        follow_up_date_time: true,
        follow_up_type:true,
        status: true,
        loan_number: true,
        geo_lat:true,
        geo_long:true,
        SoaCaseMapping: {
          select: {
            SoaApplicantDetail: {
              where: {
                is_primary: true
              },
              select: {
                first_name: true,
                mobile_number: true
              }
            }
          }
        },
        DocumentStorage:{
          select:{
            fetch_url:true,
            doc_type:true,
            doc_sub_type:true
          }
        }
      }
    };

    if (from && to) {

      query.where.created_at = {
        gte: new Date(from),
        lte: new Date(to),
      }
    };

    return await prisma.collectionFollowUp.findMany(query)
  },


  findTransactionHistory: async (id, loan_number, from, to) => {

    const data = await prisma.paymentCollect.findMany({
      where: {
        loan_number: loan_number
      },
      select: {
        payment_type: true,
        amount: true,
        payment_date: true,
        invoice_number: true,
        status: true,
        geo_lat:true,
        geo_long:true,
        payment_date:true
      }
    });

    return data;


  },

  findCaseUsingFilters: async (id, query) => {

    let query_obj = { where: { co_id: Number(id) } };


    if (query?.loan_number) {

      query_obj.where = { ...query_obj.where, loan_number: query.loan_number }
    }

    if (query?.first_name || query?.last_name || query?.mobile_number) {

      let inner_query = {};

      if (query?.first_name) inner_query.first_name = query?.first_name;

      if (query?.last_name) inner_query.last_name = query?.last_name;

      if (query?.mobile_number) inner_query.mobile_number = query?.mobile_number;


      // query_obj.where?query_obj.where = {...query_obj.where,...
      //   {SoaApplicantDetail:{some:inner_query}}}:query_obj.where.SoaApplicantDetail = {some:inner_query}

      query_obj.where = {
        ...(query_obj.where || {}),
        SoaApplicantDetail: { some: inner_query }
      };
    }



    console.log("QUERY", query_obj);

    query_obj.include = {
      SoaApplicantDetail: {
        where: {
          is_primary: true
        },
        select: {
          mobile_number: true,
          first_name: true,
          last_name: true
        }
      }
    }

    const data = await prisma.soaCaseMapping.findMany(query_obj);

    console.log(data);

    return data;
  },


  addReassignment: async (id, data) => {

    const result = await prisma.$transaction(async (tx) => {

      // validate if the requester is a BCM **

      const user = await tx.user.findUnique({
        where: {
          id: Number(id)
        },
        include: {
          UserRoles: {
            select: {
              role_id: true,
              user_id: true,
              RoleMaster: true
            }
          }
        }
      });

      if (!user?.id) throw new Error("Invalid User!");

      const roles = user?.UserRoles || [];

      if (!roles?.length) throw new Error("Unauthorized Request!");

      let roleMatch = roles.filter((r) => {

        return role_names["BCM"].map((n) => n.split(' ').join('').toLowerCase()).includes(r?.RoleMaster?.name?.split(' ').join('')?.toLowerCase())
      });

      console.log("ROLE MATCH", roleMatch)

      if (!roleMatch?.length) throw new Error("Unauthorized Request!");


      const newUser = await tx.user.findFirst({
        where: {
          employee_id: data?.new_employee_id
        }
      });

      if (!newUser?.id) throw new Error("Cannot Assign to this User As User Not Found!");


      console.log("LOANS", data?.loan_number)

      const case_data = await tx.soaCaseMapping.findMany({
        where: {
          loan_number: {
            in: data?.loan_number
          }
        },
        include: {
          User: true
        }
      });

      console.log("CASE DATA L",)

      if (case_data?.length !== data?.loan_number?.length) throw new Error("Invalid Loan Number!");

      // multiple case requests change ** 01/12

      let create_body = [];

      for (const cases of case_data) {

        let obj = { loan_number: cases?.loan_number, employee_id: cases?.User?.employee_id, user_id: cases?.User?.id, new_employee_id: data?.new_employee_id, reason: data?.reason || "" };

        obj.new_user_id = newUser.id;

        obj.case_id = cases.id;

        obj.status = "pending"

        create_body.push(obj);

      }


      return await tx.reAssignment.createMany({
        data: create_body
      });

    })

    return result;
  },


  findCompletedPayments: async (id, date) => {

    let query_obj = {
      where: {
        status: 'completed',
        SoaCaseMapping: {
          co_id: Number(id)
        }
      },
      select: {
        loan_number: true,
        payment_mode: true,
        amount: true,
        updated_at: true,
        payment_date: true,
        SoaCaseMapping: {
          select: {
            User: {
              select: {
                employee_id: true
              }
            },
            SoaApplicantDetail: {
              where: {
                is_primary: true
              },
              select: {
                first_name: true
              }
            }
          }
        }
      }
    }

    if (date) {
      const start = new Date(`${date}T00:00:00`);
      const end = new Date(`${date}T23:59:59.999`);

      query_obj.where.payment_date = {
        gte: start,
        lte: end,
      };
    }

    return await prisma.paymentCollect.findMany(query_obj)

  },


  createSchedule: async (body, loans) => {

    const data = prisma.$transaction(async (tx) => {

      let loan_data = await tx.SoaCaseMapping.findMany({
        where: {
          loan_number: {
            in: loans.map((r) => r?.loan_number)
          }
        }
      });

      if (!loan_data || loan_data?.length !== loans?.length) throw new Error("Invalid Loan Number!");


      let created_schedule = await tx.Schedules.createMany({
        data: body
      });

      return created_schedule;

    });


    return data;



  },



  findSchedulerOptions: async () => {

    return await prisma.mastersScheduler.findMany();

  },


  getCaseByLoan: async (loan) => {

    return await prisma.soaCaseMapping.findFirst({
      where: {
        loan_number: loan
      },
      select: {
        loan_number: true,
        id: true,
        co_id: true
      }
    })
  },

  getSearch: async (id) => {

    const data = await prisma.$transaction(async (tx) => {

      let search_options = await prisma.searchMaster.findMany({
        where: {
          is_active: true
        }
      });


      let case_master = await prisma.casetypemaster.findMany({
        where: {
          is_deleted: false
        }
      });


      search_options = search_options.map((s) => {
        return { ...s, table: "searchMaster" }
      });

      case_master = case_master.map((c) => {
        return { ...c, ...{ table: "casetypemaster", category: "search_by_tags" } }
      });


      return [...search_options, ...case_master]

    })



    if (!data?.length) return [];

    return data;

  },


  searchByFilters: async (data) => {

    let query_obj = {
      where: {}, include: {
        SoaApplicantDetail: {
          where: {
            is_primary: true
          },
          select: {
            first_name: true,
            middle_name: true,
            last_name: true
          }
        },
        SoaEmiMapping: true
      }
    };

    const categories = Object.keys(data);

    let body_copy = structuredClone(data);

    if (!categories?.length) throw new Error("Please Select Atleast One Filter!");



    for (const key of categories) {

      switch (key) {

        case ('opening_DPD'):

          query_obj.where = {
            ...query_obj.where,
            bucket: {
              in: data?.[key]
            }
          }

          console.log("QUERY", query_obj)

          break;

        case ('search_by_tags'):


          let mapping = {
            "partially_disbursed": {
              name: "Partially Disbursed",
              tag: "status"
            },
            "balance_collectible_greater_than_zero": {
              name: null,
              tag: "balance_collectible"
            }
          }

          const inner_keys = data?.["search_by_tags"];

          if (!inner_keys?.length) continue;

          let filter_opt = {};

          for (const key of inner_keys) {

            console.log(mapping[key])

            if (!mapping[key]) continue;

            if (key == "balance_collectible_greater_than_zero") {
              filter_opt[mapping[key]?.tag] = { notIn: ["0", null] }
              continue;
            }

            console.log("TAG", mapping[key?.tag])

            filter_opt[mapping[key]?.tag] = mapping[key]?.name;
          }


          console.log("OPT", filter_opt)
          query_obj.where = { ...query_obj.where, ...filter_opt };

          break;


        case ('follow_up_status'):

          query_obj.where.CollectionFollowUp = {
            some: {
              current_follow_up: data?.[key]
            }
          }

          break;

        case ('incentive'):


          let value = data?.incentive;

          let selected = null;

          switch (value) {

            case ('high'):

              selected = 2;

              break;

            case ('medium'):

              selected = 1;

              break;

            case ('low'):

              selected = 0;

              break;

            case ('NA'):

              selected = null;

          }

          query_obj.where.incentive = selected;

          break;




        default:

          continue;

      }

    }


    console.log("QUERY OBJ", query_obj)

    let result = await prisma.soaCaseMapping.findMany(query_obj);


    if (!result?.length) return [];


    if (data?.sort) {

      let sort_key = data?.sort?.split('-');

      let is_valid = sort_key?.length == 1;

      const target = sort_key?.[0];

      switch (target) {

        case ('balance_collectible'):

          if (sort_key?.[1] === "low_to_high") {
            result = result?.sort((a, b) => {
              const aVal = Number(a?.balance_collectible || 0);
              const bVal = Number(b?.balance_collectible || 0);
              return aVal - bVal;
            });
          }

          else {
            result = result?.sort((a, b) => {
              const aVal = Number(a?.balance_collectible || 0);
              const bVal = Number(b?.balance_collectible || 0);
              return bVal - aVal
            });
          }

          break;

        case ('sanctioned_amount'):

          if (sort_key?.[1] == "low_to_high") {

            result = result?.sort((a, b) => {
              const aVal = Number(a?.sanctioned_amount || 0);
              const bVal = Number(b?.sanctioned_amount || 0);
              return aVal - bVal;
            });
          }

          else {
            result = result?.sort((a, b) => {
              const aVal = Number(a?.sanctioned_amount || 0);
              const bVal = Number(b?.sanctioned_amount || 0);
              return bVal - aVal;
            });
          }


          break;

        case ('emi_dues'):

          if (sort_key?.[1] == "low_to_high") {


            result = result?.sort((a, b) => {
              const aVal = Number(a?.emi_pemi_dues || 0);
              const bVal = Number(b?.emi_pemi_dues || 0);
              return aVal - bVal;
            });
          }

          else {

            result = result?.sort((a, b) => {
              const aVal = Number(a?.emi_pemi_dues || 0);
              const bVal = Number(b?.emi_pemi_dues || 0);
              return bVal - aVal;
            });
          }

          break;

        default:
          result = result;
      }

    }


    // if(data?.incentive){


    //   let value = data?.incentive;

    //   let selected = null;

    //   switch(value){

    //     case('high'):

    //     selected = 2;

    //     break;

    //        case('medium'):

    //     selected = 1;

    //     break;

    //        case('low'):

    //     selected = 0;

    //     break;

    //     case('NA'):

    //     selected = null;

    //     break;

    //     default:
    //       selected = "default"

    //   }


    //   if(selected == "default") return result;
    //   result = result.filter((r)=>r.incentive == selected)


    // }

    return result;


  },

  findAndUpdatePayment: async (number) => {

    const find_row = await prisma.paymentCollect.findMany({
      where: {
        receipt_number: number
      }
    });

    if (!find_row?.length) throw new Error("Error Depositing Cash!");


    for (const row of find_row) {

      await prisma.paymentCollect.update({
        where: {
          id: Number(row?.id)
        },
        data: {
          status: "completed"
        }
      })
    }

    return { message: "Success" };
  },
  
  getAllSearchMaster: async () => {
    const data = await prisma.searchMaster.findMany();


    if (!data?.length) return {};

    const transformed = {};
    const categoryMap = {};

    // Group data by category
    for (const item of data) {
      const category = item.category;

      if (!transformed[category]) {
        transformed[category] = {
          label: category,
          items: []
        };
        categoryMap[category] = 0;
      }

      // Increment the item counter for this category
      categoryMap[category]++;

      transformed[category].items.push({
        id: item.id,
        displayName: item.name,
        displayValue: item.display_name,
        enabled: item.is_active
      });
    }

    return transformed;

  },

  searchByFilters: async (data) => {

    let query_obj = {
      where: {}, include: {
        SoaApplicantDetail: {
          where: {
            is_primary: true
          },
          select: {
            first_name: true,
            middle_name: true,
            last_name: true
          }
        },
        SoaEmiMapping: true
      }
    };

    const categories = Object.keys(data);

    let body_copy = structuredClone(data);

    if (!categories?.length) throw new Error("Please Select Atleast One Filter!");



    for (const key of categories) {

      switch (key) {

        case ('opening_DPD'):

          query_obj.where = {
            ...query_obj.where,
            bucket: {
              in: data?.[key]
            }
          }

          console.log("QUERY", query_obj)

          break;

        case ('search_by_tags'):


          let mapping = {
            "partially_disbursed": {
              name: "Partially Disbursed",
              tag: "status"
            },
            "balance_collectible_greater_than_zero": {
              name: null,
              tag: "balance_collectible"
            }
          }

          const inner_keys = data?.["search_by_tags"];

          if (!inner_keys?.length) continue;

          let filter_opt = {};

          for (const key of inner_keys) {

            console.log(mapping[key])

            if (!mapping[key]) continue;

            if (key == "balance_collectible_greater_than_zero") {
              filter_opt[mapping[key]?.tag] = { notIn: ["0", null] }
              continue;
            }

            console.log("TAG", mapping[key?.tag])

            filter_opt[mapping[key]?.tag] = mapping[key]?.name;
          }


          console.log("OPT", filter_opt)
          query_obj.where = { ...query_obj.where, ...filter_opt };

          break;


        case ('follow_up_status'):

          query_obj.where.CollectionFollowUp = {
            some: {
              current_follow_up: data?.[key]
            }
          }

          break;

        case ('incentive'):


          let value = data?.incentive;

          let selected = null;

          switch (value) {

            case ('high'):

              selected = 2;

              break;

            case ('medium'):

              selected = 1;

              break;

            case ('low'):

              selected = 0;

              break;

            case ('NA'):

              selected = null;

          }

          query_obj.where.incentive = selected;

          break;




        default:

          continue;

      }

    }


    console.log("QUERY OBJ", query_obj)

    let result = await prisma.soaCaseMapping.findMany(query_obj);


    if (!result?.length) return [];


    if (data?.sort) {

      let sort_key = data?.sort?.split('-');

      let is_valid = sort_key?.length == 1;

      const target = sort_key?.[0];

      switch (target) {

        case ('balance_collectible'):

          if (sort_key?.[1] === "low_to_high") {
            result = result?.sort((a, b) => {
              const aVal = Number(a?.balance_collectible || 0);
              const bVal = Number(b?.balance_collectible || 0);
              return aVal - bVal;
            });
          }

          else {
            result = result?.sort((a, b) => {
              const aVal = Number(a?.balance_collectible || 0);
              const bVal = Number(b?.balance_collectible || 0);
              return bVal - aVal
            });
          }

          break;

        case ('sanctioned_amount'):

          if (sort_key?.[1] == "low_to_high") {

            result = result?.sort((a, b) => {
              const aVal = Number(a?.sanctioned_amount || 0);
              const bVal = Number(b?.sanctioned_amount || 0);
              return aVal - bVal;
            });
          }

          else {
            result = result?.sort((a, b) => {
              const aVal = Number(a?.sanctioned_amount || 0);
              const bVal = Number(b?.sanctioned_amount || 0);
              return bVal - aVal;
            });
          }


          break;

        case ('emi_dues'):

          if (sort_key?.[1] == "low_to_high") {


            result = result?.sort((a, b) => {
              const aVal = Number(a?.emi_pemi_dues || 0);
              const bVal = Number(b?.emi_pemi_dues || 0);
              return aVal - bVal;
            });
          }

          else {

            result = result?.sort((a, b) => {
              const aVal = Number(a?.emi_pemi_dues || 0);
              const bVal = Number(b?.emi_pemi_dues || 0);
              return bVal - aVal;
            });
          }

          break;

        default:
          result = result;
      }

    }


    // if(data?.incentive){


    //   let value = data?.incentive;

    //   let selected = null;

    //   switch(value){

    //     case('high'):

    //     selected = 2;

    //     break;

    //        case('medium'):

    //     selected = 1;

    //     break;

    //        case('low'):

    //     selected = 0;

    //     break;

    //     case('NA'):

    //     selected = null;

    //     break;

    //     default:
    //       selected = "default"

    //   }


    //   if(selected == "default") return result;
    //   result = result.filter((r)=>r.incentive == selected)


    // }

    return result;


  },

  createSearchMaster: async (data) => {
    const res = await prisma.$transaction(async (tx) => {

      const new_search_options = await prisma.searchMaster.create({
        data: data
      });
      if (!new_search_options || new_search_options.length == 0) return [];
      return new_search_options;
    })

    return res;
  },

  updateSearchMaster: async (id, data) => {
    return await prisma.searchMaster.update({
      where: {
        id: Number(id)
      },
      data: data
    })
  },
  deleteSearchMaster: async (id) => {
    return await prisma.searchMaster.update({
      where: {
        id: Number(id)
      },
      data: { is_active: false }
    })
  },
  addFollowUpWithImage:async(follow_up_body,doc_body) =>{

  const data = await prisma.$transaction(async(tx)=>{

    // check if loan number is valid


    const loan = await tx.soaCaseMapping.findFirst({
      where:{
        loan_number:follow_up_body.loan_number
      }
    });


    let case_id = loan?.id;
    if(!case_id) throw new Error("Invalid Loan Number");


    // first construct entry for collection follow up

    const follow_up = await tx.collectionFollowUp.create({
      data:{...follow_up_body,case_id:Number(case_id)}
    });

    if(!follow_up?.id) throw new Error("Error Creating Follow Up");


    const add_doc = await tx.DocumentStorage.createMany({
      data:doc_body.map((b)=>{
        return {...b,follow_up_id:follow_up.id}
      })
    });


    // add to salesforce

    const sf_body = {};

    const sf_add = await sf_helper.add_follow_up(sf_body);
    

    return follow_up;

  });

  return {message:"Success",result:data}
}
};


module.exports = main;
