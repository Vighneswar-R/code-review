const {bulkCaseUpload,addAllocationRule,allocationList,approveAllocation,getCaseReassignData,getSoaDetails,allocationHistory,get_lo_list_for_assign,allocate_pending_requests,manual_allocate,allocation_data,edit_allocation_rule,approve_reassignment_request,getSoaMoreInfo} = require('./allocationCases')


const allocationUseCases = {
    uploadBulkCases:bulkCaseUpload,
    allocationList:allocationList,
    approveAllocation:approveAllocation,
    addRule:addAllocationRule,
    getCaseAssignData:getCaseReassignData,
    getSoaDetails:getSoaDetails,
    allocationHistory:allocationHistory,
    lo_mapped:get_lo_list_for_assign,
    allocate_pending_requests:allocate_pending_requests,
    manual_allocate:manual_allocate,
    allocation_data:allocation_data,
    edit_allocation_rule:edit_allocation_rule,
    approve_reassignment_request:approve_reassignment_request,
    getSoaMoreInfo:getSoaMoreInfo
}


module.exports = allocationUseCases;