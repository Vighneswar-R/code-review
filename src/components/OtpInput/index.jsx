import { useState, useRef, useEffect, useCallback, useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import otpVerified from '../../assets/icons/otp-verified.svg';
import otpNotVerified from '../../assets/icons/otp-not-verified.svg';
import { AuthContext } from '../../context/AuthContextProvider';
import { getOTPonCall } from '../../global';

const DISALLOW_CHAR = ['-', '_', '.', '+', 'ArrowUp', 'ArrowDown', 'Unidentified', 'e', 'E'];

const OtpInput = ({
  label,
  required,
  verified,
  setOTPVerified,
  onSendOTPClick,
  disableSendOTP,
  verifyOTPCB,
  defaultResendTime,
  hasSentOTPOnce,
  verifiedOnce,
  setVerifiedOnce,
  mobile,
  applicant_id
}) => {
  const { otpFailCount } = useContext(AuthContext);
  const [otp, setOtp] = useState('');
  const [activeOtpIndex, setActiveOtpIndex] = useState(null);
  const [inputDisabled, setInputDisabled] = useState(true);
  const [timer, setTimer] = useState(hasSentOTPOnce);
  const [resendTime, setResendTime] = useState(defaultResendTime || 10);
  const inputRef = useRef(null);


  const handleOtpOnCall = async () => {
    
    try{

      const generateOtp = await getOTPonCall(mobile,{type:'add_applicant',id:applicant_id});
      
      setInputDisabled(false);
      setTimer(true);
      setVerifiedOnce(false);
    }

    catch(err) {

      alert("** ERROR SENDING CALL OTP **")

    }

  }

  const handleOnChange = useCallback(
    async (e) => {
      const { value } = e.target;
      setOtp(value);
      if (value.length >= 5) {
        setInputDisabled(true);
        let res = await verifyOTPCB(value);
        setInputDisabled(res);
        setTimer(false);
      }
    },
    [otp, verifyOTPCB],
  );

  const handleOnOTPSend = useCallback(() => {
    setInputDisabled(false);
    onSendOTPClick();
    setTimer(true);
    setVerifiedOnce(false);
  }, [onSendOTPClick]);

  useEffect(() => {
    if (!hasSentOTPOnce) return;
    setActiveOtpIndex(0);
    setInputDisabled(false);
    setTimer(true);
  }, [hasSentOTPOnce]);

  useEffect(() => {
    let interval = null;
    if (timer) {
      // setOTPVerified(false);
      let time = defaultResendTime || 10;
      interval = setInterval(() => {
        time -= 1;
        setResendTime(time);

        if (time <= 0) {
          clearInterval(interval);
          setTimer(false);
        }
      }, 1000);
    } else {
      clearInterval(interval);
      setTimer(false);
    }
    return () => {
      clearInterval(interval);
    };
  }, [verified, timer, setOTPVerified, defaultResendTime]);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, [activeOtpIndex]);

  const inputClasses = useMemo(() => {
    if (!hasSentOTPOnce) return 'border-stroke bg-white';
    if (hasSentOTPOnce && !verified && !verifiedOnce)
      return 'border-secondary-blue shadow-secondary-blue shadow-primary';
    if (!verified && verifiedOnce) return 'border-primary-red shadow-primary shadow-primary-red';
    if (verified) return 'border-dark-grey';
  }, [verified, hasSentOTPOnce, verifiedOnce]);

  const otpCount = useMemo(() => {
    if (otpFailCount === 1) return 'Invalid OTP. You have 2 attempt(s) left';
    if (otpFailCount === 2) return 'Invalid OTP. You have 1 attempt(s) left';
    return 'You have entered invalid OTP 3 times. You can try after 3 minutes.';
  });

  return (
    <div className='otp-container'>
      <h3 className='flex gap-0.5 text-primary-black'>
        {label}
        {required && <span className='text-primary-red text-sm'>*</span>}
      </h3>
      <div className='flex gap-2 mt-1'>
        <input
          type='number'
          autoComplete='one-time-code'
          disabled={inputDisabled}
          ref={inputRef}
          className={`
              w-full h-12 border bg-transparent outline-none px-4 text-base font-normal text-primary-black transition spin-button-none rounded-lg hidearrow
              ${inputClasses}
            `}
          onChange={handleOnChange}
          onKeyDown={(e) => {
            if (DISALLOW_CHAR.includes(e.key)) {
              e.preventDefault();
              return;
            }
          }}
          value={otp}
          pattern='\d*'
          min='0'
          onInput={(e) => {
            if (!e.currentTarget.validity.valid) e.currentTarget.value = '';
          }}
          onPaste={(e) => {
            e.preventDefault();
            const text = (e.originalEvent || e).clipboardData.getData('text/plain');
            setOtp(text);
            if (text.length >= 5) {
              verifyOTPCB(text);
            }
          }}
        />
      </div>
      <div className='mt-3 flex justify-between items-center'>
        <div className='flex gap-0.5'>
          {!verified && !verifiedOnce && timer && (
            <span className='text-primary-red text-xs leading-[18px]'>0:{resendTime}s</span>
          )}
          {verified === true && !timer && (
            <span className='flex text-primary-black text-xs leading-[18px]'>
              OTP Verified
              <img src={otpVerified} alt='Otp Verified' role='presentation' />
            </span>
          )}
          {!verified && verifiedOnce ? (
            <span className='flex text-[#E33439] text-xs leading-[18px] gap-2'>
              <img src={otpNotVerified} alt='Otp Verified' role='presentation' />
              {otpCount}
            </span>
          ) : null}
        </div>
      </div>


      <div className='w-full flex justify-end gap-2'>

        
         {/* {//OTPonCall &&
        hasSentOTPOnce &&
        disableSendOTP &&
        !timer &&
        verified !== true &&
        otpFailCount !== 3 ? (
          <button
            type='button'
            className='text-primary-red cursor-pointer font-semibold'
            onClick={() => {
              setOtp('');
              inputRef.current?.focus({ preventScroll: true });
              handleOtpOnCall();
            }}
          >
            <span>Get OTP on Call</span>
          </button>
        ) : (
          ''
        )} */}

        <br/>
        {hasSentOTPOnce && disableSendOTP && !timer && verified !== true && otpFailCount !== 3 ? (
          <button
            type='button'
            className='text-primary-red cursor-pointer font-semibold'
            onClick={() => {
              setOtp('');
              inputRef.current?.focus({ preventScroll: true });
              handleOnOTPSend();
            }}
          >
            <span>Resend OTP</span>
          </button>
        ) : (
          ''
        )}
      </div>
    </div>
  );
};

OtpInput.propTypes = {
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  verified: PropTypes.any,
  setOTPVerified: PropTypes.func,
  onSendOTPClick: PropTypes.func,
  disableSendOTP: PropTypes.bool,
  verifyOTPCB: PropTypes.func,
  defaultResendTime: PropTypes.number,
  hasSentOTPOnce: PropTypes.any,
  verifiedOnce: PropTypes.any,
  setVerifiedOnce: PropTypes.any,
};

export default OtpInput;
