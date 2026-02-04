/* eslint-disable react/prop-types */
import { useState, useEffect, useContext } from 'react';
import DesktopPopUp from '../UploadDocsModal';
import loading from '../../assets/icons/loading.svg';
import { editDoc, editFieldsById, getApplicantById } from '../../global';
import { LeadContext } from '../../context/LeadContextProvider';
import { AuthContext } from '../../context/AuthContextProvider';
import imageCompression from 'browser-image-compression';
import generateImageWithTextWatermark from '../../utils/GenerateImageWithTextWatermark';
import SecureImage from '../SecureImage';
import UploadProgress from '../UploadProgress';

function ImageUpload({
  // eslint-disable-next-line react/prop-types
  files,
  setFile,
  setSingleFile,
  uploads,
  setUploads,
  setEdit,
  label,
  hint,
  noBorder,
  setLatLong,
  imageArrayBorder, //in address proof of upload page there is no border for immage array but in salary slip there is border so when you want to add border to immage array just pass true to this prop
  errorMessage,
  message,
  setMessage,
  loader,
  setLoader,
  file,
  lock,
  disabled,
  ...props
}) {
  const { token, loAllDetails } = useContext(AuthContext);
  const { values, activeIndex } = useContext(LeadContext);

  const [show, setShow] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

    const [innerFile,setInnerFile] = useState({});

  const[newLoader,setNewLoader] = useState(false);

  const[complete,setComplete] = useState(false);


    // loader delay to show progress till 100 for new loader


  useEffect(()=>{


    let timer;

    if(loader || loader == true){
      setNewLoader(true);
      setComplete(false);
      return;
    }


      setComplete(true);


      timer = setTimeout(()=>{

        setNewLoader(false);

      },2000)
    

    return ()=>clearTimeout(timer);

  },[loader])

  const handleFile = async (e) => {
    setMessage('');
    setLoader(true);

    async function success(data) {
      setLatLong({
        lat: data.coords.latitude,
        long: data.coords.longitude,
      });

      let file = e.target.files;

      if (file.length !== 0) {
        for (let i = 0; i < file.length; i++) {
          const fileType = file[i]['type'];

          const validImageTypes = ['image/jpeg'];

          const filename = file[i].name;

          if (validImageTypes.includes(fileType)) {
            await generateImageWithTextWatermark(
            null,
              values?.lead?.id,
              loAllDetails?.employee_code,
              loAllDetails?.first_name,
              loAllDetails?.middle_name,
              loAllDetails?.last_name,
              data.coords.latitude,
              data.coords.longitude,
              file[i],
            )
              .then(async (image) => {
                if (image?.size > 1000000) {
                  const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                  };
                  const compressedFile = await imageCompression(image, options);
                  const compressedImageFile = new File([compressedFile], filename, {
                    type: compressedFile.type,
                  });
                  setSingleFile(compressedImageFile);
                  setFile([...files, compressedImageFile]);
                  setInnerFile(compressedImageFile)

                } else {
                  setSingleFile(image);
                  setFile([...files, image]);
                  setInnerFile(image)
                }
              })
              .catch((err) => {
                setLoader(false);
                setMessage('Error loading image');
              });
          } else {
            setLoader(false);
            setMessage('File format not supported');
          }
        }
      } else {
        setLoader(false);
      }
    }

    let userLocation = navigator.geolocation;
    if (userLocation) {
      userLocation.getCurrentPosition(success, (error) => {
        setLoader(false);
        setMessage('Location is not enabled');
        return;
      });
    } else {
      ('The geolocation API is not supported by your browser.');
    }
  };

  const editImage = async (e, id) => {
    setMessage('');
    setLoader(true);

    async function success(data) {
      setLatLong({
        lat: data.coords.latitude,
        long: data.coords.longitude,
      });

      let file = e.target.files;

      if (file.length !== 0) {
        for (let i = 0; i < file.length; i++) {
          const fileType = file[i]['type'];

          const validImageTypes = ['image/jpeg'];

          const filename = file[i].name;

          if (validImageTypes.includes(fileType)) {
            await generateImageWithTextWatermark(
              null,
              values?.lead?.id,
              loAllDetails?.employee_code,
              loAllDetails?.first_name,
              loAllDetails?.middle_name,
              loAllDetails?.last_name,
              data.coords.latitude,
              data.coords.longitude,
              file[i],
            )
              .then(async (image) => {
                if (image?.size > 1000000) {
                  const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                  };
                  const compressedFile = await imageCompression(image, options);
                  const compressedImageFile = new File([compressedFile], filename, {
                    type: compressedFile.type,
                  });
                  setEdit({
                    file: compressedImageFile,
                    id: id,
                  });
                  setFile([...files, compressedImageFile]);
                } else {
                  setEdit({
                    file: image,
                    id: id,
                  });
                  setFile([...files, image]);
                }

                // const compressedFile = await imageCompression(file[i], options);
                // const compressedImageFile = new File([compressedFile], filename, {
                //   type: compressedFile.type,
                // });
                // if (compressedImageFile.size <= 5000000) {
                //   setEdit({
                //     file: compressedImageFile,
                //     id: id,
                //   });
                //   setFile([...files, compressedImageFile]);
                // } else {
                //   setLoader(false);
                //   setMessage('File size should be less than 5MB');
                // }
              })
              .catch((err) => {
                setLoader(false);
                setMessage('Error loading image');
              });
          } else {
            setLoader(false);
            setMessage('File format not supported');
          }
        }
      } else {
        setLoader(false);
      }
    }

    let userLocation = navigator.geolocation;
    if (userLocation) {
      userLocation.getCurrentPosition(success, (error) => {
        setLoader(false);
        setMessage('Location is not enabled');
        return;
      });
    } else {
      ('The geolocation API is not supported by your browser.');
    }
  };

  async function removeImage(id) {
    const type = uploads.type;

    setFile(files.filter((x) => x.name !== id));

    await editDoc(
      id,
      { active: false },
      {
        headers: {
          Authorization: token,
        },
      },
    );

    const applicant = await getApplicantById(
      values?.applicants?.[activeIndex]?.applicant_details?.id,
      {
        headers: {
          Authorization: token,
        },
      },
    );

    const document_meta = applicant.document_meta;

    const photos = applicant.document_meta[type];

    const edited_photos = photos.filter((paper) => {
      return paper.id !== id;
    });

    const photo = photos.find((paper) => {
      return paper.id === id;
    });

    const edited_photo = { ...photo, active: false };

    const edited_applicant = [...edited_photos, edited_photo];

    const new_edited_applicant = await editFieldsById(
      values?.applicants?.[activeIndex]?.applicant_details?.id,
      'applicant',
      {
        document_meta: { ...document_meta, [type]: edited_applicant },
      },
      {
        headers: {
          Authorization: token,
        },
      },
    );

    const edited_type = new_edited_applicant.document_meta[type];

    const active_id_proofs = edited_type.filter((data) => {
      return (
        data.active === true &&
        data.document_type == values?.applicants?.[activeIndex]?.personal_details?.id_type
      );
    });

    const active_address_proofs = edited_type.filter((data) => {
      return (
        data.active === true &&
        data.document_type ==
          values?.applicants?.[activeIndex]?.personal_details?.selected_address_proof
      );
    });

    if (active_id_proofs.length !== 0) {
      if (active_id_proofs.length === 0) {
        setUploads(null);
        setFile([]);
      } else {
        setUploads({ type: [type], data: active_id_proofs });
      }
    } else if (active_address_proofs.length !== 0) {
      if (active_address_proofs.length === 0) {
        setUploads(null);
        setFile([]);
      } else {
        setUploads({ type: [type], data: active_address_proofs });
      }
    } else {
      const active_uploads = edited_type.filter((data) => {
        return data.active === true;
      });

      if (active_uploads.length === 0) {
        setUploads(null);
        setFile([]);
      } else {
        setUploads({ type: [type], data: active_uploads });
      }
    }
  }

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
          dangerouslySetInnerHTML={{
            __html: hint,
          }}
        />
      )}

      {!files.length && !loader ? (
        <div>
          <div className='bg-white flex items-center justify-center w-full'>
            <label
              className={`flex cursor-pointer flex-col w-full h-[72px] ${
                noBorder ? 'border-0' : 'border-2'
              } ${
                message || errorMessage ? 'border-primary-red' : 'border-dashed border-stroke'
              } rounded-md relative`}
            >
              <div className='flex flex-col items-center absolute top-2/4 -translate-y-2/4 left-2/4 -translate-x-2/4'>
                <svg
                  width='20'
                  height='20'
                  viewBox='0 0 20 20'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M12.8339 15.7965H14.4675C16.3617 15.7965 17.7432 13.6938 17.7432 11.9212C17.7315 11.3429 17.6013 10.7731 17.3607 10.247C17.1201 9.72094 16.7741 9.2498 16.3443 8.86269C15.667 8.27908 14.7856 7.98841 13.894 8.05461C13.8163 8.06302 13.7377 8.05595 13.6628 8.0338C13.5879 8.01165 13.5181 7.97486 13.4575 7.92557C13.3969 7.87628 13.3467 7.81546 13.3098 7.74663C13.2728 7.6778 13.2499 7.60233 13.2423 7.52458C12.886 1.85933 4.40556 1.93753 4.27522 7.75918C4.27313 7.87802 4.23675 7.99372 4.17047 8.09237C4.10419 8.19102 4.01082 8.26843 3.90159 8.31528C3.09846 8.71305 2.45114 9.36761 2.06234 10.1751C1.67354 10.9826 1.56551 11.8969 1.7554 12.7728C1.86404 13.3183 2.08659 13.8348 2.40851 14.2885C2.73042 14.7422 3.14446 15.1228 3.62354 15.4055C4.22409 15.7313 4.90615 15.8762 5.58726 15.8226H6.67339'
                    stroke='#373435'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M9.70312 15.8311V9.80957'
                    stroke='#373435'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M7.82031 11.5477L9.70583 9.6709L11.5914 11.5477'
                    stroke='#373435'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>

                <p className='text-xs tracking-wider text-secondary-green font-normal mt-1'>
                  Take a photo
                </p>

                <p className='text-[10px] tracking-wider text-light-grey font-normal'>
                  Supported format: JPG
                </p>
              </div>

              <input
                type='file'
                onChange={handleFile}
                className='opacity-0'
                multiple={true}
                name='files[]'
                capture='user'
                accept='image/*'
              />
            </label>
          </div>
          <span className='mt-1 text-[12px] text-red-500'>{message || errorMessage}</span>
        </div>
      ) : null}

    {loader ? (
            <UploadProgress
                      fileName={innerFile?.name || ""}
          fileSize={innerFile?.size}
          setFileName = {setInnerFile}
                     newLoader = {newLoader}
          complete = {complete}
              // progress={progress}
              // speed={`${speed} KB/s`}
              // timeLeft={timeLeft}
              // status={progress < 100 ? "uploading" : "success"}
            />
          ) : null}

      {uploads && !loader ? (
        <>
          <div
            className={
              imageArrayBorder
                ? 'flex justify-start overflow-auto p-2 border border-[#D9D9D9] rounded-lg'
                : 'flex justify-start overflow-auto'
            }
          >
            <div className='flex gap-2 my-2'>
              <div
                style={{ boxShadow: '5px 0px 10px 0px #0000001F' }}
                className='h-[85px] w-[68px] rounded-lg border-x border-y border-dashed border-stroke flex justify-center items-center'
              >
                <button className='w-full h-full relative'>
                  <svg
                    width='24'
                    height='25'
                    viewBox='0 0 24 25'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    className='absolute top-2/4 -translate-y-2/4 left-2/4 -translate-x-2/4'
                  >
                    <g clipPath='url(#clip0_3036_39087)'>
                      <rect y='0.5' width='24' height='24' rx='12' fill='#DDFFE7' />
                      <path
                        d='M12 7V19M18 13L6 13'
                        stroke='#147257'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </g>
                    <defs>
                      <clipPath id='clip0_3036_39087'>
                        <rect y='0.5' width='24' height='24' rx='12' fill='white' />
                      </clipPath>
                    </defs>
                  </svg>

                  <input
                    type='file'
                    onChange={handleFile}
                    className='opacity-0 w-full h-full'
                    multiple={true}
                    name='files[]'
                    capture='user'
                    accept='image/*'
                    disabled = {disabled}
                  />
                </button>
              </div>

              <div className='flex gap-2 h-[85px]'>
                {uploads.data.map((upload, index) => {
                  return (
                    <div key={index} className='rounded-lg relative w-[68px]'>
                      {!lock ? (
                        <button className='absolute right-[-4px] top-[-4px] z-10 w-4 h-4'>
                          <svg
                            width='16'
                            height='16'
                            viewBox='0 0 16 16'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <rect width='16' height='16' rx='8' fill='#DDFFE7' />
                            <path
                              d='M4 12H12M8.79307 5.02743C8.79307 5.02743 8.79307 5.75393 9.51957 6.48043C10.2461 7.20693 10.9726 7.20693 10.9726 7.20693M5.91983 10.6614L7.44548 10.4434C7.66555 10.412 7.86949 10.31 8.02668 10.1528L11.6991 6.48043C12.1003 6.07919 12.1003 5.42866 11.6991 5.02743L10.9726 4.30093C10.5713 3.89969 9.92081 3.89969 9.51957 4.30093L5.84718 7.97332C5.68999 8.13051 5.58802 8.33445 5.55658 8.55452L5.33863 10.0802C5.2902 10.4192 5.5808 10.7098 5.91983 10.6614Z'
                              stroke='#147257'
                              strokeLinecap='round'
                            />
                          </svg>

                          <input
                            type='file'
                            onChange={(e) => editImage(e, upload.id)}
                            className='absolute bottom-0 right-0 opacity-0 w-full h-full'
                            multiple={true}
                            name='files[]'
                            capture='user'
                            accept='image/*'
                            disabled = {disabled}
                          />
                        </button>
                      ) : null}

                      <div className='relative rounded-md h-full w-full'>
                        <div className='absolute h-full w-full bg-black opacity-40 rounded-lg'></div>
                        <button
                          className='absolute top-2/4 -translate-y-2/4 left-2/4 -translate-x-2/4 z-20'
                          onClick={() => {
                            setPreviewFile(index);
                            setShow(true);
                          }}
                        >
                          <svg
                            width='16'
                            height='16'
                            viewBox='0 0 16 16'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                          >
                            <path
                              d='M14.0895 6.5689C14.8625 7.38228 14.8625 8.61805 14.0895 9.43143C12.7856 10.8033 10.5463 12.6668 8.0026 12.6668C5.45893 12.6668 3.2196 10.8033 1.91574 9.43143C1.14267 8.61805 1.14267 7.38228 1.91574 6.5689C3.2196 5.19705 5.45893 3.3335 8.0026 3.3335C10.5463 3.3335 12.7856 5.19705 14.0895 6.5689Z'
                              stroke='#FEFEFE'
                            />
                            <path
                              d='M10.0026 8.00016C10.0026 9.10473 9.10717 10.0002 8.0026 10.0002C6.89803 10.0002 6.0026 9.10473 6.0026 8.00016C6.0026 6.89559 6.89803 6.00016 8.0026 6.00016C9.10717 6.00016 10.0026 6.89559 10.0026 8.00016Z'
                              stroke='#FEFEFE'
                            />
                          </svg>
                        </button>
                        <SecureImage imageUrl={[upload.document_fetch_url]} token={token} />
                        {/* <img
                          src={upload.document_fetch_url}
                          alt='Gigs'
                          className='object-cover object-center h-full w-full rounded-lg'
                        /> */}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DesktopPopUp
            showpopup={show}
            setShowPopUp={setShow}
            index={previewFile}
            callback={removeImage}
            photos={uploads.data}
            lock={lock}
          />

          <span className='flex justify-center items-center text-[12px] mt-1 mb-1 text-red-500'>
            {message || errorMessage}
          </span>
        </>
      ) : null}
    </div>
  );
}

export default ImageUpload;