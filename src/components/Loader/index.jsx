import Lottie from 'react-lottie-player';
import BusinessAnimation from '../../assets/anim/business-team.json';
import MarketingAnimation from '../../assets/anim/content-creator-for-digital-marketing.json';
import CustomerAnimation from '../../assets/anim/customer-review.json';
import EmailAnimation from '../../assets/anim/email-marketing.json';
import SingingAnimation from '../../assets/anim/singing-contract.json';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

const Loader = ({ extraClasses }) => {
  const [animationData, setAnimationData] = useState(null);

  const generateRandomNumber = () => {
    const min = 1;
    const max = 5;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const getAnimationData = (caseValue) => {
    switch (caseValue) {
      case 1:
        return BusinessAnimation;
      case 2:
        return CustomerAnimation;
      case 3:
        return MarketingAnimation;
      case 4:
        return EmailAnimation;
      case 5:
        return SingingAnimation;
      default:
        return CustomerAnimation;
    }
  };

  useEffect(() => {
    const randomNum = generateRandomNumber();
    setAnimationData(getAnimationData(randomNum));
  }, []); // Run only once on mount

  return (
    <div className={`w-full h-screen ${extraClasses}`}>
      <div className='flex flex-col justify-center items-center gap-4 w-full h-full'>
        {animationData && (
          <Lottie animationData={animationData} loop play className='w-[500px] h-[500px]' />
        )}
        {/* <p className={`font-semibold text-primary-black text-base`}>Loading...</p> */}
      </div>
    </div>
  );
};

Loader.propTypes = {
  extraClasses: PropTypes.string,
};

export default Loader;