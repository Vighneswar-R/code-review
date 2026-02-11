const prisma = require('../../prisma/global');



let main = {

    createMasterAndSubMaster:async(master,sub_master)=>{

        const data = await prisma.$transaction(async(tx)=>{


            const ifExisting = await tx.legalMaster.findFirst({
                where:{
                    stage_name:{
                        contains:master.stage_name
                    }
                }
            });

            if(ifExisting) throw new Error(`${master.stage_name} alreay exists!`)

            const master_table = await tx.legalMaster.create({
                data:{...master,is_active:true}
            });


            let master_id = master_table?.id;

            //LegalSubStageMaster

            let batch = sub_master.map((item)=>{

                item.master_id = master_id;

                item.is_active = true;

                return tx.LegalSubStageMaster.create({
                    data:item
                })
            });

            if(!batch?.length) throw new Error("Error Creating Sub Master");

            const sub_data = await Promise.all(batch);

            return master_table
        });

        return data;
    },


    findLegalCaseList:async(query)=>{

        let queryObj = {where:{}};



        const stage = query?.stage || null;

        if(!stage) throw new Error("Please Define the Stage Query!");

        queryObj.where.LegalMaster = {
            id:Number(stage)
        };

        if(query?.skip){
            queryObj.skip = Number(skip)
            queryObj.take = Number(take || 20) 
        };

        queryObj.include = {
            SoaCaseMapping:{
                select:{
                    principal_outstanding:true,
                    id:true,
                    SoaApplicantDetail:{
                        where:{
                            is_primary:true
                        },
                        select:{
                            first_name:true
                        }
                    },
                    SoaPropertyDetail:true
                }
            },
            LegalMaster:{
                select:{
                id:true,
                stage_name:true,
                legal_act:true
                },
            },

            LegalSubStageMaster:{
                select:{
                    id:true,
                    name:true
                }
            }
        };


        if(query?.loan_number){

            queryObj.where.loan_number = query?.loan_number;
        }

         if(query?.customer_name){

            queryObj.where.SoaCaseMapping = {
                SoaApplicantDetail:{
                    some:{
                        is_primary:true,
                        first_name:{
                            contains:query?.customer_name
                        }
                    }
                }
            }
        }


        if(query?.stage_id){

            queryObj.where.LegalMaster = {id:Number(query?.stage_id)}
        }


          if(query?.sub_stage_id){

            queryObj.where.LegalSubStageMaster = {id:Number(query?.sub_stage_id)}
        }


        const data = await prisma.legalCases.findMany(queryObj);

        return data;

    },



    getDashBoardCount:async(from,to)=>{


        let query_obj = {where:{}};

if (from) {
    query_obj.where.updated_at.gte = new Date(from);
  }

  if (to) {
    query_obj.where.updated_at.lte = new Date(to);
  }

  query_obj.select = {
    LegalMaster:{
    select:{
        stage_name:true,
        id:true
    }
}
  }

       
  const data = await prisma.legalCases.findMany(query_obj);

  return data;
    }
}


module.exports = main;