import { useContext, useEffect, useState } from 'react';
import DesktopPopUp from '../UploadDocsModal';
import loading from '../../assets/icons/loading.svg';
import { editDoc, editFieldsById, getApplicantById } from '../../global';
import { LeadContext } from '../../context/LeadContextProvider';
import { AuthContext } from '../../context/AuthContextProvider';
import imageCompression from 'browser-image-compression';
import generateImageWithTextWatermark from '../../utils/GenerateImageWithTextWatermark';
import SecureImage from '../SecureImage';
import UploadProgress from '../UploadProgress';
function PhotoUpload({
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
  file,
  ...props
}) {
  const { values, activeIndex } = useContext(LeadContext);
  const { token, loAllDetails } = useContext(AuthContext);
  const [show, setShow] = useState(false);

  const[newLoader,setNewLoader] = useState(false);

  const[complete,setComplete] = useState(false);

  const [innerFile,setInnerFile] = useState({});



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



  /*const handleFile = async (e) => {
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
                if (image?.fileSize > 1000000) {
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
                } else {
                  setSingleFile(image);
                  setFile([...files, image]);
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
  };*/

  const handleFile = async (e) => {
    setMessage('');
    setLoader(true);

    const fileName = e?.target?.files?.[0]?.name;

    if (fileName) {
      const extension = fileName.toLowerCase().split('.');
    
      const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
    
      if (!allowedExtensions.includes(extension?.[extension?.length-1])) {
        setMessage('File format not supported');
        setLoader(false);
        return;
      }
    }
 
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
          if(file[i]?.size > 10000000){
            setLoader(false);
            setMessage('File size should not be greater than 10 MB');
          }else{
 
         
 
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

                  console.log("COMPRESSED",compressedImageFile)
                } else {
                  setSingleFile(image);
                  setFile([...files, image]);
                  setInnerFile(image)
                  console.log("FILE TO>",image)
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
      {newLoader ? (
        <UploadProgress         fileName={innerFile?.name || ""}
          fileSize={innerFile?.size}
          setFileName = {setInnerFile} newLoader={newLoader} complete={complete}/>
      ) : (
        <>
          {!files.length && !loader ? (
            <div>
              <div className='flex items-center justify-center w-full bg-white'>
                <label
                  className={`flex cursor-pointer flex-col w-full h-[56px] border-2  ${
                    message ? 'border-primary-red' : 'border-dashed border-stroke'
                  } rounded-md  relative`}
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
                        d='M5.83464 5V5.75C6.0854 5.75 6.31957 5.62467 6.45867 5.41603L5.83464 5ZM7.00653 3.24217L6.38249 2.82614V2.82614L7.00653 3.24217ZM12.9961 3.24217L13.6201 2.82614L12.9961 3.24217ZM14.168 5L13.5439 5.41603C13.683 5.62467 13.9172 5.75 14.168 5.75V5ZM11.7513 11.25C11.7513 12.2165 10.9678 13 10.0013 13V14.5C11.7962 14.5 13.2513 13.0449 13.2513 11.25H11.7513ZM10.0013 13C9.0348 13 8.2513 12.2165 8.2513 11.25H6.7513C6.7513 13.0449 8.20638 14.5 10.0013 14.5V13ZM8.2513 11.25C8.2513 10.2835 9.0348 9.5 10.0013 9.5V8C8.20638 8 6.7513 9.45507 6.7513 11.25H8.2513ZM10.0013 9.5C10.9678 9.5 11.7513 10.2835 11.7513 11.25H13.2513C13.2513 9.45507 11.7962 8 10.0013 8V9.5ZM6.45867 5.41603L7.63056 3.65819L6.38249 2.82614L5.2106 4.58397L6.45867 5.41603ZM8.39328 3.25H11.6093V1.75H8.39328V3.25ZM12.372 3.65819L13.5439 5.41603L14.792 4.58397L13.6201 2.82614L12.372 3.65819ZM11.6093 3.25C11.9158 3.25 12.202 3.40318 12.372 3.65819L13.6201 2.82614C13.1719 2.15383 12.4173 1.75 11.6093 1.75V3.25ZM7.63056 3.65819C7.80057 3.40318 8.08678 3.25 8.39328 3.25V1.75C7.58526 1.75 6.8307 2.15383 6.38249 2.82614L7.63056 3.65819ZM17.5846 8.33333V14.1667H19.0846V8.33333H17.5846ZM15.0013 16.75H5.0013V18.25H15.0013V16.75ZM2.41797 14.1667V8.33333H0.917969V14.1667H2.41797ZM5.0013 16.75C3.57457 16.75 2.41797 15.5934 2.41797 14.1667H0.917969C0.917969 16.4218 2.74614 18.25 5.0013 18.25V16.75ZM17.5846 14.1667C17.5846 15.5934 16.428 16.75 15.0013 16.75V18.25C17.2565 18.25 19.0846 16.4218 19.0846 14.1667H17.5846ZM15.0013 5.75C16.428 5.75 17.5846 6.9066 17.5846 8.33333H19.0846C19.0846 6.07817 17.2565 4.25 15.0013 4.25V5.75ZM5.0013 4.25C2.74614 4.25 0.917969 6.07817 0.917969 8.33333H2.41797C2.41797 6.9066 3.57457 5.75 5.0013 5.75V4.25ZM5.0013 5.75H5.83464V4.25H5.0013V5.75ZM15.0013 4.25H14.168V5.75H15.0013V4.25Z'
                        fill='#373435'
                      />
                      <ellipse
                        cx='10.0013'
                        cy='4.99984'
                        rx='0.833333'
                        ry='0.833333'
                        fill='#373435'
                      />
                    </svg>

                    <p className='text-xs tracking-wider text-secondary-green font-normal mt-1'>
                    {/*Vijay Uniyal changes on 6 jun 2024 Take a photo to upload or Take a photo */}
                      Upload or Take a photo
                    </p>
                  </div>

                  {/* <input
                    type='file'
                    onChange={handleFile}
                    className='opacity-0'
                    multiple={true}
                    name='files[]'
                    capture='user'
                    accept='image/*'
                  /> */}     
		  {/* <input
                type='file'
                onChange={handleFile}
                className='opacity-0'
                multiple={false}
                name='files[]'
                accept='image/*'
                allow='camera'
               // capture ="user"
              />*/}
		   <input
                type='file'
                onChange={handleFile}
                className='opacity-0'
                multiple={true}
                name='files[]'
              />  
                </label>
              </div>
              <span className='mt-1 text-[12px] text-red-500'>{message}</span>
            </div>
          ) : null}
          {uploads && files.length && !loader ? (
            <div>
              <span className='flex justify-center items-center text-[12px] mt-1 mb-1 text-red-500'>
                {message}
              </span>
              <div
                className={` border-x border-y border-stroke rounded-lg p-2 flex justify-between mt-1 ${
                  disabled ? 'bg-stroke pointer-events-none' : 'bg-white pointer-events-auto'
                }`}
              >
                <div className='flex gap-2 items-center'>
                  <div className='relative rounded-md h-10 w-10'>
                    <div className='absolute h-full w-full bg-black opacity-40'></div>
                    <button
                      className='absolute top-2/4 -translate-y-2/4 left-2/4 -translate-x-2/4 z-20'
                      onClick={() => setShow(true)}
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

                    <SecureImage imageUrl={[uploads.data.document_fetch_url]} token={token} />
                    {/* <img
                      src={uploads.data.document_fetch_url}
                      alt=''
                      className='w-10 h-10 object-cover object-center'
                    /> */}
                  </div>

                  <DesktopPopUp
                    showpopup={show}
                    setShowPopUp={setShow}
                    index={0}
                    singlePhoto={uploads.data}
                    callback={removeImage}
                  />

                  <div>
                    <p className='text-base text-primary-black font-normal truncate w-20'>
                      {uploads.data.document_name}
                    </p>
                  </div>
                </div>

                <button
                // onClick={() => {
                //   removeImage(uploads.data.id);
                // }}
                >
                  <svg
                    width='24'
                    height='40'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    onClick={() => {
                      removeImage(uploads.data.id);
                    }}
                  >
                    <path
                      d='M6.61905 8.1V16.6C6.61905 18.4778 8.06879 20 9.85714 20H14.7143C16.5026 20 17.9524 18.4778 17.9524 16.6V8.1M13.9048 10.65V15.75M10.6667 10.65L10.6667 15.75M15.5238 5.55L14.3854 3.75701C14.0851 3.28407 13.5796 3 13.0383 3H11.5332C10.9918 3 10.4863 3.28407 10.186 3.75701L9.04762 5.55M15.5238 5.55H9.04762M15.5238 5.55H19.5714M9.04762 5.55H5'
                      stroke='#373435'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export default PhotoUpload;