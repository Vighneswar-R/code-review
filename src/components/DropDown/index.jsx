/* eslint-disable react/display-name */
import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { IconDownArrow, IconTick } from '../../assets/icons';
import LanguageSwitcher from '../LanguageSwitcher';
import LogoutIcon from '../../assets/icons/logout-icon';
import IconLanguage from '../../assets/icons/Language';
import IncentiveIcon from '../../assets/icons/IncentiveIcon';
import ContestIcon from '../../assets/icons/ContestIcon';

const DropDown = memo(
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
    styles,
    resetDefaultSelected,
    name,
    isMainMenu,
    loSelect,
    languageComponent,
    show,
    bm,
    ...props
  }) => {
    const [showDropDown, setShowDropDown] = useState(false);
    const [selectedOption, setSelectedOption] = useState(() =>
      options?.find((option) => defaultSelected === option?.value),
    );
    const [innerWidth, setInnerWidth] = useState(window.innerWidth);
    useEffect(() => {
      function handleWindowResize() {
        setInnerWidth(window.innerWidth);
      }
      window.addEventListener('resize', handleWindowResize);
      return () => window.removeEventListener('resize', handleWindowResize);
    }, []);



    useEffect(() => {
      
     

        let option = options.find((option) => option?.value === defaultSelected);
        setSelectedOption(option);
      
      
    }, [defaultSelected, options, resetDefaultSelected]);

    const containerRef = useRef(null);

    const handleSelect = useCallback(
      (option) => {
        if(name == "LO Name") {  // specific for the Branch Manager selection
          loSelect(option)
          setShowDropDown(false);
          setSelectedOption(option);
        }

        else if(isMainMenu){
          setShowDropDown(false);
          onChange && onChange(option?.value);
          return;
        }
        else {
          setShowDropDown(false);
          setSelectedOption(option);
        onChange && onChange(option?.value);
        }
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
        return ' border-lighter-grey  text-primary-black';
      } else {
        return 'border-stroke text-light-grey';
      }
    };

    return (
      <div ref={containerRef} className={`dropdown ${show?`w-[40%] absolute top-[-8px] sm:top-1.5 right-1.5 h-10`:`w-full relative`} ${inputClasses}`} >
        <h3 className={`flex items-center gap-0.5 text-primary-black ${labelClassName}`}>
          {label}

          {required && <span className='text-primary-red text-sm'>*</span>}
        </h3>
        <button
          disabled={disabled}
          title='Show options'
          type='button'
          onClick={() => setShowDropDown(!showDropDown)}
          {...props}
          onBlur={onBlur}
          onMouseLeave={innerWidth < 1024 ? onBlur : null} // For iPhone
          className={`${!isMainMenu?getThemes():''} ${
            styles ? styles : 'py-3 px-3 md:px-5 rounded-lg'
          } w-full flex justify-between   border-x border-y mt-1 bg-white disabled:bg-disabled-grey text-lg`} // Increased font size
        >
          <span className='truncate  text-center text-sm mt-0.5 sm:mt-0'>
            {selectedOption ? selectedOption.label : placeholder || props.value}
          </span>{' '}
          {/* Consistent text size */}
          <IconDownArrow width={styles ? 16 : 24} height={styles ? 16 : 24} />
        </button>
        {showDropDown && (
          <div
            style={{
              maxHeight: optionsMaxHeight ?? 170,
            }}
            className={`rounded-lg bg-white shadow-secondary p-2 ${show?'mt-1 absolute top-full w-full overflow-y-auto z-20 border border-stroke':'-mt-6 absolute top-full w-full overflow-y-auto z-20 border border-stroke'}`}
          >
  

          {show && !bm && <button style={{width:'100%',display:'flex'}} className={`${
                styles ? 'text-sm py-3 px-2' : 'text-sm py-3 px-2'
              } flex justify-between w-full ${isMainMenu?'text-left':''}transition-colors duration-300 ease-out opacity-100 border-b border-stroke
        `}>
            <i style={{width:'20px',marginRight:'6.5px',display:'flex',justifyContent:'center',alignItems:'center',textAlign:'right'}}><IconLanguage/></i><LanguageSwitcher menu = {true}/></button>}


            {options.map((option, index) => {
              let optionClasses = `${
                styles ? 'text-sm py-3 px-2' : 'text-sm py-3 px-2'
              } flex justify-between w-full ${isMainMenu?'text-left':''}transition-colors duration-300 ease-out opacity-100
          ${index ? 'border-t border-stroke' : 'border-none'}
        `;


              if (option?.value === selectedOption?.value)
                optionClasses = `${optionClasses} text-primary-red`;
              else if (option?.disabled) {
                optionClasses = `${optionClasses} pointer-events-none`;
              }

              return (
                disableOption !== option?.value && (
                  <button
                    key={option?.value}
                    onClick={() => handleSelect(option)}
                    className={optionClasses}
                  >
                    {isMainMenu && option?.label == "Logout" &&<i style={{width:'20px',marginRight:'15px'}}>{option?.label == "Logout"?<LogoutIcon/>:''}
</i>}
                    {isMainMenu && option?.label == "Pending Incentive" && <i style={{width:'20px',marginRight:'15px'}}>{option?.label == "Pending Incentive"?<IncentiveIcon/>:''}
</i>}
                    {isMainMenu && option?.label == "DSR" && <i style={{width:'20px',marginRight:'15px'}}>{option?.label == "DSR"?<IncentiveIcon/>:''}
</i>}

                    {isMainMenu && option?.label == "Contest" && <i style={{width:'20px',marginRight:'15px'}}>{option?.label == "Contest"?<ContestIcon/>:''}
</i>}
                    <div className={option?.disabled ? 'opacity-20' : isMainMenu?'w-[90px] text-left':''}>{option?.label}</div>
                    {showIcon && selectedOption?.value === option.value ? (
                      <IconTick width={styles ? 16 : 24} height={styles ? 16 : 24} />
                    ) : (
                      <div></div>
                    )}
                  </button>
                )
              );
            })}
          </div>
        )}
        {!disabledError ? (
          <span className='text-xs text-primary-red mt-1'>
            {error && touched ? error : String.fromCharCode(160)}
          </span>
        ) : null}
      </div>
    );
  },
);

DropDown.propTypes = {
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
};

export default DropDown;
