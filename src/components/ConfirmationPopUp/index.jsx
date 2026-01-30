import { createPortal } from 'react-dom';
import { IconClose } from '../../assets/icons';
import PropTypes from 'prop-types';

const ConfirmationPopUp = ({ showpopup, setShowPopUp, children, title }) => {
  if (showpopup)
    return createPortal(
      <div
        role='presentation'
        onClick={() => setShowPopUp(false)}
        onKeyDown={() => setShowPopUp(false)}
        style={{
          zIndex: 9999999,
        }}
        className='fixed inset-0 w-full bg-black bg-opacity-50'
      >
        <div
          style={{
            width: 646,
          }}
          className='hidden md:flex absolute top-2/4 -translate-y-2/4 left-2/4 -translate-x-2/4 rounded-lg shadow-lg flex-col w-full bg-white outline-none focus:outline-none'
        >
          <div className='flex items-start justify-between py-6 pl-6 pr-4 border-b border-solid border-slate-200 rounded-t'>
            <h3 className='text-xl text-primary-black font-semibold'>{title}</h3>
            <button className='p-1 ml-auto' onClick={() => setShowPopUp(false)}>
              <IconClose />
            </button>
          </div>
          <div className='py-4 pl-6 pr-8'>
            <div style={{ height: 438 }} className='relative pr-4 flex-auto overflow-y-auto'>
              <p
                className='text-base text-dark-grey font-normal leading-relaxed'
                dangerouslySetInnerHTML={{
                  __html: children,
                }}
              />
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );
  return null;
};

export default ConfirmationPopUp;

ConfirmationPopUp.propTypes = {
  showpopup: PropTypes.bool,
  setShowPopUp: PropTypes.func,
  children: PropTypes.elementType,
  title: PropTypes.string,
};
