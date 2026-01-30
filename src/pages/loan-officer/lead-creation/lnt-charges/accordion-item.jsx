import PropTypes from 'prop-types';

const AccordionItem = ({
  iconImage,
  label,
  children,
  open,
  setOpen,
  className,
  disabled,
  defaultOption,
}) => {
  return (
    <div
      className={`w-full transition-opacity ${
        disabled ? 'opacity-60 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
      onClick={() => setOpen(label)}
    >
      <div className='flex w-full gap-2 py-1'>
        <img src={iconImage} className='w-6 h-6' alt='accordion-icon' />
        <label
          htmlFor={label}
          className='flex-1 text-base not-italic font-normal text-primary-black'
        >
          {label}
        </label>

        <div className=''>
          <input
            id='roundedCheckbox'
            onChange={() => setOpen(label)}
            checked={open}
            type='radio'
            name={label}
            className=' w-[24px] h-[24px] accent-primary-red rounded-full '
          />
        </div>
      </div>

      <div className={className}>{open || defaultOption ? children : null}</div>
    </div>
  );
};

export default AccordionItem;

AccordionItem.propTypes = {
  iconImage: PropTypes.any,
  label: PropTypes.any,
  children: PropTypes.any,
  open: PropTypes.any,
  setOpen: PropTypes.any,
  className: PropTypes.any,
  disabled: PropTypes.any,
  defaultOption: PropTypes.any,
};
