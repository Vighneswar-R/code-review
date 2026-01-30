import React, { useState } from 'react';
import LoaderDynamicText from '../Loader/LoaderDynamicText';

const ContestFrame = ({ source, loader }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (loader) {
    return (
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        <LoaderDynamicText text='Loading Contest...' textColor='black' height='60%' />
      </div>
    );
  }

  if (!source || source.length === 0) {
    return <div>No Contest Found</div>;
  }

  const prevImage = () => {
    setCurrentIndex((prev) => prev - 1);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div className='w-full h-full md:h-auto'>
      <img
        src={`data:image/jpeg;base64,${source[currentIndex]?.base64}`}
        alt={`contest-${currentIndex}`}
        style={{ width: '100%',height:'100%' }}
      />

      {currentIndex > 0 && (
        <button
          onClick={prevImage}
          style={{
            position: 'absolute',
            top: '50%',
            left: '10px',
            transform: 'translateY(-50%)',
          }}
        >
          <svg
            width='32'
            height='32'
            viewBox='0 0 32 32'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <rect width='32' height='32' rx='16' fill='#FEFEFE' />
            <path
              d='M19 10L13 16L19 22'
              stroke='#373435'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>
      )}

      {currentIndex < source.length - 1 && (
        <button
          onClick={nextImage}
          style={{
            position: 'absolute',
            top: '50%',
            right: '10px',
            transform: 'translateY(-50%)',
          }}
        >
          <svg
            width='32'
            height='32'
            viewBox='0 0 32 32'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <rect width='32' height='32' rx='16' fill='white' />
            <path
              d='M13 22L19 16L13 10'
              stroke='#373435'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ContestFrame;