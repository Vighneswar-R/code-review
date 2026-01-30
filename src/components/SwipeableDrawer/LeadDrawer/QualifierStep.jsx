import { useContext } from 'react';
import ProgressBar from './ProgressBar';
import { useNavigate } from 'react-router-dom';
import { LeadContext } from '../../../context/LeadContextProvider';
import { LockIcon } from '../../../assets/icons';

export default function QualifierStep({ details, steps, index, stepIndex, noProgress, lock }) {
  const { setCurrentStepIndex, setDrawerOpen, drawerOpen, setActiveIndex, values } =
    useContext(LeadContext);
  const navigate = useNavigate();

  const handleClick = () => {
    if (steps) {
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
          : values?.applicants?.[index]?.applicant_details?.extra_params?.qualifier
          ? 'bg-[#D9F2CB] border-[#147257]'
          : 'bg-[#FBF7D9] border-[#E1CE3F]'
      } `}
      onClick={lock ? null : handleClick}
    >
      <div className='flex justify-between gap-1'>
        <details.Icon />
        <div className='flex flex-col flex-1'>
          {lock ? (
            <>
              <span className='text-[14px] font-normal'>Qualifier is not activated</span>

              <span className='text-[11px] font-normal text-[#727376]'>
                Complete Applicant, Personal, Address and Work & Income details to activate
              </span>
            </>
          ) : values?.applicants?.[index]?.applicant_details?.extra_params?.qualifier ? (
            <>
              <span className='text-[14px] font-normal'>Qualifier completed</span>
            </>
          ) : (
            <>
              <span className='text-[14px] font-normal'>Qualifier is activated</span>

              <div className='flex justify-between w-[100%]'>
                <span className='text-[11px] font-normal text-[#727376]'>
                  Run the verifications now to complete the first milestone
                </span>
                <span className='text-[#E33439] text-[14px] font-semibold'>Verify</span>
              </div>
            </>
          )}
        </div>
        {!details.hideProgress ? (
          !lock && steps ? (
            <>
              {values?.applicants?.[index]?.applicant_details?.extra_params?.qualifier ? (
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
          progress={values?.applicants?.[index]?.applicant_details?.extra_params?.qualifier || 0}
        />
      ) : null}
    </div>
  );
}
