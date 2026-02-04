import { createPortal } from 'react-dom';
import { IconAdminFormClose, IconClose } from '../../assets/icons';
import PropTypes from 'prop-types';
import Button from '../Button';

const FormPopUp = ({
  title,
  subTitle,
  children,
  hideAction = false,
  showpopup,
  setShowPopUp,
  actionMsg,
  handleActionClick,
  handleResetAction,
  className="",
}) => {
  if (showpopup)
    return createPortal(
      <div
        role='presentation'
        style={{
          zIndex: 999,
        }}
        className='fixed inset-0 w-full bg-black bg-opacity-50'
      >
        <div
          style={{
            width: 684,
            maxHeight: 666,
          }}
          className={`absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4
        rounded-xl shadow-lg flex-col w-full bg-white outline-none focus:outline-none
        ${className}`}
        >
          {/* top div indicating Add/Edit user */}
          <div className='flex items-start justify-between py-4 px-6 border-b border-lighter-grey rounded-t'>
            <div>
              <h3 className='text-lg text-primary-black font-medium'>{title}</h3>
              <p className='text-xs text-dark-grey mt-1'>{subTitle}</p>
            </div>
            <button
              className='p-1 ml-auto'
              onClick={() => {
                handleResetAction();
                setShowPopUp(false);
              }}
            >
              <IconAdminFormClose />
            </button>
          </div>
          {/* whole form content inside of children */}
          {children}
          {/* bottom div with cancel confirm ctas */}
          <div className='p-6 border-t border-lighter-grey flex gap-4 justify-end'>
            <Button
              inputClasses='!text-base font-medium !w-[145px] !py-2.5'
              onClick={() => {
                handleResetAction();
                setShowPopUp(false);
              }}
            >
              Cancel
            </Button>
            {!hideAction && <Button
              primary
              inputClasses='!text-base font-medium !w-[145px] !py-2.5'
              onClick={handleActionClick}
            >
              {actionMsg}
            </Button>}
          </div>
        </div>
      </div>,
      document.body,
    );
  return null;
};

export default FormPopUp;

FormPopUp.propTypes = {
  showpopup: PropTypes.bool,
  hideAction:PropTypes.bool,
  setShowPopUp: PropTypes.func,
  // children: PropTypes.elementType,
  title: PropTypes.string,
  className: PropTypes.string,
  subTitle: PropTypes.string,
};