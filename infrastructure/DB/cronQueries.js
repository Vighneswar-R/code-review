
const prisma = require('../../prisma/global')

const main = {
    
    get_digital_payment_data:async(range)=>{

    const hours = Number(range);  
    const fromTime = new Date(Date.now() - hours * 60 * 60 * 1000);  //** dynamic based on range provided */


        const data = await prisma.paymentCollect.findMany({
            where:{
                created_at:{
                gte: fromTime
                },
                payment_mode:'Digital'
            }
        })
    },

    findActiveSchedules:async(skip,take) =>{

        const data = prisma.$transaction(async(tx)=>{

            let activeSchedules = await tx.Schedules.findMany({
            where:{
                is_active:true
            },
            skip:Number(skip),
            take:Number(take)
        });

        if(!activeSchedules?.length) throw new Error("No Schedules Found to execute!");

        activeSchedules = activeSchedules.map(async(a)=>{


            a.repeat = "";
            a.message = "";


            if(!a.message_type_id || !a.repeat_master_id)  return a;

            let ids = [a.repeat_master_id,a.message_type_id];

            let masterData = await tx.mastersScheduler.findMany({
                where:{
                    id:{
                        in:ids
                    }
                }
            });

            if(!masterData?.length) return a;

            a.repeat = masterData.find((e)=>e.type == "repeat");

            a.message = masterData.find((e)=>e.type == "message");

            return a;
        });

        return activeSchedules;
        });

        return data;
    }

}

module.exports = main;


