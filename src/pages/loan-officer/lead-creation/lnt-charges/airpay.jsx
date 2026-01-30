/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import InfoIcon from '../../../../assets/icons/info.svg';
import ScannerIcon from '../../../../assets/icons/scanner.svg';
import CashIcon from '../../../../assets/icons/cash.svg';
import LinkIcon from '../../../../assets/icons/link.svg';
import { Button, ToastMessage } from '../../../../components';
import { useContext, useEffect, useState } from 'react';
import DynamicDrawer from '../../../../components/SwipeableDrawer/DynamicDrawer';
import { IconClose } from '../../../../assets/icons';
import { LeadContext } from '../../../../context/LeadContextProvider';
import TextInputWithSendOtp from '../../../../components/TextInput/TextInputWithSendOtp';
import QRCode from 'react-qr-code';
import {
  addLnTCharges,
  checkIfLntExists,
  checkPaymentStatus,
  getLnTChargesQRCode,
  checkLntBre101,
  makePaymentByCash,
  makePaymentByLink,
  editFieldsById,
  single_payment
} from '../../../../global';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../../../components/Topbar';
import PropTypes from 'prop-types';
import { CircularProgress } from '@mui/material';
import { AuthContext } from '../../../../context/AuthContextProvider';
//import DropDown from '../../../../components/DropDown';
import DropDown from '../../../../components/DropDown';
import PaymentSuccess from './payment-success';
import PaymentFailure from './payment-failed';
import Separator from './separator';
import StatusButton from './status-button';
import AccordionItem from './accordion-item';
import LoaderDynamicText from '../../../../components/Loader/LoaderDynamicText';

const QR_TIMEOUT = 10 * 30;
const LINK_RESEND_TIME = 30;

const AirpayPayment = () => {
  const {
    values,
    errors,
    touched,
    handleBlur,
    setFieldValue,
    setCurrentStepIndex,
    updateCompleteFormProgress,
    activeIndex,
    activeLNT,
  } = useContext(LeadContext);

  const { token } = useContext(AuthContext);

  const { phoneNumberList } = useContext(AuthContext);
  /*const amount =
    values?.applicants?.[activeIndex]?.applicant_details?.bre_101_response?.body?.Display?.[
      'L&T_Charges'
    ] ?? 1500;*/

  const [toastMessage, setToastMessage] = useState('');

  const [mobile_number, setMobileNumber] = useState('');
  const [applicantNumberList, setApplicantNumberList] = useState([]);
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('UPI Payment');
  const [checkingStatus, setCheckingStatus] = useState('');
  const [isConfirmPaymentVisible, setConfirmPaymentVisibility] = useState(false);
  const [isConfirmSkipVisible, setConfirmSkipVisibility] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(''); // 'success' | 'failure' | ''
  const [qrCode, setQrCode] = useState('');
  const [loadingQr, setLoadingQr] = useState(false);
  const [loadingPaymentStatus, setLoadingPaymentStatus] = useState(false);
  const [lntId, setLntId] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('UPI Payment');
  const [hasSentOTPOnce, setHasSentOTPOnce] = useState(false);
  const [disablePhoneNumber, setDisablePhoneNumber] = useState(false);

  const [disableSendLink, setDisableSendLink] = useState(true);
  const [sendLinkTime, setSendLinkTime] = useState(0);
  const [showResendLink, setShowResendLink] = useState(false);
// drop-down changes
  const [numberList, setNumberList] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState('');

  const [qrTime, setQrTime] = useState(QR_TIMEOUT);
  const [amount, setAmount] = useState(1500);

  const[switchedMode,setSwitchedMode] = useState(false)

  const[goBack,setGoBack] = useState(false);

  const[breDone,setBreDone] = useState(false)


  const handleClick = (label = 'UPI Payment') => {
    setActiveItem(label);
    setPaymentMethod(label);
  };

  useEffect(()=> {

    // ADD Default selected gateway while mounting so next visit will take customer here directly


    editFieldsById(values?.lead?.id,'lead',{

        selected_gateway:'airpay-payment'
    }
    ,{
        headers: {
          Authorization: token,
        },
      })

      setFieldValue('lead.selected_gateway', 'airpay-payment');


  },[])


  const handleSwitch = async() => {

    setSwitchedMode(false)

    if(activeItem !== 'UPI Payment') {
      addQR();

      fetchQR();
  
      setQrTime(QR_TIMEOUT);
    }

  }

 

  const addQR=async () =>{
 const resps = await addLnTCharges(values?.lead?.id, {
        headers: {
          Authorization: token,
        },
      });
      setLntId(resps.id);	  
  const resp = await addLnTCharges(values?.lead?.id, {
    headers: {
      Authorization: token,
    },
  });
  setLntId(resp.id);
}	
  const fetchQR = async () => {
    try {
      setLoadingQr(true);
      setAmount(values?.applicants?.[activeIndex]?.applicant_details?.bre_101_response?.body?.Display?.[
        'L&T_Charges'
      ] ?? 1500);
      let toReturn;

        // ** checking here

        let existing_bre;

        let applicants = values?.applicants;
  
        for(const app of applicants){
  
          if(app?.applicant_details?.lt_bre_101_response){
            existing_bre = app?.applicant_details?.lt_bre_101_response;
            break;
          }
        }

        if(existing_bre?.['L&T_Charges']) {
          setAmount(existing_bre?.['L&T_Charges']);
        }

        if(!existing_bre || existing_bre == null){

      for (var i=0;i<values?.applicants.length;i++){
        if(values?.applicants[i].applicant_details.applicant_type=='Primary Applicant' && values?.applicants[i].applicant_details.lead_id==values?.lead?.id){

          try{
            const breregenerate=await checkLntBre101(values?.applicants[i].applicant_details.id, {
              headers: {
                Authorization: token,
              },
            });

            
            console.log(breregenerate);

            
            // check for the amount and bypass if 0 - First attempt

            if(breregenerate?.bre_101_response?.body?.['L&T_Charges'] == 0) {
              setPaymentStatus('success');
              setBreDone(true);
              setLoadingQr(false);
              setFieldValue(`applicants[${i}].applicant_details.lt_bre_101_response`,breregenerate?.bre_101_response) 
              setAmount(0);
              updateCompleteFormProgress();
              toReturn = true;
              }

            if(breregenerate?.bre_101_response?.body?.['L&T_Charges']) {
              setAmount(breregenerate?.bre_101_response?.body?.['L&T_Charges']);
            }
          }

          catch(err) {
            console.log("ERROR REGENERATING LNT Bre101 >",err)
          }
   
        }
      }
    }

      if(toReturn) return;

      const resp = await getLnTChargesQRCode(values?.lead?.id, {
        headers: {
          Authorization: token,
        },
      });
      if (resp.DecryptedData?.QRCODE_STRING) setQrCode(resp.DecryptedData.QRCODE_STRING);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingQr(false);
    }
  };


  useEffect(() => {    // ** NEW ADDED FOR NUMBER LIST

    (async () => {
      try {
        if (values?.applicants != null) {
          for (let i = 0; i < values?.applicants.length; i++) {
            const mobileNumber = values?.applicants?.[i]?.applicant_details?.mobile_number;
            setApplicantNumberList(prevArray => [...prevArray, mobileNumber]);
          }
        }
        setAmount(values?.applicants?.[activeIndex]?.applicant_details?.bre_101_response?.body?.Display?.[
          'L&T_Charges'
        ] ?? 1500);
        // check whether LnT exists
        setLoadingPaymentStatus(true);
        if (applicantNumberList) {
          const newItems = [];
          for (let i = 0; i < applicantNumberList.length; i++) {
            if (true) {
              const num = applicantNumberList[i];
              const newItem =  { label: num, value: num };
              newItems.push(newItem);
              //const firstName = values.applicants[i]?.applicant_details?.first_name;
            }
          }
          setNumberList(newItems);
        }
      } catch (err) {

        // //**start */

        // // try {
        // //   const resp = await checkPaymentStatus(values?.lead?.id, {check:true},{
        // //     headers: {
        // //       Authorization: token,
        // //     },
        // //   });
         
        // //   if (resp?.airpay_response_json?.airpay_verify_transaction_status == '200') {
        // //     setPaymentStatus('success');
        // //   }
        // // } catch (error) {
        // setLoadingPaymentStatus(false);
        // const resp = await addLnTCharges(values?.lead?.id, {
        //   headers: {
        //     Authorization: token,
        //   },
        // });
        // setLntId(resp.id);
        // await fetchQR();

        // // Reset
        // setHasSentOTPOnce(false);
        // setShowResendLink(false);
        // setActiveItem('UPI Payment');

        // updateCompleteFormProgress();

        console.log("ERROR",err)
      } finally {
        setLoadingPaymentStatus(false);
      }
    
  
  })();
  }, []);

  // useEffect(() => {
  //   if (applicantNumberList) {
  //     const newItems = [];
  //     for (let i = 0; i < applicantNumberList.length; i++) {
  //       if (true) {
  //         const num = applicantNumberList[i];
  //         const newItem =  { label: num, value: num };
  //         newItems.push(newItem);
  //         //const firstName = values.applicants[i]?.applicant_details?.first_name;
  //       }
  //     }
  //     setNumberList(newItems);
  //   }
  // }, [values?.applicants, activeIndex]); // Add dependencies here as needed
  // console.log('setNumberList',numberList)
  useEffect(() => {
    if (applicantNumberList) {
      const uniqueItems = new Set();
      const newItems = [];
   
      for (let i = 0; i < applicantNumberList.length; i++) {
        const num = applicantNumberList[i];
        if (!uniqueItems.has(num)) {
          uniqueItems.add(num);
          newItems.push({ label: num, value: num });
        }
      }
   
      setNumberList(newItems);
    }
  }, [applicantNumberList, activeIndex]); // Add dependencies here as needed
   
  
  useEffect(()=> {


    if(single_payment == true){
      navigate('/lead/easebuzz-payment');
      return;
    }

    (async () => {
      try {
        // check whether LnT exists
        if (values?.lead?.id) {
          const resp = await checkIfLntExists(values?.lead?.id, {
            headers: {
              Authorization: token,
            },
          });
          setFieldValue('lt_charges', resp);
        }

        setPaymentStatus('success');

                   // if LNT BRE Already exists for any of the applicant (Looking for all as there could be switch cases as well);

                   const activeApplicants = values.applicants;

                   let lnt_bre;
         
         
                   for(const applicant of activeApplicants){
         
                     if(applicant?.applicant_details?.lt_bre_101_response){
                       lnt_bre = applicant?.applicant_details?.lt_bre_101_response;
         
                       break;
                     }
         
                   };
         
                   // check if lt_bre exists already & if the amount is 0 to bypass
         
                   if(lnt_bre && lnt_bre?.["body"]?.["L&T_Charges"] == 0){
                     setAmount(0);
                   }

        updateCompleteFormProgress();
      } catch (err) {
        console.error(err);

         // if LNT BRE Already exists for any of the applicant (Looking for all as there could be switch cases as well);

         const activeApplicants = values.applicants;

         let lnt_bre;


         for(const applicant of activeApplicants){

           if(applicant?.applicant_details?.lt_bre_101_response){
             lnt_bre = applicant?.applicant_details?.lt_bre_101_response;

             break;
           }

         };

         // check if lt_bre exists already & if the amount is 0 to bypass

         if(lnt_bre && lnt_bre?.["body"]?.["L&T_Charges"] == 0){
           setBreDone(true);
           setLoadingQr(false);
           setAmount(0);
updateCompleteFormProgress();
         }

        (async function fetchCode() {
  
          let bypass = false;

          let body = {};

          if(lnt_bre && lnt_bre?.["body"]?.["L&T_Charges"] == 0){
            bypass = true;
            body = {lead_id:values?.lead?.id,
              airpay_verify_ap_transaction_id:`BP-${uuidv4()}`,
              status:'Completed',
              payable_amount:Number(0)
            }
          }

          else {
            body = values?.lead?.id
          }


          const resp = await addLnTCharges(values?.lead?.id, {
            headers: {
              Authorization: token,
            },
          },bypass);

          if(bypass == true){
            setPaymentStatus('success');
            setAmount(0);
            return;
          } 
          
          setLntId(resp.id);
          await fetchQR();
  
          // Reset
          setHasSentOTPOnce(false);
          setShowResendLink(false);
          setActiveItem('UPI Payment');
  
          updateCompleteFormProgress();
   
      })()
      }
    })();
  
  },[])
 

  useEffect(() => {
    (async () => {
      try {
        // check whether LnT exists
        if (values?.lead?.id) {
          const resp = await checkIfLntExists(values?.lead?.id, {
            headers: {
              Authorization: token,
            },
          });
          setFieldValue('lt_charges', resp);
        }

        setPaymentStatus('success');


        console.log("I AM THE PAID RESP",resp)
        updateCompleteFormProgress();
      } catch (err) {
        console.error(err);
      }
    })();
  }, [paymentStatus]);

  const handleCheckingStatus = async (label = '') => {
    try {
      setCheckingStatus(label);
      const resp = await checkPaymentStatus(values?.lead?.id, {},{
        headers: {
          Authorization: token,
        },
      });
      // if (resp?.airpay_response_json?.airpay_verify_transaction_status == '200') {
      //   setPaymentStatus('success');
      // }else if (resp?.airpay_response_json?.airpay_verify_transaction_status == '211') {
      //   setPaymentStatus('In Progress');
      // }else if (resp?.airpay_response_json?.airpay_verify_transaction_status == '400') {
      //   setPaymentStatus('failure');
      // }
      if (resp?.airpay_response_json?.airpay_verify_transaction_status == '200') {
        setPaymentStatus('success');
      }else if (resp?.airpay_response_json?.airpay_verify_transaction_status == '400') {
        // setPaymentStatus('failure');
        alert('Failed')

      }else{
        alert(resp?.airpay_response_json?.airpay_verify_message);
      }
    } catch (error) {
      if (error?.code === 'ERR_CANCELED') {
        console.log('canceled check status');
        return;
      }
    //   setPaymentStatus('failure');
    alert('Failed')

      console.log(error);
    } finally {
      setCheckingStatus('');
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (paymentStatus !== '') {
        clearInterval(interval);
        return;
      }

      if(switchedMode == true) {
        clearInterval(interval);
        return;
      }

      if(breDone == true){
        clearInterval(interval);
        return;
      }

      setQrTime((prev) => {
        if (prev === 0) {
          addQR();
	  fetchQR();
          return QR_TIMEOUT;
        }
        if (loadingQr) return prev;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loadingQr, paymentStatus,switchedMode]);

  function secondsToMinSecFormat(sec) {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  const handleOnPhoneNumberChange = async (e) => {
   // const phoneNumber = e.currentTarget.value;

    const phoneNumber = selectedNumber;
    const pattern = /^\d+$/;
    if (!pattern.test(phoneNumber) && phoneNumber.length > 0) {
      return;
    }

    if (phoneNumber < 0) {
      e.preventDefault();
      return;
    }
    if (phoneNumber.length > 10) {
      return;
    }
    if (
      phoneNumber.charAt(0) === '0' ||
      phoneNumber.charAt(0) === '1' ||
      phoneNumber.charAt(0) === '2' ||
      phoneNumber.charAt(0) === '3' ||
      phoneNumber.charAt(0) === '4' ||
      phoneNumber.charAt(0) === '5'
    ) {
      e.preventDefault();
      return;
    }

    setMobileNumber(phoneNumber);
    setFieldValue('lnt_mobile_number.mobile_number', phoneNumber);

    if (phoneNumber.length === 10) {
      setHasSentOTPOnce(false);
    }
  };

  const handlePaymentByCash = async () => {
    await makePaymentByCash(lntId, {
      headers: {
        Authorization: token,
      },
    });
    setPaymentStatus('success');
  };

  const sendPaymentLink = async () => {
    setDisablePhoneNumber(true);
    setHasSentOTPOnce(true);
    await addQR();
    const resp = await makePaymentByLink(
      values?.lead?.id,
      {
        mobile_number: values?.lnt_mobile_number?.mobile_number,
      },
      {
        headers: {
          Authorization: token,
        },
      },
    );
    if (resp) {
      setToastMessage('Link has been sent to the entered mobile number');
    }
    setShowResendLink(false);
    setSendLinkTime(LINK_RESEND_TIME);
    const interval = setInterval(() => {
      setSendLinkTime((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          setDisablePhoneNumber(false);
          setShowResendLink(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const showConfirmPayment = () => setConfirmPaymentVisibility(true);
  const hideConfirmPayment = () => setConfirmPaymentVisibility(false);

  const showConfirmSkip = () => {
    setConfirmSkipVisibility(true);
    setCurrentStepIndex(6);
  };
  const hideConfirmSkip = () => setConfirmSkipVisibility(false);

  const handleSkipPayment = () => {
    navigate(0);
  };

  const handleDropdownChange = (value, index) => {
    setSelectedNumber(value);
       // const phoneNumber = e.currentTarget.value;

       const phoneNumber = value;
       const pattern = /^\d+$/;
       if (!pattern.test(phoneNumber) && phoneNumber.length > 0) {
         return;
       }
   
       if (phoneNumber < 0) {
         e.preventDefault();
         return;
       }
       if (phoneNumber.length > 10) {
         return;
       }
       if (
         phoneNumber.charAt(0) === '0' ||
         phoneNumber.charAt(0) === '1' ||
         phoneNumber.charAt(0) === '2' ||
         phoneNumber.charAt(0) === '3' ||
         phoneNumber.charAt(0) === '4' ||
         phoneNumber.charAt(0) === '5'
       ) {
         e.preventDefault();
         return;
       }
   
       setMobileNumber(phoneNumber);
       setFieldValue('lnt_mobile_number.mobile_number', phoneNumber);
   
       if (phoneNumber.length === 10) {
         setHasSentOTPOnce(false);
       }
       setDisableSendLink(false);
  }

  return (
    <>
      {!paymentStatus ? (
        <>
          <div className='overflow-hidden flex flex-col h-[100vh] bg-medium-grey'>
            <Topbar title='L&T Charges' id={values?.lead?.id} showClose={true} />

            {loadingPaymentStatus ? (
              <div className='absolute flex items-center w-full dashBoardLoaderHeight bg-white'>
                <LoaderDynamicText text='Loading...' textColor='black' height='60%' />
              </div>
            ) : (
              <>
                <div className='flex flex-col bg-medium-grey gap-2 overflow-auto max-[480px]:no-scrollbar p-[20px] pb-[150px] flex-1'>
                  <div className='flex flex-col'>
                    {/* Label */}
                    <div className='flex items-start gap-2 mb-6'>
                      <img src={InfoIcon} className='w-4 h-4' alt='info-icon' />
                      <p className='text-xs not-italic font-normal text-dark-grey'>
                        L&T charges for this application is
                        <span className='text-xs not-italic font-semibold text-primary-black'>{` Rs. ${amount}/-`}</span>
                      </p>
                    </div>

                    {/* Select Payment */}
                    <div>
                      <p className='text-base not-italic font-medium text-dark-grey mb-3'>
                        Select payment method
                      </p>

                      {/* Accordion */}
                      <div className='bg-white rounded-lg flex p-3 flex-col items-center'>
                        <AccordionItem
                          label={'UPI Payment'}
                          iconImage={ScannerIcon}
                          open={activeItem == 'UPI Payment'}
                          setOpen={()=>{
                            
                            handleClick();

                            handleSwitch();
                          
                          }}
                          disabled={checkingStatus && checkingStatus !== 'UPI Payment'}
                        >
                          <div className='mb-4'>
                            <div className='flex justify-center items-center py-2'>
                              {loadingQr || qrCode == '' ? (
                                <div className='w-[180px] h-[180px] flex justify-center items-center'>
                                  <CircularProgress color='error' />
                                </div>
                              ) : (
                                <QRCode title='lnt-charges' value={qrCode} size={180} />
                              )}
                            </div>

                            <p className='text-black text-center text-sm not-italic font-normal mb-4'>
                              QR code will get changed in
                              <span className='text-black text-sm not-italic font-semibold'>
                                {` ${secondsToMinSecFormat(qrTime)}s`}
                              </span>
                            </p>

                            <StatusButton
                              onClick={() => handleCheckingStatus('UPI Payment')}
                              isLoading={checkingStatus === 'UPI Payment'}
                            />
                          </div>
                        </AccordionItem>
                        {/* <Separator />
                        <AccordionItem
                          label={'Cash'}
                          iconImage={CashIcon}
                          open={activeItem == 'Cash'}
                          setOpen={handleClick}
                          disabled={checkingStatus && checkingStatus !== 'Cash'}
                        ></AccordionItem> */}
                        <Separator />
                        <AccordionItem
                          label={'Pay via Link'}
                          iconImage={LinkIcon}
                          open={activeItem == 'Pay via Link'}
                          setOpen={()=> {
                            handleClick('Pay via Link');
                            setSwitchedMode(true)
                          }}
                          disabled={checkingStatus && checkingStatus !== 'Pay via Link'}
                          className='space-y-4'
                        >
                          {/* <TextInputWithSendOtp
                            type='tel'
                            inputClasses='hidearrow'
                            label='Mobile Number'
                            placeholder='Eg: 1234567890'
                            required
                            name='lnt_mobile_number.mobile_number'
                            value={mobile_number}
                            onChange={handleOnPhoneNumberChange}
                            error={
                              errors?.lnt_mobile_number?.mobile_number ||
                              (phoneNumberList?.lo && phoneNumberList.lo == mobile_number
                                ? 'Mobile number cannot be same as Lo number'
                                : '') || (!applicantNumberList.includes(mobile_number)? 'Mobile number must match that of the applicant or co-applicant':'')
                            }
                            touched={touched?.lnt_mobile_number?.mobile_number}
                            onOTPSendClick={sendPaymentLink}
                            disabledOtpButton={
                              !mobile_number ||
                              !!errors?.lnt_mobile_number?.mobile_number ||
                              hasSentOTPOnce ||
                              phoneNumberList?.lo == mobile_number ||!applicantNumberList.includes(mobile_number)
                            }
                            hideOTPButton={hasSentOTPOnce}
                            disabled={disablePhoneNumber}
                            buttonLabel='Send Link'
                            onBlur={(e) => {
                              handleBlur(e);
                            }}
                            pattern='\d*'
                            onFocus={(e) =>
                              e.target.addEventListener(
                                'wheel',
                                function (e) {
                                  e.preventDefault();
                                },
                                { passive: false },
                              )
                            }
                            min='0'
                            // onInput={(e) => {
                            //   if (!e.currentTarget.validity.valid) e.currentTarget.value = '';
                            // }}
                          /> */}
                            <div className={`flex flex-row gap-2 flex-1 items-center`}>
                              <DropDown
                                label='Mobile Numbers'
                                required
                                options={numberList}
                                placeholder='Choose Number'
                                onChange={(e) => {
                                  const selectedValue = e;
                                  const selectedIndex = numberList.findIndex(option => option.value === selectedValue);
                                  handleDropdownChange(selectedValue, selectedIndex);
                                }}
                                value={selectedNumber} // Bind the value to selectedAddress state
                                defaultSelected={selectedNumber} // Set default selection if needed
                                name={selectedNumber}
                                error={''}
                                touched={''}
                                onBlur={() => { }}
                                disabled={false}
                              />
                              <Button
                                disabled={disableSendLink}
                                primary
                                inputClasses='h-12 w-half md:w-auto' // Adjust width as needed
                                onClick={sendPaymentLink}
                              >
                                SEND LINK
                              </Button>
                            </div>


                        
                          <div className='flex items-center'>
                            {sendLinkTime && sendLinkTime > 0 ? (
                              <span className='mr-auto text-primary-red cursor-pointer'>
                                {`${secondsToMinSecFormat(sendLinkTime)}s`}
                              </span>
                            ) : null}

                            {showResendLink ? (
                              <button
                                type='button'
                                className='text-primary-red cursor-pointer font-semibold ml-auto'
                                onClick={sendPaymentLink}
                              >
                                <span>Resend Link</span>
                              </button>
                            ) : null}
                          </div>

                          <StatusButton
                            disabled={!mobile_number || !!errors.lnt_mobile_number?.mobile_number}
                            onClick={() => handleCheckingStatus('Pay via Link')}
                            isLoading={checkingStatus === 'Pay via Link'}
                          />
                        </AccordionItem>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='pl-[20px] pr-[20px] mt-auto w-full space-y-4 bg-transparent flex flex-col items-center'>
                  {activeItem === 'Cash' ? (
                    <Button
                      primary={true}
                      inputClasses={'h-12 w-full'}
                      onClick={showConfirmPayment}
                    >
                      Confirm Payment
                    </Button>
                  ) : null}
                  
                  {['AirPay','Easebuzz']?.includes(values?.applicants?.[activeIndex]?.applicant_details?.lt_bre_101_response?.body?.['L&T_API']) || activeLNT !== 'any'?   <span
                    className='border-none text-center text-base not-italic font-semibold underline h-12 bg-transparent text-primary-red'
                    onClick={showConfirmSkip}
                  >
                                                            Skip for now

                  </span>:<span
                    className='border-none text-center text-base not-italic font-semibold underline h-12 bg-transparent text-primary-red'
                    onClick={()=>{
                      setGoBack(true)
                      showConfirmSkip();
                    }}
                  >                                        
                                        Go Back


                  </span>}
                </div>
              </>
            )}
          </div>

          {/* Confirm payment by cash */}
          <DynamicDrawer
            open={isConfirmPaymentVisible}
            setOpen={setConfirmPaymentVisibility}
            height='202px'
          >
            <span className='text-black text-center text-sm not-italic font-normal'>
              Confirm if you received the payment in cash of
            </span>
            <h3 className=' mt-2 text-center text-[22px] not-italic font-medium text-secondary-green'>
              {`Ã¢â€šÂ¹ ${amount}/-`}
            </h3>
            <div className='w-full flex gap-4 mt-6'>
              <Button inputClasses='w-full h-[46px]' onClick={hideConfirmPayment}>
                Cancel
              </Button>
              <Button primary={true} inputClasses=' w-full h-[46px]' onClick={handlePaymentByCash}>
                Confirm
              </Button>
            </div>
          </DynamicDrawer>
        </>
      ) : null}
      {paymentStatus === 'success' ? (
        <PaymentSuccess amount={amount} back={() => setPaymentStatus('')} method={paymentMethod} />
      ) : null}
      {paymentStatus === 'failure' && paymentStatus === 'In Progress' ? (
        <PaymentFailure
          amount={amount}
          back={() => {
            setPaymentStatus('');
          }}
          skip={showConfirmSkip}
          status={paymentStatus}
        />
      ) : null}

      {/* Confirm skip for now */}
  <DynamicDrawer open={isConfirmSkipVisible} setOpen={setConfirmSkipVisibility} height='223px'>
          <div className='flex gap-1'>
            <div className=''>
              <h4 className='text-center text-base not-italic font-semibold text-primary-black mb-2'>
                {goBack?"Are you sure you want to go back to the previous step":"Are you sure you want to skip and go to the next step?"}
                
              </h4>
              {!goBack&&  <p className='text-center text-xs not-italic font-normal text-primary-black'>
                Don't worry. You can pay L&T charges later.
              </p>}
            </div>
            <div className=''>
              <button onClick={hideConfirmSkip}>
                <IconClose />
              </button>
            </div>
          </div>
  
          <div className='w-full flex gap-4 mt-6'>
            <Button inputClasses='w-full h-[46px]' onClick={hideConfirmSkip}>
              Stay
            </Button>
            <Button
              primary={true}
              inputClasses=' w-full h-[46px]'
              onClick={() => {
                hideConfirmSkip();
                setCurrentStepIndex(6);
              }}
              link={goBack?'/lead/lnt-charges':'/lead/property-details'}
            >
              {goBack?'Confirm':' Yes, skip'}
            </Button>
          </div>
        </DynamicDrawer>

      <ToastMessage message={toastMessage} setMessage={setToastMessage} />
    </>
  );
};

export default AirpayPayment;

AirpayPayment.propTypes = {
  amount: PropTypes.number,
};
