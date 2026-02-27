import React, { useContext, useState,useEffect } from 'react';

import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import { Button, ToastMessage } from '../../../../components';

import { useParams } from 'react-router-dom';

import { useLocation } from 'react-router-dom';

import ErrorTost from '../../../../components/ToastMessage/ErrorTost';



import { AuthContext } from '../../../../context/AuthContextProvider';

import Topbar from '../../../../components/Topbar';

import loading from '../../../../assets/icons/loader_white.png';

import { LeadContext } from '../../../../context/LeadContextProvider';

import { useNavigate } from 'react-router-dom';

import {

  faceLivenesScore,

  FACE_LIVE_PATRON_ID,

  FACE_LIVE_AUTHORIZATION_RES_HEADER,

  editFieldsById,

  faceLivenesResponseHyperverge,

  updateLivePhoto,

  VITE_FACE_LIVE_PERCENTAGE,
  work_flow_liveness

} from '../../../../global/index';

import failurePage from '../../../../assets/fail.svg'
import inProgress from '../../../../assets/inprogress.svg'
import successPage from '../../../../assets/thankyou.a50fb636.svg'



export default function FaceLiveness() {

  const location = useLocation();

  // const VITE_FACE_LIVE_PERCENTAGE = import.meta.env.VITE_FACE_LIVE_PERCENTAGE;

  const {transactionId,bcp,token1,image,apiResponse1,showIframe1 } = location.state || {};

  const [idProofPhotosFile, setIdProofPhotosFile] = useState(null);



  const { values, activeIndex, setFieldValue,updateProgressUploadDocumentSteps } = useContext(LeadContext);

  const { id } = useParams();

  const [apiResponse, setApiResponse] = useState('');

  const {

    token,

    toastMessage,

    setToastMessage,

    errorToastMessage,

    setErrorToastMessage,

    errorToastSubMessage,

    setErrorToastSubMessage,

  } = useContext(AuthContext);



  const navigate = useNavigate()



  const [faceData, setFaceData] = useState(false);



  const [disablePrevious, setDisablePrevious] = useState(true);

  const [showIframe, setShowIframe] = useState(false);



  const [tokenResponse, setTokenResponse] = useState('');

  const [tokenStatus, setTokenStatus] = useState(token1);

  const [apiResponseIframe, setApiResponseIframe] = useState(apiResponse1);

  const [floading, setFloading] = useState(false);



  const [disableCheck, setDisableCheck] = useState(true);



  const[success,setSuccess] = useState(null)



  const [requiredFieldsStatus, setRequiredFieldsStatus] = useState({

    ...values?.applicant_details?.extra_params?.upload_required_fields_status,

  });



  const[lo,setLO] = useState(JSON.parse(sessionStorage.getItem('user')))  //JSON.stringify(JSON.parse(sessionStorage.getItem('user')))





  const[enableClose,setEnableClose] = useState(true);



  useEffect(()=> {



    if(!token) {



      if(lo?.user?.role == 'Loan Officer') {

        navigate('/')

      }



      else if(lo?.user?.role == 'Branch Manager'){

        navigate('/branch-manager')

      }



      else {

        navigate('/admin')

      }





    }



    //element={token?<FaceLiveness />:lo?.user?.role == 'Loan Officer'?<Navigate to={'/'}/>:lo?.user?.role == 'Branch Manager'?<Navigate to={'/branch-manager'}/>:<Navigate to={'/admin'}/>}

  },[])





  useEffect(()=> {



    if(token) {

      const run = async () => {
        try{
      await updateProgressUploadDocumentSteps(requiredFieldsStatus);
          }  // update customer photo required field status
          catch(err){
            console.log("failed to update progress step : ");
          }
      }

      run();
    }



  },[requiredFieldsStatus])





  // new logic for hyperverge sdk lead update





  const updateLeadAfterVerification = (response) =>{





    let live_face;



    let score;



    let face_match_pass;



    let video_url;



    for(const detail of response?.responseData?.result?.results) {



      console.log("DETAILLLS",detail)



      if(detail?.moduleId == "module_liveness") {

        live_face = detail?.apiResponse?.result?.details?.liveFace?.value;

        score = parseFloat(detail?.apiResponse?.result?.details?.liveFace?.score)

        video_url = detail?.imageUrl;

      }



      if(detail?.moduleId == "module_facematch" && detail?.apiResponse?.result?.summary?.action == 'pass'){

        face_match_pass = true;

      }

    }







    if(live_face == 'yes' && (typeof score == 'number' && score >= VITE_FACE_LIVE_PERCENTAGE) && face_match_pass == true) {

      notify()



      setToastMessage('Face Liveness Done Success');

      setApiResponseIframe('https://itrustuatcloud.indiashelter.in/static-page')

      setFieldValue(`applicants[${activeIndex}].applicant_details.faceLivliness_status`, 'yes');   // commented for testing

      updateFieldsApplicant('faceLivliness_status', 'yes');

   

      updateFieldsApplicant('faceliveness_response', {

        "result": {

          "videoUrl": video_url,

          "videoVerification": video_url,

          "score":score

      }});



      setFieldValue(`applicants[${activeIndex}].applicant_details.fL_Status`, score);

      updateFieldsApplicant('fL_Status', score);

  }



  else {

    notifyFail()

    setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

  }



}





  useEffect(() => {

    const handleMessage = (event) => {

      if (event?.data?.message === 'videoUploadingDone') {

       

        // Do here what you want to do after video verification process gets completed

        console.log('Video uploading is done!');

        setDisableCheck(false);

        handleClickEvent()

      }

    };



    if(bcp == 0) {       // FOR NOW ONLY FOR OLD URL AS HYPERVERGE NOT ALLOWING MESSAGE EVENT

      window.addEventListener('message', handleMessage, false);



      // Cleanup the event listener on component unmount

      return () => {

        window.removeEventListener('message', handleMessage, false);

      };

    }



  }, []);



  const startOnBoarding = async () => {

    if (transactionId) {

      const accessToken = token1;

    const hyperKycConfig = new window.HyperKycConfig(accessToken, work_flow_liveness, transactionId);

//workflow_india_shelter

    const handler = async (HyperKycResult) => {

      console.log("🚀 ~ handler ~ HyperKycResult:", HyperKycResult)


      if(HyperKycResult) {
        await updateFieldsApplicant('faceliveness_response', {

          "result":HyperKycResult});
      }

      // First will check the status code individual if matches - // for error cases


      // error code cases handle

      const errorString = HyperKycResult?.errorCode?.toString();

      switch(errorString){

        case "101":

        setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

        setDisablePrevious(false);

        setErrorToastMessage(`Configuration Error. Please Retry`);


          break;

          case "102": 

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false);

          setErrorToastMessage(`Workflow Input Error. Please Retry`);


          break;

          case "103": 

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')   

          setDisablePrevious(false);

          setErrorToastMessage(`Cancelled by user. Please Retry`);


          break;

          case "104":

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          setErrorToastMessage(`Workflow Error. Please Retry`);


          break;

          case "105": 

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          setErrorToastMessage(`Old version, could not proceed. Please Retry`);


          break;

          case "106":

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          setErrorToastMessage(`Camera Permissions Denied. Please enable camera permission and retry`);


          break;

          
          case "107":

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          setErrorToastMessage(`Hardware Error. Please Retry`);


          break;

          case "108":

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          setErrorToastMessage(`GPS Access Denied. Please enable permission for location and Retry`);


          break;

          
          case "109":

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          setErrorToastMessage(`QR Scanner Error. Please try scanning QR again`);


          break;


          case "110":

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          setErrorToastMessage(`SSL Connect Error. Please Retry`);


          break;

          case "111":

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          setErrorToastMessage(`Network error. Please Retry`);


          break;

          
          case "112":

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          setErrorToastMessage(`Signature Failed Error. Please Retry`);


          break;


          case "113":

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          setErrorToastMessage(`Face not detected. Please Retry`);


          break;

          case "114":

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          setErrorToastMessage(`Device rooted error, rooted/ jail-broken detected, Please Retry`);


          break;

          case "115":

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          setErrorToastMessage(`Security Error, Please ensure you dont capture a screenshot or record screen while performing Face Liveness`);


          break;


          
          case "117":

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          setErrorToastMessage(`Activity Destroyed Error, Please Retry`);


          break;

          case "118":

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          setErrorToastMessage(`Low Storage, Please Retry`);


          break;


          case "119":

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          setErrorToastMessage(`NFC Invalid Error, Please Retry`);


          break;
          

          

          case "120":

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          setErrorToastMessage(`NFC Unavailable Error, Please Retry`);


          break;


          case "121":

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          setErrorToastMessage(`NFC Authentication Error, Please Retry`);


          break;


          
          case "122":

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          setErrorToastMessage(`	NFC Connection Error, Please Retry`);


          break;

          case "123":

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          setErrorToastMessage(`Web Form Error, Please Retry`);


          break;


          case "124":

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          setErrorToastMessage(`Browser not Supported, Please Retry`);


          break;


          case "125":

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          setErrorToastMessage(`NFC Incomplete Scan Error, Please Retry`);


          break;


          case "126":

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          setErrorToastMessage(`Privacy Consent Denied Error, Please provide concent and Retry`);


          break;


      }

      // if no error code matches will go with the status check

      switch (HyperKycResult.status) {

        // ----Incomplete workflow-----



        case 'user_cancelled':

        //  alert('User Cancelled')

        setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          break;

        case 'error':

        console.log("🚀 ~ handler ~ HyperKycResult:", HyperKycResult);

        // handle seperate error codes

 
          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setDisablePrevious(false)

          break;



        // ----Complete workflow-----



        case 'auto_approved':

        //  updateLeadAfterVerification(HyperKycResult)   // for update lead

        setEnableClose(false);

        processFaceLivenessHyperverge();  

        break;

        case 'auto_declined':   //VITE_FACE_LIVE_PERCENTAGE



        console.log("DECLINED with score",HyperKycResult?.details?.Face_Match_Score);

        let recievedScore = HyperKycResult?.details?.Face_Match_Score;

        if(recievedScore == "" || !recievedScore || recievedScore == undefined) {
          recievedScore = 1;
        }

        const LNT_score = values?.applicants?.[activeIndex]?.applicant_details?.lt_bre_101_response?.["body"]?.face_liveliness_match_percentage;

        let compareScore;

        if(LNT_score){

          compareScore = LNT_score;
        }

        else {
          compareScore = VITE_FACE_LIVE_PERCENTAGE;
        }

          if (recievedScore >= parseInt(compareScore)) {

            setEnableClose(false);

              manualApprovedFaceLiveness(

                recievedScore,

                HyperKycResult?.details?.Selfie_Url,

              );

              setDisablePrevious(false)



          }

          else {

            setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

            notifyFail();

            setDisablePrevious(false)

          }

         



          break;

        case 'needs_review':

        //  alert('Needs Review')

          break;

      }

      
    };



    const customInputs = {

      "image": image,

      };



      if(token) {

        hyperKycConfig.setInputs(customInputs);



        window.HyperKYCModule.launch(hyperKycConfig, handler);

      }

     

    }

  };



    async function manualApprovedFaceLiveness(score, video_url) {

      //VITE_FACE_LIVE_PERCENTAGE

      const LNT_score = values?.applicants?.[activeIndex]?.applicant_details?.lt_bre_101_response?.["body"]?.face_liveliness_match_percentage;

      let compareScore;

      if(LNT_score){

        compareScore = LNT_score;
      }

      else {
        compareScore = VITE_FACE_LIVE_PERCENTAGE;
      }

      if(typeof score == 'number' && score >= parseInt(compareScore)) {

        notify()



        setToastMessage('Face Liveness Done Success');

        setApiResponseIframe('https://itrustuatcloud.indiashelter.in/static-page')

        setFieldValue(`applicants[${activeIndex}].applicant_details.faceLivliness_status`, 'yes');   // commented for testing

        try{
        await updateFieldsApplicant('faceLivliness_status', 'yes');   // commented for testing

    

      await updateFieldsApplicant('faceliveness_response', {

          "result": {

            "score":score,
            "status":"auto_declined"

        }});

        await updateFieldsApplicant('fL_Status', score.toString() + '%');
      } catch(error){
        console.log("Applicant update failed");
      }





        setFieldValue(`applicants[${activeIndex}].applicant_details.fL_Status`, score);



  //---------------------------------------------------------------------------------------

        // update live photo in customer photo api call here **



        try{

          if(bcp == 0) throw new Error("BCP IS SIGNZY HENCE NOT UPDATED CUSTOMER PHOTO")

          const live_photo_res = await updateLivePhoto({imageUrl:video_url,applicant_id:values.applicants[activeIndex].applicant_details.id},{

              headers: {

                Authorization: token,

              },

            },

          );



          setRequiredFieldsStatus({...requiredFieldsStatus,customer_photo:true})



        } catch (err) {

          console.log("*** ERROR UPDATING LIVE PHOTO")

        }

        setEnableClose(true)

  // if success close button enabled

      }

      else {
        setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

        notifyFail();

        setDisablePrevious(false)
      }



      setDisablePrevious(false)

    }



  useEffect(() => {



    if(bcp == 1) {

      // const newTab =  window.open(apiResponse1, '_blank');  


      startOnBoarding();





      //'workflow_india_shelter'

     

    }

  }, [transactionId]);







  async function checkIfCompleted() {

    if (transactionId && tokenStatus) {

        const body = {

          transactionId: `${transactionId}`,

          "sendFlag": "yes",

          "bucketPathFlag": "yes",

          "removeS3Image": "yes",

          "sendUserDetails": "yes",

          "sendDebugInfo": "yes",

          "showHiddenRequests": "yes",

          "generateNewLinks": "yes",

          "flagComputationVersion": "v1",

          "sendFailureReason": "yes",

          "preferWorkflowIdFromFinishTransaction": "no",

          "sendTamperingResult": "yes",

          "shouldReturnProcessedAtTime": "yes",

          "shouldReturnComments": "yes",

          "includePreviousAttempts": "no"

        }

        const headers = {

          'Content-Type': 'application/json',

          Authorization: token,

        };




      try{
        const response = await faceLivenesResponseHyperverge(body, { headers });





         if(response?.responseData?.result?.applicationStatus !== 'started') {

         

          setDisableCheck(false);



          handleClickEvent();



          }
        } catch(error){
          console.log("Something went wrong ");
        }
      

  }

}





  // useEffect(()=> {



  //   if(bcp == 1) {

  //     const interval = setInterval(() => {

  //       if (disableCheck === false) {

  //         clearInterval(interval); // Stop checking once disableCheck is false

  //       } else {

  //         checkIfCompleted(); // Otherwise, keep checking

  //       }

  //     }, 5000); // Check every 5 seconds



  //     // Cleanup interval on component unmount

  //     return () => clearInterval(interval);

  //   }

   

  // },[disableCheck,bcp])



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

        })

        .catch((err) => {

          console.log(err);

        });

    }

  };



  // Delay of 2 seconds (2000 milliseconds)



  const processFaceLiveness = async () => {



    if (tokenStatus) {

      try {

        const data = {

          faceData: {

            task: 'getData',

            essentials: {

              token: tokenStatus,

              patronId: FACE_LIVE_PATRON_ID,

            },

          },

          id: values?.applicants?.[activeIndex]?.applicant_details?.id

       

        };



        const headers = {

          'Content-Type': 'application/json',

          Authorization: token,

        };



        const response = await faceLivenesScore(data, { headers });



        const videoVerification = response?.result?.videoVerification;

        const videoForensics = videoVerification?.videoForensics;

        const videoFaceMatch = videoVerification?.videoFaceMatch?.[0]?.matchStatistics;



        const image_match = videoVerification?.videoFaceMatch?.[0]?.finalMatchImage;


        const LNT_score = values?.applicants?.[activeIndex]?.applicant_details?.lt_bre_101_response?.["body"]?.face_liveliness_match_percentage;

    let compareScore;

    if(LNT_score){

      compareScore = LNT_score;
    }

    else {
      compareScore = VITE_FACE_LIVE_PERCENTAGE;
    }



        if (videoVerification?.faceFound === 'yes') {

          const matchPercentage = parseFloat(videoFaceMatch?.matchPercentage);

          notify()

          setFloading(false); // Set loading state to true

          if (typeof matchPercentage === 'number' && matchPercentage >= parseInt(compareScore)) {

            setToastMessage('Face Liveness Done Success');

            //  setApiResponse('https://google.com')

            //  setApiResponseIframe('https://agile.indiashelter.in/')

            setApiResponseIframe('https://itrustuatcloud.indiashelter.in/static-page')

            setFieldValue(`applicants[${activeIndex}].applicant_details.faceLivliness_status`, 'yes');

            updateFieldsApplicant('faceLivliness_status', 'yes');

            setFieldValue(`applicants[${activeIndex}].applicant_details.fL_Status`, videoFaceMatch?.matchPercentage);

            updateFieldsApplicant('fL_Status', videoFaceMatch?.matchPercentage);



            //---------------------------------------------------------------------------------------

          // update live photo in customer photo api call here **



          // try{

          //   const live_photo_res = await updateLivePhoto({imageUrl:image_match,applicant_id:values.applicants[activeIndex].applicant_details.id},{

          //     headers:{

          //     Authorization: token,

          //   }})



          //   setRequiredFieldsStatus({...requiredFieldsStatus,customer_photo:true})





          //   console.log("REP LIVE",live_photo_res)

          // }



          // catch(err){

          //   console.log("*** ERROR UPDATING LIVE PHOTO")



          //   console.log("ERROR IN LIVE PHOTO",err)

          // }

//------------------------------------------------------------------------





          } else {

            notifyFail()

            setErrorToastMessage(`Face Liveness Unsuccessful. Face Matching is ${videoFaceMatch?.matchPercentage}. Please Retry`);

            setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

            setFieldValue(`applicants[${activeIndex}].applicant_details.faceLivliness_status`, 'no');

            updateFieldsApplicant('faceLivliness_status', 'no');

            setFieldValue(`applicants[${activeIndex}].applicant_details.fL_Status`, videoFaceMatch?.matchPercentage);

            updateFieldsApplicant('fL_Status', videoFaceMatch?.matchPercentage);

          }

        } else if (videoVerification?.faceFound === 'no') {

          notifyFail()

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setFieldValue(`applicants[${activeIndex}].applicant_details.faceLivliness_status`, 'no');

          updateFieldsApplicant('faceLivliness_status', 'no');

          setErrorToastMessage('Face Liveness Unsuccessful');

          setFloading(false); // Set loading state to true

        } else {

          notifyFail()

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          setFieldValue(`applicants[${activeIndex}].applicant_details.faceLivliness_status`, 'no');

          updateFieldsApplicant('faceLivliness_status', 'no');

          setErrorToastMessage('Face Liveness Unsuccessful');

          setFloading(false); // Set loading state to true

          //alert(response?.error?.message);



        }

      } catch (error) {

        notifyFail()

        setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

        console.error('Error during face liveness score check:', error);

        setFloading(true); // Set loading state to true

        setErrorToastMessage('An error occurred during the face liveness check.');

      } finally {

        setDisablePrevious(false);

        setFloading(false); // Set loading state to true

      }

    }

  };



  const processFaceLivenessHyperverge = async () => {



    setApiResponseIframe('https://itrustuatcloud.indiashelter.in/inprogress-page');





    if (transactionId && tokenStatus) {

      try {

        const body = {

          transactionId: `${transactionId}`,

          "sendFlag": "yes",

          "bucketPathFlag": "yes",

          // "sendUserDetails": "yes",

          // "sendDebugInfo": "yes",

          // "showHiddenRequests": "yes",

          // "generateNewLinks": "yes",

          // "flagComputationVersion": "v1",

          // "sendFailureReason": "yes",

          // "preferWorkflowIdFromFinishTransaction": "no",

          // "sendTamperingResult": "yes",

          // "shouldReturnProcessedAtTime": "yes",

          // "shouldReturnComments": "yes",

          // "includePreviousAttempts": "no"

        }

        const headers = {

          'Content-Type': 'application/json',

          Authorization: token,

        };



        setTimeout(async ()=> {



          try{

        const response = await faceLivenesResponseHyperverge(body, { headers });



        console.log("REWP",response)

         

        let live_face;



        let score;



        let face_match_pass;



        let video_url;



        // new change structure **07-2



        // let userDetails = response?.responseData?.result?.





        console.log("FL RESPONSE FINAL",response)







        // for(const detail of response?.responseData?.result?.results) {  



        //   console.log("DETAILLLS",detail)



        //   if(detail?.moduleId == "module_liveness") {

        //     // live_face = detail?.apiResponse?.result?.details?.liveFace?.value;

        //     // score = parseFloat(detail?.apiResponse?.result?.details?.liveFace?.score)

        //     video_url = detail?.imageUrl;

        //   }



        //   // if(detail?.moduleId == "module_facematch" && detail?.apiResponse?.result?.summary?.action == 'pass'){

        //   //   face_match_pass = true;

        //   // }

        // }





       console.log("LIVE FACE",live_face)



       console.log("score",typeof score)



       console.log("face_match_pass",face_match_pass)





//VITE_FACE_LIVE_PERCENTAGE



score = response?.responseData?.result?.userDetails.Face_Match_Score;



video_url = response?.responseData?.result?.userDetails?.Selfie_Url



console.log("FL RESPONSE",response);



// video_url = response?.responseData?.result?


const LNT_score = values?.applicants?.[activeIndex]?.applicant_details?.lt_bre_101_response?.["body"]?.face_liveliness_match_percentage;

let compareScore;

if(LNT_score){

  compareScore = LNT_score;
}

else {
  compareScore = VITE_FACE_LIVE_PERCENTAGE;
}





        if(typeof score == 'number' && score >= parseInt(compareScore)) {

          notify()



          setToastMessage('Face Liveness Done Success');

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/static-page')

          setFieldValue(`applicants[${activeIndex}].applicant_details.faceLivliness_status`, 'yes');   // commented for testing

          updateFieldsApplicant('faceLivliness_status', 'yes');   // commented for testing

       

          updateFieldsApplicant('faceliveness_response', {

            "result": {

              // "videoUrl": video_url,

              // "videoVerification": video_url,

              "score":score,
              "status":"auto_approved"

          }});

          updateFieldsApplicant('fL_Status', score.toString() + '%');





          setFieldValue(`applicants[${activeIndex}].applicant_details.fL_Status`, score);



//---------------------------------------------------------------------------------------

          // update live photo in customer photo api call here **



          try{


            if(bcp == 0) throw new Error("")

           

            const live_photo_res = await updateLivePhoto({imageUrl:video_url,applicant_id:values.applicants[activeIndex].applicant_details.id},{

              headers:{

              Authorization: token,

            }})



            setRequiredFieldsStatus({...requiredFieldsStatus,customer_photo:true})





            console.log("REP LIVE",live_photo_res)

          }



          catch(err){

            console.log("*** ERROR UPDATING LIVE PHOTO")



            console.log("ERROR IN LIVE PHOTO",err)

          }





          setEnableClose(true)    // if success close button enabled

//------------------------------------------------------------------------

        }



        else {

          notifyFail()

          setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page');

          setEnableClose(true)    // if failed close button enabled

        }

     



          // additional logic will confirm after checking success case response **22/01





          // let validated = response?.responseData?.result?.results?.filter((result)=> {

          //   if(result?.moduleId == "module_facematch" && result?.apiResponse?.result?.summary?.action == 'pass')

             

          //     {return result}

          // })





          // console.log("RESULT CHECK",response?.responseData?.result?.results)



          // if(validated?.length) {

          //   setSuccess(true)



          //   notify()





          //   setToastMessage('Face Liveness Done Success');

          //   //  setApiResponse('https://google.com')

          //   //  setApiResponseIframe('https://agile.indiashelter.in/')

          //   setApiResponseIframe('https://itrustuatcloud.indiashelter.in/static-page')

          //   // setFieldValue(`applicants[${activeIndex}].applicant_details.faceLivliness_status`, 'yes');   // commented for testing

          //   // updateFieldsApplicant('faceLivliness_status', 'yes');

          // }



          // else if(response?.responseData?.result?.applicationStatus !== 'started') {

          //   setSuccess(false);

          //   setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

          // }     //logic end



        console.log("🚀 ~ processFaceLivenessHyperverge ~ response:", response)



}

catch(err) {

  setSuccess(false)

  notifyFail()

  setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

  console.error('Error during face liveness score check:', err);

  setFloading(true); // Set loading state to true

  setErrorToastMessage('An error occurred during the face liveness check.');

  setEnableClose(true)    // if error close button enabled



}



      },5000)

      } catch (error) {

        setSuccess(false)

        notifyFail()

        setApiResponseIframe('https://itrustuatcloud.indiashelter.in/failure-page')

        console.error('Error during face liveness score check:', error);

        setFloading(true); // Set loading state to true

        setErrorToastMessage('An error occurred during the face liveness check.');

        setEnableClose(true)    // if error close button enabled



      } finally {

        setDisablePrevious(false);

        setFloading(false); // Set loading state to true

        // setEnableClose(true)    // if error close button enabled



      }

    }

  }



 const handleClickEvent = () => {

  setFloading(true); // Set loading state to true

  setApiResponseIframe('https://itrustuatcloud.indiashelter.in/inprogress-page');





    if (transactionId){

      const intervalId = setInterval(async () => {

        await processFaceLivenessHyperverge();

        clearInterval(intervalId); // Clear interval once the task is complete

    }, 5000);

    }else {

      setTimeout(async () => {

        await processFaceLiveness();

      }, 20000);

    }

   };





  useEffect(()=> {



console.log("SUCCES",success)

  },[success])





  const notify = () => {



    setToastMessage('Face Liveness Done Successfully !')

    // toast.success('Face Liveness Done Successfully !', {

    //   position: 'bottom-center',  

    // });  

  };

  const notifyFail = () => {



    setErrorToastMessage('Face Liveness Unsuccessfull !')

    // toast.error('Face Liveness Unsuccessfull !', {

    //   position: 'bottom-center',  

    // });  

  };







  return (

    <>

      <div className='overflow-hidden flex flex-col h-[100vh] bg-medium-grey'>

      <Topbar id={id} title='Face Liveness / Video Verification' showClose={enableClose} />

        <iframe

          className='myIframe'

          src={apiResponseIframe}

          width='100%'

          height='100%'

          allow='camera'

          frameBorder='1'

        ></iframe>



        <h4 inputClasses='w-full'>

          <ToastMessage message={toastMessage} setMessage={setToastMessage} />



          <ErrorTost

            message={errorToastMessage}

            setMessage={setErrorToastMessage}

            subMessage={errorToastSubMessage}

            setSubMessage={setErrorToastSubMessage}

          />

        </h4>



 <Button

          primary={true}

          disabled = {disableCheck}

          inputClasses='w-full bottom-10 top-10'

          onClick={handleClickEvent}



        >

          {floading ? (

            <img src={loading} style={{ height: '25px', width: '25' }} alt='loading' className='animate-spin duration-300 ease-out' />

          ) : (

            'CHECK STATUS'

          )}

        </Button>

       







        <Button

          disabled={disablePrevious}

          inputClasses={`w-full font-semibold mt-5`}

          primary={true}

          link='/lead/upload-documents'

        >

          Go to Previous

        </Button>

      </div>

    </>

  );

}
