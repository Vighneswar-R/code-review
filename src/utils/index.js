export const fieldLabels = {
  lo_id: 'Loan Officer ID',
  loan_type: 'Loan Type',
  purpose_of_loan: 'Purpose of Loan',
  property_type: 'Property type',
  applied_amount: 'Required loan amount',

  property_identification_is: 'Property identification is',
  property_value_estimate: 'Property value estimate',
  current_owner_name: 'Current owner name',
  plot_house_flat: 'Plot/House/Flat no.',
  project_society_colony: 'Project Society Colony',
  city: 'City',
  state: 'State',

  applicant_type: 'Primary Applicant',
  first_name: 'First Name',
  middle_name: 'Middle Name',
  last_name: 'Last Name',
  date_of_birth: 'Date of Birth',
  mobile_number: 'Mobile Number',

  id_type: 'ID type',
  id_number: 'ID number',
  selected_address_proof: 'Address proof',
  address_proof_number: 'Address proof number',
  gender: 'Gender',
  father_name: `Father's name`,
  spouse_name: `Spouse's name`,
  mother_name: `Mother's name`,
  marital_status: 'Marital Status',
  city_of_birth:'City Of Birth',
  religion: 'Religion',
  preferred_language: 'Preferred language',
  qualification: 'Qualification',
  email: 'Email',
  type_of_impairment: 'Type of impairment',
  percentage_of_impairment: 'Percentage of impairment',
  udid_number: 'UDID number',
  differently_abled_status: 'Differently abled status',
  current_type_of_residence: 'Type of Residence',
  current_flat_no_building_name: 'Current Flat no/Building name',
  current_street_area_locality: 'Current Street/Area/Locality',
  current_town: 'Current Town',
  current_landmark: 'Current Landmark',
  current_pincode: 'Current Pincode',
  current_city: 'Current City',
  current_state: 'Current State',
  current_no_of_year_residing: 'Current No. of Year Residing',
  additional_flat_no_building_name: 'Additional Flat no/Building name',
  additional_street_area_locality: 'Additional Street/Area/Locality',
  additional_town: 'Additional Town',
  additional_landmark: 'Additional Landmark',
  additional_pincode: 'Additional Pincode',
  additional_city: 'Additional City',
  additional_state: 'Additional State',
  additional_no_of_year_residing: 'Additional No. of Year Residing',
  additional_address_same_as_current: ' Additional address is same as Current address',
  additional_type_of_residence: 'Type of address',
  address_for_tax_purpose: 'Address For Tax Purpose',

  profession: 'Profession',
  company_name: 'Company Name',
  pf_uan: 'PF UAN',
  no_current_loan: 'No. of Current Loan',
  ongoing_emi: 'Ongoing EMI',
  working_since: 'Working Since',
  mode_of_salary: 'Mode Of Salary',
  flat_no_building_name: 'Flat No Building Name',
  street_area_locality: 'Street Area Locality',
  town: 'Town',
  landmark: 'Landmark',
  pincode: 'Pincode',
  total_family_number: 'Total Family',
  total_household_income: 'Total Household Income',
  no_of_dependents: 'No. of Dependents',
  business_name: 'Business Name',
  industries: 'Industries',
  gst_number: 'GST Number',
  pention_amount: 'Pention Amount',
  extra_company_name: 'Other Company Name',
  extra_industries: 'Other Industries',
  no_of_employees: 'No. of employees',
  udyam_number: 'Udyam number',
  income_proof: 'Income proof',
  salary_per_month: 'Salary per month',
  pan_number: 'PAN number',
  comfortable_emi: 'Comfortable EMI',

  // reference
  reference_1_address: 'Reference 1 address',
  reference_1_city: 'Reference 1 city',
  reference_1_email: 'Reference 1 email',
  reference_1_full_name: 'Reference 1 full name',
  reference_1_phone_number: 'Reference 1 Phone number',
  reference_1_pincode: 'Reference 1 pincode',
  reference_1_state: 'Reference 1 state',
  reference_1_type: 'Reference 1 type',
  reference_2_address: 'Reference 2 address',
  reference_2_city: 'Reference 2 city',
  reference_2_email: 'Reference 2 email',
  reference_2_full_name: 'Reference 2 full name',
  reference_2_phone_number: 'Reference 2 phone number',
  reference_2_pincode: 'Reference 2 pincode',
  reference_2_state: 'Reference 2 state',
  reference_2_type: 'Reference 2 type',

  //upload
  customer_photo: 'Customer photo',
  id_proof: 'Id proof',
  address_proof: 'Address proof',
  property_paper: 'Property papers',
  salary_slip: 'Salary slip',
  form_60: 'Form 60',
  //  property_image: 'Property image',
  relation_with_main_applicant: 'Relation with Main Applicant',

  upload_selfie: 'Upload selfie',
};

export const nonRequiredFields = [
  'middle_name',
  'last_name',
  'extra_company_name',
  'extra_industries',
];

export const pages = {
  applicant_details: {
    title: 'Applicant Details',
    url: '/lead/applicant-details',
    name: 'applicant_details',
  },
  personal_details: {
    title: 'Personal Details',
    url: '/lead/personal-details',
    name: 'personal_details',
  },
  address_detail: {
    title: 'Address Details',
    url: '/lead/address-details',
    name: 'address_detail',
  },
  work_income_detail: {
    title: 'Work/Income Details',
    url: '/lead/work-income-details',
    name: 'work_income_detail',
  },
  property_details: {
    title: 'Property Details',
    url: '/lead/property-details',
    name: 'property_details',
  },
  banking_details: {
    title: 'Banking Details',
    url: '/lead/banking-details',
    name: 'banking_details',
  },
  reference_details: {
    title: 'Reference Details',
    url: '/lead/reference-details',
    name: 'reference_details',
  },
  upload_documents: {
    title: 'Upload Documents',
    url: '/lead/upload-documents',
    name: 'upload_documents',
  },
};

export const primaryPagesRoute = [
  '/lead/applicant-details',
  '/lead/personal-details',
  '/lead/address-details',
  '/lead/work-income-details',
  '/lead/qualifier',
  '/lead/lnt-charges',
  '/lead/property-details',
  '/lead/banking-details',
  '/lead/reference-details',
  '/lead/upload-documents',
  '/lead/preview',
  '/lead/eligibility',
];

export const coApplicantPagesRoute = [
  '/lead/applicant-details',
  '/lead/personal-details',
  '/lead/address-details',
  '/lead/work-income-details',
  '/lead/qualifier',
  '/lead/banking-details',
  '/lead/upload-documents',
];

export const filterOptions = [
  { label: 'All users', value: 'All users' },
  { label: 'Active users', value: 'active' },
  { label: 'Inactive users', value: 'inActive' },
];

export const filterDateOptions = [
  { label: 'Last 30 days', value: 'Last 30 days' },
  { label: 'Today', value: 'Today' },
  { label: 'Yesterday', value: 'Yesterday' },
  { label: 'Last 7 days', value: 'Last 7 days' },
  { label: 'Range', value: 'Range' },
];

export function validatePassword(password) {
  // Regular expression to match password criteria
  let regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{14,}$/;

  // Test the password against the regex and sequence checks
  return regex.test(password);
}

export const relationOptions = [
  { label: "Son", value: "Son" },
  { label: "Husband", value: "Husband" },
  { label: "Brother", value: "Brother" },
  { label: "Brother In Law", value: "Brother In Law" },
  { label: "Daughter", value: "Daughter" },
  { label: "Daughter In Law", value: "Daughter In Law" },
  { label: "Father", value: "Father" },
  { label: "Father in Law", value: "Father in Law" },  // small
  { label: "Mother", value: "Mother" },
  { label: "Mother In Law", value: "Mother In Law" },
  { label: "Nephew", value: "Nephew" },
  { label: "Sister", value: "Sister" },
  { label: "Sister In Law", value: "Sister In Law" },
  { label: "Son in Law", value: "Son in Law" },   // small
  { label: "Uncle", value: "Uncle" },
  { label: "Grand Son", value: "Grand Son" },
  { label: "Grand Daughter", value: "Grand Daughter" }
];

export const caseteOptions = [
  { label: "General", value: "General" },
  { label: "OBC", value: "OBC" },
  { label: "SC", value: "SC" },
  { label: "ST", value: "ST" }
];

export const otherDocumentOptions  = {
  all: [
    { value: 'address_proof', label: 'Address Proof (E-Bill / Rent Agreement)' },
    { value: 'noc', label: 'No Objection Certificate (NOC)' },
    { value: 'extra_work_agreement', label: 'Extra Work Agreement' },
    { value: 'loan_closure_proof', label: 'Loan Closure Proof' },
    { value: 'utility_bills', label: 'Utility Bills' },
    { value: 'miscellaneous_document', label: 'Miscellaneous Document' },
    { value: 'itr_online_verification', label: 'ITR Online Verification' },
    { value: 'banking_analysis', label: 'Banking Analysis' },
    { value: 'income_calculation_sheet', label: 'Income Calculation Sheet' },
    { value: 'income_document', label: 'Income Document' },
    { value: 'itr_computation_financials', label: 'ITR - Computation & Financials' },
    { value: 'bank_statement', label: 'Bank Statement' },
    { value: 'legal_documents_scanned', label: 'Legal Documents Scanned' },
    { value: 'saving_proof', label: 'Saving Proof' },
    { value: 'relationship_proof', label: 'Relationship Proof' },
    { value: 'commercial_bureau_report', label: 'Commercial Bureau Report' },
    { value: 'legal_vetting_document_scanned', label: 'Legal Vetting Document Scanned' },
  ],
  salaried: [
    { value: 'itr', label: 'ITR' },
    { value: 'computation_of_income', label: 'Computation of Income' },
    {value:'defenceidcard',label:'Defence ID Card'}
  ],
  selfEmployed: [
    { value: 'itr', label: 'ITR' },
    { value: 'computation_of_income', label: 'Computation of Income' },
    { value: 'gst_certificate', label: 'GST Certificate' },
    { value: 'udyam_certificate', label: 'Udyam Certificate / MSME' },
    { value: 'gst_registration', label: 'GST Registration' },
    { value: 'shop_registration', label: 'Shop Registration / Ghumasta' },
    { value: 'gst_online_verification', label: 'GST Online Verification' },
    { value: 'udyam_online_verification', label: 'Udyam Online Verification' },
    { value: 'rc_fitness_insurance', label: 'RC/Fitness/Insurance of Vehicle' },
    { value: 'business_proof', label: 'Business Proof Scanned' },
    { value: 'business_documents', label: 'Business Proof Documents' },
    { value: 'kacha_pakka_bill', label: 'Kacha Pakka Bill' },
    { value: 'udyham_registration_certificate', label: 'Udyham Registration Certificate' },
  ],
  pensioner: [
    { value: 'itr', label: 'ITR' },
    { value: 'computation_of_income', label: 'Computation of Income' },
  ],
  homeLoan: [
    { value: 'seller_kyc', label: 'Seller KYC' },
    { value: 'online_verification_seller_kyc', label: 'Online Verification of Seller KYC' },
    { value: 'online_verification_guarantor_kyc', label: 'Online Verification of Guarantor KYC' },
    { value: 'seller_banking_details', label: 'Seller Banking Details' },
    { value: 'ats_agreement_to_sell', label: 'ATS (Agreement to Sell)' },
  ],
  lap: [{ value: 'rtr_sheet', label: 'RTR Sheet' }],
  ifMarried: [{ value: 'marriage_certificate', label: 'Marriage Certificate' }],
};


export const months = {
  jan:"January",
  feb:"February",
  mar:"March",
  apr:"April",
  may:"May",
  jun:"June",
  jul:"July",
  aug:"August",
  sep:"September",
  oct:"October",
  nov:"November",
  dec:"December"
}

//   function validatePassword(password) {
//     // Check for length, number, uppercase, lowercase, and special character
//     let regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{14,}$/;

//     // Check for sequences
//     let sequences = [
//       '123',
//       '234',
//       '345',
//       '456',
//       '567',
//       '678',
//       '789', // Sequential numbers
//       'abc',
//       'bcd',
//       'cde',
//       'def',
//       'efg',
//       'fgh',
//       'ghi', // Sequential alphabets
//       'xyz',
//       'zyx', // Reverse sequential alphabets
//     ];

//     // Check for any sequence
//     let containsSequence = sequences.some((sequence) => password.includes(sequence));

//     // Test the password against the regex and sequence checks
//     return regex.test(password) && !containsSequence;
//   }
