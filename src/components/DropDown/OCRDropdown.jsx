/* eslint-disable react/display-name */
import { useState, useEffect, useRef, useCallback, memo, useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  CameraIcon,
  IconArrowDown,
  IconThumb,
  IconTick,
  TickGreen,
  VerifyOCRIcon,
} from '../../assets/icons';
import { LeadContext } from '../../context/LeadContextProvider';

const OCRDropdown = memo(
  ({
    defaultSelected,
    placeholder,
    label,
    required,
    options,
    onChange,
    optionsMaxHeight,
    disabled,
    showIcon = true,
    inputClasses,
    error,
    touched,
    onBlur,
    disableOption,
    disabledError,
    labelClassName,
    enableOCR,
    captureImages,
    ocrButtonText,
    clickedPhotoText,
    enableVerify,
    verifiedStatus,
    onVerifyClick,
    setOpenEkycPopup,
    verifiedEkycStatus,
    enableEKYC,
    setField_name,
    ...props
  }) => {
    const { disableEkycGlobally } = useContext(LeadContext);
    const [showDropDown, setShowDropDown] = useState(false);
    const [selectedOption, setSelectedOption] = useState(() =>
      options?.find((option) => defaultSelected === option.value),
    );

    useEffect(() => {
      const option = options.find((option) => option.value === defaultSelected);
      setSelectedOption(option);
    }, [defaultSelected, options]);

    const containerRef = useRef(null);

    const handleSelect = useCallback(
      (option) => {
        setSelectedOption(option);
        setShowDropDown(false);
        onChange && onChange(option.value);
      },
      [onChange],
    );

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
          setShowDropDown(false);
        }
      };
      document.addEventListener('click', handleClickOutside, true);
      return () => {
        document.removeEventListener('click', handleClickOutside, true);
      };
    }, []);

    const getThemes = () => {
      if (error && touched) {
        return 'border-primary-red shadow-primary-red shadow-primary';
      } else if (selectedOption) {
        return 'border-dark-grey text-primary-black';
      } else {
        return 'border-stroke text-light-grey';
      }
    };

    return (
      <div ref={containerRef} className={`dropdown relative ${inputClasses}`}>
        <h3 className={`flex gap-0.5 text-primary-black ${labelClassName}`}>
          {label}
          {required && <span className='text-primary-red text-sm'>*</span>}
        </h3>
        <button
          disabled={disabled}
          title='Show options'
          type='button'
          onClick={() => {
            setShowDropDown(!showDropDown);
          }}
          {...props}
          onBlur={onBlur}
          onMouseLeave={onBlur} // For Iphone
          className={`${getThemes()} w-full flex justify-between gap-1 py-3 px-4 rounded-lg border-x border-y mt-1 bg-white disabled:bg-disabled-grey`}
        >
          {selectedOption ? selectedOption.label : placeholder || props.value} <IconArrowDown />
        </button>
        {showDropDown && (
          <div
            style={{
              maxHeight: optionsMaxHeight ?? 170,
            }}
            className='rounded-lg bg-white shadow-secondary p-2 mt-2 absolute top-100 w-full overflow-y-auto z-20 border border-stroke'
          >
            {options.map((option, index) => {
              let optionClasses = `py-3 px-4 flex justify-between w-full overflow-y-auto transition-colors duration-300 ease-out opacity-100
                  ${index ? 'border-t border-stroke' : 'border-none'}
                `;

              if (option.value === selectedOption?.value)
                optionClasses = `${optionClasses} text-primary-red`;
              else if (option.disabled) {
                optionClasses = `${optionClasses} pointer-events-none`;
              }

              return (
                disableOption !== option.value && (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={optionClasses}
                  >
                    <div className={option.disabled && 'opacity-20'}>{option.label}</div>
                    {showIcon && selectedOption?.value === option.value ? (
                      <IconTick />
                    ) : (
                      <div></div>
                    )}
                  </button>
                )
              );
            })}
          </div>
        )}
        <div className='mt-1 min-h-[16px]'>
          {/* ocr successful */}
          {verifiedStatus ? (
            <div className='flex justify-between items-center'>
              <div className='flex flex-2 gap-[4px]'>
                <TickGreen />
                <span className='text-[12px] text-secondary-green'>OCR completed successfully</span>
              </div>
            </div>
          ) : null}
          {/* ekyc successful */}
          {verifiedEkycStatus ? (
            <div className='flex justify-between items-center'>
              <div className='flex flex-2 gap-[4px]'>
                <TickGreen />
                <span className='text-[12px] text-secondary-green'>
                  e-Kyc completed successfully
                </span>
              </div>
            </div>
          ) : null}
          {/* show capture ocr images button */}
          {enableOCR ? (
            <div className='flex justify-between items-center'>
              <div className='flex flex-1 gap-[4px]'>
                {clickedPhotoText ? (
                  <>
                    <TickGreen />
                    <span className='text-[12px] text-secondary-green'>{clickedPhotoText}</span>
                  </>
                ) : null}
              </div>

              {enableVerify ? (
                <button className='flex gap-[2px] items-center' onClick={onVerifyClick}>
                  <VerifyOCRIcon />
                  <span className='font-[600] text-[16px] text-primary-red'>{ocrButtonText}</span>
                </button>
              ) : (
                <label className={`flex cursor-pointer items-center relative`}>
                  <input
                    type='file'
                    onChange={captureImages}
                    className='opacity-0 w-[0px] h-[0px] absolute'
                    multiple={true}
                    name='files'
                    capture='user'
                    accept='image/*'
                  />
                  <div className='flex gap-[4px] items-center'>
                    <CameraIcon />
                    <span className='font-semibold text-[16px] text-primary-red'>
                      {ocrButtonText}
                    </span>
                  </div>
                </label>
              )}
            </div>
          ) : null}
          {/* show verify ekyc button */}
          {!disableEkycGlobally && enableEKYC ? (
            <button
              className='text-primary-red font-semibold flex justify-end ml-auto'
              onClick={() => {
                setOpenEkycPopup(true);
                setField_name();
              }}
            >
              <IconThumb />
              Verify Aadhaar e-KYC
            </button>
          ) : null}
          {!disabledError ? (
            <span className='text-xs text-primary-red'>{error && touched ? error : null}</span>
          ) : null}
        </div>
      </div>
    );
  },
);

OCRDropdown.propTypes = {
  defaultSelected: PropTypes.any,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  options: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.any, value: PropTypes.any })),
  onChange: PropTypes.func,
  optionsMaxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  showIcon: PropTypes.bool,
  disabled: PropTypes.bool,
  inputClasses: PropTypes.any,
  error: PropTypes.any,
  touched: PropTypes.any,
  onBlur: PropTypes.any,
  disableOption: PropTypes.any,
  disabledError: PropTypes.any,
  labelClassName: PropTypes.any,
  enableOCR: PropTypes.bool,
  captureImages: PropTypes.func,
  ocrButtonText: PropTypes.string,
  clickedPhotoText: PropTypes.string,
  enableVerify: PropTypes.bool,
  verifiedStatus: PropTypes.bool,
  onVerifyClick: PropTypes.func,
  setOpenEkycPopup: PropTypes.func,
};

export default OCRDropdown;
