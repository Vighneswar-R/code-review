/* eslint-disable react/display-name */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/jsx-no-comment-textnodes */
import PropTypes from 'prop-types';
import { memo } from 'react';

const CardRadio = memo(({ label, current, children, value, onChange, name, disabled }) => {
  const getThemes = () => {
    if (disabled) {
      if (current === value) {
        return 'bg-disabled-grey border-stroke stroke-black border-black';
      }
      // return 'opacity-60';
    }

    if (current === value) {
      return 'bg-light-green border-secondary-green stroke-secondary-green text-secondary-green fill-[#147257]';
    }
    return 'bg-white border-stroke stroke-light-grey hover:bg-grey-white fill-red text-light-grey';
  };

  return (
    <div
      className={`flex flex-col gap-2 w-full  mb-[10px] ${
        disabled ? 'pointer-events-none' : 'cursor-pointer'
      }`}
    >
      <div
        className={`w-full border rounded-lg py-4 flex items-center justify-center cursor-pointer 
        ${getThemes()}
transition-all duration-300 ease-out ${disabled ? '!bg-disabled-grey' : null}`}
        tabIndex={0}
        role='radio'
        aria-checked={current === value}
        // onClick={() => onChange({ value, name })}
        onTouchStart={() => onChange({ value, name })}
      >
        {children}
      </div>

      {label && (
        <div
          className={`text-center text-xs  leading-normal
        ${
          current === value
            ? disabled
              ? 'text-black font-semibold'
              : 'text-secondary-green font-semibold'
            : 'text-primary-black font-normal'
        } transition-colors ease-out duration-300`}
        >
          {label}
        </div>
      )}
    </div>
  );
});

CardRadio.propTypes = {
  label: PropTypes.string,
  current: PropTypes.string,
  children: PropTypes.element,
  value: PropTypes.string.isRequired,
  name: PropTypes.string,
  onChange: PropTypes.func,
  containerClasses: PropTypes.string,
};

export default CardRadio;
