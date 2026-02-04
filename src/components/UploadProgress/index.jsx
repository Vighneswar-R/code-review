import React, { useEffect, useState,useRef, useContext } from "react";
import { LeadContext } from "../../context/LeadContextProvider";

export default function UploadProgress({fileName, fileSize,setFileName,newLoader,complete,failed }) {

  const {isFetching} = useContext(LeadContext);

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("uploading");
  const [speed, setSpeed] = useState("0 MB/s");
  const [timeLeft, setTimeLeft] = useState("--s");

  const[isLoading,setIsLoading] = useState(false);
  
  const[intervalSpeed,setIntervalSpeed] = useState(null);

  const completeRef = useRef(null);

    const failedRef = useRef(null);



  useEffect(()=>{

    if(isFetching){
      setIsLoading(true);
    }
  },[])


  const checkInternetSpeed =  () =>{
      if ('connection' in navigator) {
    const { downlink, effectiveType } = navigator.connection;

    setIntervalSpeed(effectiveType || '4g')

    return;
  }

  setIntervalSpeed('4g');

  return;

  }


  useEffect(()=>{

checkInternetSpeed();

  },[])



  useEffect(()=>{

    failedRef.current = failed;

  },[failed])
  


  useEffect(()=>{

    completeRef.current = complete

  },[complete])


  const getIntervalTime = () =>{

   let intervalTime;

   switch(intervalSpeed){
    case('slow-2g'):
    intervalTime = 600
    break
    case('2g'):
    intervalTime = 400;
    break;
    case('3g'):
    intervalTime = 180;
    break;
    case('4g'):
    intervalTime = 100;
    break
    default:
    intervalTime = 250
   }

  return intervalTime
  }

  useEffect(() => {

    console.log("FILE NAME",isFetching)

    if(!intervalSpeed) return;

    let uploaded = 0;
    const total = fileSize || "100"
    const interval = setInterval(() => {
      const increment = Math.random() * (total * 0.02);
      uploaded += increment;
      let percentage = Math.min((uploaded / total) * 100, 100);

      if(completeRef.current == true){
        setProgress(100);
        percentage = 100;
      }

      if(!completeRef.current){
      setProgress(percentage.toFixed(0));

      }

      const spd = (increment / 1024 / 1024).toFixed(2);
      setSpeed(`${spd} MB/s`);


      const remaining = total - uploaded;
      const time = remaining / (increment / 0.5); 
      setTimeLeft(`${Math.max(time / 1000, 0).toFixed(0)}s`);

      if (percentage >= 100) {
        clearInterval(interval);
        // setFileName('')
        setStatus("success");
      }
    }, getIntervalTime());

    return () => clearInterval(interval);
  }, [intervalSpeed]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 text-blue-600 p-2 rounded-full">📄</div>
          <div>
            <div className="font-medium">{fileName}</div>
            <div className="text-xs text-gray-500">
              {((fileSize || 50) / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-2 bg-gray-200 rounded mt-3 overflow-hidden">
        <div
          className={`h-2 ${progress >= 100 && !failed ? "bg-green-500" : failed == true?"bg-red-500":"bg-blue-500"}`}
          style={{ width: `${progress}%`, transition: "width 0.1s ease-in-out" }}
        ></div>
      </div>

      <div className="text-xs text-gray-600 mt-1">
        {status === "uploading" && (
          <>
            <span>{isFetching?'Fetching:':'Uploaded:'} {progress}%</span> &nbsp;|&nbsp;
          </>
        )}
        {(status === "success" && !isLoading && !failed)  && (
          <span className="text-green-600 font-medium">Upload Successful!</span>
        )}

        {failed == true &&<span className="text-red-600 font-medium">Upload Failed!</span>
}
      </div>
    </div>
  );
}
