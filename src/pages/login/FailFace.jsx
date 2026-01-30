import React from 'react';
import NotFoundImage from '../../../src/assets/fail.svg'; // Replace with your SVG file path
function FailFace() {
  return (
    <>
      <div className='flex items-center justify-center'>
        <p className='not-italic font-medium text-[40px] leading-normal' style={{color:'#3f51b5', fontFamily: 'Roboto, sans-serif'}}>
          Failure!
        </p>
      </div>

      <div className='flex items-center justify-center'>
    
        <p data-v-70492db9='' class='title mt-2 blueText'>
         Face Liveness Unsuccessful , please try again!
        </p>
      </div>


      <div className='flex items-center justify-center'>
        <img src={NotFoundImage} height='150px'></img>
      </div>
      <div data-v-70492db9='' class='text-center mb-2' style={{color:'#3f51b5', fontFamily: 'Roboto, sans-serif'}}>
     
        <span data-v-70492db9='' class='body-2'>
    
        </span>
      </div>
    </>
  );
}
 
export default FailFace;