/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { forwardRef, memo, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * @param label - String
 * @param name - String
 * @param hint - String
 * @param error - String
 * @param Icon React JSX Element
 */
const ClickableEndIcon = memo(
  forwardRef(function ClickableEndIcon(
    {
      label,
      name,
      hint,
      error,
      touched,
      Icon,
      inputClasses,
      displayError = true,
      message,
      onChange,
      labelDisabled,
      EndIcon,
      onEndButtonClick,
      ...props
    },
    ref,
  ) {
    const inputRef = useRef();

    return (
      <div className='flex flex-col gap-1'>
        <label
          htmlFor={name}
          className={`'flex gap-0.5 items-center' ${labelDisabled ? 'opacity-60' : 'opacity-100'}`}
        >
          {label}
          {props.required && <span className='text-primary-red text-sm'>*</span>}
        </label>
        {hint && (
          <span
            className='mb-1.5 text-light-grey text-xs font-normal'
            dangerouslySetInnerHTML={{
              __html: hint,
            }}
          />
        )}
        <div
          tabIndex={-1}
          className={`input-container px-4 py-3 border rounded-lg
        flex gap-1
        transition-all ease-out duration-150
        focus-within:border-secondary-blue focus-within:shadow-secondary-blue focus-within:shadow-primary
        ${!props.value && !touched ? 'border-stroke' : 'border-light-grey'}
        ${error && touched && 'border-primary-red shadow-primary shadow-primary-red'}
        ${props.disabled ? 'bg-disabled-grey pointer-events-none cursor-not-allowed' : 'bg-white'}
        ${labelDisabled ? 'bg-white opacity-60' : 'opacity-100'}

        `}
        >
          {Icon && <Icon />}
          <input
            className={`w-full focus:outline-none ${inputClasses}`}
            ref={ref || inputRef}
            id={name}
            name={name}
            onChange={(e) => onChange(e)}
            {...props}
          />
          {EndIcon && (
            <div onClick={onEndButtonClick}>
              <EndIcon />
            </div>
          )}
        </div>

        {displayError && !message ? (
          <span
            className='text-xs text-primary-red'
            dangerouslySetInnerHTML={{
              __html: error && touched ? error : String.fromCharCode(160),
            }}
          />
        ) : (
          ''
        )}
        {message ? (
          <span
            className='flex text-[#727376] text-xs leading-[18px]'
            dangerouslySetInnerHTML={{
              __html: message,
            }}
          />
        ) : (
          ''
        )}
      </div>
    );
  }),
);

ClickableEndIcon.propTypes = {
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
  onChange: PropTypes.func.isRequired,
  labelDisabled: PropTypes.any,
  EndIcon: PropTypes.any,
  onEndButtonClick: PropTypes.any,
};

export default ClickableEndIcon;
