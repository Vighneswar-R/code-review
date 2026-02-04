/* eslint-disable react/prop-types */
import React, { useContext } from 'react';
import { LeadContext } from '../../../../context/LeadContextProvider';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import OpenAccordian from '../../../../assets/icons/OpenAccordian';
import ToggleSwitch from '../../../../components/ToggleSwitch';
import { Button } from '../../../../components';
import GenericBankLogo from '../../../../assets/icons/generic_bank_logo.svg';
import { useNavigate } from 'react-router-dom';

export default function Accounts({
  data,
  handlePrimaryChange,
  handleRetry,
  handleDelete,
  handleEdit,
  onAggregationClick,
}) {
  const { values, activeIndex } = useContext(LeadContext);
  const navigate = useNavigate();
  const isValidAccountNumber =
    typeof data?.account_number === 'string' && /^\d+$/.test(data.account_number);
  const isAggregationDone = isValidAccountNumber && data?.account_aggregator_response;
  function maskAccountNumber(accountNumber) {
    // Check if the account number is a valid string
    if (typeof accountNumber !== 'string') {
      return 'Invalid account number';
    }

    // Determine the number of characters to mask (all except the last 4)
    const numToMask = accountNumber.length - 4;

    // Create a mask with the same length as the characters to mask
    const mask = '*'.repeat(numToMask);

    // Concatenate the mask with the last 4 characters of the account number
    const maskedNumber = mask + accountNumber.slice(-4);

    return maskedNumber;
  }

  return (
    <div>
      <Accordion style={{ borderRadius: '8px' }} TransitionProps={{ unmountOnExit: true }}>
        <AccordionSummary
          expandIcon={<OpenAccordian />}
          aria-controls='panel1a-content'
          id='panel1a-header'
          style={{ padding: '15px', paddingTop: '5px', minHeight: '70px' }}
        >
          <div className='flex flex-col w-[100%] gap-1'>
            <div className='flex flex-row items-center h-[46px] pr-[10px]'>
              <img src={GenericBankLogo} alt='' className='mr-4 h-[32px] w-[32px]' />
              <div className='flex flex-col gap-[4px]'>
                <div className='flex gap-[8px] items-center'>
                  <span
                    className={`text-[16px] font-normal leading-[24px] w-[130px] whitespace-nowrap overflow-hidden overflow-ellipsis`}
                  >
                    {data.bank_name}
                  </span>
                  {data.is_primary ? (
                    <span className='text-[#065381] text-[10px] font-medium border border-[#065381] bg-[#E5F5FF] rounded-[12px] h-[19px] w-[56px] flex items-center justify-center'>
                      Primary
                    </span>
                  ) : null}
                </div>
                <span className='text-[12px] text-[#707070] font-normal leading-[18px]'>
                  {maskAccountNumber(data.account_number)}
                </span>
              </div>
            </div>
            {!data?.account_aggregator_response ? (
              <div className='flex justify-between pr-[10px]'>
                {data?.penny_drop_response?.result?.active === 'yes' ? (
                  <span className='text-[#147257] text-[10px] font-medium border border-[#147257] bg-[#D9F2CB] rounded-[12px] h-[19px] pl-[10px] pr-[10px] flex items-center justify-center'>
                    Penny drop successful
                  </span>
                ) : (
                  <>
                    <span className='text-[#E33439] text-[10px] font-medium border border-[#E33439] bg-[#FFD6D7] rounded-[12px] h-[19px] pl-[10px] pr-[10px] flex items-center justify-center'>
                      Penny drop failed
                    </span>

                    <button
                      className='text-[#E33439] text-[14px] font-medium'
                      onClick={() => handleRetry(data.id)}
                    >
                      Retry
                    </button>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </AccordionSummary>

        <AccordionDetails style={{ minHeight: '114px' }}>
          <hr className='border border-[#D9D9D9] w-100' />
          <div className='flex flex-col justify-between h-full mt-1'>
            <div className='flex gap-[4px]'>
              <span className='text-[12px] font-normal text-[#727376]'>IFSC code:</span>
              <span className='text-[12px] font-normal text-[#000000]'>{data.ifsc_code}</span>
            </div>
            <div className='flex gap-[4px]'>
              <span className='text-[12px] font-normal text-[#727376]'>Branch:</span>
              <span className='text-[12px] font-normal text-[#000000]'>{data.branch_name}</span>
            </div>
            <div className='flex gap-[4px]'>
              <span className='text-[12px] font-normal text-[#727376]'>Account type:</span>
              <span className='text-[12px] font-normal text-[#000000]'> {data.account_type}</span>
            </div>
            {!isAggregationDone ? (
              <div className='flex gap-[4px]  mt-1'>
                <span className='text-[#E33439] text-[10px] font-medium border border-[#E33439] bg-[#FFD6D7] rounded-[12px] h-[19px] pl-[10px] pr-[10px] flex items-center justify-center'>
                  Penny drop failed
                </span>

                <button
                  className='text-[#E33439] text-[14px] font-medium'
                  onClick={() =>
                    navigate('/lead/banking-details/account-aggregator', {
                      state: {
                        data: data?.account_aggregator_response||null,
                      },
                    })
                  }
                >
                  Retry
                </button>
                
              </div>
            ) : (
              <div className='flex gap-[4px]'>
                <span className='text-[12px] font-normal text-[#727376]'>Make it primary</span>
                <ToggleSwitch
                  name='make_it_primary'
                  checked={data.is_primary}
                  onChange={(e) => handlePrimaryChange(data.id, e.currentTarget.checked)}
                />
              </div>
            )}
            {isAggregationDone && <span className='text-[#147257] text-[10px] font-medium border border-[#147257] bg-[#D9F2CB] rounded-[12px] h-[19px] pl-[10px] pr-[10px] flex items-center justify-center'>
                    Penny drop successful
                  </span>}

            {!data?.account_aggregator_response &&
            (!data?.penny_drop_response || data?.penny_drop_response?.result?.active !== 'yes') ? (
              <div className='flex gap-[10px] mt-[10px]'>
                <Button inputClasses='w-full h-[46px]' onClick={() => handleDelete(data.id)}>
                  Delete
                </Button>
                <Button
                  primary={true}
                  inputClasses='w-full h-[46px]'
                  onClick={(e) => handleEdit(e, data.id)}
                >
                  Edit Details
                </Button>
              </div>
            ) : null}
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}