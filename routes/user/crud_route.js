
const prisma = require('../../prisma/global')


const getMappedList = async (req,res,next) =>{

try{

    const{employee_id} = req.params;

    const{required,id} = req.query;

    const user = await prisma.User.findFirst({
        where:{
            employee_id:employee_id
        },
        select:{
            role:true
        }
    });

    if((["AM,RCM","Team Lead"].includes(user?.role)) && !required) throw new Error("Required Params Missing For The User");


    const role = user?.role;


    let response_data;

    switch(required){

        case('am_list'):

        if(role !== 'RCM') throw new Error("Invalid Request Data, Permission Denied")
        const am_list = await prisma.UserMapping.findMany({

            where:{
                rcm_id:user?.employee_id
            },

            select:{
                User:true
            }
        })

        response_data = am_list;

        break;

        case('tl_list'):
        if(!["AM,RCM"].includes(role)) throw new Error("Invalid Request Data, Permission Denied");
          const tl_list = await prisma.UserMapping.findMany({

            where:{
                am_id:Number(id)
            },

            select:{
                User:true
            }
        })

        response_data = tl_list;

        break;


        case('co_list'):
        if(!["AM,RCM","Team Lead"].includes(role)) throw new Error("Invalid Request Data, Permission Denied");
          const co_list = await prisma.UserMapping.findMany({

            where:{
                tl_id:Number(id)
            },

            select:{
                User:true
            }
        })

        response_data = co_list;

        break;


    }

    return res.json({
        list_data:response_data,
        status:"Success"
    })

}

catch(err){

    next(err);
}

}


module.exports = {getMappedList}