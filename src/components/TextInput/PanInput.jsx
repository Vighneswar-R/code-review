/* eslint-disable react/display-name */
import { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const PanInput = memo(
  ({ label, name, hint, error, touched, onChange, displayError = true, ...props }) => {
    const inputRef = useRef(null);
    const tempInputRef = useRef(null);
    const [inputType, setInputType] = useState('text');
    const [inputValue, setInputValue] = useState(props.value);

    useEffect(() => {
      if (tempInputRef) tempInputRef.current.value = '';
      onChange(inputValue);
      if (inputValue.length >= 5 && inputValue.length < 9) {
        setInputType('number');
      } else {
        setInputType('text');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputValue]);

    return (
      <div className='flex flex-col gap-1'>
        <label
          role='presentation'
          onClick={() => tempInputRef.current.focus()}
          htmlFor={name}
          className='flex gap-0.5 items-center text-primary-black'
        >
          {label}
          {props.required && <span className='text-primary-red text-sm'>*</span>}
        </label>
        <input type='hidden' value={props.value} />
        {hint && (
          <span
            className='mb-1.5 text-light-grey text-sm font-normal'
            dangerouslySetInnerHTML={{
              __html: hint,
            }}
          />
        )}
        <div
          tabIndex={-1}
          role='button'
          onClick={() => tempInputRef.current.focus()}
          onKeyDown={() => tempInputRef.current.focus()}
          className={`input-container px-4 py-3 border rounded-lg
					inline-flex relative
					transition-all ease-out duration-150
					focus-within:border-secondary-blue focus-within:shadow-secondary-blue focus-within:shadow-primary
          ${!props.value && !touched ? 'border-stroke' : 'border-light-grey'}
          ${error && touched && 'border-primary-red shadow-primary shadow-primary-red'}
          ${props.disabled ? 'bg-disabled-grey pointer-events-none cursor-not-allowed' : 'bg-white'}
					`}
        >
          <span
            ref={inputRef}
            type='text'
            className={`text-base m-0 p-0 ${
              inputValue ? 'text-black' : 'text-light-grey absolute'
            }`}
          >
            {inputValue || props.placeholder}
          </span>

          <input
            type={inputType}
            inputMode={inputType === 'number' ? 'numeric' : 'text'}
            ref={tempInputRef}
            name={name}
            className='w-2 hidearrow text-transparent placeholder:text-transparent'
            onInput={(e) => {
              const value = e.currentTarget.value;
              if (!value) return;
              let pattern = /^[A-Za-z]/;
              if (inputType === 'number') {
                pattern = /^[0-9]+$/;
              }
              if (pattern.exec(value[value.length - 1])) {
                setInputValue((prev) => {
                  if (prev.length >= 10) return prev;
                  return prev + value[value.length - 1].toUpperCase();
                });
              }
              tempInputRef.current.value = '';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace') {
                setInputValue((prev) => prev.slice(0, prev.length - 1));
                return;
              }
            }}
            onBlur={props.onBlur}
          />
        </div>

        {displayError ? (
          <span
            className='text-xs text-primary-red'
            dangerouslySetInnerHTML={{
              __html: error && touched ? error : String.fromCharCode(160),
            }}
          />
        ) : (
          ''
        )}
      </div>
    );
  },
);

PanInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  hint: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  touched: PropTypes.bool,
  Icon: PropTypes.elementType,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  inputClasses: PropTypes.string,
  displayError: PropTypes.bool,
  disabled: PropTypes.bool,
  message: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  processing: PropTypes.bool,
};

export default PanInput;
