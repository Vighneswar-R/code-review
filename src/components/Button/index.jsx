/* eslint-disable react/display-name */
import PropTypes from 'prop-types';
import { memo } from 'react';
import { Link } from 'react-router-dom';

const Button = memo(({ primary, children, inputClasses, link, disabled,specific, ...props }) => {
  return (
    <Link
      to={disabled ? null : link}
      className={`p-2 md:py-3 text-base md:text-lg rounded md:w-64 flex justify-center items-center ${inputClasses}
      ${null} ${
        primary
          ? disabled
            ? 'bg-stroke border-stroke pointer-events-none text-dark-grey'
            : specific?.length>0?specific:`bg-primary-red border border-primary-red text-white disabled:bg-stroke disabled:border-stroke`
          : disabled
          ? 'bg-neutral-white border border-[#D9D9D9] text-[#96989A] disabled:text-dark-grey pointer-events-none'
          : 'bg-neutral-white border border-primary-red text-primary-red disabled:text-dark-grey'
      } transition-colors ease-out duration-300`}
      {...props}
    >
      {children}
    </Link>
  );
});

export default Button;

Button.propTypes = {
  primary: PropTypes.bool,
  children: PropTypes.any,
  inputClasses: PropTypes.string,
  link: PropTypes.any,
  disabled: PropTypes.any,
};
