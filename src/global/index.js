import axios from 'axios';
import axiosRetry from 'axios-retry';
import { id } from 'date-fns/locale';
import moment from 'moment';

//const API_URL = import.meta.env.VITE_API_URL || 'https://uatagile.indiashelter.in/api';
//const API_URL = import.meta.env.VITE_API_URL || 'https://itrustuat.indiashelter.in/api';
//  const API_URL = import.meta.env.VITE_API_URL || 'https://itrust.indiashelter.in:6443/api';
//const API_URL = import.meta.env.VITE_API_URL;

//const API_URL = "https://itrust.indiashelter.in:6443/api";

const API_URL = "http://localhost:8000/api";

const FACE_DETECTION_URL = "/account/check_if_face_authencticate/"
 const FACE_LIVE_PATRON_ID = import.meta.env.VITE_FACE_LIVE_PATRON_ID;

 const FACE_LIVE_AUTHORIZATION_RES_HEADER = import.meta.env.VITE_FACE_LIVE_AUTHORIZATION_RES_HEADER;

 const FACE_LIVE_FL_REQ_HEADER = import.meta.env.VITE_FACE_LIVE_FL_REQ_HEADER;

 const IMAGE_URL_FOR_PDF_UPLOAD = import.meta.env.VITE_IMAGE_URL_FOR_PDF_UPLOAD;
 const VITE_FACE_LIVE_PERCENTAGE=   0;//import.meta.env.VITE_FACE_LIVE_PERCENTAGE;


 // down time variable

 const start_downtime = "14:20";

 const end_downtime = "14:00"

 const downTimeMessage = `Maintenance Down Time, Please log in after ${end_downtime}`
 
 const by_pass_aggregator = false;


 const single_payment = true;

  const work_flow_liveness = "liveness_facematch"


// const API_URL = 'https://itrustuatcloud.indiashelter.in/api'

// const FACE_LIVE_PATRON_ID = "645b2c8e0a44553bfc008178"

// const FACE_LIVE_AUTHORIZATION_RES_HEADER = "CSmfXuWqzNOWWvtdmTtr2McyXNR9cto1V3MKLebp6fabBYfZaw2g23439ABYdqmc"

// const FACE_LIVE_FL_REQ_HEADER = "da6HtUuk1tbjj0EFOdlXbuR5CHPxfROnxm93jtmQkTmIQPV4D3j4A1ICxoicyr2c"

// const IMAGE_URL_FOR_PDF_UPLOAD = "https://itrustuat.indiashelter.in:6443/api/doc/get/c7602316-2024-4559-b9b5-8f8c2b9c888f-pdf1.jpg"
// const FACE_LIVE_PERCENTAGE = 70

// const API_URL = 'http://localhost:8005/api'

//const FACE_LIVE_PATRON_ID = "645b2c8e0a44553bfc008178"

//const FACE_LIVE_AUTHORIZATION_RES_HEADER = "CSmfXuWqzNOWWvtdmTtr2McyXNR9cto1V3MKLebp6fabBYfZaw2g23439ABYdqmc"

//const FACE_LIVE_FL_REQ_HEADER = "da6HtUuk1tbjj0EFOdlXbuR5CHPxfROnxm93jtmQkTmIQPV4D3j4A1ICxoicyr2c"

//const IMAGE_URL_FOR_PDF_UPLOAD = "https://itrustuat.indiashelter.in:6443/api/doc/get/c7602316-2024-4559-b9b5-8f8c2b9c888f-pdf1.jpg"
//const FACE_LIVE_PERCENTAGE = 70


const lead_by_pass = false;

const form_bypass = false;

const crifErrorhandle = true;
const requestOptions = {};

const bre_timeout = 90000;

axiosRetry(axios, { retries: 0 });

// COMMENTED FOR TESTING 
// axios.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle error globally

//     if (error.response.status == 403 || error.response.status == 401) {
//       window.location.replace('/login');
//     }

//     // Pass the error to the next handler
//     return Promise.reject(error);
//   },
// );



// OTP ON CALL

export async function getOTPonCall(mobile_no,body) {
  try {
    const res = await axios.post(`${API_URL}/account/text-on-call-otp/${mobile_no}`,body||{});
    return res;
  } catch (error) {
    return {
      error: true,
      message: error.response.data.message,
      fail_count: error.response.data.fail_count,
    };
  }
}

async function pingAPI() {
  const res = await axios.get(`${API_URL}`, {}, requestOptions);
  return res.data;
}

async function checkIsValidStatePincode(pincode, options) {
  try {
    const res = await axios.get(`${API_URL}/state-pin/${pincode}`, options, requestOptions);
    return res.data;
  } catch (error) {
    return false;
  }
}

async function coLateralCheckIsValidStatePincode(pincode, options) {
  try {
    const res = await axios.get(`${API_URL}/colateral-state-pin/${pincode}`, options, requestOptions);
    return res.data;
  } catch (error) {
    return false;
  }
}


async function editReferenceById(id, referenceData, options) {
  if (!id) return;

  const res = await axios.patch(`${API_URL}/reference/edit/${id}`, referenceData, options);
  return res.data;
}

async function editPropertyById(id, propertyData, options) {
  if (!id) return;

  const res = await axios.patch(`${API_URL}/property/edit/${id}`, propertyData, options);
  return res.data;
}

//WORK AND INCOME SCREEN

async function getCompanyNamesList(options) {
  const res = await axios.get(`${API_URL}/company-list`, options);
  return res.data;
}

//WORK AND INCOME SCREEN

async function getAABankList(options) {
  const res = await axios.get(`${API_URL}/bank-list`, options);
  return res.data;
}

//LOGIN SCREEN

async function getLoginOtp(mobile_no, data) {
  try {
    const res = await axios.post(`${API_URL}/account/login-sms-otp-request/${mobile_no}`, data);
    return res.data;
  } catch (error) {
    return {
      error: true,
      message: error.response.data.message,
      fail_count: error.response.data.fail_count,
    };
  }
}

// async function verifyLoginOtp(mobile_no, otp) {
//   const res = await axios.post(
//     `${API_URL}/account/login-sms-otp-verify/${mobile_no}`,
//     otp,
//     requestOptions,
//   );
//   return res.data;
// }

async function verifyLoginOtp(mobile_no, otp,faceLogin) {

  let res;

  if(faceLogin == true) {

    res = await axios.post(
    `${API_URL}/account/face-login/${mobile_no}`,
    {},
    requestOptions,
  );
  }
  else{
    
   res = await axios.post(
    `${API_URL}/account/login-sms-otp-verify/${mobile_no}`,
    otp,
    requestOptions,
  );

}
  return res.data;
}

async function logout(status, options) {
  const res = await axios.post(`${API_URL}/account/user/logout`, status, options);
  return res.data;
}

async function testLogout(options) {
  const res = await axios.post(`${API_URL}/session/check-auth/login`, {}, options);
  return res.data;
}

async function getAllDbUsers(options) {
  const res = await axios.get(`${API_URL}/account`, options);
  return res.data;
}

async function checkLoanOfficerExists(number) {
  const res = await axios.get(`${API_URL}/account/r/check-if-user-exists/${number}`);
  return res.data;
}

//RESET PASSWORD/CREATE PASSWORD SCREEN

async function getOTPForResetPassword(data) {
  const res = await axios.post(`${API_URL}/account/reset-password-otp-request`, data);
  return res.data;
}

async function verifyOTPForResetPassword(data) {
  const res = await axios.post(`${API_URL}/account/reset-password-otp-verify`, data);
  return res.data;
}

async function setPassword(data) {
  const res = await axios.post(`${API_URL}/account/set-password`, data);
  return res.data;
}

//BRE SCREEN

async function verifyPan(id, data, options) {
  const res = await axios.post(`${API_URL}/applicant/pan/${id}`, data, 
   {...options,
    timeout: bre_timeout,
    'axios-retry': {
      retries: 3,
      retryCondition: () => true,
    },
  }
  );

  return res.data;
}

async function verifyDL(id, data, options) {
  const res = await axios.post(`${API_URL}/applicant/driver-license/${id}`, data,// {
    options,
    // timeout: bre_timeout,
    // 'axios-retry': {
    //   retries: 3,
    //   retryCondition: () => true,
    // },
  //});
  options,
)

  return res.data;
}

async function verifyVoterID(id, data, options) {
  const res = await axios.post(`${API_URL}/applicant/voter/${id}`, data, {
    ...options,
    timeout: bre_timeout,
    'axios-retry': {
      retries: 3,
      retryCondition: () => true,
    },
  });

  return res.data;
}

async function verifyGST(id, options) {
  const res = await axios.post(
    `${API_URL}/work-income/gst/${id}`,
    {},
    {
      ...options,
      timeout: bre_timeout,
      'axios-retry': {
        retries: 3,
        retryCondition: () => true,
      },
    },
  );

  return res.data;
}

async function verifyPFUAN(id, options) {
  const res = await axios.post(
    `${API_URL}/applicant/uan/${id}`,
    {},
    {
      ...options,
      timeout: bre_timeout,
      'axios-retry': {
        retries: 3,
        retryCondition: () => true,
      },
    },
  );

  return res.data;
}

async function checkDedupe(id, options) {
  const res = await axios.post(
    `${API_URL}/applicant/dedupe/${id}`,
    {},
    {
      ...options,
      timeout: bre_timeout,
      'axios-retry': {
        retries: 3,
        retryCondition: () => true,
      },
    },
  );
  return res;
}

async function checkBre99(id, options) {
  const res = await axios.post(
    `${API_URL}/applicant/bre-99/${id}`,
    {},
    {
      ...options,
      timeout: bre_timeout,
      'axios-retry': {
        retries: 3,
        retryCondition: () => true,
      },
    },
  );
  return res.data;
}

async function checkCibil(id, options) {
  const res = await axios.post(
    `${API_URL}/applicant/cibil/${id}`,
    {},
    {
      ...options,
      timeout: bre_timeout,
      'axios-retry': {
        retries: 3,
        retryCondition: () => true,
      },
    },
  );
  return res;
}

async function checkCrif(id, options) {
  const res = await axios.post(
    `${API_URL}/applicant/crif/${id}`,
    {},
    {
      ...options,
      timeout: bre_timeout,
      'axios-retry': {
        retries: 3,
        retryCondition: () => true,
      },
    },
  );
  return res;
}

async function checkCrifHighmark(id, options) {
  const res = await axios.post(
    `${API_URL}/applicant/crif-highmark/${id}`,
    {},
    {
      ...options,
      timeout: bre_timeout,
      'axios-retry': {
        retries: 3,
        retryCondition: () => true,
      },
    },
  );
  return res;
}

async function checkBre101(id, options) {
  const res = await axios.post(
    `${API_URL}/lead/bre-101/${id}`,
    {},
    {
      ...options,
      timeout: bre_timeout,
      'axios-retry': {
        retries: 3,
        retryCondition: () => true,
      },
    },
  );
  return res.data;
}

async function checkBre201(id, options) {
  const res = await axios.post(
    `${API_URL}/applicant/bre-201/${id}`,
    {},
    {
      ...options,
      timeout: bre_timeout,
      'axios-retry': {
        retries: 3,
        retryCondition: () => true,
      },
    },
  );
  return res.data;
}

async function pushToSalesforce(id, options) {
  const res = await axios.get(`${API_URL}/lead/salesforce-push/${id}`, {
    ...options,
  });
  return res.data;
}

// push to salesforce document

async function pushToSalesforceDocs(id, options) {
  const res = await axios.get(`${API_URL}/lead/salesforce-push-docs/${id}`, {
    ...options,
  });
  return res.data;
}

// service query to salesforce

async function serviceQueryPushToSalesforce(id, options) {
  const res = await axios.get(`${API_URL}/lead/serviceQuery_salesforce/${id}`, {
    ...options,
  });
  return res.data;
}

async function getLeadById(id, options) {
  if (!id) return;
  const res = await axios.get(`${API_URL}/lead/${id}`, options);
  return res.data;
}

// UPLOAD DOCUMENT

axios.interceptors.request.use((config) => {
  config.onUploadProgress = (progressEvent) => {
    console.log("Progress Event:", progressEvent); // Log progress here
  };
  return config;
});

async function uploadDoc(data, options) {
  const res = await axios.post(`${API_URL}/doc/upload/document`, data, options);
  return res.data;
}

async function editDoc(id, data, options) {
  const res = await axios.patch(`${API_URL}/doc/edit/${id}`, data, options);
  return res.data;
}

async function getApplicantById(id, options,include) {

  let res;

  if(include && include?.length){
    res = await axios.get(`${API_URL}/applicant/${id}?include=${include}`, options);

    return res.data;
  }

  res = await axios.get(`${API_URL}/applicant/${id}`, options);
  return res.data;
}

async function reUploadDoc(id, data, options) {
  const res = await axios.post(`${API_URL}/doc/upload/document/re-upload/${id}`, data, options);
  return res.data;
}

async function getUploadOtp(id, lead_id,options) {
  const res = await axios.get(`${API_URL}/doc/send-lo-selfie-sms/${id}/${lead_id}`, options, requestOptions);
  return res;
}

async function verifyUploadOtp(id, otp, options) {
  const res = await axios.post(`${API_URL}/doc/verify-lo-selfie-sms/${id}`, { otp }, options);
  return res;
}

async function getUserById(id, options) {
  const res = await axios.get(`${API_URL}/account/${id}`, options);
  return res.data;
}

function NaNorNull(value, toReturn = null) {
  return isNaN(value) ? toReturn : value;
}

const MAX_ALLOWED_YEAR = 18;
function isEighteenOrAbove(date) {
  if (!date || typeof date !== 'string') return false;
 
  // Expecting YYYY-MM-DD
  const dateParts = date.split('-').map(Number);
  if (dateParts.length !== 3 || dateParts.some((n) => Number.isNaN(n))) return false;
 
  const [year, month, day] = dateParts;
  const birthDate = new Date(year, month - 1, day);
  if (isNaN(birthDate.getTime())) return false;
 
  const today = new Date();
  const MIN_ALLOWED_AGE = 18;
  const MAX_ALLOWED_AGE = 80;
 
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  const dayDifference = today.getDate() - birthDate.getDate();
 
  // Adjust age if birthday hasn't occurred yet this year
  if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
    age -= 1;
  }
 
  // Under minimum
  if (age < MIN_ALLOWED_AGE) return false;
 
  // Over maximum
  if (age > MAX_ALLOWED_AGE) return false;
 
  return true;
}
function isEighteenOrAbove_old(date) {
  const today = new Date();
  const [year, month, day] = date.split('-').map(Number);
  const birthDate = new Date(year, month - 1, day);

  const MIN_ALLOWED_AGE = 18;
  const MAX_ALLOWED_AGE = 90;

  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  const dayDifference = today.getDate() - birthDate.getDate();

  // Check minimum age (18+)
  if (
    age < MIN_ALLOWED_AGE ||
    (age === MIN_ALLOWED_AGE && (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)))
  ) {
    return false; // Under minimum age
  }

  // Check maximum age (65 and below)
  if (
    age > MAX_ALLOWED_AGE ||
    (age === MAX_ALLOWED_AGE && (monthDifference > 0 || (monthDifference === 0 && dayDifference > 0)))
  ) {

    console.log("AGE><__",age)
    return false; // Over maximum age
  }

  return true; // Age is within 18-65

}


//payment api select url


async function getActiveLNT_API(options) {

  const res = await axios.post(`${API_URL}/applicant/active-payment-api`,{},options);

  return res?.data;

}


async function getEmailOtp(id, options,email) {
  const res = await axios.get(`${API_URL}/personal/send-email/${id}/${email}`, options);
  return res;
}

async function verifyEmailOtp(id, otp, options) {
  const res = await axios.post(`${API_URL}/personal/verify-email/${id}`, { otp }, options);
  return res;
}

async function editFieldsById(id, page, values, options) {
  if (!id) return;
  const { data } = await axios.patch(`${API_URL}/${page}/edit/${id}`, values, options);
  return data;
}

// for next buttotn update


export async function editNextUpdate(id, page, values, options) {
  if (!id) return;
  const { data } = await axios.patch(`${API_URL}/${page}/next/${id}`, values, options);
  return data;
}
// applicant next update
export async function applicantNextUpdate(id, page, values, options) {
  if (!id) return;
  const { data } = await axios.patch(`${API_URL}/${page}/applicant-next/${id}`, values, options);
  return data;
}


async function addApi(page, values, options) {
  const { data } = await axios.post(`${API_URL}/${page}/add`, values, options);
  return data;
}

async function getMobileOtp(id, options,type){
  // let res = await axios.get(`${API_URL}/applicant/send-sms/${id}`, options, requestOptions);

  let res;



  if(type == "form-otp"){
    res =  await axios.get(`${API_URL}/applicant/send-sms/${id}?type=form-otp`, options, requestOptions);
  }

  else{
    res = await axios.get(`${API_URL}/applicant/send-sms/${id}`, options, requestOptions);
  }
  return res;
}

async function verifyMobileOtp(id, otp, options,type) {

  // let res = await axios.post(`${API_URL}/applicant/verify-sms/${id}`, { otp }, options);
 let res;
  if(type == "form-otp"){
      res = await axios.post(`${API_URL}/applicant/verify-sms/${id}?type=form-otp`, { otp }, options);
  }
  else{
      res = await axios.post(`${API_URL}/applicant/verify-sms/${id}`, { otp }, options);
  }
  return res;
}

async function editAddressById(id, data, options) {
  if (!id) return;
  const res = await axios.patch(`${API_URL}/address/edit/${id}`, data, options);
  return res;
}

// L&T
export async function getLnTChargesQRCode(leadId, options,gateway) {     //payment-qr
  const { data } = await axios.post(`${API_URL}/lt-charges/${gateway=='easebuzz'?'payment-qr-ease-buzz':'payment-qr'}/${leadId}`, {}, options);
  return data;
}

const REQUEST_TIMEOUT = 30 * 1000; // 30 seconds

// export async function checkPaymentStatus(leadId, body, options) {
//   const controller = new AbortController();
//   setTimeout(() => {
//     controller.abort();
//   }, REQUEST_TIMEOUT);
//   const { data } = await axios.post(
//     `${API_URL}/lt-charges/payment-verify/${leadId}`,
//     body?body:{},
//     {
//       ...options,
//       signal: controller.signal,
//     },
//   );

//   return data;
// }


export async function checkPaymentStatus(leadId, body = {}, options = {}) {
  console.log('checkPaymentStatus called with:', { leadId, body, options });

  if(!leadId) {
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.warn('Request aborted due to timeout');
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const { data } = await axios.post(
      `${API_URL}/lt-charges/payment-verify/${leadId}`,
      body,
      {
        ...options,
        signal: controller.signal,
      },
    );
    clearTimeout(timeoutId);
    console.log('Response received:', data);
    return data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.error('Request was canceled', error.message);
    } else {
      console.error('An error occurred:', error);
    }
    throw error;
  }
}


//test login hyperverge


async function HypervergeLogin(data, options) {
  const res = await axios.post(`${API_URL}/doc/fL_hyperverge_login`, data, options);
  return res.data;
}

export async function checkIfLntExists(leadId, options) {
  const { data } = await axios.get(`${API_URL}/lt-charges/check-lead-payment/${leadId}`, options);
  return data;
}

export async function addLnTCharges(leadId, options,bypass,temp) {

  let body;

  if(bypass == true){
    body = leadId;
  }

  else {
    body = {lead_id:leadId}
  }
  const { data } = await axios.post(
    `${API_URL}/lt-charges/add/`,
    body,
    options,
  );
  return data;
}

export async function doesLnTChargesExist(leadId) {
  try {
    const { data } = await axios.get(`${API_URL}/lt-charges/by-lead/${leadId}`);
    return {
      data,
      success: true,
    };
  } catch (err) {
    return {
      err,
      success: false,
    };
  }
}

export async function makePaymentByCash(id, options) {
  try {
    const { data } = await axios.patch(
      `${API_URL}/lt-charges/edit/${id}`,
      {
        method: 'Cash',
        status: 'Completed',
      },
      options,
    );
    return data;
  } catch (err) {
    console.error(err);
  }
}

export async function editLnTCharges(id, values) {
  try {
    const { data } = await axios.patch(`${API_URL}/lt-charges/edit/${id}`, values);
    return data;
  } catch (err) {
    console.error(err);
  }
}

export async function makePaymentByLink(id, values, options) {
  try {
    const { data } = await axios.post(
      `${API_URL}/lt-charges/invoice-create/${id}`,
      values,
      options,
    );
    return data;
  } catch (err) {
    console.log(err);
  }
}

export async function getDashboardLeadById(id, options) {
  try {
    const { data } = await axios.get(`${API_URL}/dashboard/lead/${id}`, options);
    return data;
  } catch (err) {
    return err;
  }
}


export async function getPaginatedData({
  // dd-mm-yyyy
  fromDate,
  toDate,
},
options,
skip,take,
type,id){


  fromDate = moment(fromDate).format('DD-MM-YYYY');
  toDate = moment(toDate).format('DD-MM-YYYY');

  try {
    const { data } = await axios.get(
      `${API_URL}/dashboard/lead-list/paginated?fromDate=${fromDate}&toDate=${toDate}&skip=${skip}&take=${take}&type=${type}&LoId=${id}`,
      options,
    );
    // const { data } = await axios.get(`${API_URL}/dashboard/lead-list/l`, values);
    return data;
  } catch (err) {
    console.log(err);
  }
}

export async function getDashboardLeadList(
  {
    // dd-mm-yyyy
    fromDate,
    toDate,
  },
  options,
  skip,take
) {
  fromDate = moment(fromDate).format('DD-MM-YYYY');
  toDate = moment(toDate).format('DD-MM-YYYY');

  try {
    const { data } = await axios.get(
      `${API_URL}/dashboard/lead-list/l?fromDate=${fromDate}&toDate=${toDate}&skip=${skip}&take=${take}`,
      options,
    );
    // const { data } = await axios.get(`${API_URL}/dashboard/lead-list/l`, values);
    return data;
  } catch (err) {
    console.log(err);
  }
}

//admin
async function getUsersList(values, options) {
  try {
    const { data } = await axios.post(`${API_URL}/admin/get-user-list`, values, options);
    return data;
  } catch (error) {
    throw new Error(error);
  }
}

async function addUser(values, options) {
  const { data } = await axios.post(`${API_URL}/admin/add-user/`, values, options);
  return data;
}

async function editUser(id, values, options) {
  const { data } = await axios.post(`${API_URL}/admin/edit-user/${id}`, values, options);
  return data;
}

async function deleteUser(id, options) {
  try {
    const { data } = await axios.post(`${API_URL}/admin/delete-user/${id}`, {}, options);
    return data;
  } catch (error) {
    throw new Error(error);
  }
}

async function getUserRoles(options) {
  try {
    const { data } = await axios.get(`${API_URL}/admin/get-user-roles`, options);
    return data;
  } catch (error) {
    throw new Error(error);
  }
}

async function getUserBranches(options) {
  try {
    const { data } = await axios.get(`${API_URL}/admin/get-user-branches`, options);
    return data;
  } catch (error) {
    throw new Error(error);
  }
}

async function getUserDepartments(options) {
  try {
    const { data } = await axios.get(`${API_URL}/admin/get-user-departments`, options);
    return data;
  } catch (error) {
    throw new Error(error);
  }
}

async function getLogs(params, options) {
  const res = await axios.get(`${API_URL}/admin/get-activity-logs/?${params}`, options);
  return res.data;
}

//EKYC
async function generateEkycOtp(data, options) {
  const res = await axios.post(`${API_URL}/ekyc/generate-otp/`, data, options);
  return res.data;
}

async function validateEkycOtp(data, options) {
  const res = await axios.post(`${API_URL}/ekyc/validate-otp/`, data, options);
  return res.data;
}

async function performBiometric(data, options) {
  const res = await axios.post(`${API_URL}/ekyc/perform-ekyc-biometric/`, data, options);
  return res.data;
}

//OCR
async function performOcr(data, options) {
  const res = await axios.post(`${API_URL}/ocr/r/`, data, options);
  return res.data;
}

async function lo_check(option) {
  try {
  // Make a POST request with data in the request body
  const response = await axios.post(`${API_URL}/account/lo_user`, option);
  // Handle the response data

  console.log('API Response:', response.data);
  // You can store the response data for later use
  const storedData = response.data;
  // You can return the data or perform other operations here
  return storedData;
  } catch (error) {
  // Handle errors
  //console.error('Error posting data:', error.message);
  throw error; // You can choose to handle or propagate the error
  }
  }

  async function faceLiveness(data, options) {
    const res = await axios.post(`${API_URL}/doc/fL_create_url`, data, options);
    return res.data;
  }

  async function bcpKeyCheck(options) {
    const res = await axios.get(`${API_URL}/doc/upload/bcp-key-check`, options);
    return res.data;
  }
  
  async function faceLivenesScore(data, options) {
    const res = await axios.post(`${API_URL}/doc/fL_response_url`, data, options);
    return res.data;
  }

  async function faceLivenesHyperverge(data, options) {
    const res = await axios.post(`${API_URL}/doc/fL_create_url_hyperverge`, data, options);
    return res.data;
  }

  async function faceLivenesResponseHyperverge(data, options) {
    const res = await axios.post(`${API_URL}/doc/fL_response_url_hyperverge`, data, options);
    return res.data;
  }

  async function faceLivenesBase64(data, options) {

    const res = await axios.post(`${API_URL}/doc/fL_base64_url`, data, options);
    return res.data;
  }

  async function uploadDocFace(data, options,getProgress) {

    const res = await axios.post(`${API_URL}/doc/upload/document/face-livliness`, data, options);
    return res.data;
  }

  // live photo update api after faceliveness


  async function updateLivePhoto(data,options) {  //update-customer-photo-liveness

    const res = await axios.post(`${API_URL}/doc/update-customer-photo-liveness`,data,options)

    return res.data;
  }

 async function base64ConersionApi(data,options) {

    const res = await axios.post(`${API_URL}/doc/upload/document/imageLink/${data}`,options);


    return res.data;
  }

  // cse assign

  async function case_assign(id, options) {
    console.log(id);
    const res = await axios.get(`${API_URL}/case-assign/loID/${id}`, options);
    return res.data;
  }

  // async function uploadCsvColateralStatePin(values, options) {
  //   const { data } = await axios.post(`${API_URL}/admin/upload-csv-colateral-state-pin`, values, options);
  //   return data;
  // }

  // admin routes

  async function uploadCsv(values, options) {
    const { data } = await axios.post(`${API_URL}/admin/upload-csv`, values, options);
    return data;
  }


  async function uploadCsvStatePin(values, options) {
    const { data } = await axios.post(`${API_URL}/admin/upload-csv-state-pin`, values, options);
    return data;
  }

  async function uploadCsvColateralStatePin(values, options) {
    const { data } = await axios.post(`${API_URL}/admin/upload-csv-colateral-state-pin`, values, options);
    return data;
  }


  async function uploadCsvBranchMaster(values, options) {
    const { data } = await axios.post(`${API_URL}/admin/upload-csv-branch-master`, values, options);
    return data;
  }

  // changes regarding master
  async function getDSA(id,options){
    const res = await axios.get(`${API_URL}/dsa/getdsa/${id}`, options);
    return res.data;
  }

  async function getConnector(id,options){
    const res = await axios.get(`${API_URL}/connector/getconnector/${id}`, options);
    return res.data;
  }


  async function getPropertyPapers(values, options) {
    const data = await axios.post(`${API_URL}/property/check-property-papers`, values, options);
    return data;
  }

  async function getPropertyPaperValues(state, options) {
    const data = await axios.get(`${API_URL}/property/property-paper-types/${state}`, options);
    return data;
  }


  async function getLeadSource(options){
    const res = await axios.get(`${API_URL}/leadsource`, options);
    return res.data;
  }
  async function checkLntBre101(id, options) {
  const res = await axios.post(
    `${API_URL}/lead/lntbre-101/${id}`,
    {},
    {
      ...options,
      timeout: bre_timeout,
      'axios-retry': {
        retries: 3,
        retryCondition: () => true,
      },
    },
  );
  return res.data;
}

export async function LODashboardLeadList(
  {
    // dd-mm-yyyy
    fromDate,
    toDate,
    id
  },
  options,
) {
  fromDate = moment(fromDate).format('DD-MM-YYYY');
  toDate = moment(toDate).format('DD-MM-YYYY');

  try {
    const { data } = await axios.get(
      `${API_URL}/dashboard/lo_data/l?fromDate=${fromDate}&toDate=${toDate}&lo_id=${id}`,
      options,
    );
    return data;
  } catch (err) {
    console.log(err);
  }
}

export async function getLODetails(id, options) {
  try {
    const { data } = await axios.get(`${API_URL}/dashboard/lo_details/l`, options);
    return data;
  } catch (err) {
    return err;
  }
}

// get lead status API

export async function getLeadStatusApi(id,options) {
  try {
    const { data } = await axios.get(`${API_URL}/dashboard/lead-status/${id}`,options);
    return data;
  } catch (err) {
    return err;
  }
}



//** CONFIG VIPUL */

async function maintenanceConfiguration(values, options){
  try {
    const { data } = await axios.post(`${API_URL}/admin/maintenance-configuration`, values, options);
    return data;

  } catch (error) {
    throw new Error(error);

  }

}

async function populateOCR (id,data, options) {
  const res = await axios.post(`${API_URL}/ocr/populate/${id}`,data, options);
  return res.data;
}

async function rejectOcrApi (id,data, options) {
  const res = await axios.post(`${API_URL}/ocr/reject/${id}`,data, options);
  return res.data;
}


async function getMaintenanceConfiguration(options){
  const data = await axios.get(`${API_URL}/maintenance-configuration/active`, options)
  return data
}



//**DOWNTIME */

async function downTimeList(options){
  const {data}  = await axios.get(`${API_URL}/admin/down-time-list`, options);
  return data
}

//reset the qualifier on rejection from BM in first 4 screens   ** only for BM Module **

 async function resetLeadQualifier(id,values,options) {
  try {
    const { data } = await axios.post(`${API_URL}/applicant/reset/qualifier/${id}`, values, options);
    return data;
  }
  catch(err) {
    return err
  }

}


async function deleteBanking (id,values,options) {
  try {
    const { data } = await axios.patch(`${API_URL}/applicant/banking-reject/${id}`, values, options);
    return data;
  }
  catch(err) {
    return err
  }
}

async function updateBureauType (id,options) {
  try {
    const { data } = await axios.patch(`${API_URL}/applicant/bureau-type/${id}`, {}, options);
    return data;
  }
  catch(err) {
    return err
  }
}

 async function refreshBMHistory(leadId,applicant,options) {
  try {
    const { data } = await axios.patch(`${API_URL}/applicant/resubmit/${leadId}/${applicant}`, {}, options);
    return data;
  }
  catch(err) {
    return err
  }

}


async function updateProgressOnUpload(id,options) {

  try{

    const data = await axios.patch(`${API_URL}/personal/update-progress/${id}`,{},options)

    return data

  }
  catch(err){
    return err
  }
}



async function getBmAndLoCodes(options) {
  const res = await axios.get(`${API_URL}/admin/get-bm-lo-users-code`, options);
  return res;
}

async function loBmRelation (values, options) {
  const { status, message } = await axios.post(`${API_URL}/admin/lo-bm-relation`, values, options);
  return { status, message };
}

async function getBmAndLoList(options) {
  const {data} = await axios.get(`${API_URL}/admin/get-bm-lo-users-list`, options);
  return data;
}

async function getUserLeads(loId, options) {
  const {data} = await axios.get(`${API_URL}/admin/get-user-leads/${loId}`, options);
  return data;
}

async function updateLeadLo(values, options) {
  const data = await axios.post(`${API_URL}/admin/update-lead-assignee`, values, options);
  return data;
}

async function getUserMappingList(options){
 const {data} = await axios.get(`${API_URL}/admin/user-mapping-list`,options)
 return data;
}

async function deleteUserMapping(id,options){
  const data = await axios.delete(`${API_URL}/admin/delete-user-mapping/${id}`,options)
  return data;
}


export async function pushToSalesforceDocsService(id, options) {
  const res = await axios.get(`${API_URL}/lead/serviceQuery_salesforce-docs/${id}`, {
    ...options,
  });
  return res.data;
}

async function addRemarkLogs(page, values, options) {
  const { data } = await axios.post(`${API_URL}/${page}/remark-logs`, values, options);
  return data;
}

async function getRemarkLogs(lead_id, options) {
  const { data } = await axios.get(`${API_URL}/bm-remarks/history/${lead_id}`, options);
  return data;
}

// make it primary update

export async function updatePrimary(id, page, values, options) {   //new merge
  if (!id) return;
  const { data } = await axios.patch(`${API_URL}/${page}/primary-switch/${id}`, values, options);
  return data;
}


export async function addFaceAuth(id,values) {

  if(!id) return;

  const {data} = await axios.post(`${API_URL}/ekyc/add-face-auth/${id}`,values);

  return data;
}


export async function getFaceAuthStatus(id) {

  if(!id) return;

  const {data} = await axios.get(`${API_URL}/ekyc/get-face-auth-status/${id}`);

  return data;
}


export async function sendSMSGlobal(id,type) {

  if(!id || !type) return;

  const {data} = await axios.post(`${API_URL}/account/send-sms-global/${type}/${id}`);

  return data;
  
}


export async function getApplicantMissingData(id,options) {

  if(!id) return;

  const {data} = await axios.get(`${API_URL}/applicant/applicant-data/${id}`,options);

  return data;
  
}



export async function checkLeadRule(options) {

  const {data} = await axios.post(`${API_URL}/applicant/lead-rule-check`,{},options);

  return data;
  
}

export async function searchLead(query,From,ToDate,options) {

  From = moment(From).format('DD-MM-YYYY');
  ToDate = moment(ToDate).format('DD-MM-YYYY');

  const {data} = await axios.get(`${API_URL}/dashboard/search/${query}?fromDate=${From}&toDate=${ToDate}`,options);

  return data;
  
}



export async function getIncentiveData(body,options) {

  const {data} = await axios.post(`${API_URL}/account/get-incentives`,body,options);

  return data;
  
}

   async function uploadIncentive(values, options) {
    const { data } = await axios.post(`${API_URL}/admin/upload-csv-incentive`, values, options);
    return data;
  }

  export async function getContestUrl(id,options){

  const {data} = await axios.get(`${API_URL}/dashboard/get-contest-url/${id}`,options);

  return data


  
}

  export async function getContestDataExisting(role,options){

  const res = await axios.get(`${API_URL}/admin/get-existing-contest-urls/${role}`,options);

  return res.data;

    }


  export async function uploadContestImage(role,data,options){

  const res = await axios.post(`${API_URL}/admin/upload-contest-image/${role}`,data,options);

  return res.data;

    }

  export async function updateSingleLead(id,options){
    const {data} = await axios.get(`${API_URL}/dashboard/lead-status-single/${id}`,options);

    return data;
  }


    export async function createApplicationForm(id,options,ifEmail){

    let res;

      if(ifEmail){

        res = await axios.get(`${API_URL}/doc/create-application-form/${id}?email=true`,options);
      }

      else{
        res = await axios.get(`${API_URL}/doc/create-application-form/${id}`,options);
      }

    return res?.data;
  }


    export async function performanceLogin(options){

     let res = await axios.post(`${API_URL}/applicant/performance-login`,{},options);


    return res?.data;
  }


    export async function editUploadFlags(id,options){

     let res = await axios.patch(`${API_URL}/applicant/active-change/${id}`,{},options);


    return res?.data;
  }


  export async function checkFaceMatchScore(id,options){

    const result = await axios.post(`${API_URL}/applicant/faceMatchHyperverge/${id}`,{},options);

    return result?.data

  }

export async function createVisit(data, options = {}) {
  const res = await axios.post(`${API_URL}/visit`, data, options);
  return res?.data;
}
export async function updateVisit(id,data, options = {}) {
  const res = await axios.post(`${API_URL}/visit/${id}`, data, options);
  return res?.data;
}
export async function getAllVisits({fromDate,toDate,query,lo_id},options) {
  fromDate = moment(fromDate).format('DD-MM-YYYY');
  toDate = moment(toDate).format('DD-MM-YYYY');
  const res = await axios.get(`${API_URL}/visit?fromDate=${fromDate}&toDate=${toDate}&search=${query}&lo_id=${lo_id}` ,options);
  return res?.data;
}
export async function searchVisit(query,From,ToDate,lo_id,options) {
  From = moment(From).format('DD-MM-YYYY');
  ToDate = moment(ToDate).format('DD-MM-YYYY');
  const {data} = await axios.get(`${API_URL}/visit/search/${query}?fromDate=${From}&toDate=${ToDate}&loId=${lo_id}`,options);

  return data;
  
}
export async function getSingleVisit(id, options = {}) {
  const res = await axios.get(`${API_URL}/visit/${id}`, options);
  return res?.data;
}
export async function getVisitMobileOtp(mobileNumber,values, options){
  console.log(mobileNumber,values, options)

  let res = await axios.post(`${API_URL}/applicant/visit-send-sms/${mobileNumber}`,values, options)
  
  return res;

}
export async function verifyVisitMobileOtp(data, options,type) {

 let res = await axios.post(`${API_URL}/applicant/visit-verify-sms`,data, options);

  return res;
}
  //create-application-form


const secretKey = "3cT0Yk2R7!wT9@hQ6Gv#1eLb8zXm$JpF";
export async function getLoImage(username){

    const result = await axios.get(`${API_URL}/account/get-lo-image/${username}`);

    return result?.data

  }
  export const HEX_KEY_FACE_LOGIN = "4f6b9b2c7e9a1d8c3f2a0b9e4d6c1a8f7e9b0a2c3d4e5f60718293a4b5c6d7e8"

export {
  API_URL,
  FACE_LIVE_PATRON_ID,
  FACE_LIVE_AUTHORIZATION_RES_HEADER,
  FACE_LIVE_FL_REQ_HEADER,
  IMAGE_URL_FOR_PDF_UPLOAD,
  crifErrorhandle,
  pingAPI,
  NaNorNull,
  isEighteenOrAbove,
  checkIsValidStatePincode,
  coLateralCheckIsValidStatePincode,
  getEmailOtp,
  verifyEmailOtp,
  editReferenceById,
  editPropertyById,
  editFieldsById,
  getCompanyNamesList,
  editAddressById,
  getMobileOtp,
  verifyMobileOtp,
  addApi,
  getLoginOtp,
  verifyLoginOtp,
  logout,
  testLogout,
  getAllDbUsers,
  getOTPForResetPassword,
  verifyOTPForResetPassword,
  setPassword,
  verifyPan,
  verifyDL,
  verifyVoterID,
  verifyGST,
  verifyPFUAN,
  checkDedupe,
  checkBre99,
  checkCibil,
  checkCrif,
  checkBre101,
  checkBre201,
  pushToSalesforce,
  getLeadById,
  uploadDoc,
  getApplicantById,
  getUploadOtp,
  verifyUploadOtp,
  reUploadDoc,
  getUserById,
  editDoc,
  checkLoanOfficerExists,
  getUsersList,
  addUser,
  editUser,
  deleteUser,
  getUserRoles,
  getUserBranches,
  getUserDepartments,
  generateEkycOtp,
  validateEkycOtp,
  performBiometric,
  performOcr,
  getLogs,
  lo_check,
  faceLiveness,
  faceLivenesHyperverge,
  faceLivenesResponseHyperverge,
  bcpKeyCheck,
  faceLivenesScore,
  uploadDocFace,
  base64ConersionApi,
  case_assign,
  serviceQueryPushToSalesforce,
  uploadCsvColateralStatePin,
  getAABankList,
  pushToSalesforceDocs,
  uploadCsv,
  uploadCsvStatePin,
  uploadCsvBranchMaster,
  getDSA,
  getConnector,
  getLeadSource,
  checkLntBre101,
  resetLeadQualifier,
  refreshBMHistory,
  getBmAndLoCodes,
  loBmRelation,
  getBmAndLoList,
  getUserLeads,
  updateLeadLo,
  getUserMappingList,
  deleteUserMapping,
  maintenanceConfiguration,
  getMaintenanceConfiguration,
  downTimeList,
  faceLivenesBase64,
  getPropertyPapers,
  getPropertyPaperValues,
  addRemarkLogs,
  getRemarkLogs,
  deleteBanking,
  lead_by_pass,
  updateProgressOnUpload,
  secretKey,
  getActiveLNT_API,
  HypervergeLogin,
  updateLivePhoto,
  VITE_FACE_LIVE_PERCENTAGE,
  start_downtime,
  end_downtime,
  downTimeMessage,
  by_pass_aggregator,
  single_payment,
  work_flow_liveness,
  uploadIncentive,
  form_bypass,
  checkCrifHighmark,
  populateOCR,
  updateBureauType,
  rejectOcrApi,
FACE_DETECTION_URL,
};