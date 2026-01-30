import PropTypes from 'prop-types';

export default function IconArrowDown({ isSmall, strokeColor }) {
  return (
    <svg
      width={isSmall ? '16' : '24'}
      height={isSmall ? '16' : '24'}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M6 9L12 15L18 9'
        stroke={strokeColor || '#373435'}
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

IconArrowDown.propTypes = {
  isSmall: PropTypes.bool,
  strokeColor: PropTypes.string,
};
