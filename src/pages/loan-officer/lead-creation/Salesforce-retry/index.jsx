import loading from '../../../../assets/icons/loader_white.png';
import InfoIcon from '../../../../assets/icons/info.svg';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button, TextInput, ToastMessage } from '../../../../components';
import ErrorTost from '../../../../components/ToastMessage/ErrorTost';
import { useNavigate, useParams } from 'react-router-dom';

import { AuthContext } from '../../../../context/AuthContextProvider';
import Topbar from '../../../../components/Topbar';

import { LeadContext } from '../../../../context/LeadContextProvider';
import StatusButton from '../lnt-charges/status-button';
import { getDashboardLeadById, pushToSalesforceDocs, pushToSalesforce, serviceQueryPushToSalesforce,pushToSalesforceDocsService,editFieldsById } from '../../../../global/index';

export default function SalesforceRetry() {
  const {
    values,
    salesforceID,
    setSalesforceID,
    activeIndex,
    setFieldValue,
    updateCompleteFormProgress,
    setActiveIndex,
    primaryIndex,
  } = useContext(LeadContext);
  const [loadingState, setLoadingState] = useState(false);
  const [sfdcStatus, setSfdcStatus] = useState(false);
  const [loader, setLoader] = useState(false);
  const [salesForceLoader, setSalesForceLoader] = useState(false);

  const [salesForceSuccessIcon, setSalesForceSuccessIcon] = useState(false);

  const [loaderDoc, setLoaderDoc] = useState(false);

  const [sfdcRes,setSfdcRes] = useState(values?.lead?.service_query_sfdc_submit_pwa?.[0] || {})

  const [disableSubmit, setDisableSubmit] = useState(false);
  const [disableSubmitDoc, setDisableSubmitDoc] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const [successMsgDocs, setSuccessMsgDocs] = useState(false);

  const [alreadyPushMsg, setAlreadyPushMsg] = useState(false);

  const [errorMsg, setErrorMsg] = useState(false);
  const { token ,toastMessage, setToastMessage, setSfdcCount} = useContext(AuthContext);
  const [leadData, setLeadData] = useState(null);


  const isMounted = useRef(false);

  const docMount = useRef(false)
  const { id } = useParams();
  const hasLogged = useRef(false);

    // salesforce docs
    const [salesForceDocsLoader, setSalesForceDocsLoader] = useState(false);
    const [salesForceDocsSuccessIcon, setSalesForceDocsSuccessIcon] = useState(false);

    const[sfdc_push_res,setSfdc_push_res] = useState(false)
  // get Lead Data
  const getLeadData = async () => {
    console.log('Fetching lead data...');
    try {
      const response = await getDashboardLeadById(id, {
        headers: {
          Authorization: token,
        },
      });

      if(response && isMounted.current){
      setLeadData(response);
      }else{
        console.log("Invalid data recieved ", response);
      }
      // console.log('Lead data fetched:', response);
    } catch (error) {
      if(isMounted.current){
      console.error('Error fetching lead data:', error);
      }
    }
  };

  const callAfterPush = async() => {
    await handleSalesforceDocumentSubmit();
  }

  useEffect(()=> {
  isMounted.current = true; 
    if(sfdc_push_res === true) {
      callAfterPush();
    }

      return () => {
    isMounted.current = false; // cleanup when component 
  };
  },[sfdc_push_res])

  //console.log('lead data in retry bsalesforce', leadData)
  useEffect(() => {
    if (salesForceSuccessIcon && !hasLogged.current) {
        console.log("Sales Force Success Icon Updated:", salesForceSuccessIcon);
        hasLogged.current = true; // Set to true after logging
    }
}, [salesForceSuccessIcon]);

  useEffect(() => {

    if (!isMounted.current) return;

    const fetchDataAndProcess = async () => {
     
     if (!isMounted.current) return;
      if(leadData==undefined)
      await getLeadData();

      if (!isMounted.current) return;

     
      if (leadData && !hasLogged.current) { // Ensure leadData is available before accessing it
       
       
        if(leadData?.lead?.applicant_type != "C" && leadData?.lead?.applicant_type != "G"){

          if (leadData?.lead?.sfdc_submit_pwa?.Status != 'Success'){
            console.log('calling submit');
            await handleSalesforceSubmit();
          }
          else if(leadData?.lead?.sfdc_upload_document_function?.Status != 'Success'){
            console.log('calling document submit');
            await handleSalesforceDocumentSubmit();
          }

        }else if(leadData?.lead?.applicant_type === "C" || leadData?.lead?.is_co_applicant_required==true || leadData?.lead?.applicant_type === "G"){

          if (leadData?.lead?.service_query_sfdc_submit_pwa?.Status != 'Success'){
            await handleSalesforceSubmit();
          }
          else if(leadData?.lead?.sfdc_service_query_upload_document_function?.Status != 'Success' || sfdcRes?.lead?.sfdc_service_query_upload_document_function?.Status != 'Success'){
            console.log('calling document submit');
            await handleSalesforceDocumentSubmit();
          }
        }

        if (leadData?.lead?.sfdc_submit_pwa?.Status === 'Success' && (leadData?.lead?.applicant_type != "C"
          && leadData?.lead?.applicant_type != "G"
        )) {
          setDisableSubmit(true);
          setSalesForceSuccessIcon(true);
        }
       
        if (leadData?.lead?.sfdc_upload_document_function?.Status === 'Success' && (leadData?.lead?.applicant_type != "C" &&leadData?.lead?.applicant_type != "G")) {
          setDisableSubmitDoc(true);
          setAlreadyPushMsg(true);
          setSalesForceDocsSuccessIcon(true);
        }

        if ((leadData?.lead?.service_query_sfdc_submit_pwa?.Status === 'Success' || sfdcRes?.lead?.service_query_sfdc_submit_pwa?.Status === 'Success' ) && (leadData?.lead?.applicant_type === "C" || leadData?.lead?.is_co_applicant_required==true || leadData?.lead?.applicant_type === "G")) {
          setDisableSubmit(true);
          setSalesForceSuccessIcon(true);
        }

        // here change
        if ((leadData?.lead?.sfdc_service_query_upload_document_function?.Status === 'Success' || leadData?.lead?.sfdc_service_query_upload_document_function?.Message == 'Any one of the final flag is not True therefore Application status cannot be changed.') && (leadData?.lead?.applicant_type === "C" || leadData?.lead?.is_co_applicant_required==true || leadData?.lead?.applicant_type === "G")) {
          setDisableSubmitDoc(true);
          setAlreadyPushMsg(true);
          setSalesForceDocsSuccessIcon(true);
        }
     
             
      }
    };

    fetchDataAndProcess();
  }, [leadData]);

 
 
 
  const handleSalesforceSubmit = async () => {
    console.log('handleSalesforceSubmit data in retry bsalesforce start');
    try {
        if (!isMounted.current) return;
        
      if (leadData?.lead?.applicant_type === "C" || leadData?.lead?.applicant_type === "G" || leadData?.lead?.is_co_applicant_required==true) {
        if(leadData?.lead?.service_query_sfdc_submit_pwa?.Status === 'Success' || leadData?.lead?.service_query_sfdc_submit_pwa?.[0]?.Status === 'Success'){
         if (!isMounted.current) return;
          setSalesForceSuccessIcon(true);
          return;
        }

        if (!isMounted.current) return;
        setSalesForceLoader(true);

        const sfdcres1 = await serviceQueryPushToSalesforce(
          leadData?.applicants?.[activeIndex]?.applicant_details?.lead_id,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        if (!isMounted.current) return;

        // console.log("SFRES>>",sfdcres1)
         if (sfdcres1?.salesforce_response?.service_query_sfdc_submit_pwa?.Message == 'Applicant addition not allowed post sanction. Please unlock CAM and do the needful.' && sfdcres1?.salesforce_response?.service_query_sfdc_submit_pwa?.Status == 'Error') {
          await editFieldsById(     // bm submit request to push the case to BM
            values?.lead?.id,
            'lead',
            {
              bm_submit: false,
              bm_submit_at: new Date(),
              sfdc_count: 1,
              sfdc_status: 'SFDC called but not fully Completed',
              service_query_sfdc_submit_pwa: null

            },
            {
              headers: {
                Authorization: token,
              },
            },
          );

          if (!isMounted.current) return;

          setFieldValue(
            `lead.bm_submit`,
            true,
          );
          setSalesForceSuccessIcon(false);
          setSalesForceLoader(false);
          setToastMessage(sfdcres1?.salesforce_response?.service_query_sfdc_submit_pwa?.Message);
          return;
        }

        if (!isMounted.current) return;
        setSfdcRes(sfdcres1)
 
        if (sfdcres1?.lead?.service_query_sfdc_submit_pwa?.[0]?.Status == 'Success' || sfdcres1?.lead?.service_query_sfdc_submit_pwa?.Status == 'Success')
        {

          if (!isMounted.current) return;
          setSalesForceLoader(false);
          setSalesForceSuccessIcon(true);
          setSalesForceDocsLoader(true);
          //setSalesforceID(leadData?.lead?.salesforce_application_id)       ** HERE  
          setToastMessage('Data has been successfully pushed to the Salesforce');
          setSfdc_push_res(true)            //**mark */

        } else {
          console.log("FAILED");
          if (!isMounted.current) return;
          setSalesForceLoader(false);
          setSalesForceSuccessIcon(false);

          // additional handling for unlock cam error

          if(sfdcres1?.lead?.service_query_sfdc_submit_pwa?.[0]?.Message == "Applicant addition not allowed post sanction. Please unlock CAM and do the needful.") {
            setErrorMsg(sfdcres1?.lead?.service_query_sfdc_submit_pwa?.[0]?.Message);
          }

          else {
            setErrorMsg('The data push to Salesforce has failed');
          }
         
        }
      } else {
        if (!isMounted.current) return;
        setSalesForceLoader(true);
        const sfdcres = await pushToSalesforce(
          leadData?.applicants?.[activeIndex]?.applicant_details?.lead_id,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        if (!isMounted.current) return;
        
        if (sfdcres.lead.sfdc_submit_pwa?.Status === 'Success') {
          if (!isMounted.current) return;
          setSalesForceLoader(false);
          setSalesForceSuccessIcon(true);
          // await handleSalesforceDocumentSubmit();
          setSalesforceID(sfdcres.lead?.salesforce_application_id)
          setSfdc_push_res(true)            //**mark */
        } else {
          if (!isMounted.current) return;
            setSalesForceLoader(false);
            setSalesForceSuccessIcon(false);
         
        }
      }
    } catch (err) {
      console.log(err);
      if (!isMounted.current) return;
      setSalesForceLoader(false);
      setSalesForceDocsLoader(false);
      //setEnablePrevious(true);

      let message = err?.response?.data?.error || err?.response?.data?.message
      // setToastMessage(message?.length?message:'The data push to Salesforce has failed');
        if (message == 'No Token 1 found'){
          if (!isMounted.current) return;
          setErrorMsg('Employee ID & Branch Name Is Mismatched. Please contact Itrust Admin')
        }
      //setErrorMsg(message?.length?message:'The data push to Salesforce has failed')
      //setSfdcStatus(true);
      //setSfdcCount((sfdcCount) => sfdcCount + 1);
    }
    console.log('handleSalesforceSubmit data in retry bsalesforce end');
  };
 
  const handleSalesforceDocumentSubmit = async () => {
    console.log('handleSalesforceDocumentSubmit data in retry bsalesforce start');
   
    if (!isMounted.current) return;

   // debugger;
    try {
      // if (((leadData?.lead?.service_query_sfdc_submit_pwa?.[0]?.Status === 'Success' || setSfdcRes?.lead?.service_query_sfdc_submit_pwa?.[0]?.Status === 'Success') || (leadData?.lead?.service_query_sfdc_submit_pwa?.Status === 'Success' || setSfdcRes?.lead?.service_query_sfdc_submit_pwa?.Status === 'Success')) && (leadData?.lead?.applicant_type === "C" ||leadData?.lead?.is_co_applicant_required==true || leadData?.lead?.applicant_type === "G"))
      if (((leadData?.lead?.service_query_sfdc_submit_pwa?.[0]?.Status === 'Success' || sfdcRes?.["lead"]?.["service_query_sfdc_submit_pwa"]?.[0]?.["Status"] === 'Success') || (leadData?.lead?.service_query_sfdc_submit_pwa?.Status === 'Success' || sfdcRes?.["lead"]?.["service_query_sfdc_submit_pwa"]?.["Status"] === 'Success')) && (leadData?.lead?.applicant_type === "C" ||leadData?.lead?.is_co_applicant_required==true || leadData?.lead?.applicant_type === "G"))
        {

          
      if (!isMounted.current) return;

          if(sfdcRes?.lead?.sfdc_submit_pwa?.Status == 'Success' || sfdcRes?.lead?.sfdc_submit_pwa?.[0]?.Status == 'Success') {   // additional if first api is success for service query cases
            setSalesForceSuccessIcon(true)
          }

          setSalesForceDocsLoader(true);

          
      if (!isMounted.current) return;

          // exit on this specific error ** No dms to be called.
         
          if(sfdcRes?.lead?.service_query_sfdc_submit_pwa?.[0]?.Message == "Applicant addition not allowed post sanction. Please unlock CAM and do the needful.") {
            setErrorMsg(sfdcRes?.lead?.service_query_sfdc_submit_pwa?.[0]?.Message);

            return;
          }

        const sfdc_doc_res = await pushToSalesforceDocsService(
          leadData?.applicants?.[activeIndex]?.applicant_details?.lead_id,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        if (!isMounted.current) return; 
 
        if (sfdc_doc_res?.lead?.sfdc_service_query_upload_document_function?.Status==='Success' || sfdc_doc_res?.lead?.sfdc_service_query_upload_document_function?.Message == 'Any one of the final flag is not True therefore Application status cannot be changed.') {
          setSalesForceDocsLoader(false);
          setSalesForceDocsSuccessIcon(true);
          setToastMessage('Data has been successfully pushed to the Salesforce');
        } else {
          setSalesForceDocsLoader(false);
          setSalesForceDocsSuccessIcon(false);
          //setEnablePrevious(true);
          setErrorMsg('The data push to Salesforce has failed');
        }
      } else if(sfdc_push_res == true ||leadData?.lead?.sfdc_submit_pwa?.Status === 'Success'){
        // console.log("PWA STATUS",leadData?.lead?.service_query_sfdc_submit_pwa?.[0]?.Status)
        // console.log("PWA  2",leadData?.lead?.service_query_sfdc_submit_pwa?.Status)
        // console.log("PWA  3 from sfcres",setSfdcRes?.["lead"]?.["service_query_sfdc_submit_pwa"])

        setSalesForceDocsLoader(true);
        const sfdc_doc_res = await pushToSalesforceDocs(
          leadData?.applicants?.[activeIndex]?.applicant_details?.lead_id,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        
      if (!isMounted.current) return;
 
        if (sfdc_doc_res?.lead?.sfdc_upload_document_function?.Status==='Success') {
          setSalesForceDocsLoader(false);
          setSalesForceDocsSuccessIcon(true);
          //setSdfcResponse(true);
          //setEnablePrevious(false);
        } else {
          setSalesForceDocsLoader(false);
          setSalesForceDocsSuccessIcon(false);
        }
      }
    } catch (error) {
      console.log(error);
        if (!isMounted.current) return; 
      setSalesForceDocsLoader(false);
      setSalesForceDocsSuccessIcon(false);
      //setEnablePrevious(true);
      //setSdfcResponse(true);
    }
    console.log('handleSalesforceDocumentSubmit data in retry bsalesforce end');
  };

  // useEffect(()=> {
  // //  console.log("response >> Caught",sfdcRes)
  // },[sfdcRes])
 

  return (
    <>

      <div className='overflow-hidden flex flex-col h-[100vh] bg-medium-grey'>
      <ErrorTost message={errorMsg} setMessage={setErrorMsg} />
      <ToastMessage message={toastMessage} setMessage={setToastMessage} />
        <Topbar id={id} title='Retry Salersforce Push' showClose={true} />
        {/* <h2 className='text-primary-black mt-6 ml-6'><b>Steps to Retry Salesforce</b></h2>
        <hr/>
        <p className='text-sm text-primary-black mt-6 ml-6'><b>1. Click on Salesforce Submit icon</b></p>
        <p className='text-sm text-primary-black mt-6 ml-6'><b>2. Click on Salesforce Submit Document</b></p> */}
        {/* <div className='w-full flex gap-4 mt-6'>

          {
            successMsg && (
              <p className='w-full h-[46px] mt-[30px] mr-5 ml-5' style={{ color: 'green' }} >Salesforce Submit Done Successfully</p>
            )
          }

          {
            successMsgDocs && (
              <p className='w-full h-[46px] mt-[30px] mr-5 ml-5' style={{ color: 'green' }} >Salesforce Document Submit Done Successfully</p>
            )
          }

          {
            errorMsg && (
              <p className='w-full h-[46px] mt-[30px] mr-5 ml-5' style={{ color: 'red' }} >salesforce push not completed</p>
            )
          }

{
            alreadyPushMsg && (
              <p className='w-full h-[46px] mt-[30px] mr-5 ml-5 text-center' style={{ color: 'green' }} >Salesforce Push completed</p>
            )
          }






        </div>
        <div className='w-full flex gap-4 mt-6'>
          <Button
            primary={true}
            disabled={disableSubmit}
            inputClasses='w-full h-[46px] mt-[30px] mr-5 ml-5'

            onClick={handleSalesforceSubmit}

          >
            {loader ? (
              <img src={loading} alt='loading' className='animate-spin duration-300 ease-out' />
            ) : (
              'Retry Salesforce Push'
            )}
          </Button>
        </div>
        <div className='w-full flex gap-4 mt-6'>

          <Button
            primary={true}
            hidden={true}
            disabled={disableSubmitDoc}
            inputClasses='w-full h-[46px] mt-[20px] mr-5 ml-5'
            onClick={handleSalesforceDocumentSubmit}

          >
            {loaderDoc ? (
              <img src={loading} alt='loading' className='animate-spin duration-300 ease-out' />
            ) : (
              'Document Upload'
            )}
          </Button>


        </div> */}
        <p className='text-sm text-primary-black mt-6 ml-6'><b>Salesforce Submit Status</b></p>

        {/* Salesforce ID will be displayed after successfull completion of salesforce push */}

        <p className='text-xs text-primary-black font-normal mt-6 ml-6'>
            Salesforce ID: {salesforceID?? leadData?.lead?.salesforce_application_id}
          </p>

 <p className='text-sm text-primary-black mt-6 ml-6'><b>STEP-1</b></p>

                <div className='flex justify-between items-center rounded-lg border-stroke bg-neutral-50 border-x border-y px-2 py-1.5 mt-6 mr-6 ml-6'>

                  <div className='flex items-center gap-1'>
                 
                    <p className='text-sm text-primary-black'>Salesforce Submit </p>
                  </div>
                  <div>
                    {salesForceLoader ? (
                      <div className='ml-auto'>
                        <img src={loading} alt='loading' className='animate-spin duration-300 ease-out' />
                      </div>
                    ) : (<div>
                      {  !salesForceSuccessIcon && (
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
               
                <p className='text-sm text-primary-black mt-6 ml-6'><b>STEP-2</b></p>        
                <div className='flex justify-between items-center rounded-lg border-stroke bg-neutral-50 border-x border-y px-2 py-1.5 mt-6 mr-6 ml-6'>
               
                  <div className='flex items-center gap-1 mr-6 '>
                 
                    <p className='text-sm text-primary-black'>Salesforce Document Upload  </p>
                  </div>
                  <div>
                    {salesForceDocsLoader && !salesForceLoader ? (
                      <div className='ml-auto'>
                        <img src={loading} alt='loading' className='animate-spin duration-300 ease-out' />
                      </div>
                    ) : (<div>
                      {  !salesForceLoader && !salesforceID && !salesForceDocsSuccessIcon && (
                        <>
                          <div className='flex gap-1 items-center justify-end text-[10px] font-medium leading-4 text-secondary-green' onClick={handleSalesforceDocumentSubmit}>
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
                </div>
      </div>
    </>
  )
}


