import React, { useContext, useEffect, useState } from 'react';
import { IconBackBanking, IconClose } from '../../../../assets/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, TextInput, ToastMessage } from '../../../../components';
import exclamation_icon from '../../../../assets/icons/exclamation_icon.svg';
import ResendButtonWithTimer from '../../../../components/ResendButtonWithTimer';
import DynamicDrawer from '../../../../components/SwipeableDrawer/DynamicDrawer';
import loading from '../../../../assets/icons/loader_white.png';
import axios from 'axios';
import { LeadContext } from '../../../../context/LeadContextProvider';
import { AuthContext } from '../../../../context/AuthContextProvider';
import { API_URL, getCompanyNamesList, getAABankList,lo_check, editFieldsById } from '../../../../global';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import BankListPopUp from '../../../../components/BankListPopUp';
import ErrorTost from '../../../../components/ToastMessage/ErrorTost';
import ClickableEndIcon from '../../../../components/TextInput/ClickableEndIcon';
import SearchableTextInput from '../../../../components/TextInput/SearchableTextInput';
import blackSearchIcon from '../../../../assets/icons/blackSearchIcon';
const DISALLOW_NUM = ['0', '1', '2', '3', '4', '5'];


export default function AccountAggregator() {
  const { values, activeIndex, setBankSuccessTost, setFieldValue, setIsManualDisabled,checkIfApplicationDone } =
    useContext(LeadContext);
  const { errorToastMessage,setErrorToastMessage } = useContext(AuthContext);
  const { values: authValues, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileNo, setMobileNo] = useState('');
  const [mobileNoError, setMobileNoError] = useState('');
  const [aaInitiated, setAAInitiated] = useState(false);
  const [enableAA, setEnableAA] = useState(false);
  const [aaRunning, setAARunning] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [checking, setChecking] = useState(false);
  const [referenceId, setReferenceId] = useState();
  const [loadingState, setLoadingState] = useState(false);
  const [showBankList, setShowBankList] = useState(false); // State to toggle bank list display
  const [bankNameOptions, setBankNameOptions] = useState([]);
  const [showAccountNumberInput, setShowAccountNumberInput] = useState(false);
  const [aggregratorData, setAggregratorData] = useState(null);
  const [currentAccountIndex, setCurrentAccountIndex] = useState(0);
  const [selectedBank, setSelectedBank] = useState(null); // State to store selected bank
   const [open, setOpen] = useState(false);
    const [branchData, setBranchData] = useState([]);
    const [bankNameData, setBankNameData] = useState([]);
    const [searchedBank, setSearchedBank] = useState('');
    const [searchedBranch, setSearchedBranch] = useState({});
    const [searchedIfsc, setSearchedIfsc] = useState('');
    const { state } = useLocation();
  // const [openQualifierNotActivePopup, setOpenQualifierNotActivePopup] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [statusCheckState, setStatusCheckState] = useState({
    attempts: 0,
    lastAttemptTime: null,
  });
  
const validationSchema = Yup.object().shape({
  account_number: Yup.string()
    .matches(/^\d{9,18}$/, 'Only numeric characters allowed, length must be between 9 to 18 digits')
    .required('Enter a valid account number'),
  // IFSC validation is handled dynamically in `validate` so we don't enforce it here
});
  const {
    values: accountData,
    setFieldValue: setAccountData,
    errors,
    handleBlur,
    touched,
    handleSubmit,
    setValues,
    setFieldError,
  } = useFormik({
    initialValues: {
      account_number: '',
      ifsc_code: '',
    },
    validationSchema: validationSchema,
    validate: (vals) => {
      const errs = {};
      if (!/^\d{9,18}$/.test(vals.account_number || '')) {
        errs.account_number = 'Only numeric characters allowed, length must be between 9 to 18 digits';
      }

      const currentAccountIfsc =
        aggregratorData?.banking_details?.ifsc_code ||
        aggregratorData?.account_aggregator_response?.accounts?.[currentAccountIndex]?.ifsc_code
      if (!currentAccountIfsc) {
        if (!vals.ifsc_code) {
          errs.ifsc_code = 'Enter a valid IFSC code';
        } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(vals.ifsc_code)) {
          errs.ifsc_code = 'Enter a valid IFSC code';
        }
      }

      return errs;
    },
    onSubmit: () => {
     verify()
    },
  });

    const handleAccountNumberChange = async (e) => {
    const accNumber = e.currentTarget.value;

    const pattern = /[^\d]/g;
    if (pattern.test(accNumber)) {
      e.preventDefault();
      return;
    }

    if (accNumber < 0) {
      e.preventDefault();
      return;
    }

    setAccountData('account_number', accNumber);
  };
  useEffect(() => {
    getBankList();
    getAllBanks();
  }, []);

  

  const[sendCount,setSendCount] = useState(0);

  const[failCount,setFailCount] = useState(0);

  const[triggerNavigate,setTriggerNavigate] = useState(false);



  useEffect(()=> {

    if(triggerNavigate == true){
      navigate('/lead/banking-details');
    }

  },[triggerNavigate])



  const handleFailCount = async () => {

    try{


    setConfirmation(false);

    setAAInitiated(false);
    setAARunning(false);

    const now = new Date();

    const newAttempts = statusCheckState.attempts + 1;

    setStatusCheckState({
      attempts: newAttempts,
      lastAttemptTime: now,
    });

    let ifPassed = false;
    if(sendCount >=3 || failCount >=3){
      const updateFailCount = await editFieldsById(values?.applicants?.[activeIndex]?.personal_details?.id,'personal',{
        AA_fail_count:values?.applicants?.[activeIndex]?.personal_details?.AA_fail_count + 1 || 1,
      },
      {
        headers: {
          Authorization: token,
        },
      },);
  
      // update the fail count 
  
      setFieldValue(`applicants[${activeIndex}].personal_details.manual_enable`,true);

      ifPassed = true;
  
      setIsManualDisabled(false);
  
    }

    if(ifPassed){
      setTimeout(() => {
        navigate('/lead/banking-details',{state:{passed:true}});
      }, 100);
    }

    else {
      setTimeout(() => {
        navigate('/lead/banking-details');
      }, 100);
    }
 
    }

    catch(err){
      console.log("ERROR UPDATING THE FAIL COUNT",err)
    }



  }


  // Restrict LO & BM Numbers in aggregator


  const checkifLo = async () => {

    const res = await lo_check({'mobile_number': mobileNo});
    return res;
  }

  const getBankList = async () => {
    try {
      const data = await getAABankList({
        headers: {
          Authorization: token,
        },
      });

      if (!data) return;

      const newData = data.map((obj) => ({
        label: obj.name,
        value: obj.name,
        id: obj.id,
      }));

      // newData.unshift({
      //   // label: 'Others',
      //   // value: 'others',
      //   id: 0,
      // });

      setBankNameOptions(newData);
    } catch (error) {
      console.log(error);
    }
  };

  const handleInitiateAA = async () => {
    setLoadingState(true);
    // LO BM Check

    const checkLo = await checkifLo();

    if(checkLo?.message == "User found"){
      setMobileNoError('Mobile number cannot be same as Loan Officer Mobile number');
      setLoadingState(false);
      return;
    }
    await axios
      .post(
        `${API_URL}/applicant/account-aggregator/initiate-by-phone-number/${values?.applicants?.[activeIndex]?.applicant_details?.id}`,
        { phone_number: mobileNo },
        {
          headers: {
            Authorization: token,
          },
        },
      )
      .then(({ data }) => {
        setReferenceId(data.account_aggregator_response_initiate_by_phone.referenceId);
        setAAInitiated(true);
        setToastMessage('Link has been sent to the entered mobile number');
        // setIsManualDisabled(false);
        setLoadingState(false);
        // setSendCount((prev)=>prev+1)

      })
      .catch((err) => {
        console.log(err);
        // setIsManualDisabled(false);
        setLoadingState(false);
        // setSendCount((prev)=>prev+1);
        setFailCount((prev)=>prev+1)
        // setFieldValue(`applicants[${activeIndex}].personal_details.AA_fail_count`,values?.applicants?.[activeIndex]?.personal_details?.AA_fail_count + 1 || 1);
      });
  };

  const handleResend = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/applicant/account-aggregator/regenerate-redirection-url/${values?.applicants?.[activeIndex]?.applicant_details?.id}`,
        { referenceId: referenceId },
        {
          headers: {
            Authorization: token,
          },
        },
      );

      if (res.status === 200) {
        setAAInitiated(true);
        setToastMessage('Link has been sent to the entered mobile number');
        setSendCount((prev)=>prev+1)
      } else {
        console.warn('Unexpected status:', res.status);
        setToastMessage('Failed to resend link. Please try again.');
        setSendCount((prev)=>prev+1);
      }
    } catch (err) {
      console.error('Network or server error:', err);
      setToastMessage('Something went wrong. Please try again later.');
      setSendCount((prev)=>prev+1)

    }
  };

  const checkStatus = async () => {
    const now = new Date();

    // 2-minute gap logic
    if (
      statusCheckState.lastAttemptTime &&
      now - statusCheckState.lastAttemptTime < 2 * 60 * 1000
    ) {
      setErrorToastMessage('Please wait for 2 minutes before retrying.');
      return;
    }
    setChecking(true);
    try {
      const response = await axios.post(
        `${API_URL}/applicant/account-aggregator/tracking-status/${values?.applicants?.[activeIndex]?.applicant_details?.id}`,
        { referenceId: referenceId },
        { headers: { Authorization: token } },
      );

      const { status, data } = response;

      if (status === 200) {
        if (data.account_aggregator_response.status === 'COMPLETED') {
          setAggregratorData(data);
          setAccountData('ifsc_code', data?.banking_details?.ifsc_code || '');
          try {
            const res = await axios.get(
              `${API_URL}/banking/by-applicant/${values?.applicants?.[activeIndex]?.applicant_details?.id}`,
              { headers: { Authorization: token } },
            );

            const newBanking = res?.data?.filter((bank) => !bank?.extra_params?.is_deleted);

            let targetApplicant = structuredClone(values?.applicants?.[activeIndex]);

            if(data?.personal_data){
              targetApplicant.personal_details = data?.personal_data
            }
            targetApplicant.banking_details = newBanking;
            // setFieldValue(`applicants[${activeIndex}].banking_details`, newBanking);
                // added logic for application form clearence if exists

            const completed_form = checkIfApplicationDone(values?.applicants?.[activeIndex]?.applicant_details);

            if(completed_form == true){

              await editFieldsById(values?.applicants?.[activeIndex]?.applicant_details?.id,'applicant',{
                application_form_otp_verified:null,
                application_form_otp:null,
                form_html:null
              },
            {
              headers:{
                Authorization:token
              }
            })

            targetApplicant.applicant_details.application_form_otp_verified = null;
            targetApplicant.applicant_details.application_form_otp = null;
            targetApplicant.applicant_details.form_html = null;
}

            
            setFieldValue(`applicants[${activeIndex}]`, targetApplicant);
            setShowAccountNumberInput(true)
            // navigate('/lead/banking-details');
            // setIsManualDisabled(false);
            // setTriggerNavigate(true)

          } catch (err) {
            navigate('/lead/banking-details');
            setShowAccountNumberInput(false)
            console.log(err);
          }
        } 

        else if(data.account_aggregator_response.status === 'FAILED'){
          setErrorToastMessage('Account Aggregator Failed');
          setFailCount((prev)=>prev+1);
          setFieldValue(`applicants[${activeIndex}].personal_details.fail_count`,values?.applicants?.[activeIndex]?.personal_details?.fail_count + 1 || 1);
          setChecking(false);

        }
        
        else {
          setErrorToastMessage('Status is not completed yet. Please try again later.');
          setChecking(false);

        }
      } else {
        setErrorToastMessage(`Unexpected response status: ${status}`);
        setFailCount((prev)=>prev+1)
      }
    } catch (err) {
      setChecking(false);
      setErrorToastMessage(err?.response?.data?.message || 'Error Checking Status, Please Retry');
      const status = err?.response?.status;
      const newAttempts = statusCheckState.attempts + 1;

      setStatusCheckState({
        attempts: newAttempts,
        lastAttemptTime: now,
      });

      if (status === 400 || status === 401 || status === 404 || status === 500) {
        // setIsManualDisabled(false);
      } else {
        if (newAttempts > 3) {
          // setIsManualDisabled(false);
        } else {
          setErrorToastMessage(`Unexpected error. ${3 - newAttempts} attempts left.`);
        }
      }

      console.error('POST tracking-status error:', err);

      setFailCount((prev)=>prev+1)


      // update independant fail count in case of error

      try{
        const updateFailCount = await editFieldsById(values?.applicants?.[activeIndex]?.personal_details?.id,'personal',{
          AA_fail_count:values?.applicants?.[activeIndex]?.personal_details?.AA_fail_count + 1 || 1,
        },
        {
          headers: {
            Authorization: token,
          },
        },);

        setFieldValue(`applicants[${activeIndex}].personal_details.AA_fail_count`,values?.applicants?.[activeIndex]?.personal_details?.AA_fail_count + 1 || 1);
      }

      catch(error){

        console.log("****** ERROR UPDTAING FAIL COUNT **********",error)
      }
    }
  };

  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    setShowBankList(false); // Close the bank list popup after selecting a bank
  };

  const handleOpenBankList = () => {
    setShowBankList(true);
  };

  const handleBankListPopupClose = () => {
    setShowBankList(false);
  };
  const verify = async () => {
    try {
      const currentAccount = aggregratorData?.account_aggregator_response?.accounts?.[currentAccountIndex];

      const response = await axios.post(
        `${API_URL}/applicant/account-aggregator/verify_and_pennydrop/${values?.applicants?.[activeIndex]?.applicant_details?.id}`,
        {
          account_number: accountData?.account_number,
          aggregator_account_number: currentAccount?.maskedAccountNumber || '',
          account_holder_name: currentAccount?.accountHolderName || '',
          ifsc_code: accountData?.ifsc_code || currentAccount?.ifsc_code || '',
        },
        { headers: { Authorization: token } },
      );

      if (response?.status === 200) {
        setBankSuccessTost('Bank added successfully');
        setAccountData('account_number', '');
        setAccountData('ifsc_code', '');
        const nextIndex = currentAccountIndex + 1;
        const total = aggregratorData?.account_aggregator_response?.accounts?.length || 0;

        if (nextIndex < total) {
          setCurrentAccountIndex(nextIndex);
          return;
        }
        try {
          const res = await axios.get(
            `${API_URL}/banking/by-applicant/${values?.applicants?.[activeIndex]?.applicant_details?.id}`,
            { headers: { Authorization: token } },
          );

          const newBanking = res?.data?.filter((bank) => !bank?.extra_params?.is_deleted);

          let targetApplicant = structuredClone(values?.applicants?.[activeIndex]);

          targetApplicant.banking_details = newBanking;

          const completed_form = checkIfApplicationDone(values?.applicants?.[activeIndex]?.applicant_details);

          if (completed_form == true) {
            await editFieldsById(
              values?.applicants?.[activeIndex]?.applicant_details?.id,
              'applicant',
              {
                application_form_otp_verified: null,
                application_form_otp: null,
                form_html: null,
              },
              {
                headers: {
                  Authorization: token,
                },
              },
            );

            targetApplicant.applicant_details.application_form_otp_verified = null;
            targetApplicant.applicant_details.application_form_otp = null;
            targetApplicant.applicant_details.form_html = null;
          }

          setFieldValue(`applicants[${activeIndex}]`, targetApplicant);
          setShowAccountNumberInput(false);
          setBankSuccessTost('Bank(s) added successfully');
          setTimeout(() => {
            navigate('/lead/banking-details');
          }, 100);
        } catch (err) {
          console.log('Error fetching banking after verify:', err);
          navigate('/lead/banking-details');
        }
      } else {
        setErrorToastMessage('Failed to verify account. Please try again.');
      }
    } catch (error) {
      console.log('VERIFY ERROR', error);
      setErrorToastMessage(error?.response?.data?.message || 'Verify failed. Please try again');
    }
  };

   const handleSearch = () => {
      setOpen(true);
    };
  
    const getIfsc = async () => {
      console.log("SEARCHED BRANCH",searchedBranch?.value)
      await axios
        .post(
          `${API_URL}/ifsc/r/get-bank-ifsc`,
          {
            // bank: searchedBank,
            ifsc: searchedBranch?.value,
          },
          {
            headers: {
              Authorization: token,
            },
          },
        )
        .then(({ data }) => {
          setSearchedIfsc(data[0].ifsc_code);
        })
        .catch((err) => {
          console.log(err);
        });
    };
  
    const getBankFromIfsc = async () => {
      await axios
        .post(
          `${API_URL}/ifsc/r/get-bank-ifsc`,
          {
            ifsc: values?.ifsc_code,
          },
          {
            headers: {
              Authorization: token,
            },
          },
        )
        .then(({ data }) => {
          setFieldValue('bank_name', data[0]?.name);
          setFieldValue('branch_name', data[0]?.branch);
        })
        .catch((err) => {
          setFieldValue('bank_name', '');
          setFieldValue('branch_name', '');
          setFieldError('ifsc_code', 'Invalid IFSC code');
        });
    };
    const getBranchesFromBankName = async (e) => {
        if (e) {
          await axios
            .post(
              `${API_URL}/ifsc/r/get-bank-ifsc`,
              {
                bank: searchedBank,
                branch: e ? e : '',
              },
              {
                headers: {
                  Authorization: token,
                },
              },
            )
            .then(({ data }) => {
              const newData = data.map(({ branch, ifsc_code }) => ({
                label: branch.toString().toUpperCase(),
                value: ifsc_code,
              }));
    
              const calculateMatchScore = (item) => {
                const label = item.label;
                let matchScore = 0;
    
                if (e) {
                  for (const char of e) {
                    const index = label.indexOf(char);
                    if (index !== -1) {
                      matchScore += 1 / (index + 1);
                    }
                  }
                }
    
                return matchScore;
              };
    
              newData.sort((a, b) => calculateMatchScore(b) - calculateMatchScore(a));
    
              // newData.sort((a, b) => a.label.localeCompare(b.label));
    
              const slicedData = newData.slice(0, 30);
    
              setBranchData(slicedData);
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          setBranchData([]);
        }
      };

      const getAllBanks = async () => {
          await axios
            .get(`${API_URL}/ifsc/r/get-all-bank`, {
              headers: {
                Authorization: token,
              },
            })
            .then(({ data }) => {
              let newData = data.map((item) => {
                return { label: item.name, value: item.name };
              });
              newData.sort((a, b) => a.label.localeCompare(b.label));
              setBankNameData(newData);
            })
            .catch((err) => {
              console.log(err);
            });
        };

   const handleIfscChange = (e) => {
    const value = e.currentTarget.value;
    const pattern = /^[A-Za-z0-9]+$/;
    if (pattern.test(value)) {
      setAccountData(e.currentTarget.name, value.toUpperCase());
    } else if (value.length < values?.[e.currentTarget.name]?.length) {
      setAccountData(e.currentTarget.name, value.toUpperCase());
    }
  };
useEffect(() => {
  if (state?.data?.account) {
    setCurrentAccountIndex(0)
    setAggregratorData({
      account_aggregator_response: {
        accounts: Array.isArray(state.data.account)
          ? state.data.account
          : [state.data.account],
      },
    });
    
  }
}, [state?.data]);

useEffect(() => {
  const ifscCode =
    aggregratorData?.banking_details?.ifsc_code ||
    aggregratorData?.account_aggregator_response?.accounts?.[currentAccountIndex]?.data?.Summary
      ?.ifscCode;

  if (ifscCode) {
    setAccountData('ifsc_code', ifscCode);
  }
}, [aggregratorData, currentAccountIndex]);


  return (
    <>
      <div className='flex flex-col h-[100dvh]'>

      <ErrorTost message={errorToastMessage} setMessage={setErrorToastMessage} />
        <div className='h-[48px] border-b-2 flex items-center p-[12px]'>
          <button onClick={() => setConfirmation(true)}>
            <IconBackBanking />
          </button>
          <span className='text-[#373435] text-[16px] font-medium pl-[10px]'>
            Add a bank account
          </span>   

        </div>

        <ToastMessage message={toastMessage} setMessage={setToastMessage} />

        {state?.data ?
         <div className=' p-[20px]'>
           <div
              className='text-sm text-gray-600 my-4 block cursor-pointer'
            >
              
           <p>Kindly enter your full account number to verify the account and for
            penny drop! </p>
            <p>
              Account Number : {aggregratorData?.account_aggregator_response?.accounts?.[currentAccountIndex]?.maskedAccountNumber || ''}
            </p>
            {aggregratorData?.account_aggregator_response?.accounts?.length > 1 ? (
              <p className='text-sm text-gray-500'>
                {`Account ${currentAccountIndex + 1} of ${aggregratorData?.account_aggregator_response?.accounts?.length}`}
              </p>
            ) : null}
            </div>
             <div className='space-y-3'>
            <TextInput
                      label='Account number'
                      placeholder='Eg: 177801501234'
                      required
                      name='account_number'
                      type='tel'
                      inputClasses='hidearrow'
                      value={accountData?.account_number}
                      onChange={handleAccountNumberChange}
                      error={errors?.account_number}
                      touched={touched && touched?.account_number}
                      onBlur={handleBlur}
                      pattern='\d*'
                      onFocus={(e) =>
                        e.target.addEventListener(
                          'wheel',
                          function (e) {
                            e.preventDefault();
                          },
                          { passive: false },
                        )
                      }
                      min='0'
                    />
                    <ClickableEndIcon
                                label='IFSC Code'
                                placeholder='Eg: ICICI0001234'
                                required
                                name='ifsc_code'
                                value={accountData?.ifsc_code}
                                onChange={handleIfscChange}
                                error={errors?.ifsc_code}
                                disabled={aggregratorData?.banking_details?.ifsc_code || aggregratorData?.account_aggregator_response?.accounts?.[currentAccountIndex]?.data?.Summary?.ifscCode}
                                touched={touched && touched?.ifsc_code}
                                onBlur={(e) => {
                                  handleBlur(e);
                                  !errors?.ifsc_code && accountData?.ifsc_code && getBankFromIfsc();
                                }}
                                EndIcon={blackSearchIcon}
                                onEndButtonClick={handleSearch}
                                message={
                                  accountData?.bank_name || accountData?.branch_name
                                    ? `${accountData?.bank_name},  ${accountData?.branch_name}`
                                    : null
                                }
                              />
                    
          </div>
                     <Button
                  primary={true}
                  inputClasses='w-fit px-6 h-[46px] ml-auto'
                  type='submit'
                  // disabled={!enableAA}
                  onClick={handleSubmit}
                >
                 Save
                </Button>
          </div> : <div className='flex flex-col p-[20px] flex-1'>
          <TextInput
            message={aaInitiated ? 'In Process' : null}
            name='aa_mobile_no'
            label='Mobile number'
            placeholder='Eg: 1234567890'
            required
            type='tel'
            value={mobileNo}
            error={mobileNoError}
            touched={true}
            pattern='\d*'
            onFocus={(e) =>
              e.target.addEventListener(
                'wheel',
                function (e) {
                  e.preventDefault();
                },
                { passive: false },
              )
            }
            min='0'
            onInput={(e) => {
              if (!e.currentTarget.validity.valid) e.currentTarget.value = '';
            }}
            onChange={(e) => {
              const phoneNumber = e.currentTarget.value;

              if (phoneNumber < 0) {
                e.preventDefault();
                return;
              }
              if (phoneNumber.length > 10) {
                return;
              }
              if (DISALLOW_NUM.includes(phoneNumber)) {
                e.preventDefault();
                return;
              }

              if (phoneNumber.length < 10) {
                setEnableAA(false);
              }

              if (phoneNumber.length === 10) {
                setEnableAA(true);
              }

              // if (authValues?.username?.toString() === phoneNumber.toString()) {
              //   setMobileNo(phoneNumber);
              //   setMobileNoError('Mobile number cannot be same as Loan Officer Mobile number');
              //   return;
              // }

              setMobileNoError('');
              setMobileNo(phoneNumber);
            }}
            disabled={aaInitiated}
            inputClasses='hidearrow'
          />         
         {/* List of Banks Container */}
         <div className='ml-auto flex items-center'>
            <label
              className='text-sm text-gray-600 cursor-pointer'
              onClick={handleOpenBankList}
            >
              List Of Banks
            </label>
          </div>
          {showBankList && (
            <BankListPopUp
            showpopup={showBankList}
            onClose={handleBankListPopupClose}
            title='List Of Banks'
            bankNameOptions={bankNameOptions}
            handleBankSelect={handleBankSelect}
            />
            
          )}
          {aaInitiated&&!aggregratorData ? (
            <>
              <div className='pb-4 pt-2'>
                <ResendButtonWithTimer
                  startTimer={aaInitiated}
                  resendCount={resendCount}
                  setResendCount={setResendCount}
                  defaultResendTime={30}  // 30
                  handleResend={handleResend}
                  setAARunning={setAARunning}
                />
              </div>
              <div className='flex flex-col gap-[16px]'>
                <Button
                  primary={true}
                  inputClasses='w-full h-[46px] flex gap-2 items-center'
                  // disabled={!enableAA}
                  onClick={checkStatus}
                >
                  {checking ? (
                    <>
                      <img
                        src={loading}
                        alt='loading'
                        className='animate-spin duration-300 ease-out'
                      />
                      <span>Checking status</span>
                    </>
                  ) : (
                    <span>Check status</span>
                  )}
                </Button>
                <Button
                  primary={false}
                  inputClasses='w-full h-[46px]'
                  disabled={aaRunning || checking || sendCount < 3}
                  onClick={() => (aaRunning || checking || sendCount < 3? null : setConfirmation(true))}
                >
                  Skip
                </Button>
                <div className='flex items-start gap-2'>
                  <img src={exclamation_icon} alt='' />

                  <span className='font-normal text-[#727376] text-[12px]'>
                    You can Skip or Resend the link only when the timer gets over
                  </span>
                </div>
              </div>
            </>
          ) : (
            aggregratorData ? <div>
            <div
              className='text-sm text-gray-600 my-4 block cursor-pointer'
            >
              
           <p>Kindly enter your full account number to verify the account and for
            penny drop! </p>
            <p>
              Account Number : {aggregratorData?.account_aggregator_response?.accounts?.[currentAccountIndex]?.maskedAccountNumber || ''}
            </p>
            {aggregratorData?.account_aggregator_response?.accounts?.length > 1 ? (
              <p className='text-sm text-gray-500'>
                {`Account ${currentAccountIndex + 1} of ${aggregratorData?.account_aggregator_response?.accounts?.length}`}
              </p>
            ) : null}
            </div>
          <div className='space-y-3'>
            <TextInput
                      label='Account number'
                      placeholder='Eg: 177801501234'
                      required
                      name='account_number'
                      type='tel'
                      inputClasses='hidearrow'
                      value={accountData?.account_number}
                      onChange={handleAccountNumberChange}
                      error={errors?.account_number}
                      touched={touched && touched?.account_number}
                      onBlur={handleBlur}
                      pattern='\d*'
                      onFocus={(e) =>
                        e.target.addEventListener(
                          'wheel',
                          function (e) {
                            e.preventDefault();
                          },
                          { passive: false },
                        )
                      }
                      min='0'
                    />
                    <ClickableEndIcon
                                label='IFSC Code'
                                placeholder='Eg: ICICI0001234'
                                required
                                name='ifsc_code'
                                value={accountData?.ifsc_code}
                                onChange={handleIfscChange}
                                error={errors?.ifsc_code}
                                disabled={aggregratorData?.banking_details?.ifsc_code}
                                touched={touched && touched?.ifsc_code}
                                onBlur={(e) => {
                                  handleBlur(e);
                                  !errors?.ifsc_code && accountData?.ifsc_code && getBankFromIfsc();
                                }}
                                EndIcon={blackSearchIcon}
                                onEndButtonClick={handleSearch}
                                message={
                                  accountData?.bank_name || accountData?.branch_name
                                    ? `${accountData?.bank_name},  ${accountData?.branch_name}`
                                    : null
                                }
                              />
                    
          </div>
                     <Button
                  primary={true}
                  inputClasses='w-fit px-6 h-[46px] ml-auto'
                  type='submit'
                  // disabled={!enableAA}
                  onClick={handleSubmit}
                >
                 Save
                </Button>
        </div> : <Button
              primary={true}
              inputClasses='w-full h-[46px] mt-[10px]'
              disabled={!enableAA || mobileNoError}
              onClick={handleInitiateAA}
            >
              {loadingState ? (
                <img src={loading} alt='loading' className='animate-spin duration-300 ease-out' />
              ) : (
                'Initiate AA'
              )}
            </Button>
          ) }
        </div>}
        <div className='flex justify-center gap-1 pb-5'>
          {aaInitiated ? (
            <>
              <span className='font-normal text-[14px] text-[#727376]'>Didn’t receive link?</span>
              <button
                className='text-[#E33439] text-[14px] font-medium underline'
                onClick={() => {
                  setAAInitiated(false);
                  setResendCount(0)
                  setAARunning(false);
                }}
              >
                Change mobile number
              </button>
            </>
          ) : null}
        </div>
      </div>

      <DynamicDrawer open={confirmation} setOpen={setConfirmation} height='180px'>
        <div className='flex gap-1'>
          <div className=''>
            <h4 className='text-center text-base not-italic font-semibold text-primary-black mb-2'>
              Are you sure you want to leave?
            </h4>
            <p className='text-center text-xs not-italic font-normal text-primary-black'>
              The data will be lost forever.
            </p>
          </div>
          <div className=''>
            <button onClick={() => setConfirmation(false)}>
              <IconClose />
            </button>
          </div>
        </div>

        <div className='w-full flex gap-4 mt-6'>
          <button className=' cursor-pointer  w-full p-2 md:py-3 text-base md:text-lg rounded md:w-64 flex justify-center items-center bg-neutral-white border border-primary-red text-primary-red disabled:text-dark-grey h-[46px]' type="button" onClick={() =>setConfirmation(false)}>
            Stay
          </button>
          <Button
            primary={true}
            inputClasses=' w-full h-[46px]'
            // onClick={() => {
            //   setAAInitiated(false);
            //   setAARunning(false);
            //   setConfirmation(false);
            // }}
            onClick = {handleFailCount}
            // link='/lead/banking-details'
          >
            Leave
          </Button>
        </div>
      </DynamicDrawer>

      <DynamicDrawer open={open} setOpen={setOpen} height='70vh'>
              <div className='flex gap-1 items-center justify-between w-[100vw] border-b-2 pl-[20px] pr-[20px] pb-[5px]'>
                <h4 className='text-center text-[20px] not-italic font-semibold text-primary-black mb-2'>
                  Search IFSC code
                </h4>
      
                <div className=''>
                  <button
                    onClick={() => {
                      setSearchedBank('');
                      setSearchedBranch({});
                      setSearchedIfsc('');
                      setOpen(false);
                    }}
                  >
                    <IconClose />
                  </button>
                </div>
              </div>
      
              <div className='flex flex-col flex-1 p-[20px] w-[100vw] gap-2'>
                <SearchableTextInput
                  label='Bank Name'
                  placeholder='Eg: ICICI Bank'
                  required
                  name='bank_name'
                  value={searchedBank ? searchedBank : ''}
                  error={errors?.bank_name}
                  touched={touched?.bank_name}
                  onBlur={(e) => {
                    handleBlur(e);
                    setBranchData([]);
                    getBranchesFromBankName();
                  }}
                  onChange={(name, value) => {
                    setSearchedIfsc('');
                    setSearchedBranch({});
                    setSearchedBank(value.value);
                  }}
                  type='search'
                  options={bankNameData}
                />
      
                <SearchableTextInput
                  label='Branch'
                  placeholder='Eg: College Road, Nashik'
                  required
                  name='branch_name'
                  value={searchedBranch?.label ? searchedBranch?.label : ''}
                  error={errors?.branch_name}
                  touched={touched?.branch_name}
                  onBlur={(e) => {
                    handleBlur(e);
                  }}
                  onChange={(name, value) => {
                    setSearchedIfsc('');
                    setSearchedBranch(value);
                    // getBranchesFromBankName(value.value);
                  }}
                  onTextChange={(e) => {
                    getBranchesFromBankName(e);
                  }}
                  type='search'
                  options={branchData}
                />
                {searchedIfsc ? (
                  <div className='flex gap-1'>
                    <span className='text-[#727376] text-[16px] font-normal'>IFSC code:</span>
                    <span className='text-[#373435] text-[16px] font-medium'>{searchedIfsc}</span>
                  </div>
                ) : null}
              </div>
      
              <div className='w-full flex gap-4 mt-6'>
                {searchedIfsc ? (
                  <Button
                    primary={true}
                    inputClasses='w-full h-[46px]'
                    onClick={() => {
                      setFieldValue('ifsc_code', searchedIfsc);
                      setFieldValue('bank_name', searchedBank);
                      setFieldValue('branch_name', searchedBranch?.label);
                      setOpen(false);
                    }}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    primary={true}
                    disabled={!searchedBank || !searchedBranch}
                    inputClasses='w-full h-[46px]'
                    onClick={getIfsc}
                  >
                    Search IFSC code
                  </Button>
                )}
              </div>
            </DynamicDrawer>
    </>
  );
}