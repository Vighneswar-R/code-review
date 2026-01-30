import React from 'react';
import NotFoundImage from '../../../src/assets/thankyou.a50fb636.svg'; // Replace with your SVG file path
function Thankyou() {
  return (
    <>
      <div className='flex items-center justify-center'>
        <p className='not-italic font-medium text-[40px] leading-normal' style={{color:'#3f51b5', fontFamily: 'Roboto, sans-serif'}}>
          Awesome!
        </p>
      </div>
      <div className='flex items-center justify-center'>
        <img src={NotFoundImage} height='150px'></img>
      </div>
      <div data-v-70492db9='' class='text-center mb-2' style={{color:'#3f51b5', fontFamily: 'Roboto, sans-serif'}}>
        <p data-v-70492db9='' class='title mt-2 blueText'>
          You have successfully completed our journey!
        </p>
        <span data-v-70492db9='' class='body-2'>
          Your application will be reviewed by our team.
        </span>
      </div>
    </>
  );
}
 
export default Thankyou;