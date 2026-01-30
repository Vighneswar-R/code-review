/* eslint-disable react/prop-types */
import { useEffect, useContext, useRef } from 'react';
import loading from '../../assets/icons/loading.svg';
import { editUser, uploadDoc } from '../../global';
import { AuthContext } from '../../context/AuthContextProvider';
import imageCompression from 'browser-image-compression';
import SecureImage from '../SecureImage';

const AdminFormImageUpload = ({
  setSingleFile,
  upload,
  setEdit,
  label,
  hint,
  errorMessage,
  onBlur,
  touched,
  message,
  setMessage,
  loader,
  setLoader,
  edit,
  ...props
}) => {
  const { token, loAllDetails, setFieldValue } = useContext(AuthContext);

  const replacePhotoInputRef = useRef();

  const handleFile = async (e) => {
    setMessage('');
    setLoader(true);

    const success = async () => {
      let file = e.target.files;

      if (file.length !== 0) {
        const fileType = file[0]['type'];

        const validImageTypes = ['image/jpg', 'image/png', 'image/jpeg'];

        const filename = file[0].name;

        if (validImageTypes.includes(fileType)) {
          const options = {
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file[0], options);
          const compressedImageFile = new File([compressedFile], filename, {
            type: compressedFile.type,
          });

          const data = new FormData();
          data.append('document_type', 'user_profile_photo');
          data.append('document_name', filename);
          data.append('file', compressedImageFile);

          const res = await uploadDoc(data, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: token,
            },
          });

          setLoader(false);

          if (res.document) {
            setFieldValue('loimage', res.document.document_fetch_url);
          }
        } else {
          setLoader(false);
          setMessage('File format not supported');
        }
      } else {
        setLoader(false);
      }
    };
    success();
  };

  useEffect(() => {
    upload && setLoader(false);
  }, [upload]);

  return (
    <div className='w-full'>
      <label className='flex gap-0.5 items-center text-primary-black font-medium'>
        {label}
        {props.required && <span className='text-primary-red text-sm'>*</span>}
      </label>

      {hint && (
        <span
          className='mb-1 text-light-grey text-xs font-normal'
          dangerouslySetInnerHTML={{
            __html: hint,
          }}
        />
      )}

      {!upload && !loader ? (
        <div>
          <div className='bg-white flex items-center justify-center w-full'>
            <label
              className={`flex cursor-pointer flex-col w-full border ${
                touched && (message || errorMessage)
                  ? 'border-primary-red shadow-primary shadow-primary-red'
                  : 'border-stroke'
              } rounded-md relative`}
            >
              <div className='flex flex-col items-center py-5'>
                <svg
                  width='24'
                  height='25'
                  viewBox='0 0 24 25'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M15.4038 19.4556H17.3641C19.6371 19.4556 21.295 16.9323 21.295 14.8053C21.2809 14.1112 21.1247 13.4275 20.8359 12.7962C20.5472 12.1649 20.1321 11.5996 19.6163 11.135C18.8035 10.4347 17.7458 10.0859 16.6759 10.1653C16.5827 10.1754 16.4884 10.1669 16.3985 10.1404C16.3086 10.1138 16.2249 10.0696 16.1522 10.0105C16.0794 9.95134 16.0192 9.87836 15.9748 9.79576C15.9305 9.71317 15.903 9.6226 15.8939 9.5293C15.4664 2.731 5.28979 2.82484 5.13339 9.81082C5.13088 9.95342 5.08723 10.0923 5.00769 10.2106C4.92815 10.329 4.81611 10.4219 4.68504 10.4781C3.72127 10.9555 2.9445 11.7409 2.47793 12.71C2.01137 13.679 1.88174 14.776 2.10961 15.8271C2.23997 16.4818 2.50704 17.1016 2.89333 17.646C3.27963 18.1904 3.77647 18.6472 4.35138 18.9864C5.07203 19.3774 5.8905 19.5512 6.70784 19.4869H8.0112'
                    stroke='#147257'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M11.65 19.4973V12.2715'
                    stroke='#147257'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M9.38733 14.3577L11.65 12.1055L13.9126 14.3577'
                    stroke='#147257'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>

                <p className='text-xs tracking-wider text-secondary-green font-normal mt-2'>
                  Choose photo
                </p>
              </div>

              <input
                type='file'
                onChange={handleFile}
                className='opacity-0 absolute'
                name='loimage'
                capture='user'
                accept='image/png, image/jpeg'
                onBlur={onBlur}
              />
            </label>
          </div>
          <span className='mt-1 text-[12px] text-red-500'>
            {touched && (message || errorMessage)}
          </span>
        </div>
      ) : null}

      {loader ? (
        <div className='flex justify-center items-center h-14'>
          <img src={loading} alt='loading' className='animate-spin duration-300 ease-out' />
        </div>
      ) : null}

      {upload && !loader ? (
        <>
          <div className='flex justify-between overflow-auto p-4 border border-[#D9D9D9] rounded-lg'>
            <div className='flex gap-5 items-center'>
              <SecureImage imageUrl={[upload]} token={token}></SecureImage>
              {/* <img
                src={upload}
                alt='Gigs'
                className='object-cover object-center h-[64px] w-[64px] rounded-lg'
              /> */}
              <p>profile_photo</p>
            </div>
            <div className='flex items-center relative'>
              <button
                className='gap-1 flex items-center'
                onClick={() => replacePhotoInputRef.current.click()}
              >
                <svg
                  width='24'
                  height='25'
                  viewBox='0 0 24 25'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M15.4038 19.4556H17.3641C19.6371 19.4556 21.295 16.9323 21.295 14.8053C21.2809 14.1112 21.1247 13.4275 20.8359 12.7962C20.5472 12.1649 20.1321 11.5996 19.6163 11.135C18.8035 10.4347 17.7458 10.0859 16.6759 10.1653C16.5827 10.1754 16.4884 10.1669 16.3985 10.1404C16.3086 10.1138 16.2249 10.0696 16.1522 10.0105C16.0794 9.95134 16.0192 9.87836 15.9748 9.79576C15.9305 9.71317 15.903 9.6226 15.8939 9.5293C15.4664 2.731 5.28979 2.82484 5.13339 9.81082C5.13088 9.95342 5.08723 10.0923 5.00769 10.2106C4.92815 10.329 4.81611 10.4219 4.68504 10.4781C3.72127 10.9555 2.9445 11.7409 2.47793 12.71C2.01137 13.679 1.88174 14.776 2.10961 15.8271C2.23997 16.4818 2.50704 17.1016 2.89333 17.646C3.27963 18.1904 3.77647 18.6472 4.35138 18.9864C5.07203 19.3774 5.8905 19.5512 6.70784 19.4869H8.0112'
                    stroke='#147257'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M11.65 19.4973V12.2715'
                    stroke='#147257'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M9.38733 14.3577L11.65 12.1055L13.9126 14.3577'
                    stroke='#147257'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>

                <p className='text-xs tracking-wider text-secondary-green font-medium'>
                  Replace photo
                </p>
              </button>
              <input
                type='file'
                ref={replacePhotoInputRef}
                onChange={handleFile}
                className='opacity-0 absolute w-0'
                name='loimage'
                capture='user'
                accept='image/png, image/jpeg'
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AdminFormImageUpload;
