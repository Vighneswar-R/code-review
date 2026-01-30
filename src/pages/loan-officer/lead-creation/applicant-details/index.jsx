import { useContext, useEffect } from 'react';
import { useState, useCallback } from 'react';
import { LeadContext } from '../../../../context/LeadContextProvider';
import otpVerified from '../../../../assets/icons/otp-verified.svg';
import {
  editFieldsById,
  isEighteenOrAbove,
  getMobileOtp,
  verifyMobileOtp,
  addApi,
  API_URL,
  lo_check,
  getDSA,
  getConnector,
  getLeadSource,
  getLeadById,
  applicantNextUpdate,
  getActiveLNT_API
} from '../../../../global/index';

import Radio from '../../../../components/Radio';

import {
  CardRadio,
  TextInput,
  DropDown,
  OtpInput,
  CurrencyInput,
  RangeSlider,
  Button,
} from '../../../../components';
import Popup from '../../../../components/Popup';
import { useNavigate } from 'react-router-dom';
import SearchableTextInput from '../../../../components/TextInput/SearchableTextInput';

import TextInputWithSendOtp from '../../../../components/TextInput/TextInputWithSendOtp';
import PreviousNextButtons from '../../../../components/PreviousNextButtons';
import DynamicDrawer from '../../../../components/SwipeableDrawer/DynamicDrawer';

import { useLocation } from 'react-router-dom';

import {
  loanTypeOptions,
  loanOptions,
  loanPurposeData,
  loanOptionsLap,
  loanPurposeDataLap,
} from './ApplicantDropDownData';
import { newCoApplicantValues } from '../../../../context/NewCoApplicant';
import { AuthContext } from '../../../../context/AuthContextProvider';
import Topbar from '../../../../components/Topbar';
import SwipeableDrawerComponent from '../../../../components/SwipeableDrawer/LeadDrawer';
import DatePicker2 from '../../../../components/DatePicker/DatePicker2';
import moment from 'moment';
import axios from 'axios';
import Loader from '../../../../components/Loader'
import ErrorTost from '../../../../components/ToastMessage/ErrorTost';


import { Checkbox } from '@mui/material';
const ApplicantDetails = () => {
  const {
    inputDisabled,
    values,
    handleBlur,
    errors,
    touched,
    setFieldValue,
    setFieldError,
    updateProgressApplicantSteps,
    setToastMessage,
    setFieldTouched,
    activeIndex,
    setCurrentStepIndex,
    removeCoApplicant,
    coApplicantDrawerUpdate,
    tempQualifier,
    updateParams,
    tempQualifierCoApplicant,
    setActiveLNT,
    load,
    setLoad,
    idTypeOCRStatus,
    ekycIDStatus
  } = useContext(LeadContext);

  const { setOtpFailCount, phoneNumberList, setPhoneNumberList } = useContext(AuthContext);

  const { loData } = useContext(AuthContext);

  const { token } = useContext(AuthContext);

  const location =  useLocation()


  const navigate = useNavigate()

  const [openExistingPopup, setOpenExistingPopup] = useState(false);
  const [disableCheckBox, setDisableCheckBox] = useState(false);
  const [hasSentOTPOnce, setHasSentOTPOnce] = useState(false);
  const [disablePhoneNumber, setDisablePhoneNumber] = useState(false);
  const [openQualifierNotActivePopup, setOpenQualifierNotActivePopup] = useState(false);
  const handleCloseQualifierNotActivePopup = () => {
    setOpenQualifierNotActivePopup(false);
  };
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [verifiedOnce, setVerifiedOnce] = useState(false);
  const [lo, setLo] = useState(false);
  const [loanFields, setLoanFields] = useState(loanOptions);
  const [loanPurposeOptions, setLoanPurposeOptions] = useState(loanPurposeData);
  const [dsaOptions, setDsaOptions] = useState([]);
  const [connectorOptions, setConnectorOptions] = useState([]);
  const [leadSourceOptions, setLeadSourceOptions] = useState([]);
  const [pageLoader, setPageLoader] = useState(false);
  const overRideEKyc = (values?.applicants?.[activeIndex]?.personal_details?.id_type === 'PAN'&&idTypeOCRStatus) ? false : true;


  useEffect(()=> {     // property type auto population issue

    let primary_applicant = values?.applicants?.[activeIndex]?.applicant_details?.is_primary;

    if(!primary_applicant || primary_applicant == false) {

      if(!values?.lead?.property_type || values?.lead?.property_type == undefined) {
        setPageLoader(true)
      }

      else {
        setPageLoader(false)
      }

    }

  },[values?.lead?.property_type]);



  const onHandlePropertyRadio = async (e) => {

    const value = e || null;

    try{


    const updatedOwner = await editFieldsById(
        values?.applicants?.[activeIndex]?.applicant_details?.id,
        'applicant',
        {is_property_owner:value},
        {
          headers: {
            Authorization: token,
          },
        },
      );

      setFieldValue(`applicants[${activeIndex}].applicant_details.is_property_owner`, value);

      setRequiredFieldsStatus((prev)=>{
        return {...prev,is_property_owner:true}
      })

    }

    catch(err){
      console.log("ERROR UPDATING PROPERTY OWNER",err)
    }
  }

  


  
  async function selected_LNT() {



    try{
      const selected_lnt =  await getActiveLNT_API({
        headers: {
          Authorization: token,
        },
      })

      console.log(" I AM THE SELECTED LNT",JSON.parse(selected_lnt?.type))

      // setSelectedLNT(JSON.parse(selected_lnt?.type))

      setActiveLNT(JSON.parse(selected_lnt?.type))  //**NEW CHANGE */
    
  
    }

    catch(err) {
      console.log("ERROR HERE",err)
      // setSelectedLNT("any")

    }


  }

  useEffect(()=>{
    selected_LNT()
  },[])    // for fresh leads pull up the active LNT HERE



  useEffect(() => {
    const getDsaList = async () => {
      try {
        const data = await getDSA(loData?.user?.id,{
          headers: {
            Authorization: token,
          },
        });

        if (!data) return;

        const new_data = data.map((obj) => {
          return { label: obj.name, value: obj.name, id: obj.name };
        });

        setDsaOptions(new_data);
      } catch (err) {
        console.log(err);
      }
    };
    getDsaList();
  }, []);


  
  useEffect(() => {
    const getConnectorList = async () => {
      try {
        const data = await getConnector(loData?.user?.id,{
          headers: {
            Authorization: token,
          },
        });

        if (!data) return;

        const new_data = data.map((obj) => {
          return { label: obj.name, value: obj.name, id: obj.name };
        });

        setConnectorOptions(new_data);
      } catch (err) {
        console.log(err);
      }
    };
    getConnectorList();
  }, []);



  useEffect(() => {
    const getLeadSourceList = async () => {
      try {
        const data = await getLeadSource({
          headers: {
            Authorization: token,
          },
        });

        if (!data) return;

        const new_data = data.map((obj) => {
          return { label: obj.name, value: obj.name, id: obj.name };
        });

        setLeadSourceOptions(new_data);
      } catch (err) {
        console.log(err);
      }
    };
    getLeadSourceList();     // need old
  }, []);
   


  const [requiredFieldsStatus, setRequiredFieldsStatus] = useState({
    ...values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.required_fields_status,
  });


  useEffect(()=> {    // adding lead type to the mandate fields

    let current_lead_type = values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.required_fields_status?.lead_type;


    setRequiredFieldsStatus({...values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.required_fields_status,lead_type:current_lead_type?current_lead_type:false})


    console.log("VALUE",values)

  },[])



  const [date, setDate] = useState(null);
  const [dateError, setDateError] = useState(['', '', '', '', '']);

  const onDatePickerBlur = (e) => {
    let date = moment(e.target.value, 'DD/MM/YYYY').format('YYYY-MM-DD');
    checkDate(date);
  };

  const [Connector_Code, setConnector_code] = useState("");

  useEffect(() => {
    if (values?.applicants?.[activeIndex]?.applicant_details?.date_of_birth?.length) {
      var dateParts =
        values?.applicants?.[activeIndex]?.applicant_details?.date_of_birth.split('-');
      var day = parseInt(dateParts[2], 10);
      var month = parseInt(dateParts[1], 10);
      var year = parseInt(dateParts[0], 10);
      setDate(`${day}/${month}/${year}`);
    }
  }, [values?.applicants?.[activeIndex]?.applicant_details.date_of_birth]);

  useEffect(() => {
    if (values?.applicants?.[activeIndex]?.applicant_details?.date_of_birth?.length) {
      var dateParts =
        values?.applicants?.[activeIndex]?.applicant_details?.date_of_birth.split('-');
      var day = parseInt(dateParts[2], 10);
      var month = parseInt(dateParts[1], 10);
      var year = parseInt(dateParts[0], 10);
      setDate(`${day}/${month}/${year}`);
    } else {
      setDate(null);
    }
  }, [activeIndex]);

  const updateFieldsApplicant = async (name, value) => {
    let newData = {};
    newData[name] = value;

    if (values?.applicants?.[activeIndex]?.applicant_details?.id) {
      const res = await editFieldsById(
        values?.applicants?.[activeIndex]?.applicant_details?.id,
        'applicant',
        newData,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      return res;
    } else {
      await addApi('applicant', values?.applicants?.[activeIndex]?.applicant_details, {
        headers: {
          Authorization: token,
        },
      })
        .then((res) => {
          setFieldValue(`applicants[${activeIndex}].applicant_details.id`, res.id);
          // return res;
        })
        .catch((err) => {
          console.log(err);
          // return err;
        });
    }
  };

  const updateFieldsLead = async (name, value) => {
    if (values?.applicants?.[activeIndex]?.applicant_details?.is_primary) {
      if (values?.lead?.id) {
        let newData = {};
        newData[name] = value;
        newData.lo_id = loData.session.user_id;
        const res = await editFieldsById(values?.lead?.id, 'lead', newData, {
          headers: {
            Authorization: token,
          },
        });
        return res;
      } else {
        let newData = { ...values?.lead };
        newData[name] = value;
        newData.lo_id = loData.session.user_id;

        // if necessary can add the name condition here ** but queries exists
        await addApi('lead', newData, {
          headers: {
            Authorization: token,
          },
        },loData?.user?.id)
          .then((res) => {
            setFieldValue('lead.id', res.id);
            return res;
          })
          .catch((err) => {
            return err;
          });
      }
    }
  };

    // handle next click
    const handleNextClick = async () => {
      //debugger

      try {
      const res = await applicantNextUpdate(
        values?.applicants?.[activeIndex]?.applicant_details?.id,
        'applicant',
        {},
        {
            headers: {
                Authorization: token,
            },
        }
    );
   console.log('res in applicant',res)
    // Adjust condition based on your API response structure
      if (res) {
        setCurrentStepIndex(1);
        navigate("/lead/personal-details");
      } else {
        setOpenQualifierNotActivePopup(true);
      }
    } catch (error) {
      console.error("Error in applicantNextUpdate:", error);
      setOpenQualifierNotActivePopup(true); // show popup on error
    } finally {
    }
    }

  useEffect(() => {
    updateProgressApplicantSteps('applicant_details', requiredFieldsStatus, 'applicant');
  }, [requiredFieldsStatus]);

  const onLoanTypeChange = useCallback(
    (e) => {
      setFieldValue(e.name, e.value);
      const name = e.name.split('.')[1];
      updateFieldsLead(name, e.value);

      if (values.lead?.purpose_of_loan) {
        setFieldValue('lead.purpose_of_loan', '');
        updateFieldsLead('purpose_of_loan', '');
      }

      if (values?.lead.loan_type) {
        setFieldValue('lead.property_type', '');
        updateFieldsLead('property_type', '');
      }

      if (requiredFieldsStatus[name] !== undefined) {
        setRequiredFieldsStatus((prev) => ({
          ...prev,
          [name]: true,
          purpose_of_loan: false,
          property_type: false,
        }));
      }
    },
    [requiredFieldsStatus, values],
  );

  // DSA Connector Code Changes
  /*const onConnectorCodeChange = useCallback(
    (e) => {

     console.log('value',e)
     setFieldValue('connector_code', e.target.value);
     setConnector_code(e.target.value);
     console.log('Connector Code',Connector_Code)
    updateFieldsLead('connector_code', e.target.value);
    },
    [requiredFieldsStatus, values],
  );*/

  const onConnectorCodeChange = useCallback(
    (value, name) => {
      console.log('Active Index:', activeIndex);
        console.log('Applicants:', values?.applicants);
        console.log('Connector Code:', values?.applicants?.[activeIndex]?.connector_code?.id);
        setFieldValue('lead.connector_code', name.value);
        setConnector_code(name.value);
        console.log('Connector Code',Connector_Code)
       updateFieldsLead('connector_code',name.value);
     
      const new_name = name;

      editFieldsById(
        values?.applicants?.[activeIndex]?.connector_code?.id,
        'connector_code',
        {
          [new_name]: name.value,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );

      if ( requiredFieldsStatus['connector_code']!== undefined && !requiredFieldsStatus['connector_code']  )
       {
        setRequiredFieldsStatus((prev) => ({ ...prev, ['value']: true }));
      }
      
    },
    [requiredFieldsStatus, values],
  );

  
    

  const handleFirstNameChange = useCallback(
    (e) => {
      let value = e.currentTarget.value;
      value = value.trimStart().replace(/\s\s+/g, ' ');
      const pattern = /^[A-Za-z][A-Za-z\s]*$/;
      if (pattern.exec(value)) {
        setFieldValue(e.currentTarget.name, value.charAt(0).toUpperCase() + value.slice(1).toUpperCase());
      }

      if (values?.applicants?.[activeIndex]?.applicant_details?.first_name.length > value) {
        setFieldValue(e.currentTarget.name, value.toUpperCase() + value.slice(1).toUpperCase());
      }
    },
    [activeIndex, setFieldValue, values?.applicants],
  );

  const handleTextInputChange = useCallback(
    (e) => {
      const value = e.currentTarget.value;
      const pattern = /[^a-zA-Z]+/;
      if (pattern.test(value)) return;
      setFieldValue(e.currentTarget.name, value.charAt(0).toUpperCase() + value.slice(1).toUpperCase());
      const name = e.currentTarget.name.split('.')[2];
      if (
        requiredFieldsStatus[name] !== undefined &&
        !requiredFieldsStatus[name] &&
        value.length > 1
      ) {
        setRequiredFieldsStatus((prev) => ({ ...prev, [name]: true }));
      }
    },
    [requiredFieldsStatus],
  );

  const handleLoanPurposeChange = useCallback(
    (value) => {
      setFieldValue('lead.purpose_of_loan', value);
      updateFieldsLead('purpose_of_loan', value);
      if (
        requiredFieldsStatus['purpose_of_loan'] !== undefined &&
        !requiredFieldsStatus['purpose_of_loan']
      ) {
        setRequiredFieldsStatus((prev) => ({ ...prev, ['purpose_of_loan']: true }));
      }
    },
    [requiredFieldsStatus, values],
  );

  const handlePropertyType = useCallback(
    (value) => {
      setFieldValue('lead.property_type', value);
      updateFieldsLead('property_type', value);
      if (
        requiredFieldsStatus['property_type'] !== undefined &&
        !requiredFieldsStatus['property_type']
      ) {
        setRequiredFieldsStatus((prev) => ({ ...prev, ['property_type']: true }));
      }
    },
    [requiredFieldsStatus, values],
  );

  const handleOnPhoneNumberChange = useCallback(
    async (e) => {
      setLo(true);  
      const phoneNumber = e.currentTarget.value;

      const pattern = /[^\d]/g;
      if (pattern.test(phoneNumber)) {
        e.preventDefault();
        return;
      }

      if (phoneNumber < 0) {
        e.preventDefault();
        return;
      }

      if (phoneNumber.length > 10) {
        return;
      }

      if(phoneNumber.length === 10){
        test1(phoneNumber)
        .then((lo_identified) => {
          console.log("lo_identified->", lo_identified);
              // Check the value and set an error if needed
          if (lo_identified === "User found") {
      
      setFieldError(
        `applicants[${activeIndex}].applicant_details.mobile_number`,
        'LO login not allowed',
      );
     setHasSentOTPOnce(true); //added for LO Number Validation
     setLo(true);
    }else{
      setLo(false);
    }
        }) 
      }

      if (
        phoneNumber.charAt(0) === '0' ||
        phoneNumber.charAt(0) === '1' ||
        phoneNumber.charAt(0) === '2' ||
        phoneNumber.charAt(0) === '3' ||
        phoneNumber.charAt(0) === '4' ||
        phoneNumber.charAt(0) === '5'
      ) {
        e.preventDefault();
        return;
      }

      setShowOTPInput(false);

      setFieldValue(`applicants[${activeIndex}].applicant_details.mobile_number`, phoneNumber);

      if (phoneNumber.length === 10) {
        setHasSentOTPOnce(false);
        updateFieldsApplicant('mobile_number', phoneNumber);
        if (values?.applicants?.[activeIndex]?.applicant_details?.id) {
          await editFieldsById(
            values?.applicants?.[activeIndex]?.applicant_details?.id,
            'applicant',
            {
              otp: null,
              otp_send_on: null,
              otp_fail_count: 0,
              otp_fail_release: null,
            },
            {
              headers: {
                Authorization: token,
              },
            },
          );
        }
      }
    },
    [requiredFieldsStatus, values],
  );

  const handleLoanAmountChange = useCallback(
    (e) => {
      // loan amount should be within 1L and 50L

      if(e.currentTarget.value > 7500000) {
        return
      }
      setFieldValue('lead.applied_amount', e.currentTarget.value);
      updateFieldsLead('applied_amount', e.currentTarget.value);
      if (100000 <= e.currentTarget.value && e.currentTarget.value <= 7500000) {
        setRequiredFieldsStatus((prev) => ({ ...prev, ['applied_amount']: true }));
      } else {
        setRequiredFieldsStatus((prev) => ({ ...prev, ['applied_amount']: false }));
      }
    },
    [requiredFieldsStatus, values, errors?.lead?.applied_amount],
  );

  const checkDate = async (date) => {
    if (!date) {
      return;
    }

    const finalDate = date;
    let checkDate = date.toString();
    checkDate = checkDate.toUpperCase();

    if (checkDate === 'INVALID DATE') {
      setDateError((prev) => {
        const newErrors = [...prev];
        newErrors[activeIndex] = 'Please enter a valid date';
        return newErrors;
      });

      setFieldValue(`applicants[${activeIndex}].applicant_details.date_of_birth`, '');
      setFieldTouched(`applicants[${activeIndex}].applicant_details.date_of_birth`);
    } else if (isEighteenOrAbove(finalDate)) {
      setDateError((prev) => {
        const newErrors = [...prev];
        newErrors[activeIndex] = '';
        return newErrors;
      });
      setFieldValue(`applicants[${activeIndex}].applicant_details.date_of_birth`, finalDate);
      updateFieldsApplicant('date_of_birth', finalDate);
      if (
        requiredFieldsStatus['date_of_birth'] !== undefined &&
        !requiredFieldsStatus['date_of_birth']
      ) {
        setRequiredFieldsStatus((prev) => ({ ...prev, ['date_of_birth']: true }));
      }
      if (values?.applicants?.[activeIndex]?.personal_details?.id) {
        const required_fields =
          values?.applicants?.[activeIndex]?.personal_details?.extra_params.required_fields_status;

        const edited_required_fields = {
          ...required_fields,
          date_of_birth: true,
        };

        const edited_extra_params = {
          ...values?.applicants?.[activeIndex]?.personal_details?.extra_params,
          required_fields_status: edited_required_fields,
        };

        setFieldValue(
          `applicants[${activeIndex}].personal_details.extra_params`,
          edited_extra_params,
        );

        await editFieldsById(
          values?.applicants[activeIndex]?.personal_details?.id,
          'personal',
          {
            date_of_birth: finalDate,
            extra_params: edited_extra_params,
          },
          {
            headers: {
              Authorization: token,
            },
          },
        );
      }
    } else {
      // setDateError((prev) => {
      //   const newErrors = [...prev];
      //   newErrors[activeIndex] = 'Date of Birth is Required. Minimum age must be 18 or 18+';
      //   return newErrors;
      // });
      setDateError((prev) => {
        const newErrors = [...prev];
        newErrors[activeIndex] = 'Date of Birth is Required. Minimum age must be between 18 and 80';
        return newErrors;
      });
      setFieldValue(`applicants[${activeIndex}].applicant_details.date_of_birth`, '');
      setFieldTouched(`applicants[${activeIndex}].applicant_details.date_of_birth`);
      await editFieldsById(
        values?.applicants[activeIndex]?.applicant_details?.id,
        'applicant',
        {
          date_of_birth: '',
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      setRequiredFieldsStatus((prev) => ({ ...prev, ['date_of_birth']: false }));
    }
  };

  const sendMobileOtp = async () => {
    if (values?.applicants?.[activeIndex]?.applicant_details?.date_of_birth && values?.applicants?.[activeIndex]?.applicant_details?.first_name) {
      // await updateFieldsApplicant().then(async () => {
      // setDisablePhoneNumber((prev) => !prev);

      // additionally check if the mobile number is available for any other applicants or not **

      let ifFound = false;

      values?.applicants?.forEach((app,index)=>{
        const mobile = app?.applicant_details?.mobile_number;

        if(mobile === values?.applicants?.[activeIndex]?.applicant_details?.mobile_number && index !== activeIndex){
          ifFound = true;
        }
      });

      if(ifFound === true){
setFieldError(
        `applicants[${activeIndex}].applicant_details.mobile_number`,
        'Phone number must be unique',
      ); 
    
      return;
    }

      await getMobileOtp(values.applicants[activeIndex]?.applicant_details?.id, {
        headers: {
          Authorization: token,
        },
      }).then(async (res) => {
        setShowOTPInput(true);
        setHasSentOTPOnce(true);
        // setToastMessage('OTP has been sent to your mail id');

        let verify_url = res?.data?.Verify_Api

        await axios
          .post(
            `${API_URL}/applicant/existing-customer/${values?.applicants?.[activeIndex]?.applicant_details?.id}`,
            {},
            {
              headers: {
                Authorization: token,
              },
            },
          )
          .then(({ data }) => {
            const body = data?.body;
            if (
              body &&
              body?.length !== 0 &&
              body?.[0]?.existing_customer_is_existing_customer?.toUpperCase() === 'TRUE'
            ) {
              const { existing_customer_is_existing_customer } = body[0];
              if (
                existing_customer_is_existing_customer &&
                existing_customer_is_existing_customer?.toUpperCase() === 'FALSE'
              ) {

                let newParams = {...values?.applicants?.[activeIndex]?.applicant_details?.extra_params,
                  is_existing: false
                }
                editFieldsById(
                  values?.applicants?.[activeIndex]?.applicant_details?.id,
                  'applicant',
                  {
                    extra_params: {
                   ...newParams,otp_api:verify_url || ""
                    },
                  },
                  {
                    headers: {
                      Authorization: token,
                    },
                  },
                );
                setFieldValue(
                  `applicants[${activeIndex}].applicant_details.extra_params.is_existing`,
                  false,
                );
                return;
              }

              const { existing_customer_loan_type, ...dataWithoutLoanType } = body[0];
              setFieldValue(`applicants[${activeIndex}].applicant_details`, {
                ...values?.applicants?.[activeIndex]?.applicant_details,
                ...dataWithoutLoanType,
              });
              editFieldsById(
                values?.applicants?.[activeIndex]?.applicant_details?.id,
                'applicant',
                {
                  ...dataWithoutLoanType,
                  extra_params: {
                    ...values?.applicants?.[activeIndex]?.applicant_details?.extra_params,
                    is_existing: true,
                  },
                },
                {
                  headers: {
                    Authorization: token,
                  },
                },
              );
              setFieldValue(
                `applicants[${activeIndex}].applicant_details.extra_params.is_existing`,
                true,
              );
            } else {

              let updatedParams = {
                ...values?.applicants?.[activeIndex]?.applicant_details?.extra_params,
                is_existing: false,
              }
              editFieldsById(
                values?.applicants?.[activeIndex]?.applicant_details?.id,
                'applicant',
                {
                  extra_params: {
                    ...updatedParams,otp_api:res?.data?.Verify_Api,
                  },
                },
                {
                  headers: {
                    Authorization: token,
                  },
                },
              );

              setFieldValue(
                `applicants[${activeIndex}].applicant_details.extra_params`,{...updatedParams,otp_api:res?.data?.Verify_Api}
              );
            }
          })
          .catch((err) => {
            console.log('Existing customer api error', err);
            editFieldsById(
              values?.applicants?.[activeIndex]?.applicant_details?.id,
              'applicant',
              {
                extra_params: {
                  ...values?.applicants?.[activeIndex]?.applicant_details?.extra_params,
                  is_existing: false,
                },
              },
              {
                headers: {
                  Authorization: token,
                },
              },
            );
            setFieldValue(
              `applicants[${activeIndex}].applicant_details.extra_params.is_existing`,
              false,
            );
          });
      });
      // });
    } else {

      if(!values?.applicants?.[activeIndex]?.applicant_details?.date_of_birth) {
        setDateError((prev) => {
          const newErrors = [...prev];
  
         
            newErrors[activeIndex] = 'Date of Birth is Required. Minimum age must be 18 or 18+';
            return newErrors;
          
          //values?.applicants?.[activeIndex]?.applicant_details?.date_of_birth && values?.applicants?.[activeIndex]?.applicant_details?.name
          
        });

        setFieldTouched(`applicants[${activeIndex}].applicant_details.date_of_birth`);

      }

      else {
        setFieldTouched(`applicants[${activeIndex}].applicant_details.first_name`)  //**working here */ 2
      }
          // datePickerInputRef.current.focus();
    }
  };

  const verifyOTP = async (otp) => {
    verifyMobileOtp(values.applicants[activeIndex]?.applicant_details?.id, otp, {
      headers: {
        Authorization: token,
      },
    })
      .then(async (res) => {
       // debugger;
        if (values?.lead?.id) {
          setFieldValue(`applicants[${activeIndex}].applicant_details.lead_id`, values?.lead?.id);
          updateFieldsApplicant('lead_id', values?.lead?.id);
        } else {
          await updateFieldsLead().then((res) => {
            setFieldValue(`applicants[${activeIndex}].applicant_details.lead_id`, res.id);
            updateFieldsApplicant('lead_id', res.id);
          });
        }
        setFieldValue(`applicants[${activeIndex}].applicant_details.is_mobile_verified`, true);
        updateFieldsApplicant('is_mobile_verified', true);
	setRequiredFieldsStatus((prev) => ({ ...prev, ['mobile_number']: true }));
        setShowOTPInput(false);
        console.log( requiredFieldsStatus['mobile_number'])
        if (
          requiredFieldsStatus['mobile_number'] !== undefined &&
          !requiredFieldsStatus['mobile_number']
        ) {
          setRequiredFieldsStatus((prev) => ({ ...prev, ['mobile_number']: true }));
        }
        return true;
      })
      .catch((err) => {
        setFieldValue(`applicants[${activeIndex}].applicant_details.is_mobile_verified`, false);
        setShowOTPInput(true);
        setVerifiedOnce(true);
        console.log(err)
      //  setOtpFailCount(err.response.data.fail_count);
        return false;
      });
  };

  useEffect(() => {
    async function addAddressAndWorkIncomeDetails() {
      //add address details
      if (!values?.applicants?.[activeIndex]?.address_detail?.id) {
        let clonedCoApplicantValues = structuredClone(newCoApplicantValues);
        let addData = { ...clonedCoApplicantValues.address_detail };

        await addApi(
          'address',
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
            setFieldValue(`applicants[${activeIndex}].address_detail`, {
              ...addData,
              applicant_id: values?.applicants?.[activeIndex]?.applicant_details?.id,
              id: res.id,
            });

            await editFieldsById(
              values?.applicants[activeIndex]?.applicant_details?.id,
              'applicant',
              { address_detail: res.id },
              {
                headers: {
                  Authorization: token,
                },
              },
            ).then(() => {
              return res;
            });
          })
          .catch((err) => {
            console.log(err);
            return err;
          });
      }

      //add work income details
      if (!values?.applicants?.[activeIndex]?.work_income_detail?.id) {  // testing add !
        const newData = structuredClone(values);

        newData.applicants[activeIndex].work_income_detail = {
          ...newData.applicants[activeIndex].work_income_detail,
          applicant_id: values?.applicants?.[activeIndex]?.applicant_details?.id,
          profession: '',
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
            progress: 0,
            required_fields_status: {
              profession: false,
              pan_number: false,
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
            },
          },
        };

        await addApi('work-income', newData.applicants[activeIndex].work_income_detail, {
          headers: {
            Authorization: token,
          },
        })
          .then(async (res) => {
            setFieldValue(
              `applicants[${activeIndex}].work_income_detail`,
              newData.applicants[activeIndex].work_income_detail,
            );

            setFieldValue(`applicants[${activeIndex}].work_income_detail`, {
              ...newData.applicants[activeIndex].work_income_detail,
              id: res.id,
            });

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

            return res;
          })
          .catch((err) => {
            console.log(err);
            return err;
          });
      }
    }
    if (values?.applicants?.[activeIndex]?.applicant_details?.is_mobile_verified) {
      addAddressAndWorkIncomeDetails();
    }
  }, [values?.applicants?.[activeIndex]?.applicant_details?.is_mobile_verified]);

  useEffect(() => {
    setRequiredFieldsStatus(
      values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.required_fields_status,
    );
  }, [activeIndex]);
  const test1 = async (mobile_number) => {
    const data = {'mobile_number': mobile_number}
    const result = await lo_check(data);
    //const locheck=result["message"].toString(); 
    console.log("lo_check", result["message"]);
    return result["message"];
  }
  //test1();
  // For unique phone numbers
  useEffect(() => {
    const _phoneNumberList = Object.assign({}, phoneNumberList);
    if (_phoneNumberList?.[`applicant_${activeIndex}`]) {
      delete _phoneNumberList?.[[`applicant_${activeIndex}`]];
    }

    if (
      values?.applicants?.[activeIndex]?.applicant_details?.mobile_number &&
      _phoneNumberList &&
      Object.values(_phoneNumberList)?.includes(
        values?.applicants?.[activeIndex]?.applicant_details?.mobile_number,
      )
    ) {
      setFieldError(
        `applicants[${activeIndex}].applicant_details.mobile_number`,
        'Phone number must be unique',
      );
      console.log("DID NOTHING")
    } else {
      setPhoneNumberList((prev) => {
        return {
          ...prev,
          [`applicant_${activeIndex}`]:
            values?.applicants?.[activeIndex]?.applicant_details?.mobile_number,
        };
      });
    }
  }, [
    values?.applicants?.[activeIndex]?.applicant_details,
    errors?.applicants?.[activeIndex]?.applicant_details,
  ]);

  const handleBack = () => {
    if (!values?.applicants?.[activeIndex]?.applicant_details?.is_mobile_verified) {
      removeCoApplicant(activeIndex);
    }
  };


  useEffect(()=> {
console.log("VALUEEE",values)
  },[values])

 // Added whatapp checkbox
  const WhatsAppCheckbox = (value) => {
    console.log(value);
    const name = "whatsApp";

      setFieldValue(
        `applicants[${activeIndex}].applicant_details.whatsApp`,
        value,
      );
    updateFieldsApplicant(
      name,
      value,
    );
  }

  // handle lead type dropdown for DSA connector
  const handleLeadType = useCallback(
    (value) => {

     if(value == 'BM' || value == 'LO') {     // safe access where BM cannot select LO and LO cannot select BM


      let splitted_role = loData?.user?.role?.split(' ')

      let joined_role = splitted_role[0][0] + splitted_role[1][0]
      

      if(value !== joined_role) {
        setRequiredFieldsStatus((prev) => ({ ...prev, ['lead_type']: false }));
        setFieldValue('lead.lead_type', value);
        updateFieldsLead('lead_type', value);
      }

      else {
      setFieldValue('lead.lead_type', value);
      updateFieldsLead('lead_type', value);
      if (
        requiredFieldsStatus['lead_type'] !== undefined &&
        !requiredFieldsStatus['lead_type']
      ) {
        setRequiredFieldsStatus((prev) => ({ ...prev, ['lead_type']: true }));
      }
      }
     }
//For other cases the else condition will be executed
     else {
      setFieldValue('lead.lead_type', value);
      updateFieldsLead('lead_type', value);
      if (
        requiredFieldsStatus['lead_type'] !== undefined &&
        !requiredFieldsStatus['lead_type']
      ) {
        setRequiredFieldsStatus((prev) => ({ ...prev, ['lead_type']: true }));
      }
     }
    
    },
    [requiredFieldsStatus, values],
  );


console.log('values.lead?',values.lead)
  return (
    <>
    
    {pageLoader?<Loader/>:<div>
              <Popup
        handleClose={handleCloseQualifierNotActivePopup}
        open={openQualifierNotActivePopup}
        setOpen={setOpenQualifierNotActivePopup}
        title='Applicant details are not completed'
        description='Please Complete Applicant details to proceed further'
      />
      <div className='overflow-hidden flex flex-col h-[100vh] justify-between'>
        {values?.applicants?.[activeIndex]?.applicant_details?.is_primary ? (
          <Topbar title='Lead Creation' id={values?.lead?.id} showClose={true} />
        ) : (
          <Topbar
            title='Adding Co-applicant'
            id={values?.lead?.id}
            showClose={true}
            showBack={true}
            coApplicant={true}
            handleBack={handleBack}
            coApplicantName={values?.applicants?.[activeIndex]?.applicant_details?.first_name}
          />
        )}
        <div
          className={`flex flex-col bg-medium-grey gap-2 overflow-auto max-[480px]:no-scrollbar p-[20px] pb-[150px] flex-1`}
        >
          <div className='flex flex-col gap-2'>
            <label htmlFor='loan-purpose' className='flex gap-0.5 font-medium text-primary-black'>
              Loan Type <span className='text-primary-red text-xs'>*</span>
            </label>
            <div
              className={`flex gap-4 w-full ${
                inputDisabled ? 'pointer-events-none cursor-not-allowed' : 'pointer-events-auto'
              }`}
            >
              {loanTypeOptions.map((data, index) => (
                <CardRadio
                  key={index}
                  name='lead.loan_type'
                  label={data.label}
                  value={data.value}
                  current={values.lead?.loan_type}
                  onChange={onLoanTypeChange}
                  containerClasses='flex-1'
                  disabled={
                    !values?.applicants?.[activeIndex]?.applicant_details?.is_primary ||
                    values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier || (values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
                    || values?.lt_charges?.filter((paid)=>paid?.status)?.length
                  }
                >
                  {data.icon}
                </CardRadio>
              ))}
            </div>
          </div>

          <CurrencyInput
            label='Required loan amount'
            placeholder='5,00,000'
            required
            name='lead.applied_amount'
            value={values.lead?.applied_amount}
            onBlur={handleBlur}
            onChange={handleLoanAmountChange}
            displayError={false}
            disabled={
              !values?.applicants?.[activeIndex]?.applicant_details?.is_primary ||
              values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier || (values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
            }
            inputClasses='font-semibold'
          />

          <RangeSlider
            minValueLabel='1 L'
            maxValueLabel='75 L'
            onChange={handleLoanAmountChange}
            initialValue={values.lead?.applied_amount}
            min={100000}
            max={7500000}
            disabled={
              !values?.applicants?.[activeIndex]?.applicant_details?.is_primary ||
              values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier ||(values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
            }
            step={50000}
          />

          {errors?.lead?.applied_amount && touched?.lead?.applied_amount ? (
            <span className='text-xs text-primary-red'>{errors?.lead?.applied_amount}</span>
          ) : null}
          <p>Name as per PAN</p>
          <TextInput
            label='First Name'
            placeholder='Eg: Suresh, Priya'
            required
            name={`applicants[${activeIndex}].applicant_details.first_name`}
            value={values.applicants?.[activeIndex]?.applicant_details?.first_name || ''}
            error={errors?.applicants?.[activeIndex]?.applicant_details?.first_name}
            touched={
              touched?.applicants && touched?.applicants[activeIndex]?.applicant_details?.first_name
            }
            onBlur={async (e) => {
              handleBlur(e);
              coApplicantDrawerUpdate(values?.applicants);
              const name = e.currentTarget.name.split('.')[2];
              if (
                !errors?.applicants[activeIndex]?.applicant_details?.[name] &&
                values?.applicants?.[activeIndex]?.applicant_details?.[name]
              ) {
                updateFieldsApplicant(
                  name,
                  values.applicants[activeIndex]?.applicant_details?.[name],
                );
                if (requiredFieldsStatus[name] !== undefined && !requiredFieldsStatus[name]) {
                  setRequiredFieldsStatus((prev) => ({ ...prev, [name]: true }));
                }

                if (values?.applicants?.[activeIndex]?.personal_details?.id) {
                  const res = await editFieldsById(
                    values?.applicants[activeIndex]?.personal_details?.id,
                    'personal',
                    {
                      first_name: values?.applicants?.[activeIndex]?.applicant_details?.first_name,
                    },
                    {
                      headers: {
                        Authorization: token,
                      },
                    },
                  );
                }
              } else {
                if (requiredFieldsStatus[name] !== undefined) {
                  setRequiredFieldsStatus((prev) => ({ ...prev, [name]: false }));
                }
                updateFieldsApplicant(name, '');

                if (values?.applicants?.[activeIndex]?.personal_details?.id) {
                  const res = await editFieldsById(
                    values?.applicants[activeIndex]?.personal_details?.id,
                    'personal',
                    {
                      first_name: '',
                    },
                    {
                      headers: {
                        Authorization: token,
                      },
                    },
                  );
                }
              }
            }}
            disabled={
              inputDisabled ||
              values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier ||
             ( values?.applicants[activeIndex]?.applicant_details?.is_ekyc_verified&&overRideEKyc) || (values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
            }
            onChange={handleFirstNameChange}
            inputClasses='capitalize'
          />

          <TextInput
            label='Middle Name'
            placeholder='Eg: Ramji, Sreenath'
            name={`applicants[${activeIndex}].applicant_details.middle_name`}
            value={values?.applicants?.[activeIndex]?.applicant_details?.middle_name || ''}
            error={errors?.applicants?.[activeIndex]?.applicant_details?.middle_name}
            touched={
              touched.applicants && touched?.applicants[activeIndex]?.applicant_details?.middle_name
            }
           disabled={
              inputDisabled ||
              values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier ||
             ( values?.applicants[activeIndex]?.applicant_details?.is_ekyc_verified&&overRideEKyc) || (values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
            }
            onBlur={async (e) => {
              handleBlur(e);
              const name = e.currentTarget.name.split('.')[2];
              if (!errors?.applicants[activeIndex]?.applicant_details?.[name]) {
                updateFieldsApplicant(
                  name,
                  values.applicants[activeIndex]?.applicant_details?.[name],
                );

                if (values?.applicants?.[activeIndex]?.personal_details?.id) {
                  const res = await editFieldsById(
                    values?.applicants[activeIndex]?.personal_details?.id,
                    'personal',
                    {
                      middle_name:
                        values?.applicants?.[activeIndex]?.applicant_details?.middle_name,
                    },
                    {
                      headers: {
                        Authorization: token,
                      },
                    },
                  );
                }
              } else {
                updateFieldsApplicant(name, '');
                if (values?.applicants?.[activeIndex]?.personal_details?.id) {
                  const res = await editFieldsById(
                    values?.applicants[activeIndex]?.personal_details?.id,
                    'personal',
                    {
                      middle_name: '',
                    },
                    {
                      headers: {
                        Authorization: token,
                      },
                    },
                  );
                }
              }
            }}
            onChange={handleTextInputChange}
            inputClasses='capitalize'
          />

          <TextInput
            label='Last Name'
            value={values?.applicants?.[activeIndex]?.applicant_details?.last_name || ''}
            error={errors?.applicants?.[activeIndex]?.applicant_details?.last_name}
            touched={
              touched.applicants && touched?.applicants[activeIndex]?.applicant_details?.last_name
            }
            placeholder='Eg: Swami, Singh'
          disabled={
              inputDisabled ||
              values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier ||
             ( values?.applicants[activeIndex]?.applicant_details?.is_ekyc_verified&&overRideEKyc) || (values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
            }
            name={`applicants[${activeIndex}].applicant_details.last_name`}
            onChange={handleTextInputChange}
            inputClasses='capitalize'
            // onFocus={datePickerScrollToTop}
            onBlur={async (e) => {
              handleBlur(e);
              const name = e.currentTarget.name.split('.')[2];
              if (!errors?.applicants[activeIndex]?.applicant_details?.[name]) {
                updateFieldsApplicant(
                  name,
                  values.applicants[activeIndex]?.applicant_details?.[name],
                );

                if (values?.applicants?.[activeIndex]?.personal_details?.id) {
                  const res = await editFieldsById(
                    values?.applicants[activeIndex]?.personal_details?.id,
                    'personal',
                    {
                      last_name: values?.applicants?.[activeIndex]?.applicant_details?.last_name,
                    },
                    {
                      headers: {
                        Authorization: token,
                      },
                    },
                  );
                }
              } else {
                updateFieldsApplicant(name, '');
                if (values?.applicants?.[activeIndex]?.personal_details?.id) {
                  const res = await editFieldsById(
                    values?.applicants[activeIndex]?.personal_details?.id,
                    'personal',
                    {
                      last_name: '',
                    },
                    {
                      headers: {
                        Authorization: token,
                      },
                    },
                  );
                }
              }
            }}
          />

          <DatePicker2
            label='Date of Birth'
            name={`applicants[${activeIndex}].applicant_details.date_of_birth`}
            // error={errors?.applicants?.[activeIndex]?.applicant_details?.date_of_birth}
            error={dateError?.[activeIndex]}
            touched={
              touched?.applicants &&
              touched?.applicants[activeIndex]?.applicant_details?.date_of_birth
            }
            // if dob comes empty from ekyc open the field
           disabled={
              inputDisabled ||
              values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier ||
             ( values?.applicants[activeIndex]?.applicant_details?.is_ekyc_verified&&overRideEKyc) || (values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
            }
            value={date}
            onAccept={(e) => {
              checkDate(e);
            }}
            onBlur={onDatePickerBlur}
          />



          <TextInputWithSendOtp
            type='tel'
            inputClasses='hidearrow'
            label='Mobile Number'
            placeholder='Eg: 1234567890'
            required
            name={`applicants[${activeIndex}].applicant_details.mobile_number`}
            value={values.applicants?.[activeIndex]?.applicant_details?.mobile_number}
            onChange={handleOnPhoneNumberChange}
            error={errors?.applicants?.[activeIndex]?.applicant_details?.mobile_number}
            touched={
              touched.applicants &&
              touched.applicants?.[activeIndex]?.applicant_details?.mobile_number
            }
            onOTPSendClick={sendMobileOtp}
            disabledOtpButton={
              !values.applicants?.[activeIndex]?.applicant_details?.mobile_number ||
              !!errors?.applicants?.[activeIndex]?.applicant_details?.mobile_number ||
              values?.applicants?.[activeIndex]?.applicant_details?.is_mobile_verified || lo ||
              hasSentOTPOnce
            }
            disabled={
              disablePhoneNumber ||
              values?.applicants?.[activeIndex]?.applicant_details?.is_mobile_verified ||
              values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier ||(values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
              || 
              (values?.applicants?.[activeIndex]?.applicant_details?.is_primary &&  values?.lead.case_assign)
             
            }
            message={
              values?.applicants?.[activeIndex]?.applicant_details?.is_mobile_verified
                ? `<img src="${otpVerified}" alt='Otp Verified' role='presentation' /> OTP Verfied`
                : null
            }
            onBlur={(e) => {
              handleBlur(e);
              coApplicantDrawerUpdate(values?.applicants);
              const name = e.target.name.split('.')[1];
    

               test1(values?.applicants?.[activeIndex]?.applicant_details?.mobile_number)
               .then((lo_identified) => {
                 console.log("lo_identified->", lo_identified);
                     // Check the value and set an error if needed
                 if (lo_identified === "User found") {
            
             setFieldError(
               `applicants[${activeIndex}].applicant_details.mobile_number`,
               'LO login not allowed',
             );
	     setHasSentOTPOnce(true);//added for LO Number Validation Login		 
           }
          })            
              if (
                !errors?.applicants?.[activeIndex]?.applicant_details?.[name] &&
                values?.applicants?.[activeIndex]?.applicant_details?.[name]
              ) {
                updateFieldsApplicant(
                  name,
                  values.applicants?.[activeIndex]?.applicant_details?.[name],
                );
                setPhoneNumberList((prev) => {
                  return {
                    ...prev,
                    [`applicant_${activeIndex}`]:
                      values.applicants?.[activeIndex]?.applicant_details?.[name],
                  };
                });
              } else {
                updateFieldsApplicant(name, '');
              }
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
            min='0'
          />

          {showOTPInput && (
            <OtpInput
              label='Enter OTP'
              required
              verified={values?.applicants?.[activeIndex]?.applicant_details?.is_mobile_verified}
              // setOTPVerified={() => console.log('hii')}
              verifiedOnce={verifiedOnce}
              setVerifiedOnce={setVerifiedOnce}
              onSendOTPClick={sendMobileOtp}
              defaultResendTime={30}
              disableSendOTP={
                !values?.applicants?.[activeIndex]?.applicant_details?.is_mobile_verified
              }
              verifyOTPCB={verifyOTP}
              hasSentOTPOnce={hasSentOTPOnce}

              mobile = {values?.applicants?.[activeIndex]?.applicant_details?.mobile_number}

              applicant_id = {values?.applicants?.[activeIndex]?.applicant_details?.id}
            />
          )}

          {/* Added whatsapp checkbox by Pankaj yadav */}

          <div className='flex gap-2'>
                    <Checkbox
                    checked={
                      values?.applicants?.[activeIndex]?.applicant_details?.whatsApp
                    }
                    name={`applicants[${activeIndex}].applicant_details.whatsApp`}
                    onTouchEnd={() => {}}
                    onChange={(e) => {
                      let isChecked = !!e.target.checked;
                      WhatsAppCheckbox(
                        isChecked,
                        values?.applicants?.[activeIndex]?.applicant_details?.whatsApp,
                      );
                    }}
                    // disabled={
                    //   values?.applicants?.[activeIndex]?.applicant_details?.is_primary ||
                    //   values?.applicants?.[activeIndex]?.applicant_details?.whatsApp?.qualifier
                    // }
                    disabled={ 
                     
                      values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier ||(values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
                    }
                    />
            <p className='text-xs not-italic font-medium text-primary-black' style={{position:'relative',top:'13px'}}>
              Same WhatsApp Number
            </p>
          </div>

          <DropDown
            label='Purpose of loan'
            name='lead.purpose_of_loan'
            required
            options={
              values?.lead.loan_type === 'Home Loan' ? loanPurposeOptions : loanPurposeDataLap
            }
            placeholder='Choose purpose of loan'
            onChange={handleLoanPurposeChange}
            touched={touched && touched?.lead?.purpose_of_loan}
            error={errors && errors?.lead?.purpose_of_loan}
            onBlur={handleBlur}
            defaultSelected={values.lead?.purpose_of_loan}
            inputClasses='mt-2'
            disabled={
              !values?.applicants?.[activeIndex]?.applicant_details?.is_primary ||
              values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier ||(values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
            }
          />
          <h3 className={`flex items-center gap-0.5 text-primary-black`}>Is Property Owner <span className='text-primary-red text-sm'>*</span></h3>

          <div    className={`flex gap-1 w-full ${
                inputDisabled ? 'pointer-events-none cursor-not-allowed' : 'pointer-events-auto'
              }`}>

          <Radio
          key = "Is Property Owner"
          label = "Yes"
          value = "Yes"
          current={values?.applicants?.[activeIndex]?.applicant_details?.is_property_owner}
          onChange = {onHandlePropertyRadio}
          disabled = {values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier || (values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)}
          />

          <Radio
          key = ""
          label = "No"
          value = "No"
          current={values?.applicants?.[activeIndex]?.applicant_details?.is_property_owner}
          onChange = {onHandlePropertyRadio}
          disabled = {values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier || (values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)}
          />

          </div>

          <DropDown
            label='Property Type'
            name='lead.property_type'
            required
            placeholder='Choose property type'
            options={
              values?.lead.loan_type === 'Home Loan'
                ? loanFields[values.lead?.purpose_of_loan] || [
                    {
                      label: 'Residential House',
                      value: 'Residential House',
                    },
                  ]
                : loanOptionsLap[values.lead?.purpose_of_loan] || [
                    {
                      label: 'Residential House',
                      value: 'Residential House',
                    },
                  ]
            }
            onChange={handlePropertyType}
            defaultSelected={values.lead?.property_type}
            touched={touched && touched?.lead?.property_type}
            error={errors && errors?.lead?.property_type}
            onBlur={handleBlur}
            disabled={
              !values?.applicants?.[activeIndex]?.applicant_details?.is_primary ||
              values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier || (values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
            }
          />
         <DropDown
            label='Lead Type'
            name='lead.lead_type'
            placeholder='Choose Lead Type'
            options={
              [
                {
                  label: loData?.user?.role == 'Loan Officer'?'Loan Officer':'Branch Manager',
                  value: loData?.user?.role == 'Loan Officer'?'LO':'BM',
                },

                {
                  label: 'DSA',
                  value: 'DSA',
                },
                {
                  label: 'Connector',
                  value: 'connector',
                },
                {
                  label: 'Lead Source',
                  value: 'Lead Source',
                },
                {
                  label: 'Activity Marketing',
                  value: 'Activity Marketing',
                },
              ]
            }
            required
             onChange={handleLeadType}
             defaultSelected={values.lead?.lead_type}
              touched={touched && touched?.lead?.lead_type}
              error={errors && errors?.lead?.lead_type}
             onBlur={handleBlur}
             disabled={
              !values?.applicants?.[activeIndex]?.applicant_details?.is_primary ||
              values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier || (values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
            }
          />

          {
           (values.lead?.lead_type === 'DSA' ||   values.lead?.lead_type === 'connector' || values.lead?.lead_type === 'Lead Source')  && (
          
            <SearchableTextInput
            // key={index}
            
            name='connector_code'
            label={'DSA / Connector Code / Lead Source'}
            onChange={onConnectorCodeChange}
            value={values?.lead?.connector_code}
            touched={touched.lead?.connector_code}
            containerClasses='flex-1'
            disabled={
              !values?.applicants?.[activeIndex]?.applicant_details?.is_primary ||
              values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier ||(values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
            }
            options = {
              values.lead?.lead_type === 'DSA' ? dsaOptions :
              values.lead?.lead_type === 'connector' ? connectorOptions :
              values.lead?.lead_type === 'Lead Source' ? leadSourceOptions :
              []
            }
          />
           )
          }
        </div>
        <PreviousNextButtons
          disablePrevious={true}
          // disableNext={
          //   !values?.applicants?.[activeIndex]?.applicant_details?.is_mobile_verified ||
          //   values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.progress !== 100
          //   || values.lead?.lead_type === undefined 
          //   || 
          //  (Connector_Code === "" && values.lead?.lead_type !== 'LO' &&  values.lead?.connector_code === '' )
          // }
          // onNextClick={() => {
          //   values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.is_existing &&
          //   !values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.is_existing_done
          //     ? setOpenExistingPopup(true)
          //     : setCurrentStepIndex(1);

          //     updateParams(values?.applicants?.[activeIndex]?.applicant_details?.id,'applicant',values.applicants[activeIndex].applicant_details?.extra_params)   // any condition if user clicks next button, whatever information is updated by user is updated in db additional params update


          // }}
          onNextClick={()=>{
            handleNextClick()
          }}
          // linkNext={
          //   values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.is_existing &&
          //   !values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.is_existing_done
          //     ? undefined
          //     : '/lead/personal-details'
          // }
        />

        <SwipeableDrawerComponent />
      </div>

      {openExistingPopup ? (
        <DynamicDrawer open={openExistingPopup} setOpen={setOpenExistingPopup} height='223px'>
          <div className='z-[6000] h-full w-full flex flex-col'>
            <span className='font-normal text-center leading-[21px] text-[16px] text-black '>
              This is an existing customer and is already pre-approved for a loan upto
            </span>
            {
              values?.applicants?.[activeIndex]?.applicant_details
                ?.existing_customer_pre_approved_amount ? (
                <span className='p-5 mb-5 text-center text-[#277C5E] font-[500] text-[26px]'>
                  {parseInt(
                    values.applicants?.[activeIndex].applicant_details
                      .existing_customer_pre_approved_amount,
                  )
                    .toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                    })
                    .replace('.00', '')}
                  /-
                </span>
              ) : (
                <span className='p-5 mb-5 text-center text-[#277C5E] font-[500] text-[26px]'>
                  N/A
                </span>
              ) // Display 'N/A' or some other fallback if the value is undefined
            }
            <Button
              primary={true}
              inputClasses='w-full h-[46px]'
              onClick={() => {
                setFieldValue(
                  `applicants[${activeIndex}].applicant_details.extra_params.is_existing_done`,
                  true,
                );
                editFieldsById(
                  values?.applicants?.[activeIndex]?.applicant_details?.id,
                  'applicant',
                  {
                    extra_params: {
                      ...values?.applicants?.[activeIndex]?.applicant_details?.extra_params,
                      is_existing_done: true,
                    },
                  },
                  {
                    headers: {
                      Authorization: token,
                    },
                  },
                );
                setOpenExistingPopup(false);
                setCurrentStepIndex(1);
              }}
              link='/lead/personal-details'
            >
              Continue
            </Button>
          </div>
        </DynamicDrawer>
      ) : null}
      </div>}
    </>
  );
};

export default ApplicantDetails;
