import { createPortal } from 'react-dom';
import { IconAdminFormClose, IconClose } from '../../assets/icons';
import PropTypes from 'prop-types';
import Button from '../Button';

const AdminActionControl = ({
  title,
  subtitle,
  actionMsg,
  showpopup,
  setShowPopUp,
  handleActionClick,
  handleResetAction,
  inputClasses,
  buttonClasses,
  hideClasses,
}) => {
  if (showpopup)
    return createPortal(
      <div
        role='presentation'
        style={{
          zIndex: 9999999,
        }}
        className={`fixed inset-0 w-full bg-black bg-opacity-50 ${hideClasses}`}
      >
        <div
          style={{
            width: '448px',
            maxHeight: 666,
          }}
          className='flex absolute top-2/4 -translate-y-2/4 left-2/4 -translate-x-2/4 rounded-xl shadow-lg flex-col w-full bg-white outline-none focus:outline-none'
        >
          {/* top div indicating action control msg */}
          <div className='flex items-start justify-between p-4 rounded-t'>
            <div className='grow'>
              <h3 className='text-lg text-center text-primary-black font-semibold'>{title}</h3>
            </div>
            <button
              onClick={() => {
                handleResetAction();
                setShowPopUp(false);
              }}
              className={inputClasses}
            >
              <IconAdminFormClose />
            </button>
          </div>
          {/* bottom div with action control ctas */}
          <div className='pt-4 pb-6 px-10 border-t border-lighter-grey flex flex-col'>
            <p className='text-center mb-8'>{subtitle}</p>
            <div className='flex gap-4'>
              <Button
                inputClasses={`!text-base font-medium !w-[175px] !py-2.5 ${inputClasses}`}
                onClick={() => {
                  handleResetAction();
                  setShowPopUp(false);
                }}
              >
                Cancel
              </Button>
              <Button
                primary
                inputClasses={`!text-base font-medium !w-[175px] !py-2.5 ${buttonClasses}`}
                onClick={handleActionClick}
              >
                {actionMsg}
              </Button>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );
  return null;
};

export default AdminActionControl;

AdminActionControl.propTypes = {
  showpopup: PropTypes.bool,
  setShowPopUp: PropTypes.func,
  title: PropTypes.string,
  actionDescription: PropTypes.string,
  actionMsg: PropTypes.string,
  handleActionClick: PropTypes.func,
};
