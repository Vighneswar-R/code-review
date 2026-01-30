import React, { useContext } from 'react'
import { useState,useEffect,useRef } from 'react'
import { Backdrop, Typography, Box, CircularProgress } from '@mui/material';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { AuthContext } from '../../context/AuthContextProvider';
import axios from 'axios'
import pako from 'pako';


const FormModal = ({data,otp,verified,sendApplicationOtp,verifyApplicationOtp,setOpenApplication,generateForm,Formurl,activeApplicant,containerClassName=""}) => {

    const[sentOtp,setSentOtp] = useState(false);

    const[innerOtp,setInnerOtp] = useState("");


    const[loader,setLoader] = useState(false);

    // const[activeApplicant,setActiveApplicant] = useState(0);

    const[innerData,setInnerData] = useState([]);

    const[otpRes,setOtpRes] = useState("");

    const[url,setUrl] = useState("")

    const[content,setContent] = useState("");

    const[tempOtp,setTempOtp] = useState('');

    const[loaded,setLoaded] = useState(false);



    const{token} = useContext(AuthContext);

    useEffect(()=>{

    setLoaded(false);

    },[activeApplicant])


    const generateOnLoad = async () =>{

      try{

    setLoader(true)


    setContent("Processing Please Wait")
    
    const form = await generateForm(data?.[activeApplicant]?.id,true,null,activeApplicant);

    setLoader(false)

    setContent("")

      }

      catch(err){
        console.log("Error Generating Form")
                    setLoader(false);

      }


      setLoaded(true);

    }


    useEffect(()=>{

      

      if(!data?.[activeApplicant]?.verified || data?.[activeApplicant]?.verified == false){


        if(!data || !data?.length || loaded) return;

        generateOnLoad();

      }

    },[data,activeApplicant,loaded])


    // const getImageBlob = async() => {

    //   try{

    //     console.log("URL CALLED",data);

    //     if(!data?.[activeApplicant]?.url){
    //       setUrl(null);
    //       return;
    //     }

    //   const response_image = await axios.get(data?.[activeApplicant]?.url,{
    //     headers:{
    //       Authorization:token
    //     },
    //     responseType:'blob'
    //   });

    //   let blob_url = URL.createObjectURL(response_image.data)

    //   setUrl(blob_url)

    // }

    // catch(err){

    //   console.log("Error Fetching the Image for Preview")
    // }
    // }

    // useEffect(()=>{


    //   getImageBlob();

    // },[data,activeApplicant])


    // show preview based on html 


    useEffect(()=>{

      if(!data?.[activeApplicant]?.form_html){
        setUrl(null);
        return;
      }

      setUrl(data?.[activeApplicant]?.form_html);

    },[data,activeApplicant])



    const sanitizeUrlTemp = (url) =>{

        if(!url) return ""

        let split = url.split('https://itrustuatcloud.indiashelter.in');

let sanitized = `http://localhost:8005${split?.[1]?.toString()}`

return sanitized;

    }


    useEffect(()=>{

        if(!data?.length) return;

        setInnerData(data);

    },[data])



//     useEffect(()=>{

// setInnerOtp(otp);

//     },[otp])

    const onHandleChangeOtp = async (e) =>{

        const {value} = e?.target;

        setOtpRes("")

        // setInnerOtp(value);

        // set based on active applicant

        // let copy_data = structuredClone(innerData);

        // copy_data[activeApplicant].otp = value;

        // setInnerData(copy_data)

        if(value?.length == 5) {
            
          const res = await verifyApplicationOtp(value,data?.[activeApplicant]?.id,data?.[activeApplicant]?.index);


          if(res?.message == "Valid OTP"){

            setLoader(true);

            setOtpRes("");

            setSentOtp(false);

            try{


            const form = await generateForm(data?.[activeApplicant]?.id,false,res?.updated || {},activeApplicant);

            setLoader(false);

            }

            catch(err){

                console.log("ERRPOR",err);
                setLoader(false);

            }

          }

          else{
              setOtpRes("Invalid Otp")
          }
        }

    }


    const onOTPSendClick = async () =>{


        try{
        
        setLoader(true);

        setContent("Processing OTP Request")


        const res = await sendApplicationOtp(data?.[activeApplicant]?.id,data?.[activeApplicant]?.index);

        if(res?.code == 200){


                  setTempOtp(res?.otp)

                  setSentOtp(true);

                  setLoader(false);

        setContent("")

                         return {
          success:true,
        }

        }


        else{
          alert("OTP Sent failed");

                  setLoader(false);

                          setContent("")


                      return {
          success:false
        }

        }

        }

        catch(err){

           /* console.log("ERR",err);

            alert(err?.response?.data?.message || "OTP Sent failed");

            setLoader(false);

            setContent("")


             return {
          success:false
        }*/
          //Pankaj Changes on 9 Oct 2025
          console.error('Error sending OTP:', err);
 
          // Prefer a message from the server if present
          const status = err?.response?.status;
          const serverMessage = err?.response?.data?.message;
 
          if (status === 500) {
            // Known server error case
            alert('Please upload customer photo');
          } else if (serverMessage) {
            alert(serverMessage);
          } else if (err?.message) {
            alert(err.message);
          } else {
            alert('OTP send failed');
          }
 
          // Ensure loader and content are cleared in all error cases
          setLoader(false);
          setContent('');
 
          return {
            success: false,
            error: err,
          };


        }

    }
  return (
<div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-40 flex z-[1000]">

  

    <ModalComponent open = {loader} content = {content} />

  <div className={`bg-white w-full max-w-md rounded-xl shadow-lg p-6 ${containerClassName}`}>

<div className="flex flex-row-reverse justify-between items-center">
        <button className='min-w-[80px] font-normal py-1 px-1 rounded disabled:text-dark-grey disabled:bg-stroke bg-primary-red text-white' onClick={()=>{setOpenApplication(false)}}>X</button>


{data?.[activeApplicant]?.verified?<button
            type='button'
            className='text-primary-red cursor-pointer font-semibold float-right h-12 py-3 px-2'
       
          >
            <span>OTP Verified</span>

          </button>:  <div className='flex gap-8'>
      
            <button
            type='button'
              className={`min-w-[93px] font-normal py-1.5 px-1 rounded disabled:text-dark-grey disabled:bg-stroke ${
                sentOtp || verified
                  ? 'text-dark-grey bg-stroke pointer-events-none'
                  : 'bg-primary-red text-white'
              }`}
              // disabled={disabledOtpButton}
              onClick={onOTPSendClick}
              disabled = {data?.[activeApplicant]?.verified  || sentOtp}
            >
              {'Send OTP'}
            </button>

            </div>}


            </div>

            
<div className='flex justify-center gap-3 w-full'>

  {/* {data?.map((ele,index)=>{
return(
  <CustomStepper active = {activeApplicant} index = {index} setActiveApplicant = {setActiveApplicant} setLoaded = {setLoaded}/>
)
  })} */}
          
          </div>

          
    <div className='h-[30px] mt-8'>

        {data?.[activeApplicant]?.fields?.map((e,i)=>{
            return(
                              <div className='flex items-center gap-4 mt-5' key = {i}
>

              <p className='w-1/2 text-xs not-italic font-normal text-dark-grey'>
              {e?.label}
</p>

 <p
          className={`w-1/2 text-xs not-italic font-medium text-primary-black`}
          >

{e?.value}
          </p>

                    </div>
            )
        })}


            
    </div>

    {/* Preview area */}
    <div className={`${url?'h-350':'h-40'}w-full bg-gray-100 rounded-md flex items-center justify-center text-gray-400 mt-10`}
    >
<div className={`relative w-full ${url?'h-[750px]':'h-[120px]'}`}>

    {/* {url && <span className='block mx-auto w-fit'>Click to Open</span>} */}

<div
className="absolute top-0 left-0 w-full h-full cursor-pointer"
>

     <div className="relative w-full">
      {/* Your target div */}

      {/* Floating "Open" button */}
  <button
  className="absolute top-2 right-2 bg-white border border-gray-300 rounded px-2 py-1 flex items-center gap-1 text-sm shadow hover:scale-105 hover:shadow-md transition text-gray-400 hover:text-gray-800"
  onClick={()=>{
  const newWindow = window.open("", "_blank")

  if (!newWindow) {
    alert("Popup blocked! Please allow popups for this site.");
    return;
  }

  // Write custom HTML into the new window
  newWindow.document.open();
  newWindow.document.write(`
    <html>
      <body>
        ${url}
        <script>
          document.addEventListener('click', function () {
            if (window.opener) {
              document.body.innerHTML = \`${url.replace(/`/g, "\\`")}\`;
            }
          });
        </script>
      </body>
    </html>
  `);
  newWindow.document.close();
  }}
>
  
  Maximize
  <span className="text-lg">?</span>
</button>
    </div>
  {url?  <iframe
    srcDoc={`
      <html>
        <body>
          ${url}
          <script>
            document.addEventListener('click', function () {
              if (newWindow) {
                newWindow.document.open();
                newWindow.document.write(\`${url.replace(/`/g, '\\`')}\`);
                newWindow.document.close();
              }
            });
          </script>
        </body>
      </html>
    `}
    className="w-full h-full border-none overflow-auto bg-red"  // pointer-events-none
  />:<span className='block mx-auto w-fit'>No Preview Available</span>}

  </div>

  <div
//           className="top-0 left-0 w-full h-full cursor-pointer"
//           style={{ pointerEvents: 'auto' }}


// onClick={() => {
// const url_open = url;

// if (url_open) {
//   const newWindow = window.open('', '_blank');
//   if (newWindow) {
//     newWindow.document.open('text/html'); 
//     newWindow.document.write(url_open)
//     newWindow.document.close();
//   }
// }    

// }}
  />
</div>


    </div>


    {/* Input fields */}
    <div className="mt-6 space-y-4">
        <div className='flex justify-around gap-4'>
      {/* <input
        type="text"
        placeholder="Enter OTP"
        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={onHandleChangeOtp}
        value = {innerData?.[activeApplicant]?.otp || ""}
        disabled = {data?.[activeApplicant]?.verified || !sentOtp}
      /> */}

      <OtpModal isOpen={sentOtp} onClose={()=>{
        setSentOtp(false);
      }} onChange = {onHandleChangeOtp} verified = {data?.[activeApplicant]?.verified} otpRes = {otpRes} onOTPSendClick = {onOTPSendClick} setOtpRes= {setOtpRes} tempOtp= {tempOtp}/>



{/* 
      <div className='flex gap-8'>
      
            <button
              className={`min-w-[93px] mb-10 self-end font-normal py-3 px-2 rounded disabled:text-dark-grey disabled:bg-stroke ${
                sentOtp || verified
                  ? 'text-dark-grey bg-stroke pointer-events-none'
                  : 'bg-primary-red text-white'
              }`}
              // disabled={disabledOtpButton}
              onClick={onOTPSendClick}
              disabled = {data?.[activeApplicant]?.verified  || sentOtp}
            >
              {'Send OTP'}
            </button>

            </div> */}

{/* 
            <button
              className={`min-w-[93px] mb-10 self-end font-normal py-3 px-2 rounded disabled:text-dark-grey disabled:bg-stroke ${
                sentOtp || verified
                  ? 'text-dark-grey bg-stroke pointer-events-none'
                  : 'bg-primary-red text-white'
              }`}
              // disabled={disabledOtpButton}
              onClick={async ()=>{

                try{
                  setLoader(true);
                const form = await generateForm(true);

                }

                catch(err){
                  console.log("Error generating form email")
                }

                finally{
                  setLoader(false);

                }
              }}
              disabled = {data?.[activeApplicant]?.verified  || sentOtp}
            >
              {'Send Form Email'}
            </button> */}


      </div>

    </div>

    <div className='flex justify-between gap-4 w-15'>

     {/* <button
              className={`min-w-[93px] self-end font-normal py-3 px-2 rounded disabled:text-dark-grey disabled:bg-stroke ${
                loader
                  ? 'text-dark-grey bg-stroke pointer-events-none'
                  : 'bg-primary-red text-white'
              }`}
              // disabled={disabledOtpButton}
onClick={()=>{
    setActiveApplicant((prev)=>prev-1)
    setTempOtp('')
    setLoaded(false);

}}          
  disabled = {loader || activeApplicant == 0}
            >
              {'Previous'}
            </button> */}


       {/* <button
              className={`min-w-[93px] self-end font-normal py-3 px-2 rounded disabled:text-dark-grey disabled:bg-stroke ${
                loader
                  ? 'text-dark-grey bg-stroke pointer-events-none'
                  : 'bg-primary-red text-white'
              }`}
              // disabled={disabledOtpButton}
onClick={()=>{
    setActiveApplicant((prev)=>prev+1)
    setTempOtp('')
    setLoaded(false)
}}            
  disabled = {loader || activeApplicant == data?.length -1 }
            >
              {'Next'}
            </button> */}

            </div>
  </div>
  
</div>  )
}



const ModalComponent = ({open,content}) => {

  return(
  <Backdrop
  sx={{
    color: '#fff',
    zIndex: (theme) => theme.zIndex.modal + 1, // Ensures it is above other content but below other modals
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Slightly transparent background to show the content behind
    position: 'fixed', // To position it over the entire screen
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}
  open={open} // Set to true to make the backdrop visible
>
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: 'transparent', // Make the box background transparent
      padding: '20px', // Optional padding for spacing around the loader
    }}
  >
    <CircularProgress color="inherit" />
    <Typography variant="h6" sx={{ mt: 2 }}>
      {content?content:"Generating Application Form, please wait..."}
    </Typography>
  </Box>
</Backdrop>
  )
}


// Otp Modal

const OtpModal = ({ isOpen, onClose,onChange,verified,otpRes,onOTPSendClick,setOtpRes,tempOtp }) => {
  if (!isOpen) return null;

  const defaultTime = 30;

  const[resendTime,setResendTime] = useState(defaultTime);

  const[showResend,setShowResend] = useState(false);

  const timerRef = useRef(null);

  const inputRef = useRef(null);

  useEffect(()=>{

    if(showResend) return;

    timerRef.current = setInterval(()=>{

      setResendTime((prev)=>{
       
        if(prev == 0){
          setResendTime(defaultTime);
          setShowResend(true);
          clearInterval(timerRef.current);
          return;
        }

        return prev-1
      })
    },1000)
    
    return ()=>clearInterval(timerRef.current)
  },[showResend])

//activeStep={activeStep} 

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-80">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Enter OTP</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-xl">&times;</button>
        </div>
        
        <input
          type="text"
          maxLength={6}
          placeholder="Enter OTP"
          className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={onChange}
          ref = {inputRef}
        />
        <span className="">{otpRes}</span>

        {!showResend && (
            <span className={`text-primary-red text-xs leading-[18px] ${otpRes?.length&& !showResend?'float-right':''}`}>0:{resendTime}s</span>
          )}




          {showResend&&      <button
            type='button'
            className='text-primary-red cursor-pointer font-semibold float-right'
            onClick={async ()=>{

              setOtpRes("")
            
            const {success} = await onOTPSendClick();

            if(success){

              inputRef.current.value = '';

          setResendTime(defaultTime);
          
          setShowResend(false);
            }

            }}
       
          >
            <span>Resend OTP</span>

          </button>}

      </div>
    </div>
  );
};


// stepper component

// const CustomStepper = ({active,index}) =>{


//   return(
//     <div style={{width:'40px',display:'flex'}}>
//     <div style={{width:'30px',height:'30px',borderRadius:'50%',backgroundColor:index == active?"red":'white',display:'flex',alignItems:'center',justifyContent:'center'}}>
//       <span style={{color:index == active?"white":'black'}}>{index+1}</span>
//     </div>
//     {index<active&&<span style={{color:'red'}}>__</span>}
//     </div>
//   )
// }

const CustomStepper = ({ active, index,setActiveApplicant,setLoaded }) => {
  return (
    <div className="flex items-center space-x-2 w-fit mt-5">
      {/* Step circle */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
          index === active ? 'bg-[#E33439] border-[#E33439]' : 'bg-white border-[#E33439]'
        }`}
      >
        <span
          className={`text-sm font-semibold ${
            index === active ? 'text-white' : 'text-black'
          }`}
          onClick={()=>{
            
            setActiveApplicant(index);
          
            setLoaded(false);
          }}

        >
          {index + 1}
        </span>
      </div>

      {/* Dotted line */}
      {index < active && (
        <div className="w-2 border-t border-dotted border-[#E33439]"></div>
      )}
    </div>
  );
};


export default FormModal