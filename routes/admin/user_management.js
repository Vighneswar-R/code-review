
const prisma = require('../../prisma/global')


const allowed_sequence = ['Collection Officer-Team Lead','Team Lead-AM','AM-RCM'];


const mapping_obj = {
    "Collection Officer":"co_id",
    "Team Lead":"tl_id",
    "AM":"am_id",
    "RCM":"rcm_id"
}


const mapUsers = async (req,res,next) =>{     // heirarchy based mapping

    try{

    const{type,user_1,user_2} = req?.body;
    
    if(!user_1 || !user_2) throw new Error("Missing Parameters");


    const user = await prisma.User.findMany(
        {where:{
            employee_id:{
                in:[user_1,user_2]
            }
        }}
    );

    if(!user) throw new Error("No User Found");


    let role_obj = {};

    for(const data of user){

        role_obj[data.employee_id] = data?.role;
    };

    let role_sequence = `${role_obj?.[user_1]}-${role_obj?.[user_2]}`;

    if(!allowed_sequence?.includes(role_sequence)) throw new Error("Incorrect Mapping Order")

    // start mapping based on available sequence

    let seq_split = role_sequence?.split('-');


    let data = {
       [mapping_obj[seq_split?.[0]]]:user_1,
       [mapping_obj[seq_split?.[1]]]:user_2,
       created_at: new Date(),
       udpated_at: new Date()
    }


    await prisma.UserMapping.create({
        data:data
    })
    
    return res.json({
        message:"Mapping Successful",
        code:200
    })


    }

    catch(err){

        next(err)

    }
}


const get_co_list = async(req,res,next) =>{

    try{

    // bypassing all co list * now

    const co_list = await prisma.user.findMany({
        where:{
            status:"Active"
        }
    });

    return res.json(co_list);

    }

    catch(err){

    console.log("*** Error in fetching CO list ***",err);

    next(err);

    }
}



module.exports = {mapUsers,get_co_list}