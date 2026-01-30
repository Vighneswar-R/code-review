import { forwardRef, useRef } from 'react';
import PropTypes from 'prop-types';
import mapIcon from '../../assets/icons/location-pointer.svg';

/**
 * @param label - String
 * @param name - String
 * @param hint - String
 * @param error - String
 */
const MapInput = forwardRef(function TextInput(
  {
    label,
    name,
    hint,
    error,
    touched,
    inputClasses,
    displayError = true,
    message,
    onChange,
    onMapButtonClick,
    ...props
  },
  ref,
) {
  const inputRef = useRef();

  return (
    <div className='flex flex-col gap-1'>
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
      <div
        role='button'
        tabIndex={-1}
        onClick={() => (ref ? ref.current.focus() : inputRef.current.focus())}
        onKeyDown={() => (ref ? ref.current?.focus() : inputRef.current.focus())}
        className={`input-container px-4 py-3 border rounded-lg 
        flex gap-2
        transition-all ease-out duration-150
        focus-within:border-secondary-blue focus-within:shadow-secondary-blue focus-within:shadow-primary
        ${
          error && touched
            ? 'border-primary-red shadow-primary shadow-primary-red'
            : 'border-light-grey'
        }
        ${!props.value && !error && !touched && 'border-stroke'}
        ${props.disabled ? 'bg-disabled-grey pointer-events-none cursor-not-allowed' : 'bg-white'}
        `}
      >
        <input
          className={`w-full focus:outline-none ${inputClasses}`}
          ref={ref || inputRef}
          id={name}
          name={name}
          onChange={(e) => onChange(e)}
          {...props}
        />
        <button onClick={onMapButtonClick} type='button' title='Open map'>
          <img src={mapIcon} alt='map' role='presentation' />
        </button>
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
});

MapInput.propTypes = {
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
  onMapButtonClick: PropTypes.func,
};

export default MapInput;
