import { useContext, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Button from '../Button';
import { AuthContext } from '../../context/AuthContextProvider';
import { LeadContext } from '../../context/LeadContextProvider';
import { getUserById } from '../../global';

const BankListPopUp = ({
  showpopup,
  onClose,
  title,
  bankNameOptions,
  handleBankSelect
}) => {
  const { loData, token, loAllDetails } = useContext(AuthContext);
  const { values, activeIndex } = useContext(LeadContext);
  const [userData, setUserData] = useState(null);
  const popupRef = useRef(null);

  useEffect(() => {
    if (showpopup) {
      async function getUserData() {
        setUserData(loAllDetails);
        const lo_info = await getUserById(loData.session.user_id, {
          headers: {
            Authorization: token,
          },
        });
        setUserData(lo_info);
      }
      getUserData();
    }
  }, [showpopup, loAllDetails, loData.session.user_id, token]);

  // Handle click outside of popup to close it
  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      onClose();
    }
  };

  useEffect(() => {
    if (showpopup) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showpopup]);

  if (showpopup) {
    return (
      <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
        <div ref={popupRef} className='bg-white p-6 rounded-lg shadow-lg max-w-xs w-full sm:max-w-sm'>
          <div className='flex justify-end'>
            <button className='text-gray-500 hover:text-gray-700' onClick={onClose}>
              <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>
          <h1 className='text-lg font-bold mb-4'>{title}</h1>
          {/* Render bank list options */}
          <div className='overflow-y-auto max-h-80'>
            {bankNameOptions.map((option) => (
              <div key={option.id}>
                <div className='py-2 cursor-pointer' onClick={() => handleBankSelect(option)}>
                  {option.label}
                </div>
                <hr className='my-2' />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

BankListPopUp.propTypes = {
  showpopup: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  bankNameOptions: PropTypes.array,
  handleBankSelect: PropTypes.func,
};

export default BankListPopUp;
