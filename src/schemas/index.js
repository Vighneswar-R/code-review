import * as Yup from 'yup';

export const signInSchema = Yup.object({
  employee_code: Yup.string()
    .trim()
    .required('This field is mandatory')
    .max(10, 'Emp code can be max 10 characters long'),
  first_name: Yup.string()
    .trim()
    .required('This field is mandatory')
    .min(2, 'Name must be atleast 2 characters long')
    .max(30, 'Name can be max 30 characters long')
    .matches(/^[A-Za-z][A-Za-z\s]*$/, 'Invalid characters in Name'),
  middle_name: Yup.string().trim().max(30, 'Name can be max 30 characters long'),
  last_name: Yup.string().trim().max(30, 'Name can be max 30 characters long'),
  mobile_number: Yup.string()
    .matches(/^(?!.*(\d)\1{4})(?!.*(\d{5}).*\2)\d{10}$/, 'Enter a valid 10-digit mobile number')
    .required('Mobile number is required'),
  role: Yup.string().required('This field is mandatory'),
  branch: Yup.string().required('This field is mandatory'),
  department: Yup.string().required('This field is mandatory'),
  loimage: Yup.string().required('This field is mandatory'),
  date_of_birth: Yup.string().required('This field is mandatory'),
  username: Yup.string()
    .required('This field is mandatory')
    .min(10, 'Enter a valid phone number')
    .max(10, 'Enter a valid phone number'),
});

const applicantSchema = Yup.object().shape({
  applicant_details: Yup.object().shape({
    first_name: Yup.string()
      .trim()
      .min(2, 'First Name must be atleast 2 characters long')
      .max(50, 'First Name can be max 50 characters long')
      .required('First Name is required')
      .matches(/^[A-Za-z][A-Za-z\s]*$/, 'Invalid characters in First Name'),
    middle_name: Yup.string()
      .trim()
      .nullable()
      .min(1, 'Middle Name must be atleast one characters long')
      .max(50, 'Middle Name can be max 50 characters long')
      .matches(/^[a-zA-Z]+$/, 'Invalid characters'),
    last_name: Yup.string()
      .trim()
      .nullable()
      .min(2, 'Last Name must be atleast 2 characters long')
      .max(50, 'Last Name can be max 50 characters long')
      .matches(/^[a-zA-Z]+$/, 'Invalid characters'),
    date_of_birth: Yup.string()
      .required('Date of Birth is Required. Minimum age must be 18 or 18+'),
      // .min(8, 'Date of Birth is Required. Minimum age must be 18 or 18+'),
   
    mobile_number: Yup.string()
      .matches(/^(?!.*(\d)\1{5})(?!.*(\d{5}).*\2)\d{10}$/, 'Enter a valid 10-digit mobile number').required('Mobile number is required'),
  }),

  personal_details: Yup.object().shape({
    // how_would_you_like_to_proceed: Yup.string().required('This field is mandatory.'),
    id_type: Yup.string().required('This field is mandatory.'),
    id_number: Yup.string().when(['id_type', 'extra_params.ekyc_option'], (value, schema) => {
      if (value[0] === 'Passport') {
        return schema
          .matches(
            /^[A-PR-WY-Za-pr-wy-z][0-9]{7}$/,
            'Invalid Passport number. Format should be J1234567',
          )
          .required('Enter a valid ID number');
      } else if (value[0] === 'PAN') {
        return schema
          .matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid Pan number. Format should be AAAPB2117A')
          .required('Enter a valid ID number');
      } else if (value[0] === 'AADHAR') {
        if (value[1] === 'Aadhaar') {
          return schema
            .min(12, 'Enter Valid 12 digit Aadhaar number')
            .max(12, 'Enter Valid 12 digit Aadhaar number')
            .required('Enter a valid ID number');
        } else if(value[1] === 'vid'){
          return schema
            .min(16, 'Enter Valid 16 digit VID number')
            .max(16, 'Enter Valid 16 digit VID number')
            .required('Enter a valid ID number');
        }
      } else if (value[0] === 'Driving license') {
        return schema
          .matches(
            /^[A-Za-z]{2}\d{13}$/,
            'Enter Valid Driving license number. Format should be DL1234567891012',
          )
          .required('Enter a valid ID number');
      } else if (value[0] === 'Voter ID') {
        return schema
          .matches(/^[A-Za-z]{3}\d{7}$/, 'Enter Valid Voter ID number. Format should be XGS1234567')
          .required('Enter a valid ID number');
      } else {
        return schema.required('Enter a valid ID number');
      }
    }),
    selected_address_proof: Yup.string().required('This field is mandatory.'),
    address_proof_number: Yup.string().when(
      ['selected_address_proof', 'extra_params.ekyc_option'],
      (value, schema) => {
        if (value[0] === 'Passport') {
          return schema
            .matches(
              /^[A-PR-WY-Za-pr-wy-z][0-9]{7}$/,
              'Invalid Passport number. Format should be J1234567',
            )
            .required('Enter a valid address proof number');
        } else if (value[0] === 'PAN Card') {
          return schema
            .matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid Pan number. Format should be AAAPB2117A')
            .required('Enter a valid address proof number');
        } else if (value[0] === 'AADHAR') {
          if (value[1] === 'Aadhaar') {
            return schema
              .min(12, 'Enter Valid 12 digit Aadhaar number')
              .max(12, 'Enter Valid 12 digit Aadhaar number')
              .required('Enter a valid address proof number');
          } else {
            return schema
              .min(16, 'Enter Valid 16 digit VID number')
              .max(16, 'Enter Valid 16 digit VID number')
              .required('Enter a valid address proof number');
          }
        } else if (value[0] === 'Driving license') {
          return schema
            .matches(
              /^[A-Za-z]{2}\d{13}$/,
              'Enter Valid Driving license number. Format should be DL1234567891012',
            )
            .required('Enter a valid address proof number');
        } else if (value[0] === 'Voter ID') {
          return schema
            .matches(
              /^[A-Za-z]{3}\d{7}$/,
              'Enter Valid Voter ID number. Format should be XGS1234567',
            )
            .required('Enter a valid address proof number');
        } else {
          return schema.required('This field is mandatory.');
        }
      },
    ),
    first_name: Yup.string()
      .min(2, 'First Name must be atleast 2 characters long')
      .max(50, 'First Name can be max 50 characters long')
      .required('First Name is required')
      .matches(/^[a-zA-Z]+$/, 'Invalid characters in First Name'),
    middle_name: Yup.string()
      .nullable()
      .min(2, 'Middle Name must be atleast 2 characters long')
      .max(50, 'Middle Name can be max 50 characters long')
      .matches(/^[a-zA-Z]+$/, 'Invalid characters in Middle Name'),
    last_name: Yup.string()
      .nullable()
      .min(2, 'Last Name must be atleast 2 characters long')
      .max(50, 'Last Name can be max 50 characters long')
      .matches(/^[a-zA-Z]+$/, 'Invalid characters in Last Name'),
    gender: Yup.string().required('This field is mandatory.'),
    date_of_birth: Yup.string().required('Date of birth is required'),
    mobile_number: Yup.string()
      .matches(/^(?!.*(\d{5}).*\1)\d{10}$/, 'Enter a valid 10-digit mobile number')
      .required('Mobile number is required'),
      ckyc_number: Yup.string()
      .transform((value) => (value === null ? "" : value))
      .matches(/^\d{14}$/, 'CKYC number must be exactly 14 numeric digits'),
    father_name: Yup.string()
      .trim()
      .min(2, 'Father Name must be atleast 2 characters long')
      .max(90, 'Father Name can be max 90 characters long')
      .required('Father Name is required')
      .matches(/^[a-zA-Z\s]*$/, 'Invalid characters'),
    mother_name: Yup.string()
      .trim()
      .min(2, 'Mother Name must be atleast 2 characters long')
      .max(90, 'Mother Name can be max 90 characters long')
      .required('Mother Name is required')
      .matches(/^[a-zA-Z\s]*$/, 'Invalid characters'),
    marital_status: Yup.string().required('This field is mandatory.'),
    spouse_name: Yup.string()
      .trim()
      .min(2, 'Spouse Name must be atleast 2 characters long')
      .max(90, 'Spouse Name can be max 90 characters long')
      .matches(/^[a-zA-Z\s]*$/, 'Invalid characters')
      .when('marital_status', (value, schema) => {
        if (value[0] === 'Married') {
          return schema.required('Spouse Name is required');
        }
      }),
    religion: Yup.string().required('Religion is required'),
    preferred_language: Yup.string().required('Preferred Language is required'),
    qualification: Yup.string().required('Qualification is required'),
    email: Yup.string().matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
, 'Enter a Valid Email'),
differently_abled_status: Yup.string()
  .oneOf(['Yes', 'No'], 'Please select Yes or No')
  .required('This field is mandatory.'),
    type_of_impairment: Yup.string().required('Type of Impairment is required'),
    percentage_of_impairment: Yup.string().trim()
      .required('Percentage of Impairment is required')
      .test('len', 'Maximum 3 digits allowed', (val) => !val || val.length <= 3)
      .test('range', 'Value must be between 1 and 100', (val) => {
        if (!val) return false;
        const num = parseInt(val, 10);
        return num >= 1 && num <= 100;
      }),
   udid_number: Yup.string()
  .trim()
  .min(18,'UDID Number must be exactly 18 alphanumeric characters')
  .required('UDID Number is required'),
    city_of_birth: Yup.string()
    .trim()
    .min(2, 'Birth City should be at least 2 characters long')
    .max(25, 'Birth City can be max 25 Characters Long')
    .required('This Field Is Mandatory')
    .matches(/^[A-Za-z0-9\s]{1,25}$/, 'City name should not contain numbers'), // Prevent numbers
  }),

  work_income_detail: Yup.object().shape({
    profession: Yup.string().required('This field is mandatory'),
    pan_number: Yup.string()
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid Pan number. Format should be AAAPB2117A')
      .required('This field is mandatory'),
    no_of_employees: Yup.number()
      .required('This field is mandatory')
      .min(1, 'Minimum employee count is 1')
      .max(5000000, 'Maximum employee count is 50 lakhs'),
    no_current_loan: Yup.number()
      .required('This field is mandatory')
      .min(0, 'No. of Current loan(s) can be min 0')
      .max(99, 'No. of Current loan(s) can be max 99'),
    ongoing_emi: Yup.number()
      .required('This field is mandatory')
      .when('no_current_loan', {
        is: (val) => val > 0,
        then: (schema) => schema.min(1, 'EMI amount should be greater than 0'),
        otherwise: (schema) => schema.min(0),
      }),
    monthly_income: Yup.number()
    .required('This field is mandatory')
    .min(10000, 'Minimum Amount Should be 10000')
    .max(1000000, 'Amount Should be between 5000 - 1000000'),
    total_family_number: Yup.string().required('This field is mandatory'),
    total_household_income: Yup.string().required('This field is mandatory')
 .matches(/^\d+$/, 'Must be a number') // ensures only digits
  .test(
    'min-value',
    'Minimum Amount Should be 20000',
    value => Number(value) >= 20000
  ),    
  no_of_dependents: Yup.string().required('This field is mandatory'),
    extra_params: Yup.object().shape({
      extra_company_name: Yup.string()
        .trim()
        .min(2, 'Company name must be atleast 2 characters long')
        .max(90, 'Company name can be max 90 characters long')
        .required('This field is mandatory'),
      extra_industries: Yup.string()
        .trim()
        .min(2, 'Industry name must be atleast 2 characters long')
        .max(90, 'Industry name can be max 90 characters long')
        .required('This field is mandatory'),
    }),

    //Salaried and Self Employed
    flat_no_building_name: Yup.string()
      .trim()
      .required('This field is mandatory')
      .min(2, 'Address must be atleast 2 characters long')
      .max(90, 'Address can be max 90 characters long'),
    street_area_locality: Yup.string()
      .trim()
      .required('This field is mandatory')
      .min(2, 'Address must be atleast 2 characters long')
      .max(90, 'Address can be max 90 characters long'),
    town: Yup.string()
      .trim()
      .min(2, 'Town must be atleast 2 characters long')
      .max(90, 'Town can be max 90 characters long')
      .required('This field is mandatory'),
    landmark: Yup.string()
      .trim()
      .required('This field is mandatory')
      .min(2, 'Landmark must be atleast 2 characters long')
      .max(90, 'Landmark can be max 90 characters long'),
    pincode: Yup.string()
      .matches(/^(0|[1-9]\d*)$/, 'Enter a valid Pincode')
      .required('This field is mandatory')
      .min(6, 'Enter a valid Pincode')
      .max(6, 'Enter a valid Pincode'),
    //Salaried
    company_name: Yup.string().required('This field is mandatory'),
    salary_per_month: Yup.number()
      .required('This field is mandatory')
      .required('Total income should not be less than ₹ 10,000 and more than ₹ 50,00,00,000')
      .typeError('Total income should not be less than ₹ 10,000 and more than ₹ 50,00,00,000')
      .min(10000, 'Total income should not be less than ₹ 10,000 and more than ₹ 50,00,00,000')
      .max(
        750000000,
        'Total loan amount should not be less than ₹ 10,000 and more than ₹ 50,00,00,000',
      ),
    pf_uan: Yup.string()
      .trim()
      .min(12, 'pf uan number must be atleast 12 characters')
      .max(12, 'pf uan number must be atleast 12 characters'),
    working_since: Yup.string().required('This field is mandatory'),
    mode_of_salary: Yup.string().required('This field is mandatory'),

    //Self Employed
    business_name: Yup.string()
      .trim()
      .min(2, 'Business name must be atleast 2 characters long')
      .max(90, 'Business name can be max 90 characters long')
      .required('This field is mandatory'),
    industries: Yup.string().required('This field is mandatory'),
    udyam_number: Yup.string().matches(
      /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/,
      'Invalid Udyam Number Eg: UDYAM-XX-00-0000000',
    ),
    gst_number: Yup.string().matches(
      /^([0][1-9]|[1-2][0-9]|[3][0-7])([a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[0-9]{1}[zZ]{1}[0-9a-zA-Z]{1})+$/,
      'Invalid GST Number Eg: 06AAAPB2117A1ZI ',
    ),

    //Pentioner
    pention_amount: Yup.string().required('This field is mandatory'),
  }),

  address_detail: Yup.object().shape({
    current_type_of_residence: Yup.string().trim().required('This field is mandatory'),
    current_flat_no_building_name: Yup.string()
      .trim()
      .required('This field is mandatory')
      .min(3, 'Flat no/Building name must be atleast 3 characters long')
      .max(35, 'Flat no/Building name can be max 35 characters long')
      .matches(/^[a-zA-Z0-9,/ -]+$/, 'Invalid characters'),

    current_street_area_locality: Yup.string()
      .trim()
      .required('This field is mandatory')
      .min(3, 'Street/Area/Locality must be atleast 3 characters long')
      .max(35, 'Street/Area/Locality can be max 35 characters long')
      .matches(/^[a-zA-Z0-9,/ -]+$/, 'Invalid characters'),
    current_town: Yup.string()
      .trim()
      .required('This field is mandatory')
      .min(3, 'Town must be atleast 3 characters long')
      .max(35, 'Town can be max 35 characters long')
      .matches(/^[a-zA-Z0-9,/ -]+$/, 'Invalid characters'),
    current_landmark: Yup.string()
      .trim()
      .required('This field is mandatory')
      .min(3, 'Landmark must be atleast 3 characters long')
      .max(35, 'Landmark can be max 35 characters long')
      .matches(/^[a-zA-Z0-9,/ -]+$/, 'Invalid characters'),
    current_pincode: Yup.string()
      .trim()
      .required('This field is mandatory')
      .matches(/^(0|[1-9]\d*)$/, 'Enter a valid Pincode')
      .min(6, 'Pincode a valid Pincode')
      .max(6, 'Pincode a valid Pincode'),
    current_no_of_year_residing: Yup.string().required('This field is mandatory'),

    additional_flat_no_building_name: Yup.string()
      .trim()
      .required('This field is mandatory')
      .min(3, 'Flat no/Building name must be atleast 3 characters long')
      .max(35, 'Flat no/Building name can be max 35 characters long')
      .matches(/^[a-zA-Z0-9,/ -]+$/, 'Invalid characters'),
    additional_street_area_locality: Yup.string()
      .trim()
      .required('This field is mandatory')
      .min(3, 'Street/Area/Locality must be atleast 3 characters long')
      .max(35, 'Street/Area/Locality can be max 35 characters long')
      .matches(/^[a-zA-Z0-9,/ -]+$/, 'Invalid characters'),
    additional_town: Yup.string()
      .trim()
      .required('This field is mandatory')
      .min(3, 'Town must be atleast 3 characters long')
      .max(35, 'Town can be max 35 characters long')
      .matches(/^[a-zA-Z0-9,/ -]+$/, 'Invalid characters'),
    additional_landmark: Yup.string()
      .trim()
      .required('This field is mandatory')
      .min(3, 'Landmark must be atleast 3 characters long')
      .max(35, 'Landmark can be max 35 characters long')
      .matches(/^[a-zA-Z0-9,/ -]+$/, 'Invalid characters'),
    additional_pincode: Yup.string()
      .trim()
      .required('This field is mandatory')
      .matches(/^(0|[1-9]\d*)$/, 'Enter a valid Pincode')
      .min(6, 'Pincode a valid Pincode')
      .max(6, 'Pincode a valid Pincode'),
    additional_no_of_year_residing: Yup.string().required('This field is mandatory'),
  }),
});

export const validationSchemaLead = Yup.object().shape({
  property_details: Yup.object().shape({
    property_identification_is: Yup.string().required('This field is mandatory'),
    property_value_estimate: Yup.string().trim().required('This field is mandatory'),
    current_owner_name: Yup.string()
      .trim()
      .required('This field is mandatory')
      .min(2, 'Current owner name must be atleast 2 characters long')
      .max(90, 'Current owner name can be max 90 characters long')
      .matches(/^[a-zA-Z ]+$/, 'Invalid characters'),
    plot_house_flat: Yup.string()
      .trim()
      .required('This field is mandatory')
      .min(2, 'Address must be atleast 2 characters long')
      .max(90, 'Address can be max 90 characters long')
      .matches(/^[a-zA-Z0-9,/ -]+$/, 'Invalid characters'),
    project_society_colony: Yup.string()
      .trim()
      .required('This field is mandatory')
      .min(2, 'Address must be atleast 2 characters long')
      .max(90, 'Address can be max 90 characters long')
      .matches(/^[a-zA-Z0-9,/ -]+$/, 'Invalid characters'),
    pincode: Yup.string()
      .trim()
      .required('This field is mandatory')
      .matches(/^(0|[1-9]\d*)$/, 'Enter a valid Pincode')
      .min(6, 'Enter a valid Pincode')
      .max(6, 'Enter a valid Pincode'),
  }),
  reference_details: Yup.object().shape({
    reference_1_type: Yup.string().trim().required('This field is mandatory'),
    reference_1_full_name: Yup.string()
      .trim()
      .required('This field is mandatory')
      .min(2, 'Name must be atleast 2 characters long')
      .max(90, 'Name can be max 90 characters long')
      .matches(/^[a-zA-Z0-9 ]+$/, 'Invalid characters'),
    reference_1_address: Yup.string()
      .trim()
      .min(10, 'Address must be atleast 10 characters long')
      .max(90, 'Address can be max 90 characters long')
      .required('This field is mandatory')
      .matches(/^[a-zA-Z0-9,/ -]+$/, 'Invalid characters'),
    reference_1_phone_number: Yup.string()
      .trim()
      .min(10, 'Enter a valid 10 digit mobile number')
      .max(10, 'Enter a valid 10 digit mobile number')
      .required('This field is mandatory')
      .test('reference_1_phone_number', 'Invalid mobile number', async (mobileNumber) => {
        const DISALLOW_NUM = ['0', '1', '2', '3', '4', '5'];
        if (DISALLOW_NUM.includes(mobileNumber.at(0))) return false;
        return true;
      }),

    reference_1_pincode: Yup.string()
      .trim()
      .required('This field is mandatory')
      .matches(/^(0|[1-9]\d*)$/, 'Enter a valid Pincode')
      .min(6, 'Enter a valid Pincode')
      .max(6, 'Enter a valid Pincode'),
    reference_1_email: Yup.string()
      .trim()
      .email('Enter a valid Email')
      .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Enter a Valid Email'),

    reference_2_type: Yup.string().required('This field is mandatory'),
    reference_2_full_name: Yup.string()
      .trim()
      .required('This field is mandatory')
      .min(2, 'Name must be atleast 2 characters long')
      .max(90, 'Name can be max 90 characters long')
      .matches(/^[a-zA-Z0-9 ]+$/, 'Invalid characters'),
    reference_2_address: Yup.string()
      .trim()
      .min(10, 'Address must be atleast 10 characters long')
      .max(90, 'Address can be max 90 characters long')
      .required('This field is mandatory')
      .matches(/^[a-zA-Z0-9,/ -]+$/, 'Invalid characters'),
    reference_2_phone_number: Yup.string()
      .trim()
      .min(10, 'Enter a valid 10 digit mobile number')
      .max(10, 'Enter a valid 10 digit mobile number')
      .required('This field is mandatory')
      .test('reference_2_phone_number', 'Invalid mobile number', async (mobileNumber) => {
        const DISALLOW_NUM = ['0', '1', '2', '3', '4', '5'];
        if (DISALLOW_NUM.includes(mobileNumber.at(0))) return false;
        return true;
      }),
    reference_2_pincode: Yup.string()
      .trim()
      .required('This field is mandatory')
      .matches(/^(0|[1-9]\d*)$/, 'Enter a valid Pincode')
      .min(6, 'Enter a valid Pincode')
      .max(6, 'Enter a valid Pincode'),
    reference_2_email: Yup.string()
      .trim()
      .email('Enter a valid Email')
      .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Enter a Valid Email'),
  }),

  lead: Yup.object().shape({
    loan_type: Yup.string().required('This field is mandatory field.'),
    purpose_of_loan: Yup.string().required('Loan Purpose is required'),
    property_type: Yup.string().required('Property Type is required'),
    lead_type: Yup.string().required('Lead Type is required'),
    applied_amount: Yup.number()
      .min(100000, 'Total loan amount should not be less than ₹ 1,00,000 and more than ₹ 75,00,000')
      .max(
        7500000,
        'Total loan amount should not be less than ₹ 1,00,000 and more than ₹ 75,00,000',
      )
      .required('This field is mandatory.'),
  }),

  lnt_mobile_number: Yup.object().shape({
    mobile_number: Yup.string()
      .matches(/^(?!.*(\d)\1{4})(?!.*(\d{5}).*\2)\d{10}$/, 'Enter a valid 10-digit mobile number')
      .required('Mobile number is required'),
  }),

  applicants: Yup.array().of(applicantSchema),
});

export const visitSchema = Yup.object({
  purpose: Yup.string().required('Purpose is required'),

  loan_type: Yup.string().when('purpose', {
    is: (v) =>
      v === 'Login Visit' ||
      v === 'Customer Visit' ||
      v === 'Builder Visit',
    then: (s) => s.required('Loan type is required'),
    otherwise: (s) => s.notRequired(),
  }),

  amount: Yup.number().when('purpose', {
    is: (v) =>
      v === 'Login Visit' ||
      v === 'Customer Visit' ||
      v === 'Builder Visit',
    then: (s) =>
      s
        .typeError('Enter valid amount')
        .min(500000, 'Minimum 5 Lakh')
        .max(7500000, 'Maximum 75 Lakh')
        .required('Amount is required'),
    otherwise: (s) => s.notRequired(),
  }),

  full_name: Yup.string().required('Full name is required'),

  mobile: Yup.string()
    .matches(/^(?!.*(\d)\1{4})\d{10}$/, 'Enter valid mobile number')
    .required('Mobile number is required'),

  profession: Yup.string().when('purpose', {
    is: (v) => v === 'Login Visit' || v === 'Customer Visit',
    then: (s) => s.required('Profession is required'),
    otherwise: (s) => s.notRequired(),
  }),

  company_name: Yup.string().when(['profession', 'purpose'], {
    is: (p, purpose) =>
      p === 'Salaried' &&
      (purpose === 'Login Visit' || purpose === 'Customer Visit'),
    then: (s) => s.required('Company name is required'),
    otherwise: (s) => s.notRequired(),
  }),

  business_name: Yup.string().when(['profession', 'purpose'], {
    is: (p, purpose) =>
      p === 'Self Employed' &&
      (purpose === 'Login Visit' || purpose === 'Customer Visit'),
    then: (s) => s.required('Business name is required'),
    otherwise: (s) => s.notRequired(),
  }),
  construction_stage: Yup.string().when('purpose', {
    is: 'Builder Visit',
    then: (s) => s.required('Construction stage is required'),
    otherwise: (s) => s.notRequired(),
  }),

  other_stage: Yup.string().when('construction_stage', {
    is: 'Other',
    then: (s) => s.required('Other stage is required'),
    otherwise: (s) => s.notRequired(),
  }),
  total_area: Yup.string().when('purpose', {
    is: 'Builder Visit',
    then: (s) => s.required('Total area is required'),
    otherwise: (s) => s.notRequired(),
  }),

  units: Yup.string().when('purpose', {
    is: 'Builder Visit',
    then: (s) => s.required('Number of units is required'),
    otherwise: (s) => s.notRequired(),
  }),

  place: Yup.string().required('Place of visit is required'),

  visit_outcome: Yup.string().required('Visit outcome is required'),

  remarks: Yup.string().when('visit_outcome', {
    is: 'Not Interested',
    then: (s) => s.required('Remarks are required'),
    otherwise: (s) => s.notRequired(),
  }),
   follow_up_date: Yup.string().when('visit_outcome', {
    is: 'Follow-up Requested',
    then: (s) => s.required('Follow-up Requested is required'),
    otherwise: (s) => s.notRequired(),
  }),

  ap_id: Yup.string().when('purpose', {
    is: 'Collection Visit',
    then: (s) => s.required('AP ID is required'),
    otherwise: (s) => s.notRequired(),
  }),
});


