const prisma = require('../../prisma/global')


const main = {

    getChangeInfo:async(obj) =>{

        // identify which permisson and what type of change for which role affected **

        let type = obj?.map_type;

        let type_id =  obj?.type_id;

        if(!type || !type_id) return {error:false}


        let targetObj;

        let result = {error:false,type:"",name:"",status:"",table:"",user_id:null,changed_for:''};


        switch(type){

            case('role'):

            targetObj = await prisma.roleMaster.findFirst({
                where:{
                    id:Number(type_id)
                }
            });

            if(!targetObj) return {error:true}

            let affected_permission = await prisma.permissionMaster.findFirst({
                where:{
                    id:Number(obj?.permission_id)
                }
            });

            let affected_type = affected_permission?.type || "";

            result.type = affected_type;

            permisson_name = affected_permission?.name || "";

            result.name = permisson_name;

            result.changed_for = type;

            result.status = obj.status == 1?true:false;

            result.id = affected_permission?.id;

            result.table = "permissons"

            break;

            default:
                return {error:true};
        }

        return result;

    }

}


module.exports = main;