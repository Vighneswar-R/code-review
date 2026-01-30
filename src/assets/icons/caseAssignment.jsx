import PropTypes from 'prop-types';

export default function CaseAssignment({ isActive }) {
  return (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <circle cx='5.6665' cy='5.16699' r='1.5' stroke={isActive ? '#E33439' : '#96989A'} />
      <ellipse
        cx='5.66699'
        cy='8.16699'
        rx='2.25'
        ry='1.5'
        stroke={isActive ? '#E33439' : '#96989A'}
      />
      <circle cx='13.833' cy='15.0005' r='1.5' stroke={isActive ? '#E33439' : '#96989A'} />
      <path
        d='M17.6665 12.0005C17.6665 7.85835 14.3086 4.50049 10.1665 4.50049M10.1665 19.5005C6.02437 19.5005 2.6665 16.1426 2.6665 12.0005'
        stroke={isActive ? '#E33439' : '#96989A'}
        strokeLinecap='round'
      />
      <ellipse
        cx='13.8335'
        cy='18.0005'
        rx='2.25'
        ry='1.5'
        stroke={isActive ? '#E33439' : '#96989A'}
      />
      <path
        d='M17.6663 16.1668L16.833 15.3335'
        stroke={isActive ? '#E33439' : '#96989A'}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M20.1665 13.667L17.6665 16.167'
        stroke={isActive ? '#E33439' : '#96989A'}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

CaseAssignment.propTypes = {
  isActive: PropTypes.bool,
};
