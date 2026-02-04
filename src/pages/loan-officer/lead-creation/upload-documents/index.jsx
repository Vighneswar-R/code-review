/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { useContext, useState, useCallback, useRef, useEffect } from 'react';
import ImageUpload from '../../../../components/ImageUpload';
import PdfAndImageUpload from '../../../../components/PdfAndImageUpload';
import IFrameComponent from '../../../../components/IFrame';
import PhotoUpload from '../../../../components/PhotoUpload';
import { v4 as uuidv4 } from 'uuid';

import UploadSelfie from '../../../../components/UploadSelfie'
import { LeadContext } from '../../../../context/LeadContextProvider';
import { manualModeDropdownOptions } from '../personal-details/manualModeDropdownOptions';
import { DropDown, TextInput, ToastMessage, UploadDocsInput } from '../../../../components';
import { AuthContext } from '../../../../context/AuthContextProvider';
import OtpInputNoEdit from '../../../../components/OtpInput/OtpInputNoEdit';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import ConsentBox from '../../../../components/ConsentBox';
import {
  addApi,
  editFieldsById,
  getApplicantById,
  FACE_LIVE_FL_REQ_HEADER,
  getUploadOtp,
  reUploadDoc,
  uploadDoc,
  verifyUploadOtp,
  faceLiveness,
  uploadDocFace,
  base64ConersionApi,
  faceLivenesBase64,
  bcpKeyCheck,
  faceLivenesHyperverge,
  updateProgressOnUpload,
  HypervergeLogin,
  getDashboardLeadById,
  getOTPonCall
} from '../../../../global';
import { newCoApplicantValues } from '../../../../context/NewCoApplicant';
import imageCompression from 'browser-image-compression';
import PreviousNextButtons from '../../../../components/PreviousNextButtons';
import SwipeableDrawerComponent from '../../../../components/SwipeableDrawer/LeadDrawer';
import Topbar from '../../../../components/Topbar';
import otpVerified from '../../../../assets/icons/otp-verified.svg';
import Popup from '../../../../components/Popup';
import { useLocation, useSearchParams } from 'react-router-dom';
import generateImageWithTextWatermark from '../../../../utils/GenerateImageWithTextWatermark';
import loading from '../../../../assets/icons/loading.svg';
import Loader from '../../../../components/Loader';
import LoaderDynamicText from '../../../../components/Loader/LoaderDynamicText';
import ErrorBoundary from '../../../../components/ErrorBoundary';
import ErrorTost from '../../../../components/ToastMessage/ErrorTost';
import { otherDocumentOptions,relationOptions } from '../../../../utils';
import DocumentModal from '../../../../components/DocumentModal';





const UploadDocuments = ({ activeIndex }) => {
  const {
    toastMessage,
    setToastMessage,
    setErrorToastMessage,
    errorToastMessage,
    isQaulifierActivated,
    loData,
    setIsQaulifierActivated,
    setOtpFailCount,
    token,
    loAllDetails,
  } = useContext(AuthContext);
  const {
    // activeIndex,
    values,
    errors,
    touched,
    handleBlur,
    setFieldValue,
    setFieldError,
    updateProgressUploadDocumentSteps,
    setCurrentStepIndex,
    idDisableFields,
    addressDisableFields,
    approved,
    checkisApproved,
    isFetching,
    setIsFetching
  } = useContext(LeadContext);
  const [disablePhoneNumber, setDisablePhoneNumber] = useState(false);
  const [faceData, setFaceData] = useState(false);
  const [data, setData] = useState("");
  const [apiResponse, setApiResponse] = useState("");
  const [tokenResponse, setTokenResponse] = useState("");
  const [customerPhotos, setCustomerPhotos] = useState([]);
  const [customerPhotosFile, setCustomerPhotosFile] = useState(null);
  const [customerUploads, setCustomerUploads] = useState(null);
  const [customerLatLong, setCustomerLatLong] = useState(null);

  const [idProofPhotos, setIdProofPhotos] = useState([]);
  const [idProofPhotosFile, setIdProofPhotosFile] = useState(null);
  const [idProofUploads, setIdProofUploads] = useState(null);
  const [idProofPdf, setIdProofPdf] = useState(null);
  const [show, setShow] = useState(false);
  const [editIdProof, setEditIdProof] = useState({
    file: {},
    id: null,
  });
  const [idProofLatLong, setIdProofLatLong] = useState(null);

  const [addressProofPhotos, setAddressProofPhotos] = useState([]);
  const [addressProofPhotosFile, setAddressProofPhotosFile] = useState(null);
  const [addressProofUploads, setAddressProofUploads] = useState(null);
  const [addressProofPdf, setAddressProofPdf] = useState(null);
  const [editAddressProof, setEditAddressProof] = useState({
    file: {},
    id: null,
  });
  const [addressProofLatLong, setAddressProofLatLong] = useState(null);
  const [showIframe, setShowIframe] = useState(false);
  const [faceLiveResponse, setFaceLiveResponse] = useState('');
  const [bcpResult, setBcpResult] = useState(0);

  const [propertyPapers, setPropertyPapers] = useState([]);
  const [propertyPapersFile, setPropertyPapersFile] = useState(null);
  const [propertyPaperUploads, setPropertyPaperUploads] = useState(null);
  const [propertyPdf, setPropertyPdf] = useState(null);
  const [editPropertyPaper, setEditPropertyPaper] = useState({
    file: {},
    id: null,
  });
  const [propertyPapersLatLong, setPropertyPapersLatLong] = useState(null);
  const [disableFaceButton,setDisableFaceButton] = useState(false);
  const [salarySlipPhotos, setSalarySlipPhotos] = useState([]);
  const [salarySlipPhotosFile, setSalarySlipPhotosFile] = useState(null);
  const [salarySlipUploads, setSalarySlipUploads] = useState(null);
  const [editSalarySlip, setEditSalarySlip] = useState({
    file: {},
    id: null,
  });
  const [salarySlipLatLong, setSalarySlipLatLong] = useState(null);

  const [form60photos, setForm60photos] = useState([]);
  const [form60photosFile, setForm60photosFile] = useState(null);
  const [form60Uploads, setForm60Uploads] = useState(null);
  const [editForm60, setEditForm60] = useState({
    file: {},
    id: null,
  });
  const [form60LatLong, setForm60LatLong] = useState(null);

  const [propertyPhotos, setPropertyPhotos] = useState([]);
  const [propertyPhotosFile, setPropertyPhotosFile] = useState(null);
  const [propertyUploads, setPropertyUploads] = useState(null);
  const [editProperty, setEditProperty] = useState({
    file: {},
    id: null,
  });
  const [propertyLatLong, setPropertyLatLong] = useState(null);

  const [selfie, setSelfie] = useState([]);
  const [selfieFile, setSelfieFile] = useState(null);
  const [selfieUploads, setSelfieUploads] = useState(null);
  const [loSelfieLatLong, setLoSelfieLatLong] = useState(null);

  const [docs, setDocs] = useState([]);
  const [docsFile, setDocsFile] = useState(null);
  const [docUploads, setDocUploads] = useState(null);
  const [editDoc, setEditDoc] = useState({
    file: {},
    id: null,
  });
  const [otherDocsLatLong, setOtherDocsLatLong] = useState(null);

  const [editIdNumber, setEditIdNumber] = useState(false);
  const [editAddressNumber, setEditAddressNumber] = useState(false);
  const [idStatus, setIdSatus] = useState(null);
  const [addressStatus, setAddressSatus] = useState(null);
  const [uanStatus, setUanStatus] = useState(null);
  const [gstStatus, setGstStatus] = useState(null);

  const [showOTPInput, setShowOTPInput] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(values?.is_mobile_verified);
  const [hasSentOTPOnce, setHasSentOTPOnce] = useState(false);
  const [openQualifierNotActivePopup, setOpenQualifierNotActivePopup] = useState(false);

  const isCoApplicant = values?.applicants?.[activeIndex]?.applicant_details?.is_primary == false;

  const [customerError, setCustomerError] = useState('');
  const [customerLoader, setCustomerLoader] = useState(true);

  const [idProofError, setIdProofError] = useState('');
  const [idProofLoader, setIdProofLoader] = useState(true);

  const [addressProofError, setAddressProofError] = useState('');
  const [addressProofLoader, setAddressProofLoader] = useState(true);

  const [propertyPaperError, setPropertyPaperError] = useState('');
  const [propertyLoader, setPropertyLoader] = useState(true);


  // progress loaders ** 21/01

  const[propertyProgress,setPropertyProgress] = useState(0)

  const[speed,setSpeed] = useState(0);

  const [salarySlipError, setSalarySlipError] = useState('');
  const [salarySlipLoader, setSalarySlipLoader] = useState(true);

  const [form60Error, setForm60Error] = useState('');
  const [form60Loader, setForm60Loader] = useState(true);

  const [propertyPhotoError, setPropertyPhotoError] = useState('');
  const [propertyPhotoLoader, setPropertyPhotoLoader] = useState(true);

  const [selfieError, setSelfieError] = useState('');
  const [selfieLoader, setSelfieLoader] = useState(true);

  const [docError, setDocError] = useState('');
  const [docLoader, setDocLoader] = useState(true);

  const [pageLoader, setPageLoader] = useState(false);

  const idRef = useRef();
  const addressRef = useRef();

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const preview = searchParams.get('preview');
  const [floading, setFloading] = useState(false);
 const [showpopup, setShowpopup] = useState(false)
 const [documentType, setDocumentType] = useState(null);

  const uniqueId = uuidv4();


  const[initialMount,setInitialMount] = useState(false);

  const navigate = useNavigate();

  const [openOtherDocDrawer, setOpenOtherDocDrawer] = useState(false);

  const [selectedOption, setSelectedOption] = useState(null);
  const inputRef = useRef(null);
  const secondInputRef = useRef(null);
  // const otherDocumentOptions = [
  //   { value: "electricity_bill", label: "Electricity Bill" },
  //   { value: "ration_card", label: "Ration Card" },
  //   { value: "water_bill", label: "Water Bill" },
  //   { value: "other", label: "Other" },
  // ];
  const handleSelect = (option) => setSelectedOption(option);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const handleCloseQualifierNotActivePopup = () => {
    setOpenQualifierNotActivePopup(false);
  };
 
  const[concentChecked,setConcentChecked] = useState(false);

  const [requiredFieldsStatus, setRequiredFieldsStatus] = useState({
    ...values?.applicant_details?.extra_params?.upload_required_fields_status,
  });
  console.log(values);

  const[byPass,setByPass] = useState(false);


  const sanitizeMeta = (meta) => {

    if(!meta) return {};

    const meta_keys = Object.keys(meta);

    if(!meta_keys?.length) return {};

    let copy_meta = structuredClone(meta);

    for(const type of meta_keys){

      copy_meta[type] = copy_meta[type].filter((doc)=> {
        if(doc?.id && doc?.document_fetch_url){
          return doc;
        }
      })
    }

    console.log("THIS IS THE SANITIZED META",copy_meta);

    return copy_meta;

  }



  //---------------------dynamic remove of script if exists ---- only loads on bcp condition for hyperverge

  useEffect(() => {
    const scriptId = "hyperverge-sdk";
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      document.head.removeChild(existingScript);
      console.log("Removed existing HyperVerge SDK script on mount");
    }
  }, []); // Runs only when the component mounts



// Function to dynamically load HyperVerge SDK
const loadHyperVergeSDK = () => {
  return new Promise((resolve, reject) => {
    const scriptId = "hyperverge-sdk";

    // Check if script already exists in the DOM
    if (document.getElementById(scriptId)) {
      resolve("SDK already loaded");
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId; // ✅ Assign an ID to the script
    script.src = "https://hv-camera-web-sg.s3-ap-southeast-1.amazonaws.com/hyperverge-web-sdk@8.13.2/src/sdk.min.js";
    script.crossOrigin = "anonymous";
    script.async = true;
    script.onload = () => resolve("SDK loaded successfully");
    script.onerror = () => reject("Failed to load SDK");

    document.head.appendChild(script);
  });
};

useEffect(()=>{
    console.log("EXISTING APPLICANTS",values?.applicants)

},[])


  // testing the error logger to check the scenarios;

  // useEffect(() => {   // here log
  //   const errorHandler = async (msg, url, lineNo, columnNo, error) => {
  //     console.error("Error Details:", { msg, url, lineNo, columnNo, error });

  //     // fetch("https://your-server.com/log-errors", {
  //     //   method: "POST",
  //     //   body: JSON.stringify({ msg, url, lineNo, columnNo, error }),
  //     //   headers: { "Content-Type": "application/json" },
  //     // });


  //   try{
  //     const res = await axios.post('http://localhost:8005/api/lead/error-log',JSON.stringify({ msg, url, lineNo, columnNo, error,page:"upload-document" }), {
  //       headers: {
  //          "Content-Type": "application/json",
  //         Authorization: token,
  //       },
  //     })
  //   }

  //   catch(err) {
  //     console.log("ERROR LOGGING",err)
  //   }

    
  //   };

  //   window.onerror = errorHandler;

  //   return () => {
  //     window.onerror = null; // Remove error handler when component unmounts
  //   };
  // }, []);




  useEffect(() => {
    console.log("EXISTING>>>>",requiredFieldsStatus)
    updateProgressUploadDocumentSteps(requiredFieldsStatus);
  }, [requiredFieldsStatus]);


 
  useEffect(() => {


    let face_match_done;

    let applicants = values?.applicants;

    for(const applicant of applicants) {

      // check for bypass ** new 02-05-2025

      let lt_bre = applicant?.applicant_details?.lt_bre_101_response;

      if(lt_bre && lt_bre?.["body"]?.["Face_Liveliness_API"] == "na" || lt_bre?.["body"]?.["Face_Liveliness_API"] == "NA"){
        face_match_done = true;
        break;
      }

      if(applicant?.applicant_details?.faceLivliness_status === 'yes') {
        face_match_done = true;
      }
    }


    if(face_match_done == true) {
      setFaceData(true);
    }

  }, [activeIndex,values?.applicants[activeIndex]?.applicant_details?.faceLivliness_status])


  const updateProgressOld = async () => {



      // const res =  updateProgressOnUpload(values?.applicants?.[activeIndex]?.applicant_details?.id,{
      //   headers: {
      //     Authorization: token,
      //   },
      // },);

      let batched_requests = [];

      //Check for all applicants weather qualifier is completed and progress for first 4 screens is not 100

      let applicants = values?.applicants;

      for(const applicant of applicants) {

        let completedProgress = true;

        if(applicant?.applicant_details?.extra_params?.qualifier == true) {

          if(applicant.applicant_details.extra_params.progress != 100) {
            completedProgress = false;
            applicant.applicant_details.extra_params.progress = 100;
          }

          if(applicant.personal_details.extra_params.progress != 100) {
            completedProgress = false;

            applicant.personal_details.extra_params.progress = 100
          }

          if(applicant.address_detail.extra_params.progress != 100) {
            completedProgress = false;
            applicant.address_detail.extra_params.progress = 100
          }

          if(applicant.work_income_detail.extra_params.progress != 100) {
            completedProgress = false;
            applicant.work_income_detail.extra_params.progress = 100
          }
        }

        if(completedProgress == false) {

          batched_requests.push(updateProgressOnUpload(applicant.applicant_details?.id,{
            headers: {
              Authorization: token,
            },
          },));
        }
      }

      const requests = Promise.all(batched_requests);

      setFieldValue('applicants', applicants);

  }


  const updateProgress = async () => {
    try {
      let batched_requests = [];
      let applicants = values?.applicants || [];
  
      for (const applicant of applicants) {
        let completedProgress = true;
  
        if (applicant?.applicant_details?.extra_params?.qualifier) {
          if (applicant?.applicant_details?.extra_params?.progress !== 100) {
            completedProgress = false;
            applicant.applicant_details.extra_params.progress = 100;
          }
  
          if (applicant?.personal_details?.extra_params?.progress !== 100) {
            completedProgress = false;
            applicant.personal_details.extra_params.progress = 100;
          }
  
          if (applicant?.address_detail?.extra_params?.progress !== 100) {
            completedProgress = false;
            applicant.address_detail.extra_params.progress = 100;
          }
  
          if (applicant?.work_income_detail?.extra_params?.progress !== 100) {
            completedProgress = false;
            applicant.work_income_detail.extra_params.progress = 100;
          }
        }
  
        if (!completedProgress) {
          batched_requests.push(
            updateProgressOnUpload(applicant?.applicant_details?.id, {
              headers: { Authorization: token },
            })
          );
        }
      }
  
      // Await all API requests with error handling
      await Promise.all(batched_requests).catch((error) => {
        console.error("Error updating progress:", error);
      });
  
      setFieldValue("applicants", applicants);
    } catch (error) {
      console.error("Unexpected error in updateProgress:", error);
    }
  };


  useEffect(()=> {
    checkisApproved();

    // alert(approved)
  },[activeIndex])



  useEffect(()=> {


    const document_meta = values?.applicants?.[activeIndex]?.applicant_details?.document_meta;

    const extra_params = values?.applicants?.[activeIndex]?.applicant_details?.extra_params;

    setRequiredFieldsStatus({
      customer_photo: !!document_meta?.customer_photos?.find((slip) => slip?.active),
      id_proof: !!document_meta?.id_proof_photos?.find((slip) => slip?.active),
      address_proof: !!document_meta?.address_proof_photos?.find((slip) => slip?.active),
      ...(values?.applicants[activeIndex]?.work_income_detail?.income_proof === 'Form 60' && {
        form_60: !!document_meta?.form_60_photos?.find((slip) => slip?.active),
      }),
      ...(values?.applicants[activeIndex]?.work_income_detail?.profession === 'Salaried' &&
        !isCoApplicant && {
        salary_slip: !!document_meta?.salary_slip_photos?.find((slip) => slip?.active),
      }),
      ...(values?.property_details?.property_identification_is === 'done' &&
        !isCoApplicant && {
        property_paper: !!document_meta?.property_paper_photos?.find((slip) => slip?.active),
        //property_image: !!document_meta?.property_photos?.find((slip) => slip?.active),
      }),
      ...(!isCoApplicant && {
        upload_selfie: !!(
          document_meta?.lo_selfie?.find((slip) => slip?.active) &&
          extra_params?.is_upload_otp_verified
        ),
      }),
      relation_with_main_applicant:values?.applicants?.[activeIndex]?.applicant_details?.is_primary?true:values?.applicants?.[activeIndex]?.personal_details?.relation_with_main_applicant?.length?true:false
    });

  },[])    // initial fallback for upload progress (if user click next before loading previous doc)


  useEffect(() => {
    if (editIdNumber) {
      idRef.current.focus();
    }
  }, [editIdNumber]);

  useEffect(() => {
    // setFaceData(true);
    if (editAddressNumber) {
      addressRef.current.focus();
    }
  }, [editAddressNumber]);


  // OTP ON CALL FOR LO SELFIE


    const handleOTPOnCall = async()=>{
      try {
        const data = await getOTPonCall(loData.session.user_id,{type:"LO_SMS",id:null});

        console.log("DATAERROR",data)
        if(data?.message == "OTP sent successfully" || data?.data?.message == "OTP sent successfully"){
          setDisablePhoneNumber(true);
          setHasSentOTPOnce(true);
          setShowOTPInput(true);
          setToastMessage('OTP has been sent via call successfully.');
        }

        else {
          setErrorToastMessage('Failed to send OTP.');
          setDisablePhoneNumber(false);
          setHasSentOTPOnce(false);
          setShowOTPInput(false);
        }
      } catch (error) {
        console.log(error);
        setDisablePhoneNumber(false);
        setHasSentOTPOnce(false);
        setShowOTPInput(false);
      }
    }


  useEffect(()=> {   // for applicant switch cases  **10/01

    if(values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.is_upload_otp_verified == true) {
      setMobileVerified(true);
    }

  },[])

  useEffect(() => {
    async function getQualifierResponse() {
      const res = await getApplicantById(values?.applicants?.[activeIndex]?.applicant_details?.id, {
        headers: {
          Authorization: token,
        },
      });
      if (res?.extra_params?.is_upload_otp_verified) {
        setMobileVerified(true);
        setDisablePhoneNumber(false);
      }

      if (res?.bre_101_response) {
        const bre_Display_body = res?.bre_101_response?.body?.Display;
        setUanStatus(bre_Display_body?.UAN_Status);
        setGstStatus(bre_Display_body?.GST_Status);

        const id_type = values?.applicants?.[activeIndex]?.personal_details?.id_type;
        const address_type =
          values?.applicants?.[activeIndex]?.personal_details?.selected_address_proof;

        let check_id_type = null;
        let check_address_type = null;

        if (id_type === 'PAN') {
          check_id_type = 'PAN_status';
        } else if (id_type === 'Driving license') {
          check_id_type = 'DL_Status';
        } else if (id_type === 'Voter ID') {
          check_id_type = 'Voter_Status';
        }

        if (address_type === 'PAN') {
          check_address_type = 'PAN_status';
        } else if (address_type === 'Driving license') {
          check_address_type = 'DL_Status';
        } else if (address_type === 'Voter ID') {
          check_address_type = 'Voter_Status';
        }

        for (let i in bre_Display_body) {
          if (i === check_id_type) {
            setIdSatus(bre_Display_body[i]);
          }
          if (i === check_address_type) {
            setAddressSatus(bre_Display_body[i]);
          }
        }
        setIsQaulifierActivated(res?.bre_101_response);
      } else {
        setIsQaulifierActivated(false);
      }
    }


    const getDocuments = () => {
      let documents = [...otherDocumentOptions.all];
        if (values?.applicants?.[activeIndex].personal_details?.marital_status === 'Married') {
          documents = [...documents, ...otherDocumentOptions['ifMarried']];
        }
        if (values?.lead?.loan_type === 'Home Loan') {
          documents = [...documents, ...otherDocumentOptions['homeLoan']];
        }
        if (values?.lead?.loan_type === 'LAP') {
          documents = [...documents, ...otherDocumentOptions['lap']];
        }
        const professionMapping = {
          Pensioner: 'pensioner',
          Salaried: 'salaried',
          'Self Employed': 'selfEmployed',
        };
    
        const profession = values?.applicants?.[activeIndex].work_income_detail?.profession;
        const professionKey = professionMapping[profession];
    
        if (professionKey && otherDocumentOptions[professionKey]) {
          documents = [...documents, ...otherDocumentOptions[professionKey]];
        }
        setFilteredDocuments(documents);
    };
    getQualifierResponse();
    getDocuments()
  }, [activeIndex]);





  const updateFields = async (name, value) => {
    let newData = {};
    newData[name] = value;

    if (!name) {
      const res = await editFieldsById(
        values?.applicants[activeIndex]?.personal_details?.id,
        'personal',
        values?.applicants[activeIndex]?.personal_details,
        {
          headers: {
            Authorization: token,
          },
        },
      );
    } else {
      if (values?.applicants[activeIndex]?.personal_details?.id) {
        const res = await editFieldsById(
          values?.applicants[activeIndex]?.personal_details?.id,
          'personal',
          newData,
          {
            headers: {
              Authorization: token,
            },
          },
        );
      } else {
        let clonedCoApplicantValues = structuredClone(newCoApplicantValues);
        let addData = { ...clonedCoApplicantValues.personal_details, [name]: value };
        await addApi(
          'personal',
          {
            ...addData,
            applicant_id: values?.applicants?.[activeIndex]?.applicant_details?.id,
          },
          {
            headers: {
              Authorization: token,
            },
          },
        )
          .then(async (res) => {
            setFieldValue(`applicants[${activeIndex}].personal_details.id`, res.id);
            await editFieldsById(
              values?.applicants[activeIndex]?.applicant_details?.id,
              'applicant',
              { personal_detail: res.id },
              {
                headers: {
                  Authorization: token,
                },
              },
            );
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  };

  const changeIdType = useCallback(async (e) => {
    setFieldValue(`applicants[${activeIndex}].personal_details.id_type`, e);
    setFieldValue(`applicants[${activeIndex}].personal_details.id_number`, '');

    updateFields('id_type', e);
  }, []);

  const changeSelectedAddressProof = useCallback(async (e) => {
    setFieldValue(`applicants[${activeIndex}].personal_details.selected_address_proof`, e);
    setFieldValue(`applicants[${activeIndex}].personal_details.address_proof_number`, '');

    updateFields('selected_address_proof', e);
  }, []);

  const handleTextInputChange = useCallback(
    (e) => {
      if (e.target.value === ' ') {
        return;
      }
      let value = e.target.value;
      value = value.trimStart().replace(/\s\s+/g, ' ');
      const pattern = /^[A-Za-z]+$/;
      const pattern2 = /^[a-zA-Z\s]*$/;

      if (value?.trim() == '') {
        setFieldValue(e.target.name, value);
      }

      if (
        pattern2.test(value) &&
        (e.target.name == `applicants[${activeIndex}].personal_details.father_name` ||
          e.target.name == `applicants[${activeIndex}].personal_details.mother_name`)
      ) {
        setFieldValue(e.target.name, value.charAt(0).toUpperCase() + value.slice(1));
      }

      if (
        pattern.test(value) &&
        e.target.name !== `applicants[${activeIndex}].personal_details.email` &&
        e.target.name !== `applicants[${activeIndex}].personal_details.id_number` &&
        e.target.name !== `applicants[${activeIndex}].personal_details.address_proof_number`
      ) {
        setFieldValue(e.target.name, value.charAt(0).toUpperCase() + value.slice(1));
      }

      if (e.target.name === `applicants[${activeIndex}].personal_details.email`) {
        const value = e.currentTarget.value;
        const email_pattern = /^[a-zA-Z0-9\s,@\.\/]+$/;

        if (!email_pattern.test(value)) {
          return;
        }

        setFieldValue(e.target.name, value);
        setHasSentOTPOnce(false);
        setShowOTPInput(false);
      }

      if (
        e.target.name === `applicants[${activeIndex}].personal_details.id_number` &&
        values?.applicants?.[activeIndex]?.personal_details?.id_type === 'Passport'
      ) {
        if (value[0] === 'Q' || value[0] === 'X' || value[0] === 'Z') {
          return;
        }
      }

      if (
        e.target.name === `applicants[${activeIndex}].personal_details.address_proof_number` &&
        values?.applicants?.[activeIndex]?.personal_details?.selected_address_proof === 'Passport'
      ) {
        if (value[0] === 'Q' || value[0] === 'X' || value[0] === 'Z') {
          return;
        }
      }

      if (
        e.target.name === `applicants[${activeIndex}].personal_details.id_number` ||
        e.target.name === `applicants[${activeIndex}].personal_details.address_proof_number`
      ) {
        if (
          e.target.name === `applicants[${activeIndex}].personal_details.id_number` &&
          values?.applicants?.[activeIndex]?.personal_details?.id_type === 'AADHAR'
        ) {
          if (e.target.selectionStart !== value.length) {
            e.target.selectionStart = e.target.selectionEnd = value.length;
            return;
          }
          if (
            values?.applicants?.[activeIndex]?.personal_details?.extra_params?.ekyc_option ===
            'Aadhaar'
          ) {
            let aadharPattern = /^\d$/;
            if (aadharPattern.exec(value[value.length - 1]) && value[0] != '0' && value[0] != '1') {
              const maskedPortion = value.slice(0, 8).replace(/\d/g, 'X');
              const maskedAadhar = maskedPortion + value.slice(8);
              setFieldValue(e.target.name, maskedAadhar);
            } else if (
              value.length < values?.applicants?.[activeIndex]?.personal_details?.id_number.length
            ) {
              setFieldValue(e.target.name, value);
            }
          } else {
            let vidPattern = /^\d+$/;
            if (vidPattern.exec(value[value.length - 1])) {
              const maskedPortion = value.slice(0, 12).replace(/\d/g, 'X');
              const maskedVid = maskedPortion + value.slice(12);
              setFieldValue(e.target.name, maskedVid);
            } else if (
              value.length < values?.applicants?.[activeIndex]?.personal_details?.id_number.length
            ) {
              setFieldValue(e.target.name, value);
            }
          }
        } else if (
          e.target.name === `applicants[${activeIndex}].personal_details.address_proof_number` &&
          values?.applicants?.[activeIndex]?.personal_details?.selected_address_proof === 'AADHAR'
        ) {
          if (e.target.selectionStart !== value.length) {
            e.target.selectionStart = e.target.selectionEnd = value.length;
            return;
          }
          if (
            values?.applicants?.[activeIndex]?.personal_details?.extra_params?.ekyc_option ===
            'Aadhaar'
          ) {
            let aadharPattern = /^\d$/;
            if (aadharPattern.exec(value[value.length - 1]) && value[0] != '0' && value[0] != '1') {
              const maskedPortion = value.slice(0, 8).replace(/\d/g, 'X');
              const maskedAadhar = maskedPortion + value.slice(8);
              setFieldValue(e.target.name, maskedAadhar);
            } else if (
              value.length <
              values?.applicants?.[activeIndex]?.personal_details?.address_proof_number.length
            ) {
              setFieldValue(e.target.name, value);
            }
          } else {
            let vidPattern = /^\d+$/;
            if (vidPattern.exec(value[value.length - 1])) {
              const maskedPortion = value.slice(0, 12).replace(/\d/g, '*');
              const maskedVid = maskedPortion + value.slice(12);
              setFieldValue(e.target.name, maskedVid);
            } else if (
              value.length < values?.applicants?.[activeIndex]?.personal_details?.id_number.length
            ) {
              setFieldValue(e.target.name, value);
            }
          }
        } else {
          const pattern2 = /^[A-Za-z0-9]+$/;
          if (pattern2.test(value)) {
            setFieldValue(e.target.name, value.charAt(0).toUpperCase() + value.slice(1));
          }
        }
      }
    },
    [values],
  );

  const sendMobileOtp = async () => {
    setHasSentOTPOnce(true);
    setShowOTPInput(true);

    const res = await getUploadOtp(loData.session.user_id,values?.lead?.id, {
      headers: {
        Authorization: token,
      },
    });
    if (!res) return;

    setToastMessage('OTP has been sent to the mobile number');
  };

  const verifyOTP = useCallback(
    async (loginotp) => {
      const otp = parseInt(loginotp);

      try {
        const res = await verifyUploadOtp(loData?.session?.user_id, otp, {
          headers: {
            Authorization: token,
          },
        });

        if (!res) return;

        const extra_params = values?.applicants?.[activeIndex]?.applicant_details?.extra_params;

        await editFieldsById(
          values?.applicants?.[activeIndex]?.applicant_details?.id,
          'applicant',
          {
            extra_params: { ...extra_params, is_upload_otp_verified: true },
            selfie_consent:true,
            selfie_consent_at:new Date()
          },
          {
            headers: {
              Authorization: token,
            },
          },
        );

        setRequiredFieldsStatus((prev) => ({ ...prev, ['upload_selfie']: true }));


        let applicant_details = structuredClone(values?.applicants?.[activeIndex]?.applicant_details);

        applicant_details.selfie_consent = true;
        applicant_details.selfie_consent_at = new Date();


        setFieldValue(`applicants[${activeIndex}].applicant_details`,applicant_details)

        setDisablePhoneNumber(false);
        setMobileVerified(true);
        setShowOTPInput(false);
      } catch (err) {
        console.log(err);

        setMobileVerified(false);
        setOtpFailCount(err?.response?.data?.fail_count);
        return false;
      }
    },

    [setFieldError, setMobileVerified],
  );

  // useEffect(() => {    ** commented old
  //   async function addPropertyPaperPhotos() {
  //     const data = new FormData();
  //     const filename = propertyPapersFile.name;
  //     data.append('applicant_id', values?.applicants?.[activeIndex]?.applicant_details?.id);
  //     data.append('document_type', 'property_paper_photos');
  //     data.append('document_name', filename);
  //     data.append('geo_lat', propertyPapersLatLong?.lat);
  //     data.append('geo_long', propertyPapersLatLong?.long);

  //     if (propertyPapersFile?.type?.includes('image')) {
  //       await generateImageWithTextWatermark(
  //         values?.lead?.id,
  //         loAllDetails?.employee_code,
  //         loAllDetails?.first_name,
  //         loAllDetails?.middle_name,
  //         loAllDetails?.last_name,
  //         propertyPapersLatLong?.lat,
  //         propertyPapersLatLong?.long,
  //         propertyPapersFile,
  //       )
  //         .then(async (image) => {
  //           if (image?.size > 1000000) {
  //             const options = {
  //               maxSizeMB: 1,
  //               maxWidthOrHeight: 1920,
  //               useWebWorker: true,
  //             };
  //             const compressedFile = await imageCompression(image, options);
  //             const compressedImageFile = new File([compressedFile], filename, {
  //               type: compressedFile.type,
  //             });
  //             data.append('file', compressedImageFile);
  //           } else {
  //             data.append('file', image);
  //           }
  //         })
  //         .catch((err) => {
  //           setPropertyLoader(false);
  //           setPropertyPaperError('Error loading image');
  //         });
  //     } else {
  //       data.append('file', propertyPapersFile);
  //     }

  //     let fileSize = data.get('file');

  //     if (fileSize.size <= 5000000) {

  //       let startTime = Date.now();

  //       const res = await uploadDoc(data, {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //           Authorization: token,
  //         },
  //         onUploadProgress:(progress)=> {

  //           console.log("I AM THE PROGRESSS",progress)
  //           const percentCompleted = Math.round((progress.loaded * 100) / progress.total);
  //           setPropertyProgress(percentCompleted);    
   
  //           const elapsedTime = (Date.now() - startTime) / 1000; // in seconds
  //           const bytesPerSecond = (progress.loaded / elapsedTime).toFixed(2);
  //           setSpeed(bytesPerSecond);
  //         }
  //       },
  //     );

  //       if (res) {
  //         const applicant = await getApplicantById(
  //           values?.applicants?.[activeIndex]?.applicant_details?.id,
  //           {
  //             headers: {
  //               Authorization: token,
  //             },
  //           },
  //         );
  //         const document_meta = applicant.document_meta;
  //         if ('property_paper_photos' in document_meta == false) {
  //           document_meta['property_paper_photos'] = [];
  //         }
  //         document_meta['property_paper_photos'].push({...res?.document,active:true});   // Changed

  //         const edited_applicant = await editFieldsById(
  //           values?.applicants?.[activeIndex]?.applicant_details?.id,
  //           'applicant',
  //           {
  //             document_meta: document_meta,
  //           },
  //           {
  //             headers: {
  //               Authorization: token,
  //             },
  //           },
  //         );

  //         const pdf = edited_applicant.document_meta.property_paper_photos.find((data) => {
  //           if (data?.document_meta?.mimetype === 'application/pdf' && data?.active === true) {
  //             return data;
  //           }
  //         });

  //         // if (pdf) {
  //         //   setPropertyPdf(pdf);
  //         // } else {
  //         //   const active_uploads = edited_applicant.document_meta.property_paper_photos.filter(
  //         //     (data) => {
  //         //       return data?.active === true;
  //         //     },
  //         //   );

  //         //   setPropertyPaperUploads({ data: active_uploads });
  //         // }
  //         const active_uploads = edited_applicant.document_meta.property_paper_photos.filter(
  //           (data) => {
  //             return data?.active === true;
  //           },
  //         );

  //         setPropertyPaperUploads({ data: active_uploads });
  //       }
  //     } else {
  //       setPropertyLoader(false);
  //       setPropertyPaperError('File size should be less than 5MB');
  //     }

  //     setRequiredFieldsStatus((prev) => ({ ...prev, ['property_paper']: true }));
  //   }
  //   propertyPapers.length > 0 && addPropertyPaperPhotos();
  // }, [propertyPapersFile]);


  useEffect(() => {
    if (!propertyPapersFile || !propertyPapersFile.name) return;
  
    async function addPropertyPaperPhotos() {
      setPropertyLoader(true);
  
      const data = new FormData();
      const filename = propertyPapersFile.name;
      data.append('applicant_id', values?.applicants?.[activeIndex]?.applicant_details?.id);
      data.append('document_type', 'property_paper_photos');
      data.append('document_name', filename);
      data.append('geo_lat', propertyPapersLatLong?.lat);
      data.append('geo_long', propertyPapersLatLong?.long);
  
      try {
        let fileToUpload = propertyPapersFile;
  
        // If the file is an image, generate a watermark before upload
        if (propertyPapersFile?.type?.includes('image')) {
          const image = await generateImageWithTextWatermark(
            null,
            values?.lead?.id,
            loAllDetails?.employee_code,
            loAllDetails?.first_name,
            loAllDetails?.middle_name,
            loAllDetails?.last_name,
            propertyPapersLatLong?.lat,
            propertyPapersLatLong?.long,
            propertyPapersFile
          );
  
          // Compress the image only if it's larger than 2MB
          if (image?.size > 2000000) {
            const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
            const compressedFile = await imageCompression(image, options);
            fileToUpload = new File([compressedFile], filename, { type: compressedFile.type });
          } else {
            fileToUpload = image;
          }
        }
  
        data.append('file', fileToUpload);
  
        const fileSize = data.get('file');
        if (!fileSize || fileSize.size > 5000000) {
          setPropertyLoader(false);
          setPropertyPaperError('File size should be less than 5MB');
          return;
        }
  
        let startTime = Date.now();
  
        const res = await uploadDoc(data, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: token },
          onUploadProgress: (progress) => {
            const percentCompleted = Math.round((progress.loaded * 100) / progress.total);
            setPropertyProgress(percentCompleted);
  
            const elapsedTime = (Date.now() - startTime) / 1000; // in seconds
            const bytesPerSecond = (progress.loaded / elapsedTime).toFixed(2);
            setSpeed(bytesPerSecond);
          },
        });
  
        if (res) {
          if(res?.error){
            setShowpopup(true);
            setDocumentType(res?.document_type);
          }

          const applicant = await getApplicantById(
            values?.applicants?.[activeIndex]?.applicant_details?.id,
            { headers: { Authorization: token } }
          );
  
          const document_meta = sanitizeMeta(applicant.document_meta) || {};
          document_meta['property_paper_photos'] = document_meta['property_paper_photos'] || [];
          document_meta['property_paper_photos'].push({ ...res?.document, active: true });
  
          const edited_applicant = await editFieldsById(
            values?.applicants?.[activeIndex]?.applicant_details?.id,
            'applicant',
            { document_meta },
            { headers: { Authorization: token } }
          );
  
          const active_uploads = edited_applicant.document_meta.property_paper_photos.filter(
            (data) => data?.active === true
          );
  
          setPropertyPaperUploads({ data: active_uploads });
        }

        else{
          setPropertyPhotoLoader(false);
          setPropertyPaperError('Upload Failed, Please Retry');
          if(!propertyPaperUploads?.data?.length){
            setPropertyPapers([]);
          }

        }
      } catch (error) {
        setPropertyPaperError('Error uploading file');
      } finally {
        setPropertyLoader(false);
        setRequiredFieldsStatus((prev) => ({ ...prev, property_paper: true }));
      }
    }
  
    (async () => {
      await addPropertyPaperPhotos();
    })();
  }, [propertyPapersFile]);


  useEffect(() => {
    async function editPropertyPaperPhotos() {
      const data = new FormData();
      const filename = editPropertyPaper.file.name;
      data.append('document_type', 'property_paper_photos');
      data.append('document_name', filename);
      data.append('geo_lat', propertyPapersLatLong?.lat);
      data.append('geo_long', propertyPapersLatLong?.long);

      if (editPropertyPaper?.file?.type?.includes('image')) {
        await generateImageWithTextWatermark(
           null,
          values?.lead?.id,
          loAllDetails?.employee_code,
          loAllDetails?.first_name,
          loAllDetails?.middle_name,
          loAllDetails?.last_name,
          propertyPapersLatLong?.lat,
          propertyPapersLatLong?.long,
          editPropertyPaper?.file,
        )
          .then(async (image) => {
            if (image?.size > 1000000) {
              const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
              };
              const compressedFile = await imageCompression(image, options);
              const compressedImageFile = new File([compressedFile], filename, {
                type: compressedFile.type,
              });
              data.append('file', compressedImageFile);
            } else {
              data.append('file', image);
            }
          })
          .catch((err) => {
            setPropertyLoader(false);
            setPropertyPaperError('Error loading image');
          });
      } else {
        data.append('file', editPropertyPaper.file);
      }

      let fileSize = data.get('file');

      if (fileSize.size <= 5000000) {
        const res = await reUploadDoc(editPropertyPaper.id, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: token,
          },
        });

        if (!res) return;

        const applicant = await getApplicantById(
          values?.applicants?.[activeIndex]?.applicant_details?.id,
          {
            headers: {
              Authorization: token,
            },
          },
        );

        const active_uploads = applicant.document_meta.property_paper_photos.filter((data) => {
          return data?.active === true;
        });

        setPropertyPaperUploads({ type: 'property_paper_photos', data: active_uploads });
        setPropertyPapers(active_uploads);
        setPropertyLoader(false);

      } else {
        setPropertyLoader(false);
        setPropertyPaperError('File size should be less than 5MB');
      }
    }
    editPropertyPaper.id && editPropertyPaperPhotos();
  }, [editPropertyPaper]);

  useEffect(() => {
    async function removeProgress() {
      const res = await getApplicantById(values?.applicants?.[activeIndex]?.applicant_details?.id, {
        headers: {
          Authorization: token,
        },
      });
      const active_uploads = res.document_meta.property_paper_photos?.find((data) => {
        return data?.active === true;
      });

      if (!active_uploads && !isCoApplicant) {
        setRequiredFieldsStatus((prev) => ({ ...prev, ['property_paper']: false }));
      }
    }
    removeProgress();
  }, [propertyPaperUploads]);

  // useEffect(() => {      // **commented old
  //   async function addCustomerPhotos() {

  //     const data = new FormData();
  //     const filename = customerPhotosFile.name;
  //     data.append('applicant_id', values?.applicants?.[activeIndex]?.applicant_details?.id);
  //     data.append('document_type', 'customer_photos');
  //     data.append('document_name', filename);
  //     data.append('geo_lat', customerLatLong?.lat);
  //     data.append('geo_long', customerLatLong?.long);
  //     data.append('file', customerPhotosFile);

  //     // if (!customerLatLong && !customerLatLong) {
  //     //   setCustomerLoader(false);
  //     //   setCustomerError('Location is not enabled');

  //     //   if (!customerUploads) {
  //     //     setCustomerUploads(null);
  //     //     setCustomerPhotos([]);
  //     //   } else {
  //     //     setCustomerUploads(customerUploads);
  //     //   }
  //     //   return;
  //     // }

  //     let fileSize = data.get('file');

  //     if (fileSize.size <= 5000000) {
  //       const res = await uploadDoc(data, {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //           Authorization: token,
  //         },
  //       });

  //       if (res) {
  //         const applicant = await getApplicantById(
  //           values?.applicants?.[activeIndex]?.applicant_details?.id,
  //           {
  //             headers: {
  //               Authorization: token,
  //             },
  //           },
  //         );

  //         const document_meta = applicant.document_meta;
  //         if ('customer_photos' in document_meta == false) {
  //           document_meta['customer_photos'] = [];
  //         }

  //         document_meta['customer_photos'].push({...res?.document,active:true});// CHANGE

  //         const edited_applicant = await editFieldsById(
  //           values?.applicants?.[activeIndex]?.applicant_details?.id,
  //           'applicant',
  //           {
  //             document_meta: document_meta,
  //           },
  //           {
  //             headers: {
  //               Authorization: token,
  //             },
  //           },
  //         );

  //         const active_upload = edited_applicant.document_meta.customer_photos.find((data) => {
  //           return data?.active === true;
  //         });

  //         setCustomerUploads({ type: 'customer_photos', data: active_upload });
  //       }
  //     } else {
  //       setCustomerLoader(false);
  //       setCustomerError('File size should be less than 5MB');
  //     }
  //     setRequiredFieldsStatus((prev) => ({ ...prev, ['customer_photo']: true }));
  //   }
  //   customerPhotos.length > 0 && addCustomerPhotos();
  // }, [customerPhotosFile]);

  useEffect(() => {
    if (!customerPhotosFile) return;
  
    async function addCustomerPhotos() {
      if (!customerPhotosFile) return;
      if (customerPhotosFile.size > 5000000) {
        setCustomerLoader(false);
        setCustomerError('File size should be less than 5MB');
        return;
      }
  
      const data = new FormData();
      data.append('applicant_id', values?.applicants?.[activeIndex]?.applicant_details?.id);
      data.append('document_type', 'customer_photos');
      data.append('document_name', customerPhotosFile.name);
      data.append('geo_lat', customerLatLong?.lat);
      data.append('geo_long', customerLatLong?.long);
      data.append('file', customerPhotosFile);
  
      try {
        const res = await uploadDoc(data, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: token },
        });
        console.log("THE CUSTOMER PHOTO UPLOAD RES",res)
  
        if (!res){
          setCustomerLoader(false);
          setCustomerError('Error uploading file');
          setCustomerPhotos(null);
          return;
        }
        if(res?.error){
          setShowpopup(true);
          setDocumentType(res?.document_type);
        }
  
        const applicant = await getApplicantById(
          values?.applicants?.[activeIndex]?.applicant_details?.id,
          { headers: { Authorization: token } }
        );
  
        const document_meta = sanitizeMeta(applicant.document_meta) || {};
        document_meta['customer_photos'] = document_meta['customer_photos'] || [];
        document_meta['customer_photos'].push({ ...res?.document, active: true });
  
        const edited_applicant = await editFieldsById(
          values?.applicants?.[activeIndex]?.applicant_details?.id,
          'applicant',
          { document_meta },
          { headers: { Authorization: token } }
        );
  
        const active_upload = edited_applicant.document_meta.customer_photos.find((data) => data?.active);
        setCustomerUploads({ type: 'customer_photos', data: active_upload });

           // recheck if application form is already generated & face match is already done for this applicant

        let objData = {};

        if(values?.applicants?.[activeIndex]?.applicant_details?.facematch_response?.status == 200 || values?.applicants?.[activeIndex]?.applicant_details?.application_form_otp_verified){
          

          await editFieldsById(values?.applicants?.[activeIndex]?.applicant_details?.id,"applicant",{
            application_form_otp_verified:false,
            facematch_response:{}
          },{
            headers:{
              Authorization:token
            }
          });

          let applicant_details = structuredClone(values?.applicants?.[activeIndex]?.applicant_details);

          applicant_details.application_form_otp_verified = false;
          applicant_details.facematch_response = {};

          setFieldValue(`applicants[${activeIndex}].applicant_details`,applicant_details)

        }

      } catch (error) {
        setCustomerError('Error uploading file');
      } finally {
        setCustomerLoader(false);
        setRequiredFieldsStatus((prev) => ({ ...prev, customer_photo: true }));
      }
    }
  
    (async () => await addCustomerPhotos())();
  }, [customerPhotosFile]);   //**  */


  

  useEffect(() => {
    async function removeProgress() {
      const res = await getApplicantById(values?.applicants?.[activeIndex]?.applicant_details?.id, {
        headers: {
          Authorization: token,
        },
      });
      const active_uploads = res.document_meta.customer_photos?.find((data) => {
        return data?.active === true;
      });

      if (!active_uploads) {
        setRequiredFieldsStatus((prev) => ({ ...prev, ['customer_photo']: false }));
      }
    }
    // removeProgress();
  }, [customerUploads]);

  useEffect(() => {
    async function addIdProofPhotos() {
      const data = new FormData();
      const filename = idProofPhotosFile.name;
      data.append('applicant_id', values?.applicants?.[activeIndex]?.applicant_details?.id);
      data.append('document_type', values?.applicants?.[activeIndex]?.personal_details?.id_type);
      data.append('document_name', filename);
      data.append('geo_lat', idProofLatLong?.lat);
      data.append('geo_long', idProofLatLong?.long);
      data.append('file', idProofPhotosFile);

      const active_photos = idProofUploads?.data?.filter((file) => file.active == true);

      if (active_photos?.length >= 1 && values?.applicants?.[activeIndex]?.personal_details?.id_type !== 'AADHAR') {
        setIdProofLoader(false);
        setIdProofError('Maximum One Image can be uploaded');
        return;
      }

      let fileSize = data.get('file');

      if (fileSize.size <= 5000000) {
        try {
          const res = await uploadDoc(data, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: token,
            },
          });

          if (res) {
            if(res?.error){
              setShowpopup(true);
              setDocumentType(res?.document_type);
            }
            
            const applicant = await getApplicantById(
              values?.applicants?.[activeIndex]?.applicant_details?.id,
              {
                headers: {
                  Authorization: token,
                },
              },
            );
            const document_meta = applicant.document_meta;
            if ('id_proof_photos' in document_meta == false) {
              document_meta['id_proof_photos'] = [];
            }

            document_meta['id_proof_photos'].push({...res?.document,active:true});

            const edited_applicant = await editFieldsById(
              values?.applicants?.[activeIndex]?.applicant_details?.id,
              'applicant',
              {
                document_meta: document_meta,
              },
              {
                headers: {
                  Authorization: token,
                },
              },
            );

            const active_uploads = edited_applicant.document_meta.id_proof_photos.filter((data) => {
              return (
                data?.active === true &&
                data.document_type == values?.applicants?.[activeIndex]?.personal_details?.id_type
              );
            });

            setIdProofUploads({ type: 'id_proof_photos', data: active_uploads });
          }
        } catch (error) {
          console.log('AADHAR_ERR', error);
          setIdProofLoader(false);
          setIdProofError('Upload a valid Aadhaar Image');

          if (!idProofUploads) {
            setIdProofUploads(null);
            setIdProofPhotos([]);
          } else {
            setIdProofUploads(idProofUploads);
          }
          return;
        }
      } else {
        setIdProofLoader(false);
        setIdProofError('File size should be less than 5MB');
      }

      setRequiredFieldsStatus((prev) => ({ ...prev, ['id_proof']: true }));
    }
    idProofPhotos.length > 0 && addIdProofPhotos();
  }, [idProofPhotosFile]);

  useEffect(() => {
    async function editIdProofPhotos() {
      const data = new FormData();
      const filename = editIdProof.file.name;
      data.append('document_type', values?.applicants?.[activeIndex]?.personal_details?.id_type);
      data.append('document_name', filename);
      data.append('geo_lat', idProofLatLong?.lat);
      data.append('geo_long', idProofLatLong?.long);
      data.append('file', editIdProof.file);

      let fileSize = data.get('file');

      if (fileSize.size <= 5000000) {
        try {
          const res = await reUploadDoc(editIdProof.id, data, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: token,
            },
          });

          if (!res) return;

          const applicant = await getApplicantById(
            values?.applicants?.[activeIndex]?.applicant_details?.id,
            {
              headers: {
                Authorization: token,
              },
            },
          );

          const active_uploads = applicant.document_meta.id_proof_photos.filter((data) => {
            return (
              data?.active === true &&
              data.document_type == values?.applicants?.[activeIndex]?.personal_details?.id_type
            );
          });

          setIdProofUploads({ type: 'id_proof_photos', data: active_uploads });
        } catch (error) {
          console.log('AADHAR_ERR', error);
          setIdProofLoader(false);
          setIdProofError(
            'You cannot edit Aadhaar Image, Delete the previous one and reupload a new Image',
          );
        }
      } else {
        setIdProofLoader(false);
        setIdProofError('File size should be less than 5MB');
      }
    }
    editIdProof.id && editIdProofPhotos();
  }, [editIdProof]);

  useEffect(() => {
    async function removeProgress() {
      const res = await getApplicantById(values?.applicants?.[activeIndex]?.applicant_details?.id, {
        headers: {
          Authorization: token,
        },
      });
      const active_uploads = res.document_meta.id_proof_photos?.find((data) => {
        return data?.active === true;
      });

      if (!active_uploads) {
        setRequiredFieldsStatus((prev) => ({ ...prev, ['id_proof']: false }));
      }
    }
    removeProgress();
  }, [idProofUploads]);

  useEffect(() => {
    async function addAddressProofPhotos() {
      const data = new FormData();
      const filename = addressProofPhotosFile.name;
      data.append('applicant_id', values?.applicants?.[activeIndex]?.applicant_details?.id);
      data.append(
        'document_type',
        values?.applicants?.[activeIndex]?.personal_details?.selected_address_proof,
      );
      data.append('document_name', filename);
      data.append('geo_lat', addressProofLatLong?.lat);
      data.append('geo_long', addressProofLatLong?.long);
      data.append('file', addressProofPhotosFile);

      const active_photos = addressProofUploads?.data?.filter((file) => file.active == true);

      if (active_photos?.length >= 2) {
        setAddressProofLoader(false);
        setAddressProofError('Maximum Two Images can be uploaded');
        return;
      }

      let fileSize = data.get('file');

      if (fileSize.size <= 5000000) {
        try {
          const res = await uploadDoc(data, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: token,
            },
          });

          if (res) {
            if(res?.error){
              setShowpopup(true);
              setDocumentType(res?.document_type);
            }
            const applicant = await getApplicantById(
              values?.applicants?.[activeIndex]?.applicant_details?.id,
              {
                headers: {
                  Authorization: token,
                },
              },
            );
            const document_meta = applicant.document_meta;
            if ('address_proof_photos' in document_meta == false) {
              document_meta['address_proof_photos'] = [];
            }

            document_meta['address_proof_photos'].push({...res?.document,active:true});

            const edited_applicant = await editFieldsById(
              values?.applicants?.[activeIndex]?.applicant_details?.id,
              'applicant',
              {
                document_meta: document_meta,
              },
              {
                headers: {
                  Authorization: token,
                },
              },
            );

            const active_uploads = edited_applicant.document_meta.address_proof_photos.filter(
              (data) => {
                return (
                  data?.active === true &&
                  data.document_type ==
                    values?.applicants?.[activeIndex]?.personal_details?.selected_address_proof
                );
              },
            );

            setAddressProofUploads({ type: 'address_proof_photos', data: active_uploads });
          }
        } catch (error) {
          console.log('AADHAR_ERR', error);
          setAddressProofLoader(false);
          setAddressProofError('Upload a valid Aadhaar Image');

          if (!addressProofUploads) {
            setAddressProofUploads(null);
            setAddressProofPhotos([]);
          } else {
            setAddressProofUploads(addressProofUploads);
          }
          return;
        }
      } else {
        setAddressProofLoader(false);
        setAddressProofError('File size should be less than 5MB');
      }

      setRequiredFieldsStatus((prev) => ({ ...prev, ['address_proof']: true }));
    }
    addressProofPhotos.length > 0 && addAddressProofPhotos();
  }, [addressProofPhotosFile]);

  useEffect(() => {
    async function editAddressProofPhotos() {
      const data = new FormData();
      const filename = editAddressProof.file.name;
      data.append(
        'document_type',
        values?.applicants?.[activeIndex]?.personal_details?.selected_address_proof,
      );
      data.append('document_name', filename);
      data.append('geo_lat', addressProofLatLong?.lat);
      data.append('geo_long', addressProofLatLong?.long);
      data.append('file', editAddressProof.file);

      let fileSize = data.get('file');

      if (fileSize.size <= 5000000) {
        try {
          const res = await reUploadDoc(editAddressProof.id, data, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: token,
            },
          });

          if (!res) return;

          const applicant = await getApplicantById(
            values?.applicants?.[activeIndex]?.applicant_details?.id,
            {
              headers: {
                Authorization: token,
              },
            },
          );

          const active_uploads = applicant.document_meta.address_proof_photos.filter((data) => {
            return (
              data?.active === true &&
              data.document_type ==
                values?.applicants?.[activeIndex]?.personal_details?.selected_address_proof
            );
          });

          setAddressProofUploads({ type: 'address_proof_photos', data: active_uploads });
        } catch (error) {
          console.log('AADHAR_ERR', error);
          setAddressProofLoader(false);
          setAddressProofError(
            'You cannot edit Aadhaar Image, Delete the previous one and reupload a new Image',
          );
        }
      } else {
        setAddressProofLoader(false);
        setAddressProofError('File size should be less than 5MB');
      }
    }
    editAddressProof.id && editAddressProofPhotos();
  }, [editAddressProof]);

  useEffect(() => {
    async function removeProgress() {
      const res = await getApplicantById(values?.applicants?.[activeIndex]?.applicant_details?.id, {
        headers: {
          Authorization: token,
        },
      });
      const active_uploads = res.document_meta.address_proof_photos?.find((data) => {
        return data?.active === true;
      });

      if (!active_uploads) {
        setRequiredFieldsStatus((prev) => ({ ...prev, ['address_proof']: false }));
      }
    }
    removeProgress();
  }, [addressProofUploads]);

  useEffect(() => {
    async function addSalarySlipPhotos() {
      const data = new FormData();
      const filename = salarySlipPhotosFile.name;
      data.append('applicant_id', values?.applicants?.[activeIndex]?.applicant_details?.id);
      data.append('document_type', 'salary_slip_photos');
      data.append('document_name', filename);
      data.append('geo_lat', salarySlipLatLong?.lat);
      data.append('geo_long', salarySlipLatLong?.long);
      data.append('file', salarySlipPhotosFile);

      let fileSize = data.get('file');

      if (fileSize.size <= 5000000) {
        const res = await uploadDoc(data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: token,
          },
        });

        if (res) {
        if(res?.error){
          setShowpopup(true);
          setDocumentType(res?.document_type);
        }
          const applicant = await getApplicantById(
            values?.applicants?.[activeIndex]?.applicant_details?.id,
            {
              headers: {
                Authorization: token,
              },
            },
          );
          const document_meta = sanitizeMeta(applicant.document_meta) || {};
          if ('salary_slip_photos' in document_meta == false) {
            document_meta['salary_slip_photos'] = [];
          }

          document_meta['salary_slip_photos'].push({...res?.document,active:true});

          const edited_applicant = await editFieldsById(
            values?.applicants?.[activeIndex]?.applicant_details?.id,
            'applicant',
            {
              document_meta: document_meta,
            },
            {
              headers: {
                Authorization: token,
              },
            },
          );

          const active_uploads = edited_applicant.document_meta.salary_slip_photos.filter(
            (data) => {
              return data?.active === true;
            },
          );

          setSalarySlipUploads({ type: 'salary_slip_photos', data: active_uploads });
        }

        
        else{
          setSalarySlipLoader(false);
          setSalarySlipError('Upload Failed, Please Retry');
          if(!salarySlipUploads?.data?.length){
            setSalarySlipPhotos([]);
          }
        }
      } else {
        setSalarySlipLoader(false);
        setSalarySlipError('File size should be less than 5MB');
      }

      setRequiredFieldsStatus((prev) => ({ ...prev, ['salary_slip']: true }));
    }
    salarySlipPhotos.length > 0 && addSalarySlipPhotos();
  }, [salarySlipPhotosFile]);

  useEffect(() => {
    async function editSalarySlipPhotos() {
      const data = new FormData();
      const filename = editSalarySlip.file.name;
      data.append('document_type', 'salary_slip_photos');
      data.append('document_name', filename);
      data.append('geo_lat', salarySlipLatLong?.lat);
      data.append('geo_long', salarySlipLatLong?.long);
      data.append('file', editSalarySlip.file);

      let fileSize = data.get('file');

      if (fileSize.size <= 5000000) {
        const res = await reUploadDoc(editSalarySlip.id, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: token,
          },
        });

        if (!res) return;

        const applicant = await getApplicantById(
          values?.applicants?.[activeIndex]?.applicant_details?.id,
          {
            headers: {
              Authorization: token,
            },
          },
        );

        const active_uploads = applicant.document_meta.salary_slip_photos.filter((data) => {
          return data?.active === true;
        });

        setSalarySlipUploads({ type: 'salary_slip_photos', data: active_uploads });
      } else {
        setSalarySlipLoader(false);
        setSalarySlipError('File size should be less than 5MB');
      }
    }
    editSalarySlip.id && editSalarySlipPhotos();
  }, [editSalarySlip]);

  useEffect(() => {
    async function removeProgress() {
      const res = await getApplicantById(values?.applicants?.[activeIndex]?.applicant_details?.id, {
        headers: {
          Authorization: token,
        },
      });
      const active_uploads = res.document_meta.salary_slip_photos?.find((data) => {
        return data?.active === true;
      });

      if (!active_uploads) {
        setRequiredFieldsStatus((prev) => ({ ...prev, ['salary_slip']: false }));
      }
    }
    removeProgress();
  }, [salarySlipUploads]);

  useEffect(() => {
    async function addForm60Photos() {
      const data = new FormData();
      const filename = form60photosFile.name;
      data.append('applicant_id', values?.applicants?.[activeIndex]?.applicant_details?.id);
      data.append('document_type', 'form_60_photos');
      data.append('document_name', filename);
      data.append('geo_lat', form60LatLong?.lat);
      data.append('geo_long', form60LatLong?.long);
      data.append('file', form60photosFile);

      let fileSize = data.get('file');

      if (fileSize.size <= 5000000) {
        const res = await uploadDoc(data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: token,
          },
        });

        if (res) {
          if(res?.error){
            setShowpopup(true);
            setDocumentType(res?.document_type);
          }
          const applicant = await getApplicantById(
            values?.applicants?.[activeIndex]?.applicant_details?.id,
            {
              headers: {
                Authorization: token,
              },
            },
          );
          const document_meta = sanitizeMeta(applicant.document_meta) || {};
          if ('form_60_photos' in document_meta == false) {
            document_meta['form_60_photos'] = [];
          }
          document_meta['form_60_photos'].push({...res?.document,active:true});

          const edited_applicant = await editFieldsById(
            values?.applicants?.[activeIndex]?.applicant_details?.id,
            'applicant',
            {
              document_meta: document_meta,
            },
            {
              headers: {
                Authorization: token,
              },
            },
          );

          const active_uploads = edited_applicant.document_meta.form_60_photos.filter((data) => {
            return data?.active === true;
          });

          setForm60Uploads({ type: 'form_60_photos', data: active_uploads });

          setForm60Loader(false);

        }

        else {
          setForm60Loader(false);
          setForm60Error("Upload Failed, Please Retry");
          if(!form60Uploads?.data?.length){
            setForm60photos([]);
          }
        }
      } else {
        setForm60Loader(false);
        setForm60Error('File size should be less than 5MB');
      }

      setRequiredFieldsStatus((prev) => ({ ...prev, ['form_60']: true }));
    }
    form60photos.length > 0 && addForm60Photos();
  }, [form60photosFile]);

  useEffect(() => {
    async function editForm60Photos() {
      const data = new FormData();
      const filename = editForm60.file.name;
      data.append('document_type', 'form_60_photos');
      data.append('document_name', filename);
      data.append('geo_lat', form60LatLong?.lat);
      data.append('geo_long', form60LatLong?.long);
      data.append('file', editForm60.file);

      let fileSize = data.get('file');

      if (fileSize.size <= 5000000) {
        const res = await reUploadDoc(editForm60.id, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: token,
          },
        });

        if (!res) return;

        const applicant = await getApplicantById(
          values?.applicants?.[activeIndex]?.applicant_details?.id,
          {
            headers: {
              Authorization: token,
            },
          },
        );

        const active_uploads = applicant.document_meta.form_60_photos.filter((data) => {
          return data?.active === true;
        });

        setForm60Uploads({ type: 'form_60_photos', data: active_uploads });
      } else {
        setForm60Loader(false);
        setForm60Error('File size should be less than 5MB');
      }
    }
    editForm60.id && editForm60Photos();
  }, [editForm60]);

  useEffect(() => {
    async function removeProgress() {
      const res = await getApplicantById(values?.applicants?.[activeIndex]?.applicant_details?.id, {
        headers: {
          Authorization: token,
        },
      });
      const active_uploads = res.document_meta.form_60_photos?.find((data) => {
        return data?.active === true;
      });

      if (!active_uploads) {
        setRequiredFieldsStatus((prev) => ({ ...prev, ['form_60']: false }));
      }
    }
    removeProgress();
  }, [form60Uploads]);

  useEffect(() => {
    async function addPropertyPhotos() {
      const data = new FormData();
      const filename = propertyPhotosFile.name;
      data.append('applicant_id', values?.applicants?.[activeIndex]?.applicant_details?.id);
      data.append('document_type', 'property_photos');
      data.append('document_name', filename);
      data.append('geo_lat', propertyLatLong?.lat);
      data.append('geo_long', propertyLatLong?.long);
      data.append('file', propertyPhotosFile);

      let fileSize = data.get('file');

      if (fileSize.size <= 5000000) {
        const res = await uploadDoc(data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: token,
          },
        });
        if (res) {
          if(res?.error){
            setShowpopup(true);
            setDocumentType(res?.document_type);
          }
          const applicant = await getApplicantById(
            values?.applicants?.[activeIndex]?.applicant_details?.id,
            {
              headers: {
                Authorization: token,
              },
            },
          );
          const document_meta = applicant.document_meta;
          if ('property_photos' in document_meta == false) {
            document_meta['property_photos'] = [];
          }
          document_meta['property_photos'].push({...res?.document,active:true});

          const edited_applicant = await editFieldsById(
            values?.applicants?.[activeIndex]?.applicant_details?.id,
            'applicant',
            {
              document_meta: document_meta,
            },
            {
              headers: {
                Authorization: token,
              },
            },
          );

          const active_uploads = edited_applicant.document_meta.property_photos.filter((data) => {
            return data?.active === true;
          });

          setPropertyUploads({ type: 'property_photos', data: active_uploads });
        }
      } else {
        setPropertyPhotoLoader(false);
        setPropertyPhotoError('File size should be less than 5MB');
      }

      //setRequiredFieldsStatus((prev) => ({ ...prev, ['property_image']: true }));
    }
    propertyPhotos.length > 0 && addPropertyPhotos();
  }, [propertyPhotosFile]);

  useEffect(() => {
    async function editPropertyPhotos() {
      const data = new FormData();
      const filename = editProperty.file.name;
      data.append('document_type', 'property_photos');
      data.append('document_name', filename);
      data.append('geo_lat', propertyLatLong?.lat);
      data.append('geo_long', propertyLatLong?.long);
      data.append('file', editProperty.file);

      let fileSize = data.get('file');

      if (fileSize.size <= 5000000) {
        const res = await reUploadDoc(editProperty.id, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: token,
          },
        });

        if (!res) return;

        const applicant = await getApplicantById(
          values?.applicants?.[activeIndex]?.applicant_details?.id,
          {
            headers: {
              Authorization: token,
            },
          },
        );

        const active_uploads = applicant.document_meta.property_photos.filter((data) => {
          return data?.active === true;
        });

        setPropertyUploads({ type: 'property_photos', data: active_uploads });
      } else {
        setPropertyPhotoLoader(false);
        setPropertyPhotoError('File size should be less than 5MB');
      }
    }
    editProperty.id && editPropertyPhotos();
  }, [editProperty]);

  useEffect(() => {
    async function removeProgress() {
      const res = await getApplicantById(values?.applicants?.[activeIndex]?.applicant_details?.id, {
        headers: {
          Authorization: token,
        },
      });
      const active_uploads = res.document_meta.property_photos?.find((data) => {
        return data?.active === true;
      });

      if (!active_uploads && !isCoApplicant) {
       // setRequiredFieldsStatus((prev) => ({ ...prev, ['property_image']: false }));
      }
    }
    removeProgress();
  }, [propertyUploads]);

  useEffect(() => {
    async function addSelfiePhoto() {

      try {
        const data = new FormData();
        const filename = selfieFile.name;
        data.append('applicant_id', values?.applicants?.[activeIndex]?.applicant_details?.id);
        data.append('document_type', 'lo_selfie');
        data.append('document_name', filename);
        data.append('geo_lat', loSelfieLatLong?.lat);
        data.append('geo_long', loSelfieLatLong?.long);
        data.append('file', selfieFile);
      
        let fileSize = data.get('file');
      
        if (fileSize.size <= 5000000) {
          const res = await uploadDoc(data, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: token,
            },
          });
      
          if (res) {
            if(res?.error){
              setShowpopup(true);
              setDocumentType(res?.document_type);
            }
            const applicant = await getApplicantById(
              values?.applicants?.[activeIndex]?.applicant_details?.id,
              {
                headers: {
                  Authorization: token,
                },
              },
            );
            const document_meta = applicant.document_meta;
            if (!document_meta['lo_selfie']) {
              document_meta['lo_selfie'] = [];
            }
            document_meta['lo_selfie'].push({ ...res?.document, active: true });
      
            const edited_applicant = await editFieldsById(
              values?.applicants?.[activeIndex]?.applicant_details?.id,
              'applicant',
              {
                document_meta: document_meta,
              },
              {
                headers: {
                  Authorization: token,
                },
              },
            );
      
            const active_upload = edited_applicant.document_meta.lo_selfie.find((data) => {
              return data?.active === true;
            });
      
            setSelfieUploads({ type: 'lo_selfie', data: active_upload });
          }
        } else {
          setSelfieLoader(false);
          setSelfieError('File size should be less than 5MB');
        }
      } catch (err) {
        console.error('File upload failed:', err); // Log the error for debugging
        setSelfieLoader(false);
        setSelfieError('FILE UPLOAD FAILED');
      }
    }
    selfie.length > 0 && addSelfiePhoto();
  }, [selfieFile]);

  useEffect(() => {
    async function removeProgress() {
      const res = await getApplicantById(values?.applicants?.[activeIndex]?.applicant_details?.id, {
        headers: {
          Authorization: token,
        },
      });
      const active_uploads = res.document_meta.lo_selfie?.find((data) => {
        return data?.active === true;
      });

      if (!active_uploads && !isCoApplicant) {
        setRequiredFieldsStatus((prev) => ({ ...prev, ['upload_selfie']: false }));
      }
    }
    // removeProgress();
  }, [selfieUploads]);

  useEffect(() => {
    async function addOtherDocPhotos() {
      const data = new FormData();
      const filename = docsFile.name;
      data.append('applicant_id', values?.applicants?.[activeIndex]?.applicant_details?.id);
      data.append('document_type', 'other_docs');
      data.append('document_name', filename);
      data.append('geo_lat', otherDocsLatLong?.lat);
      data.append('geo_long', otherDocsLatLong?.long);
      data.append('file', docsFile);
      data.append("document_type_specific",selectedOption.value)
      
      let fileSize = data.get('file');

      if (fileSize.size <= 5000000) {
        const res = await uploadDoc(data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: token,
          },
        });

        if (res) {
          if(res?.error){
            setShowpopup(true);
            setDocumentType(res?.document_type);
          }
          const applicant = await getApplicantById(
            values?.applicants?.[activeIndex]?.applicant_details?.id,
            {
              headers: {
                Authorization: token,
              },
            },
          );
          const document_meta = applicant.document_meta;
          if ('other_docs' in document_meta == false) {
            document_meta['other_docs'] = [];
          }
          document_meta['other_docs'].push({...res?.document,active:true});

          const edited_applicant = await editFieldsById(
            values?.applicants?.[activeIndex]?.applicant_details?.id,
            'applicant',
            {
              document_meta: document_meta,
            },
            {
              headers: {
                Authorization: token,
              },
            },
          );

          const active_uploads = edited_applicant.document_meta.other_docs.filter((data) => {
            return data?.active === true;
          });

          setDocUploads({ type: 'other_docs', data: active_uploads });
          setOpenOtherDocDrawer(false);
          handleSelect(null);
        }
      } else {
        setDocLoader(false);
        setOpenOtherDocDrawer(false);
        handleSelect(null);
        setDocError('File size should be less than 5MB');
      }
    }
    docs.length > 0 && addOtherDocPhotos();
  }, [docsFile]);

  useEffect(() => {
    async function editOtherDocPhotos() {
      const data = new FormData();
      const filename = editDoc.file.name;
      data.append('document_type', 'other_docs');
      data.append('document_name', filename);
      data.append('geo_lat', otherDocsLatLong?.lat);
      data.append('geo_long', otherDocsLatLong?.long);
      data.append('file', editDoc.file);

      let fileSize = data.get('file');

      if (fileSize.size <= 5000000) {
        const res = await reUploadDoc(editDoc.id, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: token,
          },
        });

        if (!res) return;

        const applicant = await getApplicantById(
          values?.applicants?.[activeIndex]?.applicant_details?.id,
          {
            headers: {
              Authorization: token,
            },
          },
        );

        const active_uploads = applicant.document_meta.other_docs.filter((data) => {
          return data?.active === true;
        });

        setDocUploads({ type: 'other_docs', data: active_uploads });
      } else {
        setDocLoader(false);
        setDocError('File size should be less than 5MB');
      }
    }
    editDoc.id && editOtherDocPhotos();
  }, [editDoc]);

  useEffect(() => {


    async function bcpKey() {


      //{"body": {"L&T_API": "AirPay", "L&T_Charges": 2, "Face_Liveliness_API": "Hyperverge"}, "statusCode": 200}
 
      try{
    
      let activeBCP;

      // loop through all applicants and check ** exceptions if primary is switched

      const applicants = [...(values?.applicants || [])];

      for(const app of applicants){

        activeBCP = app?.applicant_details?.lt_bre_101_response?.["body"]?.["Face_Liveliness_API"];

        if(activeBCP?.length) break;
      }

      if(activeBCP?.length) {   // check weather if bcp for FL exists

        if(activeBCP == 'Hyperverge') {
          setBcpResult(1);
        }

        else{
          setBcpResult(0);
        }

      }

      else {     // if IT BRE response not available call and fetch from db

      const res = await bcpKeyCheck({

        headers: {

          Authorization: token,

        },

      });

      setBcpResult(res?.selectedTypeId);

      }
 

    }

    catch(err) {

      console.log(err)

    }

  }
    bcpKey();




    async function getPreviousUploads() {    //doc fetch
     
      // setPageLoader(true);

      setIsFetching(true);

      let res = await getApplicantById(values?.applicants?.[activeIndex]?.applicant_details?.id, {
        headers: {
          Authorization: token,
        },
      },["salary_slip_photos"]);
      // const res = values.applicants?.[activeIndex]?.applicant_details;

      let copy_res = structuredClone(res);

      copy_res.document_meta = sanitizeMeta(res.document_meta);

      res = copy_res;


      if (!res) {

        setCustomerLoader(false);
        
        return;
      }
      if (res.document_meta?.customer_photos) {
        const active_upload = res.document_meta.customer_photos.find((data) => {
          if (data !== null) return data?.active === true;
        });

        if (active_upload) {
          setCustomerUploads({ type: 'customer_photos', data: active_upload });
          setCustomerPhotos([1]);
          setCustomerLoader(false)     // ** NEW CHANGE

          //**here */

        } else {
          setCustomerUploads(null);
          setCustomerPhotos([]);
          setCustomerLoader(false)     // ** NEW CHANGE

        }
      } else {
        setCustomerUploads(null);
        setCustomerPhotos([]);
        setCustomerLoader(false)     // ** NEW CHANGE
      }

      console.log("RESPONSE NEW",copy_res)
      
      if (res.document_meta.id_proof_photos) {
        const pdf = res.document_meta.id_proof_photos.find((data) => {
          if (data !== null) {
            if (data?.document_meta?.mimetype === 'application/pdf' && data?.active === true) {
              return data;
            }
          }
        });
        if (pdf) {
          setIdProofPdf(pdf);
          setIdProofPhotos([1]);
          setIdProofLoader(false)    //** NEW CHANGE */ **26/12

        } else {
          const active_uploads = res.document_meta.id_proof_photos.filter((data) => {
            if (data !== null)
              return (
                data?.active === true &&
                data.document_type == values?.applicants?.[activeIndex]?.personal_details?.id_type
              );
          });
          if (active_uploads.length) {
            setIdProofUploads({ type: 'id_proof_photos', data: active_uploads });
            setIdProofPhotos(active_uploads);
            setIdProofLoader(false)    //** NEW CHANGE */

          } else {
            setIdProofUploads(null);
            setIdProofPhotos([]);
            setIdProofLoader(false)    //** NEW CHANGE */  **26/12

          }

          setIdProofLoader(false)    //** NEW CHANGE */ **26/12

        }
      } else {

        setIdProofUploads(null);
        setIdProofPhotos([]);
        setIdProofLoader(false)    //** NEW CHANGE */

      }
      if (res.document_meta.property_paper_photos) {
        const pdf = res.document_meta.property_paper_photos.find((data) => {
          if (data !== null)
            if (data?.document_meta?.mimetype == 'application/pdf' && data?.active === true) {
              return data;
            }
        });

        if (1 == 2) {

          setPropertyPdf(pdf);
          setPropertyPapers([1]);

        }
        else {
         
          const active_uploads = res.document_meta.property_paper_photos.filter((data) => {
            if (data !== null) return data?.active === true;
          });
          if (active_uploads.length) {
            setPropertyPaperUploads({ type: 'property_paper_photos', data: active_uploads });
            setPropertyPapers(active_uploads);
            setPropertyLoader(false)

          } else {
            setPropertyPaperUploads(null);
            setPropertyPapers([]);
            setPropertyLoader(false)
          }
        }
      } else {
        setPropertyPaperUploads(null);
        setPropertyPapers([]);
        setPropertyLoader(false)   //** NEW CHANGE */
      }
      if (res.document_meta.address_proof_photos) {
        const pdf = res.document_meta.address_proof_photos.find((data) => {
          if (data !== null) {
            if (data?.document_meta?.mimetype === 'application/pdf' && data?.active === true) {
              return data;
            }
          }
        });
        if (pdf) {
          setAddressProofPdf(pdf);
          setAddressProofPhotos([1]);
          setAddressProofLoader(false)  //** 26/12
        } else {
          const active_uploads = res.document_meta.address_proof_photos.filter((data) => {
            if (data !== null)
              return (
                data?.active === true &&
                data.document_type ==
                  values?.applicants[activeIndex]?.personal_details?.selected_address_proof
              );
          });
          if (active_uploads.length) {
            setAddressProofUploads({ type: 'address_proof_photos', data: active_uploads });
            setAddressProofPhotos(active_uploads);
            setAddressProofLoader(false)   //** NEW CHANGE * 26/12*


          } else {
            setAddressProofUploads(null);
            setAddressProofPhotos([]);
            setAddressProofLoader(false)   //** NEW CHANGE */ 26/12
          }
        }
      } else {
        setAddressProofUploads(null);
        setAddressProofPhotos([]);
        setAddressProofLoader(false)   //** NEW CHANGE */
      }
      if (res.document_meta.salary_slip_photos) {
        const active_uploads = res.document_meta.salary_slip_photos.filter((data) => {
          if (data !== null) return data?.active === true;
        });
        if (active_uploads.length) {
          setSalarySlipUploads({ type: 'salary_slip_photos', data: active_uploads });
          setSalarySlipPhotos(active_uploads);
          setSalarySlipLoader(false)   //26/12
        } else {
          setSalarySlipUploads(null);
          setSalarySlipPhotos([]);
          setSalarySlipLoader(false)   //26/12
        }
      } else {
        setSalarySlipUploads(null);
        setSalarySlipPhotos([]);
        setSalarySlipLoader(false)   //**NEW CHANGE */
      }
      
      if (res.document_meta.form_60_photos) {
        const active_uploads = res.document_meta.form_60_photos.filter((data) => {
          if (data !== null) return data?.active === true;
        });
        if (active_uploads.length) {
          setForm60Uploads({ type: 'form_60_photos', data: active_uploads });
          setForm60photos(active_uploads);
          setForm60Loader(false)

        } else {
          setForm60Uploads(null);
          setForm60photos([]);
          setForm60Loader(false)

        }
      } else {
        setForm60Uploads(null);
        setForm60photos([]);
        setForm60Loader(false) //** NEW CHANGE */
      }
      if (res.document_meta.property_photos) {
        const active_uploads = res.document_meta.property_photos.filter((data) => {
          if (data !== null) return data?.active === true;
        });
        if (active_uploads.length) {
          setPropertyUploads({ type: 'property_photos', data: active_uploads });
          setPropertyPhotos(active_uploads);
          setPropertyPhotoLoader(false)   //26/12
        } else {
          setPropertyUploads(null);
          setPropertyPhotos([]);
          setPropertyPhotoLoader(false)   //26/12
        }
      } else {
        setPropertyUploads(null);
        setPropertyPhotos([]);
        setPropertyPhotoLoader(false) //**NEW CHANGE */
      }
      if (res.document_meta.lo_selfie) {
        const active_upload = res.document_meta.lo_selfie.find((data) => {
          if (data !== null) return data?.active === true;
        });
        if (active_upload) {
          setSelfieUploads({ type: 'lo_selfie', data: active_upload });
          setSelfie([1]);
          setSelfieLoader(false) //change26/12

        } else {
          setSelfieUploads(null);
          setSelfie([]);
          setSelfieLoader(false) //change26/12

        }
      } else {
        setSelfieUploads(null);
        setSelfie([]);
        setSelfieLoader(false) //** NEW CHANGE */
      }
      if (res.document_meta.other_docs) {
        const active_uploads = res.document_meta.other_docs.filter((data) => {
          if (data !== null) return data?.active === true;
        });
        if (active_uploads.length) {
          setDocUploads({ type: 'other_docs', data: active_uploads });
          setDocs(active_uploads);    //**HERE */
          setDocLoader(false)

        } else {
          setDocUploads(null);
          setDocs([]);
          setDocLoader(false)
        }
      } else {
        setDocUploads(null);
        setDocs([]);
        setDocLoader(false)  //**NEW CHANGE */
      }


      setCustomerLoader(false);     // ** NEW CHANGE

      setSalarySlipLoader(false);

      setIdProofLoader(false);

      setAddressProofLoader(false);

      setPropertyLoader(false);

      setSelfieLoader(false);

      setDocLoader(false);

      setForm60Loader(false);


      setIsFetching(false);


    }

    async function getRequiredFields() {
      const { extra_params,ekyc_data, document_meta } = await getApplicantById(
        values?.applicants?.[activeIndex]?.applicant_details?.id,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      console.log('ekyc_data--------------------------------',ekyc_data);
      setFieldValue(`applicants.[${activeIndex}].applicant_details.document_meta`, document_meta);
      setFieldValue(`applicants.[${activeIndex}].applicant_details.ekyc_data`, ekyc_data);
      setRequiredFieldsStatus({
        customer_photo: !!document_meta?.customer_photos?.find((slip) => slip?.active),
        id_proof: !!document_meta?.id_proof_photos?.find((slip) => slip?.active),
        address_proof: !!document_meta?.address_proof_photos?.find((slip) => slip?.active),
        ...(values?.applicants[activeIndex]?.work_income_detail?.income_proof === 'Form 60' && {
          form_60: !!document_meta?.form_60_photos?.find((slip) => slip?.active),
        }),
        ...(values?.applicants[activeIndex]?.work_income_detail?.profession === 'Salaried' &&
          !isCoApplicant && {
          salary_slip: !!document_meta?.salary_slip_photos?.find((slip) => slip?.active),
        }),
        ...(values?.property_details?.property_identification_is === 'done' &&
          !isCoApplicant && {
          property_paper: !!document_meta?.property_paper_photos?.find((slip) => slip?.active),
          //property_image: !!document_meta?.property_photos?.find((slip) => slip?.active),
        }),
        ...(!isCoApplicant && {
          upload_selfie: !!(
            document_meta?.lo_selfie?.find((slip) => slip?.active) &&
            extra_params?.is_upload_otp_verified
          ),
        }),
         relation_with_main_applicant:values?.applicants?.[activeIndex]?.applicant_details?.is_primary?true:values?.applicants?.[activeIndex]?.personal_details?.relation_with_main_applicant?.length?true:false
      });

      setPageLoader(false);

      // change required here **
    }
    getPreviousUploads()
      .then(() => {
        getRequiredFields().catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }, [
    values?.applicants?.[activeIndex]?.personal_details?.id_type,
    values?.applicants[activeIndex]?.personal_details?.selected_address_proof,
    activeIndex,
  ]);

  // Handle face livliness feature created by Pankaj Yadav on feb 6, 2024
  const handleClick = async () => {
    if (floading) return; // Prevent multiple clicks if already loading or faceData exists
    setFloading(true); // Set loading state to true

    if (bcpResult === 0) {
      const image2 = idProofPhotos[0]?.document_fetch_url;

      if (idProofPhotos.length === 0) {
        alert('Please upload the ID proof to continue')
      }
 
      if (idProofPhotosFile !== null) {
        const data = new FormData();
        data.append('file', idProofPhotosFile);
        //data.append('ttl', '30 mins');
        data.append('ttl', '3 days');
 
        //if(data.essentials.matchImage[0] !== undefined){
          const res = await uploadDocFace(data, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
          });
          var result = res?.file?.directURL;
          console.log("_____________________________________?? ~ handleClick ~ result:----------------", result)
        //}
 
     
        try {
          const data = {
            "task": "gestureUrl",
            "essentials": {
              "matchImage": [
                result
              ],
              "validGestures": ["blink"],//, "Right"],
              "gestureSequenceLength": "1" ,//"2",
              "languageCode": "en",
              "callbackUrl": "https://itrustuatcloud.indiashelter.in/static-page",
              "redirectUrl": "https://itrustuatcloud.indiashelter.in/static-page",
              "enableLocationCapture": "false",
              "customizations": {
                "hideInstructionsHeader": false,
                "hideVideoVerificationHeader": true,
                "hideInstructions": false,
                //"otpRequired": false,
                //"--main-bg-color": "",
                "--button-bg-color": "",
                "--main-heading": "",
                "logoUrl": "https://agile.indiashelter.in",
                "hideSecuredBySignzyLogo": true,
                "hideTopLogo": true,
                //"enableVPNCheck": false,
                "isThankYouRequired": true,
                "logoAlignment": "left",
                "subTitleAlignment": "left",
                "titleAlignment": "left",
                "loader": {
                  "bgColor": "",
                  "txtColor": "",
                  "barColor": ""
                },
                "subTitleColor": "",
                "titleColor": "",
                "backgroundColor": "",
                "instructionColor": "",
                "progressBar": {
                  "backgroundColor": "",
                  "innerBackgroundColor": "",
                  "fillColor": ""
                },
                "instructions": {
 
                }
              }
            }
          }
 
          const headers = {
            'Content-Type': 'application/json',
             authorization: token,
          };
 
         /* const response = await faceLiveness(data, headers);
          if(response?.code==='ENOTFOUND'||response?.code==='ERR_BAD_REQUEST'){
     setShowIframe(false);
     alert('Please try again');     
    }else{
          setApiResponse(response.iframeSource);
          console.log('rtesponse for face',response);
          setTokenResponse(response.token);
          setShowIframe(true);
    }*/
    if (result !== undefined || result !== null) {
            const response = await faceLiveness(data, {
              headers: {
                authorization: token,
                'Content-Type': 'application/json',
              },
            });
            setFloading(false);
            if (response?.code === 'ENOTFOUND' || response?.code === 'ERR_BAD_REQUEST') {
              setShowIframe(false);
              alert('Please try again');
            } else {
              setApiResponse(response.iframeSource);
              console.log('rtesponse for face', response);
              setTokenResponse(response.token);
              navigate(`/lead/face-liveness/${values?.lead?.id}`, {
                state: { apiResponse1: response.iframeSource,token1: response.token,showIframe1:showIframe,bcp:bcpResult}
              });
              setShowIframe(true);
            }
          } else {
            alert('Please try again');
          }      
 
        } catch (error) {
          console.log(error);
        }
      } else {
       
      result = image2?.split('/').pop();
      /*if(image2===undefined){        
        console.log(customerUploads.data.document_fetch_url);
        result = customerUploads.data.document_fetch_url.split('/').pop();
      }else{
        result = image2.split('/').pop();
      }*/
      let image2Api="";  
      if(image2===undefined){
        if(values?.applicants?.[activeIndex]?.applicant_details.ekyc_data!=null && values?.applicants?.[activeIndex]?.applicant_details.is_ekyc_verified===true ){
          image2Api=values?.applicants?.[activeIndex]?.applicant_details.ekyc_data?.poi?.photo;
          const data = new FormData();
          data.append('faceData', image2Api);
          //data.append('ttl', '30 mins');
          data.append('ttl', '3 days');
          data.append('mimetype','image/jpg');
 
          //if(data.essentials.matchImage[0] !== undefined){
           const res = await faceLivenesBase64(data, {
              headers: {
                authorization: token,
                'Content-Type': 'application/json',
              },
            });
           
           result = res?.file?.directURL;
        }else{
          console.log(customerUploads.data.document_fetch_url);
          result = customerUploads.data.document_fetch_url.split('/').pop();
         
        }
      }else{
        result = image2.split('/').pop();
        result = await base64ConersionApi(result,{
          headers: {
            authorization: token,
            'Content-Type': 'application/json'
          },
        });
      }
     
        if ( result!== undefined && result!="") {
        try {
            const data = {
              "task": "gestureUrl",
              "essentials": {
                "matchImage": [
                  result
                ],
                "validGestures": ["blink"],//, "Right"],
                "gestureSequenceLength":"1",// "2",
                "languageCode": "en",
                "callbackUrl": "https://itrustuatcloud.indiashelter.in/static-page",
                "redirectUrl": "https://itrustuatcloud.indiashelter.in/static-page",
                "enableLocationCapture": "false",
                "customizations": {
                  "hideInstructionsHeader": false,
                  "hideVideoVerificationHeader": true,
                  "hideInstructions": false,
                  //"otpRequired": false,
                  //"--main-bg-color": "",
                  "--button-bg-color": "",
                  "--main-heading": "",
                  "logoUrl": "https://agile.indiashelter.in",
                  "hideSecuredBySignzyLogo": true,
                  "hideTopLogo": true,
                  //"enableVPNCheck": false,
                  "isThankYouRequired": true,
                  "logoAlignment": "left",
                  "subTitleAlignment": "left",
                  "titleAlignment": "left",
                  "loader": {
                    "bgColor": "",
                    "txtColor": "",
                    "barColor": ""
                  },
                  "subTitleColor": "",
                  "titleColor": "",
                  "backgroundColor": "",
                  "instructionColor": "",
                  "progressBar": {
                    "backgroundColor": "",
                    "innerBackgroundColor": "",
                    "fillColor": ""
                  },
                  "instructions": {
 
                  }
                }
              }
            }
 
            const headers = {
              'Content-Type': 'application/json',
              authorization: token,
            };
 
     
            const response = await faceLiveness(data, {
              headers: {
                authorization: token,
                'Content-Type': 'application/json',
              },
            });
            setFloading(false);
            if(response?.code === 'ENOTFOUND' || response?.code=== 'ERR_BAD_REQUEST'){
              setShowIframe(false);
              alert('Please try again')
            }else{

              setApiResponse(response.iframeSource);
              navigate(`/lead/face-liveness/${values?.lead?.id}`, {
                state: { apiResponse1: response.iframeSource,token1: response.token,showIframe1:showIframe,bcp:bcpResult}
              });
              setTokenResponse(response.token);
              setShowIframe(true);
   
            }
   
 
          } catch (error) {
            console.log(error);
            setFloading(false);

          setErrorToastMessage('Initialization Failed, Please Retry')
          

          }
        }
 
      }
    } else if (bcpResult === 1) {

      if (idProofPhotos.length === 0) {
        alert('Please upload the ID proof to continue');
      }


      let image2 = idProofPhotos[0]?.document_fetch_url;

     

      // const blobResponse = await axios.get(image2, {   // starrt
      //   responseType: "blob", // Ensure Axios treats the response as a Blob
      //   headers: {
      //     Authorization: token, // Pass the token as a header
      //   },
      // });
   
      // // Convert Blob to Base64
      // // const reader = new FileReader();
      // // reader.onloadend = () => {
      // //   const base64String = reader.result.split(",")[1]; // Extract Base64 part
      // //   console.log("Base64 String:", base64String);
      // //   image2 = base64String; // Assign the Base64 string to `image2`
      // // };
   
      // // reader.readAsDataURL(blobResponse.data); // Read the blob as a data URL

      // const convertBlobToBase64 = (blob) => {
      //   return new Promise((resolve, reject) => {
      //     const reader = new FileReader();
      //     reader.onloadend = () => {
      //       const base64String = reader.result.split(",")[1]; // Extract Base64 part
      //       resolve(base64String); // Resolve with the Base64 string
      //     };
      //     reader.onerror = reject; // Reject if an error occurs
      //     reader.readAsDataURL(blob);
      //   });
      // };

      // image2 = await convertBlobToBase64(blobResponse.data);


      // console.log("IMAGE 2",image2)    // end

      const compressImage = (blob, maxWidth, maxHeight) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          const objectURL = URL.createObjectURL(blob);
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            let width = img.width;
            let height = img.height;
     
            // Calculate the new dimensions to maintain aspect ratio
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width = width * ratio;
              height = height * ratio;
            }
     
            canvas.width = width;
            canvas.height = height;
     
            // Draw the image on the canvas
            ctx.drawImage(img, 0, 0, width, height);
     
            // Convert the canvas to a base64 string (jpeg format, quality 0.8)
            const base64String = canvas.toDataURL('image/jpeg', 0.8);
            resolve(base64String.split(',')[1]); // Resolve with the base64 string without the data URI prefix
          };
          img.onerror = reject;
          img.src = objectURL;
        });
      };
     
      const fetchAndCompressImage = async (imageUrl, token, maxWidth = 800, maxHeight = 800) => {
        try {
          const blobResponse = await axios.get(imageUrl, {
            responseType: 'blob',
            headers: {
              Authorization: token, // Pass the token as a header
            },
          });
     
          // Compress and convert the image blob to base64
          const base64Image = await compressImage(blobResponse.data, maxWidth, maxHeight);
     
          console.log("Compressed Base64 Image:", base64Image);
     
          return base64Image; // You can send this base64Image in your request
        } catch (error) {
          console.error("Error fetching or compressing the image:", error);
        }
      };


      if(image2===undefined){
        if(values?.applicants?.[activeIndex]?.applicant_details.ekyc_data!=null && values?.applicants?.[activeIndex]?.applicant_details.is_ekyc_verified===true ){
          image2=values?.applicants?.[activeIndex]?.applicant_details.ekyc_data?.poi?.photo;
        }
      }

      else {
        image2 = await fetchAndCompressImage(image2,token);        
      }

      console.log("UPDATED IMAGE",image2)

      if(!image2){
        alert('ID Proof Image Not found')
      }

      try {
        const transactionId = uniqueId.slice(0,8)//Math.floor(Math.random() * 100);
        // const body = {
        //   "workflowId": "workflow_india_shelter",//"workflow_LpgEOPe",
        //   "transactionId": `${transactionId}`,
        //   "redirectUrl": 'https://itrustuatcloud.indiashelter.in/static-page',//`http://localhost:5173/lead/face-liveness/${values?.lead?.id}`, // need to change before deployment
        //   "inputs": {
        //       "image": image2
        //   }
        // }

        // const response = await faceLivenesHyperverge(body, {
        //   headers: {
        //     authorization: token,
        //     'Content-Type': 'application/json',
        //   },
        // });
        setFloading(false);
        // if (response?.code === 'ENOTFOUND' || response?.code === 'ERR_BAD_REQUEST') {
        //   setShowIframe(false);
        //   alert('Please try again');
        // } else


        // attach script hyperverge

        await loadHyperVergeSDK(); // Load SDK before navigation

          const hypervergeLogin = await HypervergeLogin({transactionId:transactionId,applicant_id:values?.applicants?.[activeIndex]?.applicant_details?.id},{     // CALLING HYPERVERGE LOGIN
            headers: {
              authorization: token,
              'Content-Type': 'application/json',
            },
          });
          navigate(`/lead/face-liveness/${values?.lead?.id}`, {
            state: {
              // apiResponse1: response.iframeSource,
              // token1: response.token,
              // showIframe1: showIframe,
              transactionId:transactionId, // use unique id with a length of 8 for uniqueness and avoid collision
              bcp:bcpResult,
              token1: hypervergeLogin.token,
              image:image2
            },
          });
          // setTokenResponse(response.token);
          // setShowIframe(true);
       
      } catch (error) {
        console.log('?? ~ handleClick ~ error:', error);
        setFloading(false);
      }
    }
  };

  // Handle face livliness feature created by Pankaj Yadav on feb 6, 2024
  const handleClickold = async () => {

    if (floading) return; // Prevent multiple clicks if already loading or faceData exists

    setFloading(true); // Set loading state to true
    const image2 = idProofPhotos[0]?.document_fetch_url;

    if (idProofPhotos.length === 0) {
      alert('Please upload the ID proof to continue')
    }

    if (idProofPhotosFile !== null) {
      const data = new FormData();
      data.append('file', idProofPhotosFile);
      //data.append('ttl', '30 mins');
      data.append('ttl', '3 days');

      //if(data.essentials.matchImage[0] !== undefined){
        const res = await uploadDocFace(data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
        });
        var result = res?.file?.directURL;
      //}

   
      try {
        const data = {
          "task": "gestureUrl",
          "essentials": {
            "matchImage": [
              result
            ],
            "validGestures": ["blink"],//, "Right"],
            "gestureSequenceLength": "1" ,//"2",
            "languageCode": "en",
            "callbackUrl": "https://itrustuatcloud.indiashelter.in/static-page",
            "redirectUrl": "https://itrustuatcloud.indiashelter.in/static-page",
            "enableLocationCapture": "false",
            "customizations": {
              "hideInstructionsHeader": false,
              "hideVideoVerificationHeader": true,
              "hideInstructions": false,
              //"otpRequired": false,
              //"--main-bg-color": "",
              "--button-bg-color": "",
              "--main-heading": "",
              "logoUrl": "https://agile.indiashelter.in",
              "hideSecuredBySignzyLogo": true,
              "hideTopLogo": true,
              //"enableVPNCheck": false,
              "isThankYouRequired": true,
              "logoAlignment": "left",
              "subTitleAlignment": "left",
              "titleAlignment": "left",
              "loader": {
                "bgColor": "",
                "txtColor": "",
                "barColor": ""
              },
              "subTitleColor": "",
              "titleColor": "",
              "backgroundColor": "",
              "instructionColor": "",
              "progressBar": {
                "backgroundColor": "",
                "innerBackgroundColor": "",
                "fillColor": ""
              },
              "instructions": {

              }
            }
          }
        }

        const headers = {
          'Content-Type': 'application/json',
           authorization: token,
        };

       /* const response = await faceLiveness(data, headers);
        if(response?.code==='ENOTFOUND'||response?.code==='ERR_BAD_REQUEST'){
       setShowIframe(false);
       alert('Please try again');   
      }else{
        setApiResponse(response.iframeSource);
        console.log('rtesponse for face',response);
        setTokenResponse(response.token);
        setShowIframe(true);
      }*/
      if (result !== undefined || result !== null) {
          const response = await faceLiveness(data, {
            headers: {
              authorization: token,
              'Content-Type': 'application/json',
            },
          });
          setFloading(false);
          if (response?.code === 'ENOTFOUND' || response?.code === 'ERR_BAD_REQUEST') {
            setShowIframe(false);
            alert('Please try again');
          } else {
            setApiResponse(response.iframeSource);
            console.log('rtesponse for face', response);
            setTokenResponse(response.token);
            navigate(`/lead/face-liveness/${values?.lead?.id}`, {
              state: { apiResponse1: response.iframeSource,token1: response.token,showIframe1:showIframe,bcp:bcpResult}
            });
            setShowIframe(true);
          }
        } else {
          alert('Please try again');
        }      

      } catch (error) {
        console.log(error);
      }
    } else {
     
        result = image2.split('/').pop();
      const image2Api = await base64ConersionApi(result,{
        headers: {
          authorization: token,
          'Content-Type': 'application/json'
        },
      });
      if ( image2Api!== undefined && image2Api!="") {
          try {
          const data = {
            "task": "gestureUrl",
            "essentials": {
              "matchImage": [
                image2Api
              ],
              "validGestures": ["blink"],//, "Right"],
              "gestureSequenceLength":"1",// "2",
              "languageCode": "en",
              "callbackUrl": "https://itrustuatcloud.indiashelter.in/static-page",
              "redirectUrl": "https://itrustuatcloud.indiashelter.in/static-page",
              "enableLocationCapture": "false",
              "customizations": {
                "hideInstructionsHeader": false,
                "hideVideoVerificationHeader": true,
                "hideInstructions": false,
                //"otpRequired": false,
                //"--main-bg-color": "",
                "--button-bg-color": "",
                "--main-heading": "",
                "logoUrl": "https://agile.indiashelter.in",
                "hideSecuredBySignzyLogo": true,
                "hideTopLogo": true,
                //"enableVPNCheck": false,
                "isThankYouRequired": true,
                "logoAlignment": "left",
                "subTitleAlignment": "left",
                "titleAlignment": "left",
                "loader": {
                  "bgColor": "",
                  "txtColor": "",
                  "barColor": ""
                },
                "subTitleColor": "",
                "titleColor": "",
                "backgroundColor": "",
                "instructionColor": "",
                "progressBar": {
                  "backgroundColor": "",
                  "innerBackgroundColor": "",
                  "fillColor": ""
                },
                "instructions": {

                }
              }
            }
          }

          const headers = {
            'Content-Type': 'application/json',
            authorization: token,
          };

            
          const response = await faceLiveness(data, {
            headers: {
              authorization: token,
              'Content-Type': 'application/json',
            },
          });
          setFloading(false);
          if(response?.code === 'ENOTFOUND' || response?.code=== 'ERR_BAD_REQUEST'){
            setShowIframe(false);
            alert('Please try again')
          }else{
            setApiResponse(response.iframeSource);
            navigate(`/lead/face-liveness/${values?.lead?.id}`, {
              state: { apiResponse1: response.iframeSource,token1: response.token,showIframe1:showIframe,bcp:bcpResult}
            });
            setTokenResponse(response.token);
            setShowIframe(true);
 
          }
      

        } catch (error) {
          console.log(error);
        }
      }

    }
  };

  const handleCallback = (childData) => {
    setData(childData);
  };

  const handleParentCallBack1 = (data) => {
    console.log('DATA_________', data)
  }

  // add or edit field
  const updateFieldsApplicant = async (name, value) => {

    let newData = {};
    newData[name] = value;

    if (values?.applicants?.[activeIndex]?.applicant_details?.id) {
      const res = await editFieldsById(
        values?.applicants?.[activeIndex]?.applicant_details?.id,
        'applicant',
        newData,
        {
          headers: {
            authorization: token,
          },
        },
      );
      return res;
    } else {
      await addApi('applicant', values?.applicants?.[activeIndex]?.applicant_details, {
        headers: {
          authorization: token,
        },
      })
        .then((res) => {
          setFieldValue(`applicants[${activeIndex}].applicant_details.id`, res.id);
          // return res;
        })
        .catch((err) => {
          console.log(err);
          // return err;
        });
    }
  };
  // useEffect(() => {
  //   // Do something with the updated `faceData` value
  //   console.log('faceData has changed:', faceData);
  //   // You can add any other logic here based on the new `faceData` value
  // }, [faceData]);
  const handleDelete = (value) => {
    // Do something with the boolean value (e.g., update state)
    //setIsDeleted(value);
   // debugger;
    console.log('qwertyuiop.....',value)
    setFaceData(value)
  };

  const handleData2 = useCallback(async (data2) => {
    console.log('data2 from child=========', data2);

    if (data2 === 'yes') {
      setFieldValue(
        `applicants[${activeIndex}].applicant_details.faceLivliness_status`,
        data2,
      );

      updateFieldsApplicant('faceLivliness_status', data2)

      setShowIframe(false);
    } else {

      setFieldValue(
        `applicants[${activeIndex}].applicant_details.faceLivliness_status`,
        'no',
      );

      updateFieldsApplicant('faceLivliness_status', 'no')
      setShowIframe(false);
    }

  }, [])

  const handleData3 = (data3) => {

  }

  console.log('applicants[${activeIndex}].applicant_details.faceLivliness_status', values)

  const handleFaceCallBack = (disableData) => {
    setFaceData(disableData);
    console.log(faceData)
  }


  useEffect(() => {
   
    document.addEventListener('DOMContentLoaded', handleClick);

  }, [handleClick])
  return (
    <>
      {!values ? ( // CHANGED
        <div className='h-screen w-screen flex justify-center items-center'>
          <img src={loading} alt='loading' className='animate-spin duration-300 ease-out h-12' />
        </div>
      ) : null}

      {!pageLoader && (
        <>
          <Popup
            handleClose={handleCloseQualifierNotActivePopup}
            open={openQualifierNotActivePopup}
            setOpen={setOpenQualifierNotActivePopup}
            title='Step is lock.'
            description='Complete Qualifier to Unlock.'
          />

          <div className='overflow-hidden flex flex-col h-[100vh] justify-between'>
            {values?.applicants[activeIndex]?.applicant_details?.is_primary ? (
              <Topbar title='Lead Creation' id={values?.lead?.id} showClose={true} />
            ) : (
              <Topbar
                title='Adding Co-applicant'
                id={values?.lead?.id}
                showClose={true}
                showBack={true}
                coApplicant={true}
                coApplicantName={values?.applicants[activeIndex]?.applicant_details?.first_name}
              />
            )}

            <ToastMessage message={toastMessage} setMessage={setToastMessage} />

            <ErrorTost message={errorToastMessage} setMessage={setErrorToastMessage} />

            {console.log(pageLoader)}

            <div className='flex flex-col bg-medium-grey gap-9 overflow-auto max-[480px]:no-scrollbar p-[20px] pb-[200px] flex-1'>
              <ErrorBoundary>
                <PhotoUpload
                  files={customerPhotos}
                  setFile={setCustomerPhotos}
                  setSingleFile={setCustomerPhotosFile}
                  uploads={customerUploads}
                  setUploads={setCustomerUploads}
                  setLatLong={setCustomerLatLong}
                  label='Customer photo'
                  required
                  errorMessage={
                    preview === location.pathname &&
                    values?.applicants?.[activeIndex]?.applicant_details?.extra_params
                      ?.upload_required_fields_status?.customer_photo == false
                      ? 'This field is mandatory'
                      : ''
                  }
                  message={customerError}
                  setMessage={setCustomerError}
                  loader={customerLoader}
                  setLoader={setCustomerLoader}
                  disabled={approved}
                />
              </ErrorBoundary>

              <DropDown
                label='Relation With Main Applicant'
                name={`applicants[${activeIndex}].personal_details.relation_with_main_applicant`}
                required
                options={
                  values?.applicants?.[activeIndex]?.applicant_details?.is_primary
                    ? [...relationOptions, { label: 'Self', value: 'Self' }]
                    : relationOptions
                }
                placeholder='Eg: Uncle'
                onChange={async (e) => {
                  const value = e;

                  try {
                    const editedValue = await editFieldsById(
                      values?.applicants[activeIndex]?.personal_details?.id,
                      'personal',
                      { relation_with_main_applicant: value },
                      { headers: { Authorization: token } },
                    );

                    // check if application form is already created for the applicant : -

                    const app_form =
                      values?.applicants?.[activeIndex]?.applicant_details
                        ?.application_form_otp_verified;

                    if (app_form) {
                      const edit_res = await editFieldsById(
                        values?.applicants[activeIndex]?.applicant_details?.id,
                        'applicant',
                        { application_form_otp_verified: false },
                        { headers: { Authorization: token } },
                      );

                      const applicant_copy = structuredClone(values.applicants);

                      applicant_copy[activeIndex].applicant_details.application_form_otp_verified =
                        false;
                      applicant_copy[activeIndex].personal_details.relation_with_main_applicant =
                        value;

                      setFieldValue(`applicants`, applicant_copy);

                      setRequiredFieldsStatus((prev) => {
                        return { ...prev, relation_with_main_applicant: true };
                      });

                      return;
                    }

                    setFieldValue(
                      `applicants[${activeIndex}].personal_details.relation_with_main_applicant`,
                      value,
                    );

                    setRequiredFieldsStatus((prev) => {
                      return { ...prev, relation_with_main_applicant: true };
                    });
                  } catch (err) {
                    console.log('ERROR UPDATING RELATION', err);
                  }
                }}
                defaultSelected={
                  values?.applicants?.[activeIndex]?.personal_details?.relation_with_main_applicant
                }
                error={
                  errors?.applicants?.[activeIndex]?.personal_details?.relation_with_main_applicant
                }
                touched={
                  touched?.applicants &&
                  touched.applicants?.[activeIndex]?.personal_details?.relation_with_main_applicant
                }
                onBlur={(e) => {
                  handleBlur(e);
                }}
                disabled={values?.applicants?.[activeIndex]?.applicant_details?.is_primary}
              />

              <div className='flex flex-col gap-5'>
                <DropDown
                  label='Select ID type'
                  name={`applicants[${activeIndex}].personal_details.id_type`}
                  required
                  options={manualModeDropdownOptions[0].options}
                  placeholder='Choose ID type'
                  onChange={changeIdType}
                  defaultSelected={values?.applicants?.[activeIndex]?.personal_details?.id_type}
                  touched={
                    touched?.applicants &&
                    touched.applicants?.[activeIndex]?.personal_details?.id_type
                  }
                  disabled={!!isQaulifierActivated}
                  disableOption={
                    values?.applicants[activeIndex]?.personal_details?.selected_address_proof
                  }
                  onBlur={(e) => {
                    handleBlur(e);
                  }}
                />

                {values?.applicants[activeIndex]?.applicant_details?.is_ekyc_verified &&
                values?.applicants[activeIndex]?.applicant_details?.extra_params
                  .is_ekyc_performed_id ? (
                  <PdfAndImageUpload
                    files={idProofPhotos}
                    setFile={setIdProofPhotos}
                    uploads={idProofUploads}
                    setUploads={setIdProofUploads}
                    setEdit={setEditIdProof}
                    pdf={idProofPdf}
                    setPdf={setPropertyPdf}
                    label='ID proof'
                    required
                    setSingleFile={setIdProofPhotosFile}
                    setLatLong={setIdProofLatLong}
                    imageArrayBorder={true}
                    errorMessage={
                      preview === location.pathname &&
                      values?.applicants?.[activeIndex]?.applicant_details?.extra_params
                        ?.upload_required_fields_status?.id_proof == false
                        ? 'This field is mandatory'
                        : ''
                    }
                    message={idProofError}
                    setMessage={setIdProofError}
                    loader={idProofLoader}
                    setLoader={setIdProofLoader}
                    hideDeletePdf={true}
                    viewPdf={true}
                  />
                ) : (
                  <div>
                    <label className='flex gap-0.5 items-center text-primary-black font-medium'>
                      ID proof
                      <span className='text-primary-red text-sm'>*</span>
                    </label>
                    <span
                      className='mb-1.5 text-light-grey text-xs font-normal'
                      dangerouslySetInnerHTML={{
                        __html: 'File size should be less than 5MB',
                      }}
                    />

                    {isQaulifierActivated ? (
                      <div
                        className={`bg-white mt-1 border-x border-y rounded-lg px-2 pb-2 ${
                          preview === location.pathname &&
                          values?.applicants?.[activeIndex]?.applicant_details?.extra_params
                            ?.upload_required_fields_status?.id_proof == false
                            ? 'border-primary-red border-2'
                            : 'border-stroke  border-1'
                        }`}
                      >
                        <ImageUpload
                          files={idProofPhotos}
                          setFile={setIdProofPhotos}
                          setSingleFile={setIdProofPhotosFile}
                          uploads={idProofUploads}
                          setUploads={setIdProofUploads}
                          noBorder={true}
                          setEdit={setEditIdProof}
                          setLatLong={setIdProofLatLong}
                          error={
                            preview === location.pathname &&
                            values?.applicants?.[activeIndex]?.applicant_details?.extra_params
                              ?.upload_required_fields_status?.id_proof == false
                              ? 'This field is mandatory'
                              : ''
                          }
                          message={idProofError}
                          setMessage={setIdProofError}
                          loader={idProofLoader}
                          setLoader={setIdProofLoader}
                          lock={
                            values?.applicants[activeIndex]?.applicant_details?.id_type_ocr_status
                          }
                          disabled={approved}
                        />

                        <div
                          className={`flex gap-2 justify-between border-x border-y ${
                            editIdNumber ? '' : 'border-stroke'
                          }  p-2 rounded`}
                        >
                          <div className='flex gap-2 w-full'>
                            <p className='text-dark-grey text-xs font-normal self-center'>
                              {values?.applicants?.[activeIndex]?.personal_details?.id_type}:
                            </p>
                            <UploadDocsInput
                              name={`applicants[${activeIndex}].personal_details.id_number`}
                              value={values?.applicants?.[activeIndex]?.personal_details?.id_number}
                              onChange={(e) => {
                                e.target.value = e.target.value.toUpperCase();
                                handleTextInputChange(e);
                              }}
                              error={errors.applicants?.[activeIndex]?.personal_details?.id_number}
                              touched={
                                touched?.applicants &&
                                touched?.applicants?.[activeIndex]?.personal_details?.id_number
                              }
                              ref={idRef}
                              disabled={editIdNumber ? false : true}
                              onBlur={(e) => {
                                handleBlur(e);

                                if (
                                  !errors.applicants?.[activeIndex]?.personal_details?.id_number
                                ) {
                                  if (
                                    values?.applicants?.[activeIndex]?.personal_details
                                      ?.extra_params?.same_as_id_type
                                  ) {
                                    editFieldsById(
                                      values?.applicants?.[activeIndex]?.personal_details?.id,
                                      'personal',
                                      {
                                        id_number: e.target.value,
                                        address_proof_number: e.target.value,
                                      },
                                      {
                                        headers: {
                                          Authorization: token,
                                        },
                                      },
                                    );
                                    setFieldValue(
                                      `applicants[${activeIndex}].personal_details.address_proof_number`,
                                      e.target.value,
                                    );
                                    setFieldValue(
                                      `applicants[${activeIndex}].personal_details.id_number`,
                                      e.target.value,
                                    );
                                  } else {
                                    editFieldsById(
                                      values?.applicants?.[activeIndex]?.personal_details?.id,
                                      'personal',
                                      {
                                        id_number: e.target.value,
                                      },
                                      {
                                        headers: {
                                          Authorization: token,
                                        },
                                      },
                                    );
                                    setFieldValue(
                                      `applicants[${activeIndex}].personal_details.id_number`,
                                      e.target.value,
                                    );
                                  }
                                  if (
                                    values?.applicants?.[activeIndex]?.personal_details?.id_type ===
                                    'PAN'
                                  ) {
                                    editFieldsById(
                                      values?.applicants?.[activeIndex]?.work_income_detail?.id,
                                      'work-income',
                                      {
                                        pan_number: e.target.value,
                                      },
                                      {
                                        headers: {
                                          Authorization: token,
                                        },
                                      },
                                    );
                                  }
                                }
                              }}
                              inputClasses='text-xs capitalize h-3'
                              onKeyDown={(e) => {
                                if (
                                  values?.applicants?.[activeIndex]?.personal_details?.id_type ===
                                    'AADHAR' &&
                                  (e.key === 'ArrowUp' ||
                                    e.key === 'ArrowDown' ||
                                    e.key === 'ArrowLeft' ||
                                    e.key === 'ArrowRight' ||
                                    e.key === ' ' ||
                                    e.keyCode === 32 ||
                                    (e.keyCode >= 65 && e.keyCode <= 90))
                                ) {
                                  e.preventDefault();
                                }
                              }}
                            />
                          </div>
                          {idStatus !== 'Valid Match' &&
                            (!editIdNumber ? (
                              <p className='flex gap-1 items-center'>
                                <svg
                                  width='16'
                                  height='16'
                                  viewBox='0 0 16 16'
                                  fill='none'
                                  xmlns='http://www.w3.org/2000/svg'
                                >
                                  <path
                                    d='M2.66797 13.3334H13.3346M9.05873 4.03665C9.05873 4.03665 9.05873 5.00532 10.0274 5.97399C10.9961 6.94265 11.9647 6.94265 11.9647 6.94265M5.22775 11.5486L7.26195 11.258C7.55537 11.2161 7.82729 11.0801 8.03688 10.8705L12.9334 5.97398C13.4684 5.439 13.4684 4.57163 12.9334 4.03665L11.9647 3.06798C11.4298 2.533 10.5624 2.533 10.0274 3.06798L5.13088 7.9645C4.92129 8.17409 4.78533 8.44601 4.74341 8.73944L4.45281 10.7736C4.38824 11.2257 4.7757 11.6131 5.22775 11.5486Z'
                                    stroke='#E33439'
                                    strokeLinecap='round'
                                  />
                                </svg>

                                <span
                                  className='text-primary-red text-xs font-normal'
                                  onClick={() => setEditIdNumber(!editIdNumber)}
                                >
                                  Edit
                                </span>
                              </p>
                            ) : (
                              !errors.applicants?.[activeIndex]?.personal_details?.id_number && (
                                <span
                                  className='text-primary-red text-xs font-normal flex items-center'
                                  onClick={() => setEditIdNumber(!editIdNumber)}
                                >
                                  Save
                                </span>
                              )
                            ))}
                        </div>

                        <div className='flex justify-between mt-1'>
                          <div className='flex items-center gap-1'>
                            {idStatus === 'Valid Match' ? (
                              <>
                                <svg
                                  width='18'
                                  height='18'
                                  viewBox='0 0 18 18'
                                  fill='none'
                                  xmlns='http://www.w3.org/2000/svg'
                                >
                                  <path
                                    d='M15 4.5L6.75 12.75L3 9'
                                    stroke='#147257'
                                    strokeWidth='1.5'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                  />
                                </svg>
                                <span className='text-secondary-green leading-5 text-xs font-normal'>
                                  Verified
                                </span>
                              </>
                            ) : (
                              <>
                                <svg
                                  width='16'
                                  height='16'
                                  viewBox='0 0 16 16'
                                  fill='none'
                                  xmlns='http://www.w3.org/2000/svg'
                                >
                                  <g clipPath='url(#clip0_3732_51311)'>
                                    <path
                                      d='M8 5.28003V8.3867'
                                      stroke='#E33439'
                                      strokeWidth='1.5'
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                    />
                                    <path
                                      d='M8 10.72C8.27614 10.72 8.5 10.4961 8.5 10.22C8.5 9.94383 8.27614 9.71997 8 9.71997C7.72386 9.71997 7.5 9.94383 7.5 10.22C7.5 10.4961 7.72386 10.72 8 10.72Z'
                                      fill='#E33439'
                                    />
                                    <path
                                      d='M7.9987 14.1666C11.4045 14.1666 14.1654 11.4057 14.1654 7.99992C14.1654 4.59416 11.4045 1.83325 7.9987 1.83325C4.59294 1.83325 1.83203 4.59416 1.83203 7.99992C1.83203 11.4057 4.59294 14.1666 7.9987 14.1666Z'
                                      stroke='#E33439'
                                      strokeWidth='1.5'
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                    />
                                  </g>
                                  <defs>
                                    <clipPath id='clip0_3732_51311'>
                                      <rect width='16' height='16' fill='white' />
                                    </clipPath>
                                  </defs>
                                </svg>
                                <span className='text-primary-red leading-5 text-xs font-normal'>
                                  Not Verified
                                </span>
                              </>
                            )}
                          </div>

                          {idStatus !== 'Valid Match' && (
                            <p className='text-light-grey leading-5 text-xs font-normal'>
                              Photo mandatory
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <ImageUpload
                        files={idProofPhotos}
                        setFile={setIdProofPhotos}
                        setSingleFile={setIdProofPhotosFile}
                        uploads={idProofUploads}
                        setUploads={setIdProofUploads}
                        setEdit={setEditIdProof}
                        setLatLong={setIdProofLatLong}
                        errorMessage={
                          preview === location.pathname &&
                          values?.applicants?.[activeIndex]?.applicant_details?.extra_params
                            ?.upload_required_fields_status?.id_proof == false
                            ? 'This field is mandatory'
                            : ''
                        }
                        imageArrayBorder={true}
                        message={idProofError}
                        setMessage={setIdProofError}
                        loader={idProofLoader}
                        setLoader={setIdProofLoader}
                        lock={
                          values?.applicants[activeIndex]?.applicant_details?.id_type_ocr_status
                        }
                      />
                    )}

                    {isQaulifierActivated && idStatus !== 'Valid Match' && (
                      <p className='text-xs leading-[18px] font-normal text-light-grey mt-1'>
                        To be verified during the eligibility step
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className='flex flex-col gap-5'>
                <DropDown
                  label='Select address proof'
                  name={`applicants[${activeIndex}].personal_details.selected_address_proof`}
                  required
                  options={manualModeDropdownOptions[1].options}
                  placeholder='Choose address proof'
                  onChange={changeSelectedAddressProof}
                  defaultSelected={
                    values?.applicants?.[activeIndex]?.personal_details?.selected_address_proof
                  }
                  // error={errors.applicants?.[activeIndex]?.personal_details?.selected_address_proof}
                  touched={
                    touched?.applicants &&
                    touched.applicants?.[activeIndex]?.personal_details?.selected_address_proof
                  }
                  disabled={!!isQaulifierActivated}
                  disableOption={values?.applicants?.[activeIndex]?.personal_details?.id_type}
                  onBlur={(e) => {
                    handleBlur(e);
                  }}
                />

                {values?.applicants[activeIndex]?.applicant_details?.is_ekyc_verified &&
                (values?.applicants[activeIndex]?.applicant_details?.extra_params
                  .is_ekyc_performed_address ||
                  values?.applicants[activeIndex]?.applicant_details?.extra_params
                    .is_ekyc_performed_id) ? (
                  <PdfAndImageUpload
                    files={addressProofPhotos}
                    setFile={setAddressProofPhotos}
                    uploads={addressProofUploads}
                    setUploads={setAddressProofUploads}
                    setEdit={setEditAddressProof}
                    pdf={addressProofPdf}
                    setPdf={setAddressProofPdf}
                    label='Address proof'
                    required
                    setSingleFile={setAddressProofPhotosFile}
                    setLatLong={setAddressProofLatLong}
                    imageArrayBorder={true}
                    errorMessage={
                      preview === location.pathname &&
                      values?.applicants?.[activeIndex]?.applicant_details?.extra_params
                        ?.upload_required_fields_status?.id_proof == false
                        ? 'This field is mandatory'
                        : ''
                    }
                    message={addressProofError}
                    setMessage={setAddressProofError}
                    loader={addressProofLoader}
                    setLoader={setAddressProofLoader}
                    hideDeletePdf={true}
                    viewPdf={true}
                    lock={
                      values?.applicants[activeIndex]?.applicant_details
                        ?.selected_address_ocr_status
                    }
                    disabled={approved}
                  />
                ) : (
                  <div>
                    <label className='flex gap-0.5 items-center text-primary-black font-medium'>
                      Address proof
                      <span className='text-primary-red text-sm'>*</span>
                    </label>
                    <span
                      className='mb-1.5 text-light-grey text-xs font-normal'
                      dangerouslySetInnerHTML={{
                        __html: 'File size should be less than 5MB',
                      }}
                    />

                    {isQaulifierActivated ? (
                      <div
                        className={`bg-white mt-1 border-x border-y rounded-lg px-2 pb-2 ${
                          preview === location.pathname &&
                          values?.applicants?.[activeIndex]?.applicant_details?.extra_params
                            ?.upload_required_fields_status?.address_proof == false
                            ? 'border-primary-red border-2'
                            : 'border-stroke border-1'
                        }`}
                      >
                        <ImageUpload
                          files={addressProofPhotos}
                          setFile={setAddressProofPhotos}
                          setSingleFile={setAddressProofPhotosFile}
                          setEdit={setEditAddressProof}
                          uploads={addressProofUploads}
                          setUploads={setAddressProofUploads}
                          setLatLong={setAddressProofLatLong}
                          noBorder={true}
                          message={addressProofError}
                          setMessage={setAddressProofError}
                          loader={addressProofLoader}
                          setLoader={setAddressProofLoader}
                          lock={
                            values?.applicants[activeIndex]?.applicant_details
                              ?.selected_address_ocr_status
                          }
                          disabled={approved}
                        />

                        <div
                          className={`flex gap-2 justify-between border-x border-y ${
                            editAddressNumber ? '' : 'border-stroke'
                          }  p-2 rounded`}
                        >
                          <div className='flex gap-2 w-full'>
                            <p className='text-dark-grey text-xs font-normal self-center'>
                              {
                                values?.applicants?.[activeIndex]?.personal_details
                                  ?.selected_address_proof
                              }
                              :
                            </p>
                            <UploadDocsInput
                              name={`applicants[${activeIndex}].personal_details.address_proof_number`}
                              value={
                                values?.applicants?.[activeIndex]?.personal_details
                                  ?.address_proof_number
                              }
                              onChange={(e) => {
                                e.target.value = e.target.value.toUpperCase();
                                handleTextInputChange(e);
                              }}
                              error={
                                errors.applicants?.[activeIndex]?.personal_details
                                  ?.address_proof_number
                              }
                              touched={
                                touched?.applicants &&
                                touched?.applicants?.[activeIndex]?.personal_details
                                  ?.address_proof_number
                              }
                              ref={addressRef}
                              disabled={editAddressNumber ? false : true}
                              onBlur={(e) => {
                                handleBlur(e);

                                if (
                                  !errors.applicants?.[activeIndex]?.personal_details
                                    ?.address_proof_number
                                ) {
                                  if (
                                    values?.applicants?.[activeIndex]?.personal_details
                                      ?.extra_params?.same_as_id_type
                                  ) {
                                    editFieldsById(
                                      values?.applicants?.[activeIndex]?.personal_details?.id,
                                      'personal',
                                      {
                                        id_number: e.target.value,
                                        address_proof_number: e.target.value,
                                      },
                                      {
                                        headers: {
                                          Authorization: token,
                                        },
                                      },
                                    );
                                    setFieldValue(
                                      `applicants[${activeIndex}].personal_details.address_proof_number`,
                                      e.target.value,
                                    );
                                    setFieldValue(
                                      `applicants[${activeIndex}].personal_details.id_number`,
                                      e.target.value,
                                    );
                                  } else {
                                    editFieldsById(
                                      values?.applicants?.[activeIndex]?.personal_details?.id,
                                      'personal',
                                      {
                                        address_proof_number: e.target.value,
                                      },
                                      {
                                        headers: {
                                          Authorization: token,
                                        },
                                      },
                                    );
                                    setFieldValue(
                                      `applicants[${activeIndex}].personal_details.address_proof_number`,
                                      e.target.value,
                                    );
                                  }
                                }
                              }}
                              inputClasses='text-xs capitalize h-3'
                              onKeyDown={(e) => {
                                if (
                                  values?.applicants?.[activeIndex]?.personal_details
                                    ?.selected_address_proof === 'AADHAR' &&
                                  (e.key === 'ArrowUp' ||
                                    e.key === 'ArrowDown' ||
                                    e.key === 'ArrowLeft' ||
                                    e.key === 'ArrowRight' ||
                                    e.key === ' ' ||
                                    e.keyCode === 32 ||
                                    (e.keyCode >= 65 && e.keyCode <= 90))
                                ) {
                                  e.preventDefault();
                                }
                              }}
                            />
                          </div>

                          {addressStatus !== 'Valid Match' &&
                            (!editAddressNumber ? (
                              <p className='flex gap-1 items-center'>
                                <svg
                                  width='16'
                                  height='16'
                                  viewBox='0 0 16 16'
                                  fill='none'
                                  xmlns='http://www.w3.org/2000/svg'
                                >
                                  <path
                                    d='M2.66797 13.3334H13.3346M9.05873 4.03665C9.05873 4.03665 9.05873 5.00532 10.0274 5.97399C10.9961 6.94265 11.9647 6.94265 11.9647 6.94265M5.22775 11.5486L7.26195 11.258C7.55537 11.2161 7.82729 11.0801 8.03688 10.8705L12.9334 5.97398C13.4684 5.439 13.4684 4.57163 12.9334 4.03665L11.9647 3.06798C11.4298 2.533 10.5624 2.533 10.0274 3.06798L5.13088 7.9645C4.92129 8.17409 4.78533 8.44601 4.74341 8.73944L4.45281 10.7736C4.38824 11.2257 4.7757 11.6131 5.22775 11.5486Z'
                                    stroke='#E33439'
                                    strokeLinecap='round'
                                  />
                                </svg>

                                <span
                                  className='text-primary-red text-xs font-normal'
                                  onClick={() => setEditAddressNumber(!editAddressNumber)}
                                >
                                  Edit
                                </span>
                              </p>
                            ) : (
                              !errors.applicants?.[activeIndex]?.personal_details
                                ?.address_proof_number && (
                                <span
                                  className='text-primary-red text-xs font-normal flex items-center'
                                  onClick={() => setEditAddressNumber(!editAddressNumber)}
                                >
                                  Save
                                </span>
                              )
                            ))}
                        </div>

                        <div className='flex justify-between mt-1'>
                          <div className='flex items-center gap-1'>
                            {addressStatus === 'Valid Match' ? (
                              <>
                                <svg
                                  width='18'
                                  height='18'
                                  viewBox='0 0 18 18'
                                  fill='none'
                                  xmlns='http://www.w3.org/2000/svg'
                                >
                                  <path
                                    d='M15 4.5L6.75 12.75L3 9'
                                    stroke='#147257'
                                    strokeWidth='1.5'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                  />
                                </svg>
                                <span className='text-secondary-green leading-5 text-xs font-normal'>
                                  Verified
                                </span>
                              </>
                            ) : (
                              <>
                                <svg
                                  width='16'
                                  height='16'
                                  viewBox='0 0 16 16'
                                  fill='none'
                                  xmlns='http://www.w3.org/2000/svg'
                                >
                                  <g clipPath='url(#clip0_3732_51311)'>
                                    <path
                                      d='M8 5.28003V8.3867'
                                      stroke='#E33439'
                                      strokeWidth='1.5'
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                    />
                                    <path
                                      d='M8 10.72C8.27614 10.72 8.5 10.4961 8.5 10.22C8.5 9.94383 8.27614 9.71997 8 9.71997C7.72386 9.71997 7.5 9.94383 7.5 10.22C7.5 10.4961 7.72386 10.72 8 10.72Z'
                                      fill='#E33439'
                                    />
                                    <path
                                      d='M7.9987 14.1666C11.4045 14.1666 14.1654 11.4057 14.1654 7.99992C14.1654 4.59416 11.4045 1.83325 7.9987 1.83325C4.59294 1.83325 1.83203 4.59416 1.83203 7.99992C1.83203 11.4057 4.59294 14.1666 7.9987 14.1666Z'
                                      stroke='#E33439'
                                      strokeWidth='1.5'
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                    />
                                  </g>
                                  <defs>
                                    <clipPath id='clip0_3732_51311'>
                                      <rect width='16' height='16' fill='white' />
                                    </clipPath>
                                  </defs>
                                </svg>
                                <span className='text-primary-red leading-5 text-xs font-normal'>
                                  Not Verified
                                </span>
                              </>
                            )}
                          </div>

                          {addressStatus !== 'Valid Match' && (
                            <p className='text-light-grey leading-5 text-xs font-normal'>
                              Photo mandatory
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <ImageUpload
                        files={addressProofPhotos}
                        setFile={setAddressProofPhotos}
                        setSingleFile={setAddressProofPhotosFile}
                        setEdit={setEditAddressProof}
                        uploads={addressProofUploads}
                        setUploads={setAddressProofUploads}
                        setLatLong={setAddressProofLatLong}
                        errorMessage={
                          preview === location.pathname &&
                          values?.applicants?.[activeIndex]?.applicant_details?.extra_params
                            ?.upload_required_fields_status?.address_proof == false
                            ? 'This field is mandatory'
                            : ''
                        }
                        imageArrayBorder={true}
                        message={addressProofError}
                        setMessage={setAddressProofError}
                        loader={addressProofLoader}
                        setLoader={setAddressProofLoader}
                        lock={
                          values?.applicants[activeIndex]?.applicant_details
                            ?.selected_address_ocr_status
                        }
                      />
                    )}

                    {isQaulifierActivated && addressStatus !== 'Valid Match' && (
                      <p className='text-xs leading-[18px] font-normal text-light-grey mt-1'>
                        To be verified during the eligibility step
                      </p>
                    )}
                  </div>
                )}
              </div>

              {values?.property_details?.property_identification_is !== 'not-yet' &&
                !isCoApplicant && (
                  <ErrorBoundary>
                    <PdfAndImageUpload
                      files={propertyPapers}
                      setFile={setPropertyPapers}
                      uploads={propertyPaperUploads}
                      setUploads={setPropertyPaperUploads}
                      setEdit={setEditPropertyPaper}
                      pdf={propertyPdf}
                      setPdf={setPropertyPdf}
                      label='Property papers'
                      required
                      hint='File size should be less than 5MB'
                      setSingleFile={setPropertyPapersFile}
                      setLatLong={setPropertyPapersLatLong}
                      imageArrayBorder={true}
                      errorMessage={
                        preview === location.pathname &&
                        values?.applicants?.[activeIndex]?.applicant_details?.extra_params
                          ?.upload_required_fields_status?.property_paper == false
                          ? 'This field is mandatory'
                          : ''
                      }
                      message={propertyPaperError}
                      setMessage={setPropertyPaperError}
                      loader={propertyLoader}
                      setLoader={setPropertyLoader}
                      disabled={approved}
                      type={'property_paper_photos'}
                    />
                  </ErrorBoundary>
                )}

              {values?.applicants[activeIndex]?.work_income_detail?.profession === 'Salaried' && (
                <ErrorBoundary>
                  <PdfAndImageUpload
                    files={salarySlipPhotos}
                    setFile={setSalarySlipPhotos}
                    uploads={salarySlipUploads}
                    setUploads={setSalarySlipUploads}
                    setEdit={setEditSalarySlip}
                    label='Salary slip'
                    required
                    hint='File size should be less than 5MB'
                    setSingleFile={setSalarySlipPhotosFile}
                    setLatLong={setSalarySlipLatLong}
                    imageArrayBorder={true}
                    errorMessage={
                      preview === location.pathname &&
                      values?.applicants?.[activeIndex]?.applicant_details?.extra_params
                        ?.upload_required_fields_status?.salary_slip == false
                        ? 'This field is mandatory'
                        : ''
                    }
                    message={salarySlipError}
                    setMessage={setSalarySlipError}
                    loader={salarySlipLoader}
                    setLoader={setSalarySlipLoader}
                    disabled={approved}
                  />
                </ErrorBoundary>
              )}

              {values?.applicants[activeIndex]?.work_income_detail?.income_proof === 'Form 60' ? (
                <ErrorBoundary>
                  <ImageUpload
                    files={form60photos}
                    setFile={setForm60photos}
                    uploads={form60Uploads}
                    setUploads={setForm60Uploads}
                    setEdit={setEditForm60}
                    label='Form 60'
                    required
                    hint='File size should be less than 5MB'
                    setSingleFile={setForm60photosFile}
                    setLatLong={setForm60LatLong}
                    imageArrayBorder={true}
                    errorMessage={
                      preview === location.pathname &&
                      values?.applicants?.[activeIndex]?.applicant_details?.extra_params
                        ?.upload_required_fields_status?.form_60 == false
                        ? 'This field is mandatory'
                        : ''
                    }
                    message={form60Error}
                    setMessage={setForm60Error}
                    loader={form60Loader}
                    setLoader={setForm60Loader}
                    disabled={approved}
                  />
                </ErrorBoundary>
              ) : null}

              {/* {values?.property_details?.property_identification_is !== 'not-yet' &&
                !isCoApplicant && (
                  <ImageUpload
                    files={propertyPhotos}
                    setFile={setPropertyPhotos}
                    uploads={propertyUploads}
                    setUploads={setPropertyUploads}
                    setEdit={setEditProperty}
                    label='Property image'
                   
                    // hint='File size should be less than 5MB'
                 
                    setSingleFile={setPropertyPhotosFile}
                    latlong={propertyLatLong}
                    setLatLong={setPropertyLatLong}
                    imageArrayBorder={true}
                    errorMessage={
                      preview === location.pathname &&
                        values?.applicants?.[activeIndex]?.applicant_details?.extra_params
                          ?.upload_required_fields_status?.property_image == true
                        ? 'This field is mandatory'
                        : ''
                    }
                    message={propertyPhotoError}
                    setMessage={setPropertyPhotoError}
                    loader={propertyPhotoLoader}
                    setLoader={setPropertyPhotoLoader}
                  />
                )} */}

              {values?.applicants[activeIndex]?.work_income_detail?.profession === 'Salaried' ? (
                <div>
                  <TextInput
                    label='PF UAN'
                    placeholder='Eg: 100563503285'
                    type='number'
                    pattern='\d*'
                    name={`applicants[${activeIndex}].work_income_detail.pf_uan`}
                    value={values?.applicants?.[activeIndex]?.work_income_detail?.pf_uan}
                    error={errors?.applicants?.[activeIndex]?.work_income_detail?.pf_uan}
                    touched={touched?.applicants?.[activeIndex]?.work_income_detail?.pf_uan}
                    onBlur={(e) => {
                      handleBlur(e);
                      if (
                        !errors?.applicants?.[activeIndex]?.work_income_detail?.pf_uan &&
                        values?.applicants?.[activeIndex]?.work_income_detail?.pf_uan
                      ) {
                        editFieldsById(
                          values?.applicants?.[activeIndex]?.work_income_detail?.id,
                          'work-income',
                          {
                            pf_uan: values?.applicants?.[activeIndex]?.work_income_detail?.pf_uan,
                          },
                          {
                            headers: {
                              Authorization: token,
                            },
                          },
                        );
                      } else {
                        editFieldsById(
                          values?.applicants?.[activeIndex]?.work_income_detail?.id,
                          'work-income',
                          {
                            pf_uan: '',
                          },
                          {
                            headers: {
                              Authorization: token,
                            },
                          },
                        );
                      }
                    }}
                    onChange={(e) => {
                      let value = e.currentTarget.value;
                      if (value.length > 12) {
                        return;
                      }

                      if (value < 0) {
                        value = '';
                      }

                      const address_pattern = /^\d+$/;
                      if (!address_pattern.test(value) && value.length > 0) {
                        return;
                      }

                      setFieldValue(
                        e.currentTarget.name,
                        value.charAt(0).toUpperCase() + value.slice(1),
                      );
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace') {
                        setFieldValue(
                          `applicants[${activeIndex}].work_income_detail.pf_uan`,
                          values?.applicants?.[activeIndex]?.work_income_detail?.pf_uan.slice(0),
                        );
                      }
                      if (DISALLOW_CHAR.includes(e.key)) {
                        e.preventDefault();
                        return;
                      }
                    }}
                    disabled={uanStatus === 'Valid Match'} // ** status disable here
                  />

                  {isQaulifierActivated ? (
                    <div className='flex justify-between mt-1'>
                      <div className='flex items-center gap-1'>
                        {uanStatus === 'Valid Match' ? (
                          <>
                            <svg
                              width='18'
                              height='18'
                              viewBox='0 0 18 18'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                d='M15 4.5L6.75 12.75L3 9'
                                stroke='#147257'
                                strokeWidth='1.5'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                            <span className='text-secondary-green leading-5 text-xs font-normal'>
                              Verified
                            </span>
                          </>
                        ) : (
                          <>
                            <svg
                              width='16'
                              height='16'
                              viewBox='0 0 16 16'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <g clipPath='url(#clip0_3732_51311)'>
                                <path
                                  d='M8 5.28003V8.3867'
                                  stroke='#E33439'
                                  strokeWidth='1.5'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                />
                                <path
                                  d='M8 10.72C8.27614 10.72 8.5 10.4961 8.5 10.22C8.5 9.94383 8.27614 9.71997 8 9.71997C7.72386 9.71997 7.5 9.94383 7.5 10.22C7.5 10.4961 7.72386 10.72 8 10.72Z'
                                  fill='#E33439'
                                />
                                <path
                                  d='M7.9987 14.1666C11.4045 14.1666 14.1654 11.4057 14.1654 7.99992C14.1654 4.59416 11.4045 1.83325 7.9987 1.83325C4.59294 1.83325 1.83203 4.59416 1.83203 7.99992C1.83203 11.4057 4.59294 14.1666 7.9987 14.1666Z'
                                  stroke='#E33439'
                                  strokeWidth='1.5'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                />
                              </g>
                              <defs>
                                <clipPath id='clip0_3732_51311'>
                                  <rect width='16' height='16' fill='white' />
                                </clipPath>
                              </defs>
                            </svg>
                            <span className='text-primary-red leading-5 text-xs font-normal'>
                              Not Verified
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {values?.applicants[activeIndex]?.work_income_detail?.profession ===
              'Self Employed' ? (
                <div>
                  <TextInput
                    label='GST number'
                    placeholder='Eg: 06AAAPB2117A1ZI'
                    // className='uppercase'
                    name={`applicants[${activeIndex}].work_income_detail.gst_number`}
                    value={values?.applicants?.[activeIndex]?.work_income_detail?.gst_number}
                    error={errors?.applicants?.[activeIndex]?.work_income_detail?.gst_number}
                    touched={touched?.applicants?.[activeIndex]?.work_income_detail?.gst_number}
                    onBlur={(e) => {
                      handleBlur(e);

                      if (
                        !errors?.applicants?.[activeIndex]?.work_income_detail?.gst_number &&
                        values?.applicants?.[activeIndex]?.work_income_detail?.gst_number
                      ) {
                        editFieldsById(
                          values?.applicants?.[activeIndex]?.work_income_detail?.id,
                          'work-income',
                          {
                            gst_number:
                              values?.applicants?.[activeIndex]?.work_income_detail?.gst_number,
                          },
                          {
                            headers: {
                              Authorization: token,
                            },
                          },
                        );
                      } else {
                        editFieldsById(
                          values?.applicants?.[activeIndex]?.work_income_detail?.id,
                          'work-income',
                          {
                            gst_number: '',
                          },
                          {
                            headers: {
                              Authorization: token,
                            },
                          },
                        );
                      }
                    }}
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase();
                      const value = e.currentTarget.value;
                      const pattern = /^[a-zA-Z0-9]+$/;
                      if (!pattern.test(value) && value.length > 0) {
                        return;
                      }
                      if (pattern.exec(value[value.length - 1])) {
                        setFieldValue(
                          e.currentTarget.name,
                          value.charAt(0).toUpperCase() + value.slice(1),
                        );
                      }
                    }}
                    disabled={gstStatus === 'Valid Match'}
                  />
                  {isQaulifierActivated ? (
                    <div className='flex justify-between mt-1'>
                      <div className='flex items-center gap-1'>
                        {gstStatus === 'Valid Match' ? (
                          <>
                            <svg
                              width='18'
                              height='18'
                              viewBox='0 0 18 18'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                d='M15 4.5L6.75 12.75L3 9'
                                stroke='#147257'
                                strokeWidth='1.5'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                            <span className='text-secondary-green leading-5 text-xs font-normal'>
                              Verified
                            </span>
                          </>
                        ) : (
                          <>
                            <svg
                              width='16'
                              height='16'
                              viewBox='0 0 16 16'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <g clipPath='url(#clip0_3732_51311)'>
                                <path
                                  d='M8 5.28003V8.3867'
                                  stroke='#E33439'
                                  strokeWidth='1.5'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                />
                                <path
                                  d='M8 10.72C8.27614 10.72 8.5 10.4961 8.5 10.22C8.5 9.94383 8.27614 9.71997 8 9.71997C7.72386 9.71997 7.5 9.94383 7.5 10.22C7.5 10.4961 7.72386 10.72 8 10.72Z'
                                  fill='#E33439'
                                />
                                <path
                                  d='M7.9987 14.1666C11.4045 14.1666 14.1654 11.4057 14.1654 7.99992C14.1654 4.59416 11.4045 1.83325 7.9987 1.83325C4.59294 1.83325 1.83203 4.59416 1.83203 7.99992C1.83203 11.4057 4.59294 14.1666 7.9987 14.1666Z'
                                  stroke='#E33439'
                                  strokeWidth='1.5'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                />
                              </g>
                              <defs>
                                <clipPath id='clip0_3732_51311'>
                                  <rect width='16' height='16' fill='white' />
                                </clipPath>
                              </defs>
                            </svg>
                            <span className='text-primary-red leading-5 text-xs font-normal'>
                              Not Verified
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {!isCoApplicant ? (
                <ErrorBoundary>
                  <div>
                    <div className='flex justify-between gap-2'>
                      <div className={selfieUploads ? 'w-[65%]' : 'w-full'}>
                        <UploadSelfie
                          disabled={mobileVerified && selfie.length >= 1}
                          files={selfie}
                          setFile={setSelfie}
                          setSingleFile={setSelfieFile}
                          uploads={selfieUploads}
                          setUploads={setSelfieUploads}
                          setLatLong={setLoSelfieLatLong}
                          label='Upload selfie'
                          required
                          errorMessage={
                            preview === location.pathname &&
                            values?.applicants?.[activeIndex]?.applicant_details?.extra_params
                              ?.upload_required_fields_status?.upload_selfie == false
                              ? 'This field is mandatory'
                              : ''
                          }
                          message={selfieError}
                          setMessage={setSelfieError}
                          loader={selfieLoader}
                          setLoader={setSelfieLoader}
                        />
                      </div>

                      {selfieUploads && (
                        <button
                          className={`w-[35%] self-end font-normal h-[57px] py-3 px-2 rounded disabled:text-dark-grey disabled:bg-stroke ${
                            mobileVerified || hasSentOTPOnce || selfie.length === 0
                              ? 'text-dark-grey bg-stroke pointer-events-none'
                              : 'bg-primary-red text-white'
                          }`}
                          onClick={sendMobileOtp}
                          disabled={
                            !values?.applicants?.[activeIndex]?.applicant_details?.selfie_consent
                          }
                        >
                          Send OTP
                        </button>
                      )}
                    </div>

                    {mobileVerified && !showOTPInput && selfie.length >= 1 && (
                      <span className='flex text-primary-black text-xs leading-[18px] mt-2'>
                        OTP Verified
                        <img src={otpVerified} alt='Otp Verified' role='presentation' />
                      </span>
                    )}

                    {selfieUploads && !showOTPInput && (
                      <div className='w-[90%] mt-5'>
                        <input
                          type='checkbox'
                          checked={
                            values?.applicants?.[activeIndex]?.applicant_details?.selfie_consent
                          }
                          onChange={() => {
                            setFieldValue(
                              `applicants[${activeIndex}].applicant_details.selfie_consent`,
                              values?.applicants?.[activeIndex]?.applicant_details
                                ?.selfie_consent == null
                                ? true
                                : !values?.applicants?.[activeIndex]?.applicant_details
                                    ?.selfie_consent,
                            );
                          }}
                          className='w-5 h-5 cursor-pointer accent-black border-black'
                          disabled={mobileVerified}
                        />
                        <p className='text-xs text-gray-700 leading-relaxed'>
                          {' '}
                          By entering the OTP, I hereby confirm that, with respect to the Loan
                          Application ID iTrust:{values?.lead?.id}, the customer has carried out
                          Aadhaar OTP-based e-KYC in my presence in case such e-KYC was conducted.
                          Further, I confirm that, if such Aadhaar OTP-based e-KYC was not
                          conducted, I have compared the copy of valid KYC documents provided by the
                          customer with their originals and copies of such certified KYC documents
                          are attached herewith.
                        </p>
                      </div>
                    )}
                  </div>
                </ErrorBoundary>
              ) : null}

              {showOTPInput && selfie.length >= 1 && !isCoApplicant ? (
                <OtpInputNoEdit
                  label='Enter OTP'
                  required
                  verified={mobileVerified}
                  setOTPVerified={setMobileVerified}
                  onSendOTPClick={sendMobileOtp}
                  defaultResendTime={30}
                  disableSendOTP={!mobileVerified}
                  verifyOTPCB={verifyOTP}
                  hasSentOTPOnce={hasSentOTPOnce}
                  OTPonCall={true}
                  getOTPOnCall={handleOTPOnCall}
                />
              ) : null}

              <ErrorBoundary>
                <PdfAndImageUpload
                  files={docs}
                  setFile={setDocs}
                  uploads={docUploads}
                  setUploads={setDocUploads}
                  setEdit={setEditDoc}
                  pdf={propertyPdf}
                  label='Other documents'
                  hint='File size should be less than 5MB'
                  setSingleFile={setDocsFile}
                  setLatLong={setOtherDocsLatLong}
                  imageArrayBorder={true}
                  message={docError}
                  setMessage={setDocError}
                  loader={docLoader}
                  setLoader={setDocLoader}
                  disabled={approved}
                  type={'other_docs'}
                  config={{
                    type: 'other_docs',
                    openOtherDocDrawer,
                    setOpenOtherDocDrawer,
                    selectedOption,
                    setSelectedOption,
                    otherDocumentOptions: filteredDocuments,
                    handleSelect,
                    inputRef,
                    secondInputRef,
                  }}
                />
              </ErrorBoundary>
              {/* <!- Face livliness-> */}

              {/* <button type='button' disabled={faceData} className={`p-2 md:py-3 text-base md:text-lg rounded md:w-full flex justify-center items-center ${faceData ? 'bg-disabled-grey pointer-events-none cursor-not-allowed' : 'bg-white'}`} style={{ backgroundColor: faceData ? 'rgb(241 153 156)' : 'rgb(227, 52, 57)', color: 'white' }} onClick={handleClick}>
                Face Liveness
              </button> */}
              <button
                type='button'
                disabled={faceData}
                className={`p-2 md:py-3 text-base md:text-lg rounded md:w-full flex justify-center items-center ${faceData ? 'bg-disabled-grey pointer-events-none cursor-not-allowed' : 'bg-white'}`}
                style={{
                  backgroundColor: faceData ? 'rgb(241 153 156)' : 'rgb(227, 52, 57)',
                  color: 'white',
                }}
                onClick={handleClick}
              >
                {floading
                  ? 'Fetching.....' // Replace with your spinner or loading indicator
                  : 'Face Liveness' // Button text or content
                }
              </button>
              <p>{data}</p>
              <div className='iframe-container'>
                <IFrameComponent
                  src={apiResponse}
                  tokenResponse={tokenResponse}
                  showIframe={showIframe}
                  setShowIframe={setShowIframe}
                  parentCallback={handleCallback}
                  handleFaceCallBack={handleFaceCallBack}
                  parentCallback1={handleParentCallBack1}
                  sendData2={handleData2}
                  sendData3={handleData3}
                  token={token}
                />
              </div>
            </div>
            <PreviousNextButtons
              linkPrevious={
                values?.applicants?.[activeIndex]?.applicant_details?.is_primary
                  ? '/lead/reference-details'
                  : values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier
                    ? '/lead/banking-details'
                    : null
              }
              linkNext='/lead/preview'
              onPreviousClick={() => {
                if (values?.applicants?.[activeIndex]?.applicant_details?.is_primary) {
                  setCurrentStepIndex(8);
                } else {
                  setCurrentStepIndex(5);
                }
                !values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier
                  ? setOpenQualifierNotActivePopup(true)
                  : null;
              }}
              onNextClick={() => {
                setCurrentStepIndex(10);

                updateProgress();
              }}
            />
            <SwipeableDrawerComponent />
            <DocumentModal
              open={showpopup}
              handleClose={() => setShowpopup(false)}
              content={{
                line1: 'Are you sure? You are uploading the right document.',
                line2: (
                  <>
                    This document does not seem to be valid{' '}
                    <span className='text-primary-red'>{documentType || 'DOC_NAME'}</span>.
                  </>
                ),
              }}
            />
          </div>
        </>
      )}
    </>
  );
};

const UploadDocumentWrapper = () => {
  const { activeIndex } = useContext(LeadContext);

  return <UploadDocuments activeIndex={activeIndex} />;
};

export default UploadDocumentWrapper;
