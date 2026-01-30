import PropTypes from 'prop-types';
import Lottie from 'react-lottie-player';

const Scanner = ({ animationFile, message }) => {
  return (
    <div className='flex flex-col gap-4 justify-center items-center'>
      <Lottie key={Math.random()} animationData={animationFile} play loop />
      <p className='text-primary-black font-normal text-center'>{message}</p>
    </div>
  );
};

Scanner.propTypes = {
  animationFile: PropTypes.any,
  message: PropTypes.string,
};

export default Scanner;
