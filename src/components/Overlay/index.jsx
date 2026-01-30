import { useEffect, useRef } from 'react';
import ConnectionLost from '../../assets/icons/connection-lost';
import Header from '../Header';

const Overlay = () => {
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'white',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 10000,
        textAlign: 'center',
      }}
    >
      <div className='w-full bg-[#FAFAFA]'>
        <Header />
        <input ref={inputRef} type='text' className='opacity-0' />
        <p
          style={{
            color: '#fff',
            padding: '16px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
          className='flex justify-center items-center'
        >
          <ConnectionLost />
        </p>
      </div>
    </div>
  );
};

export default Overlay;
