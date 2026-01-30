import PropTypes from 'prop-types';

const DesktopStepper = ({ steps, activeStep }) => {
  return (
    <div className='hidden md:flex justify-between w-full pt-14 pr-[174px] gap-6 md:pl-1'>
      {steps.map((step, index) => (
        <div key={index} className='w-full'>
          <div
            className={`${
              index <= activeStep ? 'bg-primary-red' : 'bg-stroke'
            } w-full h-1.5 rounded-md`}
          ></div>
          <div className='mt-2'>
            <h2
              className={`${index === activeStep && 'text-primary-red'} ${
                index < activeStep && 'text-primary-black'
              } ${
                index > activeStep && 'text-stroke'
              } text-xs leading-[18px] font-medium uppercase`}
            >
              Step {index + 1}
            </h2>
            <p
              className={`${index <= activeStep ? 'text-primary-black' : 'text-stroke'} ${
                index < activeStep ? 'font-normal' : 'font-semibold'
              } text-xs leading-[18px] mt-1`}
            >
              {step.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

DesktopStepper.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.object),
  activeStep: PropTypes.number,
};

export default DesktopStepper;
