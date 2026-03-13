import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import Button from '../Button';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContextProvider';
import { getUserById,IMAGE_URL_FOR_PDF_UPLOAD } from '../../global';
import { LeadContext } from '../../context/LeadContextProvider';
import SecureImage from '../SecureImage';
import DynamicDrawer from '../SwipeableDrawer/DynamicDrawer';
import { IconClose } from '../../assets/icons';

const UploadDocsModal = ({
  showpopup,
  setShowPopUp,
  index,
  callback,
  photos,
  singlePhoto,
  type = '',
  deleteDoc=null,
  setDeleteDoc=()=>{},
  lock,
}) => {
  const { loData, token, loAllDetails } = useContext(AuthContext);
  const { values, activeIndex } = useContext(LeadContext);
  const [activeStep, setActiveStep] = useState(0);
  const [Timestamp, setTimeStamp] = useState(null);
  const [userData, setUserData] = useState(null);
  

  useEffect(() => {

    // console.log("FILES>>>",photos)
    setActiveStep(index);

    const timestamp = new Date();
    setTimeStamp(timestamp);

    async function getUserData() {
      setUserData(loAllDetails);
      // try{
      //   const lo_info = await getUserById(loData?.session?.user_id, {
      //     headers: {
      //       Authorization: token,
      //     },
      //   });
 
      //   setUserData(lo_info);

      // }

      // catch(err) {
      //   console.log("ERROR OCCURED IN MODAL")
      // }
     
    }
    loData && getUserData();
  }, [index]);

  if (showpopup)
    return createPortal(
      <div>
        <div
          role='presentation'
          // onClick={() => setShowPopUp(false)}
          // onKeyDown={() => setShowPopUp(false)}
          style={{
            zIndex: 999999,
          }}
          className='fixed inset-0 w-full bg-black bg-opacity-50'
        >
          <div className='w-[328px] flex absolute top-2/4 -translate-y-2/4 left-2/4 -translate-x-2/4 rounded-lg shadow-lg flex-col outline-none focus:outline-none'>
            <div className='flex items-start justify-between bg-transparent'>
              <button
                className='ml-auto'
                onClick={() => {
                  setShowPopUp(false);
                  setDeleteDoc(null);
                }}
              >
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
            {photos && !singlePhoto
              ? photos?.map(
                  (photo, index) =>
                    index === activeStep && (
                      <div
                        key={index}
                        className='h-full w-full flex justify-center items-center bg-black'
                      >
                        {/* <img
                          src={photo.document_fetch_url}
                          alt={photo.document_fetch_url}
                          className='h-full w-full object-contain object-center rounded-t-lg'
                        /> */}

                       {
                          photo && (photo?.document_meta?.mimetype === 'image/jpeg' || photo?.document_meta?.mimetype==null) ? (
                            <SecureImage imageUrl={[photo?.document_fetch_url]} token={token} view_port = {'full'} />

                            /*{ <img
                            src={photo.document_fetch_url}
                            alt={photo.document_fetch_url}
                            className='h-full w-full object-contain object-center rounded-t-lg'
                          /> }*/
                          ) :
                         
                          !IMAGE_URL_FOR_PDF_UPLOAD?<div></div>   // added new **13/12

                          :
                          (
                            <SecureImage imageUrl={IMAGE_URL_FOR_PDF_UPLOAD} token={token} />
                            /*{ <img
                            src={IMAGE_URL_FOR_PDF_UPLOAD}  // static pdf image
                            alt={photo.document_fetch_url}
                            className='h-full w-full object-contain object-center rounded-t-lg'
                          /> }*/
                          )
                        }

                        {/* <p className='absolute bottom-0 left-0 text-white p-3'>
                          CAF: {values.applicants?.[activeIndex]?.applicant_details?.lead_id}; Lat:{' '}
                          {photo.geo_lat}; Long: {photo.geo_long}; EMP code:{' '}
                          {userData?.employee_code}; Timestamp: {Timestamp?.toLocaleString()}; LO
                          Name:{' '}
                          {userData?.first_name +
                            ' ' +
                            userData?.middle_name +
                            ' ' +
                            userData?.last_name}
                        </p> */}
                        </div>
                      ),
                  )
                : null}

              {singlePhoto && (
                <div
                  key={index}
                  className='h-full w-full flex justify-center items-center bg-black'
                >
                  <SecureImage
                    imageUrl={[singlePhoto?.document_fetch_url]}
                    token={token}
                    view_port={'full'}
                  />
                  {/* <img
                  src={singlePhoto.document_fetch_url}
                  alt={singlePhoto.document_fetch_url}
                  className='h-full w-full object-contain object-center rounded-t-lg'
                /> */}
                  {/* <p className='absolute bottom-0 left-0 text-white p-3'>
                  CAF: {values.applicants?.[activeIndex]?.applicant_details?.lead_id}; Lat:{' '}
                  {singlePhoto.geo_lat}; Long: {singlePhoto.geo_long}; EMP code:{' '}
                  {userData?.employee_code}; Timestamp: {Timestamp?.toLocaleString()}; LO Name:{' '}
                  {userData?.first_name + ' ' + userData?.middle_name + ' ' + userData?.last_name}
                </p> */}
                </div>
              )}
            </div>

            {photos && !singlePhoto
              ? photos.map(
                  (photo, index) =>
                    index === activeStep &&
                    (!lock ? (
                      <div
                        className='p-4 flex gap-4 bg-white rounded-b-lg'
                        key={ photo?.id ?? index}
                        // onClick={() => setShowPopUp(false)}
                      >
                        <Button
                          inputClasses='w-full'
                          onClick={() => {
                            if (type === 'other_docs') {
                              // console.log(' i am clicked 1', deleteDoc);
                              setDeleteDoc(photo?.id);
                              setShowPopUp(false)
                            } else {
                              callback(photo?.id);
                              setShowPopUp(false)
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    ) : null),
                )
              : null}

            {singlePhoto && (
              <div
                className='p-4 flex gap-4 bg-white rounded-b-lg'
                key={index}
                // onClick={() => setShowPopUp(false)}
              >
                <Button
                  inputClasses='w-full'
                  onClick={() => {
                    if (type === 'other_docs') {
                      console.log(' i am clicked 2');
                      setDeleteDoc(photo?.id);
                    } else {
                      callback(photo?.id);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            )}

            {photos && (
              <div className='flex items-start justify-between bg-transparent mt-4'>
                <div
                  className={`bg-white border-[1px] border-[#E2EAF4] text-primary-black h-10 w-10 rounded-full flex justify-center items-center cursor-pointer ${
                    activeStep === 0 ? 'pointer-events-none opacity-0' : 'pointer-events-auto'
                  }`}
                  onClick={() => {
                    setActiveStep((prev) => prev - 1);
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
                </div>

                <p className='flex self-center text-white font-semibold text-xl'>
                  {activeStep + 1}/{photos.length}
                </p>

                <div
                  className={`bg-white border-[1px] border-[#E2EAF4] text-primary-black h-10 w-10 rounded-full flex justify-center items-center cursor-pointer ${
                    activeStep === photos.length - 1
                      ? 'pointer-events-none opacity-0'
                      : 'pointer-events-auto'
                  }`}
                  onClick={() => {
                    setActiveStep((prev) => prev + 1);
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
                </div>
              </div>
            )}
          </div>
        </div>
        ,
        {type === 'other_docs' ? (
          <DynamicDrawer
            open={deleteDoc !== null}
            setOpen={() => setDeleteDoc(null)}
            height='223px'
          >
            <div className='flex gap-1'>
              <div className=''>
                <h4 className='text-center text-base not-italic font-semibold text-primary-black mb-2'>
                  Are you sure you want to delete this document?
                </h4>
                <p className='text-center text-xs not-italic font-normal text-primary-black'>
                  Once deleted the document cannot be recovered
                </p>
              </div>
              <div className=''>
                <button onClick={() => setDeleteDoc(null)}>
                  <IconClose />
                </button>
              </div>
            </div>

            <div className='w-full flex justify-center gap-4 mt-6'>
              <Button inputClasses='w-full h-[46px]' onClick={() => setDeleteDoc(null)}>
                No, Keep it
              </Button>
              <Button
                primary={true}
                inputClasses=' w-full h-[46px]'
                onClick={() => {
                  callback(deleteDoc);
                }}
              >
                Yes, Delete
              </Button>
            </div>
          </DynamicDrawer>
        ) : null}
      </div>,
      document.body,
    );
  return null;
};

export default UploadDocsModal;

UploadDocsModal.propTypes = {
  showpopup: PropTypes.bool,
  setShowPopUp: PropTypes.func,
  index: PropTypes.number,
};
