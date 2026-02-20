/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import InfoIcon from '../../../../assets/icons/info.svg';
import ScannerIcon from '../../../../assets/icons/scanner.svg';
import CashIcon from '../../../../assets/icons/cash.svg';
import LinkIcon from '../../../../assets/icons/link.svg';
import { Button, ToastMessage } from '../../../../components';
import { useContext, useEffect, useState ,useRef} from 'react';
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
import {CardRadio} from '../../../../components';

const QR_TIMEOUT = 10 * 30;
const LINK_RESEND_TIME = 30;

const LnTCharges = () => {
  const {
    values,
    errors,
    touched,
    handleBlur,
    setFieldValue,
    setCurrentStepIndex,
    updateCompleteFormProgress,
    activeIndex,
  } = useContext(LeadContext);

  const { token } = useContext(AuthContext);

  const { phoneNumberList } = useContext(AuthContext);
  /*const amount =
    values?.applicants?.[activeIndex]?.applicant_details?.bre_101_response?.body?.Display?.[
      'L&T_Charges'
    ] ?? 1500;*/

  const [toastMessage, setToastMessage] = useState('');

   const isMountedRef = useRef(true); 

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

  const handleClick = (label = 'UPI Payment') => {
    setActiveItem(label);
    setPaymentMethod(label);
  };


  const handleSwitch = async() => {

    setSwitchedMode(false);

    if(activeItem !== 'UPI Payment') {
      try{
      await addQR();

      await fetchQR();
  
      setQrTime(QR_TIMEOUT);
      } catch(err){
        console.log("something went wrong ",err);

      }
    }

  };

 

  const addQR=async () =>{
    try{
 const resps = await addLnTCharges(values?.lead?.id, {
        headers: {
          Authorization: token,
        },
      });

      if (isMountedRef.current){
      setLntId(resps.id);	 
      } 
  // const resp = await addLnTCharges(values?.lead?.id, {
  //   headers: {
  //     Authorization: token,
  //   },
  // });
  // setLntId(resp.id);
}catch(err){
  console.log(err);
}
}	
  const fetchQR = async () => {
    try {

      if (isMountedRef.current){
      setLoadingQr(true);
      setAmount(values?.applicants?.[activeIndex]?.applicant_details?.bre_101_response?.body?.Display?.[
        'L&T_Charges'
      ] ?? 1500);
    }


      for (var i=0;i<values?.applicants.length;i++){
        if(values?.applicants[i].applicant_details.applicant_type=='Primary Applicant' && values?.applicants[i].applicant_details.lead_id==values?.lead?.id){
          const breregenerate=await checkLntBre101(values?.applicants[i].applicant_details.id, {
            headers: {
              Authorization: token,
            },
          });
          // console.log(breregenerate);
          setAmount(breregenerate?.bre_101_response?.body?.['L&T_Charges']);
        }
      }
      const resp = await getLnTChargesQRCode(values?.lead?.id, {
        headers: {
          Authorization: token,
        },
      });
      if (resp.DecryptedData?.QRCODE_STRING && isMountedRef.current) setQrCode(resp.DecryptedData.QRCODE_STRING);
    } catch (err) {
      console.log(err);
    } finally {
      if (isMountedRef.current){
      setLoadingQr(false);
      }
    }
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

  
  useEffect(() => {

      isMountedRef.current = true;

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
        if (values?.lead?.id) {
          const resp = await checkIfLntExists(values?.lead?.id, {
            headers: {
              Authorization: token,
            },
          });

            if (!isMountedRef.current) return;
          setFieldValue('lt_charges', resp);
          setPaymentStatus('success');
        }

        updateCompleteFormProgress();
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
          if (isMountedRef.current){
        setLoadingPaymentStatus(false);
          }
      }
    
  
  })();

      return () => {
      isMountedRef.current = false;  // clean up function 
    };

  }, []);

  return (
    <div >

{paymentStatus === 'success' ? (

  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh', // Cover the full viewport height
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional: Add a semi-transparent background
    zIndex: 9999, // Ensure it is on top of other components
    // Conditionally display it
    alignItems: 'center', // Center content vertically
  }}>
        <PaymentSuccess amount={amount} back={() => setPaymentStatus('')} method={paymentMethod} />

          </div>
      ) : null}


   <div className="flex flex-col h-screen mt-[10%]">
  <h3 className="text-center">Choose Payment Option</h3>
  <div className="flex gap-4 w-full mt-8">
    <CardRadio
      onChange={() => navigate('/lead/airpay-payment')}
      containerClasses="flex-1"
      label = 'AirPay'
      current = '1'
      value = '2'
    >
      <div style={{height:'50px'}}>
      <img src = 'https://airpay.co.in/resources/images/airpay-text.svg' style={{objectFit:'contain',width:'100%',height:'50px'}}/>
      </div>
    </CardRadio>

    <CardRadio
      onChange={() => navigate('/lead/easebuzz-payment')}
      containerClasses="flex-1"
      label = 'EaseBuzz'
      current = '1'
      value = '2'
    >
      <div style={{height:'50px'}}>
      <img src='https://ebz-static.s3.ap-south-1.amazonaws.com/stoplight/Easebuzz_api_logo+1.png' alt='Easebuzz Logo' style={{objectFit:'contain',width:'100%',height:'50px'}}/>

      </div>
    </CardRadio>
  </div>
  <span   className="border-none text-center text-base not-italic font-semibold underline h-12 bg-transparent text-primary-red fixed bottom-20 left-0 w-full"

                    onClick={showConfirmSkip}
                  >
                    Skip for now
                  </span>
</div>


{/* Confirm skip for now */}
<DynamicDrawer open={isConfirmSkipVisible} setOpen={setConfirmSkipVisibility} height='223px'>
        <div className='flex gap-1'>
          <div className=''>
            <h4 className='text-center text-base not-italic font-semibold text-primary-black mb-2'>
              Are you sure you want to skip and go to the next step?
            </h4>
            <p className='text-center text-xs not-italic font-normal text-primary-black'>
              Don't worry. You can pay L&T charges later.
            </p>
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
            link='/lead/property-details'
          >
            Yes, skip
          </Button>
        </div>
      </DynamicDrawer>
    </div>
  );

  
};

export default LnTCharges;

LnTCharges.propTypes = {
  amount: PropTypes.number,
};