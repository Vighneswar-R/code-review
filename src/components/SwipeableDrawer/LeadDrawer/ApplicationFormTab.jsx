import React from 'react'
import { useContext, useEffect,useState } from 'react';
import ProgressBar from './ProgressBar';
import { useNavigate } from 'react-router-dom';
import { LeadContext } from '../../../context/LeadContextProvider';
import { LockIcon } from '../../../assets/icons';
import ErrorTost from '../../ToastMessage/ErrorTost';
import { FaWpforms } from "react-icons/fa"; // You can use any icon here


const ApplicationFormTab = ({ details, steps, index, stepIndex, noProgress, lock }) => {

  const navigate = useNavigate();

  const[error,setError] = useState('');


  const handleClick = () =>{

    navigate('/lead/generate-form');

  }


  return (
   <div
       className={`flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium
        ${lock
          ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
          : "bg-white text-black border-black hover:bg-gray-50"}
      `}
        onClick={lock ? null : handleClick}
      >
        <ErrorTost message={error} setMessage={setError}/>

              <FaWpforms className="text-lg" />
      Application Form

      </div>
  )
}

export default ApplicationFormTab