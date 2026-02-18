
const {adminLogin,admin_login_otp_verify,admin_log_out,adminRegister} = require('./login')
const {addbranchmaster, get_zone_master, get_region_master, get_branch_master, add_version_master, get_version_master, add_bank_master, get_bank_master, add_bank_branch_master, get_bank_branch_master, add_followup_type_master,get_followup_type_master,updatebranchmaster,update_version_master,update_bank_master, add_permission_master, get_permission_master,update_permission_master, get_create_master_requisites,get_roles_and_users_permissions,create_department,get_department,update_bank_branch_master,update_followup_type_master,add_exotel_master, get_exotel_master, update_exotel_master, add_case_type_master, get_case_type_master, update_case_type_master,create_role,getAvailablePermissions,edit_role,get_generic_key,branchMappingUpload} = require('./adminCases');

const {create_user,edit_user,get_user,get_user_list,bulk_upload_user,change_status} = require('./userCases');
// const { get } = require('../../interfaces/http_requests/adminRoutes');

const main = {
    login:adminLogin,
    admin_login_otp_verify:admin_login_otp_verify,
    admin_log_out:admin_log_out,
    adminRegister:adminRegister,
    branchmaster : addbranchmaster,
    updatebranchmaster : updatebranchmaster,
    get_zone_master : get_zone_master,
    get_region_master :get_region_master,
    get_branch_master : get_branch_master,
    add_version_master : add_version_master,
    get_version_master : get_version_master,
    add_bank_master:add_bank_master,
    get_bank_master : get_bank_master,
    add_bank_branch_master: add_bank_branch_master,
    get_bank_branch_master : get_bank_branch_master,
    add_followup_type_master :add_followup_type_master,
    get_followup_type_master: get_followup_type_master,
    update_version_master : update_version_master,
    update_bank_master :update_bank_master,
    add_permission_master : add_permission_master,
    get_permission_master : get_permission_master,
    update_permission_master : update_permission_master,
    get_create_master_requisites:get_create_master_requisites,
    create_user:create_user,
    edit_user:edit_user,
    get_roles_and_users_permissions :get_roles_and_users_permissions,
    get_user:get_user,
    get_user_list:get_user_list,
    create_department : create_department,
    get_department : get_department,
    bulk_upload_user:bulk_upload_user,
    get_department :get_department,
    create_department :create_department,
    update_bank_branch_master :update_bank_branch_master,
    update_followup_type_master :update_followup_type_master,
    add_exotel_master : add_exotel_master,
    get_exotel_master : get_exotel_master,
    update_exotel_master : update_exotel_master,
    add_case_type_master : add_case_type_master,
    get_case_type_master : get_case_type_master,
    update_case_type_master : update_case_type_master,
    create_role:create_role,
    getAvailablePermissions:getAvailablePermissions,
    edit_role:edit_role,
    change_status:change_status,
    get_generic_key: get_generic_key,
    branchMappingUpload:branchMappingUpload
}


module.exports = main;