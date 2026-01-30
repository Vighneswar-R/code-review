import React, { useRef } from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef();

  const handleOverlayClick = (e) => {
    // Check if the overlay (modalRef) was clicked
    if (modalRef.current && modalRef.current === e.target) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        ref={modalRef}
        onClick={handleOverlayClick}
        className='fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50'
      >
        {children}
      </div>
    </>
  );
};

export default Modal;
