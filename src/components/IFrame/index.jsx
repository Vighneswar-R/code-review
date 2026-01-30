import { createPortal } from 'react-dom';
import Button from '../Button';
import { useState } from 'react';

import { faceLivenesScore,FACE_LIVE_PATRON_ID,FACE_LIVE_AUTHORIZATION_RES_HEADER } from '../../global/index';


const IFrameComponent = ({ src, tokenResponse, setShowIframe, showIframe, parentCallback, handleFaceCallBack, parentCallback1, sendData2, sendData3,token }) => {
  const [childData, setChildData] = useState('');
  const handleClickEvent = async () => {
    if (tokenResponse) {
      const data = {
        "task": "getData",
        "essentials": {
          "token": tokenResponse,
          "patronId": FACE_LIVE_PATRON_ID
        }
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': token,
      };

      const response = await faceLivenesScore(data, {
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
      });

      if (response?.result?.videoVerification?.videoForensics?.liveliness === "yes") {
        parentCallback("Face Liviness Done Successfully");
        handleFaceCallBack(true);
        setChildData(response?.result?.videoVerification?.videoForensics?.liveliness)
        sendData2('yes');
        sendData3(response?.result?.videoVerification?.videoForensics?.videoFaceMatch[0]?.matchStatistics?.matchPercentage)

        setShowIframe(false);
      }else if(response?.result?.videoVerification?.videoForensics?.liveliness === "no"){
	parentCallback("Face Liviness Unsuccessfull");
        setShowIframe(false);	      
      } else {
        alert(response?.error?.message);
	      
      }
    }
    
  }
  if (showIframe)
    return createPortal(
      <div
        role='presentation'
        style={{
          zIndex: 9999999,
        }}
        className='fixed inset-0 w-full bg-black bg-opacity-50'
      >
        <div className='w-[328px] flex absolute top-2/4 -translate-y-2/4 left-2/4 -translate-x-2/4 rounded-lg shadow-lg flex-col outline-none focus:outline-none'>
        <div className='flex items-start justify-between bg-transparent'>
            <button className='ml-auto' onClick={() => setShowIframe(false)}>
              <svg
                width='32'
                height='32'
                viewBox='0 0 32 32'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M22.6693 9.3335L9.33594 22.6668'
                  stroke='#FEFEFE'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M9.33594 9.3335L22.6693 22.6668'
                  stroke='#FEFEFE'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>
          </div>
          <div className='relative h-[437px] bg-white mt-3 rounded-t-lg'>

            <div

              className='h-full w-full flex justify-center items-center bg-black'
            >
              <iframe className='myIframe' src={src} width="100%" height="100%" allow="camera" frameborder="0" referrerpolicy="origin"></iframe>
            </div>
          </div>
          <div
            className='p-4 flex gap-4 bg-white rounded-b-lg'
          >
            <Button inputClasses='w-full' onClick={handleClickEvent}>
              CHECK STATUS
            </Button>
          </div>
        </div>
      </div>,
      document.body,
    );
};

export default IFrameComponent;
