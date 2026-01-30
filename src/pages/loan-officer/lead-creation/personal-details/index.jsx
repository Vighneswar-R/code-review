import { personalDetailsModeOption } from '../utils';
import CardRadio from '../../../../components/CardRadio';
import { memo, useCallback, useContext, useEffect, useState } from 'react';
import { LeadContext } from '../../../../context/LeadContextProvider';
import ManualMode from './ManualMode';
import PreviousNextButtons from '../../../../components/PreviousNextButtons';
import { addApi, editFieldsById,editNextUpdate } from '../../../../global';
import DynamicDrawer from '../../../../components/SwipeableDrawer/DynamicDrawer';
import { Button, ToastMessage } from '../../../../components';
import { newCoApplicantValues } from '../../../../context/NewCoApplicant';
import Topbar from '../../../../components/Topbar';
import SwipeableDrawerComponent from '../../../../components/SwipeableDrawer/LeadDrawer';
import { AuthContext } from '../../../../context/AuthContextProvider';
import ErrorTost from '../../../../components/ToastMessage/ErrorTost';
import LoaderDynamicText from '../../../../components/Loader/LoaderDynamicText';

const PersonalDetails = () => {
  const {
    values,
    updateProgressApplicantSteps,
    errors,
    touched,
    setFieldValue,
    activeIndex,
    setCurrentStepIndex,
    toastMessage,
    setToastMessage,
    updateParams,
    updateCompleteFormProgress
  } = useContext(LeadContext);

  const {
    token,
    errorToastMessage,
    setErrorToastMessage,
    errorToastSubMessage,
    setErrorToastSubMessage,
  } = useContext(AuthContext);

  const [requiredFieldsStatus, setRequiredFieldsStatus] = useState({
    ...values?.applicants?.[activeIndex]?.personal_details?.extra_params?.required_fields_status,
  });


    useEffect(()=>{
        console.log("EXISTING APPLICANTS",values?.applicants)
    
    },[])

  const [openExistingPopup, setOpenExistingPopup] = useState(
    values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.is_existing &&
      !values?.applicants?.[activeIndex]?.personal_details?.extra_params?.is_existing_done
      ? true
      : false,
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRequiredFieldsStatus({...values?.applicants?.[activeIndex]?.personal_details?.extra_params?.required_fields_status,city_of_birth:values?.applicants?.[activeIndex]?.personal_details?.city_of_birth?true:false});
  }, [activeIndex]);

  const updateFields = async (name, value) => {
    let newData = {
      first_name: values?.applicants[activeIndex]?.applicant_details?.first_name,
      middle_name: values?.applicants[activeIndex]?.applicant_details?.middle_name,
      last_name: values?.applicants[activeIndex]?.applicant_details?.last_name,
      gender:values?.applicants[activeIndex]?.personal_details?.gender,
      date_of_birth: values?.applicants[activeIndex]?.applicant_details?.date_of_birth,
      mobile_number: values?.applicants[activeIndex]?.applicant_details?.mobile_number,
    };
    newData[name] = value;

    if (!name) {
      const res = await editFieldsById(
        values?.applicants[activeIndex]?.personal_details?.id,
        'personal',
        values?.applicants[activeIndex]?.personal_details,
        {
          headers: {
            Authorization: token,
          },
        },
      );
    } else {
      if (values?.applicants[activeIndex]?.personal_details?.id) {
        const res = await editFieldsById(
          values?.applicants[activeIndex]?.personal_details?.id,
          'personal',
          newData,
          {
            headers: {
              Authorization: token,
            },
          },
        );
      } else {

        let clonedCoApplicantValues = structuredClone(newCoApplicantValues);

        const ifPrimary = values?.applicants?.[activeIndex]?.applicant_details?.is_primary;

        let addData = {
          ...clonedCoApplicantValues.personal_details,
          [name]: value,
          first_name: values?.applicants[activeIndex]?.applicant_details?.first_name,
          middle_name: values?.applicants[activeIndex]?.applicant_details?.middle_name,
          last_name: values?.applicants[activeIndex]?.applicant_details?.last_name,
          gender:values?.applicants[activeIndex]?.personal_details?.gender,
          date_of_birth: values?.applicants[activeIndex]?.applicant_details?.date_of_birth,
          mobile_number: values?.applicants[activeIndex]?.applicant_details?.mobile_number,
        };
        
        if(ifPrimary){
          addData.extra_params.required_fields_status.caste = false;
          addData.relation_with_main_applicant = "Self"
        }
        await addApi(
          'personal',
          {
            ...addData,
            applicant_id: values?.applicants?.[activeIndex]?.applicant_details?.id,
          },
          {
            headers: {
              Authorization: token,
            },
          },
        )
          .then(async (res) => {
            await editFieldsById(
              values?.applicants[activeIndex]?.applicant_details?.id,
              'applicant',
              { personal_detail: res.id },
              {
                headers: {
                  Authorization: token,
                },
              },
            );

            setFieldValue(`applicants[${activeIndex}].personal_details`, {
              ...addData,
              applicant_id: values?.applicants?.[activeIndex]?.applicant_details?.id,
              id: res.id,
            });
            setRequiredFieldsStatus(() => ({
              ...addData.extra_params.required_fields_status,
              [name]: true,
            }));
          })    // working here
          .catch((err) => {
            console.log(err);
          });
      }
    }
  };

  useEffect(()=> {

    console.log("BEFORE WORK INCOME SCREEN PERSONAL",values?.applicants)

  },[values?.applicants])

  const handleRadioChange = useCallback(
    (e) => {
      setFieldValue(e.name, e.value);
      const name = e.name.split('.')[2];
      updateFields(name, e.value);
      if (!requiredFieldsStatus[name]) {
        setRequiredFieldsStatus((prev) => ({ ...prev, [name]: true }));
      }
    },
    [requiredFieldsStatus, values],
  );

  useEffect(() => {
    updateProgressApplicantSteps('personal_details', requiredFieldsStatus, 'personal');
  }, [requiredFieldsStatus]);


  
  // const updateParams = async () => {  // update params real time on next click


  //   let params = values.applicants?.[activeIndex]?.personal_details.extra_params

  //   await editFieldsById(
  //     values?.applicants[activeIndex]?.personal_details?.id,
  //     'personal',
  //     {
  //       extra_params:params
  //     },
  //     {
  //       headers: {
  //         Authorization: token,
  //       },
  //     },
  //   ); 

  //   console.log(values.applicants[activeIndex].personal_details.extra_params)

  // }
 

 

  // const handleNextClick = () => {

  //   updateParams(values?.applicants[activeIndex]?.personal_details?.id,'personal',values.applicants[activeIndex].personal_details.extra_params)// updating personal details extra params

  //   setCurrentStepIndex(2);
  //   // updateFields();
  // };
  const handleNextClickOld = async() => {

    // updateParams(values?.applicants[activeIndex]?.personal_details?.id,'personal',values.applicants[activeIndex].personal_details.extra_params)// updating personal details extra params
    const res = await editNextUpdate(
     values?.applicants[activeIndex]?.personal_details?.id,
     'personal',
     {
       
     },
     {
       headers: {
         Authorization: token,
       },
     },
   );

   setFieldValue(`applicants[${activeIndex}].personal_details`, res);
   updateCompleteFormProgress();
     setCurrentStepIndex(2);
     // updateFields();
   };

  // ID type vanished issue

    // ID patterns for document validation
  const ID_PATTERNS = [
    { type: 'PAN', regex: /^[A-Z]{5}[0-9]{4}[A-Z]$/ },
    { type: 'Voter ID', regex: /^[A-Z]{3}[0-9]{7}$/ },
    { type: 'AADHAR', regex: /^\*{8}\d{4}$/ },
    { type: 'Driving license', regex: /^[A-Za-z]{2}\d{13}$/ },
    { type: 'Passport', regex: /^[A-PR-WY-Za-pr-wy-z][0-9]{7}$/ },
  ];

  // Utility functions
  const normalizeInput = (value) => value ? String(value).trim().toUpperCase() : '';

  const detectIdType = (value) => {
    if (!value) return null;
    return ID_PATTERNS.find(p => p.regex.test(value))?.type || null;
  };

  const maskAadharNumber = (aadharNumber) => {
    if (!aadharNumber) return null;
    try {
      return aadharNumber.replace(/.(?=.{4})/g, '*');
    } catch (err) {
      console.error('Error masking Aadhar number:', err);
      return null;
        }
  };

  const updateField = async (id, field, value) => {

    if (!id) return;
            await editFieldsById(
      id,
              'personal',
      { [field]: value },
              { headers: { Authorization: token } },
            );
    setFieldValue(`applicants[${activeIndex}].personal_details.${field}`, value);
  };

  const handleNextClick = async () => {
    try {

      const personal = values?.applicants?.[activeIndex]?.personal_details || {};
      const applicantDetails = values?.applicants?.[activeIndex]?.applicant_details || {};
      const personalId = personal.id;

      // Auto-detect ID types
      const idNumber = normalizeInput(personal.id_number);
      const addressNumber = normalizeInput(personal.address_proof_number);
      const detectedIdType = detectIdType(idNumber);
      const detectedAddressProofType = detectIdType(addressNumber);

      // Handle regular ID type detection
      if (detectedIdType) {
        await updateField(personalId, 'id_type', detectedIdType);
      }

      // Handle address proof detection
      if (detectedAddressProofType) {
        await updateField(personalId, 'selected_address_proof', detectedAddressProofType);
      }

      // Handle eKYC data
      const ekycData = applicantDetails.ekyc_data;
      const isKycVerified = applicantDetails.is_ekyc_verified;
      const ekycFieldName = applicantDetails.ekyc_field_name;
      const isEkycValid = (ekycData?.err === false || isKycVerified === true);

      if (isEkycValid) {
        const maskedAadhar = maskAadharNumber(ekycData?.poi?.aadhaarNumber);
        
        if (maskedAadhar) {
          // Update address proof number
          if (ekycFieldName === 'selected_address_proof' ) {
            await updateField(personalId, 'address_proof_number', maskedAadhar);
          }
          
          // Update ID number
          if (ekycFieldName === 'id_type') {
            await updateField(personalId, 'id_number', maskedAadhar);
          }
        }
      }

      // Persist final changes
      if (personalId) {
        const res = await editNextUpdate(
          personalId,
          'personal',
          {},
          { headers: { Authorization: token } }
        );

        setFieldValue(`applicants[${activeIndex}].personal_details`, res);
      }

        updateCompleteFormProgress();
        setCurrentStepIndex(2);
      } catch (err) {
        console.error('Error in handleNextClick:', err);
      setErrorToastMessage?.('Error updating personal details');
      setErrorToastSubMessage?.('Please try again or contact support');
      }
    };

  const handleAutofill = async () => {
    const fillData = { ...values.applicants?.[activeIndex]?.applicant_details };

    const {
      existing_customer_id_type,
      existing_customer_id_number,

      existing_customer_selected_address_proof,
      existing_customer_address_proof_number,

      existing_customer_first_name,
      existing_customer_middle_name,
      existing_customer_last_name,

      existing_customer_gender,
      existing_customer_father_husband_name,
      existing_customer_mother_name,
    } = fillData;

    const mappedData = {
      id_type: existing_customer_id_type,
      id_number: existing_customer_id_number,
      selected_address_proof: existing_customer_selected_address_proof,
      address_proof_number: existing_customer_address_proof_number,
      first_name: existing_customer_first_name,
      middle_name: existing_customer_middle_name,
      last_name: existing_customer_last_name,
      gender: existing_customer_gender,
      father_name: existing_customer_father_husband_name,
      mother_name: existing_customer_mother_name,
    };

    let finalData = structuredClone(values);

    finalData.applicants[activeIndex].personal_details = {
      ...finalData.applicants[activeIndex].personal_details,
      ...mappedData,
    };

    const filteredMappedData = Object.entries(mappedData)
      .filter(([key, value]) => value !== null && value !== undefined && value !== '')
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    const updatedRequiredFieldsStatus = Object.fromEntries(
      Object.entries(requiredFieldsStatus).map(([key, value]) => [
        key,
        key in filteredMappedData ? true : value,
      ]),
    );

    setFieldValue(`applicants[${activeIndex}].personal_details`, {
      ...finalData.applicants[activeIndex].personal_details,
      extra_params: {
        ...finalData.applicants[activeIndex].personal_details.extra_params,
        is_existing_done: true,
      },
    });

    if (values?.applicants[activeIndex]?.personal_details?.id) {
      const res = await editFieldsById(
        values?.applicants[activeIndex]?.personal_details?.id,
        'personal',
        {
          ...finalData.applicants[activeIndex].personal_details,
          extra_params: {
            ...finalData.applicants[activeIndex].personal_details.extra_params,
            is_existing_done: true,
          },
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
    }

    setRequiredFieldsStatus(updatedRequiredFieldsStatus);

    setOpenExistingPopup(false);
  };

  useEffect(() => {
    if (
      values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.is_existing &&
      !values?.applicants?.[activeIndex]?.personal_details?.extra_params?.is_existing_done
    ) {
      setOpenExistingPopup(true);
    } else {
      setOpenExistingPopup(false);
    }
  }, [
    values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.is_existing,
    values?.applicants?.[activeIndex]?.personal_details?.extra_params?.is_existing_done,
  ]);

  return (
    <>
      <ToastMessage message={toastMessage} setMessage={setToastMessage} />
      <ErrorTost
        message={errorToastMessage}
        setMessage={setErrorToastMessage}
        subMessage={errorToastSubMessage}
        setSubMessage={setErrorToastSubMessage}
      />

      <div className='overflow-hidden flex flex-col h-[100vh] justify-between'>
        {values?.applicants[activeIndex]?.applicant_details?.is_primary ? (
          <Topbar title='Lead Creation' id={values?.lead?.id} showClose={true} />
        ) : (
          <Topbar
            title='Adding Co-applicant'
            id={values?.lead?.id}
            showClose={true}
            showBack={true}
            coApplicant={true}
            coApplicantName={values?.applicants[activeIndex]?.applicant_details?.first_name}
          />
        )}
        <div className='overflow-x-hidden flex flex-col bg-medium-grey gap-2 overflow-auto max-[480px]:no-scrollbar p-[20px] pb-[150px] flex-1'>
          <ManualMode
            requiredFieldsStatus={requiredFieldsStatus}
            setRequiredFieldsStatus={setRequiredFieldsStatus}
            updateFields={updateFields}
            setLoading={setLoading}
          />
        </div>
        <PreviousNextButtons
          linkPrevious='/lead/applicant-details'
          linkNext='/lead/address-details'
          onNextClick={handleNextClick}
          onPreviousClick={() => setCurrentStepIndex(0)}
        />
       
        <SwipeableDrawerComponent />

        {loading ? (
          <div className='absolute w-full h-screen bg-[#00000080] z-[9999999] pointer-events-none select-none'>
            <LoaderDynamicText text='Validating' textColor='white' height='100vh' />
          </div>
        ) : null}
      </div>

      {openExistingPopup ? (
        <DynamicDrawer open={openExistingPopup} setOpen={setOpenExistingPopup} height='80vh'>
          <div className='flex flex-col items-center h-full'>
            <span className='w-full font-semibold text-[14px] leading-[21px]'>
              This is an existing customer.
            </span>
            <div className='flex flex-col flex-1 w-full gap-[7px] overflow-auto mt-[10px] mb-[10px]'>
              <div className='flex justify-between w-full'>
                <span className='w-full text-[12px] text-[#727376]'>ID Type**</span>
                <span className='w-full text-[12px]'>
                  {values?.applicants?.[activeIndex]?.applicant_details?.existing_customer_id_type}
                </span>
              </div>

              <div className='flex justify-between w-full'>
                <span className='w-full text-[12px] text-[#727376]'>ID Number**</span>
                <span className='w-full text-[12px]'>
                  {
                    values?.applicants?.[activeIndex]?.applicant_details
                      ?.existing_customer_id_number
                  }
                </span>
              </div>

              <div className='flex justify-between w-full'>
                <span className='w-full text-[12px] text-[#727376]'>Address proof**</span>
                <span className='w-full text-[12px]'>
                  {
                    values?.applicants?.[activeIndex]?.applicant_details
                      ?.existing_customer_selected_address_proof
                  }
                </span>
              </div>

              <div className='flex justify-between w-full'>
                <span className='w-full text-[12px] text-[#727376]'>Address proof number**</span>
                <span className='w-full text-[12px]'>
                  {
                    values?.applicants?.[activeIndex]?.applicant_details
                      ?.existing_customer_address_proof_number
                  }
                </span>
              </div>

              <div className='flex justify-between w-full'>
                <span className='w-full text-[12px] text-[#727376]'>First name**</span>
                <span className='w-full text-[12px]'>
                  {
                    values?.applicants?.[activeIndex]?.applicant_details
                      ?.existing_customer_first_name
                  }
                </span>
              </div>
              <div className='flex justify-between w-full'>
                <span className='w-full text-[12px] text-[#727376]'>Middle name</span>
                <span className='w-full text-[12px]'>
                  {
                    values?.applicants?.[activeIndex]?.applicant_details
                      ?.existing_customer_middle_name
                  }
                </span>
              </div>
              <div className='flex justify-between w-full'>
                <span className='w-full text-[12px] text-[#727376]'>Last name</span>
                <span className='w-full text-[12px]'>
                  {
                    values?.applicants?.[activeIndex]?.applicant_details
                      ?.existing_customer_last_name
                  }
                </span>
              </div>
              <div className='flex justify-between w-full'>
                <span className='w-full text-[12px] text-[#727376]'>Gender</span>
                <span className='w-full text-[12px]'>
                  {values?.applicants?.[activeIndex]?.applicant_details?.existing_customer_gender}
                </span>
              </div>
              <div className='flex justify-between w-full'>
                <span className='w-full text-[12px] text-[#727376]'>Date of birth</span>
                <span className='w-full text-[12px]'>
                  {values?.applicants?.[activeIndex]?.personal_details?.date_of_birth}
                </span>
              </div>
              <div className='flex justify-between w-full'>
                <span className='w-full text-[12px] text-[#727376]'>Mobile number</span>
                <span className='w-full text-[12px]'>
                  {values?.applicants?.[activeIndex]?.personal_details?.mobile_number}
                </span>
              </div>
              <div className='flex justify-between w-full'>
                <span className='w-full text-[12px] text-[#727376]'>Father/Husband's name</span>
                <span className='w-full text-[12px]'>
                  {
                    values?.applicants?.[activeIndex]?.applicant_details
                      ?.existing_customer_father_husband_name
                  }
                </span>
              </div>
              <div className='flex justify-between w-full'>
                <span className='w-full text-[12px] text-[#727376]'>Mother's name</span>
                <span className='w-full text-[12px]'>
                  {
                    values?.applicants?.[activeIndex]?.applicant_details
                      ?.existing_customer_mother_name
                  }
                </span>
              </div>
              <div className='flex justify-between w-full'>
                <span className='w-full text-[12px] text-[#727376]'>Marital status**</span>
                <span className='w-full text-[12px]'>
                  {values?.applicants?.[activeIndex]?.personal_details?.marital_status}
                </span>
              </div>
              <div className='flex justify-between w-full'>
                <span className='w-full text-[12px] text-[#727376]'>Religion**</span>
                <span className='w-full text-[12px]'>
                  {values?.applicants?.[activeIndex]?.personal_details?.religion}
                </span>
              </div>
              <div className='flex justify-between w-full'>
                <span className='w-full text-[12px] text-[#727376]'>Preferred Language**</span>
                <span className='w-full text-[12px]'>
                  {values?.applicants?.[activeIndex]?.personal_details?.preferred_language}
                </span>
              </div>
              <div className='flex justify-between w-full'>
                <span className='w-full text-[12px] text-[#727376]'>Qualification**</span>
                <span className='w-full text-[12px]'>
                  {values?.applicants?.[activeIndex]?.personal_details?.qualification}
                </span>
              </div>
              <div className='flex justify-between w-full'>
                <span className='w-full text-[12px] text-[#727376]'>Email**</span>
                <span className='w-full text-[12px]'>
                  {values?.applicants?.[activeIndex]?.personal_details?.email}
                </span>
              </div>
            </div>
            <span className='w-full text-[#96989A] font-normal text-[12px] text-left leading-[18px]'>
              ** Editable fields
            </span>
            <span className='w-full font-medium text-[14px] text-left mt-[6px] leading-[21px]'>
              Would the customer prefer to proceed with the same details?
            </span>
            <div className='w-full flex gap-4 mt-3'>
              <Button
                inputClasses='w-full h-[46px]'
                onClick={() => {
                  setOpenExistingPopup(false);
                  setFieldValue(
                    `applicants[${activeIndex}].personal_details.extra_params.is_existing_done`,
                    true,
                  );
                  updateFields();
                }}
              >
                No
              </Button>
              <Button primary={true} inputClasses=' w-full h-[46px]' onClick={handleAutofill}>
                Yes
              </Button>
            </div>
          </div>
        </DynamicDrawer>
      ) : null}
    </>
  );
};

export default PersonalDetails;
