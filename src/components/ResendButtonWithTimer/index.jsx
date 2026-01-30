import { useState, useRef, useEffect, useCallback, useMemo, useContext } from 'react';

const ResendButtonWithTimer = ({ defaultResendTime, startTimer, handleResend, setAARunning }) => {
  const [resendCount, setResendCount] = useState(0);
  const [timer, setTimer] = useState(startTimer);
  const [resendTime, setResendTime] = useState(defaultResendTime || 10);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!startTimer) return;
    setTimer(true);
    setAARunning(true);
  }, [startTimer]);

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
          setAARunning(false);
        }
      }, 1000);
    } else {
      clearInterval(interval);
      setTimer(false);
      setAARunning(false);
    }
    return () => {
      clearInterval(interval);
    };
  }, [timer, defaultResendTime]);

  const otpCount = useMemo(() => {
    if (resendCount === 0) return 'You have 3 attempt(s) left';
    if (resendCount === 1) return 'You have 2 attempt(s) left';
    if (resendCount === 2) return 'You have 1 attempt(s) left';
    if (resendCount === 3) return 'Too many attempts';
  });

  return (
    <div className='otp-container flex items-center'>
      <div className='flex justify-between items-center flex-1'>
        <div className='flex gap-0.5'>
          {timer ? (
            <span className='text-primary-red text-xs leading-[18px]'>0:{resendTime}s</span>
          ) : (
            <span className='flex text-primary-red text-xs leading-[18px]'>{otpCount}</span>
          )}
        </div>
      </div>

      {!timer && resendCount !== 3 ? (
        <span
          className='text-primary-red cursor-pointer font-semibold'
          onClick={() => {
            setResendCount((prev) => prev + 1);
            setTimer(true);
            setAARunning(true);
            handleResend();
          }}
        >
          Resend Link
        </span>
      ) : (
        ''
      )}

    </div>
  );
};

export default ResendButtonWithTimer;
