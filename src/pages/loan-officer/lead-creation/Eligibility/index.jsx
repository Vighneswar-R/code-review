import { useContext, useEffect, useRef, useState } from 'react';

import InfoIcon from '../../../../assets/icons/info.svg';
import loading from '../../../../assets/icons/loading.svg';
import {
  checkBre99,
  checkCibil,
  checkCrif,
  verifyDL,
  verifyGST,
  verifyPFUAN,
  verifyPan,
  verifyVoterID,
  checkBre101,
  editFieldsById,
  getApplicantById,
  checkBre201,
  pushToSalesforce,
  getLeadById,
  serviceQueryPushToSalesforce,
  crifErrorhandle,
  pushToSalesforceDocs,
  refreshBMHistory,
  sendSMSGlobal
} from '../../../../global';
import { Button, ToastMessage } from '../../../../components';
import { LeadContext } from '../../../../context/LeadContextProvider';
import { AuthContext } from '../../../../context/AuthContextProvider';
import Topbar from '../../../../components/Topbar';
import axios from 'axios'

const Eligibility = () => {
  const {
    activeIndex,
    values,
    setFieldValue,
    updateCompleteFormProgress,
    setActiveIndex,
    primaryIndex,
    salesforceID,
    setSalesforceID,
  } = useContext(LeadContext);


  const { token, toastMessage, setToastMessage, setSfdcCount,loData } = useContext(AuthContext);

  const [progress, setProgress] = useState(0);
  const [finalApi, setFinalApi] = useState(0);

  const [PAN, setPAN] = useState({
    res: false,
    loader: false,
    ran: false,
    status: null,
  });
  const [DL, setDL] = useState({
    res: false,
    loader: false,
    ran: false,
    status: null,
  });
  const [voterID, setVoterID] = useState({
    res: false,
    loader: false,
    ran: false,
    status: null,
  });
  const [pfUAN, setPfUAN] = useState({
    res: false,
    loader: false,
    ran: false,
    status: null,
  });
  const [GST, setGST] = useState({
    res: false,
    loader: false,
    ran: false,
    status: null,
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
  const [faceMatch, setFaceMatch] = useState({
    res: false,
    loader: false,
    ran: false,
  });
  const [upiName, setUpiName] = useState({
    res: false,
    loader: false,
    ran: false,
  });

  const[bank,setBank] = useState({
    res:false,
    loader:false,
    ran:false
  })

  const [sfdcSubmit, setSfdcSubmit] = useState({
    res: false,
    loader: false,
    ran: false,
  });

  const [sfdcSubmitDocument, setSfdcSubmitDocument] = useState({
    res: false,
    loader: false,
    ran: false,
  });
  const [bre101, setBre101] = useState(null);
  const [display, setDisplay] = useState(false);
  const [bre201, setBre201] = useState(false);
  const [faceMatchResponse, setFaceMatchResponse] = useState(null);
  const [edited_applicants, setEditedApplicants] = useState([]);
  const [sdfcResponse, setSdfcResponse] = useState(false);
  const [sfdcStatus, setSfdcStatus] = useState(false);
  const [ErrorStatus, setErrorStatus] = useState(false);
  const [ErrorMessage, setErrorMessage] = useState(null);
  const [salesforceSubmitStatus, setSalesforceSubmitStatus] = useState(false);
  const [salesForceLoader, setSalesForceLoader] = useState(false);
  const [salesForceSuccessIcon, setSalesForceSuccessIcon] = useState(false);

  // salesforce docs
  const [salesForceDocsLoader, setSalesForceDocsLoader] = useState(false);
  const [salesForceDocsSuccessIcon, setSalesForceDocsSuccessIcon] = useState(false);

  const [enablePrevious, setEnablePrevious] = useState(false);

  const[errorFlag,setErrorFlag] = useState(false)





  const submitToBM = async () => {


    // send submit sms ** will not impact the rest of the flow

    try{

      const sms_sent = await sendSMSGlobal(values?.lead?.id,'lead_submit');

      if(sms_sent) console.log("SMS SENT SUCCESSFULLY",sms_sent)

    }

    catch(err) {

      console.log("ERROR SENDING SMS",err)
    }


    // format the date to update to update time stamp for submission

    const date = new Date();

const formatted = date.toISOString().replace('T', ' ').slice(0, 23);
console.log(formatted); // Example: 2025-02-20 08:21:52.819

    await editFieldsById(     // bm submit request to push the case to BM
      values?.lead?.id,
      'lead',
      {
        bm_submit: true,
        bm_submit_at:new Date()
      },
      {
        headers: {
          Authorization: token,
        },
      },
    );

    setFieldValue(
      `lead.bm_submit`,
      true,
    );
  }


  const refreshHistoryBM = async () => {
    const leadId = values?.lead?.id;

    // Extract applicant IDs, ensuring we have valid IDs
    const applicants = values?.applicants?.map((people) => people?.applicant_details?.id).filter(Boolean);
  

    // Create an array to hold all the requests
    const requests = applicants.map((applicant) => {


      return refreshBMHistory(leadId,applicant,{
        headers: {
            Authorization: token,
        }})


      
        // return axios.patch(`http://localhost:8005/api/applicant/resubmit/${leadId}/${applicant}`, {},{
        //     headers: {
        //         Authorization: token,
        //     },
        // });

    });

    try {
        // Wait for all requests to complete
        const responses = await Promise.all(requests);
        
        // Handle successful responses
        console.log('All applicants refreshed successfully:', responses);
    } catch (error) {
        // Handle errors
        console.error('Error refreshing applicants:', error);
        // You may want to handle individual errors if needed
    }
};




const updateEligibilityLead = async () => {

  let new_value = { ...values }

  let extra_parmas = new_value.applicants[activeIndex].applicant_details.extra_params;

  extra_parmas = {...extra_parmas,eligibility:true}
  
  console.log("ELIGIBILITY RUN",extra_parmas)


  await editFieldsById(
    values?.applicants?.[activeIndex]?.applicant_details?.id,
    'applicant',
    {
      extra_params: extra_parmas,
    },
    {
      headers: {
        Authorization: token,
      },
    },
  );

  setFieldValue(
    `applicants[${activeIndex}].applicant_details.extra_params`,
    extra_parmas
    ,
  );

  // update the lead progress as well ** lead is submitted hence progress should be 100


  try{
    let lead_params = {...values?.lead?.extra_params}

    lead_params.progress = 100;
  
    lead_params.progress_without_eligibility = 100;

    await editFieldsById(
      values?.lead?.id,
      'lead',
      {
        extra_params: lead_params,
      },
      {
        headers: {
          Authorization: token,
        },
      },
    );
    setFieldValue('lead.extra_params', lead_params);

    console.log("UPDATE SUCCESSFUL")

  }

  catch(err) {
    console.log("ERROR UPDATING LEAD PROGRESS",err)
  }
  



}
  /*useEffect(()=> {
  
    if(bre201?.bre_201_response?.statusCode) {

      if(bre201?.bre_201_response?.body?.error_flag == true || errorFlag == true){
        return;
      }

      submitToBM();      // submitting the lead to branch manager if after the verification of face match and UPI name

      refreshHistoryBM();    //**/ //if lead is getting submitted or resubmitted all previous bm verify status will be cleared for all applicants **


      // updateEligibilityLead(); //reapply the latest extra params to ensure the lead update is completed
    //}},[bre201])*/
  useEffect(() => {
   
    const handleBre201 = async () => {
      try {
        if (!bre201?.bre_201_response?.statusCode) return;
 
        const bodyErrorFlag = bre201?.bre_201_response?.body?.error_flag;
        if (bodyErrorFlag === true || errorFlag === true) return;
 
     
        if (typeof submitToBM === 'function') await submitToBM();
 
        // if lead is getting submitted or resubmitted all previous bm verify status will be cleared for all applicants
        if (typeof refreshHistoryBM === 'function') await refreshHistoryBM();
 
        // updateEligibilityLead(); //reapply the latest extra params to ensure the lead update is completed
      } catch (err) {
        // Catch and log any errors to avoid unhandled promise rejections crashing the app
        console.error('Error processing bre201 effect:', err);
      }
    };
 
    handleBre201();
  }, [bre201, errorFlag]);

  useEffect(() => {
    setEditedApplicants(
      values.applicants.filter((applicant) => !applicant.applicant_details.is_primary),
    );
  }, [values.applicants]);

  useEffect(() => {
    async function breTwo() {
      setActiveIndex(primaryIndex);

      const lead = await getLeadById(
        values?.applicants?.[activeIndex]?.applicant_details?.lead_id,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      const res = await getApplicantById(values?.applicants?.[activeIndex]?.applicant_details?.id, {
        headers: {
          Authorization: token,
        },
      });

      if(values?.lead?.sfdc_status === 'Complete'){
        setSfdcStatus(true)

        

      }

      console.log("Res->", res);



      const SetVariable = () => {


        setDL((prev) => ({
          ...prev,
          loader: false,
          res: '-',
        }));

        setVoterID((prev) => ({
          ...prev,
          loader: false,
          res: '-',
        }));

        setPfUAN((prev) => ({
          ...prev,
          loader: false,
          res: '-',
        }));

        setGST((prev) => ({
          ...prev,
          loader: false,
          res: '-',
        }));

        setPAN((prev) => ({
          ...prev,
          loader: false,
          res: '-',
        }));

        setFaceMatch((prev) => ({ ...prev, loader: false }));
        setFaceMatchResponse('-');
        setUpiName((prev) => ({
          ...prev,
          loader: false,
          res: '-',
        }));

      };



      if (!res.bre_101_response && lead.bre_201_response) {    // not in


        setBre101(res);
        setProgress(
          values?.applicants?.[activeIndex]?.applicant_details?.extra_params
            .eligibility_api_progress,
        );
        setFinalApi(
          values?.applicants?.[activeIndex]?.applicant_details?.extra_params
            .eligibility_api_progress,
        );
        setDL((prev) => ({
          ...prev,
          loader: false,
          ran: true,
          res: values?.applicants?.[activeIndex]?.applicant_details?.extra_params.DL_Status,
          status: values?.applicants?.[activeIndex]?.applicant_details?.extra_params.DL_Status,
        }));

        setVoterID((prev) => ({
          ...prev,
          loader: false,
          ran: true,
          res: values?.applicants?.[activeIndex]?.applicant_details?.extra_params.Voter_Status,
          status: values?.applicants?.[activeIndex]?.applicant_details?.extra_params.Voter_Status,
        }));

        setPfUAN((prev) => ({
          ...prev,
          loader: false,
          ran: true,
          res: values?.applicants?.[activeIndex]?.applicant_details?.extra_params.UAN_Status,
          status: values?.applicants?.[activeIndex]?.applicant_details?.extra_params.UAN_Status,
        }));

        setGST((prev) => ({
          ...prev,
          loader: false,
          ran: true,
          res: values?.applicants?.[activeIndex]?.applicant_details?.extra_params.GST_Status,
          status: values?.applicants?.[activeIndex]?.applicant_details?.extra_params.GST_Status,
        }));

        setPAN((prev) => ({
          ...prev,
          loader: false,
          ran: true,
          res: values?.applicants?.[activeIndex]?.applicant_details?.extra_params.PAN_status,
          status: values?.applicants?.[activeIndex]?.applicant_details?.extra_params.PAN_status,
        }));

        setFaceMatch((prev) => ({ ...prev, ran: true }));  

        setBank((prev) => ({ ...prev, ran: true }));  


        setUpiName((prev) => ({
          ...prev,
          ran: true,
          res: lead.bre_201_response.body.UPI_Name.main_applicant[0]
            .UPI_Name_Match_with_Applicant_Name,
        }));

        
        setFaceMatchResponse(lead.bre_201_response.body.Facematch);


        if (
          res?.extra_params?.pan_ran ||
          res?.extra_params?.dl_ran ||
          res?.extra_params?.voter_ran ||
          res?.extra_params?.pf_ran ||
          res?.extra_params?.gst_ran
        ) {
          setDisplay(true);
          setBre99((prev) => ({
            ...prev,
            ran: true,
            res: res?.bre_101_response.body.Display.Bre99_Status,
          }));
          setBureau((prev) => ({
            ...prev,
            ran: true,
            res: res?.bre_101_response.body.Display.Bureau_Status,
          }));
        }
        setBre201(lead);
        // updateCompleteFormProgress();
        setSdfcResponse(true);
        return;
      }

      setFaceMatch((prev) => ({ ...prev, loader: true, ran: true }));
      setUpiName((prev) => ({ ...prev, loader: true, ran: true }));
      setBank((prev) => ({ ...prev, loader: true,ran: true }));  


      setProgress(values.applicants.length + 1);
      setFinalApi(values.applicants.length + 1);

      let final_api = [];
      let test_api_ran = [];
      let edited_bre = null;
      let PAN_PASS = true;
      let DL_PASS = true;
      let Voter_PASS = true;
      let PF_PASS = true;
      let GST_PASS = true;
      ///// here


      if (res.bre_101_response.body.Display.PAN_status === 'Error' && PAN_PASS === false) {  // not in

        
        setPAN((prev) => ({
          ...prev,
          loader: true,
          ran: true,
          status: res.bre_101_response.body.Display.PAN_status,
        }));

        const PAN_res = await verifyPan(
          values?.applicants?.[activeIndex]?.applicant_details?.id,
          { type: 'id' },
          {
            headers: {
              Authorization: token,
            },
          },
        );

        console.log("Pan_res->", PAN_res.pan_response.status);
        if (PAN_res.pan_response.status === null || PAN_res.pan_response.status === 'In-Valid') {
          setErrorStatus(true);
          SetVariable();
          setErrorMessage('Please Enter Valid PAN');
          return;
        }
        final_api.push('PAN');
        test_api_ran.push('PAN');
      } else if (
        (res.bre_101_response.body.Display.PAN_status === 'In-Valid' ||
          res.bre_101_response.body.Display.PAN_status === 'Valid No Match') &&
        PAN_PASS === true
      ) {


        if (values?.applicants?.[activeIndex]?.personal_details?.id_type === 'PAN') {
          if (
            values?.applicants?.[activeIndex]?.personal_details?.id_number !==
            res.extra_params.previous_id_number
          ) {
            setPAN((prev) => ({
              ...prev,
              loader: true,
              ran: true,
              status: res.bre_101_response.body.Display.PAN_status,
            }));

            const PAN_res = await verifyPan(
              values?.applicants?.[activeIndex]?.applicant_details?.id,
              { type: 'id' },
              {
                headers: {
                  Authorization: token,
                },
              },
            );

            console.log("Pan_res->", PAN_res);
            if (PAN_res.pan_response.status === null || PAN_res.pan_response.status === 'In-Valid') {
              setErrorStatus(true);
              SetVariable();
              setErrorMessage('Please Enter Valid PAN');
              return;
            }
            final_api.push('PAN');
            test_api_ran.push('PAN');
          }
          else {


            if (res.bre_101_response.body.Display.PAN_status === 'In-Valid' || res.bre_101_response.body.Display.PAN_status === 'Valid No Match') {
              setErrorStatus(true);
              SetVariable();
              setErrorMessage('Please Enter Valid PAN');
              return;
            }
          }
        }

      }




      if (res.bre_101_response.body.Display.DL_Status === 'Error' && DL_PASS === false) {

        setDL((prev) => ({
          ...prev,
          loader: true,
          ran: true,
          status: res.bre_101_response.body.Display.DL_Status,
        }));

        let type = null;

        if (values.applicants[activeIndex]?.personal_details.id_type === 'Driving license') {
          type = 'id';
        } else {
          type = 'address';
        }

        const DL_res = await verifyDL(
          values?.applicants?.[activeIndex]?.applicant_details?.id,
          { type: 'id' },
          {
            headers: {
              Authorization: token,
            },
          },
        );

        console.log("DL_res->", DL_res.dl_response.statusCode);
        if (DL_res.dl_response.statusCode !== 101) {
          setErrorStatus(true);
          SetVariable();
          setErrorMessage('Please Enter Valid DL');
          return;
        }

        final_api.push('Driving license');
        test_api_ran.push('Driving license');
      } else if (
        (res.bre_101_response.body.Display.DL_Status === 'In-Valid' ||
          res.bre_101_response.body.Display.DL_Status === 'Valid No Match') &&
        DL_PASS === false
      ) {


        if (values?.applicants?.[activeIndex]?.personal_details?.id_type === 'Driving license') {
          if (
            values?.applicants?.[activeIndex]?.personal_details?.id_number !==
            res.extra_params.previous_id_number
          ) {
            setDL((prev) => ({
              ...prev,
              loader: true,
              ran: true,
              status: res.bre_101_response.body.Display.DL_Status,
            }));


            const DL_res = await verifyDL(
              values?.applicants?.[activeIndex]?.applicant_details?.id,
              { type: 'id' },
              {
                headers: {
                  Authorization: token,
                },
              },
            );

            console.log("DL_res->", DL_res);

            console.log("DL_res->", DL_res.dl_response.statusCode);
            if (DL_res.dl_response.statusCode !== 101) {
              setErrorStatus(true);
              SetVariable();
              setErrorMessage('Please Enter Valid DL');
              return;
            }
            final_api.push('Driving license');
            test_api_ran.push('Driving license');
          }
          else if (
            values?.applicants?.[activeIndex]?.personal_details?.address_proof_number !==
            res.extra_params.previous_address_proof_number
          ) {
            setDL((prev) => ({
              ...prev,
              loader: true,
              ran: true,
              status: res.bre_101_response.body.Display.DL_Status,
            }));
            const DL_res = await verifyDL(
              values?.applicants?.[activeIndex]?.applicant_details?.id,
              { type: 'id' },
              {
                headers: {
                  Authorization: token,
                },
              },
            );

            console.log("DL_res->", DL_res.dl_response.statusCode);
            if (DL_res.dl_response.statusCode !== 101) {
              setErrorStatus(true);
              SetVariable();
              setErrorMessage('Please Enter Valid DL');
              return;
            }
            final_api.push('Driving license');
            test_api_ran.push('Driving license');
          }
          else {
            if (res.bre_101_response.body.Display.DL_Status === 'In-Valid' || res.bre_101_response.body.Display.DL_Status === 'Valid No Match') {
              setErrorStatus(true);
              SetVariable();
              setErrorMessage('Please Enter Valid DL');
              return;
            }
          }
        }

      }



      if (res.bre_101_response.body.Display.Voter_Status === 'Error' && Voter_PASS === false) {


        setVoterID((prev) => ({
          ...prev,
          loader: true,
          ran: true,
          status: res.bre_101_response.body.Display.Voter_Status,
        }));

        let type = null;

        if (values.applicants[activeIndex]?.personal_details.id_type === 'Voter ID') {
          type = 'id';
        } else {
          type = 'address';
        }

        const voter_res = await verifyVoterID(
          values?.applicants?.[activeIndex]?.applicant_details?.id,
          { type: type },
          {
            headers: {
              Authorization: token,
            },
          },
        );

        console.log("Voter_res->", voter_res.voter_response.statusCode);

        if (voter_res.voter_response.statusCode !== 101) {
          setErrorStatus(true);
          SetVariable();
          setErrorMessage('Please Enter Valid Voter');
          return;
        }
        final_api.push('Voter ID');
        test_api_ran.push('Voter ID');
      } else if (
        (res.bre_101_response.body.Display.Voter_Status === 'In-Valid' ||
          res.bre_101_response.body.Display.Voter_Status === 'Valid No Match') &&
        Voter_PASS === false
      ) {
        if (values?.applicants?.[activeIndex]?.personal_details?.id_type === 'Voter ID') {
          if (
            values?.applicants?.[activeIndex]?.personal_details?.id_number !==
            res.extra_params.previous_id_number
          ) {

            setVoterID((prev) => ({
              ...prev,
              loader: true,
              ran: true,
              status: res.bre_101_response.body.Display.Voter_Status,
            }));

            const voter_res = await verifyVoterID(
              values?.applicants?.[activeIndex]?.applicant_details?.id,
              { type: type },
              {
                headers: {
                  Authorization: token,
                },
              },
            );


            if (voter_res.voter_response.statusCode !== 101) {
              setErrorStatus(true);
              SetVariable();
              setErrorMessage('Please Enter Valid Voter');
              return;
            }

            final_api.push('Voter ID');
            test_api_ran.push('Voter ID');
          }
        }

        else if (
          values?.applicants?.[activeIndex]?.personal_details?.address_proof_number !==
          res.extra_params.previous_address_proof_number
        ) {
          console.log("ELSE IF2")

          setVoterID((prev) => ({
            ...prev,
            loader: true,
            ran: true,
            status: res.bre_101_response.body.Display.Voter_Status,
          }));

          const voter_res = await verifyVoterID(
            values?.applicants?.[activeIndex]?.applicant_details?.id,
            { type: type },
            {
              headers: {
                Authorization: token,
              },
            },
          );

          console.log("Voter_res->", voter_res);
          if (voter_res.voter_response.statusCode !== 101) {
            setErrorStatus(true);
            SetVariable();
            setErrorMessage('Please Enter Valid Voter');
            return;
          }
          final_api.push('Voter ID');
          test_api_ran.push('Voter ID');
        }
        else {
          if (res.bre_101_response.body.Display.Voter_Status === 'In-Valid' || res.bre_101_response.body.Display.Voter_Status === 'Valid No Match') {
            setErrorStatus(true);
            SetVariable();
            setErrorMessage('Please Enter Valid Voter');
            return;
          }
        }
      }

      //   end of voter section

      if (res.bre_101_response.body.Display.UAN_Status === 'Error' && PF_PASS === false) {
        
        setPfUAN((prev) => ({
          ...prev,
          loader: true,
          ran: true,
          status: res.bre_101_response.body.Display.UAN_Status,
        }));

        // final_api.push(
        //   verifyPFUAN(values?.applicants?.[activeIndex]?.applicant_details?.id, {
        //     headers: {
        //       Authorization: token,
        //     },
        //   }),
        // );

        const PFUAN_res = await verifyPFUAN(values?.applicants?.[activeIndex]?.applicant_details?.id, {
          headers: {
            Authorization: token,
          },
        });
        

        console.log("PFUAN_res->", PFUAN_res)
        final_api.push('pf');
        test_api_ran.push('pf');
      } else if (
        (res.bre_101_response.body.Display.UAN_Status === 'In-Valid' ||
          res.bre_101_response.body.Display.UAN_Status === 'Valid No Match') &&
        PF_PASS === false
      ) {
        if (
          values?.applicants?.[activeIndex]?.work_income_detail?.pf_uan !==
          res.extra_params.previous_pf_uan
        ) {
          setPfUAN((prev) => ({
            ...prev,
            loader: true,
            ran: true,
            status: res.bre_101_response.body.Display.UAN_Status,
          }));

          // final_api.push(
          //   verifyPFUAN(values?.applicants?.[activeIndex]?.applicant_details?.id, {
          //     headers: {
          //       Authorization: token,
          //     },
          //   }),
          // );


          const PFUAN_res = await verifyPFUAN(values?.applicants?.[activeIndex]?.applicant_details?.id, {
            headers: {
              Authorization: token,
            },
          });

          console.log("PFUAN_res->", PFUAN_res)
          final_api.push('pf');
          test_api_ran.push('pf');
        }
      }

      if (res.bre_101_response.body.Display.GST_Status === 'Error' && GST_PASS === false) {
        setGST((prev) => ({
          ...prev,
          loader: true,
          ran: true,
          status: res.bre_101_response.body.Display.GST_Status,
        }));

        const GST_res = await verifyGST(values?.applicants?.[activeIndex]?.applicant_details?.id, {
          headers: {
            Authorization: token,
          },
        });

        console.log("GST_res->", GST_res)

        if (GST_res.gst_response.statusCode !== 101) {
          setErrorStatus(true);
          SetVariable();
          setErrorMessage('Please Enter Valid GST');
          return;
        }
        final_api.push('gst');
        test_api_ran.push('gst');
      } else if (
        (res.bre_101_response.body.Display.GST_Status === 'In-Valid' ||
          res.bre_101_response.body.Display.GST_Status === 'Valid No Match') &&
        GST_PASS === false

      ) {
        if (
          values?.applicants?.[activeIndex]?.work_income_detail?.gst_number !==
          res.extra_params.previous_gst_number
        ) {
          setGST((prev) => ({
            ...prev,
            loader: true,
            ran: true,
            status: res.bre_101_response.body.Display.GST_Status,
          }));

          const GST_res = await verifyGST(values?.applicants?.[activeIndex]?.applicant_details?.id, {
            headers: {
              Authorization: token,
            },
          });

          console.log("GST_res->", GST_res)
          if (GST_res.gst_response.statusCode !== 101) {
            setErrorStatus(true);
            SetVariable();
            setErrorMessage('Please Enter Valid GST');
            return;
          }
          final_api.push('gst');
          test_api_ran.push('gst');
        }
      }

      if (final_api.length !== 0) {
        setDisplay(true);

        try {
          setProgress(final_api.length + values.applicants.length + 1);
          setFinalApi(final_api.length + values.applicants.length + 3);

          //await Promise.allSettled([...final_api]);
        } catch (err) {
          console.log(err);
        }

        let callCibilOrCrif = '';

        try {
          setBre99((prev) => ({ ...prev, loader: true, ran: true }));
          setProgress(final_api.length + values.applicants.length + 2);

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
          }
        } catch (err) {
          console.log(err);
          setBre99((prev) => ({ ...prev, loader: false, res: 'Error' }));
        }

        setBureau((prev) => ({ ...prev, loader: true, ran: true }));
        setProgress(final_api.length + values.applicants.length + 3);

        if (callCibilOrCrif.Rule_Value === 'CIBIL') {
          try {
            const cibil_res = await checkCibil(
              values?.applicants?.[activeIndex]?.applicant_details?.id,
              {
                headers: {
                  Authorization: token,
                },
              },
            );
            if (cibil_res.status == 200) {
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
        } else {
          try {
            const crif_res = await checkCrif(
              values?.applicants?.[activeIndex]?.applicant_details?.id,
              {
                headers: {
                  Authorization: token,
                },
              },
            );
            if (crif_res?.data?.CRIF_response?.status == 200) {
              setBureau((prev) => ({
                ...prev,
                loader: false,
                res: 'Valid',
              }));
            }else{
              if(crifErrorhandle){
                const cibil_res = await checkCibil(
                  values?.applicants?.[activeIndex]?.applicant_details?.id,
                  {
                    headers: {
                      Authorization: token,
                    },
                  },
                );
                if (cibil_res.status == 200) {
                  setBureau((prev) => ({
                    ...prev,
                    loader: false,
                    res: 'Valid',
                  }));
                }
              }
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

        try {

          

          const bre_res = await checkBre101(
            values?.applicants?.[activeIndex]?.applicant_details?.id,
            {
              headers: {
                Authorization: token,
              },
            },
          );

          if (bre_res.bre_101_response.statusCode != 200) return;

          let new_data = { ...values };

          const extra_parmas = new_data.applicants[activeIndex].applicant_details.extra_params;

          const edited_extra_params = {
            ...extra_parmas,
            PAN_status: bre_res.bre_101_response.body.Display.PAN_status,
            DL_Status: bre_res.bre_101_response.body.Display.DL_Status,
            Voter_Status: bre_res.bre_101_response.body.Display.Voter_Status,
            UAN_Status: bre_res.bre_101_response.body.Display.UAN_Status,
            GST_Status: bre_res.bre_101_response.body.Display.GST_Status,
          };

          edited_bre = await editFieldsById(
            values?.applicants?.[activeIndex]?.applicant_details?.id,
            'applicant',
            {
              bre_101_response: bre_res.bre_101_response,
              extra_params: edited_extra_params,
            },
            {
              headers: {
                Authorization: token,
              },
            },
          );

          setFieldValue(
            `applicants[${activeIndex}].applicant_details.extra_params`,
            edited_extra_params,
          );

          setFieldValue(
            `applicants[${activeIndex}].applicant_details.bre_101_response`,
            bre_res.bre_101_response,
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
        } catch (err) {
          console.log(err);
        }
      }

      try {

        console.log("here")

        const bre_res = await checkBre201(
          values?.applicants?.[activeIndex]?.applicant_details?.lead_id,
          {
            headers: {
              Authorization: token,
            },
          },
        );

        console.log("res_bre",bre_res)

        if (bre_res.bre_201_response.statusCode != 200) return;

        setBre201(bre_res);

        setFaceMatch((prev) => ({ ...prev, loader: false }));
        setFaceMatchResponse(bre_res.bre_201_response?.body.Facematch);
        setUpiName((prev) => ({
          ...prev,
          loader: false,
          res: bre_res.bre_201_response?.body.UPI_Name.main_applicant?.[0]
            .UPI_Name_Match_with_Applicant_Name,
        }));


        let banking_details = bre_res.bre_201_response?.body?.BankingDetails?.[Object.keys(bre_res.bre_201_response?.body?.BankingDetails)?.[0]]

        let isValid  = banking_details?.[0]?.[Object.keys(banking_details?.[0])?.[0]]

        setBank((prev) => ({
          ...prev,
          loader: false,
          res: isValid,
        }));

        // logic to stop the application based on flag

        console.log("bre_res",bre_res);

        const errorMsg = bre_res?.bre_201_response?.body?.error_msg

        if(bre_res?.bre_201_response?.body?.error_flag == true){
          setErrorFlag(true);
          setErrorMessage(errorMsg || "Could not proceed Please Try Again!");
          setEnablePrevious(true);
          return;
        }
        
        if (edited_bre) {
          const extra_parmas = edited_bre.extra_params;

          const edited_extra_params = {
            ...extra_parmas,
            eligibility: true,
            eligibility_api_progress:
              final_api.length !== 0
                ? final_api.length + values.applicants.length + 3
                : values.applicants.length + 1,
            pan_ran: test_api_ran.includes('PAN'),
            dl_ran: test_api_ran.includes('Driving license'),
            voter_ran: test_api_ran.includes('Voter ID'),
            pf_ran: test_api_ran.includes('pf'),
            gst_ran: test_api_ran.includes('gst'),
          };

          await editFieldsById(
            values?.applicants?.[activeIndex]?.applicant_details?.id,
            'applicant',
            {
              extra_params: edited_extra_params,
            },
            {
              headers: {
                Authorization: token,
              },
            },
          );



          setFieldValue(
            `applicants[${activeIndex}].applicant_details.extra_params`,
            edited_extra_params,
          );
        } else {
          let new_data = { ...values };

          const extra_parmas = new_data.applicants[activeIndex].applicant_details.extra_params;

          const edited_extra_params = {
            ...extra_parmas,
            eligibility: true,
            eligibility_api_progress:
              final_api.length !== 0
                ? final_api.length + values.applicants.length + 3
                : values.applicants.length + 1,
          };
          setFieldValue(
            `applicants[${activeIndex}].applicant_details.extra_params`,
            edited_extra_params,
          );
          await editFieldsById(
            values?.applicants?.[activeIndex]?.applicant_details?.id,
            'applicant',
            {
              extra_params: edited_extra_params,
            },
            {
              headers: {
                Authorization: token,
              },
            },
          );
        }
      } catch (err) {
        console.log(err);


        setFaceMatch((prev) => ({ ...prev, loader: false }));
        setUpiName((prev) => ({
          ...prev,
          loader: false,
        }));

        setEnablePrevious(true)

    }


//       try {
//         if (values?.lead?.applicant_type === "C") {     // commented the salesforce submit
//           setSalesForceLoader(true)
//           const serviceQueryResponse = await serviceQueryPushToSalesforce(
//             values?.applicants?.[activeIndex]?.applicant_details?.lead_id,
//             {
//               headers: {
//                 Authorization: token,
//               },
//             },
//           );

//           if (serviceQueryResponse.lead.sfdc_status === 'Complete') {

//             // setSalesForceLoader(false)
//             // setSalesForceSuccessIcon(true)
//             setSalesForceDocsLoader(true)
//             setToastMessage('Data has been successfully pushed to the Salesforce');
//             setSfdcStatus(false);
//             setSalesforceID(serviceQueryResponse.salesforce_response.service_query_sfdc_submit_pwa.Application_Id);
//             setSfdcCount((sfdcCount) => sfdcCount + 1);
//           } else {
//             setToastMessage('The data push to Salesforce has failed');
//             setSfdcStatus(true);
//             setSalesForceLoader(false)
//             setSfdcCount((sfdcCount) => sfdcCount + 1);
//           }

//         }
//         else {

if(loData?.user?.role == "Branch Manager") {
  try {
  
          setSalesForceLoader(true)
         
          const sfdcres = await pushToSalesforce(
            values?.applicants?.[activeIndex]?.applicant_details?.lead_id,
            {
              headers: {
                Authorization: token,
              },
            },
          );
          //leadData?.lead?.sfdc_submit_pwa?.Status === 'Success'
          if (sfdcres.lead.sfdc_submit_pwa?.Status === 'Success') { 
            setSalesForceLoader(false)
            setSalesForceSuccessIcon(true)
            setSalesForceDocsLoader(true)
          } else {
            setSalesForceLoader(false)
          }

          // salesforce docs upload API call
          //debugger
          const sfdc_doc_res = await pushToSalesforceDocs(values?.applicants?.[activeIndex]?.applicant_details?.lead_id, {
            headers: {
              Authorization: token,
            },
          });

          if(!sfdc_doc_res){
            setSalesForceDocsLoader(false)
          }

          if(sfdc_doc_res){
            setSalesForceDocsLoader(false)
            setSalesForceDocsSuccessIcon(true)
          }

console.log('sfdcressfdcres',sfdcres)
console.log('sfdc_doc_res',sfdc_doc_res)
setSalesforceID(sfdcres.lead.salesforce_application_id);

if(sfdc_doc_res === 'No salesforce application ID'){
  setSalesForceSuccessIcon(false);
  setSalesForceDocsSuccessIcon(false);
}
          
          if (sfdc_doc_res?.lead?.sfdc_upload_document_function?.Status === 'Success') {
            setSalesForceDocsLoader(false);
            setToastMessage('Data has been successfully pushed to the Salesforce');
            setSfdcStatus(false);
            //setSalesforceID(sfdc_doc_res.salesforce_response.sfdc_submit_pwa.Application_Id);
            setSalesforceID(sfdcres.lead.salesforce_application_id);

            setSfdcCount((sfdcCount) => sfdcCount + 1);
            setSalesForceSuccessIcon(true)
          } else {
            setToastMessage('The data push to Salesforce has failed');
            setSfdcStatus(true);
            setSfdcCount((sfdcCount) => sfdcCount + 1);
          }
          setSdfcResponse(true);
  } catch (err) {
    
    console.log(err);
    setSalesForceLoader(false)
    setSalesForceDocsLoader(false)
    setEnablePrevious(true)
    let message = err?.response?.data?.error || err?.response?.data?.message
    // setToastMessage(message?.length?message:'The data push to Salesforce has failed');
    if (message == 'No Token 1 found') {
      setToastMessage('Employee ID & Branch Name Is Mismatched. Please contact Itrust Admin')
    }
    //  else {
    //   setToastMessage('The data push to Salesforce has failed');
    // }
          
    setSfdcStatus(true);
    setSfdcCount((sfdcCount) => sfdcCount + 1);
    await editFieldsById(     // bm submit request to push the case to BM
      values?.lead?.id,
      'lead',
      {
        sfdc_count: 1

      },
      {
        headers: {
          Authorization: token,
        },
      },
    );
  }
}


      
      // catch (err) {
      //   console.log(err);
      //   setSalesForceLoader(false)
      //   setSalesForceDocsLoader(false)
      //   setEnablePrevious(true)
      //   setToastMessage('The data push to Salesforce has failed');
      //   setSfdcStatus(true);
      //   setSfdcCount((sfdcCount) => sfdcCount + 1);
      // }
      
}
      


    

    



      breTwo();

    

    //finishing
  }, []);

  useEffect(() => {
    if (values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.eligibility) {
      updateCompleteFormProgress();
    }
  }, [values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.eligibility]);

  
  const handleSalesforceSubmit = async () => {


    if(loData.user.role === 'Branch Manager') {
      try{
        setSalesForceLoader(true)
        const sfdc_res = await pushToSalesforce(values?.applicants?.[activeIndex]?.applicant_details?.lead_id, {
          headers: {
            Authorization: token,
          },
        });
  
        if (sfdc_res?.lead?.sfdc_submit_pwa?.Status === 'Success') {
          setSalesforceSubmitStatus(true);
        }
      }catch(error){
      console.log(error);
      setSalesForceLoader(false)
      }
    
    }

    else {
    }


  }


  const handleSalesforceDocumentSubmit = async () => {

    if(loData.user.role === 'Branch Manager') {
      try{
        setSalesForceDocsLoader(true);
        const sfdc_doc_res = await pushToSalesforceDocs(values?.applicants?.[activeIndex]?.applicant_details?.lead_id, {
          headers: {
            Authorization: token,
          },
        });
  
        if(sfdc_doc_res){
          salesForceDocsLoader(false)
        }
      }catch(error){
      console.log(error)
      salesForceDocsLoader(false)
      }

    }
  
  }
  return (
    <>
      <Topbar title='Eligibility' id={values?.lead?.id} showClose={!sdfcResponse ? false : true} />

      <div className='p-4 h-full pb-28'>
        <ToastMessage
          message={toastMessage}
          setMessage={setToastMessage}
          error={sfdcStatus ? true : false}
        />

        <div className='flex items-start gap-2'>
          <img src={InfoIcon} className='w-4 h-4' alt='info-icon' />
          <p className='text-xs not-italic font-normal text-dark-grey'>
            The eligibilty provides information regarding the status of all the verification and
            lead eligibility.
          </p>
        </div>

        <div className='mt-4'>
          <p className='text-xs text-primary-black font-normal'>
            Applicant name:
            {values?.applicants?.map((applicant) =>
              applicant.applicant_details?.is_primary
                ? ' ' +
                applicant.applicant_details?.first_name +
                ' ' +
                applicant.applicant_details?.middle_name +
                ' ' +
                applicant.applicant_details?.last_name
                : null,
            )}
          </p>
          {loData?.user?.role == "Branch Manager"?<p className='text-xs text-primary-black font-normal mt-0.5'>
            Salesforce ID: {salesforceID}
          </p>:null}
          <div className='flex justify-between text-primary-black font-medium mt-1'>
            {bre201?.bre_201_response?.statusCode !== 200? <h3>Verification in progress</h3> : errorFlag?
            <h3>Application Not Submitted</h3>:
            <h3>Application submitted</h3>}
            <h3>
              {progress}/{finalApi}
            </h3>
          </div>

          <div className='mt-3 bg-primary-black rounded-lg p-4'>
            {!ErrorStatus ? (
              <div className='flex justify-center items-center gap-3'>


                {
                  !sdfcResponse || bre201.statusCode !== 200  && (

                    <div className='ml-auto'>
                      <img
                        src={loading}
                        alt='loading'
                        className='h-8 w-12 animate-spin duration-300 ease-out'
                      />
                    </div>
                  )
                }

{bre201?.bre_201_response?.body?.error_flag == true?<p className='text-white text-xs'>
  {ErrorMessage}
                </p>:

                <p className='text-white text-xs'>
                  Thank you for your patience while the verification process is completed.
                </p>}
              </div>
            ) : (
              <p className='text-white text-xs'>{ErrorMessage}</p>
            )}
          </div>
        </div>

        <div className='mt-4 flex flex-col gap-2'>
          {PAN.status === 'Error' ||
            PAN.status === 'In-Valid' ||
            PAN.status === 'Valid No Match' ||
            bre101?.extra_params?.pan_ran ? (
            <div className='flex justify-between items-center rounded-lg border-stroke bg-neutral-50 border-x border-y px-2 py-1.5'>
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
          ) : null}

          {DL.status === 'Error' ||
            DL.status === 'In-Valid' ||
            DL.status === 'Valid No Match' ||
            bre101?.extra_params?.dl_ran ? (
            <div className='flex justify-between items-center rounded-lg border-stroke bg-neutral-50 border-x border-y px-2 py-1.5'>
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
          ) : null}

          {voterID.status === 'Error' ||
            voterID.status === 'In-Valid' ||
            voterID.status === 'Valid No Match' ||
            bre101?.extra_params?.voter_ran ? (
            <div className='flex justify-between items-center rounded-lg border-stroke bg-neutral-50 border-x border-y px-2 py-1.5'>
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
          ) : null}

          {pfUAN.status === 'Error' ||
            pfUAN.status === 'In-Valid' ||
            pfUAN.status === 'Valid No Match' ||
            bre101?.extra_params?.pf_ran ? (
            <div className='flex justify-between items-center rounded-lg border-stroke bg-neutral-50 border-x border-y px-2 py-1.5'>
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
          ) : null}

          {GST.status === 'Error' ||
            GST.status === 'In-Valid' ||
            GST.status === 'Valid No Match' ||
            bre101?.extra_params?.gst_ran ? (
            <div className='flex justify-between items-center rounded-lg border-stroke bg-neutral-50 border-x border-y px-2 py-1.5'>
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
          ) : null}

          {display ? (
            <>
              <div className='flex justify-between items-center rounded-lg border-stroke bg-neutral-50 border-x border-y px-2 py-1.5'>
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
                      <img
                        src={loading}
                        alt='loading'
                        className='animate-spin duration-300 ease-out'
                      />
                    </div>
                  ) : null}
                  {bre99.res && (
                    <span className='text-xs font-normal text-light-grey'>{bre99.res}</span>
                  )}
                </div>
              </div>

              <div className='flex justify-between items-center rounded-lg border-stroke bg-neutral-50 border-x border-y px-2 py-1.5'>
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
                      <img
                        src={loading}
                        alt='loading'
                        className='animate-spin duration-300 ease-out'
                      />
                    </div>
                  ) : null}
                  {bureau.res && (
                    <span className='text-xs font-normal text-light-grey'>{bureau.res}</span>
                  )}
                </div>
              </div>
            </>
          ) : null}

          <div className='flex justify-between items-center rounded-lg border-stroke bg-neutral-50 border-x border-y px-2 py-1.5'>
            <div className='flex items-center gap-1'>
              {/* {!upiName.ran ? (
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

              <p className='text-sm text-primary-black'>UPI Name</p>
            </div>
            <div>
              {upiName.loader ? (
                <div className='ml-auto'>
                  <img src={loading} alt='loading' className='animate-spin duration-300 ease-out' />
                </div>
              ) : null}
              {upiName.res && (
                <span className='text-xs font-normal text-light-grey'>{upiName.res}</span>
              )}
            </div>
          </div>

              {/* BANK DETAILS */}
              <div className='flex justify-between items-center rounded-lg border-stroke bg-neutral-50 border-x border-y px-2 py-1.5 mt-5'>

<p className='text-sm text-primary-black'>Bank Account</p>

<div>
  {bank.loader ? (
    <div className='ml-auto'>
      <img
        src={loading}
        alt='loading'
        className='animate-spin duration-300 ease-out'
      />
    </div>
  ) : null}

  {/* {console.log(index + 1)} */}
  {bank.res && (
    <span className='text-xs font-normal text-light-grey'>
      
      {bank.res}
    </span>
  )}
</div>

</div>

          <div>
            <p className='text-sm text-primary-black'>Primary applicant</p>

            <div className='flex justify-between items-center rounded-lg border-stroke bg-neutral-50 border-x border-y px-2 py-1.5 mt-2'>
              <div className='flex items-center gap-1'>
                {/* {!faceMatch.ran ? (
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

                <p className='text-sm text-primary-black'>Face Match</p>


              </div>
              <div>


                {faceMatch.loader ? (
                  <div className='ml-auto'>
                    <img
                      src={loading}
                      alt='loading'
                      className='animate-spin duration-300 ease-out'
                    />
                  </div>
                ) : null}

                {faceMatchResponse && (
                  <span className='text-xs font-normal text-light-grey'>
                    {faceMatchResponse[Object.keys(faceMatchResponse)[0]]?.[0]?.["Face_match_with_ID_Proof"] ||
                      faceMatchResponse[Object.keys(faceMatchResponse)[0]]?.[0]?.["Face_match_with_Address_Proof"]}

                  </span>
                )}
              </div>
            </div>

            <div className='flex justify-between items-center rounded-lg border-stroke bg-neutral-50 border-x border-y px-2 py-1.5 mt-2'>
              <div className='flex items-center gap-1'>
                {/* {!faceMatch.ran ? (
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

                <p className='text-sm text-primary-black'>Face Livliness</p>
              
              </div>
              <div>

                {
                  values?.applicants?.[activeIndex]?.applicant_details?.faceLivliness_status === 'yes' ? <span className='text-xs font-normal text-light-grey'>
                    Valid
                  </span> : <span className='text-xs font-normal text-light-grey'>
                    In Valid
                  </span>
                }
              </div>
            </div>
          </div>

          {edited_applicants?.map((data, index) =>
            !data?.applicant_details?.is_primary ? (
              <div key={index}>
                <p className='text-sm text-primary-black'>
                  {data?.applicant_details?.applicant_type + ' ' + (index + 1)}
                </p>

                <div className='flex justify-between items-center rounded-lg border-stroke bg-neutral-50 border-x border-y px-2 py-1.5 mt-2'>
                  <div className='flex items-center gap-1'>
                    {/* {!faceMatch.ran ? (
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

                    <p className='text-sm text-primary-black'>Face Match</p>
                  </div>
                  <div>
                    {faceMatch.loader ? (
                      <div className='ml-auto'>
                        <img
                          src={loading}
                          alt='loading'
                          className='animate-spin duration-300 ease-out'
                        />
                      </div>
                    ) : null}

                    {/* {console.log(index + 1)} */}
                    {faceMatchResponse && (
                      <span className='text-xs font-normal text-light-grey'>
                        {faceMatchResponse?.[`co_applicant_${index + 1}`]?.[0]
                          ?.Face_match_with_ID_Proof ||
                          faceMatchResponse?.[`co_applicant_${index + 1}`]?.[0]
                            ?.Face_match_with_Address_Proof}
                      </span>
                    )}
                  </div>
                </div>



          
                {/* // Faceliveness */}

                

                <div className='flex justify-between items-center rounded-lg border-stroke bg-neutral-50 border-x border-y px-2 py-1.5 mt-5'>
                  <div className='flex items-center gap-1'>


                    <p className='text-sm text-primary-black'>Face Liveness</p>
                  </div>
                  <div>
                    {/* {faceMatch.loader ? (
                      <div className='ml-auto'>
                        <img
                          src={loading}
                          alt='loading'
                          className='animate-spin duration-300 ease-out'
                        />
                      </div>
                    ) : null} */}

                    {/* {console.log(index + 1)} */}
                    {values?.applicants?.[index + 1]?.applicant_details?.faceLivliness_status === 'yes' ? (
                      <span className='text-xs font-normal text-light-grey'>
                        Valid
                      </span>) : (<span className='text-xs font-normal text-light-grey'>
                        In Valid
                      </span>

                    )}


                  </div>
                </div>

  


                {/* condition for branch manager */}


                {loData?.user?.role == "Branch Manager"?<div>
                  <p className='text-sm text-primary-black mt-2'>Salesforce Submit Status</p>
                <div className='flex justify-between items-center rounded-lg border-stroke bg-neutral-50 border-x border-y px-2 py-1.5 mt-2'>

                  <div className='flex items-center gap-1'>
                    <p className='text-sm text-primary-black'>Salesforce Submit </p>
                  </div>
                  <div>
                    {salesForceLoader ? (
                      <div className='ml-auto'>
                        <img src={loading} alt='loading' className='animate-spin duration-300 ease-out' />
                      </div>
                    ) : (<div>
                      {!faceMatch.loader && !values?.lead?.salesforce_application_id && !salesForceSuccessIcon && (
                        <>
                          <div className='flex gap-1 items-center justify-end text-[10px] font-medium leading-4 text-secondary-green' onClick={handleSalesforceSubmit}>
                            <svg
                              width='2 4'
                              height='24'
                              viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                              >
                                <path
                                  d='M5.843 16.372C4.273 16.372 3 15.099 3 13.529C3 11.959 4.273 10.686 5.843 10.686C5.843 7.546 8.389 5 11.529 5C13.879 5 15.895 6.426 16.762 8.46C17.051 8.394 17.349 8.351 17.658 8.351C19.873 8.351 21.668 10.146 21.668 12.361C21.668 14.576 19.873 16.371 17.658 16.371'
                                  stroke='#E33439'
                                  strokeWidth='1.5'
                                  strokeMiterlimit='10'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                />
                                <path
                                  d='M8 15C8 12.7909 9.79086 11 12 11C14.2091 11 16 12.7909 16 15C16 17.2091 14.2091 19 12 19C10.5194 19 9.22675 18.1956 8.53513 17M8.53513 17V19M8.53513 17H10.5'
                                  stroke='#E33439'
                                  strokeWidth='1.5'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                />
                              </svg>
                            </div>
                          </>
                        )}

                        {salesForceSuccessIcon && (
                          <>

                            <div className='flex gap-1 items-center justify-end text-[10px] font-medium leading-4 text-secondary-green' >
                              <svg
                                width='24'
                                height='24'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                d='M5.843 17.372C4.273 17.372 3 16.099 3 14.529C3 12.959 4.273 11.686 5.843 11.686C5.843 8.546 8.389 6 11.529 6C13.879 6 15.895 7.426 16.762 9.46C17.051 9.394 17.349 9.351 17.658 9.351C19.873 9.351 21.668 11.146 21.668 13.361C21.668 15.576 19.873 17.371 17.658 17.371'
                                stroke='#147257'
                                strokeWidth='1.5'
                                strokeMiterlimit='10'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                              <path
                                d='M16 14L11.1875 19L9 16.7273'
                                stroke='#147257'
                                strokeWidth='1.5'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                          </div>
                        </>
                      )}
                    </div>)}

                  </div>
                </div>
</div>:null}
              {loData?.user?.role == "Branch Manager"? <div className='flex justify-between items-center rounded-lg border-stroke bg-neutral-50 border-x border-y px-2 py-1.5 mt-2'>
                  <div className='flex items-center gap-1'>
                    <p className='text-sm text-primary-black'>Salesforce Document Upload  </p>
                  </div>
                  <div>
                    {salesForceDocsLoader && !salesForceLoader ? (
                      <div className='ml-auto'>
                        <img src={loading} alt='loading' className='animate-spin duration-300 ease-out' />
                      </div>
                    ) : (<div>
                      {!faceMatch.loader && !salesForceLoader && !values?.lead?.salesforce_application_id && !salesForceDocsSuccessIcon && (
                        <>
                          <div className='flex gap-1 items-center justify-end text-[10px] font-medium leading-4 text-secondary-green' onClick={handleSalesforceDocumentSubmit}>
                          <div className='flex gap-1 items-center justify-end text-[10px] font-medium leading-4 text-secondary-green' onClick={handleSalesforceSubmit}>
                            <svg
                              width='2 4'
                              height='24'
                              viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                              >
                                <path
                                  d='M5.843 16.372C4.273 16.372 3 15.099 3 13.529C3 11.959 4.273 10.686 5.843 10.686C5.843 7.546 8.389 5 11.529 5C13.879 5 15.895 6.426 16.762 8.46C17.051 8.394 17.349 8.351 17.658 8.351C19.873 8.351 21.668 10.146 21.668 12.361C21.668 14.576 19.873 16.371 17.658 16.371'
                                  stroke='#E33439'
                                  strokeWidth='1.5'
                                  strokeMiterlimit='10'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                />
                                <path
                                  d='M8 15C8 12.7909 9.79086 11 12 11C14.2091 11 16 12.7909 16 15C16 17.2091 14.2091 19 12 19C10.5194 19 9.22675 18.1956 8.53513 17M8.53513 17V19M8.53513 17H10.5'
                                  stroke='#E33439'
                                  strokeWidth='1.5'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                />
                              </svg>
                            </div>
                            </div>
                          </>
                        )}

                        {salesForceDocsSuccessIcon && (
                          <>

                            <div className='flex gap-1 items-center justify-end text-[10px] font-medium leading-4 text-secondary-green' >
                              <svg
                                width='24'
                                height='24'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                              >
                                <path
                                  d='M5.843 17.372C4.273 17.372 3 16.099 3 14.529C3 12.959 4.273 11.686 5.843 11.686C5.843 8.546 8.389 6 11.529 6C13.879 6 15.895 7.426 16.762 9.46C17.051 9.394 17.349 9.351 17.658 9.351C19.873 9.351 21.668 11.146 21.668 13.361C21.668 15.576 19.873 17.371 17.658 17.371'
                                  stroke='#147257'
                                  strokeWidth='1.5'
                                  strokeMiterlimit='10'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                />
                              <path
                                d='M16 14L11.1875 19L9 16.7273'
                                stroke='#147257'
                                strokeWidth='1.5'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                          </div>
                        </>
                      )}
                    </div>)}

                  </div>
                </div>:null}

              </div>
            ) : null,
          )}
        </div>

        <div>
          {!sdfcResponse ? (
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

      <div className='flex flex-col gap-[18px] fixed bottom-0 border-t-[1px] w-full p-4 bg-white'>
        <Button
        disabled={
          loData?.user?.role === "Branch Manager" 
            ? !sdfcResponse  // For Branch Manager
            : bre201?.bre_201_response?.statusCode !== 200 || bre201?.bre_201_response?.body?.error_flag !== false // For other roles
        }    //!sdfc response
          inputClasses={`w-full h-12 ${sdfcResponse ? 'font-semibold' : 'font-normal'}`}
          primary={true}
          link= {loData?.user?.role === "Branch Manager"?'/branch-manager':'/'}
        >
          Go to Dashboard
        </Button>
        <Button
          disabled={!ErrorStatus && !enablePrevious}
          inputClasses={`w-full h-12 ${sdfcResponse ? 'font-semibold' : 'font-normal'}`}
          primary={true}
          link='/lead/upload-documents'
        >
          Go to Previous
        </Button>   
      </div>
    </>
  );
};
export default Eligibility;