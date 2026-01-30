import { professionOptions, noOfDependentsOptions, totalFamilyMembersOptions } from '../utils';
import CardRadio from '../../../../components/CardRadio';
import CardRadioWithoutIcon from '../../../../components/CardRadio/CardRadioWithoutIcon';
import { useCallback, useContext, useEffect, useState } from 'react';
import { LeadContext } from '../../../../context/LeadContextProvider';
import Salaried from './Salaried';
import SelfEmployed from './SelfEmployed';
import TextInput from '../../../../components/TextInput';
import DynamicDrawer from '../../../../components/SwipeableDrawer/DynamicDrawer';
import loading from '../../../../assets/icons/loader_white.png';
import { Button} from '../../../../components';
import { useNavigate } from 'react-router-dom';
import UnEmployed from './UnEmployed';
import Retired from './Retired';
import CurrencyInput from '../../../../components/CurrencyInput';
import { addApi, checkIsValidStatePincode, editFieldsById,getDashboardLeadById,editNextUpdate,isEighteenOrAbove, verifyPan } from '../../../../global';
import PreviousNextButtons from '../../../../components/PreviousNextButtons';
import Topbar from '../../../../components/Topbar';
import SwipeableDrawerComponent from '../../../../components/SwipeableDrawer/LeadDrawer';
import Popup from '../../../../components/Popup';
import { AuthContext } from '../../../../context/AuthContextProvider';
import { IconClose } from '../../../../assets/icons';
import ErrorTost from '../../../../components/ToastMessage/ErrorTost';

const DISALLOW_CHAR = ['-', '_', '.', '+', 'ArrowUp', 'ArrowDown', 'Unidentified', 'e', 'E'];

const WorkIncomeDetails = () => {
  const {
    values,
    errors,
    touched,
    handleBlur,
    setFieldValue,
    setFieldError,
    activeIndex,
    setCurrentStepIndex,
    updateProgressApplicantSteps,
    pincodeErr,
    ekycIDStatus,
    setPincodeErr,
    tempQualifier,
    updateParams,
    tempQualifierCoApplicant,
    updateCompleteFormProgress,
    setFieldTouched
  } = useContext(LeadContext);

  const { token,
    errorToastMessage,
    setErrorToastMessage,
   } = useContext(AuthContext);

  const [loadingState, setLoadingState] = useState(false);
  //const [clicked, setClicked] = useState(false);
  // let [nextClick, setNextClick] = useState(false);
 
  const [extraResponse, setExtraResponse] = useState(null);
  const navigate = useNavigate();
  const [qualifierValue, setQualifierValue] = useState(false);
  const [validPan, setValidPan] = useState(false);
  const [panErrors, setPanErrors] = useState([]);
  const [disableBtn, setDisableBtn] = useState(false);

  const[triggerNavigate,setTriggerNavigate] = useState(false)

  const [requiredFieldsStatus, setRequiredFieldsStatus] = useState({
    ...values?.applicants?.[activeIndex]?.work_income_detail?.extra_params?.required_fields_status,
  });

  // const [openExistingPopup, setOpenExistingPopup] = useState(
  //   values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.is_existing || false,
  // );


  useEffect(()=> {

    if(triggerNavigate == true) {
     navigate('/lead/qualifier')
    }

  },[triggerNavigate])


  useEffect(()=> {

    console.log("I AM THE PARAMS",requiredFieldsStatus)


  },[])
  const [openExistingPopup, setOpenExistingPopup] = useState( false );


  const [openQualifierNotActivePopup, setOpenQualifierNotActivePopup] = useState(false);
  const [falseKeys, setFalseKeys] =   useState([]);
  const handleCloseQualifierNotActivePopup = () => {
    setOpenQualifierNotActivePopup(false);
  };

  const[emiError,setEmiError] = useState('');

  const[validateError,setValidateError] = useState("")

 
  useEffect(() => {
    setRequiredFieldsStatus(
      values?.applicants?.[activeIndex]?.work_income_detail?.extra_params?.required_fields_status,
    );
  }, [activeIndex]);

  useEffect(() => {

    if(values?.applicants?.[activeIndex]?.work_income_detail?.profession == 'Un-Employed' && values?.applicants?.[activeIndex]?.work_income_detail?.income_proof == 'Form 60' && requiredFieldsStatus.hasOwnProperty('pan_number')){

      let copy_required = {...requiredFieldsStatus};

      delete copy_required.pan_number;
    updateProgressApplicantSteps('work_income_detail', copy_required, 'work-income');

    return;
    }

    updateProgressApplicantSteps('work_income_detail', requiredFieldsStatus, 'work-income');
  }, [requiredFieldsStatus]);


  const validate_fields = () => {

    const pan_number = values?.applicants?.[activeIndex]?.work_income_detail?.pan_number;

    const email = values?.applicants?.[activeIndex]?.personal_details?.email;

    const dob = values?.applicants?.[activeIndex]?.personal_details?.date_of_birth;

    if(pan_number?.length) {

      let valid_pan = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan_number);

      if(!valid_pan || valid_pan == false) {
        setValidateError("Invalid PAN Number")
        return false;
      }
    }

    if(email?.length) {
      let valid_email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)

      if(!valid_email || valid_email == false) {
        setValidateError("Invalid Email")
        return false
      }
    }

    let check1 = dob?.split('-')

    // let check2 = check1?.[0]?.length == 4;

    let check3 = false;

    if(check1?.[0]?.[0] == 1 || check1?.[0]?.[0] == 2) {
      check3 =  true;
    }

    if(!check3 || check3 == false) {
      setValidateError("Incorrect Date of Birth Format")
      return false;
    }

    let valid_dob = /^\d{4}-\d{1,2}-\d{1,2}$/.test(dob);

    if(!valid_dob || valid_dob == false) {
      setValidateError("Incorrect Date of Birth Format")

      return false
    }

    let above18 = isEighteenOrAbove(dob)

    if(!above18 || above18 == false) {
      setValidateError("Date of Birth is Required. Minimum age must be between 18 and 90")

      return false
    }

    return true;
  }

  const handleRadioChange = useCallback(
    async (e) => {
      const name = e.name.split('.')[2];

      if (name === 'profession') {
        let _requiredFieldStatus = {};

        if (e.value === 'Salaried') {
          if (values?.applicants?.[activeIndex]?.applicant_details?.is_primary) {
            _requiredFieldStatus = {
              profession: true,
              pan_number:
                (values?.applicants?.[activeIndex]?.personal_details?.id_type === 'PAN' &&
                  values?.applicants?.[activeIndex]?.personal_details?.id_number) ||
                values?.applicants?.[activeIndex]?.work_income_detail?.pan_number
                  ? true
                  : false,
              company_name: false,
              salary_per_month: false,
              working_since: false,
              mode_of_salary: false,
              flat_no_building_name: false,
              street_area_locality: false,
              town: false,
              landmark: false,
              pincode: false,
              no_current_loan: false,
              ongoing_emi: false,
              total_family_number: false,
              total_household_income: false,
              no_of_dependents: false,
              comfortable_emi:false,
            };
          } else {
            _requiredFieldStatus = {
              profession: true,
              pan_number:
                (values?.applicants?.[activeIndex]?.personal_details?.id_type === 'PAN' &&
                  values?.applicants?.[activeIndex]?.personal_details?.id_number) ||
                values?.applicants?.[activeIndex]?.work_income_detail?.pan_number
                  ? true
                  : false,
              company_name: false,
              salary_per_month: false,
              working_since: false,
              mode_of_salary: false,
              flat_no_building_name: false,
              street_area_locality: false,
              town: false,
              landmark: false,
              pincode: false,
              no_current_loan: false,
              ongoing_emi: false,
              total_family_number: true,
              total_household_income: true,
              no_of_dependents: true,
            };
          }
        } else if (e.value === 'Self Employed') {
          if (values?.applicants?.[activeIndex]?.applicant_details?.is_primary) {
            _requiredFieldStatus = {
              pan_number:
                (values?.applicants?.[activeIndex]?.personal_details?.id_type === 'PAN' &&
                  values?.applicants?.[activeIndex]?.personal_details?.id_number) ||
                values?.applicants?.[activeIndex]?.work_income_detail?.pan_number
                  ? true
                  : false,
              no_of_employees: false,
              profession: true,
              business_name: false,
              industries: false,
              flat_no_building_name: false,
              street_area_locality: false,
              town: false,
              landmark: false,
              pincode: false,
              no_current_loan: false,
              ongoing_emi: false,
              total_family_number: false,
              total_household_income: false,
              no_of_dependents: false,
              comfortable_emi:false,
              monthly_income:false
            };
          } else {
            _requiredFieldStatus = {
              pan_number:
                (values?.applicants?.[activeIndex]?.personal_details?.id_type === 'PAN' &&
                  values?.applicants?.[activeIndex]?.personal_details?.id_number) ||
                values?.applicants?.[activeIndex]?.work_income_detail?.pan_number
                  ? true
                  : false,
              no_of_employees: false,
              profession: true,
              business_name: false,
              industries: false,
              flat_no_building_name: false,
              street_area_locality: false,
              town: false,
              landmark: false,
              pincode: false,
              no_current_loan: false,
              ongoing_emi: false,
              total_family_number: true,
              total_household_income: true,
              no_of_dependents: true,
              monthly_income:false
            };
          }
        } else if (e.value === 'Un-Employed') {
          if (values?.applicants?.[activeIndex]?.applicant_details?.is_primary) {
            _requiredFieldStatus = {
              income_proof: false,
              profession: true,
              no_current_loan: false,
              ongoing_emi: false,
              total_family_number: false,
              total_household_income: false,
              no_of_dependents: false,
              comfortable_emi:false,
            };
          } else {
            _requiredFieldStatus = {
              income_proof: false,
              profession: true,
              no_current_loan: false,
              ongoing_emi: false,
              total_family_number: true,
              total_household_income: true,
              no_of_dependents: true,
            };
          }
        } else if (e.value === 'Pensioner') {
          if (values?.applicants?.[activeIndex]?.applicant_details?.is_primary) {
            _requiredFieldStatus = {
              pan_number:
                (values?.applicants?.[activeIndex]?.personal_details?.id_type === 'PAN' &&
                  values?.applicants?.[activeIndex]?.personal_details?.id_number) ||
                values?.applicants?.[activeIndex]?.work_income_detail?.pan_number
                  ? true
                  : false,
              profession: true,
              no_current_loan: false,
              ongoing_emi: false,
              total_family_number: false,
              total_household_income: false,
              no_of_dependents: false,
              pention_amount: false,
              comfortable_emi:false,

            };
          } else {
            _requiredFieldStatus = {
              pan_number:
                (values?.applicants?.[activeIndex]?.personal_details?.id_type === 'PAN' &&
                  values?.applicants?.[activeIndex]?.personal_details?.id_number) ||
                values?.applicants?.[activeIndex]?.work_income_detail?.pan_number
                  ? true
                  : false,
              profession: true,
              no_current_loan: false,
              ongoing_emi: false,
              total_family_number: true,
              total_household_income: true,
              no_of_dependents: true,
              pention_amount: false,
            };
          }
        }
        setRequiredFieldsStatus(_requiredFieldStatus);

        const newData = structuredClone(values);

        newData.applicants[activeIndex].work_income_detail = {
          ...newData.applicants[activeIndex].work_income_detail,
          applicant_id: values?.applicants?.[activeIndex]?.applicant_details?.id,
          profession: e.value,
          company_name: '',
          no_of_employees: '',
          income_proof: '',
          udyam_number: '',
          salary_per_month: '',
          pf_uan: '',
          no_current_loan: null,
          ongoing_emi: '',
          working_since: '',
          mode_of_salary: '',
          flat_no_building_name: '',
          street_area_locality: '',
          town: '',
          landmark: '',
          pincode: '',
          city: '',
          state: '',
          total_family_number: '',
          total_household_income: '',
          no_of_dependents: '',
          business_name: '',
          industries: '',
          gst_number: '',
          pention_amount: '',
          extra_params: {
            extra_company_name: '',
            extra_industries: '',
            progress: 15,
            required_fields_status: _requiredFieldStatus,
          },
        };

        setFieldValue(
          `applicants[${activeIndex}].work_income_detail`,
          newData.applicants[activeIndex].work_income_detail,
        );

        if (values?.applicants?.[activeIndex]?.work_income_detail?.id) {   // testing here **
          editFieldsById(
            newData.applicants[activeIndex].work_income_detail.id,
            'work-income',
            newData.applicants[activeIndex].work_income_detail,
            {
              headers: {
                Authorization: token,
              },
            },
          );

          if (
            values?.applicants?.[activeIndex]?.personal_details?.id_type === 'PAN' &&
            values?.applicants?.[activeIndex]?.personal_details?.id_number
          ) {
            setFieldValue(
              `applicants[${activeIndex}].work_income_detail.pan_number`,
              values?.applicants?.[activeIndex]?.personal_details?.id_number,
            );

            editFieldsById(
              values?.applicants?.[activeIndex]?.work_income_detail?.id,
              'work-income',
              {
                pan_number: values?.applicants?.[activeIndex]?.personal_details?.id_number,
              },
              {
                headers: {
                  Authorization: token,
                },
              },
            );

            setRequiredFieldsStatus((prev) => ({ ...prev, ['pan_number']: true }));
          }

          return;
        } else {
          await addApi('work-income', newData.applicants[activeIndex].work_income_detail, {
            headers: {
              Authorization: token,
            },
          })
            .then(async (res) => {
              setFieldValue(`applicants[${activeIndex}].work_income_detail`, {
                ...newData.applicants[activeIndex].work_income_detail,
                id: res.id,
              });

              setRequiredFieldsStatus(() => ({
                ...newData.applicants[activeIndex].work_income_detail.extra_params
                  .required_fields_status,
                [name]: true,
              }));

              await editFieldsById(
                values?.applicants?.[activeIndex]?.applicant_details?.id,
                'applicant',
                { work_income_detail: res.id },
                {
                  headers: {
                    Authorization: token,
                  },
                },
              );
              if (
                values?.applicants?.[activeIndex]?.personal_details?.id_type === 'PAN' &&
                values?.applicants?.[activeIndex]?.personal_details?.id_number
              ) {
                setFieldValue(
                  `applicants[${activeIndex}].work_income_detail.pan_number`,
                  values?.applicants?.[activeIndex]?.personal_details?.id_number,
                );

                editFieldsById(
                  res.id,
                  'work-income',
                  {
                    pan_number: values?.applicants?.[activeIndex]?.personal_details?.id_number,
                  },
                  {
                    headers: {
                      Authorization: token,
                    },
                  },
                );

                setRequiredFieldsStatus((prev) => ({ ...prev, ['pan_number']: true }));
              }
              return res;
            })
            .catch((err) => {
              console.log(err);

              if(err?.response?.data?.message == "Already Exists" && err?.response?.data?.table){
                setFieldValue(`applicants[${activeIndex}].work_income_detail`,err?.response?.data?.table)
              }
              return err;
            });
        }
      }

      setFieldValue(e.name, e.value);

      if (values?.applicants?.[activeIndex]?.work_income_detail?.id) {
        editFieldsById(
          values?.applicants?.[activeIndex]?.work_income_detail?.id,
          'work-income',
          {
            [name]: e.value,
          },
          {
            headers: {
              Authorization: token,
            },
          },
        );
        if (!requiredFieldsStatus[name]) {
          setRequiredFieldsStatus((prev) => ({ ...prev, [name]: true }));
        }
      }
      // else {
      //   let clonedCoApplicantValues = structuredClone(newCoApplicantValues);
      //   let addData = { ...clonedCoApplicantValues.work_income_detail, [name]: e.value };
      //   if (requiredFieldsStatus && !requiredFieldsStatus[name]) {
      //     setRequiredFieldsStatus((prev) => ({ ...prev, [name]: true }));
      //   }

      //   await addApi('work-income', {
      //     ...addData,
      //     applicant_id: values?.applicants?.[activeIndex]?.applicant_details?.id,
      //   })
      //     .then(async (res) => {
      //       setFieldValue(`applicants[${activeIndex}].work_income_detail.id`, res.id);
      //       await editFieldsById(
      //         values?.applicants?.[activeIndex]?.applicant_details?.id,
      //         'applicant',
      //         { work_income_detail: res.id },
      //       );
      //       return res;
      //     })
      //     .catch((err) => {
      //       console.log(err);
      //       return err;
      //     });
      // }
    },
    [values, requiredFieldsStatus, setRequiredFieldsStatus],
  );

 
  const handleOnPincodeChange = async () => {
    if (
      !values?.applicants?.[activeIndex]?.work_income_detail?.pincode ||
      values?.applicants?.[activeIndex]?.work_income_detail?.pincode.toString().length < 5 ||
      errors?.applicants?.[activeIndex]?.work_income_detail?.pincode
    ) {
      setFieldValue(`applicants[${activeIndex}].work_income_detail.city`, '');
      setFieldValue(`applicants[${activeIndex}].work_income_detail.state`, '');
      setRequiredFieldsStatus((prev) => ({ ...prev, ['pincode']: false }));

      editFieldsById(
        values?.applicants?.[activeIndex]?.work_income_detail?.id,
        'work-income',
        {
          city: '',
          state: '',
          pincode: '',
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );

      return;
    }

    const res = await checkIsValidStatePincode(
      values?.applicants?.[activeIndex]?.work_income_detail?.pincode,
      {
        headers: {
          Authorization: token,
        },
      },
    );

    if (!res) {
      setFieldError(`applicants[${activeIndex}].work_income_detail.pincode`, 'Invalid Pincode');
      setPincodeErr((prev) => ({
        ...prev,
        [`work_income_detail_${activeIndex}`]: 'Invalid Pincode',
      }));
      setRequiredFieldsStatus((prev) => ({ ...prev, ['pincode']: false }));

      setFieldValue(`applicants[${activeIndex}].work_income_detail.city`, '');
      setFieldValue(`applicants[${activeIndex}].work_income_detail.state`, '');

      editFieldsById(
        values?.applicants?.[activeIndex]?.work_income_detail?.id,
        'work-income',
        {
          city: '',
          state: '',
          pincode: '',
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      return;
    }

    editFieldsById(
      values?.applicants?.[activeIndex]?.work_income_detail?.id,
      'work-income',
      {
        city: res.city,
        state: res.state,
        pincode: values?.applicants?.[activeIndex]?.work_income_detail?.pincode,
      },
      {
        headers: {
          Authorization: token,
        },
      },
    );

    setFieldValue(`applicants[${activeIndex}].work_income_detail.city`, res.city);
    setFieldValue(`applicants[${activeIndex}].work_income_detail.state`, res.state);
    setPincodeErr((prev) => ({ ...prev, [`work_income_detail_${activeIndex}`]: '' }));

    if (!requiredFieldsStatus['pincode']) {
      setRequiredFieldsStatus((prev) => ({ ...prev, ['pincode']: true }));
    }


  };

  // const handleNextClick = () => {    //**COMMENTED NEED TO CHECK */
  //   updateParams(values?.applicants?.[activeIndex]?.work_income_detail?.id,'work-income',values.applicants[activeIndex].work_income_detail.extra_params)
  //   setCurrentStepIndex(4);
  //   // updateFields();
  // };

  // const handleAutofill = () => {
  //   console.log('autofill work-income');
  // };

 
  const handleNextClick = async () => {
    setQualifierValue(false)
    // Update the database with the current work income detail
    const res = await editNextUpdate(
      values?.applicants?.[activeIndex]?.work_income_detail?.id,
      'work-income',
      {},
      {
        headers: {
          Authorization: token,
        },
      },
    );
    let personal_details = await editFieldsById(
      values?.applicants?.[activeIndex]?.personal_details?.id,
      'personal',
      {},
      {
        headers: {
          Authorization: token,
        },
      },
    );

    // Check conditions to determine if the popup should be opened
console.log('res hit',res)
    if(res){

      //setAddressRequiredFieldsStatus((prev) => ({ ...prev, [name]: true }));

      setRequiredFieldsStatus((prev) => ({ ...prev, ...res?.extra_params?.requiredFieldsStatus }));

      const hasIncompleteProgress =
      values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.progress !== 100 ||
      values?.applicants?.[activeIndex]?.personal_details?.extra_params?.progress !== 100 ||
      values?.applicants?.[activeIndex]?.address_detail?.extra_params?.progress !== 100 ||
      res.extra_params?.progress !== 100
      ||
      res?.extra_params?.progress != 100 ||
      (values.lead?.lead_type === 'DSA' && values?.lead?.connector_code === '') ||
      (values.lead?.lead_type === 'connector' && values?.lead?.connector_code === '');

      if (hasIncompleteProgress) {
        console.log('res hit hasIncompleteProgress',hasIncompleteProgress)
        // Initialize an object to hold categorized missed fields

        //add on for new fields
        const is_primary = values?.applicants?.[activeIndex]?.applicant_details?.is_primary;

        let work_income_fields = res?.extra_params?.required_fields_status


          if(values?.applicants?.[activeIndex]?.address_detail?.extra_params?.required_fields_status?.comfortable_emi == false && is_primary) {

            work_income_fields.comfortable_emi = values?.applicants?.[activeIndex]?.address_detail?.extra_params?.required_fields_status?.comfortable_emi

          }
       

        const combinedMissed = {
            Personal: values?.applicants?.[activeIndex]?.personal_details?.extra_params?.required_fields_status || {},
            Address: values?.applicants?.[activeIndex]?.address_detail?.extra_params?.required_fields_status || {},
            Work: work_income_fields || {}
        };

        // Object to store only keys with 'false' values categorized
        const falseKeysCategorized = {};
       
        // Iterate over each category to find missing fields
        Object.entries(combinedMissed).forEach(([category, fields]) => {
            if (Object.keys(fields).length === 0)
              {
                falseKeysCategorized[category] = ['ALL MANDATORY FIELDS ARE BLANK'];
            }
            else {
                const keysWithFalseValues = Object.keys(fields).filter(key => !fields[key]);
                if (keysWithFalseValues.length > 0) {
                    falseKeysCategorized[category] = keysWithFalseValues;
                }
            }
        });

        // Check if there are any categories with missing fields
        const hasMissingFields = Object.keys(falseKeysCategorized).length > 0;
        
        // Set state only if there are actually missing fields
        if (hasMissingFields) {
        setFalseKeys(falseKeysCategorized);
          setOpenExistingPopup(true);
        console.log("Combined Missed Fields:", combinedMissed);
        console.log("Keys with False Values:", falseKeysCategorized);
        } else {
          // Clear any previous false keys and ensure popup is closed
          setFalseKeys({});
          setOpenExistingPopup(false);
        }
       
    } else {
      console.log('res hit hasIncompleteProgress else block',hasIncompleteProgress)
        // If all required fields are complete, move to the next step
        console.log('setQualifierValue pre',qualifierValue)
        setQualifierValue(true)
        setCurrentStepIndex(4);

        if(values?.applicants?.[activeIndex]?.applicant_details?.is_ekyc_verified == true){
        navigate('/lead/qualifier')
        // alert("NAVIGATING")
        console.log('setQualifierValue post',qualifierValue);

        return;

        }

        
        // if ((values?.applicants?.[activeIndex]?.personal_details?.id_type == 'PAN' || values?.applicants?.[activeIndex]?.work_income_detail.income_proof !== 'Form 60') && (values?.applicants?.[activeIndex]?.personal_details?.is_pan_verified == 'false' || !values?.applicants?.[activeIndex]?.personal_details?.is_pan_verified)) {
         
        //     setDisableBtn(true);
        //     try {
        //       const PAN_res = await verifyPan(  
        //         values?.applicants?.[activeIndex]?.applicant_details?.id,
        //         { type: 'id' },
        //         {
        //           headers: {
        //             Authorization: token,
        //           },
        //         },
        //       );
              
        //       console.log('res hit if',PAN_res)
        //       if (PAN_res?.mismatches?.length > 0) {
        //         setPanErrors(PAN_res.mismatches);
        //         setValidPan(true);
        //         setQualifierValue(false);
        //         return;
        //       }


        //       if(PAN_res?.applicant_personal_detail) {
        //         setFieldValue(`applicants[${activeIndex}].personal_details`,PAN_res?.applicant_personal_detail)
        //       }
        //       // if (!PAN_res?.pan_response.pan || !PAN_res.pan_response.name || !PAN_res.pan_response.dob) {
        //       //   throw new Error('PAN response is incomplete or invalid.');
        //       // }


        //     } catch (error) {
        //       setErrorToastMessage("Oops something went wrong. Kindly retry")
        //       return;
        //     } finally {
        //       setDisableBtn(false);
        //     }
          
        // }
        // navigate('/lead/qualifier')

        setTriggerNavigate(true);
        console.log('setQualifierValue post',qualifierValue)
    }

    }else{
      console.log('res hit else')
      alert('Please Verify Previous Screens to Activate Qualifier')
    }  
};


// useEffect(()=> { // In case of pan number already updated and does not match regex **09/01


//   let pan_regex = /^[A-Z]{5}[0-9]{4}[A-Z]$/

//   if(values?.applicants?.[activeIndex]?.work_income_detail?.pan_number?.length) {

//     let valid_pan = pan_regex.test(values?.applicants?.[activeIndex]?.work_income_detail?.pan_number)

//     alert(valid_pan)

//     let if_required;
   

//     if(requiredFieldsStatus?.hasOwnProperty('pan_number')){if_required= true}

//     let extra_params = values?.applicants?.[activeIndex]?.work_income_detail?.extra_params;

//     let batch_data = {}

//     if(valid_pan == false) {

//       batch_data.pan_number = '';

//       if(if_required){
       
//         batch_data.extra_params = {...extra_params,required_fields_status:{...extra_params.required_fields_status,pan_number:false}}
     
//         setRequiredFieldsStatus((prev) => ({ ...prev, ['pan_number']: false }))
//       }

//       editFieldsById(values?.applicants?.[activeIndex]?.work_income_detail?.id,'work-income',
       
//         batch_data,
//       {
//         headers: {
//           Authorization: token,
//         },
//       },)

//       setFieldValue(`applicants[${activeIndex}].work_income_detail.pan_number`,
//         '',)
//     }

//   }


// },[]) /// COMMENTING FOR TESTING PAN MANUAL VALIDATION






  useEffect(() => {
    // Sync PAN from personal_details to work_income_detail when applicable.
    const personal = values?.applicants?.[activeIndex]?.personal_details;
    const workIncome = values?.applicants?.[activeIndex]?.work_income_detail;
    const rawId = personal?.id_number;
    const idType = personal?.id_type;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

    const normalizedId = rawId ? String(rawId).trim().toUpperCase() : '';

    (async () => {
      try {
        if (idType === 'PAN' && normalizedId) {
          const isValidPan = panRegex.test(normalizedId);

          if (isValidPan) {
            // update local state only if different
            if (workIncome?.pan_number !== normalizedId) {
              setFieldValue(
                `applicants[${activeIndex}].work_income_detail.pan_number`,
                normalizedId,
              );

              if (workIncome?.id) {
                await editFieldsById(
                  workIncome.id,
                  'work-income',
                  { pan_number: normalizedId },
                  { headers: { Authorization: token } },
                );
              }
            }

            setRequiredFieldsStatus((prev) => ({ ...prev, pan_number: true }));
          } else {
            // Invalid PAN: clear any previously populated pan_number
            if (workIncome?.pan_number) {
              setFieldValue(`applicants[${activeIndex}].work_income_detail.pan_number`, '');
              if (workIncome?.id) {
                await editFieldsById(
                  workIncome.id,
                  'work-income',
                  { pan_number: '' },
                  { headers: { Authorization: token } },
                );
              }
            } else {
              // ensure local field is empty
              setFieldValue(`applicants[${activeIndex}].work_income_detail.pan_number`, '');
            }

            setRequiredFieldsStatus((prev) => ({ ...prev, pan_number: false }));
          }
        } else if (
          !workIncome?.pan_number &&
          workIncome?.income_proof !== 'Form 60'
        ) {
          // Ensure pan_number is empty in work_income when no PAN provided and income proof is not Form 60
          setFieldValue(`applicants[${activeIndex}].work_income_detail.pan_number`, '');

          if (workIncome?.id) {
            await editFieldsById(
              workIncome.id,
              'work-income',
              { pan_number: '' },
              { headers: { Authorization: token } },
            );
          }

          setRequiredFieldsStatus((prev) => ({
            ...prev,
            pan_number: !!workIncome?.pan_number,
          }));
        }
      } catch (err) {
        console.error('Error syncing PAN to work income:', err);
      }
    })();
  }, [
    values?.applicants?.[activeIndex]?.personal_details?.id_type,
    values?.applicants?.[activeIndex]?.personal_details?.id_number,
    values?.applicants?.[activeIndex]?.work_income_detail?.pan_number,
    values?.applicants?.[activeIndex]?.work_income_detail?.income_proof,
    activeIndex,
    token,
  ]);

    // setting ongoing emi value  ** COMMENTED FOR TESTING
    // useEffect(() => {
 
    //   if(values?.applicants?.[activeIndex]?.work_income_detail?.no_current_loan === null){
    //     setFieldValue(
    //       `applicants[${activeIndex}].work_income_detail.no_current_loan`,
    //       0,
    //     );
    //     editFieldsById(
    //       values?.applicants?.[activeIndex]?.work_income_detail?.id,
    //       'work-income',
    //       {
    //         no_current_loan: 0,
    //       },
    //       {
    //         headers: {
    //           Authorization: token,
    //         },
    //       },
    //     );
    //     setRequiredFieldsStatus((prev) => ({
    //       ...prev,
    //       ['no_current_loan']: true,
    //     }));  

    //     setRequiredFieldsStatus((prev) => ({
    //       ...prev,
    //       ['ongoing_emi']: true,
    //     }));
    //     setFieldTouched(`applicants[${activeIndex}].work_income_detail.no_current_loan`, true);
    //   }
    // },[])



    // useEffect(() => {
    //   if(values?.applicants?.[activeIndex]?.work_income_detail?.ongoing_emi == ""){
    //           // ongoing emi
    //           setFieldValue(
    //             `applicants[${activeIndex}].work_income_detail.ongoing_emi`,
    //             null,
    //           );
       
    //           editFieldsById(
    //             values?.applicants?.[activeIndex]?.work_income_detail?.id,
    //             'work-income',
    //             {
    //               ongoing_emi: null,
    //             },
    //             {
    //               headers: {
    //                 Authorization: token,
    //               },
    //             },
    //           );
       
    //           setRequiredFieldsStatus((prev) => ({
    //             ...prev,
    //             ['ongoing_emi']: true,
    //           }));
    //           setFieldTouched(`applicants[${activeIndex}].work_income_detail.ongoing_emi`, true);
    //   }
    // },[])

  return (
    <>
      <Popup
        handleClose={handleCloseQualifierNotActivePopup}
        open={openQualifierNotActivePopup}
        setOpen={setOpenQualifierNotActivePopup}
        title= {validateError}
        description={`Please update the Above Value to activate Qualifier`}
      />
      <ErrorTost
              message={errorToastMessage}
              setMessage={setErrorToastMessage}
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
        <div className='flex flex-col bg-medium-grey gap-2 overflow-auto max-[480px]:no-scrollbar p-[20px] pb-[150px] flex-1'>
          <div className='flex flex-col gap-2'>
            <label htmlFor='loan-purpose' className='flex gap-0.5 font-medium text-black'>
              Profession <span className='text-primary-red text-xs'>*</span>
            </label>
            <div className={`flex gap-4 w-full`}>
              {professionOptions.map((option) => {
                return (
                  <CardRadio
                    key={option.value}
                    label={option.label}
                    name={`applicants[${activeIndex}].work_income_detail.profession`}
                    value={option.value}
                    current={values?.applicants?.[activeIndex]?.work_income_detail?.profession}
                    onChange={handleRadioChange}
                    containerClasses='flex-1'
                    disabled={
                      values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier || (values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
                    }
                  >
                    {option.icon}
                  </CardRadio>
                );
              })}
            </div>

            {values?.applicants?.[activeIndex]?.work_income_detail?.profession !== 'Un-Employed' &&
            !!values?.applicants?.[activeIndex]?.work_income_detail?.profession ? (
              <TextInput
                label='Enter PAN number'
                placeholder='Eg: ABCDE1234F'
                required
                name={`applicants[${activeIndex}].work_income_detail.pan_number`}
                value={values?.applicants?.[activeIndex]?.work_income_detail?.pan_number}
                onChange={(e) => {
                  if (e.target.value === ' ') {
                    return;
                  }
                  let value = e.target.value;
                  value = value.trimStart().replace(/\s\s+/g, ' ');
                  const pattern = /^[A-Za-z0-9]+$/;

                  if (value?.trim() == '') {
                    setFieldValue(e.target.name, value);
                  }

                  if (pattern.test(value)) {
                    setFieldValue(e.target.name, value.toUpperCase());
                  }
                }}
                inputClasses='capitalize'
                error={errors.applicants?.[activeIndex]?.work_income_detail?.pan_number}
                touched={
                  touched?.applicants &&
                  touched?.applicants?.[activeIndex]?.work_income_detail?.pan_number
                }
                disabled={
                  (values?.applicants?.[activeIndex]?.personal_details?.id_type === 'PAN' &&
                    values?.applicants?.[activeIndex]?.personal_details?.id_number) ||
                  values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier || (values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
                }
                // labelDisabled={!values?.applicants?.[activeIndex]?.personal_details?.id_type}
                onBlur={(e) => {
                  handleBlur(e);

                  if (
                    !errors.applicants?.[activeIndex]?.work_income_detail?.pan_number &&
                    values?.applicants?.[activeIndex]?.work_income_detail?.pan_number
                  ) {
                    editFieldsById(
                      values?.applicants?.[activeIndex]?.work_income_detail?.id,
                      'work-income',
                      {
                        pan_number: e.target.value,
                      },
                      {
                        headers: {
                          Authorization: token,
                        },
                      },
                    );
                    const name = e.target.name.split('.')[2];

                    setRequiredFieldsStatus((prev) => ({ ...prev, [name]: true }));
                  } else {
                    editFieldsById(
                      values?.applicants?.[activeIndex]?.work_income_detail?.id,
                      'work-income',
                      {
                        pan_number: '',
                      },
                      {
                        headers: {
                          Authorization: token,
                        },
                      },
                    );

                    const name = e.target.name.split('.')[2];
                    setRequiredFieldsStatus((prev) => ({ ...prev, [name]: false }));
                  }
                }}
              />
            ) : null}

            {errors?.applicants?.[activeIndex]?.work_income_detail?.profession &&
            touched?.applicants?.[activeIndex]?.work_income_detail?.profession ? (
              <span
                className='text-xs text-primary-red'
                dangerouslySetInnerHTML={{
                  __html: errors?.applicants?.[activeIndex]?.work_income_detail?.profession,
                }}
              />
            ) : (
              ''
            )}
          </div>

          {values?.applicants?.[activeIndex]?.work_income_detail?.profession === 'Salaried' && (
            <Salaried
              requiredFieldsStatus={requiredFieldsStatus}
              setRequiredFieldsStatus={setRequiredFieldsStatus}
            />
          )}

          {values?.applicants?.[activeIndex]?.work_income_detail?.profession ===
            'Self Employed' && (
            <SelfEmployed
              requiredFieldsStatus={requiredFieldsStatus}
              setRequiredFieldsStatus={setRequiredFieldsStatus}
            />
          )}

          {values?.applicants?.[activeIndex]?.work_income_detail?.profession === 'Un-Employed' && (
            <UnEmployed
              requiredFieldsStatus={requiredFieldsStatus}
              setRequiredFieldsStatus={setRequiredFieldsStatus}
            />
          )}

          {values?.applicants?.[activeIndex]?.work_income_detail?.profession === 'Pensioner' && (
            <Retired
              requiredFieldsStatus={requiredFieldsStatus}
              setRequiredFieldsStatus={setRequiredFieldsStatus}
            />
          )}

          {values?.applicants?.[activeIndex]?.work_income_detail?.profession === 'Salaried' ||
          values?.applicants?.[activeIndex]?.work_income_detail?.profession === 'Self Employed' ? (
            <>
                   <label
                htmlFor='loan-purpose'
                className='flex gap-0.5 font-medium text-primary-black text-xl mt-3'
              >
                Employer/Business Address
              </label>
              <TextInput
                label='Plot no/Building name'
                placeholder='Eg: C-101'
                required
                name={`applicants[${activeIndex}].work_income_detail.flat_no_building_name`}
                value={values?.applicants?.[activeIndex]?.work_income_detail?.flat_no_building_name}
                error={errors?.applicants?.[activeIndex]?.work_income_detail?.flat_no_building_name}
                touched={
                  touched?.applicants?.[activeIndex]?.work_income_detail?.flat_no_building_name
                }
                onBlur={(e) => {
                  handleBlur(e);
                  if (
                    !errors?.applicants?.[activeIndex]?.work_income_detail?.flat_no_building_name &&
                    values?.applicants?.[activeIndex]?.work_income_detail?.flat_no_building_name
                  ) {
                    editFieldsById(
                      values?.applicants?.[activeIndex]?.work_income_detail?.id,
                      'work-income',
                      {
                        flat_no_building_name:
                          values?.applicants?.[activeIndex]?.work_income_detail
                            ?.flat_no_building_name,
                      },
                      {
                        headers: {
                          Authorization: token,
                        },
                      },
                    );

                    if (!requiredFieldsStatus['flat_no_building_name']) {
                      setRequiredFieldsStatus((prev) => ({
                        ...prev,
                        ['flat_no_building_name']: true,
                      }));
                    }
                  } else {
                    setRequiredFieldsStatus((prev) => ({
                      ...prev,
                      ['flat_no_building_name']: false,
                    }));
                    editFieldsById(
                      values?.applicants?.[activeIndex]?.work_income_detail?.id,
                      'work-income',
                      {
                        flat_no_building_name: '',
                      },
                      {
                        headers: {
                          Authorization: token,
                        },
                      },
                    );
                  }
                }}
                onChange={(e) => {
                  let value = e.currentTarget.value;
                  value = value?.trimStart()?.replace(/\s\s+/g, ' ');
                  const address_pattern = /^[a-zA-Z0-9\/\s,-]+$/
///^[a-zA-Z0-9\\/-\s,]+$/;
                  if (!address_pattern.test(value) && value.length != 0) {
                    return;
                  }
                  if (address_pattern.exec(value[value.length - 1])) {
                    setFieldValue(
                      e.currentTarget.name,
                      value.charAt(0).toUpperCase() + value.slice(1).toUpperCase(),
                    );
                  }
                }}
                disabled={
                  values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier || (values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
                }
              />

              <TextInput
                label='Street/Area/Locality'
                placeholder='Eg: Senapati road'
                required
                name={`applicants[${activeIndex}].work_income_detail.street_area_locality`}
                value={values?.applicants?.[activeIndex]?.work_income_detail?.street_area_locality}
                error={errors?.applicants?.[activeIndex]?.work_income_detail?.street_area_locality}
                touched={
                  touched?.applicants?.[activeIndex]?.work_income_detail?.street_area_locality
                }
                onBlur={(e) => {
                  handleBlur(e);

                  if (
                    !errors?.applicants?.[activeIndex]?.work_income_detail?.street_area_locality &&
                    values?.applicants?.[activeIndex]?.work_income_detail?.street_area_locality
                  ) {
                    editFieldsById(
                      values?.applicants?.[activeIndex]?.work_income_detail?.id,
                      'work-income',
                      {
                        street_area_locality:
                          values?.applicants?.[activeIndex]?.work_income_detail
                            ?.street_area_locality,
                      },
                      {
                        headers: {
                          Authorization: token,
                        },
                      },
                    );

                    if (!requiredFieldsStatus['street_area_locality']) {
                      setRequiredFieldsStatus((prev) => ({
                        ...prev,
                        ['street_area_locality']: true,
                      }));
                    }
                  } else {
                    setRequiredFieldsStatus((prev) => ({
                      ...prev,
                      ['street_area_locality']: false,
                    }));

                    editFieldsById(
                      values?.applicants?.[activeIndex]?.work_income_detail?.id,
                      'work-income',
                      {
                        street_area_locality: '',
                      },
                      {
                        headers: {
                          Authorization: token,
                        },
                      },
                    );
                  }
                }}
                onChange={(e) => {
                  let value = e.currentTarget.value;
                  value = value?.trimStart()?.replace(/\s\s+/g, ' ');
                  const address_pattern = /^[a-zA-Z0-9/-\s,]+$/;
                  if (!address_pattern.test(value) && value.length != 0) {
                    return;
                  }
                  if (address_pattern.exec(value[value.length - 1])) {
                    setFieldValue(
                      e.currentTarget.name,
                      value.charAt(0).toUpperCase() + value.slice(1).toUpperCase(),
                    );
                  }
                }}
                disabled={
                  values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier || (values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
                }
              />

              <TextInput
                label='Town'
                placeholder='Eg: Igatpuri'
                required
                name={`applicants[${activeIndex}].work_income_detail.town`}
                value={values?.applicants?.[activeIndex]?.work_income_detail?.town}
                error={errors?.applicants?.[activeIndex]?.work_income_detail?.town}
                touched={touched?.applicants?.[activeIndex]?.work_income_detail?.town}
                onBlur={(e) => {
                  handleBlur(e);

                  if (
                    !errors?.applicants?.[activeIndex]?.work_income_detail?.town &&
                    values?.applicants?.[activeIndex]?.work_income_detail?.town
                  ) {
                    editFieldsById(
                      values?.applicants?.[activeIndex]?.work_income_detail?.id,
                      'work-income',
                      {
                        town: values?.applicants?.[activeIndex]?.work_income_detail?.town,
                      },
                      {
                        headers: {
                          Authorization: token,
                        },
                      },
                    );

                    if (!requiredFieldsStatus['town']) {
                      setRequiredFieldsStatus((prev) => ({
                        ...prev,
                        ['town']: true,
                      }));
                    }
                  } else {
                    setRequiredFieldsStatus((prev) => ({
                      ...prev,
                      ['town']: false,
                    }));

                    editFieldsById(
                      values?.applicants?.[activeIndex]?.work_income_detail?.id,
                      'work-income',
                      {
                        town: '',
                      },
                      {
                        headers: {
                          Authorization: token,
                        },
                      },
                    );
                  }
                }}
                onChange={(e) => {
                  let value = e.currentTarget.value;
                  value = value?.trimStart()?.replace(/\s\s+/g, ' ');
                  const address_pattern = /^[a-zA-Z0-9/-\s,]+$/;
                  if (!address_pattern.test(value) && value.length != 0) {
                    return;
                  }
                  if (address_pattern.exec(value[value.length - 1])) {
                    setFieldValue(
                      e.currentTarget.name,
                      value.charAt(0).toUpperCase() + value.slice(1).toUpperCase(),
                    );
                  }
                }}
                disabled={
                  values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier || (values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
                }
              />

              <TextInput
                label='Landmark'
                placeholder='Eg: Near apollo hospital'
                required
                name={`applicants[${activeIndex}].work_income_detail.landmark`}
                value={values?.applicants?.[activeIndex]?.work_income_detail?.landmark}
                error={errors?.applicants?.[activeIndex]?.work_income_detail?.landmark}
                touched={touched?.applicants?.[activeIndex]?.work_income_detail?.landmark}
                onBlur={(e) => {
                  handleBlur(e);

                  if (
                    !errors?.applicants?.[activeIndex]?.work_income_detail?.landmark &&
                    values?.applicants?.[activeIndex]?.work_income_detail?.landmark
                  ) {
                    editFieldsById(
                      values?.applicants?.[activeIndex]?.work_income_detail?.id,
                      'work-income',
                      {
                        landmark: values?.applicants?.[activeIndex]?.work_income_detail?.landmark,
                      },
                      {
                        headers: {
                          Authorization: token,
                        },
                      },
                    );

                    if (!requiredFieldsStatus['landmark']) {
                      setRequiredFieldsStatus((prev) => ({
                        ...prev,
                        ['landmark']: true,
                      }));
                    }
                  } else {
                    setRequiredFieldsStatus((prev) => ({
                      ...prev,
                      ['landmark']: false,
                    }));
                    editFieldsById(
                      values?.applicants?.[activeIndex]?.work_income_detail?.id,
                      'work-income',
                      {
                        landmark: '',
                      },
                      {
                        headers: {
                          Authorization: token,
                        },
                      },
                    );
                  }
                }}
                onChange={(e) => {
                  let value = e.currentTarget.value;
                  value = value?.trimStart()?.replace(/\s\s+/g, ' ');
                  const address_pattern = /^[a-zA-Z0-9/-\s,]+$/;
                  if (!address_pattern.test(value) && value.length != 0) {
                    return;
                  }
                  if (address_pattern.exec(value[value.length - 1])) {
                    setFieldValue(
                      e.currentTarget.name,
                      value.charAt(0).toUpperCase() + value.slice(1).toUpperCase(),
                    );
                  }
                }}
                disabled={
                  values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier || (values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
                }
              />

              <TextInput
                required
                type='tel'
                hint='City and State fields will get filled based on Pincode'
                placeholder='Eg: 123456'
                label='Pincode'
                name={`applicants[${activeIndex}].work_income_detail.pincode`}
                value={values?.applicants?.[activeIndex]?.work_income_detail?.pincode}
                error={
                  errors?.applicants?.[activeIndex]?.work_income_detail?.pincode ||
                  pincodeErr?.[`work_income_detail_${activeIndex}`]
                }
                touched={touched?.applicants?.[activeIndex]?.work_income_detail?.pincode}
                onBlur={(e) => {
                  handleBlur(e);

                  handleOnPincodeChange();

                  if (
                    !errors?.applicants?.[activeIndex]?.work_income_detail?.pincode &&
                    values?.applicants?.[activeIndex]?.work_income_detail?.pincode
                  ) {
                    editFieldsById(
                      values?.applicants?.[activeIndex]?.work_income_detail?.id,
                      'work-income',
                      {
                        pincode: values?.applicants?.[activeIndex]?.work_income_detail?.pincode,
                      },
                      {
                        headers: {
                          Authorization: token,
                        },
                      },
                    );
                  } else {
                    setRequiredFieldsStatus((prev) => ({
                      ...prev,
                      ['pincode']: false,
                    }));
                    editFieldsById(
                      values?.applicants?.[activeIndex]?.work_income_detail?.id,
                      'work-income',
                      {
                        pincode: '',
                      },
                      {
                        headers: {
                          Authorization: token,
                        },
                      },
                    );
                  }
                }}
                min='0'
                onInput={(e) => {
                  if (!e.currentTarget.validity.valid) e.currentTarget.value = '';
                }}
                onChange={(e) => {
                  if (e.currentTarget.value.length > 6) {
                    e.preventDefault();
                    return;
                  }
                  const value = e.currentTarget.value;
                  if (value.charAt(0) === '0') {
                    e.preventDefault();
                    return;
                  }
                  setFieldValue(
                    `applicants[${activeIndex}].work_income_detail.pincode`,
                    e.target.value,
                  );
                }}
                onKeyDown={(e) => {
                  //capturing ctrl V and ctrl C
                  (e.key == 'v' && (e.metaKey || e.ctrlKey)) ||
                  DISALLOW_CHAR.includes(e.key) ||
                  e.key === 'ArrowUp' ||
                  e.key === 'ArrowDown'
                    ? e.preventDefault()
                    : null;
                }}
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
                onPaste={(e) => {
                  e.preventDefault();
                  const text = (e.originalEvent || e).clipboardData
                    .getData('text/plain')
                    .replace('');
                  e.target.value = text;
                  setFieldValue(
                    `applicants[${activeIndex}].work_income_detail.pincode`,
                    e.target.value,
                  );
                }}
                inputClasses='hidearrow'
                disabled={
                  values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier || (values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
                }
              />

              <TextInput
                label='City'
                placeholder='Eg: Nashik'
                disabled={true}
                name={`applicants[${activeIndex}].work_income_detail.city`}
                value={values?.applicants?.[activeIndex]?.work_income_detail?.city}
                error={errors?.applicants?.[activeIndex]?.work_income_detail?.city}
                touched={touched?.applicants?.[activeIndex]?.work_income_detail?.city}
                onBlur={handleBlur}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  const address_pattern = /^[a-zA-Z0-9\\/-\s,.]+$/;
                  if (address_pattern.exec(value[value.length - 1])) {
                    setFieldValue(
                      e.currentTarget.name,
                      value.charAt(0).toUpperCase() + value.slice(1),
                    );
                  }
                }}
                labelDisabled={!values?.applicants?.[activeIndex]?.work_income_detail?.city}
              />

              <TextInput
                label='State'
                placeholder='Eg: Maharashtra'
                disabled={true}
                name={`applicants[${activeIndex}].work_income_detail.state`}
                value={values?.applicants?.[activeIndex]?.work_income_detail?.state}
                error={errors?.applicants?.[activeIndex]?.work_income_detail?.state}
                touched={touched?.applicants?.[activeIndex]?.work_income_detail?.state}
                onBlur={handleBlur}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  const address_pattern = /^[a-zA-Z0-9\\/-\s,.]+$/;
                  if (address_pattern.exec(value[value.length - 1])) {
                    setFieldValue(
                      e.currentTarget.name,
                      value.charAt(0).toUpperCase() + value.slice(1),
                    );
                  }
                }}
                labelDisabled={!values?.applicants?.[activeIndex]?.work_income_detail?.state}
              />
            </>
          ) : null}

          {professionOptions.length &&
          values?.applicants?.[activeIndex]?.applicant_details?.is_primary &&
          values?.applicants?.[activeIndex]?.work_income_detail?.profession ? (
            <>
              <div className='flex flex-col gap-2'>
                <label htmlFor='loan-purpose' className='flex gap-0.5 font-medium text-black'>
                  Total family members <span className='text-primary-red text-xs'>*</span>
                </label>
                <div className={`flex gap-4 w-full`}>
                  {totalFamilyMembersOptions.map((option) => {
                    return (
                      <CardRadioWithoutIcon
                        key={option.value}
                        label={option.label}
                        name={`applicants[${activeIndex}].work_income_detail.total_family_number`}
                        value={option.value}
                        current={
                          values?.applicants?.[activeIndex]?.work_income_detail?.total_family_number
                        }
                        onChange={handleRadioChange}
                        containerClasses='flex-1'
                        disabled={
                          values?.applicants?.[activeIndex]?.applicant_details?.extra_params
                            ?.qualifier || (values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
                        }
                      ></CardRadioWithoutIcon>
                    );
                  })}
                </div>
              </div>

              <CurrencyInput
                label='Total household income'
                placeholder='Eg: 1,00,000'
                required
                name={`applicants[${activeIndex}].work_income_detail.total_household_income`}
                value={
                  values?.applicants?.[activeIndex]?.work_income_detail?.total_household_income
                }
                error={
                  errors?.applicants?.[activeIndex]?.work_income_detail?.total_household_income
                }
                touched={
                  touched?.applicants?.[activeIndex]?.work_income_detail?.total_household_income
                }
                onBlur={(e) => {
                  handleBlur(e);

                  if (
                    !errors?.applicants?.[activeIndex]?.work_income_detail
                      ?.total_household_income &&
                    values?.applicants?.[activeIndex]?.work_income_detail?.total_household_income
                  ) {
                    editFieldsById(
                      values?.applicants?.[activeIndex]?.work_income_detail?.id,
                      'work-income',
                      {
                        total_household_income:
                          values?.applicants?.[activeIndex]?.work_income_detail
                            ?.total_household_income,
                      },
                      {
                        headers: {
                          Authorization: token,
                        },
                      },
                    );

                    if (!requiredFieldsStatus['total_household_income']) {
                      setRequiredFieldsStatus((prev) => ({
                        ...prev,
                        ['total_household_income']: true,
                      }));
                    }
                  } else {
                    setRequiredFieldsStatus((prev) => ({
                      ...prev,
                      ['total_household_income']: false,
                    }));

                    editFieldsById(
                      values?.applicants?.[activeIndex]?.work_income_detail?.id,
                      'work-income',
                      {
                        total_household_income: '',
                      },
                      {
                        headers: {
                          Authorization: token,
                        },
                      },
                    );
                  }
                }}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  const address_pattern = /^[a-zA-Z0-9\\/-\s,.]+$/;
                  if (address_pattern.exec(value[value.length - 1])) {
                    setFieldValue(
                      e.currentTarget.name,
                      value.charAt(0).toUpperCase() + value.slice(1),
                    );
                  }
                }}
                disabled={
                  values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier || (values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
                }
              />

              <div className='flex flex-col gap-2'>
                <label htmlFor='loan-purpose' className='flex gap-0.5 font-medium text-black'>
                  No. of Dependents <span className='text-primary-red text-xs'>*</span>
                </label>
                <div className={`flex gap-4 w-full`}>
                  {noOfDependentsOptions.map((option) => {
                    return (
                      <CardRadioWithoutIcon
                        key={option.value}
                        label={option.label}
                        name={`applicants[${activeIndex}].work_income_detail.no_of_dependents`}
                        value={option.value}
                        current={
                          values?.applicants?.[activeIndex]?.work_income_detail?.no_of_dependents
                        }
                        onChange={handleRadioChange}
                        containerClasses='flex-1'
                        disabled={
                          values?.applicants?.[activeIndex]?.applicant_details?.extra_params
                            ?.qualifier || (values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
                        }
                      ></CardRadioWithoutIcon>
                    );
                  })}
                </div>
              </div>

              <div>

              <CurrencyInput
        label='Comfortable EMI (As per Appform)'
        placeholder='Eg: 10,000'
        required
        name={`applicants[${activeIndex}].work_income_detail.comfortable_emi`}
        value={values?.applicants?.[activeIndex]?.work_income_detail?.comfortable_emi}
        error={
         emiError
        }
        touched={touched?.applicants?.[activeIndex]?.work_income_detail?.comfortable_emi}
        onBlur={(e) => {
          handleBlur(e);

          if (
            !errors?.applicants?.[activeIndex]?.work_income_detail?.comfortable_emi &&
            values?.applicants?.[activeIndex]?.work_income_detail?.comfortable_emi
          ) {
            editFieldsById(
              values?.applicants?.[activeIndex]?.work_income_detail?.id,
              'work-income',
              {
                comfortable_emi: values?.applicants?.[activeIndex]?.work_income_detail?.comfortable_emi,
              },
              {
                headers: {
                  Authorization: token,
                },
              },
            );
          } else {
            setRequiredFieldsStatus((prev) => ({
              ...prev,
              ['comfortable_emi']: false,
            }));

            editFieldsById(
              values?.applicants?.[activeIndex]?.work_income_detail?.id,
              'work-income',
              {
                comfortable_emi: '',
              },
              {
                headers: {
                  Authorization: token,
                },
              },
            );
          }
        }}
        onChange={(e) => {
          const value = e.currentTarget.value;
          const address_pattern = /^[a-zA-Z0-9\/-\s]+$/;
          if (address_pattern.exec(value[value.length - 1])) {
            setFieldValue(e.currentTarget.name, value.charAt(0).toUpperCase() + value.slice(1));

            if(value) {
              setEmiError('')
            }

            else {
              setEmiError('This field is mandatory')
            }

            if (!requiredFieldsStatus['comfortable_emi']) {
              setRequiredFieldsStatus((prev) => ({ ...prev, ['comfortable_emi']: true }));
            }
          }
        }}
        // hint='Total ongoing EMI(s) based on the ongoing loan(s)'
        disabled={
          // values?.applicants?.[activeIndex]?.work_income_detail?.no_current_loan == 0
          //   ? true
           false || values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier ||(values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
        }
        // labelDisabled={
        //   values?.applicants?.[activeIndex]?.work_income_detail?.no_current_loan == 0 ? true : false
        // }
      />

      </div>
            </>
          ) : null}
        </div>



        <PreviousNextButtons
          linkPrevious='/lead/address-details'
          disableNext={disableBtn}
          // linkNext={
          //   values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.progress !== 100 ||
          //   values?.applicants?.[activeIndex]?.personal_details?.extra_params?.progress !== 100 ||
          //   values?.applicants?.[activeIndex]?.address_detail?.extra_params?.progress !== 100 ||
          //   values?.applicants?.[activeIndex]?.work_income_detail?.extra_params?.progress !== 100 ||
          //   (values.lead?.lead_type === 'DSA' && values?.lead?.connector_code === '') ||
          //   (values.lead?.lead_type === 'connector' && values?.lead?.connector_code === '')
          //     ? null
          //     : '/lead/qualifier'
          // }
          // onNextClick={() =>
          //   values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.progress !== 100 ||
          //   values?.applicants?.[activeIndex]?.personal_details?.extra_params?.progress !== 100 ||
          //   values?.applicants?.[activeIndex]?.address_detail?.extra_params?.progress !== 100 ||
          //   values?.applicants?.[activeIndex]?.work_income_detail?.extra_params?.progress !== 100 ||
          //   (values.lead?.lead_type === 'DSA' && values?.lead?.connector_code === '') ||
          //   (values.lead?.lead_type === 'connector' && values?.lead?.connector_code === '')
          //     ? setOpenQualifierNotActivePopup(true)
          //     : handleNextClick()
          // }
          onNextClick={() =>{

            if(validate_fields() == false) {
              setOpenQualifierNotActivePopup(true)
              return;
            }
            handleNextClick()

          }

          }
          onPreviousClick={() => setCurrentStepIndex(2)}
        />

        <SwipeableDrawerComponent />
      </div>

      {/* For Phase 2----------------------- */}

      {/* <DynamicDrawer open={openExistingPopup} setOpen={setOpenExistingPopup} height='80vh'>
        <div className='flex flex-col items-center h-full'>
          <span className='w-full font-semibold text-[14px] leading-[21px]'>
            This is an existing customer.
          </span>
          <div className='flex flex-col flex-1 w-full gap-[7px] overflow-auto mt-[10px] mb-[10px]'>
            <div className='flex justify-between w-full'>
              <span className='w-full text-[12px] text-[#727376]'>Profession</span>
              <span className='w-full text-[12px]'>
                {values?.applicants?.[activeIndex]?.applicant_details?.existing_customer_id_type}
              </span>
            </div>

            <div className='flex justify-between w-full'>
              <span className='w-full text-[12px] text-[#727376]'>Company name</span>
              <span className='w-full text-[12px]'>
                {values?.applicants?.[activeIndex]?.applicant_details?.existing_customer_id_number}
              </span>
            </div>

            <div className='flex justify-between w-full'>
              <span className='w-full text-[12px] text-[#727376]'>Total income</span>
              <span className='w-full text-[12px]'>
                {
                  values?.applicants?.[activeIndex]?.applicant_details
                    ?.existing_customer_selected_address_proof
                }
              </span>
            </div>

            <div className='flex justify-between w-full'>
              <span className='w-full text-[12px] text-[#727376]'>PF UAN</span>
              <span className='w-full text-[12px]'>
                {
                  values?.applicants?.[activeIndex]?.applicant_details
                    ?.existing_customer_address_proof_number
                }
              </span>
            </div>

            <div className='flex justify-between w-full'>
              <span className='w-full text-[12px] text-[#727376]'>No. of current loan(s)</span>
              <span className='w-full text-[12px]'>
                {values?.applicants?.[activeIndex]?.applicant_details?.existing_customer_first_name}
              </span>
            </div>
            <div className='flex justify-between w-full'>
              <span className='w-full text-[12px] text-[#727376]'>Ongoing EMI(s)</span>
              <span className='w-full text-[12px]'>
                {
                  values?.applicants?.[activeIndex]?.applicant_details
                    ?.existing_customer_middle_name
                }
              </span>
            </div>
            <div className='flex justify-between w-full'>
              <span className='w-full text-[12px] text-[#727376]'>Working since</span>
              <span className='w-full text-[12px]'>
                {values?.applicants?.[activeIndex]?.applicant_details?.existing_customer_last_name}
              </span>
            </div>
            <div className='flex justify-between w-full'>
              <span className='w-full text-[12px] text-[#727376]'>Mode of salary</span>
              <span className='w-full text-[12px]'>
                {values?.applicants?.[activeIndex]?.applicant_details?.existing_customer_gender}
              </span>
            </div>
            <div className='flex justify-between w-full'>
              <span className='w-full text-[12px] text-[#727376]'>Flat no/Building name</span>
              <span className='w-full text-[12px]'>
                {values?.applicants?.[activeIndex]?.personal_details?.date_of_birth}
              </span>
            </div>
            <div className='flex justify-between w-full'>
              <span className='w-full text-[12px] text-[#727376]'>Street/Area/Locality</span>
              <span className='w-full text-[12px]'>
                {values?.applicants?.[activeIndex]?.personal_details?.mobile_number}
              </span>
            </div>
            <div className='flex justify-between w-full'>
              <span className='w-full text-[12px] text-[#727376]'>Town</span>
              <span className='w-full text-[12px]'>
                {
                  values?.applicants?.[activeIndex]?.applicant_details
                    ?.existing_customer_father_husband_name
                }
              </span>
            </div>
            <div className='flex justify-between w-full'>
              <span className='w-full text-[12px] text-[#727376]'>Landmark</span>
              <span className='w-full text-[12px]'>
                {
                  values?.applicants?.[activeIndex]?.applicant_details
                    ?.existing_customer_mother_name
                }
              </span>
            </div>
            <div className='flex justify-between w-full'>
              <span className='w-full text-[12px] text-[#727376]'>Pincode</span>
              <span className='w-full text-[12px]'>
                {values?.applicants?.[activeIndex]?.personal_details?.marital_status}
              </span>
            </div>
            <div className='flex justify-between w-full'>
              <span className='w-full text-[12px] text-[#727376]'>City</span>
              <span className='w-full text-[12px]'>
                {values?.applicants?.[activeIndex]?.personal_details?.religion}
              </span>
            </div>
            <div className='flex justify-between w-full'>
              <span className='w-full text-[12px] text-[#727376]'>State</span>
              <span className='w-full text-[12px]'>
                {values?.applicants?.[activeIndex]?.personal_details?.preferred_language}
              </span>
            </div>
            <div className='flex justify-between w-full'>
              <span className='w-full text-[12px] text-[#727376]'>Total family members</span>
              <span className='w-full text-[12px]'>
                {values?.applicants?.[activeIndex]?.personal_details?.qualification}
              </span>
            </div>
            <div className='flex justify-between w-full'>
              <span className='w-full text-[12px] text-[#727376]'>Total household income</span>
              <span className='w-full text-[12px]'>
                {values?.applicants?.[activeIndex]?.personal_details?.email}
              </span>
            </div>
            <div className='flex justify-between w-full'>
              <span className='w-full text-[12px] text-[#727376]'>No. of dependents</span>
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
            <Button inputClasses='w-full h-[46px]' onClick={() => setOpenExistingPopup(false)}>
              No
            </Button>
            <Button primary={true} inputClasses=' w-full h-[46px]' onClick={handleAutofill}>
              Yes
            </Button>
          </div>
        </div>
      </DynamicDrawer> */}
       <DynamicDrawer
        open={openExistingPopup}
        setOpen={setOpenExistingPopup}
        onClose={() => {
        //  setClicked(false)
          setOpenExistingPopup(false)
        }
         
          } // Ensure onClose is defined
        height="80vh"
      >
   
        <div className='flex flex-col items-center h-full'>
          <span className='w-full font-semibold text-[14px] leading-[21px]'>
            Please complete mandatory below details to run Qualifier.
          </span>
          <div className='flex flex-col flex-1 w-full gap-[7px] overflow-auto mt-[10px] mb-[10px]'>
            {Object.entries(falseKeys).map(([category, keys]) => (
              <div key={category} className='mb-4'>
                <h3 className='font-bold text-lg'>{category}</h3>
                <div className='flex flex-col'>
                  {keys.length > 0 ? (
                    keys.map((key, index) => (
                      <div key={index} className='flex justify-between w-full p-3 bg-gray-100 rounded-md shadow-sm mb-1'>
                        <span className='text-[12px] font-bold text-[#727376]'>{key.replace(/_/g, ' ').toUpperCase()}</span>
                      </div>
                    ))
                  ) : (
                    <div className='flex justify-between w-full p-3 bg-gray-100 rounded-md shadow-sm mb-1'>
                      <span className='text-[12px] font-bold text-[#727376]'>ALL MANDATORY FIELDS ARE BLANK</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className='w-full flex gap-4 mt-6'>
            <Button inputClasses='w-full h-[46px]'  style={{color:'red'}} onClick={() => {
            // setClicked(false)
              setOpenExistingPopup(false)
            }}>
              Close
            </Button>
          </div>
        </div>
      </DynamicDrawer>

      <DynamicDrawer open={validPan} setOpen={setValidPan}>
        <div className='w-full flex flex-col'>
          <div className='flex justify-between items-center pb-2 md:pb-4 border-b border-lighter-grey'>
            <p className='font-semibold'>Pan Details</p>
            <button
              onClick={() => {
                setValidPan(false);
                // handleSelect(null);
              }}
            >
              <IconClose />
            </button>
          </div>
          <div className=''>
            <div
              style={{
                maxHeight: '200px',
              }}
              className='bg-white w-full overflow-y-auto'
            >
              <ul className='my-4'>
                {panErrors?.map((error, index) => (
                  <li key={index}>
                    <p>{error || ''}</p>
                  </li>
                ))}
              </ul>
              <p className='mb-3 font-semibold text-[#E33439] text-center'>
                Kindly fill the correct details....!
              </p>
            </div>
          </div>
          <div className='md:p-6 px-4 pb-4 md:border-t md:border-lighter-grey'>
            <Button
              // primary
              inputClasses='!py-3 md:ml-auto'
              onClick={() => {
                setValidPan(false);
                // handleSelect(null);
              }}
            >
              Back
            </Button>
          </div>
        </div>
      </DynamicDrawer>
      {loadingState && (
        <div className='ml-auto'>
          <img src={loading} alt='loading' className='animate-spin duration-300 ease-out' />
        </div>
        )
      }
    </>
  );
};

export default WorkIncomeDetails;
