import { useContext, useEffect,useState } from 'react';
import ProgressBar from './ProgressBar';
import { useNavigate } from 'react-router-dom';
import { LeadContext } from '../../../context/LeadContextProvider';
import { LockIcon } from '../../../assets/icons';
import ErrorTost from '../../ToastMessage/ErrorTost';
import { AuthContext } from '../../../context/AuthContextProvider';

export default function EligibilityStep({ details, steps, index, stepIndex, noProgress, lock }) {
  const { setCurrentStepIndex, setDrawerOpen, drawerOpen, setActiveIndex, values,setFieldValue } =
    useContext(LeadContext);
  const navigate = useNavigate();

   const {token} = useContext(AuthContext);
  const[error,setError] = useState('');



  const updateProgress = async () => {



    // const res =  updateProgressOnUpload(values?.applicants?.[activeIndex]?.applicant_details?.id,{
    //   headers: {
    //     Authorization: token,
    //   },
    // },);

    let batched_requests = [];

    //Check for all applicants weather qualifier is completed and progress for first 4 screens is not 100

    let applicants = values?.applicants;

    for(const applicant of applicants) {

      let completedProgress = true;

      if(applicant?.applicant_details?.extra_params?.qualifier == true) {

        if(applicant.applicant_details.extra_params.progress != 100) {
          completedProgress = false;
          applicant.applicant_details.extra_params.progress = 100;
        }

        if(applicant.personal_details.extra_params.progress != 100) {
          completedProgress = false;

          applicant.personal_details.extra_params.progress = 100
        }

        if(applicant.address_detail.extra_params.progress != 100) {
          completedProgress = false;
          applicant.address_detail.extra_params.progress = 100
        }

        if(applicant.work_income_detail.extra_params.progress != 100) {
          completedProgress = false;
          applicant.work_income_detail.extra_params.progress = 100
        }
      }

      if(completedProgress == false) {

        batched_requests.push(updateProgressOnUpload(applicant.applicant_details?.id,{
          headers: {
            Authorization: token,
          },
        },))
      }
    }

    const requests = Promise.all(batched_requests);

    setFieldValue('applicants', applicants);

}


 

  //navigate(details.url)
  const handleClick = () => {
        const applicants = values?.applicants;

    let generated = true;

    for(const app of applicants){
      if(!app?.applicant_details?.application_form_otp_verified || app?.applicant_details?.application_form_otp_verified == false){
        generated = false;
      }
    }

    if(generated == false){
      // alert("Application Form is Mandatory");

      setError('Application Form is Mandatory')
      return;
    }

    setError('')


    if (steps) {

      updateProgress();
      setActiveIndex(
        index,
        setDrawerOpen(false, setCurrentStepIndex(stepIndex), navigate(details.url)),
      );
    }
  };



  return (
    <div
      className={`flex flex-col w-[100%] max-h-[77px] rounded-lg border p-2 justify-between ${
        lock
          ? 'bg-[#FDECE8] border-[#E33439]'
          : values?.applicants?.[index]?.applicant_details?.extra_params?.eligibility
          ? 'bg-[#D9F2CB] border-[#147257]'
          : 'bg-[#FBF7D9] border-[#E1CE3F]'
      } `}
      onClick={lock ? null : handleClick}
    >
      <ErrorTost message={error} setMessage={setError}/>
      <div className='flex justify-between gap-1'>
        <details.Icon />
        <div className='flex flex-col flex-1'>
          {lock ? (
            <>
              <span className='text-[14px] font-normal'>Eligibility is not activated</span>

              <span className='text-[11px] font-normal text-[#727376]'>
                Complete all the steps to activate
              </span>
            </>
          ) : values?.applicants?.[index]?.applicant_details?.extra_params?.eligibility ? (
            <>
              <span className='text-[14px] font-normal'>Eligibility completed</span>
            </>
          ) : (
            <>
              <span className='text-[14px] font-normal'>Eligibility is activated</span>

              <div className='flex justify-between w-[100%]'>
                <span className='text-[11px] font-normal text-[#727376]'>
                  Run the verifications now to complete the first milestone
                </span>
                {/* <span className='text-[#E33439] text-[14px] font-semibold'>Verify</span> */}
              </div>
            </>
          )}
        </div>
        {!details.hideProgress ? (
          !lock && steps ? (
            <>
              {values?.applicants?.[index]?.applicant_details?.extra_params?.eligibility ? (
                <span className='text-[#147257] text-[10px] font-medium border border-[#147257] bg-[#D9F2CB] rounded-[12px] h-[23px] w-[81px] flex items-center justify-center'>
                  Done
                </span>
              ) : (
                <span className='text-[#065381] text-[10px] font-medium border border-[#065381] bg-[#E5F5FF] rounded-[12px] h-[23px] w-[81px] flex items-center justify-center'>
                  In Progress
                </span>
              )}
            </>
          ) : (
            <LockIcon />
          )
        ) : null}
      </div>

      {!lock && !noProgress ? (
        <ProgressBar
          progress={values?.applicants?.[index]?.applicant_details?.extra_params?.eligibility || 0}
        />
      ) : null}
    </div>
  );
}