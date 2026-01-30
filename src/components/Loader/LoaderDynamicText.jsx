import Lottie from 'react-lottie-player';
import LoaderAnimation from '../../assets/anim/Loader.json';
import PropTypes from 'prop-types';

const LoaderDynamicText = ({ height, extraClasses, text, textColor }) => {
  return (
    <div className={`w-full h-[${height}] ${extraClasses}`}>
      <div className='flex flex-col justify-center items-center gap-4 w-full h-full'>
        <Lottie animationData={LoaderAnimation} loop play className='w-[84px] h-[60px]' />
        <p className={`font-semibold text-${textColor} text-base`}>{text}</p>
      </div>
    </div>
  );
};

LoaderDynamicText.propTypes = {
  extraClasses: PropTypes.string,
  text: PropTypes.any,
  textColor: PropTypes.any,
  height: PropTypes.any,
};

export default LoaderDynamicText;
