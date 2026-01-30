import PropTypes from 'prop-types';

const Radio = ({ label, value, current, onChange, disabled }) => {
  return (
    <div className='flex gap-3 items-center grow'>
      <div
        type='radio'
        className={`${
          current === value ? 'border-red-600' : 'border-black'
        }  border-x border-y w-6 h-6 rounded-full flex justify-center items-center`}
        onTouchStart={() => {
          !disabled && onChange(value);
        }}
      >
        <span className={`rounded-full w-4 h-4 ${current === value ? ' bg-red-600' : ''}`}></span>
      </div>
      <label className='text-base font-normal text-primary-black'>{label}</label>
    </div>
  );
};

Radio.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  current: PropTypes.string,
  onChange: PropTypes.func,
  containerClasses: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Radio;
