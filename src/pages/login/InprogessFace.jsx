import React from 'react';
import NotFoundImage from '../../../src/assets/inprogress.svg'; // Replace with your SVG file path
function InProgressFace() {
  return (
    <>
      <div className='flex items-center justify-center mt-10'>
        <p className='not-italic font-medium text-[20px] leading-normal' style={{color:'#3f51b5', fontFamily: 'Roboto, sans-serif',textAlign:'center'}}>
       <b>WAIT !!! Do not Refresh/close this page</b>
        </p>
      </div>

      <div className='flex items-center justify-center mt-6'>
        <p className='not-italic font-medium text-[20px] leading-normal' style={{color:'#3f51b5', fontFamily: 'Roboto, sans-serif'}}>
       <b>Kindly wait for success message</b>  

        </p>
      </div>
      
      <div className='flex items-center justify-center mb-10'>
        <img src={NotFoundImage} height='50px'></img>
      </div>
    </>
  );
}
 
export default InProgressFace;