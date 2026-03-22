const { login, verify_login_otp, case_reassign_request, punch_in, mark_attendance, SSO_log_in } = require('./loginCases');

const { get_dashboard_cases, get_dashboard_data, get_case_data_by_id, get_nearby_loans, update_soa_applicant_details_by_id, get_follow_up_details, get_follow_up_history, transaction_history_by_loan, get_team_members, advance_search, raise_reassign_request, payments_done, schedule_message, get_search_options, filter_based_search, create_search_options, update_search_options, get_all_search_options, delete_search_options,add_follow_up,sf_collection_list} = require('./soaCaseDetail')


const { add_data, edit_data_by_id, get_punch_timeline, get_efficiency_details } = require('./activity');


const { getExistingLegalCases, getLegalCaseData, updateLegalCaseData } = require('./legalCases');


const { getSchedulerMaster } = require('./general')


const main = {
    login: login,
    verify_login_otp: verify_login_otp,
    case_reassign_request: case_reassign_request,
    get_dashboard_cases: get_dashboard_cases,
    get_dashboard_data: get_dashboard_data,
    get_case_data_by_id: get_case_data_by_id,
    get_nearby_loans: get_nearby_loans,
    add_data: add_data,
    edit_data_by_id: edit_data_by_id,
    update_soa_applicant_details_by_id: update_soa_applicant_details_by_id,
    punch_in: punch_in,
    mark_attendance: mark_attendance,
    SSO_log_in: SSO_log_in,
    get_punch_timeline: get_punch_timeline,
    get_follow_up_details: get_follow_up_details,
    get_efficiency_details: get_efficiency_details,
    getExistingLegalCases: getExistingLegalCases,
    getLegalCaseData: getLegalCaseData,
    updateLegalCaseData: updateLegalCaseData,
    get_follow_up_history: get_follow_up_history,
    transaction_history_by_loan: transaction_history_by_loan,
    get_team_members: get_team_members,
    advance_search: advance_search,
    raise_reassign_request: raise_reassign_request,
    payments_done: payments_done,
    schedule_message: schedule_message,
    getSchedulerMaster: getSchedulerMaster,
    get_search_options: get_search_options,
    filter_based_search: filter_based_search,
    create_search_options: create_search_options,
    update_search_options: update_search_options,
    get_all_search_options: get_all_search_options,
    delete_search_options: delete_search_options,
    add_follow_up:add_follow_up,
    sf_collection_list:sf_collection_list
}



module.exports = main;