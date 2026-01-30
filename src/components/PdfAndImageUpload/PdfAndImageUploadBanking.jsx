import { useState, useEffect,useContext } from 'react';
import DesktopPopUp from '../UploadDocsModal';
import loading from '../../assets/icons/loading.svg';
import { AuthContext } from '../../context/AuthContextProvider';
import SecureImage from '../SecureImage';
import UploadProgress from '../UploadProgress';
function PdfAndImageUploadBanking({
  files,
  setFile,
  uploads,
  setUploads,
  setEdit,
  pdf,
  setPdf,
  setSingleFile,
  label,
  hint,
  removeImage,
  deletePDF,
  setLatLong,
  message,
  setMessage,
  loader,
  setLoader,
  ...props
}) {
  const [show, setShow] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const { token } = useContext(AuthContext);

  
  const[newLoader,setNewLoader] = useState(false);

  const[complete,setComplete] = useState(false);

  const[failed,setFailed] = useState(false);

  const[mergeeUpload,setMergeUpload] = useState(uploads);


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

          const validImageTypes = ['image/jpeg', 'application/pdf'];

          if (validImageTypes.includes(fileType)) {
            if (file[i].type === 'application/pdf') {
              if (file[i].size <= 5000000) {
                setSingleFile(file[i]);
                setFile([...files, file[i]]);
                setInnerFile(file[i])
              } else {
                setLoader(false);
                setFailed(true)
                setMessage('File size should be less than 5MB');
              }
            } else {
              setSingleFile(file[i]);
              setInnerFile(file[i])

              setFile([...files, file[i]]);
            }
          } else {
            setLoader(false);
            setFailed(true)
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

  useEffect(() => {
    uploads && setLoader(false);
  }, [uploads]);

  useEffect(() => {
    pdf && setLoader(false);
  }, [pdf]);

  const editImage = (e, id) => {
    setMessage('');
    setLoader(true);

    async function success(data) {
      setLatLong({
        lat: data.coords.latitude,
        long: data.coords.longitude,
      });

      let file = e.target.files;

      for (let i = 0; i < file.length; i++) {
        const fileType = file[i]['type'];

        const validImageTypes = ['image/jpeg'];

        if (validImageTypes.includes(fileType)) {
          setEdit({
            file: file[i],
            id: id,
          });
          setFile([...files, file[i]]);
        } else {
          setLoader(false);
          setMessage('File format not supported');
        }
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

  useEffect(() => {
    let userLocation = navigator.geolocation;

    if (userLocation) {
      userLocation.getCurrentPosition(success);
    } else {
      ('The geolocation API is not supported by your browser.');
    }

    function success(data) {
      let lat = data.coords.latitude;
      let long = data.coords.longitude;

      setLatLong({
        lat: lat,
        long: long,
      });
    }
  }, []);

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

      {files?.length === 0 && !newLoader ? (
        <div className=''>
          <div className='bg-white flex items-center justify-center w-full'>
            <label
              // style={{ boxShadow: '5px 0px 10px 0px #0000001F' }}
              className={`flex cursor-pointer flex-col w-full h-[72px] border-2 rounded-md ${
                message ? 'border-primary-red' : 'border-dashed border-stroke'
              } relative`}
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
                  Upload or take a photo
                </p>

                <p className='text-[10px] tracking-wider text-light-grey font-normal'>
                  Supported format: PDF & JPG
                </p>
              </div>

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

      {/* {loader ? (
        <div className='flex justify-center items-center h-14'>
          <img src={loading} alt='loading' className='animate-spin duration-300 ease-out' />
        </div>
      ) : null} */}

            {newLoader? (
              <UploadProgress
                fileName={innerFile?.name || ""}
                fileSize={innerFile?.size}
                setFileName = {setInnerFile}
                newLoader = {newLoader}
                complete = {complete}
                failed = {failed}
                // progress={file.progress}
                // speed={`${file.speed} KB/s`}
                // timeLeft={file.timeLeft}
                // status={file.progress < 100 ? 'uploading' : 'success'}
              />
            ) : null}

      {/*&& !pdf*/}

      {files?.length && files?.length !== 0 && (uploads || pdf) && !newLoader ? (
        <>
          <div className='flex justify-start overflow-auto p-2 border border-[#D9D9D9] rounded-lg'>
            <div className='flex gap-2 my-2'>
              <div
                style={{ boxShadow: '5px 0px 10px 0px #0000001F' }}
                className={`h-[85px] w-[68px] rounded-lg border-x border-y flex justify-center items-center`}
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
                  />
                </button>
              </div>

              <div className='flex gap-2 h-[85px]'>
                {uploads?.data?.map((upload, index) => {
                  return (
                    <div key={index} className='rounded-lg relative w-[68px]'>
                      <button className='absolute right-[-4px] top-[-4px] z-20 w-4 h-4'>
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
                        />
                      </button>

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
                        <SecureImage imageUrl={[upload?.document_fetch_url]} token={token} />
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

              <DesktopPopUp
                showpopup={show}
                setShowPopUp={setShow}
                index={previewFile}
                callback={removeImage}
                photos={uploads?.data}
              />
            </div>
          </div>
          <span className='flex justify-center items-center text-[12px] mb-1 text-red-500'>
            {message}
          </span>
        </>
      ) : null}

      {/* {pdf ? (
        <div className='bg-white border-x border-y border-stroke rounded-lg p-2 mt-1'>
          <div className='flex justify-between'>
            <div className='flex gap-2'>
              <button>
                <svg
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M13 2V6C13 8.20914 14.7909 10 17 10L21 10M3 6L3 18C3 20.2091 4.79086 22 7 22H17C19.2091 22 21 20.2091 21 18V11.6569C21 10.596 20.5786 9.57857 19.8284 8.82843L14.1716 3.17157C13.4214 2.42143 12.404 2 11.3431 2L7 2C4.79086 2 3 3.79086 3 6Z'
                    stroke='#373435'
                    strokeWidth='1.5'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M6.4375 18V13.7051H7.8291C8.35645 13.7051 8.7002 13.7266 8.86035 13.7695C9.10645 13.834 9.3125 13.9746 9.47852 14.1914C9.64453 14.4062 9.72754 14.6846 9.72754 15.0264C9.72754 15.29 9.67969 15.5117 9.58398 15.6914C9.48828 15.8711 9.36621 16.0127 9.21777 16.1162C9.07129 16.2178 8.92188 16.2852 8.76953 16.3184C8.5625 16.3594 8.2627 16.3799 7.87012 16.3799H7.30469V18H6.4375ZM7.30469 14.4316V15.6504H7.7793C8.12109 15.6504 8.34961 15.6279 8.46484 15.583C8.58008 15.5381 8.66992 15.4678 8.73438 15.3721C8.80078 15.2764 8.83398 15.165 8.83398 15.0381C8.83398 14.8818 8.78809 14.7529 8.69629 14.6514C8.60449 14.5498 8.48828 14.4863 8.34766 14.4609C8.24414 14.4414 8.03613 14.4316 7.72363 14.4316H7.30469Z'
                    fill='#373435'
                  />
                  <path
                    d='M10.4365 13.7051H12.0215C12.3789 13.7051 12.6514 13.7324 12.8389 13.7871C13.0908 13.8613 13.3066 13.9932 13.4863 14.1826C13.666 14.3721 13.8027 14.6045 13.8965 14.8799C13.9902 15.1533 14.0371 15.4912 14.0371 15.8936C14.0371 16.2471 13.9932 16.5518 13.9053 16.8076C13.7979 17.1201 13.6445 17.373 13.4453 17.5664C13.2949 17.7129 13.0918 17.8271 12.8359 17.9092C12.6445 17.9697 12.3887 18 12.0684 18H10.4365V13.7051ZM11.3037 14.4316V17.2764H11.9512C12.1934 17.2764 12.3682 17.2627 12.4756 17.2354C12.6162 17.2002 12.7324 17.1406 12.8242 17.0566C12.918 16.9727 12.9941 16.835 13.0527 16.6436C13.1113 16.4502 13.1406 16.1875 13.1406 15.8555C13.1406 15.5234 13.1113 15.2686 13.0527 15.0908C12.9941 14.9131 12.9121 14.7744 12.8066 14.6748C12.7012 14.5752 12.5674 14.5078 12.4053 14.4727C12.2842 14.4453 12.0469 14.4316 11.6934 14.4316H11.3037Z'
                    fill='#373435'
                  />
                  <path
                    d='M14.7812 18V13.7051H17.7256V14.4316H15.6484V15.4482H17.4414V16.1748H15.6484V18H14.7812Z'
                    fill='#373435'
                  />
                </svg>
              </button>
              <div>
                <p className='text-xs text-primary-black font-normal'>{pdf.document_name}</p>
                <p className='text-xs text-light-grey font-normal'>
                  {(pdf.document_meta.size / 1048576).toFixed(2) + ' MB'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                deletePDF(pdf.id);
                files.length = 0;
              }}
            >
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
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

          <div className='flex justify-between items-center gap-2'>
            <span className='h-1 w-full bg-secondary-green rounded'></span>
            <p className='text-[10px] text-primary-black font-normal'>100%</p>
          </div>
        </div>
      ) : null} */}
    </div>
  );
}

export default PdfAndImageUploadBanking;
