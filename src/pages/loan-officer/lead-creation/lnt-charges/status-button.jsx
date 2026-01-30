import loading from '../../../../assets/icons/loader_white.png';
import PropTypes from 'prop-types';

const StatusButton = ({ disabled, isLoading = false, ...props }) => {
  return (
    <button
      disabled={disabled}
      className={`p-2 md:py-3 text-base md:text-lg rounded md:w-64 flex justify-center items-center gap-2 h-12 w-full
         ${
           isLoading ? 'pointer-events-none' : 'pointer-events-auto'
         } bg-primary-red border border-primary-red text-white disabled:bg-[#D9D9D9] disabled:text-[#96989A] disabled:border-transparent transition-colors ease-out duration-300
         `}
      {...props}
    >
      {/* {isLoading ? <LoaderIcon className='animate-spin' /> : null} */}
      {isLoading ? (
        <img src={loading} alt='loading' className='animate-spin duration-300 ease-out' />
      ) : null}
      <span className='text-center text-base not-italic font-semibold'>
        {isLoading && !disabled ? 'Checking Status' : 'Approve Payment Status'}
      </span>
    </button>
  );
};

export default StatusButton;

StatusButton.propTypes = {
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
};
