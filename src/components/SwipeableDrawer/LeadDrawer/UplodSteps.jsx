import { useContext, useEffect } from 'react';
import ProgressBar from './ProgressBar';
import { useNavigate } from 'react-router-dom';
import { LeadContext } from '../../../context/LeadContextProvider';
import { LockIcon } from '../../../assets/icons';

export default function UploadSteps({ details, steps, index, stepIndex, noProgress, lock }) {
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
      className='flex flex-col w-[100%] max-h-[77px] rounded-lg border p-2 justify-between'
      onClick={lock ? null : handleClick}
    >
      <div className='flex justify-between gap-1'>
        <details.Icon />
        <div className='flex flex-col flex-1 overflow-hidden overflow-ellipsis'>
          <span className='text-[14px] font-normal'>{details.title}</span>
          {steps ? (
            <span className='text-[11px] font-normal text-[#727376] whitespace-nowrap truncate'>
              {details.description}
            </span>
          ) : null}
        </div>
        {!details.hideProgress ? (
          !lock && steps ? (
            details.name === 'lt_charges' ? (
              <>
                {values?.lt_charges?.find((e) => e.status === 'Completed') ? (
                  <span className='text-[#147257] text-[10px] font-medium border border-[#147257] bg-[#D9F2CB] rounded-[12px] h-[23px] w-[81px] flex items-center justify-center'>
                    Received
                  </span>
                ) : (
                  <span className='text-[#E33439] text-[10px] font-medium border border-[#E33439] bg-[#FFD6D7] rounded-[12px] h-[23px] w-[81px] flex items-center justify-center'>
                    Pending
                  </span>
                )}
              </>
            ) : details.name === 'property_details' || details.name === 'reference_details' ? (
              <>
                {values?.[details.name]?.extra_params?.progress === 100 ? (
                  <span className='text-[#147257] text-[10px] font-medium border border-[#147257] bg-[#D9F2CB] rounded-[12px] h-[23px] w-[81px] flex items-center justify-center'>
                    Done
                  </span>
                ) : (
                  <span className='text-[#065381] text-[10px] font-medium border border-[#065381] bg-[#E5F5FF] rounded-[12px] h-[23px] w-[81px] flex items-center justify-center'>
                    In Progress
                  </span>
                )}
              </>
            ) : values?.applicants?.[index]?.applicant_details?.extra_params?.upload_progress ===
              100 ? (
              <span className='text-[#147257] text-[10px] font-medium border border-[#147257] bg-[#D9F2CB] rounded-[12px] h-[23px] w-[81px] flex items-center justify-center'>
                Done
              </span>
            ) : (
              <span className='text-[#065381] text-[10px] font-medium border border-[#065381] bg-[#E5F5FF] rounded-[12px] h-[23px] w-[81px] flex items-center justify-center'>
                In Progress
              </span>
            )
          ) : (
            <LockIcon />
          )
        ) : null}
      </div>

      {!lock && !noProgress ? (
        details.name === 'property_details' || details.name === 'reference_details' ? (
          <>
            <ProgressBar progress={values?.[details.name]?.extra_params?.progress || 0} />
          </>
        ) : (
          <ProgressBar
            progress={
              values?.applicants?.[index]?.applicant_details?.extra_params?.upload_progress || 0
            }
          />
        )
      ) : null}
    </div>
  );
}
