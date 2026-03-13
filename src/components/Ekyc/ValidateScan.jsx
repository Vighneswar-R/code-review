import Button from '../Button';
import Scanner from '../Scanner';
import PropTypes from 'prop-types';

import Fingerprint_scanning from '../../assets/anim/Fingerprint_Scanning.json';
import Fingerprint_success from '../../assets/anim/Fingerprint_Success.json';
import Fingerprint_failure from '../../assets/anim/Fingerprint_Failure.json';

import { useContext, useEffect, useState,useRef } from 'react';
import { LeadContext } from '../../context/LeadContextProvider';
import { AuthContext } from '../../context/AuthContextProvider';
import { editFieldsById, getFaceAuthStatus, performBiometric } from '../../global';
import { useTheme } from "@mui/material/styles";
import { Modal, Box, Typography} from "@mui/material";


// biometric screen meta based on type
let obj = [
  {
    title: 'Biometrics Scan',
    scanLoadingMsg: 'Place your THUMB/FINGER on scanner',
    scanSuccessMsg: 'Successfully captured information, validating Aadhaar details',
    scanFailureMsg: 'Unable to capture information, place your THUMB/FINGER on scanner',
    scanLoadingAnimation: Fingerprint_scanning,
    scanSuccessAnimation: Fingerprint_success,
    scanFailureAnimation: Fingerprint_failure,
  },
];

// type = "FMR", "iris", "faceAuth"
export default function ValidateScan({
  type,
  setPerformVerification,
  setScanningState,
  setOpenEkycPopup,
  ecsBioHelper,
  aadhaarNo,
  setAadhaarNo,
  setIsAadharInputDrawer,
  consent,
  setLoading,
  field_name,
  setRequiredFieldsStatus,
  selectedIdOption,
}) {
  const { setToastMessage, values, activeIndex, setValues, setFieldValue } =
    useContext(LeadContext);
  const { setErrorToastMessage, setErrorToastSubMessage, token } = useContext(AuthContext);
  // storing current selected scan meta data
  const [validateScanObj, setValidateScanObj] = useState({});
  const [disableCapture, setdisableCapture] = useState(false);

  // capture biometric
  const [isCapturing, SetIsCapturing] = useState(true);
  const [isCaptureSuccessful, setIsCaptureSuccessful] = useState(false);
  const [biometricData, setBiometricData] = useState(null);

  const[FauthSuccess,setFauthSuccess] = useState(false);

  const statusCheckRef = useRef(null); // Declare outside getStatus

  const[open,setOpen] = useState(false);

  // test phase check for FAUTH ** will be changed


  useEffect(()=> {

    if(type == 'FAUTH') {
      SetIsCapturing(false);
      setIsCaptureSuccessful(true);

      //getStatus();

      setOpen(true);
    
      return () => {
        if (statusCheckRef.current) {
          clearInterval(statusCheckRef.current);
        }
      };

    }

  },[type])


  // const getStatus = async () =>{
    
  //    statusCheckRef.current = setInterval(async ()=> {

  //     try{

  //     const response = await getFaceAuthStatus(values?.applicants?.[activeIndex]?.applicant_details?.id);

  //     clearInterval(statusCheckRef.current);

  //     if(response?.["lead"]) {
  //       setToastMessage('Information fetched Successfully');

  //       setValues(response?.["lead"]);
  //     }

  //     else {
  //       setErrorToastMessage("Face Authentication Failed");
  //       clearInterval(statusCheckRef.current);
  //     }

  //     }

  //     catch(err) {

  //       if(err?.response?.data?.ekyc_status == "failed") {
  //         setErrorToastMessage("Face Authentication Failed");

  //         clearInterval(statusCheckRef.current);

  //         setOpenEkycPopup(false)
  //       }
  //       //here
  //     }

  //   },5000)
  // }

  // setting meta data as per device type
  useEffect(() => {
    if (type === 'FMR') {
      setValidateScanObj(obj[0]);
    }
  }, [type]);

  // capture biometric
  const captureScan = async () => {
    setdisableCapture(true);
    
    // setting it to 0 for FMR
    var deviceSelectedIndex = 0;

    await ecsBioHelper.enableLog();

    if (type == 'FMR') {
      // const wadh =  'CtbFfteJR5nXKr+GVvh78PjlqkxOBcj+9XgPi5p8mbE=';
      const wadh =  'CtbFfteJR5nXKr+GVvh78PjlqkxOBcj+9XgPi5p8mbE=';
      const mode=  'P';
      const fType = 2;
      const otpValue = null;
      console.log('wadh '+wadh);
      console.log('mode'+mode);
      await ecsBioHelper.captureFMR(
        deviceSelectedIndex,
        'P',  //P production and PP for Pre Production
        'K',
        1,
        fType,
        false,
        otpValue,
        'CtbFfteJR5nXKr+GVvh78PjlqkxOBcj+9XgPi5p8mbE=',
        function (responseXml) {
         
	if (responseXml.includes('errCode="0"')) {
            setBiometricData(responseXml);
            SetIsCapturing(false);
            setdisableCapture(false);
            setIsCaptureSuccessful(true);
          } else {
            SetIsCapturing(false);
            setdisableCapture(false);
            setIsCaptureSuccessful(false);
          }
        },
        function (errorMessage) {
          setdisableCapture(false);
          setIsCaptureSuccessful(false);
          SetIsCapturing(false);
          console.log(errorMessage);
        },
      );
    }
  };


  // function openApp() {
  //   // Check if the device is mobile
  //   const isMobile = /android/i.test(navigator.userAgent);
  //   // Try opening the app using the deep link
  //   // window.location.href = "indiasheltercustomerapp://open";


  //   let appOpened = false;

  //   // If mobile, use timeout to detect if app opens or not
  //   if (isMobile) {
  //     // After 1 second, open the Play Store (adjust the timeout if needed)
  //         // Set a timeout to open Play Store **only once**


  //         document.addEventListener('visibilitychange',function handleVisibilityChange() {
  //           if (document.visibilityState === 'hidden') {
  //             // If visibility state changes to 'hidden', assume the app was opened
  //             appOpened = true;

  //             document.removeEventListener('visibilitychange', handleVisibilityChange);

  //           }
  //         })


  //   setTimeout(() => {
  //     // Open Play Store in a new tab

  //     if(!appOpened) {
  //     const newTab = window.open(
  //       "https://play.google.com/store/apps/details?id=com.indiasheltercustomerapp&hl=en_IN",
  //       "_blank"
  //     );

    
  
  //     // If the browser blocks `window.open`, fallback to normal redirect
  //     if (!newTab) {
  //       window.location.href =
  //         "https://play.google.com/store/apps/details?id=com.indiasheltercustomerapp&hl=en_IN";
  //     }

  //   }
  //   }, 2000);


  //   } else {
  //     // Handle behavior for desktop if necessary
  //     // For desktop, you might want to display a message or fallback to the Play Store immediately
  //     // window.location.href =
  //     //   "https://play.google.com/store/apps/details?id=com.indiasheltercustomerapp&hl=en_IN";

  //     setTimeout(() => {
  //       // Open Play Store in a new tab
  //       const newTab = window.open(
  //         "https://play.google.com/store/apps/details?id=com.indiasheltercustomerapp&hl=en_IN",
  //         "_blank"
  //       );
    
  //       // If the browser blocks `window.open`, fallback to normal redirect
  //       if (!newTab) {
  //         window.location.href =
  //           "https://play.google.com/store/apps/details?id=com.indiasheltercustomerapp&hl=en_IN";
  //       }
  //     }, 2000);
  
  //   }
  // }

  function openAppOld() {
    // Try opening the app using the deep link
    window.location.href = "indiasheltercustomerapp://open";
  
    // Set a timeout to open Play Store **only once**
    setTimeout(() => {
      // Open Play Store in a new tab
      const newTab = window.open(
        "https://play.google.com/store/apps/details?id=com.indiasheltercustomerapp&hl=en_IN",
        "_blank"
      );
  
      // If the browser blocks `window.open`, fallback to normal redirect
      if (!newTab) {
        window.location.href =
          "https://play.google.com/store/apps/details?id=com.indiasheltercustomerapp&hl=en_IN";
      }
    }, 2000);
  }
  
  // useEffect(()=> {     // ** commented for testing

  //   if(type == 'FAUTH' && isCaptureSuccessful == true) {
  //     openApp();
  //   }

  // },[isCaptureSuccessful])

  // validate captured biometric
  const validateCapturedScan = async () => {
    try {
      setLoading(true);
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
      const res = await performBiometric(
        {
          aadhaar_number: aadhaarNo, //<---- Enter aadhar number here
          consent: consent,
          pid_data: biometricData,
          bio_type: 'FMR',
          fmr_type: '2',
          uses_otp: 'false',
          applicant_id: values?.applicants[activeIndex]?.applicant_details?.id,
          field_name,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      setValues(res.lead);
      setRequiredFieldsStatus(
        res?.lead?.applicants[activeIndex]?.personal_details?.extra_params?.required_fields_status,
      );
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
      setToastMessage('Information fetched Successfully');
    } catch (error) {
      // masking aadhaar/vid no.
      //commneting below for qualifer run after bimetric failed
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
      setErrorToastMessage(error?.response?.data?.error);
      // setErrorToastSubMessage(error?.response?.data?.details?.errMsg); 
      console.log(error);
    } finally {
      setOpenEkycPopup(false);
      setPerformVerification(false);
      setLoading(false);
      setBiometricData(null);
      setAadhaarNo('');
      setIsAadharInputDrawer(true);
    }
  };

  return (
    <>
    <MessageModal open={open} message={"HEY YOU CAN VERIFY FACE AUTH HERE"} start = {()=> {
      setOpen(false);
      // openApp();
      // getStatus();
    }}/>
      <div className='px-4 py-2 flex gap-2 justify-start w-full border-b border-lighter-grey'>
        <button
          onClick={() => {
            // setting scanning state to default loading state(searching for device)
            setScanningState('loading');
            setPerformVerification(false);
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
        <p className='font-semibold'>{validateScanObj.title}</p>
      </div>
      <div className='w-full px-4 pt-4 pb-6'>
        {isCapturing ? (
          // capturing biometric
          <>
            <Scanner
              animationFile={validateScanObj.scanLoadingAnimation}
              message={validateScanObj.scanLoadingMsg}
            />
            <Button
              primary
              disabled={disableCapture}
              onClick={captureScan}
              inputClasses='!py-3 mt-6 w-full'
            >
              Capture
            </Button>
          </>
        ) : isCaptureSuccessful ? (
          // validating captured biometric
          <>
            <Scanner
              animationFile={validateScanObj.scanSuccessAnimation}
              message={validateScanObj.scanSuccessMsg}
            />
            <Button primary onClick={validateCapturedScan} inputClasses='!py-3 mt-6'>
              Validate
            </Button>
          </>
        ) : (
          // on Capture failure "Try again" or "Try another method"
          <>
            <Scanner
              animationFile={validateScanObj.scanFailureAnimation}
              message={validateScanObj.scanFailureMsg}
            />
            <Button
              primary
              onClick={() => {
                SetIsCapturing(true);
              }}
              inputClasses='!py-3 mt-6'
            >
              Try again
            </Button>
            <Button
              onClick={() => {
                // setting scanning state to default loading state(searching for device)
                setScanningState('loading');
                setPerformVerification(false);
                SetIsCapturing(true);
              }}
              inputClasses='!py-3 mt-3'
            >
              Try another method
            </Button>
          </>
        )}
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


ValidateScan.propTypes = {
  type: PropTypes.string,
  setPerformVerification: PropTypes.func,
  setScanningState: PropTypes.func,
  setOpenEkycPopup: PropTypes.func,
  ecsBioHelper: PropTypes.any,
  aadhaarNo: PropTypes.string,
  consent: PropTypes.string,
  setLoading: PropTypes.func,
  field_name: PropTypes.string,
  setIsAadharInputDrawer: PropTypes.func,
  setAadhaarNo: PropTypes.func,
  setRequiredFieldsStatus: PropTypes.func,
  selectedIdOption: PropTypes.string,
};
