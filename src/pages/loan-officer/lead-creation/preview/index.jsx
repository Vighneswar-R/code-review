import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { LeadContext } from '../../../../context/LeadContextProvider';
import { useContext, useEffect, useState } from 'react';
import { fieldLabels, pages } from '../../../../utils';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../components';
import { CircularProgress, Snackbar } from '@mui/material';
import Topbar from '../../../../components/Topbar';
import SwipeableDrawerComponent from '../../../../components/SwipeableDrawer/LeadDrawer';
import { getApplicantById,editFieldsById,verifyMobileOtp,
    getMobileOtp,
    createApplicationForm,form_bypass } from '../../../../global';
import { AuthContext } from '../../../../context/AuthContextProvider';
import Popup from '../../../../components/Popup';
import StepCompleted from './step-completed';
import PreviewCard from './preview-card';
import FormModal from '../../../../components/FormModal';
import pako from 'pako';


const steps = ['', '', '', '', ''];

export default function Preview() {
  const {
    values,
    errors,
    activeIndex,
    setActiveIndex,
    handleSubmit,
    pincodeErr,
    setFieldValue,
    propertyValueEstimateError,
    updateProgressUploadDocumentSteps,
    primaryIndex,
    activeLNT,
    updateCompleteFormProgress,
    updateProgressApplicantSteps,
    setValues,
  } = useContext(LeadContext);

  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const isCoApplicant = values?.applicants?.[activeIndex]?.applicant_details?.is_primary == false;
  const [loadingUploadDocs, setLoadingUploadDocs] = useState(false);

  const[formData,setFormData] = useState([]);
  

  const [requiredFieldsStatus, setRequiredFieldsStatus] = useState({
    ...values?.applicant_details?.extra_params?.upload_required_fields_status,
  });

  const[sections,setSections] = useState({
    applicant_details:values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.progress,
    personal_details:values?.applicants?.[activeIndex]?.personal_details?.extra_params?.progress,
    address_detail:values?.applicants?.[activeIndex]?.personal_details?.extra_params?.progress,
    work_income_detail:values?.applicants?.[activeIndex]?.work_income_detail?.extra_params?.progress,
    property_details:values?.property_details?.extra_params?.progress,
    reference_details:values?.reference_details?.extra_params?.progress,

  })
  

  const[completed,setCompleted] = useState(false);

  const[finalNav,setFinalNav] = useState(false);

  const[ApplicationForm,setApplicantForm] = useState(false);

  const[isGenerated,setIsGenerated] = useState(false);


  const[openAppFormPopup,setAppFormPopup] = useState(false)

  function checkGenerated() {
    
    if(!values?.applicants) return;

    let generated = true;

    const applicants = values?.applicants;


    for(const app of applicants){

      if(!app?.applicant_details?.application_form_otp_verified || app?.applicant_details?.application_form_otp_verified == false){
        generated = false;
      }
    }

    return generated
  }




  
function isGzippedBase64(str) {
  try {
    const buffer = Uint8Array.from(atob(str), c => c.charCodeAt(0));
    return buffer[0] === 0x1f && buffer[1] === 0x8b; // GZIP magic number
  } catch {
    return false;
  }
}

      useEffect(()=>{
  
        if(!values) return;

        if(activeStep !== coApplicantIndexes.length) return;
  
        let tempData = [];
  
        let lead_copy = structuredClone(values);
  
        let applicants = lead_copy?.applicants;
  
  
          applicants.forEach((app,i)=>{
        let master = {};
  
          let obj1 = {};
  
          let obj2 = {};
  
  
          obj1.label = 'Applicant Name';
          obj1.value = app?.applicant_details?.first_name;
  
          obj2.label = 'Mobile Number';
          obj2.value = app?.applicant_details?.mobile_number;
  
          master.fields = [obj1,obj2];
          master.id = app?.applicant_details?.id;
          master.lead_id = lead_copy?.lead?.id
          master.otp = app?.applicant_details?.application_form_otp
          master.verified = app?.applicant_details?.application_form_otp_verified;
          master.url = app?.applicant_details?.document_meta?.application_form?.[0]?.document_fetch_url || ""
          master.index = i;
          master.form_html = app?.applicant_details?.form_html || null
  
          console.log("FORM",master.form_html)
  
          if(master.form_html){
  
            if (isGzippedBase64(master.form_html)) {
    const compressed = Uint8Array.from(atob(master.form_html), c => c.charCodeAt(0));
    master.form_html = pako.ungzip(compressed, { to: 'string' });
  }
          }
  
          tempData.push(master);
          })
  
  
  
        console.log("TEMP AFTER RENDER",tempData)
  
        setFormData(tempData)
  
      },[values?.applicants]);
  

   const openApplicationForm = () =>{
      setApplicantForm(true);
      setAppFormPopup(false);
    }

    
    // const sendApplicationOtp = async(id,index)=>{
    
    
    //     try{
    
    //       const res =  await getMobileOtp(id, {
    //               headers: {
    //                 Authorization: token,
    //               },
    //             },"form-otp");
    
    //             if(res?.data?.message == 'OTP sent successfully'){
    //               // write logic here 

    //               // unzip the html if present

    //               if(res?.data?.form){

    //                 let lead_copy = structuredClone(values);

    //                 const decompressed_form = decompressHtml(res?.data?.form)

    //                 lead_copy.applicants[index].applicant_details.form_html = decompressed_form;

    //                 setValues(lead_copy);

    //               }
    
    //               return {
    //                 message:"OTP sent successfully",
    //                 code:200,
    //                 otp:res?.data?.otp
    //               }
    //             }

    //             else{
    //               return{
    //               message:"Failed sending OTP",
    //               code:400
    //               }
    //             }
                
    //             // write error here
    //     }
    
    //     catch(err){
    
    //       console.log("ERROR SENDING OTP",err)
    
    //       // write error toast here

    //       throw err;


    //     }
    
    
    //   }


        // const verifyApplicationOtp = async (otp,id,index) =>{
      
        //   try{
            
      
        //   const res =  await verifyMobileOtp(id, otp, {
        //         headers: {
        //           Authorization: token,
        //         },  
        //       },"form-otp");

      
        //       if(res?.data?.message == "Valid OTP"){
                
      
        //       let lead_copy = structuredClone(values);
      
        //       lead_copy.applicants[index].applicant_details.application_form_otp = otp;
        //       lead_copy.applicants[index].applicant_details.application_form_otp_verified = true;

        //       console.log("LEAD COPY BEFORE REDNER",lead_copy)
      
        //       setValues(lead_copy)
      
        //       return({
        //         message:"Valid OTP",
        //         updated:lead_copy
        //       })
      
      
        //       }
      
        //     }
      
      
        //     catch(err){
      
        //       console.log("Error Verifying OTP")
      
              
        //       return({
        //         message:"Invalid OTP"
        //       })
        //     }
      
        // }



            // const generateForm = async(id,email,udpated,active) =>{
            
            //     try{
            
            //       const res_form = await createApplicationForm(id,{
            //           headers: {
            //             Authorization: token,
            //           },
            //         },email || false);
            
            //         let lead_copy = structuredClone(udpated || values);
                  
            //         if(res_form?.meta){
            //         lead_copy.applicants[active].applicant_details.document_meta = res_form?.meta;
            //         };
            
            //         console.log("RES FORM",res_form);
        
            //         if(res_form?.form){
            //           lead_copy.applicants[active].applicant_details.form_html = res_form?.form;
            //         }

            //         if(res_form?.form_html){
            //           lead_copy.applicants[active].applicant_details.form_html = res_form?.form_html;
            //         }
            
            //         setValues(lead_copy)
                  
            //       }
            
            //     catch(err){
        
            
            //       console.log("ERROR IN APPLICATION FORM GENERATION");
        
            //       throw err;
            //     }
            //   }


  useEffect(()=>{

    if(finalNav == true){
      //navigate('/lead/eligibility')

      navigate('/lead/generate-form')
    }

  },[finalNav])


  const onCheckLaststep = async () =>{


            setFinalNav(true);

            return;

    try{


    let totalProgress = values?.lead?.extra_params?.progress_without_eligibility;


    if(totalProgress === 100){


      if(values?.lead?.extra_params?.progress !== 100){

          await editFieldsById(values?.lead?.id,'lead',{extra_params:{...values.lead.extra_params,progress:100}},{
          headers:{
            Authorization:token
          }
        });
      }

        // setFieldValue('lead.extra_params',{...values.lead.extra_params,progress:100});

        setFinalNav(true);
return;
    }

      
    if(totalProgress !== 100){

      let finalProgress = await updateCompleteFormProgress(true);

      console.log("FINAL >> new",finalProgress)

      if(finalProgress && finalProgress === 100) {


        let value_copy = structuredClone(values);

        value_copy.lead.extra_params.progress_without_eligibility = finalProgress;

        value_copy.lead.extra_params.progress = 100;


        await editFieldsById(values?.lead?.id,'lead',{extra_params:value_copy.lead.extra_params},{
          headers:{
            Authorization:token
          }
        });

          setFinalNav(true);

          return;
      }

      return null;

    }

  }


  catch(error){
    console.log("ERROR NAVIGATING HENCE STOPPED")
  }
    

  }

  // update progress of primary applicant before showing the preview card and any other operations;


  const updateMissingProgress = async () => {

    try{

      const ifQualifier = values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier;

      if(!ifQualifier || ifQualifier == false){
        setCompleted(true);
        return;
      };

      const value_copy = structuredClone(values);   // take deep copy of values to update;

      // First deal with applicant fields;

      const primary_applicant_index = values?.applicants?.findIndex(
      (applicant) => applicant?.applicant_details?.is_primary,
    );

    const keys = Object.keys(value_copy?.applicants?.[primary_applicant_index]);

    for(const key of keys){

      if(key == 'banking_details') continue;

      let field = value_copy?.applicants?.[primary_applicant_index]?.[key];

      if(!field) continue;

      if(field?.extra_params?.progress !== 100){


        let page;

        switch(key){
          case('applicant_details'):
          page = 'applicant'
          break;
          case('personal_details'):
          page = 'personal'
          break;
          case('address_detail'):
          page = 'address'
          break;
          case('work_income_detail'):
          page = 'work-income';
          break;
          default:
          page = null;
        }

        // update pre qualifier screens required field status before update;

        let required_fiels = field?.extra_params?.required_fields_status;

        const require_keys = Object.keys(required_fiels);


        for(const key of require_keys){
          if(required_fiels[key] == false){
            required_fiels[key] = true;
          }
        }



        const updatedObj = await updateProgressApplicantSteps(key,required_fiels,page,true);


        let extra_params = {...field?.extra_params};

        extra_params.progress = updatedObj?.progress || extra_params?.progress;

        extra_params.required_fields_status = updatedObj?.required_fields_status || extra_params?.required_fields_status;

        value_copy.applicants[primary_applicant_index][key].extra_params = extra_params;


      }

    }

    if(value_copy?.reference_details?.extra_params?.progress !== 100){


      // handle reference extra params if disturbed ** before

      // let required_fields = value_copy?.reference_details?.extra_params?.required_fields_status;

      //   const require_keys = Object.keys(required_fields);


      //   for(const key of require_keys){
      //     if(required_fields[key] == false){


      //       required_fields[key] = true;
      //     }
      //   }

      const udpated = await updateProgressApplicantSteps('reference_details',value_copy?.reference_details?.extra_params?.required_fields_status,'reference',true);



      console.log("UPDATED REFERENCE",udpated)

      value_copy.reference_details.extra_params.progress = udpated?.progress || value_copy?.reference_details?.extra_params?.progress;

      value_copy.reference_details.extra_params.required_fields_status = udpated?.required_fields_status || value_copy?.reference_details?.extra_params?.required_fields_status;

    }

    // final update lead with all updated data

    console.log("VALUE COPY",value_copy)

    setValues(value_copy);

    }

    catch(err){

      console.log("***ERROR UPDATING PRIMARY APPLICANT***",err)

    }

    setCompleted(true);

  }


  useEffect(()=>{

    // update primary progress correctly before proceeding;

    updateMissingProgress();

  },[])

  useEffect(() => {

    if(completed == false) return;

    if(!values?.applicants?.[activeIndex]?.applicant_details?.isApproved) {
      updateProgressUploadDocumentSteps(requiredFieldsStatus);
    }

    console.log("REQUIREED",requiredFieldsStatus)
  }, [requiredFieldsStatus,completed]);

  useEffect(()=> {

    console.log("CURRENT APPLICANT",values?.applicants?.[activeIndex])
  },[values.applicants])

 

  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [primaryIndexPreview, setprimaryIndexPreview] = useState(null);
  const [coApplicantIndex, setCoApplicantIndex] = useState(null);
  const [coApplicantIndexes, setCoApplicantIndexes] = useState([]);
  const [flattedErrors, setFlattedErrors] = useState({});
  const [validationPopUp,setValidationPopUp] = useState(false)

  // Not proceed if service query raised and co applicant need to be added

  const[isLocked,setIsLocked] = useState(false)

  const [openQualifierNotActivePopup, setOpenQualifierNotActivePopup] = useState(false);

  const handleCloseQualifierNotActivePopup = () => {
    setOpenQualifierNotActivePopup(false);
  };

  const [openCoAppMandatoryPopup, setOpenCoAppMandatoryPopup] = useState(false);

  const handleCloseCoAppMandatoryPopup = () => {
    setOpenCoAppMandatoryPopup(false);
  };

  const handleCloseValidationPopUp = () => {
    setValidationPopUp(false)
  }

  const [openBankingMandatoryPopup, setOpenBankingMandatoryPopup] = useState(false);

  const handleCloseBankingMandatoryPopup = () => {
    setOpenBankingMandatoryPopup(false);
  };

  const [openFLMandatoryPopup, setOpenFLMandatoryPopup] = useState(false);

  const handleCloseFLMandatoryPopup = () => {
    setOpenFLMandatoryPopup(false);
  };
  const [openCameraMandatoryPopup, setOpenCameraMandatoryPopup] = useState(false);
  const handleCloseCameraMandatoryPopup = () =>{
    setOpenCameraMandatoryPopup(false);
  }

  const[lt_paid,setLt_paid] = useState(true);


  // check if LT is paid or not to trigger the snack bar ** new change 02-05-2025


  useEffect(()=> {

    if(completed == false) return;

    const activeApplicants = values.applicants;

    let lnt_bre;


    for(const applicant of activeApplicants){

      if(applicant?.applicant_details?.lt_bre_101_response){
        lnt_bre = applicant?.applicant_details?.lt_bre_101_response;
        break;
      }

    };

    if(lnt_bre && lnt_bre?.["body"]?.["L&T_Charges"] == 0){
      setLt_paid(false);
      return;
    }

    if(values?.lt_charges?.find((e) => e.status === 'Completed')){
      setLt_paid(false);
    }

  },[completed])

  function flattenExtraParams(obj) {
    function flattenExtraParamsHelper(inputObj) {
      if (typeof inputObj === 'object' && inputObj !== null) {
        const newObj = {};
        for (const key in inputObj) {
          if (key === 'extra_params') {
            for (const extraParamKey in inputObj[key]) {
              newObj[extraParamKey] = inputObj[key][extraParamKey];
            }
          } else {
            newObj[key] = flattenExtraParamsHelper(inputObj[key]);
          }
        }
        return newObj;
      } else {
        return inputObj;
      }
    }
    return flattenExtraParamsHelper(obj);
  }

  function checkTotalProgress(applicant) {
    return (
      applicant?.applicant_details?.extra_params?.progress == 100 &&
      applicant?.personal_details?.extra_params?.progress == 100 &&
      applicant?.address_detail?.extra_params?.progress == 100 &&
      applicant?.work_income_detail?.extra_params?.progress == 100 &&
      //applicant?.applicant_details?.extra_params?.banking_progress == 100 &&
      applicant?.applicant_details?.extra_params?.upload_progress == 100
    );
  }

  function checkCoApplicantTotalProgress(applicant) {    

    if(applicant?.applicant_details?.isApproved == true) {
      return true
    }

    return (
      applicant?.applicant_details?.extra_params?.progress == 100 &&
      applicant?.personal_details?.extra_params?.progress == 100 &&
      applicant?.address_detail?.extra_params?.progress == 100 &&
      applicant?.work_income_detail?.extra_params?.progress == 100
      &&
      applicant?.applicant_details?.extra_params?.upload_progress == 100
    );
  }

  useEffect(() => {

        if(completed == false) return;

    let _errors = Object.assign({}, errors);
    // console.error(errors);

    if (
      _errors?.property_details &&
      values?.property_details?.property_identification_is == 'not-yet'
    ) {
      _errors.property_details = {};
    } else if (_errors?.property_details && propertyValueEstimateError) {
      _errors.property_details = {
        ..._errors.property_details,
        property_value_estimate: false,
      };
    }

    if (pincodeErr?.property_details) {
      _errors.property_details = {
        ..._errors?.property_details,
        pincode: true,
      };
    }

    if (pincodeErr?.reference_1) {
      _errors.reference_details = {
        ..._errors?.reference_details,
        reference_1_pincode: true,
      };
    }

    if (pincodeErr?.reference_2) {
      _errors.reference_details = {
        ..._errors?.reference_details,
        reference_2_pincode: true,
      };
    }

    setFlattedErrors(flattenExtraParams(_errors));
  }, [errors,completed]);

  useEffect(() => {
        if(completed == false) return;

    const _primaryIndexPreview = values?.applicants?.findIndex(
      (applicant) => applicant?.applicant_details?.is_primary,
    );

    const _coApplicantIndexes = [];
    for (let i = 0; i < values?.applicants?.length; i++) {
      if (i === _primaryIndexPreview) continue;
      _coApplicantIndexes.push(i);
    }

    console.log("INDEXES CO",values?.applicants)
    setprimaryIndexPreview(_primaryIndexPreview);
    setCoApplicantIndex(0);
    setCoApplicantIndexes(_coApplicantIndexes);
    setOpenQualifierNotActivePopup(
      !values?.applicants?.[_primaryIndexPreview]?.applicant_details?.extra_params?.qualifier,
    );

    // To show errors
    handleSubmit();
  }, [completed]);

  useEffect(() => {
        if(completed == false) return;

    setCoApplicantIndex(activeStep ? activeStep - 1 : 0);
    if (activeStep == 0 && primaryIndexPreview != null) {
      setOpenQualifierNotActivePopup(
        !values?.applicants?.[primaryIndexPreview]?.applicant_details?.extra_params?.qualifier,
      );
    } else if (activeStep != 0 && coApplicantIndexes[activeStep - 1] != null) {
      setOpenQualifierNotActivePopup(
        !values?.applicants?.[coApplicantIndexes[activeStep - 1]]?.applicant_details?.extra_params
          ?.qualifier,
      );
    }
  }, [activeStep,completed]);

  useEffect(() => {
        if(completed == false) return;

    // load upload documents
    async function getRequiredFields() {
      setLoading(true); // show loader
      const { extra_params, document_meta } = await getApplicantById(
        values?.applicants?.[activeIndex]?.applicant_details?.id,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      setFieldValue(`applicants.[${activeIndex}].applicant_details.document_meta`, document_meta);
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
    }

    setLoadingUploadDocs(true);
    getRequiredFields()
      .catch((err) => console.log('Failed to load upload documents in preview', err))
      .finally(() => {
        setLoadingUploadDocs(false);
        setLoading(false); // show loader
      });
  }, [completed]);

  const previousStep = () => {
    setActiveStep((prev) => {
      if (prev === 0) {
        navigate('/lead/upload-documents');
        return prev;
      }
      return prev - 1;
    });
  };

  const gotoLntCharges = () => {

     // New check based on lnt bre ** 02-05-2025

     const activeApplicants = values?.applicants;

     let lt_bre;
 
     for(const applicant of activeApplicants){
 
       if(applicant?.applicant_details?.lt_bre_101_response?.body?.['L&T_API']?.length){
         lt_bre = applicant?.applicant_details?.lt_bre_101_response?.body?.['L&T_API'];
         break;
       }
     }
 
     if(lt_bre?.length && lt_bre == 'AirPay'){
       navigate('/lead/airpay-payment');
       return;
     }
 
     if(lt_bre?.length && lt_bre == 'Easebuzz'){
       navigate('/lead/easebuzz-payment')
       return;
     }
 

     navigate(activeLNT == 'any'?values?.lead?.selected_gateway?`/lead/${values?.lead?.selected_gateway}`:'/lead/lnt-charges':activeLNT == 0?'/lead/airpay-payment':'/lead/easebuzz-payment');

  }

  const validation = (applicant) => {    // additional check to validate id proofs uploaded is correct or not

    const regex = {
      AADHAR:/^[a-zA-Z0-9*]{12}$|^[a-zA-Z0-9*]{16}$/,// Matches either 12 or 16 digits
      Voter_ID: /^[A-Za-z]{3}\d{7}$/,
      Driving_license: /^[A-Za-z]{2}\d{13}$/,
      PAN: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
      Passport: /^[A-PR-WY][0-9]{7}$/
  };
//**** */

let applicants_status = [];

let applicants = values?.applicants;

applicants?.forEach((applicant)=> {

  let applicant_verified = {id_proof:false,address_proof:false}

  let status = {id_proof:{type:'',number:''},address_proof:{type:'',number:''}};

  status.id_proof.type = applicant?.personal_details?.id_type;
  status.id_proof.number = applicant?.personal_details?.id_number

  status.address_proof.type = applicant?.personal_details?.selected_address_proof;
  status.address_proof.number = applicant?.personal_details?.address_proof_number;

  if(status?.id_proof?.type == null || status?.address_proof?.type == null) {
    return false;
  }

  const formattedType = status?.id_proof?.type?.replace(' ', '_'); // Replace spaces with underscores

  const formattedAddress = status?.address_proof?.type?.replace(' ', '_'); // Replace spaces with underscores

  let id_test = regex?.[formattedType]?.test(status?.id_proof?.number);

  if(id_test) {
    applicant_verified.id_proof = true;
  }

  let address_test = regex?.[formattedAddress]?.test(status?.address_proof?.number)

  if(address_test) {
    applicant_verified.address_proof = true;
  }

 
  if(applicant_verified?.address_proof == true && applicant_verified?.id_proof == true) {
    applicants_status.push(true)
  }

  else {
    applicants_status.push(false)
  }

})

console.log("STATUS",applicants_status)

let all_verified = true;

applicants_status?.forEach((status)=> {
  if(status == false) {
    all_verified = false;
  }
})

return all_verified
//ends    
  }

  const nextStep = async () => {

      // Validation of ID Types && Address Types Mandatory

      // if(validation() == false) {
      //  setValidationPopUp(true)
      //   return;
      // }
 
    
      // if(activeStep == coApplicantIndexes?.length){

      //   const form_completed = checkGenerated();

      //   if(!form_completed || form_completed == false){
      //     setAppFormPopup(true);
      //     return;
      //   }
      // }

    // Faceliveness Mandatory///
    let faceLivliness = false;
   
    for (let i = 0; i < values?.applicants.length; i++) {

      console.log("APPLICANT DATA",values?.applicants?.[i]?.applicant_details)
      if (values?.applicants?.[i]?.applicant_details?.faceLivliness_status == 'yes') {
        faceLivliness = true;
      }

      let lt_bre = values?.applicants?.[i]?.applicant_details?.lt_bre_101_response?.body?.Face_Liveliness_API;

      if((lt_bre && lt_bre == "na") || (lt_bre && lt_bre == "NA")){
        faceLivliness = true;
      }

      
    }
    //if (values?.applicants?.[primaryIndexPreview]?.applicant_details?.faceLivliness_status != 'yes' && values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.applicant_details?.faceLivliness_status != 'yes') {
      if (faceLivliness == false) {
        console.log('faceLivliness', faceLivliness);
        setOpenFLMandatoryPopup(true);
        setActiveIndex(primaryIndex);
        return;
      }
 
    //vaidate any one click from camera
    let isCameraPhoto = false;
    for (let i = 0; values?.applicants && i < values.applicants.length; i++) {
      let applicant = values.applicants[i];
      let applicantDetails = applicant?.applicant_details;
      let documentMeta = applicantDetails?.document_meta;
      let customerPhotos = documentMeta?.customer_photos;
      if (customerPhotos && Array.isArray(customerPhotos)) {
          for ( let j=0;j<customerPhotos.length;j++){
            //let filename = customerPhotos[j].document_url.substring(customerPhotos[j].document_url.lastIndexOf('/') + 1); 100 to 999 changes 171 to 17 for image
              if (customerPhotos[j]?.active === true && (customerPhotos[j]?.document_name?.startsWith('17') || customerPhotos[j]?.document_name?.startsWith('image'))) {
                  isCameraPhoto = true;
              }

          }
      }
  }
   //if (values?.applicants?.[primaryIndexPreview]?.applicant_details?.faceLivliness_status != 'yes' && values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.applicant_details?.faceLivliness_status != 'yes') {
   //vijay uniyal set false for one camera photo validation
  //  if (isCameraPhoto == false && values?.lead?.applicant_type !== "C") {
  //     console.log('isCameraPhoto', isCameraPhoto);
  //     setOpenCameraMandatoryPopup(true);
  //     setActiveIndex(primaryIndex);
  //     return;
  //   }
   
   
    // Banking Mandatory///
    let bankingfilled = false;
    for (let i = 0; i < values?.applicants.length; i++) {
      if (values?.applicants?.[i]?.applicant_details?.extra_params?.banking_progress == 100) {
        bankingfilled = true;
      }
    }

    //if (values?.applicants?.[primaryIndexPreview]?.applicant_details?.extra_params?.banking_progress != 100 && values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.applicant_details?.extra_params?.banking_progress != 100) {
    if (bankingfilled == false) {
      setOpenBankingMandatoryPopup(true);
      setActiveIndex(primaryIndex);
      return;
    }

       // check for bre-101 null and qualifier false

    let isBreNull = false;
    for (let i = 0; i < values?.applicants.length; i++) {
      if (values?.applicants?.[i]?.applicant_details?.extra_params?.qualifier == false || values?.applicants?.[i]?.applicant_details?.bre_101_response == null) {
        isBreNull = true;
      }
    }

    //if (values?.applicants?.[primaryIndexPreview]?.applicant_details?.extra_params?.banking_progress != 100 && values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.applicant_details?.extra_params?.banking_progress != 100) {
    if (isBreNull) {
      setOpenQualifierNotActivePopup(true);
      setActiveIndex(primaryIndex);
      return;
    }

    //service query co applicant adding required case

    let allLocked = true;

    if(values?.lead?.applicant_type == 'C' || values?.lead?.applicant_type == 'G') {

      values?.applicants?.forEach((applicant)=> {
        if((applicant?.applicant_details?.is_locked == false || !applicant?.applicant_details?.is_locked) && applicant?.applicant_details?.is_primary == false) {
          allLocked = false;
        }
      })

    }

    console.log("EXISTING APPLICANTS",values)

    // debugging - *

    // let arr = [];
    // const app = values?.applicants

    // for(const ele of app){

    //   let obj = {};

    //   let keys = Object.keys(ele);

    //   for(const key of keys){

    //     obj[key] = ele[key]?.extra_params?.progress;

    //     if(key == "applicant_details"){
    //       obj["upload"] = ele[key]?.extra_params?.upload_progress
    //     }
    //   }

    //   arr.push(obj)
    // }

    // console.log("PROGRESS MAP",arr)

    if((values?.lead?.applicant_type == 'C' || values?.lead?.applicant_type == 'G')&& allLocked == true) {
      setOpenCoAppMandatoryPopup(true)


      return;
    }

    //ENDING



    // reference details check ** if existing

    

 
    // CoApplicant Mandatory//
    if (activeStep === coApplicantIndexes.length) {
      if (values?.applicants?.length < 2) {
        setOpenCoAppMandatoryPopup(true);
        return;
      }
      setActiveIndex(primaryIndex);    
    }

    if(activeStep < coApplicantIndexes.length) {
      setActiveStep((prev) => {
        return prev + 1;
      });
    }


    if(activeStep === coApplicantIndexes.length && (values?.lt_charges?.find((e) => e.status === 'Completed') || lt_paid == false) &&
              values?.applicants?.length >= 2
){

    onCheckLaststep();

}




    // let value_copy = structuredClone(values);

    // delete value_copy.applicants[4]["applicant_details?"];

    // setFieldValue(`applicants`,value_copy.applicants)

    // updateCompleteFormProgress();

  };

  const CoApplicantDetails = () => {
    return (
        <>
        {loading && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="ml-3 text-white font-medium">Loading...</p>
            </div>
          )}
        <>
    
           <Popup
              handleClose={()=>{setAppFormPopup(false)}}
              open={openAppFormPopup}
              setOpen={setAppFormPopup}
              title='Application Form is Mandatory'
              description='Generate Application Form for All Applicants'
            />
        {checkCoApplicantTotalProgress(
          values?.applicants?.[coApplicantIndexes[coApplicantIndex]],
        ) ? (
          <StepCompleted />
        ) : (
          <div className='flex-1 flex flex-col gap-4 p-4 pb-[200px] overflow-auto bg-[##F9F9F9]'>
            <div className='flex gap-2'>
              <span>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  fill='none'
                  viewBox='0 0 16 16'
                >
                  <g
                    stroke='#96989A'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='1.5'
                    clipPath='url(#clip0_3125_37927)'
                  >
                    <path d='M7.999 14.667a6.667 6.667 0 100-13.334 6.667 6.667 0 000 13.334z'></path>
                    <path d='M8 10.667V8'></path>
                    <path d='M8 5.333h.007'></path>
                  </g>
                  <defs>
                    <clipPath id='clip0_3125_37927'>
                      <path fill='#fff' d='M0 0H16V16H0z'></path>
                    </clipPath>
                  </defs>
                </svg>
              </span>
              <p className='text-xs not-italic font-normal text-dark-grey'>
                To get the applicant�s eligible amount, complete the mandatory fields
              </p>
            </div>
            <PreviewCard
              index={coApplicantIndexes[coApplicantIndex]}
              hide={
                values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                  pages.applicant_details.name
                ]?.extra_params?.progress == 100
              }
              title={pages.applicant_details.title}
              link={pages.applicant_details.url + '?preview=' + pages.applicant_details.url}
              count={
                flattedErrors &&
                flattedErrors?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                  pages.applicant_details.name
                ] &&
                values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                  pages.applicant_details.name
                ] &&
                values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                  pages.applicant_details.name
                ]?.extra_params?.progress != 0
                  ? Object.keys(
                      flattedErrors?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                        pages.applicant_details.name
                      ],
                    ).length
                  : 'ALL'
              }
            >
              {flattedErrors?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                pages.applicant_details.name  // checking here ** note
              ] &&
                Object.keys(
                  flattedErrors?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                    pages.applicant_details.name
                  ],
                ).map((val, i) => (
                  <p key={i} className='text-xs pb-[3px] not-italic font-normal text-primary-black'>
                    {fieldLabels[val] ?? '-'}
                    <span className='text-primary-red text-xs'>*</span>
                  </p>
                ))}
            </PreviewCard>

            <PreviewCard
              index={coApplicantIndexes[coApplicantIndex]}
              hide={
                values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                  pages.personal_details.name
                ]?.extra_params?.progress == 100
              }
              title={pages.personal_details.title}
              link={pages.personal_details.url + '?preview=' + pages.personal_details.url}
              count={
                values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                  pages.personal_details.name
                ]?.extra_params?.required_fields_status &&
                values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                  pages.personal_details.name
                ]?.extra_params?.progress != 0
                  ? Object.keys(
                      values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                        pages.personal_details.name
                      ]?.extra_params?.required_fields_status,
                    ).filter(
                      (k) =>
                        !values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                          pages.personal_details.name
                        ]?.extra_params?.required_fields_status[k],
                    )?.length
                  : 'ALL'
              }
            >
              {values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                pages.personal_details.name
              ]?.extra_params?.required_fields_status &&
                Object.keys(
                  values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                    pages.personal_details.name
                  ]?.extra_params?.required_fields_status,
                )
                  .filter(
                    (k) =>
                      !values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                        pages.personal_details.name
                      ]?.extra_params?.required_fields_status[k],
                  )
                  .map((val, i) =>
                    fieldLabels[val] ? (
                      <p
                        key={i}
                        className='text-xs pb-[3px] not-italic font-normal text-primary-black'
                      >
                        {fieldLabels[val]}
                        <span className='text-primary-red text-xs'>*</span>
                      </p>
                    ) : null,
                  )}
            </PreviewCard>
            <PreviewCard
              index={coApplicantIndexes[coApplicantIndex]}
              title={pages.address_detail.title}
              hide={
                values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                  pages.address_detail.name
                ]?.extra_params?.progress == 100
              }
              link={pages.address_detail.url + '?preview=' + pages.address_detail.url}
              count={
                values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                  pages.address_detail.name
                ]?.extra_params?.required_fields_status &&
                values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                  pages.address_detail.name
                ]?.extra_params?.progress != 0
                  ? Object.keys(
                      values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                        pages.address_detail.name
                      ]?.extra_params?.required_fields_status,
                    ).filter(
                      (k) =>
                        !values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                          pages.address_detail.name
                        ]?.extra_params?.required_fields_status[k],
                    )?.length
                  : 'ALL'
              }
            >
              {values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                pages.address_detail.name
              ]?.extra_params?.required_fields_status &&
                Object.keys(
                  values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                    pages.address_detail.name
                  ]?.extra_params?.required_fields_status,
                )
                  .filter(
                    (k) =>
                      !values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                        pages.address_detail.name
                      ]?.extra_params?.required_fields_status[k],
                  )
                  .map((val, i) =>
                    fieldLabels[val] ? (
                      <p
                        key={i}
                        className='text-xs pb-[3px] not-italic font-normal text-primary-black'
                      >
                        {fieldLabels[val]}
                        <span className='text-primary-red text-xs'>*</span>
                      </p>
                    ) : null,
                  )}
            </PreviewCard>

            <PreviewCard
              index={coApplicantIndexes[coApplicantIndex]}
              hide={
                values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                  pages.work_income_detail.name
                ]?.extra_params?.progress == 100
              }
              title={pages.work_income_detail.title}
              link={pages.work_income_detail.url + '?preview=' + pages.work_income_detail.url}
              count={
                values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                  pages.work_income_detail.name
                ]?.extra_params?.required_fields_status &&
                values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                  pages.work_income_detail.name
                ]?.extra_params?.progress != 0
                  ? Object.keys(
                      values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                        pages.work_income_detail.name
                      ]?.extra_params?.required_fields_status,
                    ).filter(
                      (k) =>
                        !values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                          pages.work_income_detail.name
                        ]?.extra_params?.required_fields_status[k],
                    )?.length
                  : 'ALL'
              }
            >
              {values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                pages.work_income_detail.name
              ]?.extra_params?.required_fields_status &&
                Object.keys(
                  values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                    pages.work_income_detail.name
                  ]?.extra_params?.required_fields_status,
                )
                  .filter(
                    (k) =>
                      !values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                        pages.work_income_detail.name
                      ]?.extra_params?.required_fields_status[k],
                  )
                  .map((val, i) =>
                    fieldLabels[val] ? (
                      <p
                        key={i}
                        className='text-xs pb-[3px] not-italic font-normal text-primary-black'
                      >
                        {fieldLabels[val]}
                        <span className='text-primary-red text-xs'>*</span>
                      </p>
                    ) : null,
                  )}
            </PreviewCard>

            {loadingUploadDocs ? (
              <div className='flex justify-center'>
                <CircularProgress size={30} color='error' />
              </div>
            ) : (
              <PreviewCard
                index={coApplicantIndexes[coApplicantIndex]}
                hide={
                  values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                    pages.applicant_details.name
                  ]?.extra_params?.upload_progress == 100
                }
                title={pages.upload_documents.title}
                link={pages.upload_documents.url + '?preview=' + pages.upload_documents.url}
                // hideLabel={true}
                count={
                  values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                    pages.applicant_details.name
                  ]?.extra_params?.upload_required_fields_status &&
                  values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                    pages.applicant_details.name
                  ]?.extra_params?.upload_progress != 0
                    ? Object.keys(
                        values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                          pages.applicant_details.name
                        ]?.extra_params?.upload_required_fields_status,
                      ).filter(
                        (k) =>
                          !values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                            pages.applicant_details.name
                          ]?.extra_params?.upload_required_fields_status[k],
                      )?.length
                    : 'ALL'
                }
              >
           
                {values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                  pages.applicant_details.name
                ]?.extra_params?.upload_required_fields_status &&
                  Object.keys(
                    values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                      pages.applicant_details.name
                    ]?.extra_params?.upload_required_fields_status,
                  )
                    .filter(
                      (k) =>
                        !values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.[
                          pages.applicant_details.name
                        ]?.extra_params?.upload_required_fields_status[k],
                    )
                    .map((val, i) =>
                      fieldLabels[val] ? (
                        <p
                          key={i}
                          className='text-xs pb-[3px] not-italic font-normal text-primary-black'
                        >
                          {fieldLabels[val]}
                          <span className='text-primary-red text-xs'>*</span>
                        </p>
                      ) : null,
                    )}
              </PreviewCard>
            )}
          </div>
        )}
      </>
      </>
    );
  };

  const PrimaryApplicantDetails = () => {
    return (
      <>
        {checkTotalProgress(values?.applicants?.[primaryIndexPreview]) &&
        values?.property_details?.extra_params?.progress == 100 &&
        values?.reference_details?.extra_params?.progress == 100 ? (
          <>
            <StepCompleted />

            <Popup
              handleClose={handleCloseValidationPopUp}
              open={validationPopUp}
              setOpen={setValidationPopUp}
              title='ID/Address Type Mismatch'
              description='Kindly review the ID/Addess Proofs'
            />

            <Popup
              handleClose={handleCloseCoAppMandatoryPopup}
              open={openCoAppMandatoryPopup}
              setOpen={setOpenCoAppMandatoryPopup}
              title='Co-Applicant is mandatory'
              description='Add a Co-Applicant to activate Eligibility'
            />
             <Popup
              handleClose={handleCloseBankingMandatoryPopup}
              open={openBankingMandatoryPopup}
              setOpen={setOpenBankingMandatoryPopup}
              title='Banking is mandatory'
              description='Add Banking of any applicant'
            />

      
            <Popup
              handleClose={handleCloseFLMandatoryPopup}
              open={openFLMandatoryPopup}
              setOpen={setOpenFLMandatoryPopup}
              title='Faceliveness is mandatory'
              description='Facelivenss is mandatory for any applicant'
            />
              <Popup
              handleClose={handleCloseCameraMandatoryPopup}
              open={openCameraMandatoryPopup}
              setOpen={setOpenCameraMandatoryPopup}
              title='Live photo is mandatory'
              description='Live photo  is mandatory for any one applicant'
            />
          </>
        ) : (
          <>
            <Popup
              handleClose={handleCloseCoAppMandatoryPopup}
              open={openCoAppMandatoryPopup}
              setOpen={setOpenCoAppMandatoryPopup}
              title='Qualifier is not activated'
              description='Complete Applicant, Personal, Address and Work & Income details to activate'
            />
            <div className='flex-1 flex flex-col gap-4 p-4 pb-[200px] overflow-auto bg-[##F9F9F9]'>
              <div className='flex gap-2'>
                <span>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='16'
                    height='16'
                    fill='none'
                    viewBox='0 0 16 16'
                  >
                    <g
                      stroke='#96989A'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='1.5'
                      clipPath='url(#clip0_3125_37927)'
                    >
                      <path d='M7.999 14.667a6.667 6.667 0 100-13.334 6.667 6.667 0 000 13.334z'></path>
                      <path d='M8 10.667V8'></path>
                      <path d='M8 5.333h.007'></path>
                    </g>
                    <defs>
                      <clipPath id='clip0_3125_37927'>
                        <path fill='#fff' d='M0 0H16V16H0z'></path>
                      </clipPath>
                    </defs>
                  </svg>
                </span>
                <p className='text-xs not-italic font-normal text-dark-grey'>
                  To get the applicant�s eligible amount, complete the mandatory fields
                </p>
              </div>

             
              <PreviewCard
                index={primaryIndexPreview}
                hide={
                  values?.applicants?.[primaryIndexPreview]?.[pages.applicant_details.name]
                    ?.extra_params?.progress == 100
                }
                title={pages.applicant_details.title}
                link={pages.applicant_details.url + '?preview=' + pages.applicant_details.url}
                count={
                  flattedErrors &&
                  flattedErrors?.applicants?.[primaryIndexPreview]?.[
                    pages.applicant_details.name
                  ] &&
                  values?.applicants?.[primaryIndexPreview]?.[pages.applicant_details.name] &&
                  values?.applicants?.[primaryIndexPreview]?.[pages.applicant_details.name]
                    ?.extra_params?.progress != 0
                    ? Object.keys(
                        flattedErrors?.applicants?.[primaryIndexPreview]?.[
                          pages.applicant_details.name
                        ],
                      ).length
                    : 'ALL'
                }
              >
                {flattedErrors?.applicants?.[primaryIndexPreview]?.[pages.applicant_details.name] &&
                  Object.keys(
                    flattedErrors?.applicants?.[primaryIndexPreview]?.[
                      pages.applicant_details.name
                    ],
                  ).map((val, i) => (
                    <p
                      key={i}
                      className='text-xs pb-[3px] not-italic font-normal text-primary-black'
                    >
                      {fieldLabels[val] ?? '-'}
                      <span className='text-primary-red text-xs'>*</span>
                    </p>
                  ))}
              </PreviewCard>

              <PreviewCard
                index={primaryIndexPreview}   // working here ** note
                hide={
                  values?.applicants?.[primaryIndexPreview]?.[pages.personal_details.name]
                    ?.extra_params?.progress == 100
                }
                title={pages.personal_details.title}
                link={pages.personal_details.url + '?preview=' + pages.personal_details.url}
                count={
                  values?.applicants?.[primaryIndexPreview]?.[pages.personal_details.name]
                    ?.extra_params?.required_fields_status &&
                  values?.applicants?.[primaryIndexPreview]?.[pages.personal_details.name]
                    ?.extra_params?.progress != 0
                    ? Object.keys(
                        values?.applicants?.[primaryIndexPreview]?.[pages.personal_details.name]
                          ?.extra_params?.required_fields_status,
                      ).filter(
                        (k) =>
                          !values?.applicants?.[primaryIndexPreview]?.[pages.personal_details.name]
                            ?.extra_params?.required_fields_status[k],
                      )?.length
                    : 'ALL'
                }
              >
                {values?.applicants?.[primaryIndexPreview]?.[pages.personal_details.name]
                  ?.extra_params?.required_fields_status &&
                  Object.keys(
                    values?.applicants?.[primaryIndexPreview]?.[pages.personal_details.name]
                      ?.extra_params?.required_fields_status,
                  )
                    .filter(
                      (k) =>
                        !values?.applicants?.[primaryIndexPreview]?.[pages.personal_details.name]
                          ?.extra_params?.required_fields_status[k],
                    )
                    .map((val, i) =>
                      fieldLabels[val] ? (
                        <p
                          key={i}
                          className='text-xs pb-[3px] not-italic font-normal text-primary-black'
                        >
                          {fieldLabels[val]}
                          <span className='text-primary-red text-xs'>*</span>
                        </p>
                      ) : null,
                    )}
              </PreviewCard>

              <PreviewCard
                index={primaryIndexPreview}
                hide={
                  values?.applicants?.[primaryIndexPreview]?.[pages.address_detail.name]
                    ?.extra_params?.progress == 100
                }
                title={pages.address_detail.title}
                link={pages.address_detail.url + '?preview=' + pages.address_detail.url}
                count={
                  values?.applicants?.[primaryIndexPreview]?.[pages.address_detail.name]
                    ?.extra_params?.required_fields_status &&
                  values?.applicants?.[primaryIndexPreview]?.[pages.address_detail.name]
                    ?.extra_params?.progress != 0
                    ? Object.keys(
                        values?.applicants?.[primaryIndexPreview]?.[pages.address_detail.name]
                          ?.extra_params?.required_fields_status,
                      ).filter(
                        (k) =>
                          !values?.applicants?.[primaryIndexPreview]?.[pages.address_detail.name]
                            ?.extra_params?.required_fields_status[k],
                      )?.length
                    : 'ALL'
                }
              >
                {values?.applicants?.[primaryIndexPreview]?.[pages.address_detail.name]
                  ?.extra_params?.required_fields_status &&
                  Object.keys(
                    values?.applicants?.[primaryIndexPreview]?.[pages.address_detail.name]
                      ?.extra_params?.required_fields_status,
                  )
                    .filter(
                      (k) =>
                        !values?.applicants?.[primaryIndexPreview]?.[pages.address_detail.name]
                          ?.extra_params?.required_fields_status[k],
                    )
                    .map((val, i) =>
                      fieldLabels[val] ? (
                        <p
                          key={i}
                          className='text-xs pb-[3px] not-italic font-normal text-primary-black'
                        >
                          {fieldLabels[val]}
                          <span className='text-primary-red text-xs'>*</span>
                        </p>
                      ) : null,
                    )}
              </PreviewCard>

              <PreviewCard
                index={primaryIndexPreview}
                hide={
                  values?.applicants?.[primaryIndexPreview]?.[pages.work_income_detail.name]
                    ?.extra_params?.progress == 100
                }
                title={pages.work_income_detail.title}
                link={pages.work_income_detail.url + '?preview=' + pages.work_income_detail.url}
                count={
                  values?.applicants?.[primaryIndexPreview]?.[pages.work_income_detail.name]
                    ?.extra_params?.required_fields_status &&
                  values?.applicants?.[primaryIndexPreview]?.[pages.work_income_detail.name]
                    ?.extra_params?.progress != 0
                    ? Object.keys(
                        values?.applicants?.[primaryIndexPreview]?.[pages.work_income_detail.name]
                          ?.extra_params?.required_fields_status,
                      ).filter(
                        (k) =>
                          !values?.applicants?.[primaryIndexPreview]?.[
                            pages.work_income_detail.name
                          ]?.extra_params?.required_fields_status[k],
                      )?.length
                    : 'ALL'
                }
              >
                {values?.applicants?.[primaryIndexPreview]?.[pages.work_income_detail.name]
                  ?.extra_params?.required_fields_status &&
                  Object.keys(
                    values?.applicants?.[primaryIndexPreview]?.[pages.work_income_detail.name]
                      ?.extra_params?.required_fields_status,
                  )
                    .filter(
                      (k) =>
                        !values?.applicants?.[primaryIndexPreview]?.[pages.work_income_detail.name]
                          ?.extra_params?.required_fields_status[k],
                    )
                    .map((val, i) =>
                      fieldLabels[val] ? (
                        <p
                          key={i}
                          className='text-xs pb-[3px] not-italic font-normal text-primary-black'
                        >
                          {fieldLabels[val]}
                          <span className='text-primary-red text-xs'>*</span>
                        </p>
                      ) : null,
                    )}
              </PreviewCard>

              <PreviewCard
                index={primaryIndexPreview}
                hide={values?.[pages.property_details.name]?.extra_params?.progress == 100}
                title={pages.property_details.title}
                link={pages.property_details.url + '?preview=' + pages.property_details.url}
                count={
                  values?.[pages.property_details.name]?.extra_params?.required_fields_status &&
                  values?.[pages.property_details.name]?.extra_params?.progress != 0
                    ? Object.keys(
                        values?.[pages.property_details.name]?.extra_params?.required_fields_status,
                      ).filter(
                        (k) =>
                          !values?.[pages.property_details.name]?.extra_params
                            ?.required_fields_status[k],
                      )?.length
                    : 'ALL'
                }
              >
                {values?.[pages.property_details.name]?.extra_params?.required_fields_status &&
                  Object.keys(
                    values?.[pages.property_details.name]?.extra_params?.required_fields_status,
                  )
                    .filter(
                      (k) =>
                        !values?.[pages.property_details.name]?.extra_params
                          ?.required_fields_status[k],
                    )
                    .map((val, i) =>
                      fieldLabels[val] ? (
                        <p
                          key={i}
                          className='text-xs pb-[3px] not-italic font-normal text-primary-black'
                        >
                          {fieldLabels[val]}
                          <span className='text-primary-red text-xs'>*</span>
                        </p>
                      ) : null,
                    )}
              </PreviewCard>
    {/* Banking  not mandatory added by pankaj yadav */}
              {/* <PreviewCard
                index={primaryIndexPreview}
                hide={
                  values?.applicants?.[primaryIndexPreview]?.[pages.applicant_details.name]
                    ?.extra_params?.banking_progress == 100 ||
                  !values?.applicants?.[primaryIndexPreview]?.applicant_details?.extra_params
                    ?.qualifier
                }
                title={pages.banking_details.title}
                link={pages.banking_details.url + '?preview=' + pages.banking_details.url}
                hideLabel={true}
                count={
                  values?.applicants?.[primaryIndexPreview]?.[pages.applicant_details.name]
                    ?.extra_params?.banking_progress == 100
                    ? 'Banking completed'
                    : 'No bank added'
                }
              >
                {flattedErrors?.applicants?.[primaryIndexPreview]?.[pages.banking_details.name] &&
                  Object.keys(
                    flattedErrors?.applicants?.[primaryIndexPreview]?.[pages.banking_details.name],
                  ).map((val, i) =>
                    fieldLabels[val] ? (
                      <p
                        key={i}
                        className='text-xs pb-[3px] not-italic font-normal text-primary-black'
                      >
                        {fieldLabels[val]}
                        <span className='text-primary-red text-xs'>*</span>
                      </p>
                    ) : null,
                  )}
              </PreviewCard> */}

              <PreviewCard
                index={primaryIndexPreview}
                hide={values?.[pages.reference_details.name]?.extra_params?.progress == 100}
                title={pages.reference_details.title}
                link={pages.reference_details.url + '?preview=' + pages.reference_details.url}
                count={
                  flattedErrors &&
                  flattedErrors?.[pages.reference_details.name] &&
                  values?.[pages.reference_details.name] &&
                  values?.[pages.reference_details.name]?.extra_params?.progress != 0
                    ? Object.keys(flattedErrors?.[pages.reference_details.name]).length
                    : 'ALL'
                }
              >
                {flattedErrors?.[pages.reference_details.name] &&
                  Object.keys(flattedErrors?.[pages.reference_details.name]).map((val, i) =>
                    fieldLabels[val] ? (
                      <p
                        key={i}
                        className='text-xs pb-[3px] not-italic font-normal text-primary-black'
                      >
                        {fieldLabels[val]}
                        <span className='text-primary-red text-xs'>*</span>
                      </p>
                    ) : null,
                  )}
              </PreviewCard>

              {loadingUploadDocs ? (
                <div className='flex justify-center'>
                  <CircularProgress size={30} color='error' />
                </div>
              ) : (
                <PreviewCard
                  index={primaryIndexPreview}
                  hide={
                    values?.applicants?.[primaryIndexPreview]?.[pages.applicant_details.name]
                      ?.extra_params?.upload_progress == 100
                  }
                  title={pages.upload_documents.title}
                  link={pages.upload_documents.url + '?preview=' + pages.upload_documents.url}
                  count={
                    values?.applicants?.[primaryIndexPreview]?.[pages.applicant_details.name]
                      ?.extra_params?.upload_required_fields_status &&
                    values?.applicants?.[primaryIndexPreview]?.[pages.applicant_details.name]
                      ?.extra_params?.upload_progress != 0
                      ? Object.keys(
                          values?.applicants?.[primaryIndexPreview]?.[pages.applicant_details.name]
                            ?.extra_params?.upload_required_fields_status,
                        ).filter(
                          (k) =>
                            !values?.applicants?.[primaryIndexPreview]?.[
                              pages.applicant_details.name
                            ]?.extra_params?.upload_required_fields_status[k],
                        )?.length
                      : 'ALL'
                  }
                >
                  {values?.applicants?.[primaryIndexPreview]?.[pages.applicant_details.name]
                    ?.extra_params?.upload_required_fields_status &&
                    Object.keys(
                      values?.applicants?.[primaryIndexPreview]?.[pages.applicant_details.name]
                        ?.extra_params?.upload_required_fields_status,
                    )
                      .filter(
                        (k) =>
                          !values?.applicants?.[primaryIndexPreview]?.[pages.applicant_details.name]
                            ?.extra_params?.upload_required_fields_status[k],
                      )
                      .map((val, i) =>
                        fieldLabels[val] ? (
                          <p
                            key={i}
                            className='text-xs pb-[3px] not-italic font-normal text-primary-black'
                          >
                            {fieldLabels[val]}
                            <span className='text-primary-red text-xs'>*</span>
                          </p>
                        ) : null,
                      )}
                </PreviewCard>
              )}
            </div>
          </>
        )}
      </>
    );
  };

  return (
    <>
      <div className='overflow-hidden flex flex-col h-[100vh] bg-[#F9F9F9] justify-between'>
        <Topbar title='Preview of the application' id={values?.lead?.id} showClose={true} />

{/* 
                {ApplicationForm&&<FormModal
                setOpenApplication={setApplicantForm}
                data = {formData}
                sendApplicationOtp = {sendApplicationOtp}
                verifyApplicationOtp = {verifyApplicationOtp}
                generateForm = {generateForm}
                />} */}

        <div className='pt-4 overflow-auto no-scrollbar flex flex-col flex-1'>
          <div className='px-6 mb-3 flex justify-between'>
            <span className='text-xs not-italic font-medium text-dark-grey'>APPLICANTS</span>
            <span className='text-right text-xs not-italic font-normal text-primary-black'>{`${
              values?.applicants?.[
                activeStep == 0 ? primaryIndexPreview : coApplicantIndexes[coApplicantIndex]
              ]?.applicant_details?.first_name || '-'
            } (${activeStep == 0 ? 'Primary' : 'Co-app'}) `}</span>
          </div>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, i) => (
              <Step
                sx={{
                  '& .MuiStepLabel-root': {
                    margin: '0',
                    padding: '0',
                    fontFamily: 'Poppins',
                  },
                  '& .MuiStepLabel-root .Mui-completed': {
                    color: '#E33439', // circle color (COMPLETED)
                  },
                  '& .MuiStepLabel-root .Mui-disabled': {
                    borderWidth: i > coApplicantIndexes.length ? 0 : '1px',
                    borderRadius: '100%',
                    borderColor: i > coApplicantIndexes.length ? '#F3F3F3' : '#727376',
                  },
                  '& .MuiStepLabel-root .Mui-disabled .MuiStepIcon-root': {
                    color: i > coApplicantIndexes.length ? '#F3F3F3' : '#fff',
                  },
                  '& .MuiStepLabel-root .Mui-active': {
                    color: 'white', // circle color (ACTIVE)
                    borderWidth: '1px',
                    borderRadius: '100%',
                    borderColor: '#E33439',
                  },

                  '& .MuiStepLabel-label.Mui-active.MuiStepLabel-alternativeLabel': {
                    color: 'common.white', // Just text label (ACTIVE)
                  },
                  '& .MuiStepLabel-label.Mui-disabled.MuiStepLabel-alternativeLabel': {
                    color: 'common.white',
                  },
                  '& .MuiStepLabel-root .Mui-active .MuiStepIcon-text': {
                    fill: '#E33439', // circle's number (ACTIVE)
                    fontSize: '14px',
                    fontWeight: '600',
                  },

                  '& .MuiStepLabel-root .Mui-disabled .MuiStepIcon-text': {
                    fill: '#727376',
                    fontSize: '14px',
                    fontWeight: '600',
                    opacity: i > coApplicantIndexes.length ? '0.6' : '1',
                  },
                }}
                key={i}
              >
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep == 0 ? <PrimaryApplicantDetails /> : <CoApplicantDetails />}
        </div>
        

        <div
          className='flex w-[100vw] p-[18px] bg-white gap-[20px] justify-end'
          style={{ boxShadow: '0px -5px 10px #E5E5E580' }}
        >
          <Button
            inputClasses='w-1/2 h-[46px]'
            onClick={previousStep}
            link={activeStep === 0 && '/lead/upload-documents'}
            disabled = {(values?.applicants?.[activeIndex]?.applicant_details?.isApproved && activeStep == 0)
            }
          >
            Previous
          </Button>
          <Button
            primary
          disabled={
            loading || // disable while loader is active
            (
              (activeStep === 0
                ? !checkTotalProgress(values?.applicants?.[primaryIndexPreview]) ||
                  values?.property_details?.extra_params?.progress !== 100 ||
                  values?.reference_details?.extra_params?.progress !== 100
                : !checkCoApplicantTotalProgress(
                    values?.applicants?.[coApplicantIndexes[coApplicantIndex]],
                  )) &&
              values?.lead?.extra_params?.progress_without_eligibility !== 100
            ) ||
              (activeStep === coApplicantIndexes.length && lt_paid === true)
            }
            inputClasses="w-1/2 h-[46px]"
            onClick={async () => {
              setLoading(true);        // show loader
              try {
                await nextStep();      // wait until async step completes
              } finally {
                setLoading(false);     // re-enable button
              }
            }}
          >
            {loading ? (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="ml-3 text-white font-medium">Loading...</p>
            </div>

            ) : (
              activeStep === coApplicantIndexes.length ? 'Submit' : 'Next'
            )}
        </Button>
        </div>

        {!ApplicationForm&&        <SwipeableDrawerComponent />
}
      </div>

      {/* Lnt Charges */}
      {activeStep == 0 &&
      values?.applicants?.[primaryIndexPreview]?.applicant_details?.extra_params?.qualifier ? (
        <Snackbar
          sx={{
            '& .MuiPaper-root': {
              backgroundColor: '#000000F2',
              fontFamily: 'Poppins',
            },

            '& .MuiPaper-root .MuiSnackbarContent-message': {
              color: '#FEFEFE',

              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 400,
            },
          }}
          className='-translate-y-32 m-[10px]'
          open={lt_paid}//!values?.lt_charges?.find((e) => e.status === 'Completed')}
          onClose={() => {}}
          message='L&T charges is pending'
          action={
            <button onClick={gotoLntCharges} className='mr-3'>
              <span className='text-right text-sm not-italic font-semibold text-primary-red'>
                Pay now
              </span>
            </button>
          }
        />
      ) : null}

      {activeStep != 0 &&
      values?.applicants?.[coApplicantIndexes[coApplicantIndex]]?.applicant_details?.extra_params
        ?.qualifier ? (
        <Snackbar
          sx={{
            '& .MuiPaper-root': {
              backgroundColor: '#000000F2',
              fontFamily: 'Poppins',
            },

            '& .MuiPaper-root .MuiSnackbarContent-message': {
              color: '#FEFEFE',

              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 400,
            },
          }}
          className='-translate-y-32 m-[10px]'
          open={lt_paid}
          onClose={() => {}}
          message='L&T charges is pending'
          action={
            <button onClick={gotoLntCharges} className='mr-3'>
              <span className='text-right text-sm not-italic font-semibold text-primary-red'>
                Pay now
              </span>
            </button>
          }
        />
      ) : null}

      <Popup
        handleClose={handleCloseQualifierNotActivePopup}
        open={openQualifierNotActivePopup}
        setOpen={setOpenQualifierNotActivePopup}
        title='Qualifier is not activated'
        description='Complete Applicant, Personal, Address and Work & Income details to activate'
      />
    </>
  );
}


