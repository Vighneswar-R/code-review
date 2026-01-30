import { useContext, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
 
const DownTimePopUp = ({
  showpopup,
  onClose,
  title,
  options,
  handleOptionSelect
}) => {
  const popupRef = useRef(null);
 
  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      onClose();
    }
  };
 
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };
 
  useEffect(() => {
    if (showpopup) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showpopup]);
 
  if (!showpopup) return null;
 
  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300' style={{ zIndex: 1000 }}>
      <div
        ref={popupRef}
        className='bg-white p-4 rounded-lg shadow-lg max-w-xs w-full sm:max-w-sm transform transition-transform duration-300 scale-100'
        style={{ animation: 'fadeIn 0.3s' }}
      >
        <h1 className='text-lg font-semibold mb-2'>{title}</h1>
        {/* Render options list */}
        <div className='overflow-y-auto max-h-60'>
          {options.map((option) => (
            <div key={option.id}>
              <div
                className='py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-200'
                onClick={() => handleOptionSelect(option)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && handleOptionSelect(option)}
              >
                {option.label}
              </div>
              <hr className='my-1 border-gray-300' />
            </div>
          ))}
        </div>
        {/* OK Button */}
        <div className='flex justify-end mt-4'>
          <button
            className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none'
            onClick={onClose}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};
 
DownTimePopUp.propTypes = {
  showpopup: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  handleOptionSelect: PropTypes.func.isRequired,
};
 
export default DownTimePopUp;
