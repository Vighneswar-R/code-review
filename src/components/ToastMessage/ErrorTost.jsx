import { useCallback, useEffect } from 'react';
import { IconClose, TostErrorIcon } from '../../assets/icons';
import { AnimatePresence, motion } from 'framer-motion';
import propTypes from 'prop-types';

const DEFAULT_TIMEOUT = 3000;

const ErrorTost = ({
  message,
  setMessage,
  subMessage,
  setSubMessage,
  timeout = DEFAULT_TIMEOUT,
}) => {
  const handleOnCloseClick = useCallback(
    (e) => {
      e.stopPropagation();
      setMessage(null);
      setSubMessage(null);
    },
    [setMessage],
  );

  useEffect(() => {
    if (!message) return;
    setTimeout(() => {
      setMessage(false);
      setSubMessage(false);
    }, timeout);
  }, [message, timeout, setMessage]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          style={{
            backgroundColor: '#EF8D32',
            zIndex: 1000000,
          }}
          className={`flex gap-4 items-center 
            absolute left-0 md:right-0 top-0 md:top-16 md:mx-20
            w-full md:w-auto
            p-4 z-50 toast-message
            text-sm md:rounded-lg
          `}
          initial={{ opacity: 0, translateY: -100 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: -100 }}
          transition={{ ease: 'easeOut', duration: 0.52 }}
        >
          <div className='min-w-[24px]'>
            <TostErrorIcon />
          </div>

          <div className='flex flex-col grow'>
            <span className='flex-1 leading-5 text-sm font-medium text-neutral-white'>
              {message}
            </span>
            {subMessage && (
              <span className='flex-1 leading-5 text-xs font-medium text-neutral-white'>
                {subMessage}
              </span>
            )}
          </div>

          <button type='button' onClick={handleOnCloseClick}>
            <IconClose color='#FEFEFE' />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorTost;

ErrorTost.propTypes = {
  message: propTypes.any,
  setMessage: propTypes.func,
  subMessage: propTypes.any,
  setSubMessage: propTypes.func,
  timeout: propTypes.number,
};
