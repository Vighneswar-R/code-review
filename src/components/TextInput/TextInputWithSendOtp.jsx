import { forwardRef, memo, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * @param label - String
 * @param name - String
 * @param hint - String
 * @param error - String
 * @param Icon React JSX Element
 */
const TextInputWithSendOtp = memo(
  forwardRef(function TextInput(
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
      onOTPSendClick,
      disabledOtpButton,
      buttonLabel,
      hideOTPButton,
      divClasses,
      ...props
    },
    ref,
  ) {
    const inputRef = useRef();

    return (
      <div className={`flex flex-col gap-1 ${divClasses}`}>
        <label htmlFor={name} className='flex gap-0.5 items-center text-primary-black'>
          {label}
          {props.required && <span className='text-primary-red text-sm'>*</span>}
        </label>
        {hint && (
          <span
            className='mb-1.5 text-light-grey text-sm font-normal'
            dangerouslySetInnerHTML={{
              __html: hint,
            }}
          />
        )}
        <div className='flex gap-[10px]'>
          <div
            role='button'
            tabIndex={-1}
            onClick={() => (ref ? ref.current.focus() : inputRef.current.focus())}
            onKeyDown={() => (ref ? ref.current?.focus() : inputRef.current.focus())}
            className={`input-container px-4 py-3 border rounded-lg
        flex flex-1 gap-1
        transition-all ease-out duration-150
        focus-within:border-secondary-blue focus-within:shadow-secondary-blue focus-within:shadow-primary
        ${!props.value && !touched ? 'border-stroke' : 'border-light-grey'}
        ${error && touched && 'border-primary-red shadow-primary shadow-primary-red'}
        ${props.disabled ? 'bg-disabled-grey pointer-events-none cursor-not-allowed' : 'bg-white'}
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
          </div>

          {hideOTPButton ? null : (
            <button
              className={`min-w-[93px] self-end font-normal py-3 px-2 rounded disabled:text-dark-grey disabled:bg-stroke ${
                disabledOtpButton
                  ? 'text-dark-grey bg-stroke pointer-events-none'
                  : 'bg-primary-red text-white'
              }`}
              disabled={disabledOtpButton}
              onClick={onOTPSendClick}
            >
              {buttonLabel ?? 'Send OTP'}
            </button>
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
            className='flex text-[#147257] text-xs leading-[18px]'
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

export default TextInputWithSendOtp;

TextInputWithSendOtp.propTypes = {
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
};
