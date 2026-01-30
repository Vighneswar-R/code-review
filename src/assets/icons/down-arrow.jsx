import PropTypes from 'prop-types';

export default function IconDownArrow({ height, width, strokeColor, cssClasses }) {
  return (
    <svg
      width={width ? width : 24}
      height={height ? height : 24}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cssClasses}
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

IconDownArrow.propTypes = {
  isSmall: PropTypes.bool,
  strokeColor: PropTypes.string,
};
