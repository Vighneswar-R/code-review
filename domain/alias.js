const alias = {
    LAN:"application_id",
    status:"status",
    LOAN_PURPOSE:"loan_purpose",
    loan_tenure:"loan_tenure",
    LOAN_PRINCIPLE_BALANCE:"loan_principal_balance",
    PRINCIPLE_OUTSTANDING_POS:"principal_outstanding",
    BUCKET:"bucket",
    DPD_OPENING:"dpd_opening",
    BRANCH_ID:"branch_id",

}

const applicant_fields = {
    PRIMARY_PHONE_APP:"",
    COAPP1_NAME:"first_name",
    COAPP1_MOBILE:"mobile_number",
    COAPP1_EMAIL_ID:"email",
    COAPP1_AADHAR_NO:"adhaar_number",
    COAPP2_NAME:"first_name",
    COAPP2_MOBILE:"mobile_number",
    COAPP2_EMAIL_ID:"email",
    COAPP2_AADHAR_NO:"adhaar_number",
    COAPP3_NAME:"first_name",
    COAPP3_MOBILE:"mobile_number",
    COAPP3_EMAIL_ID:"email",
    COAPP3_AADHAR_NO:"adhaar_number",
    COAPP4_NAME:"first_name",
    COAPP4_MOBILE:"mobile_number",
    COAPP4_EMAIL_ID:"email",
    COAPP4_AADHAR_NO:"adhaar_number",
    COAPP5_NAME:"first_name",
    COAPP5_MOBILE:"mobile_number",
    COAPP5_EMAIL_ID:"email",
    COAPP5_AADHAR_NO:"adhaar_number",
    COAPP6_NAME:"first_name",
    COAPP6_MOBILE:"mobile_number",
    COAPP6_EMAIL_ID:"email",
    COAPP6_AADHAR_NO:"adhaar_number"
}



const address_fields = {
COAPP1_ADDRESS:"address_line1",
COAPP2_ADDRESS:"address_line1",
COAPP3_ADDRESS:"address_line1",
COAPP4_ADDRESS:"address_line1",
COAPP5_ADDRESS:"address_line1",
COAPP6_ADDRESS:"address_line1",
}

const property_fields = {
    PROPERTY_ADDRESS:"property_value",
    PROPERTY_ADDRESS:"property_address"
}


const reference_fields = {
    REF1_NAME:"reference_1_full_name",
    REF1_MOBILE:"reference_1_phone_number",
    REF1_RELATION:"reference_1_type",
    REF2_NAME:"reference_2_full_name",
    REF2_MOBILE:"reference_2_phone_number",
    REF2_RELATION:"reference_2_type"
}


const emi_fields = {
    EMI_AMOUNT:"emi_for_month",
    emi_pending_no:"emi_pending_no",
    emi_pemi_dues:"emi_pemi_dues",
    future_emi:"future_emi",
    rate_of_interest:"rate_of_interest",
    arrear_emi:"arrear_emi",
    arrear_bounce_emi:"arrear_bounce_emi",
    emi_for_month:"emi_for_month",
    due_for_month:"due_for_month"
}

const guarantorKeys = [
  "GUARANTOR1_NAME",
  "GUARANTOR1_MOBILE",
  "GUARANTOR2_NAME",
  "GUARANTOR2_MOBILE",
  "GUARANTOR3_NAME",
  "GUARANTOR3_MOBILE",
  "GUARANTOR4_NAME",
  "GUARANTOR4_MOBILE"
];

let obj = {alias:alias,applicant_fields:applicant_fields,address_fields:address_fields,reference_fields:reference_fields,property_fields:property_fields,emi_fields:emi_fields};


module.exports = obj;