import { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import propTypes from 'prop-types';
import AdminCloseIcon from '../../assets/icons/adminClose';

const DEFAULT_TIMEOUT = 3000;

// setup state in AdminContextProvider
// state = "success", "info", "error"
const AdminToastMessage = ({ message, setMessage, state, timeout = DEFAULT_TIMEOUT }) => {
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
            backgroundColor: `${
              state === 'success' ? '#147257' : state === 'error' ? '#EF8D32' : '#373435'
            }`,
            zIndex: 10000,
          }}
          className={`flex gap-4 items-center 
            absolute left-7 bottom-7 
            py-4 px-5 z-50
            text-sm rounded-xl
          `}
          initial={{ opacity: 0, translateY: 100 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: 100 }}
          transition={{ ease: 'easeOut', duration: 0.52 }}
        >
          <span className='font-medium text-neutral-white'>{message}</span>

          <button type='button' onClick={handleOnCloseClick}>
            <AdminCloseIcon />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminToastMessage;

AdminToastMessage.propTypes = {
  message: propTypes.any,
  setMessage: propTypes.func,
  state: propTypes.string,
  timeout: propTypes.number,
};
