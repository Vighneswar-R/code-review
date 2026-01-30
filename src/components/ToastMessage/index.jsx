import { useCallback, useEffect } from 'react';
import { IconClose } from '../../assets/icons';
import { AnimatePresence, motion } from 'framer-motion';
import propTypes from 'prop-types';

const DEFAULT_TIMEOUT = 3000;

const ToastMessage = ({ message, setMessage, timeout = DEFAULT_TIMEOUT, error }) => {
  const handleOnCloseClick = useCallback(
    (e) => {
      e.stopPropagation();
      setMessage(null);
    },
    [setMessage],
  );

  useEffect(() => {
    if (!message) return;
    setTimeout(() => {
      setMessage(false);
    }, timeout);
  }, [message, timeout, setMessage]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          style={{
            backgroundColor: `${error ? '#EF8D32' : '#4E8D7C'}`,
            zIndex: 10000,
          }}
          className={`flex gap-4 items-center 
            absolute left-0 md:right-0 top-16 md:top-16 md:mx-20
            w-full md:w-auto
            p-4 z-50 toast-message
            text-sm md:rounded-lg
          `}
          initial={{ opacity: 0, translateY: -100 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: -100 }}
          transition={{ ease: 'easeOut', duration: 0.52 }}
        >
          {error ? (
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <g clip-path='url(#clip0_4395_48060)'>
                <rect width='24' height='24' rx='12' fill='white' />
                <g clip-path='url(#clip1_4395_48060)'>
                  <path
                    d='M12 9.28003V12.3867'
                    stroke='#EF8D32'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M12 14.72C12.2761 14.72 12.5 14.4961 12.5 14.22C12.5 13.9438 12.2761 13.72 12 13.72C11.7239 13.72 11.5 13.9438 11.5 14.22C11.5 14.4961 11.7239 14.72 12 14.72Z'
                    fill='#EF8D32'
                  />
                  <path
                    d='M11.9987 18.1666C15.4045 18.1666 18.1654 15.4057 18.1654 11.9999C18.1654 8.59416 15.4045 5.83325 11.9987 5.83325C8.59294 5.83325 5.83203 8.59416 5.83203 11.9999C5.83203 15.4057 8.59294 18.1666 11.9987 18.1666Z'
                    stroke='#EF8D32'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </g>
              </g>
              <defs>
                <clipPath id='clip0_4395_48060'>
                  <rect width='24' height='24' rx='12' fill='white' />
                </clipPath>
                <clipPath id='clip1_4395_48060'>
                  <rect width='16' height='16' fill='white' transform='translate(4 4)' />
                </clipPath>
              </defs>
            </svg>
          ) : (
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <rect width='24' height='24' rx='12' fill='#FEFEFE' />
              <path
                d='M17.3337 8L10.0003 15.3333L6.66699 12'
                stroke='#4E8D7C'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          )}

          <span className='flex-1 leading-5 text-sm font-medium text-neutral-white'>{message}</span>

          <button type='button' onClick={handleOnCloseClick}>
            <IconClose color='#FEFEFE' />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToastMessage;

ToastMessage.propTypes = {
  message: propTypes.any,
  setMessage: propTypes.func,
  timeout: propTypes.number,
};