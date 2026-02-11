const admincases = require('../../../application/admin/index');
const main = {
  

 add_branch_master:async(req,res,next)=>{

    
        try {

            const {branch_name,branch_code, recipt_prefix, branch_value, branch_display_value, zone_id, branch_phone_1,branch_phone_2 ,region_id,branch_address_1,branch_address_2,branch_emp_id,branch_lat,branch_ion,dept_bank_account_id,bank_account_id} = req.body;

            const results = await admincases.branchmaster(req);

            return res.json({
                status : 200,
                message:"Success",
                result:results
            });


            
        } catch (error) {
            next(error);
            
        }
    },

    create_department:async(req,res,next)=>{

    
        try {
            const {department_name} = req.body;
            const results = await admincases.create_department(req);
            return res.json({
                status : 200,
                message:"Success",
                result:results
            });
        } catch (error) {

            next(error);
        }
    },


    get_department:async(req,res,next)=>{
        try {
            const data = await admincases.get_department(req)
        return res.json({
            status : 200,   
            message:"Success",
            result:data
        })

        } catch (error) {
            next(error);
        }
    },

    update_branch_master:async(req,res,next)=>{

        try {
            const {id} = req.params;
             const { branch_name, branch_code, recipt_prefix, branch_value, branch_display_value, zone_id, branch_phone_1,branch_phone_2 ,region_id,branch_address_1,branch_address_2,branch_emp_id,branch_lat,branch_ion,dept_bank_account_id,bank_account_id } = req.body;
        const results = await admincases.updatebranchmaster(req);

        return res.json({
            status : 200,
            message : "Branch Data Updated Sucessfully",
            result : results
        })

            
        } catch (error) {

            next(error)
            
        }

       

      
    },


    add_version_master:async(req,res,next)=>{

        try {

            const { application ,platform, current_version_update, updated_app_url } = req.body;

            const results = await admincases.add_version_master(req);

            return res.json({
                status : 200,
              message:"Success",
              result:results
            })
            
        } catch (error) {
            
            next(error);
        }

    },


    update_version_master:async(req,res,next)=>{

        try {
            const {id} = req.params;
              const { application ,platform, current_version_update, updated_app_url } = req.body;
        const results = await admincases.update_version_master(req);

        return res.json({
            status : 200,
            message : "Version Updated Sucessfully",
            result : results
        })

            
        } catch (error) {

            next(error)
            
        }

       

      
    },
    
    add_followup_type_master:async(req, res,next)=>{

        try {
            const {follow_up_name, display_value, followUp_type, generic_key, is_remark_required,is_image_required, is_next_followup_required} = req.body;
            const results = await admincases.add_followup_type_master(req);
            return res.json({
                status : 200,
                message:"Success",
                result:results
            })
            
        } catch (error) {
            
            next(error);
        }

    },

    add_bank_master:async(req, res, next)=>{

        try {

            const { bank_name, bank_id, display_name} = req.body;

            const results = await admincases.add_bank_master(req);

            return res.json({
                status : 200,
              message:"Success",
              result:results
            })
            
        } catch (error) {
            next(error);
            
        }

    },

    update_bank_master:async(req,res,next)=>{

        try {
            const {id} = req.params;
             const { bank_name, bank_id, display_name} = req.body;
        const results = await admincases.update_bank_master(req);

        return res.json({
            status : 200,
            message : "Bank Updated Sucessfully",
            result : results
        })

            
        } catch (error) {

            next(error)
            
        }

       

      
    },

        

get_followup_type_master:async(req,res,next)=>{

        try {

            const data = await admincases.get_followup_type_master(req)

        return res.json({
            status : 200,
          message:"Success",
          result:data
        })
      

            
        } catch (error) {
            next(error);
            
        }

    },

get_bank_branch_master:async(req,res,next)=>{

        try {

            const data = await admincases.get_bank_branch_master(req)

        return res.json({
            status : 200,
          message:"Success",
          result:data
        })
      

            
        } catch (error) {
            next(error);
            
        }

    },

    update_bank_branch_master:async(req,res,next)=>{
        try {
            const {id} = req.params;
            const { BANK_ID, BANK_BRANCH_NAME, DISPLAY_VALUE, BRANCH_MICR_CODE,BRANCH_IFCS_CODE,ADDRESS_1,ADDRESS_2,ADDRESS_3, REGION_ID,BRANCH_PINCODE } = req.body;
        const results = await admincases.update_bank_branch_master(req);
        return res.json({
            status : 200,
            message : "Bank Branch Updated Sucessfully",
            result : results
        })
            
        } catch (error) {
            next(error);
            
        }
    },


    get_zone_master:async(req,res,next)=>{

        try {

            const data = await admincases.get_zone_master(req)

        return res.json({
            status : 200,
          message:"Success",
          result:data
        })
      

            
        } catch (error) {
            next(error);
            
        }

    },



      get_bank_master:async(req,res,next)=>{

        try {

            const data = await admincases.get_bank_master(req)

        return res.json({
            status : 200,
          message:"Success",
          result:data
        })
      

            
        } catch (error) {
            next(error);
            
        }

    },

 get_roles_and_users_permissions:async(req,res,next)=>{
        try {
            const data = await admincases.get_roles_and_users_permissions(req)

            return res.json({
                status : 200,
                message:"Success",
                result:data
            })
            
        } catch (error) {

            next(error);
            
        }

    },


        get_version_master:async(req,res,next)=>{

        try {

            const data = await admincases.get_version_master(req)

        return res.json({
            status : 200,
          message:"Success",
          result:data
        })
      

            
        } catch (error) {
            next(error);
            
        }

    },


    get_region_master:async(req,res,next)=>{

        try {

            const data = await admincases.get_region_master(req)

        return res.json({
            status : 200,
          message:"Success",
          result:data
        })
      

            
        } catch (error) {
            next(error);
            
        }

    },



    get_branch_master:async(req,res,next)=>{
        try {
            const data = await admincases.get_branch_master(req)
        return res.json({
            status : 200,
          message:"Success",
          result:data
        })
            
        } catch (error) {
            next(error);
            
        }
    },


    add_bank_branch_master: async(req, res, next)=>{
        try {

            const { BANK_ID, BANK_BRANCH_NAME, DISPLAY_VALUE, BRANCH_MICR_CODE,BRANCH_IFCS_CODE,ADDRESS_1,ADDRESS_2,ADDRESS_3, REGION_ID,BRANCH_PINCODE } = req.body;
            const results = await admincases.add_bank_branch_master(req);
            return res.json({
                status : 200,
                message:"Success",  
                result:results
            })
            
        } catch (error) {
            next(error);
        }
    },


     add_permission_master: async(req, res, next)=>{
        try {
            const { name, type } = req.body;
            const results = await admincases.add_permission_master(req);
            return res.json({
                status : 200,
                message:"Success",  
                result:results
            })

        } catch (error) {
            next(error);
        }
    },

    get_permission_master:async(req,res,next)=>{
        try {
            const data = await admincases.get_permission_master(req)
        return res.json({
            status : 200,
            message:"Success",
            result:data
        })

        } catch (error) {
            next(error);
        }
    },
    
    update_permission_master:async(req,res,next)=>{
        try {
            const {id} = req.params;
                 const { name, type } = req.body;

            const results = await admincases.update_permission_master(req);
            return res.json({
                status : 200,
                message : "Permission Updated Sucessfully",
                result : results
            })
        } catch (error) {
            next(error)
        }
    },

    
    get_requisites:async(req,res,next) =>{

        try{


            const{type} = req.query;

            if(!type) throw new Error("No Required Type Defined!");

            const result = await admincases.get_create_master_requisites(type);

            return res.json(result);

        }


        catch(err){

            console.log(err)

        next(err);

        }

    },

    create_user:async(req,res,next) =>{

        try{

            const {name,email_id,employee_id,department_id,branches,mobile_number,manager_code,role_ids,cancel_permissions} = req.body;

            if(!department_id || !mobile_number || !role_ids) throw new Error("Invalid Parameters!");


            const result = await admincases.create_user(name,email_id,employee_id,department_id,branches,mobile_number,manager_code,role_ids,cancel_permissions);

            return res.json(result)

            
        }


        catch(err) {
            
            console.log(err)

            next(err);

        }
    },

    update_user:async(req,res,next) =>{

        try{

          const result = await admincases.edit_user(req.body);

          return res.json(result)

        }

        catch(err){

            next(err);

        }
    },

    get_user_data:async(req,res,next) =>{

        try{

            const{id} = req.params;

            if(!id) throw new Error("Missing Parameters!");

            const result = await admincases.get_user(id,req.query);

            return res.json(result)
        }

        catch(err){

            console.log(err)
            next(err);
        }
    },

    getUserList:async(req,res,next) =>{

        try{

          const{skip,take} = req.query;
          
          const result = await admincases.get_user_list(skip,take,req.query);

          return res.json(result)

        }

        catch(err){

            console.log("Error Finding",err)
            next(err);
        }
    },

    bulk_upload_user:async(req,res,next)=>{


        try{

    let file_type = req.file.originalname.split(".").pop().toLowerCase()

    if(!file_type || !file_type?.length) throw new Error("No File Type Defined, Error Uploading File");
 

    file_type = ['xlsx','xls'].includes(file_type)?'xlsx':file_type;


        const result = await admincases.bulk_upload_user(req,file_type);

        return res.json(result)

        }

        catch(err){

            console.log(err)
            next(err);
        }
    },
     update_followup_type_master:async(req,res,next)=>{

        try {
            const {id} = req.params;
              const {follow_up_name, display_value, followUp_type, generic_key, is_remark_required,is_image_required, is_next_followup_required} = req.body;
        const results = await admincases.update_followup_type_master(req);
        return res.json({
            status : 200,
            message : "Followup Type Updated Sucessfully",
            result : results
        })

        } catch (error) {
            next(error)
        }
    },

    add_exotel_master:async(req,res,next)=>{

        try {
            const {excotelcalledid} = req.body;
            const results = await admincases.add_exotel_master(req);
            return res.json({
                status : 200,
                message:"Success",
                result:results
            })
        } catch (error) {
            next(error);
        }
    },


    get_exotel_master:async(req,res,next)=>{
        try {
            const data = await admincases.get_exotel_master(req)
        return res.json({
            status : 200,
            message:"Success",
            result:data
        })
            
        } catch (error) {
            next(error);
            
        }
    },

    update_exotel_master:async(req,res,next)=>{
        try {
            const {id} = req.params;
        const results = await admincases.update_exotel_master(req);
        return res.json({
            status : 200,
            message : "Exotel Data Updated Sucessfully",
            result : results
        })
            
        } catch (error) {
            next(error);
            
        }
    },


    add_case_type_master:async(req,res,next)=>{
        try {
            const {case_type_name, display_value, startdate, enddate} = req.body;
            const results = await admincases.add_case_type_master(req);
            return res.json({
                status : 200,
                message:"Success",
                result:results
            })
            
        } catch (error) {
            next(error);
            
        }
    },

    get_case_type_master:async(req,res,next)=>{
        try {
            const data = await admincases.get_case_type_master(req)
        return res.json({
            status : 200,
            message:"Success",
            result:data
        })
            
        } catch (error) {

            next(error);
        }
    },

    update_case_type_master:async(req,res,next)=>{
        try {
            const {id} = req.params;
            const {case_type_name, display_value, startdate, enddate} = req.body;
        const results = await admincases.update_case_type_master(req);
        return res.json({
            status : 200,
            message : "Case Type Updated Sucessfully",
            result : results
        })
            
        } catch (error) {
            
        }
    },


    createRoles:async(req,res,next)=>{

        try{

         const {name,permissions} = req.body;
         
         if(!name || !permissions?.length) throw new Error("Invalid Parameters!");

         const result = await admincases.create_role(name,permissions);

         return res.json(result);

        }

        catch(err){

            console.log(err);

            next(err);
        }
    },


    
    getPermissionsList:async(req,res,next)=>{

        try{
         
         const result = await admincases.getAvailablePermissions();

         return res.json(result);

        }

        catch(err){

            console.log(err);

            next(err);
        }
    },

    edit_existing_role:async(req,res,next)=>{

        try{

          const {id} = req.params;
          
          if(!id) throw new Error("Invalid Parameter!");

          const result = await admincases.edit_role(id,req.body);

          return res.json(result);

        }

        catch(err){

            console.log(err);
            next(err);
        }
    },



udpateStatus:async(req,res,next)=>{

    try{

      const result = await admincases.change_status(req.body);


      return res.json(result);

    }

    catch(err){

        console.log(err);

        next(err);
    }
},

get_generic_key:async(req,res,next)=>{
        try {
            const data = await admincases.get_generic_key(req)
        return res.json({
            status : 200,
            message:"Success",
            result:data
        })
           
        } catch (error) {
 
            next(error);
        }
    },


}


module.exports = main;