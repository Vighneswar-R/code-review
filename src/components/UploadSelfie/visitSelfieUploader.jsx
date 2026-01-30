import React, { useContext, useEffect, useState } from 'react';
import DesktopPopUp from '../UploadDocsModal';
import loading from '../../assets/icons/loading.svg';
import { LeadContext } from '../../context/LeadContextProvider';
import { AuthContext } from '../../context/AuthContextProvider';
import imageCompression from 'browser-image-compression';
import SecureImage from '../SecureImage';

function VisitSelfieUploader({
  visitId,
  files,
  setFile,
  setSingleFile,
  uploads,
  setUploads,
  label,
  hint,
  setLatLong,
  errorMessage,
  message,
  setMessage,
  loader,
  setLoader,
  disabled,
  ...props
}) {
  const { values, activeIndex } = useContext(LeadContext);
  const { token } = useContext(AuthContext);
  const [show, setShow] = useState(false);

  const handleFile = async (e) => {
    setMessage('');
    setLoader(true);

    async function success(position) {
      const { latitude, longitude } = position.coords;

      setLatLong({
        lat: latitude,
        long: longitude,
      });

      const fileList = e.target.files;

      if (!fileList || !fileList.length) {
        setLoader(false);
        return;
      }

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const filename = file.name;
        const fileType = file.type;

        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];

        if (!validImageTypes.includes(fileType)) {
          setMessage('File format not supported');
          setLoader(false);
          return;
        }

        let finalFile = file;

        // Compress image if size > 1MB
        if (file.size > 1000000) {
          try {
            const options = {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, options);
            finalFile = new File([compressedFile], filename, {
              type: compressedFile.type,
            });
          } catch (err) {
            console.error('Image compression failed', err);
            setMessage('Image compression failed');
            setLoader(false);
            return;
          }
        }

        setSingleFile(finalFile);
        setFile([...files, finalFile]);
      }

      setLoader(false);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, () => {
        setLoader(false);
        setMessage('Location is not enabled');
      });
    } else {
      setLoader(false);
      setMessage('Geolocation is not supported by this browser');
    }
  };

  useEffect(() => {
    uploads && setLoader(false);
  }, [uploads]);

  return (
    <div className='w-full'>

      <label className='flex gap-0.5 items-center text-primary-black font-medium'>
        {label}
        {props.required && <span className='text-primary-red text-sm'>*</span>}
      </label>

      {hint && (
        <span
          className='mb-1.5 text-light-grey text-xs font-normal'
          dangerouslySetInnerHTML={{ __html: hint }}
        />
      )}

      {loader ? (
        <div className='flex justify-center items-center h-14'>
          <img src={loading} alt='loading' className='animate-spin' />
        </div>
      ) : (
        <>
          {!files.length && !loader && (
            <div>
              <div className='flex items-center justify-center w-full bg-white'>
                <label
                  className={`flex cursor-pointer flex-col w-full h-[56px] border-2 ${
                    message ? 'border-primary-red' : 'border-dashed border-stroke'
                  } rounded-md relative`}
                >
                  <div className='flex flex-col items-center absolute top-2/4 -translate-y-2/4 left-2/4 -translate-x-2/4'>
                    <p className='text-xs tracking-wider text-secondary-green font-normal'>
                      Take a photo
                    </p>
                  </div>

                  <input
                    type='file'
                    onChange={handleFile}
                    className='opacity-0'
                    multiple
                    name='files[]'
                    capture='user'
                    accept='image/*'
                  />
                </label>
              </div>

              <span className='mt-1 text-[12px] text-red-500'>{message}</span>
            </div>
          )}

          {files?.length && !loader ? (
            <div>
              <span className='flex justify-center items-center text-[12px] mt-1 mb-1 text-red-500'>
                {message}
              </span>

              <div
                className={`border border-stroke rounded-lg p-2 flex justify-between mt-1 ${
                  disabled ? 'bg-stroke pointer-events-none' : 'bg-white'
                }`}
              >
                <div className='flex gap-2 items-center'>
                  <div className='relative rounded-md h-10 w-10 overflow-hidden'>
      
                    {uploads ? (
                      <SecureImage imageUrl={[uploads.data.document_fetch_url]} token={token} />
                    ) : (
                      <img
                        src={URL.createObjectURL(files[0])}
                        alt='Selfie preview'
                        className='h-full w-full object-cover'
                      />
                    )}
                  </div>

                  <div>
                    <p className='text-base text-primary-black font-normal truncate w-20'>
                      {uploads ? uploads.data.document_name : files[0]?.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export default VisitSelfieUploader;
