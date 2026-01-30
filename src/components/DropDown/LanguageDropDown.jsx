/* eslint-disable react/display-name */
import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { IconArrowDown, IconLanguage } from '../../assets/icons';

const LanguageDropDown = memo(
  ({
    defaultSelected,
    options,
    onChange,
    optionsMaxHeight,
    inputClasses,
    disableOption,
    ...props
  }) => {
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

    // prevent touch event bubbling to outer div
    const handleTouchMove = (e) => {
      e.preventDefault(); // Prevent default touch behavior
      e.stopPropagation(); // Stop event propagation
    };

    return (
      <div ref={containerRef} className={`dropdown relative ${inputClasses}`}>
        <button
          title='Show options'
          type='button'
          onClick={() => {
            setShowDropDown(!showDropDown);
          }}
          {...props}
          className={`border-light-grey text-primary-black text-sm w-full flex justify-between items-center gap-2 p-2 rounded-lg border bg-white`}
        >
          {selectedOption && (
            <>
              <IconLanguage />
              {`${selectedOption.label}`}
            </>
          )}
          <IconArrowDown isSmall />
        </button>
        {showDropDown && (
          <div
            style={{
              maxHeight: optionsMaxHeight ?? 170,
            }}
            className='rounded-lg bg-white shadow-secondary p-2 mt-1 absolute top-100 w-full overflow-y-auto overscroll-y-contain z-20'
            onTouchMove={handleTouchMove} // Handle touch move event
          >
            {options.map((option, index) => {
              let optionClasses = `text-sm p-2 text-dark-grey flex justify-between w-full overflow-y-auto transition-colors duration-300 ease-out opacity-100`;

              if (option.value === selectedOption?.value)
                optionClasses = `${optionClasses} text-white bg-secondary-green rounded-lg`;

              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={optionClasses}
                >
                  <div>{option.label}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

LanguageDropDown.propTypes = {
  defaultSelected: PropTypes.any,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  options: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.any, value: PropTypes.any })),
  onChange: PropTypes.func,
  optionsMaxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  disabled: PropTypes.bool,
  inputClasses: PropTypes.any,
  error: PropTypes.any,
  touched: PropTypes.any,
  onBlur: PropTypes.any,
  disableOption: PropTypes.any,
  labelClassName: PropTypes.any,
};

export default LanguageDropDown;
