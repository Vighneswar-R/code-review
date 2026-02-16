
const {login,login_otp_verify,log_out} = require('./login');

const {create_legal_master,get_legal_cases,dashboard_data} = require('./legal')

const {get_reports,get_dashboard_main,get_branch_report} = require('./reports')

const main = {
    login:login,
    login_otp_verify:login_otp_verify,
    log_out:log_out,
    get_reports:get_reports,
    create_legal_master:create_legal_master,
    get_legal_cases:get_legal_cases,
    dashboard_data:dashboard_data,
    get_dashboard_main:get_dashboard_main,
    get_branch_report:get_branch_report
}


module.exports = main;