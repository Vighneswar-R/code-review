import { useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { create } from '@lottiefiles/lottie-interactivity';
import InfoIcon from '../../../../assets/icons/info.svg';
import DynamicDrawer from '../../../../components/SwipeableDrawer/DynamicDrawer';
import { IconClose } from '../../../../assets/icons';
import loading from '../../../../assets/icons/loading.svg';
import ErrorTost from '../../../../components/ToastMessage/ErrorTost';
import LoaderDynamicText from '../../../../components/Loader/LoaderDynamicText';
import { Backdrop } from '@mui/material';
import { CircularProgress } from '@mui/material';
import {
  checkBre99,
  checkCibil,
  checkCrif,
  checkDedupe,
  verifyDL,
  verifyGST,
  verifyPFUAN,
  verifyPan,
  verifyVoterID,
  checkBre101,
  editFieldsById,
  getApplicantById,
  crifErrorhandle,
  getDashboardLeadById,
  getApplicantMissingData,
  checkLntBre101,
  checkCrifHighmark,
  updateBureauType
} from '../../../../global';
import { Button } from '../../../../components';
import SpeedoMeterAnimation from '../../../../components/speedometer';
import { LeadContext } from '../../../../context/LeadContextProvider';
import Topbar from '../../../../components/Topbar';
import { useLocation } from 'react-router';
import { AuthContext } from '../../../../context/AuthContextProvider';
import { Box, Typography } from '@mui/material';


const Qualifier = () => {
  const {
    activeIndex,
    values,
    setFieldValue,
    addApplicant,
    setCurrentStepIndex,
    updateCompleteFormProgress,
    updateTempQualifier,
    updateParams,
    activeLNT
  } = useContext(LeadContext);

  const { token } = useContext(AuthContext);

  const SpeedoMeterAnimationRef = useRef(null);

  const [progress, setProgress] = useState(0);

  const[errorToastMessage,setErrorToastMessage] = useState('');

  const [validPan, setValidPan] = useState(false);
  const [panErrors, setPanErrors] = useState([]);

  const[missingHeader,setMissingHeader] = useState(false)

  const[dynamicLoader,setDynamicLoader] = useState(false)

  const [PAN, setPAN] = useState({
    res: false,
    loader: false,
    ran: false,
  });
  const [DL, setDL] = useState({
    res: false,
    loader: false,
    ran: false,
  });
  const [voterID, setVoterID] = useState({
    res: false,
    loader: false,
    ran: false,
  });
  const [pfUAN, setPfUAN] = useState({
    res: false,
    loader: false,
    ran: false,
  });
  const [GST, setGST] = useState({
    res: false,
    loader: false,
    ran: false,
  });
  const [dedupe, setDedupe] = useState({
    res: false,
    loader: false,
    ran: false,
  });
  const [bre99, setBre99] = useState({
    res: false,
    loader: false,
    ran: false,
  });
  const [bureau, setBureau] = useState({
    res: false,
    loader: false,
    ran: false,
  });
  const [bre101, setBre101] = useState({
    res: false,
    red: false,
    amber: false,
    green: false,
  });
  const [finalApi, setFinalApi] = useState([]);

  const[paramsVerified ,setParamsVerified] = useState(null);

  const location = useLocation();

  const navigate = useNavigate();

  const initialRender = useRef(true);

  const[ranPan,setRanPan] = useState(false);

  const[bureauError,setBureauError] = useState("");

  const[bureauFlag,setbureauFlag] = useState(false);

  const[apiError,setApiError] = useState(false);

  const[bureauSuccess,setbureauSuccess] = useState(false)

  const ranRef = useRef(false);

  const[ltBre,setltBre] = useState(values?.applicants?.[activeIndex]?.applicant_details?.lt_bre_101_response?.body?.['L&T_API'])

  const[bre_loader,setbre_loader] = useState(false);


  
  
  const handlePopState = (event) => {

    if (!initialRender.current) {
      console.log('Back button clicked');
      // Handle back button logic here
      // For example, navigate to another route
      // navigate('/some-other-route');
  }
  initialRender.current = false;
   
};


useEffect(()=>{     // update the tempQualifier on initial mount of qualifier component


updateTempQualifier(true);


},[]);




  useEffect(()=> {    // adding event listener to track if user clicked back button of browser

    window.addEventListener('popstate', handlePopState);

  return () => {
    window.removeEventListener('popstate',handlePopState);
  };


  },[])



  // seperate for PAN (IN case user comes from Drawer) 


  const runPan = async() => {

    const res = await getApplicantById(values?.applicants?.[activeIndex]?.applicant_details?.id, {
      headers: {
        Authorization: token,
      },
    });

    const bre_101_response = res.bre_101_response;

    if (bre_101_response && bre_101_response?.errorType!='TypeError') {
      setPAN((prev) => ({
        ...prev,
        ran: true,
        res: bre_101_response?.body?.Display?.PAN_status,
      }));

      setRanPan(true);

      return;
    }



    // FOR CIBIL CASES ** Check if mandatory fields are missing if yes send back without executing anything ** 28-04

    setDynamicLoader(true)

    try{

    const response_fields = await getApplicantMissingData(values?.applicants?.[activeIndex]?.applicant_details?.id,{
      headers: {
        Authorization: token,
      },
    });

    // if success will move forward to other process as usual flow..**

    setDynamicLoader(false);

    setRanPan(true);

    return;

    }

    catch(err){

      // if error check for missing fields;

      setDynamicLoader(false)

      console.log("ERROR FIELDS DETECTED",err.response.data.fields);

      if(err.response.data.fields && err.response.data.personal && err.response.data.address){

      setValidPan(true)

      setMissingHeader(true)

      setPanErrors(err.response.data.fields);

      // update context value based on the missing fields


      const value_copy = structuredClone(values);

      value_copy.applicants[activeIndex].personal_details = err.response.data.personal;

      value_copy.applicants[activeIndex].address_detail = err.response.data.address;

      setFieldValue(`applicants[${activeIndex}]`,value_copy.applicants[activeIndex])

      }
      return;

    }


    // if BRE IS NOT DONE ** check condition for PAN


    // if (
    //   (values.applicants[activeIndex]?.personal_details.id_type === 'PAN' ||
    //   (values.applicants[activeIndex]?.work_income_detail.pan_number &&
    //     values.applicants[activeIndex]?.work_income_detail.income_proof !== 'Form 60')) && (!values.applicants[activeIndex]?.personal_details?.is_pan_verified || values.applicants[activeIndex]?.personal_details?.is_pan_verified == 'false' || values.applicants[activeIndex]?.personal_details?.is_pan_verified == '')
    // ) {

    //   if(ranRef.current == true) return;

    //   ranRef.current = true;


    //   // if EKYC VERIFIED RETURN AND PROCEED WITH BRE

    //   if(values.applicants[activeIndex]?.applicant_details?.is_ekyc_verified == true) {
    //     setRanPan(true)   // ready to run rest of the api's

    //     return;
    //   }


    //   setPAN((prev) => ({
    //     ...prev,
    //     loader: true,
    //     ran: true,
    //   }));

    //   try{
        
    //    const pan_res = await verifyPan(
    //     values?.applicants?.[activeIndex]?.applicant_details?.id,
    //     { type: 'id' },
    //     {
    //       headers: {
    //         Authorization: token,
    //       },
    //     },
    //   )

    //   console.log("I RES",pan_res)


    //   if(!pan_res) throw new Error("FAILED")


    //   if(pan_res && pan_res?.mismatches && pan_res?.mismatches?.length>0){

    //     setValidPan(true);
    //     setPanErrors(pan_res?.mismatches);

    //     return;
    //   }

    

    //   setPAN((prev) => ({
    //     ...prev,
    //     loader: false,
    //     ran: true,
    //     panValue:true
    //   }));

    //   setRanPan(true)   // ready to run rest of the api's





    // }

    // catch(err){

    //   setErrorToastMessage('Something Went Wrong Please Retry')
    //   console.log("ERROR HERE QUAL",err)

    //   return;

    // }

    // }

    // else {

    //   setRanPan(true)
    // }

    
  

  }


  useEffect(()=> {

    runPan();     // default run ** conditions inside


  },[])

  useEffect(() => {


// const verifyParamsUpdate = async() => {

//   let personalDetails =  updateParams(values?.applicants[activeIndex]?.personal_details?.id,'personal',values.applicants[activeIndex].personal_details.extra_params)

// let addressDetails =  updateParams(values?.applicants[activeIndex]?.address_detail?.id,'address',values.applicants[activeIndex].address_detail.extra_params)

// let work_income_details = updateParams(values?.applicants?.[activeIndex]?.work_income_detail?.id,'work-income',values.applicants[activeIndex].work_income_detail.extra_params)

// let applicant_details = updateParams(values?.applicants?.[activeIndex]?.applicant_details?.id,'applicant',values?.applicants?.[activeIndex]?.applicant_details?.extra_params)


// const[personal,address,work_income,applicant] = await Promise.all([personalDetails,addressDetails,work_income_details,applicant_details])

// }

// verifyParamsUpdate()    // will ensure params are updated in the db properly before qualifier runs

      async function breOne() {
        const res = await getApplicantById(values?.applicants?.[activeIndex]?.applicant_details?.id, {
          headers: {
            Authorization: token,
          },
        });
  
        const bre_101_response = res.bre_101_response;
  
        console.log(bre_101_response)
  
  
        if (bre_101_response && bre_101_response?.errorType!='TypeError') {
          setProgress(res.extra_params.qualifier_api_progress);
          setFinalApi(res.extra_params.qualifier_api_progress);
  
          setDL((prev) => ({
            ...prev,
            ran: true,
            res: bre_101_response?.body?.Display?.DL_Status,
          }));
  
          setVoterID((prev) => ({
            ...prev,
            ran: true,
            res: bre_101_response?.body?.Display?.Voter_Status,
          }));
  
          setPfUAN((prev) => ({
            ...prev,
            ran: true,
            res: bre_101_response?.body?.Display?.UAN_Status,
          }));
  
          setGST((prev) => ({
            ...prev,
            ran: true,
            res: bre_101_response?.body?.Display?.GST_Status,
          }));
  
          setPAN((prev) => ({
            ...prev,
            ran: true,
            res: bre_101_response?.body?.Display?.PAN_status,
          }));
  
          setDedupe((prev) => ({
            ...prev,
            ran: true,
            res: bre_101_response?.body?.Display?.Dedupe_Status,
          }));
  
          setBre99((prev) => ({
            ...prev,
            ran: true,
            res: bre_101_response?.body?.Display?.Bre99_Status,
          }));
  
          setBureau((prev) => ({
            ...prev,
            ran: true,
            res: bre_101_response?.body?.Display?.Bureau_Status,
          }));
  
          if (bre_101_response?.body?.Display?.red_amber_green === 'Red') {
            setBre101((prev) => ({ ...prev, red: true, res: true }));
          }
          if (bre_101_response?.body?.Display?.red_amber_green === 'Amber') {
            setBre101((prev) => ({ ...prev, amber: true, res: true }));
          }
          if (bre_101_response?.body?.Display?.red_amber_green === 'Green') {
            setBre101((prev) => ({ ...prev, green: true, res: true }));
          }
  

          // additionally set qualifier to true if false as BRE already validated;

          let existing_params = values?.applicants?.applicant_details?.extra_params;

          existing_params.qualifer = true;

          setFieldValue(`applicants[${activeIndex}].applicant_details.extra_params`, existing_params);    

          return;
        }
  
        if (values.applicants[activeIndex]?.work_income_detail.income_proof === 'Form 60') {
          setFieldValue(`applicants[${activeIndex}].work_income_detail.pan_number`, '');
  
          editFieldsById(
            values?.applicants?.[activeIndex]?.work_income_detail?.id,
            'work-income',
            {
              pan_number: '',
            },
            {
              headers: {
                Authorization: token,
              },
            },
          );
        }
  
        let final_api = [];


        let selectionObj = {};


        // ** ONLY SPECIFIC FOR EKYC CASES - IF PAN IS UPDATED IN WORK INCOME AND EKYC IS VERIFIED ** NORMAL FLOW - VERIFY PAN ALONG WITH OTHER APIS

        if (
          (values.applicants[activeIndex]?.personal_details.id_type === 'PAN' ||
          (values.applicants[activeIndex]?.work_income_detail.pan_number &&
            values.applicants[activeIndex]?.work_income_detail.income_proof !== 'Form 60'))
        ) {
          setPAN((prev) => ({
            ...prev,
            loader: true,
            ran: true,
          }));
  
          final_api.push(
            verifyPan(
              values?.applicants?.[activeIndex]?.applicant_details?.id,
              { type: 'id' },
              {
                headers: {
                  Authorization: token,
                },
              },
            ),
          );

          selectionObj.pan = true;

        }

        //---------------------------------------------------------------------------
  
       
  
        if (values.applicants[activeIndex]?.personal_details.id_type === 'Driving license') {
          setDL((prev) => ({
            ...prev,
            loader: true,
            ran: true,
          }));
  
          final_api.push(
            verifyDL(
              values?.applicants?.[activeIndex]?.applicant_details?.id,
              { type: 'id' },
              {
                headers: {
                  Authorization: token,
                },
              },
            ),
          );

          selectionObj.dl = true;
        } else if (values.applicants[activeIndex]?.personal_details.id_type === 'Voter ID') {
          setVoterID((prev) => ({
            ...prev,
            loader: true,
            ran: true,
          }));
  
          final_api.push(
            verifyVoterID(
              values?.applicants?.[activeIndex]?.applicant_details?.id,
              { type: 'id' },
              {
                headers: {
                  Authorization: token,
                },
              },
            ),
          );

          selectionObj.voter = true;
        }
  
        if (!values.applicants[activeIndex]?.personal_details?.extra_params?.same_as_id_type) {
          if (
            values.applicants[activeIndex]?.personal_details.selected_address_proof ===
            'Driving license'
          ) {
            setDL((prev) => ({
              ...prev,
              loader: true,
              ran: true,
            }));
  
            final_api.push(
              verifyDL(
                values?.applicants?.[activeIndex]?.applicant_details?.id,
                { type: 'address' },
                {
                  headers: {
                    Authorization: token,
                  },
                },
              ),
            );

            selectionObj.dl = true;
          } else if (
            values.applicants[activeIndex]?.personal_details.selected_address_proof === 'Voter ID'
          ) {
            setVoterID((prev) => ({
              ...prev,
              loader: true,
              ran: true,
            }));
  
            final_api.push(
              verifyVoterID(
                values?.applicants?.[activeIndex]?.applicant_details?.id,
                { type: 'address' },
                {
                  headers: {
                    Authorization: token,
                  },
                },
              ),
            );

            selectionObj.voter = true;
          }
        }
  
           // ensure pf_uan is a non-empty string (not null/undefined/empty)
        const pfUanValue = values.applicants[activeIndex]?.work_income_detail?.pf_uan;
        if (pfUanValue !== null && pfUanValue !== undefined && String(pfUanValue).trim() !== '') {
          setPfUAN((prev) => ({ ...prev, loader: true, ran: true }));
  
          final_api.push(
            verifyPFUAN(values?.applicants?.[activeIndex]?.applicant_details?.id, {
              headers: {
                Authorization: token,
              },
            }),
          );

          selectionObj.uan = true;
        } else if (values.applicants[activeIndex]?.work_income_detail.gst_number) {
          // ensure gst_number is a non-empty string (not null/undefined/empty)
          const gstNum = values.applicants[activeIndex]?.work_income_detail?.gst_number;
          if (gstNum !== null && gstNum !== undefined && String(gstNum).trim() !== '') {
          setGST((prev) => ({ ...prev, loader: true, ran: true }));
  
          final_api.push(
            verifyGST(values?.applicants?.[activeIndex]?.applicant_details?.id, {
              headers: {
                Authorization: token,
              },
            }),
          );

          selectionObj.gst = true;
          }
        }
  
  
        setDedupe((prev) => ({ ...prev, loader: true, ran: true }));
        final_api.push(
          checkDedupe(values?.applicants?.[activeIndex]?.applicant_details?.id, {
            headers: {
              Authorization: token,
            },
          }),
        );
  
        try {
          let response = null;
  
          setProgress(final_api.length);
          setFinalApi(final_api.length + 2);
          response = await Promise.allSettled([...final_api]);


          console.log("FINAL API RES",response);
  
          setDedupe((prev) => ({ ...prev, loader: false }));
          const filtered_dedupe_res = response.find((res) => {
            return res.value.status == 200;
          });
  
          if (!filtered_dedupe_res) {
            setDedupe((prev) => ({ ...prev, loader: false, res: 'Error' }));
          } else {
            setDedupe((prev) => ({ ...prev, loader: false, res: 'Valid' }));
          }
        } catch (err) {
          setDedupe((prev) => ({ ...prev, loader: false, res: 'Error' }));
          console.log('error occured in dedupe',err);
        }
  
        let callCibilOrCrif = '';
  
        try {
          setBre99((prev) => ({ ...prev, loader: true, ran: true }));
          setProgress(final_api.length + 1);
  
          const bre99_res = await checkBre99(
            values?.applicants?.[activeIndex]?.applicant_details?.id,
            {
              headers: {
                Authorization: token,
              },
            },
          );
          if (bre99_res.bre_99_response.statusCode == 200) {
            setBre99((prev) => ({ ...prev, loader: false, res: 'Valid' }));
            const bre99body = bre99_res.bre_99_response.body;
           // callCibilOrCrif = bre99body.find((data) => data.Rule_Name === 'Bureau_Type');
           callCibilOrCrif = bre99body.bureau_selection;

           // ** CONDITIONS APPLIED HERE

           const response_body = bre99_res?.bre_99_response?.body;

           console.log("BRE RES 99",response_body)

           if(response_body && response_body?.error_flag == true){

            if(selectionObj.dl){
              
          setDL((prev) => ({
            ...prev,
            loader: false,
            res: response_body?.dl_valid,
          }));
            }

            if(selectionObj.voter){
              setVoterID((prev) => ({
                ...prev,
                loader: false,
                res: response_body?.voter_valid,
              }));
            }

            if(selectionObj.pan){
              setPAN((prev) => ({
                ...prev,
                loader: false,
                res: response_body?.pan_valid,
              }));
            }

            if(selectionObj?.uan){
              setPfUAN((prev) => ({ ...prev, loader: false, res: response_body?.uan_valid }));

            }

            if(selectionObj?.gst){
              setGST((prev) => ({ ...prev, loader: false, res: response_body?.gst_valid }));

            }

            setBureauError(response_body?.error_msg);

            if(response_body?.error_flag == true) {   
              setbureauFlag(true);

              updateTempQualifier(false)

              return;
            }

           }
          }

          else {
            setBureauError("Error in Bureau Please retry");
            setApiError(true);
            setbureauFlag(true);
            updateTempQualifier(false)
            return;
          }
        } catch (err) {
          console.log(err);
          setBre99((prev) => ({ ...prev, loader: false, res: 'Error' }));
          setBureauError("Error in Bureau Please retry");
          setApiError(true);
          setbureauFlag(true);
          updateTempQualifier(false)
          return;
        }
        
        
        setBureau((prev) => ({ ...prev, loader: true, ran: true }));
        setProgress(final_api.length + 2);
  //debugger
        if (callCibilOrCrif === 'CIBIL') {   // test change **
          try {
            const cibil_res = await checkCibil(
              values?.applicants?.[activeIndex]?.applicant_details?.id,
      {
        headers: {
          Authorization: token,
        },
      },
    );
    if (cibil_res.status === 200) {
      setBureau((prev) => ({
        ...prev,
        loader: false,
        res: 'Valid',
      }));
    }
  } catch (err) {
    console.log(err);
    setBureau((prev) => ({
      ...prev,
      loader: false,
      res: 'Error',
    }));
  }
} else if (callCibilOrCrif === 'HIGHMARK') {
  try {
    const crif_res = await checkCrif(
      values?.applicants?.[activeIndex]?.applicant_details?.id,
      {
        headers: {
          Authorization: token,
        },
      },
    );

    if (crif_res?.data?.CRIF_response?.status === 200) {
      setBureau((prev) => ({
        ...prev,
        loader: false,
        res: 'Valid',
      }));
    } else if (crifErrorhandle) {
      try {
        const cibil_res = await checkCibil(
          values?.applicants?.[activeIndex]?.applicant_details?.id,
          {
            headers: {
              Authorization: token,
            },
          },
        );
        if (cibil_res.status === 200) {
          setBureau((prev) => ({
            ...prev,
            loader: false,
            res: 'Valid',
          }));
        }
      } catch (err) {
        console.log(err);
        setBureau((prev) => ({
          ...prev,
          loader: false,
          res: 'Error',
        }));
      }
    }
  } catch (err) {
    if (crifErrorhandle) {
      try {
        const cibil_res = await checkCibil(
          values?.applicants?.[activeIndex]?.applicant_details?.id,
          {
            headers: {
              Authorization: token,
            },
          },
        );
        if (cibil_res.status === 200) {
          setBureau((prev) => ({
            ...prev,
            loader: false,
            res: 'Valid',
          }));
        } else {
          setBureau((prev) => ({
            ...prev,
            loader: false,
            res: 'Error',
          }));
        }
      } catch (err) {
        console.log(err);
        setBureau((prev) => ({
          ...prev,
          loader: false,
          res: 'Error',
        }));
      }
    } else {
      console.log(err);
      setBureau((prev) => ({
        ...prev,
        loader: false,
        res: 'Error',
      }));
    }
  }
} else if (callCibilOrCrif === 'HIGHMARK-S') {
  try {
    const highmarkRes = await checkCrifHighmark(
      values?.applicants?.[activeIndex]?.applicant_details?.id,
      {
        headers: {
          Authorization: token,
        },
      },
    );
    console.log("🚀 ~ breOne ~ highmarkRes:", highmarkRes
    )
    if(highmarkRes?.data?.error?.action==="RUN_CRIF"){
      try {
      const crif_res = await checkCrif(
      values?.applicants?.[activeIndex]?.applicant_details?.id,
      {
        headers: {
          Authorization: token,
        },
      },
    )
    if (crif_res?.data?.CRIF_response?.status === 200) {
      setBureau((prev) => ({
        ...prev,
        loader: false,
        res: 'Valid',
      }));
    }
    } catch (error) {
       console.log("🚀 ~ breOne ~ error:", error)
       setBureau((prev) => ({
      ...prev,
      loader: false,
      res: 'Error',
    }));
    }
    setBureau((prev) => ({
      ...prev,
      loader: false,
      res: 'Error',
    })); 
      

    }
    if (highmarkRes?.status === 200) {
      setBureau((prev) => ({
        ...prev,
        loader: false,
        res: 'Valid',
      }));
    } else {
      try {
      const crif_res = await checkCrif(
      values?.applicants?.[activeIndex]?.applicant_details?.id,
      {
        headers: {
          Authorization: token,
        },
      },
    )
    if (crif_res?.data?.CRIF_response?.status === 200) {
      setBureau((prev) => ({
        ...prev,
        loader: false,
        res: 'Valid',
      }));
    }
    } catch (error) {
       console.log("🚀 ~ breOne ~ error:", error)
       setBureau((prev) => ({
      ...prev,
      loader: false,
      res: 'Error',
    }));
    }
  }
  } catch (err) {
    try {
      const updateBureau = await updateBureauType(
        values?.applicants?.[activeIndex]?.applicant_details?.id,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      const crif_res = await checkCrif(
      values?.applicants?.[activeIndex]?.applicant_details?.id,
      {
        headers: {
          Authorization: token,
        },
      },
    )
    if (crif_res?.data?.CRIF_response?.status === 200) {
      setBureau((prev) => ({
        ...prev,
        loader: false,
        res: 'Valid',
      }));
    }
    } catch (error) {
       console.log("🚀 ~ breOne ~ error:", error)
       setBureau((prev) => ({
      ...prev,
      loader: false,
      res: 'Error',
    }));
    }
    setBureau((prev) => ({
      ...prev,
      loader: false,
      res: 'Error',
    }));
  }
}

        try {

          setbre_loader(true);
          const bre_res = await checkBre101(
            values?.applicants?.[activeIndex]?.applicant_details?.id,
            {
              headers: {
                Authorization: token,
              },
            },
          );
  
          if (bre_res.bre_101_response.statusCode != 200) {
            setbre_loader(false);
            return;
          }

          setbureauSuccess(true);


          // ahead of this need to be cleared as slow network could cause stale data or lock issue **

  
          /// ----------------------------------------------------------
          let new_data = structuredClone(values);
  
          const extra_parmas = new_data.applicants[activeIndex].applicant_details.extra_params;
          const edited_extra_params = {
            ...extra_parmas,
            qualifier: true,
            qualifier_api_progress: final_api.length + 2,
            previous_id_number: values?.applicants?.[activeIndex]?.personal_details?.id_number,
            previous_address_proof_number:
              values?.applicants?.[activeIndex]?.personal_details?.address_proof_number,
            previous_pf_uan: values?.applicants?.[activeIndex]?.work_income_detail?.pf_uan,
            previous_gst_number: values?.applicants?.[activeIndex]?.work_income_detail?.gst_number,
            PAN_status: bre_res.bre_101_response.body.Display.PAN_status,
            DL_Status: bre_res.bre_101_response.body.Display.DL_Status,
            Voter_Status: bre_res.bre_101_response.body.Display.Voter_Status,
            UAN_Status: bre_res.bre_101_response.body.Display.UAN_Status,
            GST_Status: bre_res.bre_101_response.body.Display.GST_Status,
          };
  
          // await editFieldsById(         // response or rules updation after qualifier ran   **TESTING ** UNCOMMENT
          //   values?.applicants?.[activeIndex]?.applicant_details?.id,
          //   'applicant',
          //   {
          //     bre_101_response: bre_res.bre_101_response,
          //     extra_params: edited_extra_params,
          //   },
          //   {
          //     headers: {
          //       Authorization: token,
          //     },
          //   },
          // );
  
          // setFieldValue(
          //   `applicants[${activeIndex}].applicant_details.extra_params`,
          //   edited_extra_params,
          // );

          new_data.applicants[activeIndex].applicant_details.extra_params = edited_extra_params;

          new_data.applicants[activeIndex].applicant_details.bre_101_response = bre_res.bre_101_response;
  
          // setFieldValue(
          //   `applicants[${activeIndex}].applicant_details.bre_101_response`,
          //   bre_res.bre_101_response,
          // );
  
          if (values?.applicants[activeIndex]?.personal_details?.extra_params.same_as_id_type) {
            if (
              values?.applicants[activeIndex]?.applicant_details?.is_ekyc_verified &&
              values?.applicants[activeIndex]?.personal_details?.id_type === 'AADHAR'
            ) {
              const aadharPdf = values?.applicants[
                activeIndex
              ]?.applicant_details?.document_meta?.id_proof_photos?.find((data) => {
                if (data?.document_type === 'EKYC') {
                  return data;
                }
              });


              // new_data.applicants[activeIndex].applicant_details.bre_101_response = bre_res.bre_101_response;
  
  
              const document_meta = new_data?.applicants[activeIndex]?.applicant_details?.document_meta;
  
              if (document_meta.hasOwnProperty('address_proof_photos')) {
                document_meta['address_proof_photos'].push(aadharPdf);
              } else {
                document_meta['address_proof_photos'] = [aadharPdf];
              }
  
              await editFieldsById( 
                values?.applicants[activeIndex]?.applicant_details?.id,
                'applicant',
                {
                  document_meta,
                  extra_params: {
                    ...edited_extra_params,
                    upload_required_fields_status: {
                      ...values?.applicants?.[activeIndex]?.applicant_details?.extra_params
                        .upload_required_fields_status,
                      address_proof: true,
                    },
                  },
                },
                {
                  headers: {
                    Authorization: token,
                  },
                },
              );
  
              new_data.applicants[activeIndex].applicant_details.document_meta = document_meta;

              // setFieldValue(
              //   `applicants.[${activeIndex}].applicant_details.document_meta`,
              //   document_meta,
              // );
              // setFieldValue(
              //   `applicants.[${activeIndex}].applicant_details.extra_params.upload_required_fields_status.address_proof`,
              //   true,
              // );

                new_data.applicants[activeIndex].applicant_details.extra_params.upload_required_fields_status.address_proof = true;

            }
  
            if (
              values?.applicants[activeIndex]?.applicant_details?.id_type_ocr_status &&
              values?.applicants[activeIndex]?.personal_details?.id_type !== 'AADHAR'
            ) {
              if (
                values?.applicants[activeIndex]?.applicant_details?.document_meta?.id_proof_photos
                  .length
              ) {
                const idProofPhotos =
                  new_data?.applicants[activeIndex]?.applicant_details?.document_meta?.id_proof_photos;
  
                const document_meta =
                  new_data?.applicants[activeIndex]?.applicant_details?.document_meta;
  
                if (document_meta.hasOwnProperty('address_proof_photos')) {
                  document_meta['address_proof_photos'].concat(idProofPhotos);
                } else {
                  document_meta['address_proof_photos'] = idProofPhotos;
                }
  
                await editFieldsById(
                  values?.applicants[activeIndex]?.applicant_details?.id,
                  'applicant',
                  {
                    document_meta,
                    extra_params: {
                      ...edited_extra_params,
                      upload_required_fields_status: {
                        ...values?.applicants?.[activeIndex]?.applicant_details?.extra_params
                          .upload_required_fields_status,
                        address_proof: true,
                      },
                    },
                  },
                  {
                    headers: {
                      Authorization: token,
                    },
                  },
                );

                new_data.applicants[activeIndex].applicant_details.document_meta = document_meta;

  
                // setFieldValue(
                //   `applicants.[${activeIndex}].applicant_details.document_meta`,
                //   document_meta,
                // );

                new_data.applicants[activeIndex].applicant_details.document_meta = document_meta;

                new_data.applicants[activeIndex].applicant_details.extra_params.upload_required_fields_status.address_proof = true;


                // setFieldValue(
                //   `applicants.[${activeIndex}].applicant_details.extra_params.upload_required_fields_status.address_proof`,
                //   true,
                // );
              }
            }
          }


             setFieldValue(
                  `applicants.[${activeIndex}].applicant_details`,
                  new_data?.applicants?.[activeIndex]?.applicant_details,
                );
  
          setDL((prev) => ({
            ...prev,
            loader: false,
            res: bre_res.bre_101_response.body.Display.DL_Status,
          }));
  
          setVoterID((prev) => ({
            ...prev,
            loader: false,
            res: bre_res.bre_101_response.body.Display.Voter_Status,
          }));
  
          setPfUAN((prev) => ({
            ...prev,
            loader: false,
            res: bre_res.bre_101_response.body.Display.UAN_Status,
          }));
  
          setGST((prev) => ({
            ...prev,
            loader: false,
            res: bre_res.bre_101_response.body.Display.GST_Status,
          }));
  
          setPAN((prev) => ({
            ...prev,
            loader: false,
            res: bre_res.bre_101_response.body.Display.PAN_status,
          }));
  
          if (bre_res.bre_101_response.body.Display.red_amber_green === 'Red') {
            setBre101((prev) => ({ ...prev, red: true, res: true }));
          }
          if (bre_res.bre_101_response.body.Display.red_amber_green === 'Amber') {
            setBre101((prev) => ({ ...prev, amber: true, res: true }));
          }
          if (bre_res.bre_101_response.body.Display.red_amber_green === 'Green') {
            setBre101((prev) => ({ ...prev, green: true, res: true }));
          }


          updateTempQualifier(false);   // reset temp qualifier based on the current applicant


        } catch (err) {
          setbre_loader(false);
          console.log(err);
          setDL((prev) => ({
            ...prev,
            loader: false,
          }));
          setVoterID((prev) => ({
            ...prev,
            loader: false,
          }));
          setPfUAN((prev) => ({
            ...prev,
            loader: false,
          }));
          setGST((prev) => ({
            ...prev,
            loader: false,
          }));
          setPAN((prev) => ({
            ...prev,
            loader: false,
          }));
          setBre101((prev) => ({ ...prev, res: true }));

        }


        // Run LNT Bre 101 as well new change

        try{

        const lt_bre = await checkLntBre101(values?.applicants[activeIndex].applicant_details.id, {
          headers: {
            Authorization: token,
          },
        });

        setltBre(lt_bre?.bre_101_response?.body?.['L&T_API'])
        
        setFieldValue(
          `applicants.[${activeIndex}].applicant_details.lt_bre_101_response`,
          lt_bre?.bre_101_response,
        );

        setbre_loader(false);


      }

      catch(err){
        console.log("ERROR IN LNT BRE QUALIFIER",err);
        setbre_loader(false);
      }

      // Fetch latest applicant details at the end
      try {
        const latestApplicantDetails = await getApplicantById(values?.applicants?.[activeIndex]?.applicant_details?.id, {
          headers: {
            Authorization: token,
          },
        });
        
        console.log("Latest applicant details fetched:", latestApplicantDetails);
        
        // Update the context with the latest details if needed
        setFieldValue(
          `applicants[${activeIndex}].applicant_details`,
          latestApplicantDetails,
        );
      } catch (err) {
        console.log("ERROR FETCHING LATEST APPLICANT DETAILS:", err);
      }
      }

      updateCompleteFormProgress();

      if(ranPan == true){
        breOne();
      }
    

  }, [ranPan]);

  function checkELigibilty() {
    if (bre101.red) {
      return [1, 3];
    }
    if (bre101.amber) {
      return [1, 42.5];
    }
    if (bre101.green) {
      return [1, 30];
    } else {
      [];
    }
  }

  // useEffect(() => {
  //   const syncAddressProofPhotos = async () => {
  //     if (values?.applicants[activeIndex]?.personal_details?.extra_params.same_as_id_type) {
  //       if (
  //         values?.applicants[activeIndex]?.applicant_details?.is_ekyc_verified &&
  //         values?.applicants[activeIndex]?.personal_details?.id_type === 'AADHAR'
  //       ) {
  //         const addressPdfExists = values?.applicants[
  //           activeIndex
  //         ]?.applicant_details?.document_meta.some((data) => {
  //           data.document_type === 'EKYC';
  //         });
  //         if (!addressPdfExists) {
  //           const aadharPdf = values?.applicants[
  //             activeIndex
  //           ]?.applicant_details?.document_meta?.id_proof_photos.find((data) => {
  //             if (data?.document_type === 'EKYC') {
  //               return data;
  //             }
  //           });
  //           const document_meta = values?.applicants[activeIndex]?.applicant_details?.document_meta;
  //           if (document_meta.hasOwnProperty('address_proof_photos')) {
  //             document_meta['address_proof_photos'].push(aadharPdf);
  //           } else {
  //             document_meta['address_proof_photos'] = [aadharPdf];
  //           }
  //           await editFieldsById(
  //             values?.applicants[activeIndex]?.applicant_details?.id,
  //             'applicant',
  //             {
  //               document_meta,
  //               extra_params: {
  //                 ...values?.applicants?.[activeIndex]?.applicant_details?.extra_params,
  //                 upload_required_fields_status: {
  //                   ...values?.applicants?.[activeIndex]?.applicant_details?.extra_params
  //                     .upload_required_fields_status,
  //                   address_proof: true,
  //                 },
  //               },
  //             },
  //             {
  //               headers: {
  //                 Authorization: token,
  //               },
  //             },
  //           );
  //         }
  //       }
  //     }
  //   };
  //   syncAddressProofPhotos();
  // }, []);

  useEffect(() => {
    if (SpeedoMeterAnimationRef.current && bre101.res);
    create({
      player: SpeedoMeterAnimationRef.current,
      mode: 'chain',
      actions: [
        {
          state: 'autoplay',
          frames: bre101.res && checkELigibilty(),
          repeat: 1,
        },
      ],
    });
  }, [bre101]);

  return (
    <>
        <ErrorTost
                  message={errorToastMessage}
                  setMessage={setErrorToastMessage}
                />
                <ModalComponent open = {bre_loader}/>
      {values?.applicants[activeIndex]?.applicant_details?.is_primary ? (
        <Topbar title='Qualifier' id={values?.lead?.id} showClose={!bre101.res ? false : true} />
      ) : (
        <Topbar
          title='Qualifier'
          id={values?.lead?.id}
          showClose={false}
          showBack={!bre101.res ? false : true}
          coApplicant={true}
          coApplicantName={values?.applicants[activeIndex]?.applicant_details?.first_name}
        />
      )}

      {dynamicLoader&&     <div className='absolute flex items-center w-full dashBoardLoaderHeight bg-white'>
                      <LoaderDynamicText text='Loading...' textColor='black' height='60%' />
                    </div>}

      <div className='p-4 overflow-auto pb-[60px]' style={{ height: 'calc(100vh - 211px)' }}>
        <div className='flex items-start gap-2'>
          <img src={InfoIcon} className='w-4 h-4' alt='info-icon' />
          <p className='text-xs not-italic font-normal text-dark-grey'>
            The qualifier provides information regarding the status of all the verification and lead
            eligibility.
          </p>
        </div>

        <div className='mt-4'>
          <p className='text-xs text-primary-black font-normal truncate'>
            Applicant name:
            {` ${values.applicants?.[activeIndex]?.applicant_details?.first_name} ${values.applicants?.[activeIndex]?.applicant_details?.middle_name} ${values.applicants?.[activeIndex]?.applicant_details?.last_name}`}
          </p>
          <div className='flex justify-between text-primary-black font-medium'>
            {!bre101.res ? <h3>Verification in progress</h3> : <h3>Verification completed</h3>}
            <h3>
              {progress}/{finalApi}
            </h3>
          </div>

          <div className='flex justify-center mt-3'>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transitionDuration: 2 }}
                exit={{ opacity: 0 }}
              >
                <SpeedoMeterAnimation
                  id='speedo-meter-animation'
                  className='w-[152px]'
                  loop
                  play
                  ref={SpeedoMeterAnimationRef}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className='mt-4 mx-auto flex flex-col gap-2 items-center'>

{bureauFlag == true && <DocumentValidationError bureauError = {bureauError} ApiError = {apiError}/>
}

{bureauSuccess == true && <DocumentStatus/>}

</div>
        <div className='mt-4 flex flex-col gap-2'>
          {(values.applicants[activeIndex]?.personal_details.id_type === 'PAN' ||
            values.applicants[activeIndex]?.personal_details.selected_address_proof === 'PAN' ||
            values.applicants[activeIndex]?.work_income_detail.pan_number) && (
            <div className='flex justify-between items-center rounded-lg border-stroke border-x border-y px-2 py-1.5'>
              <div className='flex items-center gap-1'>
                {/* {!PAN.ran ? (
                  <svg
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M16.4 15.2C17.8833 17.1777 16.4721 20 14 20L10 20C7.52786 20 6.11672 17.1777 7.6 15.2L8.65 13.8C9.45 12.7333 9.45 11.2667 8.65 10.2L7.6 8.8C6.11672 6.82229 7.52786 4 10 4L14 4C16.4721 4 17.8833 6.82229 16.4 8.8L15.35 10.2C14.55 11.2667 14.55 12.7333 15.35 13.8L16.4 15.2Z'
                      stroke='#EC7739'
                      strokeWidth='1.5'
                    />
                  </svg>
                ) : (
                  <svg
                    width='24'
                    height='13'
                    viewBox='0 0 18 13'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M17 1L6 12L1 7'
                      stroke='#147257'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                )} */}

                <p className='text-sm text-primary-black'>PAN card</p>
              </div>
              {PAN.loader ? (
                <div className='ml-auto'>
                  <img src={loading} alt='loading' className='animate-spin duration-300 ease-out' />
                </div>
              ) : null}
              {PAN.res && <span className='text-xs font-normal text-light-grey'>{PAN.res}</span>}
              
            </div>
          )}

          {(values.applicants[activeIndex]?.personal_details.id_type === 'Driving license' ||
            values.applicants[activeIndex]?.personal_details.selected_address_proof ===
              'Driving license') && (
            <div className='flex justify-between items-center rounded-lg border-stroke border-x border-y px-2 py-1.5'>
              <div className='flex items-center gap-1'>
                {/* {!DL.ran ? (
                  <svg
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M16.4 15.2C17.8833 17.1777 16.4721 20 14 20L10 20C7.52786 20 6.11672 17.1777 7.6 15.2L8.65 13.8C9.45 12.7333 9.45 11.2667 8.65 10.2L7.6 8.8C6.11672 6.82229 7.52786 4 10 4L14 4C16.4721 4 17.8833 6.82229 16.4 8.8L15.35 10.2C14.55 11.2667 14.55 12.7333 15.35 13.8L16.4 15.2Z'
                      stroke='#EC7739'
                      strokeWidth='1.5'
                    />
                  </svg>
                ) : (
                  <svg
                    width='24'
                    height='13'
                    viewBox='0 0 18 13'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M17 1L6 12L1 7'
                      stroke='#147257'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                )} */}

                <p className='text-sm text-primary-black'>Driving license</p>
              </div>
              {DL.loader ? (
                <div className='ml-auto'>
                  <img src={loading} alt='loading' className='animate-spin duration-300 ease-out' />
                </div>
              ) : null}
              {DL.res && <span className='text-xs font-normal text-light-grey'>{DL.res}</span>}
            </div>
          )}

          {(values.applicants[activeIndex]?.personal_details.id_type === 'Voter ID' ||
            values.applicants[activeIndex]?.personal_details.selected_address_proof ===
              'Voter ID') && (
            <div className='flex justify-between items-center rounded-lg border-stroke border-x border-y px-2 py-1.5'>
              <div className='flex items-center gap-1'>
                {/* {!voterID.ran ? (
                  <svg
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M16.4 15.2C17.8833 17.1777 16.4721 20 14 20L10 20C7.52786 20 6.11672 17.1777 7.6 15.2L8.65 13.8C9.45 12.7333 9.45 11.2667 8.65 10.2L7.6 8.8C6.11672 6.82229 7.52786 4 10 4L14 4C16.4721 4 17.8833 6.82229 16.4 8.8L15.35 10.2C14.55 11.2667 14.55 12.7333 15.35 13.8L16.4 15.2Z'
                      stroke='#EC7739'
                      strokeWidth='1.5'
                    />
                  </svg>
                ) : (
                  <svg
                    width='24'
                    height='13'
                    viewBox='0 0 18 13'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M17 1L6 12L1 7'
                      stroke='#147257'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                )} */}

                <p className='text-sm text-primary-black'>Voter ID</p>
              </div>
              {voterID.loader ? (
                <div className='ml-auto'>
                  <img src={loading} alt='loading' className='animate-spin duration-300 ease-out' />
                </div>
              ) : null}
              {voterID.res && (
                <span className='text-xs font-normal text-light-grey'>{voterID.res}</span>
              )}
            </div>
          )}

          {values.applicants[activeIndex]?.work_income_detail.pf_uan && (
            <div className='flex justify-between items-center rounded-lg border-stroke border-x border-y px-2 py-1.5'>
              <div className='flex items-center gap-1'>
                {/* {!pfUAN.ran ? (
                  <svg
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M16.4 15.2C17.8833 17.1777 16.4721 20 14 20L10 20C7.52786 20 6.11672 17.1777 7.6 15.2L8.65 13.8C9.45 12.7333 9.45 11.2667 8.65 10.2L7.6 8.8C6.11672 6.82229 7.52786 4 10 4L14 4C16.4721 4 17.8833 6.82229 16.4 8.8L15.35 10.2C14.55 11.2667 14.55 12.7333 15.35 13.8L16.4 15.2Z'
                      stroke='#EC7739'
                      strokeWidth='1.5'
                    />
                  </svg>
                ) : (
                  <svg
                    width='24'
                    height='13'
                    viewBox='0 0 18 13'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M17 1L6 12L1 7'
                      stroke='#147257'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                )} */}

                <p className='text-sm text-primary-black'>PF UAN</p>
              </div>
              <div>
                {pfUAN.loader ? (
                  <div className='ml-auto'>
                    <img
                      src={loading}
                      alt='loading'
                      className='animate-spin duration-300 ease-out'
                    />
                  </div>
                ) : null}
                {pfUAN.res && (
                  <span className='text-xs font-normal text-light-grey'>{pfUAN.res}</span>
                )}
              </div>
            </div>
          )}

          {values.applicants[activeIndex]?.work_income_detail.gst_number && (
            <div className='flex justify-between items-center rounded-lg border-stroke border-x border-y px-2 py-1.5'>
              <div className='flex items-center gap-1'>
                {/* {!GST.ran ? (
                  <svg
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M16.4 15.2C17.8833 17.1777 16.4721 20 14 20L10 20C7.52786 20 6.11672 17.1777 7.6 15.2L8.65 13.8C9.45 12.7333 9.45 11.2667 8.65 10.2L7.6 8.8C6.11672 6.82229 7.52786 4 10 4L14 4C16.4721 4 17.8833 6.82229 16.4 8.8L15.35 10.2C14.55 11.2667 14.55 12.7333 15.35 13.8L16.4 15.2Z'
                      stroke='#EC7739'
                      strokeWidth='1.5'
                    />
                  </svg>
                ) : (
                  <svg
                    width='24'
                    height='13'
                    viewBox='0 0 18 13'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M17 1L6 12L1 7'
                      stroke='#147257'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                )} */}

                <p className='text-sm text-primary-black'>GST</p>
              </div>
              <div>
                {GST.loader ? (
                  <div className='ml-auto'>
                    <img
                      src={loading}
                      alt='loading'
                      className='animate-spin duration-300 ease-out'
                    />
                  </div>
                ) : null}
                {GST.res && <span className='text-xs font-normal text-light-grey'>{GST.res}</span>}
              </div>
            </div>
          )}

          <div className='flex justify-between items-center rounded-lg border-stroke border-x border-y px-2 py-1.5'>
            <div className='flex items-center gap-1'>
              {/* {!dedupe.ran ? (
                <svg
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M16.4 15.2C17.8833 17.1777 16.4721 20 14 20L10 20C7.52786 20 6.11672 17.1777 7.6 15.2L8.65 13.8C9.45 12.7333 9.45 11.2667 8.65 10.2L7.6 8.8C6.11672 6.82229 7.52786 4 10 4L14 4C16.4721 4 17.8833 6.82229 16.4 8.8L15.35 10.2C14.55 11.2667 14.55 12.7333 15.35 13.8L16.4 15.2Z'
                    stroke='#EC7739'
                    strokeWidth='1.5'
                  />
                </svg>
              ) : (
                <svg
                  width='24'
                  height='13'
                  viewBox='0 0 18 13'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M17 1L6 12L1 7'
                    stroke='#147257'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              )} */}

              <p className='text-sm text-primary-black'>Dedupe</p>
            </div>
            <div>
              {dedupe.loader ? (
                <div className='ml-auto'>
                  <img src={loading} alt='loading' className='animate-spin duration-300 ease-out' />
                </div>
              ) : null}
              {dedupe.res && (
                <span className='text-xs font-normal text-light-grey'>{dedupe.res}</span>
              )}
            </div>
          </div>

          <div className='flex justify-between items-center rounded-lg border-stroke border-x border-y px-2 py-1.5'>
            <div className='flex items-center gap-1'>
              {/* {!bre99.ran ? (
                <svg
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M16.4 15.2C17.8833 17.1777 16.4721 20 14 20L10 20C7.52786 20 6.11672 17.1777 7.6 15.2L8.65 13.8C9.45 12.7333 9.45 11.2667 8.65 10.2L7.6 8.8C6.11672 6.82229 7.52786 4 10 4L14 4C16.4721 4 17.8833 6.82229 16.4 8.8L15.35 10.2C14.55 11.2667 14.55 12.7333 15.35 13.8L16.4 15.2Z'
                    stroke='#EC7739'
                    strokeWidth='1.5'
                  />
                </svg>
              ) : (
                <svg
                  width='24'
                  height='13'
                  viewBox='0 0 18 13'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M17 1L6 12L1 7'
                    stroke='#147257'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              )} */}

              <p className='text-sm text-primary-black'>Bureau Decider</p>
            </div>
            <div>
              {bre99.loader ? (
                <div className='ml-auto'>
                  <img src={loading} alt='loading' className='animate-spin duration-300 ease-out' />
                </div>
              ) : null}
              {bre99.res && (
                <span className='text-xs font-normal text-light-grey'>{bre99.res}</span>
              )}
            </div>
          </div>

          <div className='flex justify-between items-center rounded-lg border-stroke border-x border-y px-2 py-1.5'>
            <div className='flex items-center gap-1'>
              {/* {!bureau.ran ? (
                <svg
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M16.4 15.2C17.8833 17.1777 16.4721 20 14 20L10 20C7.52786 20 6.11672 17.1777 7.6 15.2L8.65 13.8C9.45 12.7333 9.45 11.2667 8.65 10.2L7.6 8.8C6.11672 6.82229 7.52786 4 10 4L14 4C16.4721 4 17.8833 6.82229 16.4 8.8L15.35 10.2C14.55 11.2667 14.55 12.7333 15.35 13.8L16.4 15.2Z'
                    stroke='#EC7739'
                    strokeWidth='1.5'
                  />
                </svg>
              ) : (
                <svg
                  width='24'
                  height='13'
                  viewBox='0 0 18 13'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M17 1L6 12L1 7'
                    stroke='#147257'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              )} */}

              <p className='text-sm text-primary-black'>Bureau</p>
            </div>
            <div>
              {bureau.loader ? (
                <div className='ml-auto'>
                  <img src={loading} alt='loading' className='animate-spin duration-300 ease-out' />
                </div>
              ) : null}
              {bureau.res && (
                <span className='text-xs font-normal text-light-grey'>{bureau.res}</span>
              )}
            </div>
          </div>
        </div>
        <div>
          {!bre101.res ? (
            <p className='flex gap-2 text-[10px] leading-4 not-italic font-normal text-primary-black mt-3 p-1.5 border border-[#E1CE3F] bg-[#FFFAD6] rounded-md'>
              <span className='text-[10px] leading-4 font-medium'>NOTE:</span>
              Do not close the app or go back. Please wait for ID verification as it may take some
              time. We are validating these checks as per your consent.
            </p>
          ) : (
            <p className='flex gap-2 text-[10px] leading-4 not-italic font-normal text-dark-grey mt-3'>
              <span className='text-[10px] leading-4 font-medium'>NOTE:</span>
              Do not close the app or go back. Please wait for ID verification as it may take some
              time. We are validating these checks as per your consent.
            </p>
          )}
        </div>
      </div>

      <div className='flex flex-col gap-[18px] bottom-0 fixed w-full p-4 justify-center bg-white'>
        <div className='flex items-start gap-2'>
          <img src={InfoIcon} className='w-4 h-4' alt='info-icon' />
          <p className='text-sm not-italic font-normal text-dark-grey'>
            Eligibility can be increased by adding Co-applicant{` `}
            <Button
              className={`underline ${
                !bre101.res ||
                values.applicants.filter((e) => e.applicant_details.is_mobile_verified).length >= 5
                  ? 'text-light-grey pointer-events-none'
                  : 'text-primary-red'
              }`}
              onClick={(e) => {
                e.preventDefault();
                addApplicant();
              }}
            >
              Add now
            </Button>
          </p>
        </div>
        <Button
          // disabled={bureauFlag == false && !bre101.res}
          disabled={bureauFlag == false && !values?.applicants?.[activeIndex]?.applicant_details?.bre_101_response}
          // || values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier == false
          inputClasses='w-full h-14'
          primary={true}
          //activeLNT == 'any'?values?.lead?.selected_gateway?`/lead/${values?.lead?.selected_gateway}`:'/lead/lnt-charges':activeLNT == 0?'/lead/airpay-payment':'/lead/easebuzz-payment'
          //       link={
          //   bureauFlag == true || values?.applicants?.[activeIndex]?.applicant_details?.bre_101_response?.statusCode !== 200?`/lead/work-income-details`:values?.applicants?.[activeIndex]?.applicant_details?.is_primary &&(
          //   ltBre?.length>0 && ltBre == 'Airpay')?'/lead/airpay-payment':ltBre?.length>0 && ltBre == 'Easebuzz'?'/lead/easebuzz-payment':
          //   values?.applicants?.[activeIndex]?.applicant_details?.is_primary
          //     ? activeLNT == 'any'?values?.lead?.selected_gateway?`/lead/${values?.lead?.selected_gateway}`:'/lead/lnt-charges':activeLNT == 0?'/lead/airpay-payment':'/lead/easebuzz-payment'
          //     : '/lead/banking-details'
          // }
                  link={(() => {
            const applicant = values?.applicants?.[activeIndex]?.applicant_details || {};
            const breCode = applicant?.bre_101_response?.statusCode;
            const isPrimaryLocal = !!applicant?.is_primary;
            const lt = ltBre;

            if (bureauFlag === true || breCode !== 200) return '/lead/work-income-details';
            if (!isPrimaryLocal) return '/lead/banking-details';

            if (lt && lt.length > 0) {
              if (lt === 'Airpay') return '/lead/airpay-payment';
              if (lt === 'Easebuzz') return '/lead/easebuzz-payment';
            }

            if (activeLNT === 'any') {
              return values?.lead?.selected_gateway ? `/lead/${values.lead.selected_gateway}` : '/lead/lnt-charges';
            }

            return activeLNT === 0 ? '/lead/airpay-payment' : '/lead/easebuzz-payment';
          })()}
          // onClick={() => {
          //   setCurrentStepIndex(5);
          // }}
          onClick={() => {
            setCurrentStepIndex(5);
            if (values?.applicants?.[activeIndex]?.applicant_details?.is_primary) {
              setCurrentStepIndex(5);
            } else {
              setCurrentStepIndex(7);
            }
          }}
        >
          {!bre101?.res?.statusCode == 200 || bureauFlag == true?"Previous":"Next"}
        </Button>

              <DynamicDrawer open={validPan} setOpen={setValidPan}>
                <div className='w-full flex flex-col'>
                  <div className='flex justify-between items-center pb-2 md:pb-4 border-b border-lighter-grey'>
                    <p className='font-semibold'>{missingHeader?"Missing Fields":"Pan Details"}</p>
                    <button
                      onClick={() => {
                        setValidPan(false);
                        // handleSelect(null);
                      }}
                    >
                    </button>
                  </div>
                  <div className=''>
                    <div
                      style={{
                        maxHeight: '200px',
                      }}
                      className='bg-white w-full overflow-y-auto'
                    >
                      <ul className='my-4'>
                        {panErrors?.map((error, index) => (
                          <li key={index}>
                            <p>{error || ''}</p>
                          </li>
                        ))}
                      </ul>
                      <p className='mb-3 font-semibold text-[#E33439] text-center'>
                        Kindly fill the correct details....!
                      </p>
                    </div>
                  </div>
                  <div className='md:p-6 px-4 pb-4 md:border-t md:border-lighter-grey'>
                    <Button
                      // primary
                      inputClasses='!py-3 md:ml-auto'

                      onClick = {()=>updateTempQualifier(false)
}

                      link = '/lead/work-income-details'


                    >
                      Back  
                    </Button>
                  </div>
                </div>
              </DynamicDrawer>
      </div>
    </>
  );
};

const DocumentValidationError = ({bureauError,ApiError}) => {
  return (
    <div style={{
      border: '1px solid red',
      backgroundColor: '#f8d7da',
      padding: '16px',
      borderRadius: '8px',
      color: '#721c24',
      width: '300px',
      fontFamily: 'Arial, sans-serif',
    }}>

      {ApiError == false &&<p style={{ marginBottom: '12px', fontWeight: 'bold' }}>
        Please find below documents are not valid for this applicant
      </p>}
      
      <div style={{
        border: '1px solid black',
        backgroundColor: 'white',
        padding: '8px',
        borderRadius: '4px',
        color: 'black',
        fontWeight: 'bold',
        fontSize: '14px'
      }}>
        <p style={{ margin: '0 0 4px 0' }}>{bureauError}</p>
      </div>

      <p style={{ marginTop: '12px', fontSize: '14px' }}>
        Click on previous button to change the details
      </p>
    </div>
  );
};


const DocumentStatus = () => {
  return (
    <div style={{
      border: "3px solid #7BAE65",
      backgroundColor: "#EAF3E5",
      padding: "20px",
      borderRadius: "10px",
      width: "fit-content",
      margin: "20px auto",
      textAlign: "center",
      fontFamily: "Arial, sans-serif",
      color: "#000"
    }}>
      <p>Thank you...<br />
      Your applicant document are correct. You can move forward by clicking <strong>NEXT</strong> button.</p>
    </div>
  );
};


const ModalComponent = ({open}) => {

  return(
  <Backdrop
  sx={{
    color: 'error.main',
    zIndex: (theme) => theme.zIndex.modal + 1, // Ensures it is above other content but below other modals
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Slightly transparent background to show the content behind
    position: 'fixed', // To position it over the entire screen
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}
  open={open} // Set to true to make the backdrop visible
>
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: 'transparent', // Make the box background transparent
      padding: '20px', // Optional padding for spacing around the loader
    }}
  >
    <CircularProgress color="inherit" />
    <Typography variant="h6" sx={{ mt: 2 }}>
      Loading, please wait...
    </Typography>
  </Box>
</Backdrop>
  )
}



export default Qualifier;