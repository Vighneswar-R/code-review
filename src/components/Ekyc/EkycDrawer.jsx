import { useContext, useEffect, useState, useCallback, useRef } from 'react';
import Button from '../Button';
import { IconClose } from '../../assets/icons';
import Radio from '../Radio';
import ConsentBox from '../ConsentBox';
import Popup from '../Popup';
import PropTypes from 'prop-types';
import EkycOtpInput from '../OtpInput/EkycOtpInput';
import ValidateScan from './ValidateScan';
import { LeadContext } from '../../context/LeadContextProvider';
import { AuthContext } from '../../context/AuthContextProvider';
import { editFieldsById, generateEkycOtp, validateEkycOtp,addFaceAuth,getFaceAuthStatus } from '../../global';
import TextInputWithEyeIcon from '../TextInput/TextInputWithEyeIcon';
import { Modal, Box, Typography} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { CircularProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { motion } from "framer-motion";





// Add ekyc methods
export const ekycMethods = [
  {
    label: 'OTP',
    value: 'otp',
  },
  {
    label: 'Biometrics',
    value: 'FMR',
  },
  // {
  //   label: 'Face Auth',
  //   value: 'FAUTH',
  // },
];
// Add activeMembers
export const activeMembers = [
  {
    label: 'Yes',
    value: true,
  },
  {
    label: 'No',
    value: false,
  },
];

// perform ekyc on, options
const idNumberOptions = [
  {
    label: 'Aadhaar',
    value: 'Aadhaar',
  },
  {
    label: 'VID',
    value: 'vid',
  },
];

// generate aadhaar otp returns otpTxnId which is required in validate otp
let otpTxnId;
const biometricKey =
  import.meta.env.VITE_MANTRA_BIOMETRIC_KEY ||'072333ea959dc2731942ccc9b95b80793f5c116318ba99c70589b0466b6e57a8a3265bfa0d90';
  //'0635457cb5902550bab01d6a3864deeab3c6cfb8012306d7716311b4b1a20a84f5ad74a58815';

const DISALLOW_CHAR = ['-', '_', '.', '+', 'ArrowUp', 'ArrowDown', 'Unidentified', 'e', 'E'];

export default function EkycDrawer({
  setOpenEkycPopup,
  setLoading,
  field_name,
  setRequiredFieldsStatus,
  openEkyc
}) {
  const ecsBioHelper = window.ecsBioHelper;
  const { setToastMessage, values, setValues, activeIndex, setFieldValue } =
    useContext(LeadContext);
  const { setErrorToastMessage, setErrorToastSubMessage, token } = useContext(AuthContext);

  // aadharInputDrawser states
  const [selectedIdOption, setSelectedIdOption] = useState('Aadhaar');
  const [isAadharInputDrawer, setIsAadharInputDrawer] = useState(true);
  const [aadhaarNo, setAadhaarNo] = useState('');
  const [aadhaarNoError, setAadhaarNoError] = useState('');
  const [show, setShow] = useState(false);

  const[processing,setProcessing] = useState(false)

  const[open,setOpen] = useState(false)


  // select kyc method screen states
  // otp will be default selected for ekyc
  const [performVerification, setPerformVerification] = useState(false);
  const [selectedEkycMethod, setSelectedEkycMethod] = useState('otp');
  const [selectedActiveMember, setSelectedActiveMember] = useState(null);
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [consent, setConsent] = useState('');
  const [deviceScanPopup, setDeviceScanPopup] = useState(false);
  // loading, error, success (default would be loading state)
  const [scanningState, setScanningState] = useState('loading');

  // verify OTP screen states
  const [maskedMobile, setMaskedMobile] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isVerifyOtp, setIsVerifyOtp] = useState(false);
  const [disabledVerifyButton,setDisableVerifyButton] = useState(false)
  const [isTimer, setIsTimer] = useState(true);

  const [disableFields, setDisableFields] = useState(false);

  const statusCheckRef = useRef(null)

  const[proceed,setProceed] = useState(null);

  const[pageLoader,setPageLoader] = useState(false)

  const[successAuth,setSuccessAuth] = useState(false);

  const [attemptsLeft, setAttemptsLeft] = useState(2);



  useEffect(() => {
  
 console.log('biometricKey '+biometricKey);	  
    // initiating biometricejs file
    if (!ecsBioHelper.init(biometricKey)) {
      console.log('ecsBioHelper terminate');
    }
  }, []);


  useEffect(()=> {
    setProcessing(false);
  },[performVerification,openEkyc])


  const updateManualPerformId = async(val) => {


    try{

      let existing_params = values?.applicants?.[activeIndex]?.applicant_details?.extra_params;

      let field =  field_name === 'id_type'?"is_ekyc_performed_id":"is_ekyc_performed_address"
          // ? { is_ekyc_performed_id: true }
          // : { is_ekyc_performed_address: true };

      const updated = await editFieldsById(values?.applicants?.[activeIndex]?.applicant_details?.id,'applicant',{extra_params:{...existing_params,[field]:true}},{
        headers: {
          Authorization: token,
        },
      },);

      aadharFlag(val);
      setSelectedActiveMember(val);

      if(val == false){
        setFieldValue(`applicants[${activeIndex}].applicant_details.extra_params.${field}`,true,);
      }

    }

    catch(err){

      console.log("error updating EKYC Perform ID ** LOCK ISSUE EXPECTED",err)
    }
  }

  function openApp() {
    // Check if the device is mobile
    const isMobile = /android/i.test(navigator.userAgent);

    // start the loader to manage the delay ** UI

    setPageLoader(true);

    // trigger sms function to be added : - 

    // Try opening the app using the deep link
    // window.location.href = "indiasheltercustomerapp://open";


    // let appOpened = false;

    // let ifRedirected;

    // // If mobile, use timeout to detect if app opens or not
    // if (isMobile) {
    //   // After 1 second, open the Play Store (adjust the timeout if needed)
    //       // Set a timeout to open Play Store **only once**


    //       document.addEventListener('visibilitychange',function handleVisibilityChange() {
    //         if (document.visibilityState === 'hidden') {
    //           // If visibility state changes to 'hidden', assume the app was opened

    //           if(!ifRedirected) {
    //             appOpened = true;

    //             setProceed(true);
  
    //             document.removeEventListener('visibilitychange', handleVisibilityChange);
    //           }

    //           // setProceed(true);


    //           // setPageLoader(false);


    //         }
    //       })

    // setTimeout(() => {
    //   // Open Play Store in a new tab

    //   if(!appOpened) {
    //   const newTab = window.open(
    //     "https://play.google.com/store/apps/details?id=com.indiasheltercustomerapp&hl=en_IN",
    //     "_blank"
    //   );

    //   ifRedirected = true;

    
  
    //   // If the browser blocks `window.open`, fallback to normal redirect
    //   if (!newTab) {
    //     window.location.href =
    //       "https://play.google.com/store/apps/details?id=com.indiasheltercustomerapp&hl=en_IN";
    //   }

    //   // setPerformVerification(false);

    //   // setPageLoader(false);


    // }
    // }, 2000);


    // } else {
    //   // Handle behavior for desktop if necessary
    //   // For desktop, you might want to display a message or fallback to the Play Store immediately
    //   // window.location.href =
    //   //   "https://play.google.com/store/apps/details?id=com.indiasheltercustomerapp&hl=en_IN";

    //   setTimeout(() => {
    //     // Open Play Store in a new tab
    //     const newTab = window.open(
    //       "https://play.google.com/store/apps/details?id=com.indiasheltercustomerapp&hl=en_IN",
    //       "_blank"
    //     );
    
    //     // If the browser blocks `window.open`, fallback to normal redirect
    //     if (!newTab) {
    //       window.location.href =
    //         "https://play.google.com/store/apps/details?id=com.indiasheltercustomerapp&hl=en_IN";
    //     }

    //     setPerformVerification(false);
    //     setPageLoader(false)

    //   }, 2000);
  
    // }
  }

  
  const getStatus = async () =>{
    
    statusCheckRef.current = setInterval(async ()=> {

     try{

     const response = await getFaceAuthStatus(values?.applicants?.[activeIndex]?.applicant_details?.id);

     clearInterval(statusCheckRef.current);

     if(response?.["lead"]) {
       setToastMessage('Information fetched Successfully');

       setValues(response?.["lead"]);
       
       setSuccessAuth(true);

       setOpen(true);

       setTimeout(()=> {    // time out delay and move to personal details/manual mode
        setOpen(false);
        setOpenEkycPopup(false);
        
       },2000)
     }

     else {
       setErrorToastMessage("Face Authentication Failed");
       clearInterval(statusCheckRef.current);
     }

     }

     catch(err) {

       if(err?.response?.data?.ekyc_status == "failed") {
         setErrorToastMessage("Face Authentication Failed");

         clearInterval(statusCheckRef.current);

         setOpenEkycPopup(false)

         alert(err)
       }
       //here
     }

   },5000)
 }

  useEffect(()=> {

    if(proceed === true) {
  getStatus();    
    }
  return () => {
    if (statusCheckRef.current) {
      clearInterval(statusCheckRef.current);
    }
  };
  },[proceed]);



  const processFaceAuth = () => {

    setOpen(false);

    openApp();


  }

  // empty aadhar no. field on chaning ekyc option
  useEffect(() => {
    setAadhaarNo('');
    setAadhaarNoError('');
  }, [selectedIdOption]);

  const updateConsent = useCallback(
    (consent) => {
      setConsent(consent);
    },
    [consent],
  );

  // resend otp on mobile and email
  const sendMobileOtp = async () => {
	  
    try {
      setLoading(true);
      await generateEkycOtp(
        {
          aadhaar_number: aadhaarNo,
          consent: consent,
          send_sms: true,
          send_email: true,
          applicant_id: values?.applicants[activeIndex]?.applicant_details?.id,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
    } catch (error) {
      setOpenEkycPopup(false);
      setPerformVerification(false);
      setIsAadharInputDrawer(true);
      setErrorToastMessage(error?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };


  // for Face Auth Table add

  const handleFaceAuth = async () => {

    try{

      setProcessing(true);

    const body = {
      mobile_number:values?.applicants?.[activeIndex]?.applicant_details?.mobile_number,
      is_ekyc_done:null,
      field_name:field_name,
      lead_id:values?.lead?.id,
      adhaar_number:aadhaarNo
    }

    // add face auth entry on click

    const response = await addFaceAuth(values?.applicants?.[activeIndex]?.applicant_details?.id,body);

    setPerformVerification(true);

    setOpen(true);

    setProceed(null);


  }

  catch(err) {
    console.log("ERROR IN ADDING",err)
    
    setErrorToastMessage(err?.response?.data?.message || "Something Went Wrong, Please try again");

    setPerformVerification(false);

    setIsAadharInputDrawer(true);

  }


  }

  // send otp on Mobile and email
  const handleVerify = async () => {
   	  
    try {
      setProcessing(true);
      setLoading(true);
      const data = await generateEkycOtp(
        {
          aadhaar_number: aadhaarNo,
          consent: consent,
          send_sms: true,
          send_email: true,
          applicant_id: values?.applicants[activeIndex]?.applicant_details?.id,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      if (data && data?.maskedMobile) {
        await editFieldsById(
          values?.applicants?.[activeIndex]?.applicant_details?.id,
          'applicant',
          {
            aadhar_registered_mobile_number: data?.maskedMobile,
          },
          {
            headers: {
              Authorization: token,
            },
          }
        );
      }

      setProcessing(false)
      otpTxnId = data?.OtpTxnId;
      setMaskedMobile(data?.maskedMobile);
      setMaskedEmail(data?.maskedEmail);
      setPerformVerification(true);
    } catch (error) {
      console.log(error);
      setProcessing(false)
      setErrorToastMessage(error?.response?.data?.error);
      setErrorToastSubMessage(error?.response?.data?.details?.errMsg);
      setOpenEkycPopup(false);
      setIsAadharInputDrawer(true);
      //setAadhaarNo('');
      setIsConsentChecked(false);
      let maskedAadhar;
      if (selectedIdOption === 'Aadhaar') {
        const maskedPortion = aadhaarNo.slice(0, 8).replace(/\d/g, '*');
        maskedAadhar = maskedPortion + aadhaarNo.slice(8);
      } else {
        const maskedPortion = aadhaarNo.slice(0, 12).replace(/\d/g, '*');
        maskedAadhar = maskedPortion + aadhaarNo.slice(12);
      }
      let data =
        field_name === 'id_type'
          ? {
              id_number: maskedAadhar,
              extra_params: {
                ...values?.applicants?.[activeIndex]?.applicant_details?.extra_params,
                ekyc_option: selectedIdOption === 'Aadhaar' ? 'Aadhaar' : 'vid',
                required_fields_status: {
                  ...values?.applicants?.[activeIndex]?.applicant_details?.extra_params
                    .required_fields_status,
                  id_number: true,
                },
              },
            }
          : {
              address_proof_number: maskedAadhar,
              extra_params: {
                ...values?.applicants?.[activeIndex]?.applicant_details?.extra_params,
                ekyc_option: selectedIdOption === 'Aadhaar' ? 'Aadhaar' : 'vid',
                required_fields_status: {
                  ...values?.applicants?.[activeIndex]?.applicant_details?.extra_params
                    .required_fields_status,
                  address_proof_number: true,
                },
              },
            };
      await editFieldsById(
        values?.applicants?.[activeIndex]?.personal_details?.id,
        'personal',
        data,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      setFieldValue(
        `applicants[${activeIndex}].personal_details.extra_params.ekyc_option`,
        selectedIdOption,
      );
      // updating local states with masked aadhaar/vid and progress
      if (field_name === 'id_type') {
        setFieldValue(`applicants[${activeIndex}].personal_details.id_number`, maskedAadhar);
        setRequiredFieldsStatus((prev) => ({ ...prev, id_number: true }));
        setFieldValue(
          `applicants[${activeIndex}].applicant_details.extra_params.is_ekyc_performed_id`,
          true,
        );
      } else {
        setFieldValue(
          `applicants[${activeIndex}].applicant_details.extra_params.is_ekyc_performed_address`,
          true,
        );
        setFieldValue(
          `applicants[${activeIndex}].personal_details.address_proof_number`,
          maskedAadhar,
        );
        setRequiredFieldsStatus((prev) => ({ ...prev, address_proof_number: true }));
      }
    } finally {
      setLoading(false);
    }
  };

  // handle otp and aadhaar verification
  const handleVerifyAadharOtp = async () => {
    
    try {
      setLoading(true);
      setDisableVerifyButton(true)
      setIsTimer(false);
      const data =
        field_name === 'id_type'
          ? { is_ekyc_performed_id: true }
          : { is_ekyc_performed_address: true };

      await editFieldsById(
        values?.applicants?.[activeIndex]?.applicant_details?.id,
        'applicant',
        {
          extra_params: {
            ...values?.applicants?.[activeIndex]?.applicant_details?.extra_params,
            ...data,
          },
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      const res = await validateEkycOtp(
        {
          aadhaar_number: aadhaarNo,
          consent: consent,
          otp_txn_id: otpTxnId,
          otp_value: otp,
          applicant_id: values?.applicants[activeIndex]?.applicant_details?.id,
          field_name,
          // remove condition after adding ekyc credentials
          fail: otp === '123456' && true,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );

      // check if response is correct & includes adhaar number;

      let clone_lead = structuredClone(res.lead);


      let adhaar_number = field_name == "id_type"?res?.lead?.applicants?.[activeIndex]?.personal_details?.id_number:res?.lead?.applicants?.[activeIndex]?.personal_details?.address_proof_number;

      if(!adhaar_number || !adhaar_number?.length){

        let masked_adhaar = aadhaarNo.slice(0, 12).replace(/\d/g, '*')

        let key = field_name == "id_type"?"id_number":"address_proof_number";

        clone_lead.applicants[activeIndex].personal_details[key] = masked_adhaar;

        // update backend as well to ensure data is in sync;

        const updated_data = await editFieldsById(
        values?.applicants?.[activeIndex]?.personal_details?.id,
        'personal',
        {[key]:masked_adhaar},
        {
          headers: {
            Authorization: token,
          },
        },
      );
      }

      setValues(clone_lead);
      setRequiredFieldsStatus(
        res?.lead?.applicants[activeIndex]?.personal_details?.extra_params?.required_fields_status,
      );
      setToastMessage('Information fetched Successfully');
      if (selectedIdOption === 'Aadhaar'){
        setAttemptsLeft(2);
        setOpenEkycPopup(false);
        setPerformVerification(false);
        setIsAadharInputDrawer(true);
        setAadhaarNo('');
        setIsConsentChecked(false);
        setSelectedActiveMember(null);
        setIsTimer(true);
        setOtp('');
      }
      if (res?.lead?.applicants[activeIndex].personal_details.extra_params.ekyc_option === 'vid') {
        await editFieldsById(
          res?.lead?.applicants?.[activeIndex]?.personal_details?.id,
          'personal',
          {
            extra_params: {
              ...res?.lead?.applicants?.[activeIndex]?.personal_details?.extra_params,
              ekyc_option: 'Aadhaar',
            },
          },
          {
            headers: {
              Authorization: token,
            },
          },
        );
        setFieldValue(
          `applicants[${activeIndex}].personal_details.extra_params.ekyc_option`,
          'Aadhaar',
        );
      }
    } catch (error) {
      console.log(error);
      if (selectedIdOption === 'Aadhaar') {     // here ** check

        if (attemptsLeft > 0) {
          setErrorToastMessage(
            `You've entered an incorrect OTP. Please try again. (${attemptsLeft} attempt(s) left)`,
          );
          setIsTimer(true);
          setIsVerifyOtp(false)
          setOtp('');
          setAttemptsLeft((prev) => prev - 1);
          return
        } else {
          setErrorToastMessage('Multiple times wrong OTP filled');
          // setOpenEkycPopup(false);
          setPerformVerification(true);
          setIsAadharInputDrawer(true);
          // setAadhaarNo('');
          setIsConsentChecked(false);
          setIsTimer(true);
          setOtp('');
          setIsVerifyOtp(false)
          setSelectedActiveMember(null);
          setAttemptsLeft(2);
        }
      }

      //disable this on 16 Oct 2024 because of OTP failed aadhar id store in db\
      // masking aadhaar/vid no.


      //-------------------- COMMENTING OUT ON 01-04
      // let maskedAadhar;
      // if (selectedIdOption === 'Aadhaar') {
      //   const maskedPortion = aadhaarNo.slice(0, 8).replace(/\d/g, '*');
      //   maskedAadhar = maskedPortion + aadhaarNo.slice(8);
      // } else {
      //   const maskedPortion = aadhaarNo.slice(0, 12).replace(/\d/g, '*');
      //   maskedAadhar = maskedPortion + aadhaarNo.slice(12);
      // }
      // let data =
      //   field_name === 'id_type'
      //     ? {
      //         id_number: maskedAadhar,
      //         extra_params: {
      //           ...values?.applicants?.[activeIndex]?.applicant_details?.extra_params,
      //           ekyc_option: selectedIdOption === 'Aadhaar' ? 'Aadhaar' : 'vid',
      //           required_fields_status: {
      //             ...values?.applicants?.[activeIndex]?.applicant_details?.extra_params
      //               .required_fields_status,
      //             id_number: true,
      //           },
      //         },
      //       }
      //     : {
      //         address_proof_number: maskedAadhar,
      //         extra_params: {
      //           ...values?.applicants?.[activeIndex]?.applicant_details?.extra_params,
      //           ekyc_option: selectedIdOption === 'Aadhaar' ? 'Aadhaar' : 'vid',
      //           required_fields_status: {
      //             ...values?.applicants?.[activeIndex]?.applicant_details?.extra_params
      //               .required_fields_status,
      //             address_proof_number: true,
      //           },
      //         },
      //       };
      // await editFieldsById(
      //   values?.applicants?.[activeIndex]?.personal_details?.id,
      //   'personal',
      //   data,
      //   {
      //     headers: {
      //       Authorization: token,
      //     },
      //   },
      // );
      // setFieldValue(
      //   `applicants[${activeIndex}].personal_details.extra_params.ekyc_option`,
      //   selectedIdOption,
      // );
      // // updating local states with masked aadhaar/vid and progress
      // if (field_name === 'id_type') {
      //   setFieldValue(`applicants[${activeIndex}].personal_details.id_number`, maskedAadhar);
      //   setRequiredFieldsStatus((prev) => ({ ...prev, id_number: true }));
      //   setFieldValue(
      //     `applicants[${activeIndex}].applicant_details.extra_params.is_ekyc_performed_id`,
      //     true,
      //   );
      // } else {
      //   setFieldValue(
      //     `applicants[${activeIndex}].applicant_details.extra_params.is_ekyc_performed_address`,
      //     true,
      //   );
      //   setFieldValue(
      //     `applicants[${activeIndex}].personal_details.address_proof_number`,
      //     maskedAadhar,
      //   );
      //   setRequiredFieldsStatus((prev) => ({ ...prev, address_proof_number: true }));
      // }

      //--------------------------------TILL HERE
      if (selectedIdOption !== 'Aadhaar') {
        setErrorToastMessage(error?.response?.data?.error || error?.response?.data?.message);
      }
      setErrorToastSubMessage(error?.response?.data?.details?.errMsg);
    } finally {
      if (selectedIdOption !== 'Aadhaar') {
        setOpenEkycPopup(false);
        setPerformVerification(false);
        setIsAadharInputDrawer(true);
        setAadhaarNo('');
        setIsConsentChecked(false);
        setIsTimer(true);
        setSelectedActiveMember(null);
        setOtp('');
      }
      setLoading(false);
      setDisableVerifyButton(false);
    }
  };

  // detecting biometric device
  const handleScan = async () => {
    setDisableFields(true);
    setDeviceScanPopup(true);
    ecsBioHelper.detectDevices(function () {
      if (ecsBioHelper.getDetectedDevices().length !== 0) {
        setScanningState('success');
      } else {
        setScanningState('error');
      }
    });
  };

  // aadhaar no validation
  const handleAadhaarNoChange = (e) => {
    const value = e.target.value;
    if (DISALLOW_CHAR.includes(e.key)) {
      e.preventDefault();
      return;
    }
    const aadhaarPattern = /^\d{12}$/;
    const vidPattern = /^\d{16}$/;
    if (selectedIdOption === 'Aadhaar') {
      if (value[0] == '0' || value[0] == '1') return;
      if (/^\d+$/g.test(value) || !value.length) {
        setAadhaarNo(value);
        if (aadhaarPattern.test(value)) {
          setAadhaarNoError('');
        } else {
          setAadhaarNoError('Enter valid 12 digit Aadhaar no.');
        }
      }
    } else {
      if (/^\d+$/g.test(value) || !value.length) {
        setAadhaarNo(value);
        if (vidPattern.test(value)) {
          setAadhaarNoError('');
        } else {
          setAadhaarNoError('Enter valid 16 digit VID no.');
        }
      }
    }
  };

  const aadharFlag = async (value) => {
    console.log('value', value);
    await editFieldsById(
      values?.applicants?.[activeIndex]?.applicant_details?.id,
      'applicant',
      {
        aadhar_mobile_registered: value,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );
  
    if (!value) {
      let maskedAadhar;
      if (selectedIdOption === 'Aadhaar') {
        const maskedPortion = aadhaarNo.slice(0, 8).replace(/\d/g, '*');
        maskedAadhar = maskedPortion + aadhaarNo.slice(8);
      } else {
        const maskedPortion = aadhaarNo.slice(0, 12).replace(/\d/g, '*');
        maskedAadhar = maskedPortion + aadhaarNo.slice(12);
      }
      let data =
        field_name === 'id_type'
          ? {
              id_number: maskedAadhar,
              extra_params: {
                ...values?.applicants?.[activeIndex]?.applicant_details?.extra_params,
                ekyc_option: selectedIdOption === 'Aadhaar' ? 'Aadhaar' : 'vid',
                required_fields_status: {
                  ...values?.applicants?.[activeIndex]?.applicant_details?.extra_params
                    .required_fields_status,
                  id_number: true,
                },
              },
            }
          : {
              address_proof_number: maskedAadhar,
              extra_params: {
                ...values?.applicants?.[activeIndex]?.applicant_details?.extra_params,
                ekyc_option: selectedIdOption === 'Aadhaar' ? 'Aadhaar' : 'vid',
                required_fields_status: {
                  ...values?.applicants?.[activeIndex]?.applicant_details?.extra_params
                    .required_fields_status,
                  address_proof_number: true,
                },
              },
            };
  
      await editFieldsById(
        values?.applicants?.[activeIndex]?.personal_details?.id,
        'personal',
        data,
        {
          headers: {
            Authorization: token,
          },
        }
      );
  
      setFieldValue(
        `applicants[${activeIndex}].personal_details.extra_params.ekyc_option`,
        selectedIdOption
      );
      if (field_name === 'id_type') {
        setFieldValue(`applicants[${activeIndex}].personal_details.id_number`, maskedAadhar);
        setRequiredFieldsStatus((prev) => ({ ...prev, id_number: true }));
        setFieldValue(
          `applicants[${activeIndex}].applicant_details.extra_params.is_ekyc_performed_id`,
          true
        );
      } else {
        setFieldValue(
          `applicants[${activeIndex}].applicant_details.extra_params.is_ekyc_performed_address`,
          true
        );
        setFieldValue(
          `applicants[${activeIndex}].personal_details.address_proof_number`,
          maskedAadhar
        );
        setRequiredFieldsStatus((prev) => ({ ...prev, address_proof_number: true }));
      }
      setOpenEkycPopup(false);
      setAadhaarNo('');
      setIsAadharInputDrawer(true);
      setIsConsentChecked(false);
      setSelectedActiveMember(null);
    }
  };
  

  return isAadharInputDrawer ? (
    <div className='w-full flex flex-col'>
      <div className='flex justify-between items-center px-4 py-2 border-b border-lighter-grey'>
        <p className='font-semibold'>
          {field_name === 'id_type' ? 'Enter ID number' : 'Enter address proof number'}
        </p>
        <button
          onClick={() => {
            setOpenEkycPopup(false);
            setAadhaarNo('');
            setAadhaarNoError('');
          }}
        >
          <IconClose />
        </button>
      </div>
      <div className='px-4 pt-4 pb-6'>
        <div className='flex mb-4'>
          {idNumberOptions.map((method) => {
            return (
              <Radio
                key={method.label}
                label={method.label}
                value={method.value}
                current={selectedIdOption}
                onChange={(value) => {
                  setSelectedIdOption(value);
                }}
              />
            );
          })}
        </div>
        <TextInputWithEyeIcon
          label={selectedIdOption === 'Aadhaar' ? 'Enter Aadhaar number' : 'Enter VID number'}
          placeholder={selectedIdOption === 'Aadhaar' ? 'Eg: 123456789012' : 'Eg: 1234567890123456'}
          type={show ? 'tel' : 'password'}
          name='aadhaarNo'
          value={aadhaarNo}
          inputmode='numeric'
          onChange={handleAadhaarNoChange}
          error={aadhaarNoError}
          touched={true}
          pattern='\d*'
          min='0' // hanlde mousewheel down
          onKeyDown={(e) => {
            if (
              e.key === 'ArrowUp' ||
              e.key === 'ArrowDown' ||
              e.key === 'ArrowLeft' ||
              e.key === 'ArrowRight' ||
              e.key === ' ' ||
              e.keyCode === 32 ||
              (e.keyCode >= 65 && e.keyCode <= 90)
            ) {
              e.preventDefault();
              return;
            }
          }}
          show={show}
          setShow={setShow}
        />
        <Button
          primary
          inputClasses='!py-3 mt-3'
          disabled={aadhaarNoError || !aadhaarNo}
          onClick={() => setIsAadharInputDrawer(false)}
        >
          Next
        </Button>
      </div>
    </div>
  ) : performVerification ? (
    selectedEkycMethod === 'otp' ? (
      <>
        <div className='px-4 py-2 flex gap-2 justify-start w-full border-b border-lighter-grey'>
          <button
            onClick={() => {
              setPerformVerification(false);
              setIsVerifyOtp(false);
              setOtp('');
              setSelectedActiveMember(null)
            }}
          >
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M18.0001 12.125H6.0293'
                stroke='#373435'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M6 12.125L9.91844 16.25'
                stroke='#373435'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M6 12.125L9.91844 8'
                stroke='#373435'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
          <p className='font-semibold'>Verify OTP</p>
        </div>
        <div className='w-full px-4 pt-4 pb-6'>
          {/* Aadhar will provide the masked email and masked mobile no. */}
          <p className='text-sm text-dark-grey mb-3'>
            OTP successfully sent to {maskedMobile} and {maskedEmail}
          </p>
          <div className='mb-3'>
            <p className='text-sm mb-3'>Does the customer have that number, and is it active ?</p>
            <div className='flex'>
              {activeMembers.map((method) => {
                return (
                  <Radio
                    key={method.label}
                    label={method.label}
                    value={method.value}
                    current={selectedActiveMember}
                    onChange={(value) => {
                    
                      updateManualPerformId(value)
                      
                    }}
                    disabled={disableFields}
                  />
                );
              })}
            </div>
          </div>
          {selectedActiveMember && (
            <div>
              <EkycOtpInput
                label='Enter OTP'
                required
                onSendOTPClick={sendMobileOtp}
                setIsVerifyOtp={setIsVerifyOtp}
                defaultResendTime={30}
                isTimer={isTimer}
                otp={otp}
                setOtp={setOtp}
              />
              <Button
                primary
                disabled={!isVerifyOtp||disabledVerifyButton}
                onClick={handleVerifyAadharOtp}
                inputClasses='mt-6 !py-3'
              >
                Verify OTP
              </Button>
            </div>
          )}
        </div>
      </>
    ) : selectedEkycMethod == 'FAUTH' ? (
      // handling biometrics, iris, faceAuth scan
      // <ValidateScan
      //   type={selectedEkycMethod}
      //   setPerformVerification={setPerformVerification}
      //   setScanningState={setScanningState}
      //   setOpenEkycPopup={setOpenEkycPopup}
      //   ecsBioHelper={ecsBioHelper}
      //   aadhaarNo={aadhaarNo}
      //   setAadhaarNo={setAadhaarNo}
      //   consent={consent}
      //   setLoading={setLoading}
      //   field_name={field_name}
      //   setIsAadharInputDrawer={setIsAadharInputDrawer}
      //   setRequiredFieldsStatus={setRequiredFieldsStatus}
      //   selectedIdOption={selectedIdOption}
      // />

      !pageLoader?<MessageModal open={open} message="You will be redirected to the Face Authentication application. If the app is not installed on your device, you will be directed to the Play Store to download it. Once installed, please complete the Face Authentication process to continue." handleClick = {processFaceAuth} setOpen={setOpen} successAuth= {successAuth}/>: <Box 
      display="flex" 
  justifyContent="center" 
  flexDirection="column" 
  alignItems="center" 
  height="40vh" 
  sx={{ backgroundColor: "transparent", gap: 2, textAlign: "center" }}>
      <CircularProgress sx={{ color: "red" }} />
      
      <span> {proceed?"Face Authentication in progress, Please complete or Cancel the process":"Processing your request, please wait......"}
      </span>
      <Button onClick={()=>{
        setPerformVerification(false);

        setPageLoader(false);

        clearInterval(statusCheckRef.current);

      }}>Cancel Request</Button>
    </Box>


    ):
    (
      // handling biometrics, iris, faceAuth scan
      <ValidateScan
        type={selectedEkycMethod}
        setPerformVerification={setPerformVerification}
        setScanningState={setScanningState}
        setOpenEkycPopup={setOpenEkycPopup}
        ecsBioHelper={ecsBioHelper}
        aadhaarNo={aadhaarNo}
        setAadhaarNo={setAadhaarNo}
        consent={consent}
        setLoading={setLoading}
        field_name={field_name}
        setIsAadharInputDrawer={setIsAadharInputDrawer}
        setRequiredFieldsStatus={setRequiredFieldsStatus}
        selectedIdOption={selectedIdOption}
      />
    )
  ) : (
    <>
      <div className='relative'>
        <div className='w-full h-[494px] flex flex-col'>
          <div className='flex justify-between items-center px-4 py-2 border-b border-lighter-grey'>
            <p className='font-semibold'>Select verification method</p>
            <button
              onClick={() => {
                setOpenEkycPopup(false);
                setAadhaarNo('');
                setIsAadharInputDrawer(true);
                setIsConsentChecked(false);
              }}
            >
              <IconClose />
            </button>
          </div>
          <div className='px-4 pt-4 overflow-y-scroll'>
            <div className='flex flex-col gap-2'>
              {ekycMethods.map((method) => {
                return (
                  <Radio
                    key={method.label}
                    label={method.label}
                    value={method.value}
                    current={selectedEkycMethod}
                    onChange={(value) => setSelectedEkycMethod(value)}
                    disabled={disableFields}
                  />
                );
              })}
            </div>
            <hr className='my-4 bg-lighter-grey h-px w-full' />
            <ConsentBox
              isChecked={isConsentChecked}
              setIsChecked={setIsConsentChecked}
              updateConsent={updateConsent}
              disabled={disableFields}
            />
          </div>
          <div className={`py-6 px-4 bg-[#FEFEFE] ${deviceScanPopup && 'opacity-0'}`}>
            <Button
              primary
              disabled={!isConsentChecked ||processing}
              onClick={() => {
                if (selectedEkycMethod === 'otp') {    // here
                  handleVerify();
                  return;
                }

                else if(selectedEkycMethod === 'FAUTH') {
                  handleFaceAuth();
                  return
                }
                handleScan();
              }}
              inputClasses='!py-3'
            >
              {selectedEkycMethod === 'otp' ? 'Verify' : 'Scan'}
            </Button>
          </div>
        </div>
        <Popup
          open={deviceScanPopup}
          handleSuccess={() => {
            setDisableFields(false);
            setDeviceScanPopup(false);
            setPerformVerification(true);
          }}
          title={
            scanningState === 'loading'
              ? 'Please wait while we are detecting your device'
              : scanningState === 'error'
              ? 'Device not found'
              : 'Device found successfully'
          }
          description={scanningState === 'error' ? 'Please try again or try another method' : ''}
          state={scanningState}
          bottom={4}
          handleClose={() => {
            setDisableFields(false);
            setDeviceScanPopup(false);
            // setting default scanning state
            setScanningState('loading');
          }}
        />
      </div>
    </>
  );
}

function MessageModal({ open, onClose, message,setOpen,handleClick,successAuth }) {


  const theme = useTheme(); // Get the theme


  return (
    <Modal open={open} onClose={!open} aria-labelledby="modal-message" sx={{ zIndex: 9999999 }}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: '82%',
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          textAlign: "center",
          zIndex: theme.zIndex.modal + 10, // Ensures it's above other modals
        }}
        style={{zIndex:999999}}

      >

        {successAuth?<>
          <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
      >
        <CheckCircleIcon sx={{ fontSize: 60, color: "green" }} />
      </motion.div>

      {/* Success Message */}
      <Typography
        variant="h6"
        sx={{
          textAlign: "center",
          lineHeight: 1.5,
          fontWeight: 500,
          color: "text.primary",
        }}
      >
        Successfully Validated
      </Typography>
        </>:<>
        <Typography id="modal-message" variant="h6"   sx={{
    mb: 2,
    textAlign: "left", // Align text to the left
    lineHeight: 2, // Improve readability
    fontWeight: 500, // Slightly bold for emphasis
    color: "text.primary", // Use default text color
    fontSize:17
  }}>
          {message}
        </Typography>
        <Button variant="contained" onClick={()=>{
          
          setOpen(false)
          handleClick();
          }}>
          OK
        </Button>
        </>}

      </Box>
    </Modal>
  );
}

EkycDrawer.propTypes = {
  setOpenEkycPopup: PropTypes.func,
  setLoading: PropTypes.func,
  field_name: PropTypes.string,
};
