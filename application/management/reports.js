const managementQueries = require('../../infrastructure/DB/managementQueries')

const { haversine, totalHaversineDistance, calculateTotalDues } = require('../../domain/index')


const get_reports = async (id, type, skip, take, from, to, sub_type, body) => {


    try {

        const user_id = id;

        // define role static if required validation;

        //  const get_permission_id = await managementQueries.getPermissonBytext('Reports');

        //  console.log("PERMISSON",get_permission_id);

        //  if(!get_permission_id) throw new Error("No Matching Permisson!");

        // if mapping has user tagged with user id means this specific user is restricted from this feature

        //  const un_authorized =  await managementQueries.getMappingExcluded(user_id,get_permission_id.id);

        //  if(un_authorized) throw new Error("Unauthorized Access!");

        let result;


        switch (type) {

            case ('attendance'):

                result = await managementQueries.getReports('userAttendanceLog', {}, skip, take, from, to, type, sub_type, body);

                let copy_attendance = [];

                let count_data = { active: 0, inactive: 0, punches: 0 }


                if (result && result?.length) {

                    if (sub_type == "details") {

                        for (let i = 0; i < result?.length; i++) {

                            let target = result?.[i];

                            let previous = result?.[i - 1];

                            if (target?.active && previous?.active) {

                                // calculate distance if previous and existing punch in is active **
                                let distanceCovered = 0;

                                distanceCovered += haversine(
                                    target.geo_lat,
                                    target.geo_long,
                                    previous.geo_lat,
                                    previous.geo_long
                                );

                                // add distance to the entry **

                                result[i].distance = `${distanceCovered?.toFixed(2)} KM`;
                            }

                            else {
                                result[i].distance = `0 KM`;

                            }

                        }

                    }

                    else if (sub_type == 'dashboard') {

                        let formatted = { total: 0, active: 0, inactive: 0, total_distance: 0, punches: 0, average_punches: 0 };

                        for (const item of result) {

                            let punch_log = item?.HourlyLog || [];

                            formatted.punches = formatted.punches + punch_log?.length || 0

                            console.log("FILTER", punch_log.filter((i) => i.geo_lat && i.geo_long).map((ele) => {
                                return { lat: ele?.geo_lat, lon: ele?.geo_long }

                            }))
                            formatted.total_distance =
                                formatted.total_distance +
                                totalHaversineDistance(
                                    punch_log
                                        .filter(i => i.geo_lat && i.geo_long)
                                        .map(ele => ({
                                            lat: Number(ele.geo_lat),
                                            lon: Number(ele.geo_long)
                                        }))
                                );

                            // hav here

                        };

                        return { result: formatted }
                    }

                    else {

                        for (const item of result) {

                            console.log("ITEM", item)

                            let obj = { id: item?.id };

                            let user = item?.User;

                            let hourly_data = item?.HourlyLog;

                            const total_punches = hourly_data?.length || 0;

                            const first_punch_in = hourly_data?.[0]?.punch_time || null

                            const last_punch_in = hourly_data?.[hourly_data?.length - 1]?.punch_time || null

                            const username = user.email;


                            // determine active based on discussion 18-11**

                            let latest_punch = item?.HourlyLog?.[item?.HourlyLog?.length - 1] || null;


                            const active_punches = item?.HourlyLog ? item?.HourlyLog.filter((ele) => ele.active) : [];



                            const status = item?.active ? "Active" : "Inactive"//latest_punch?.active?"Active":"Inactive"

                            latest_punch?.active ? count_data.active += 1 : count_data.inactive += 1

                            count_data.punches += active_punches?.length || 0;

                            delete user.email;

                            user.username = username;

                            obj = { ...obj, ...user };

                            const hourlyLog = item?.HourlyLog || [];

                            let coords = hourlyLog
                                .filter((ele) => ele?.geo_lat && ele?.geo_long)
                                .map((e) => ({
                                    geo_lat: parseFloat(e.geo_lat),
                                    geo_long: parseFloat(e.geo_long),
                                }));

                            console.log("COORDS", coords)

                            //calculate distance based on existing lat long ** if punches are more than 1

                            let total = 0;

                            if (total_punches > 1) {
                                for (let i = 0; i < coords.length - 1; i++) {
                                    total += haversine(
                                        coords[i].geo_lat,
                                        coords[i].geo_long,
                                        coords[i + 1].geo_lat,
                                        coords[i + 1].geo_long
                                    );
                                }
                            }
                            obj.total_punches = total_punches;
                            obj.status = status;
                            obj.first_punch_in = first_punch_in;
                            obj.last_punch_in = last_punch_in;
                            obj.total_distance = `${total.toFixed(2)} KM`


                            copy_attendance.push(obj)

                        }

                    }

                    result = copy_attendance?.length ? { data: copy_attendance, count: count_data } : { data: result, count: count_data }
                }

                break;

            case ('follow_ups'):

                result = await managementQueries.getReports('collectionFollowUp', {}, skip, take, from, to, type, sub_type, body);

                let formatted = { total: 0, completed: 0, pending: 0, total_dues: 0, PTP: 0, bucket_distribution: {}, PTP_modes: {} }

                if (result && result?.length) {


                    if (sub_type == 'dashboard') {

                        let obj = {};

                        for (const item of result) {


                            if (!item?.loan_number) continue;

                            let ptp_amount = item?.ptp_amount || 0;

                            formatted["PTP"] = formatted["PTP"] + Number(ptp_amount);

                            formatted["total"] = formatted["total"] + 1;

                            item?.status == 'completed' ? formatted["completed"] = formatted["completed"] + 1 : item?.status == 'pending' ? formatted["pending"] = formatted["pending"] + 1 : null;

                            item?.SoaCaseMapping?.bucket ? formatted.bucket_distribution[item?.SoaCaseMapping?.bucket] = formatted.bucket_distribution[item?.SoaCaseMapping?.bucket] + 1 || 1 : null

                            if (item?.ptp_mode) {

                                formatted.PTP_modes[item.ptp_mode] = formatted.PTP_modes[item?.ptp_mode] + 1 || 1;
                            }


                            obj[item.loan_number] = item?.SoaCaseMapping?.SoaEmiMapping?.[0] || null;

                            console.log("values", Object.values(obj));

                        };

                        formatted.total_dues = Object.values(obj).reduce((acc, emi) => {
                            if (!emi) return acc;

                            const fields = ["emi_for_month", "arrear_emi", "arrear_bounce_emi", "bounce_charges", "visit_charges"];

                            const totalForThisLoan = fields.reduce((sum, f) => {
                                const v = emi[f];
                                return (v !== null && v !== undefined && parseInt(v) == v)
                                    ? sum + Number(v)
                                    : sum;
                            }, 0);

                            return acc + totalForThisLoan;
                        }, 0);

                        return { message: "Success", result: formatted }
                    }

                    result = result.map((item) => {
                        let caseMapping = item?.SoaCaseMapping;

                        console.log("ITEM <>", item)

                        let applicant = caseMapping?.SoaApplicantDetail?.[0] || {};

                        let user = caseMapping?.User || {};

                        let branch = caseMapping?.User?.BranchMaster?.branch_name;

                        delete user.BranchMaster

                        user.branch_name = branch;

                        let emi = caseMapping?.SoaEmiMapping?.[0] || {};

                        let itemCopy = structuredClone(item);

                        delete itemCopy.SoaCaseMapping;

                        itemCopy = { ...itemCopy, ...user, ...applicant, ...emi, ...{ bucket: caseMapping?.bucket, loan_number: caseMapping?.loan_number } };

                        return itemCopy

                    })


                }

                break;

            case ('allocation'):

                result = await managementQueries.getReports('allocationMaster', {}, skip, take, from, to);

                break;

            case ('user'):

                result = await managementQueries.getReports('user', {}, skip, take, from, to, type, sub_type, body);


                console.log("SUB", sub_type)


                if (result && result?.length && sub_type && sub_type == "count") {


                    let sorted = {};


                    for (const item of result) {

                        const data = item.created_at.toISOString().split("T")[0];

                        if (!sorted[data]) sorted[data] = { total: 0, active: 0, inactive: 0 };

                        sorted[data].total = sorted[data].total + 1

                        if (item?.status?.toLowerCase() == 'active') sorted[data]["active"] = sorted[data]["active"] + 1;

                        if (item?.status == 'inactive' || !item?.status) sorted[data]["inactive"] = sorted[data]["inactive"] + 1;


                    }

                    console.log("SORTED", sorted);

                    let copy = Object.keys(sorted).map((item) => {
                        return { date: item, ...sorted[item] }
                    })

                    result = { count: copy }
                }


                break;

            case ('payment'):

                result = await managementQueries.getReports('paymentCollect', {}, skip, take, from, to, type, sub_type, body);

                let copy = result;

                console.log("RESULT IN", JSON.stringify(result))



                if (result && result?.length) {

                    // for dashboard chart

                    if (sub_type == 'dashboard') {

                        let formatted = { total_transactions: 0, success: 0, failed: 0, total_amount: 0, receipt_generated: 0, qr_code: 0, payment_link: 0, success_rate: "", success_amount: 0 };

                        for (const item of result) {

                            formatted.total_transactions += 1;

                            formatted.total_amount += Number(item?.amount) || 0;

                            item?.is_reciept_generated ? formatted.receipt_generated += 1 : null

                            item?.qr_code ? formatted.qr_code += 1 : item?.payment_link ? formatted.payment_link += 1 : null;

                            item?.status == 'completed' ? formatted.success += 1 : formatted.failed += 1

                            item?.status == 'completed' ? formatted.success_amount += Number(item?.amount) : null

                        };

                        formatted.success_rate = `${Math.round((formatted.success / formatted.total_transactions) * 100)}%`

                        formatted.qr_code = `${Math.round((formatted.qr_code / formatted.total_transactions) * 100)}%`

                        formatted.payment_link = `${Math.round((formatted.payment_link / formatted.total_transactions) * 100)}%`

                        formatted.receipt_not_generated = formatted.total_transactions - formatted.receipt_generated


                        return { message: "Success", result: formatted }
                    }
                    copy = [];
                    for (const item of result) {

                        let sanitized = {};

                        let obj = item?.SoaCaseMapping?.User || {};

                        sanitized.amount = item?.amount;
                        sanitized.invoice_number = item?.invoice_number;
                        sanitized.status = item?.status;
                        sanitized.loan_number = item?.loan_number;
                        sanitized.mobile_number = item?.mobile_number;
                        sanitized.is_reciept_generated = item?.is_reciept_generated;

                        sanitized.payment_mode = item?.payment_mode;


                        sanitized.receipt_number = item?.receipt_number;
                        sanitized.order_id = item?.order_id;

                        sanitized.qr_expiry_time = item?.qr_expiry_time;

                        sanitized.merchant_request_number = item?.merchant_request_number;


                        let branch = obj?.BranchMaster?.branch_name || "";

                        delete obj?.BranchMaster;

                        obj.branch_name = branch;

                        sanitized = { ...sanitized, ...obj }

                        copy.push(sanitized)
                    }

                    result = copy;
                }

                break;


            case ('collection'):

                result = await managementQueries.getReports('paymentCollect', {}, skip, take, from, to, type, sub_type, body);


                console.log("RES", result);
                if (result && result?.length) {


                    if (sub_type === "dashboard") {
                        let formatted = {
                            total_payment: 0,
                            total_outstanding: 0,
                            total_charges: 0,
                            total_arrears: 0,
                            payment_modes: {},
                            cash_handling: 0,
                            bounce_charges: 0,
                            visit_charges: 0,
                            lpp_charges: 0,
                            emi_charges: 0,
                            bucket_distribution: {},
                            date_wise_json: {}
                        };

                        const obj = {};

                        // Helper: safe numeric value
                        const num = v => (v !== null && v !== undefined && parseInt(v) == v ? Number(v) : 0);

                        // Helper: add single field if first time loan
                        const addIfFirst = (loanNo, fieldName, targetKey, sourceObj) => {
                            if (!obj[loanNo]) {

                                if (targetKey == "total_charges") {

                                    let total = num(calculateTotalDues(sourceObj, ["emi_for_month", "arrear_emi"]));

                                    console.log("TOTAL C", total, loanNo)
                                    formatted[targetKey] += Number(total);

                                    return;
                                };

                                console.log("BOUNCE", formatted[targetKey], targetKey)
                                const val = num(sourceObj?.[fieldName]);
                                formatted[targetKey] += val;
                            }
                        };

                        for (const item of result) {
                            const loanNo = item?.loan_number;
                            if (!loanNo) continue;


                            // bucket distribution added **18-11

                            if (!obj[loanNo] && item?.SoaCaseMapping?.bucket) {
                                formatted.bucket_distribution[item?.SoaCaseMapping?.bucket] = formatted.bucket_distribution[item?.SoaCaseMapping?.bucket] + 1 || 1
                            }

                            if (item?.status == 'completed') {

                                formatted.total_payment += num(item.amount);

                                const formatted_date = new Date(item?.payment_date)?.toLocaleDateString("en-GB");


                                item?.payment_date ? formatted.date_wise_json[formatted_date] = Number(item?.amount) + (formatted.date_wise_json[formatted_date] || 0) : null;

                                item?.payment_date ? console.log("DATE FORMAT", formatted.date_wise_json, item?.amount) : null


                            }

                            if (item?.payment_mode) {
                                formatted.payment_modes[item.payment_mode] =
                                    (formatted.payment_modes[item.payment_mode] || 0) + 1;
                            }

                            const emi = item?.SoaCaseMapping?.SoaEmiMapping?.[0];

                            console.log("EMI DATA", emi)

                            if (emi) {
                                console.log("OBJ - Here", obj)

                                addIfFirst(loanNo, "arrear_emi", "total_arrears", emi);
                                addIfFirst(loanNo, "bounce_charges", "bounce_charges", emi);
                                addIfFirst(loanNo, "visit_charges", "visit_charges", emi);
                                addIfFirst(loanNo, "lpp_charges", "lpp_charges", emi);
                                addIfFirst(loanNo, "emi_for_the_month", "emi_charges", emi);
                                addIfFirst(loanNo, "", "total_charges", emi);

                            };

                            item.cash_handling_charges ? formatted.cash_handling += num(item?.cash_handling_charges) : null

                            if (!obj[loanNo]) obj[loanNo] = emi || null;

                            console.log("OBJ JJ", obj)
                        }

                        // ---- TOTAL OUTSTANDING ----
                        const OUTSTANDING_FIELDS = [
                            "emi_for_month",
                            "arrear_emi",
                            "arrear_bounce_emi",
                            "bounce_charges",
                            "visit_charges"
                        ];

                        formatted.total_outstanding = Object.values(obj).reduce((acc, emi) => {
                            if (!emi) return acc;

                            const subtotal = OUTSTANDING_FIELDS.reduce(
                                (sum, field) => sum + num(emi[field]),
                                0
                            );

                            return acc + subtotal;
                        }, 0);

                        return { message: "Success", result: formatted };
                    }



                    result = result.map((item) => {

                        let obj = {};


                        let applicant = item?.SoaCaseMapping?.SoaApplicantDetail?.[0] || {};

                        let emi = item?.SoaCaseMapping?.SoaEmiMapping?.[0] || {};


                        obj.invoice_number = item?.invoice_number

                        obj.receipt_number = item?.receipt_number

                        obj.payment_mode = item?.payment_mode

                        obj.transaction_id = item?.gateway_verify_transaction_id

                        obj.cheque_number = item?.cheque_number

                        obj.amount = item?.amount;

                        obj.geo_lat = item?.geo_lat || "";

                        obj.geo_long = item?.geo_long || "";

                        obj.payment_date = item?.payment_date || item?.gateway_verify_transaction_time || ""
                        obj.gateway_verify_transaction_time = item?.gateway_verify_transaction_time

                        obj.loan_number = item?.loan_number

                        obj.cash_handling_charges = item?.cash_handling_charges || ""

                        obj.bounce_charges = item?.bounce_charges || ""


                        obj.created_at = item?.created_at
                        obj.created_at = item?.status

                        obj.bucket = item?.SoaCaseMapping?.bucket;

                        obj.dpd_opening = item?.SoaCaseMapping?.dpd_opening

                        // obj = {...obj,...case_mapping};

                        let user = item?.SoaCaseMapping?.User;

                        obj = {
                            ...obj, ...applicant, ...emi, ...{
                                branch: user?.BranchMaster?.[0]?.branch_name || "",
                                email: user?.email_id || "", employee_id: user?.employee_id || "", user_mobile: user?.mobile_number || ""
                            }
                        };


                        obj.bucket = item?.SoaCaseMapping?.bucket;

                        obj.dpd_opening = item?.SoaCaseMapping?.dpd_opening

                        console.log("OBJ", obj)

                        return obj;

                    })



                }

                break;

            default:

                throw new Error("Invalid Query!")

        }

        return { Message: "Success", result: result }


    }

    catch (err) {

        throw err;

    }
}


const get_dashboard_main = async(id) =>{


    try{


    const get_dash_info = await managementQueries.get_dash_items();


    return get_dash_info;

    }


    catch(err){

throw err;
    }
}


const get_branch_report = async(id,state_report) => {


    try{

        const result = await managementQueries.fetchBranchRelatedReport(id,state_report);

        return result;

    }

    catch(err){

        console.log(err);
        throw err;
    }

}

module.exports = { get_reports,get_dashboard_main,get_branch_report }