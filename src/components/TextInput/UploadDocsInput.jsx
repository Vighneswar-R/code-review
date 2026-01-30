import { forwardRef, memo, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * @param label - String
 * @param name - String
 * @param hint - String
 * @param error - String
 * @param Icon React JSX Element
 */
const UploadDocsInput = memo(
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
      labelDisabled,
      ...props
    },
    ref,
  ) {
    const inputRef = useRef();

    return (
      <div className='flex flex-col gap-1 w-full'>
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
          role='button'
          tabIndex={-1}
          onClick={() => (ref ? ref.current.focus() : inputRef.current.focus())}
          onKeyDown={() => (ref ? ref.current?.focus() : inputRef.current.focus())}
          className={`input-container border rounded-lg
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
            className={`w-full focus:outline-none px-4 py-5 ${inputClasses}`}
            ref={ref || inputRef}
            id={name}
            name={name}
            onChange={(e) => onChange(e)}
            {...props}
          />
        </div>
        {displayError && !message ? (
          <span
            className='text-xs text-primary-red'
            dangerouslySetInnerHTML={{
              __html: error && touched ? error : String.fromCharCode(0),
            }}
          />
        ) : (
          ''
        )}
        {message ? (
          <span
            className='flex text-primary-black text-xs leading-[18px]'
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

export default UploadDocsInput;

UploadDocsInput.propTypes = {
  label: PropTypes.string,
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
};
