import Lottie from 'react-lottie-player';
import SpeedoMeter from '../../assets/anim/SpeedoMeter.json';
import { forwardRef } from 'react';

const SpeedoMeterAnimation = forwardRef(function SpeedoMeterAnimation(props, ref) {
  return <Lottie animationData={SpeedoMeter} {...props} ref={ref} />;
});

export default SpeedoMeterAnimation;
