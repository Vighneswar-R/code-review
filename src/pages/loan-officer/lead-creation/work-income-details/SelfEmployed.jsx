import { useCallback, useContext, useState, useEffect } from 'react';
import { LeadContext } from '../../../../context/LeadContextProvider';
import TextInput from '../../../../components/TextInput';
import DropDown from '../../../../components/DropDown';
import { CurrencyInput } from '../../../../components';
import { editFieldsById } from '../../../../global';
import { industriesOptions } from './WorkIncomeDropdownData';
import { AuthContext } from '../../../../context/AuthContextProvider';

export default function SelfEmployed({ requiredFieldsStatus, setRequiredFieldsStatus }) {
  const {
    values,
    errors,
    handleBlur,
    touched,
    setFieldValue,
    setFieldError,
    activeIndex,
    handleChange,
    tempQualifier,
    tempQualifierCoApplicant
  } = useContext(LeadContext);

  const { token } = useContext(AuthContext);

  const handleDropdownChange = useCallback(
    (name, value) => {
      setFieldValue(name, value);

      editFieldsById(
        values?.applicants?.[activeIndex]?.work_income_detail?.id,
        'work-income',
        {
          industries: value,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );

      if (!requiredFieldsStatus['industries']) {
        setRequiredFieldsStatus((prev) => ({
          ...prev,
          ['industries']: true,
        }));
      }
    },
    [requiredFieldsStatus, setRequiredFieldsStatus],
  );

  useEffect(() => {
    const gstPattern =
      /^([0-9]{2}[a-zA-Z]{4}([a-zA-Z]{1}|[0-9]{1})[0-9]{4}[a-zA-Z]{1}([a-zA-Z]|[0-9]){3}){0,15}$/;
    const cleanedGSTNumber = values?.applicants?.[
      activeIndex
    ]?.work_income_detail?.gst_number?.replace(/\s/g, '');
    if (
      !gstPattern.test(cleanedGSTNumber) &&
      values?.applicants?.[activeIndex]?.work_income_detail?.gst_number
    ) {
      setFieldError('work_income_detail.gst_number', 'Inavlid gst number');
    }
  }, [values?.applicants?.[activeIndex]?.work_income_detail?.gst_number, setFieldError]);

  return (
    <>
      <TextInput
        label='Business name'
        placeholder='Eg: Sanjay Enterprises'
        required
        name={`applicants[${activeIndex}].work_income_detail.business_name`}
        value={values?.applicants?.[activeIndex]?.work_income_detail?.business_name}
        error={errors?.applicants?.[activeIndex]?.work_income_detail?.business_name}
        touched={touched?.applicants?.[activeIndex]?.work_income_detail?.business_name}
        onBlur={(e) => {
          handleBlur(e);

          if (
            !errors?.applicants?.[activeIndex]?.work_income_detail?.business_name &&
            values?.applicants?.[activeIndex]?.work_income_detail?.business_name
          ) {
            editFieldsById(
              values?.applicants?.[activeIndex]?.work_income_detail?.id,
              'work-income',
              {
                business_name: values?.applicants?.[activeIndex]?.work_income_detail?.business_name,
              },
              {
                headers: {
                  Authorization: token,
                },
              },
            );

            if (!requiredFieldsStatus['business_name']) {
              setRequiredFieldsStatus((prev) => ({
                ...prev,
                ['business_name']: true,
              }));
            }
          } else {
            setRequiredFieldsStatus((prev) => ({
              ...prev,
              ['business_name']: false,
            }));

            editFieldsById(
              values?.applicants?.[activeIndex]?.work_income_detail?.id,
              'work-income',
              {
                business_name: '',
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
          value = value.trimStart().replace(/\s\s+/g, ' ');
          const name = e.currentTarget.name;
          // const address_pattern = /^[a-zA-Z]+$/;
         // const address_pattern = /^[A-Za-z\s]+$/;
         const address_pattern =/^[a-zA-Z0-9\\/-\s,.]+$/;
          if (!address_pattern.test(value) && value.length > 0) {
            return;
          }
          if (address_pattern.exec(value[value.length - 1])) {
            setFieldValue(e.currentTarget.name, value.charAt(0).toUpperCase() + value.slice(1).toUpperCase());
          }
        }}
        disabled={values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier || (values.applicants[activeIndex]?.applicant_details?.is_primary && tempQualifier)}
      />

      <TextInput
        type='number'
        pattern='\d*'
        required
        label='No.of employees'
        placeholder='Eg: 50'
        name={`applicants[${activeIndex}].work_income_detail.no_of_employees`}
        value={values?.applicants?.[activeIndex]?.work_income_detail?.no_of_employees}
        error={errors?.applicants?.[activeIndex]?.work_income_detail?.no_of_employees}
        touched={touched?.applicants?.[activeIndex]?.work_income_detail?.no_of_employees}
        onBlur={(e) => {
          handleBlur(e);

          if (
            !errors.applicants?.[activeIndex]?.work_income_detail?.no_of_employees &&
            values?.applicants?.[activeIndex]?.work_income_detail?.no_of_employees
          ) {
            editFieldsById(
              values?.applicants?.[activeIndex]?.work_income_detail?.id,
              'work-income',
              {
                no_of_employees: e.target.value,
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
                no_of_employees: '',
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
        onChange={(e) => {
          handleChange(e);
        }}

         onKeyDown={(e) => {
          if (e.key === "e" || e.key === "E") {
            e.preventDefault();
          }
        }}
        
        disabled={values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier ||(values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)}
      />

      <DropDown
        label='Industries'
        required
        options={industriesOptions}
        placeholder='Choose industries'
        onChange={(e) =>
          handleDropdownChange(`applicants[${activeIndex}].work_income_detail.industries`, e)
        }
        defaultSelected={values?.applicants?.[activeIndex]?.work_income_detail?.industries}
        name={`applicants[${activeIndex}].work_income_detail.industries`}
        value={values?.applicants?.[activeIndex]?.work_income_detail?.industries}
        error={errors?.applicants?.[activeIndex]?.work_income_detail?.industries}
        touched={touched?.applicants?.[activeIndex]?.work_income_detail?.industries}
        onBlur={handleBlur}
        disabled={values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier ||(values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)}
      />

      {values?.applicants?.[activeIndex]?.work_income_detail?.industries === 'Others' && (
        <TextInput
          label=''
          placeholder='Enter industry name'
          name={`applicants[${activeIndex}].work_income_detail.extra_params.extra_industries`}
          value={
            values?.applicants?.[activeIndex]?.work_income_detail?.extra_params.extra_industries
          }
          error={
            errors?.applicants?.[activeIndex]?.work_income_detail?.extra_params?.extra_industries
          }
          touched={
            touched?.applicants?.[activeIndex]?.work_income_detail?.extra_params?.extra_industries
          }
          onBlur={(e) => {
            handleBlur(e);

            if (
              !errors?.applicants?.[activeIndex]?.work_income_detail?.extra_params
                ?.extra_industries &&
              values?.applicants?.[activeIndex]?.work_income_detail?.extra_params?.extra_industries
            ) {
              editFieldsById(
                values?.applicants?.[activeIndex]?.work_income_detail?.id,
                'work-income',
                {
                  industries:
                    values?.applicants?.[activeIndex]?.work_income_detail?.extra_params
                      ?.extra_industries,
                  extra_params: {
                    extra_industries: 'Others',
                  },
                },
                {
                  headers: {
                    Authorization: token,
                  },
                },
              );
            } else {
              editFieldsById(
                values?.applicants?.[activeIndex]?.work_income_detail?.id,
                'work-income',
                {
                  industries: '',
                  extra_params: {
                    extra_industries: '',
                  },
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
            value = value.trimStart().replace(/\s\s+/g, ' ');
            const address_pattern = /^[A-Za-z\s]+$/;
            if (!address_pattern.test(value) && value.length > 0) {
              return;
            }
            if (address_pattern.exec(value[value.length - 1])) {
              setFieldValue(e.currentTarget.name, value.charAt(0).toUpperCase() + value.slice(1).toUpperCase());
            }
          }}
          disabled={values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier ||(values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)}
        />
      )}

      <TextInput
        label='GST number'
        placeholder='Eg: 06AAAPB2117A1ZI'
        // className='uppercase'
        name={`applicants[${activeIndex}].work_income_detail.gst_number`}
        value={values?.applicants?.[activeIndex]?.work_income_detail?.gst_number}
        error={errors?.applicants?.[activeIndex]?.work_income_detail?.gst_number}
        touched={touched?.applicants?.[activeIndex]?.work_income_detail?.gst_number}
        onBlur={(e) => {
          // const gstPattern =
          //   /^([0-9]{2}[a-zA-Z]{4}([a-zA-Z]{1}|[0-9]{1})[0-9]{4}[a-zA-Z]{1}([a-zA-Z]|[0-9]){3}){0,15}$/;
          // const cleanedGSTNumber = values?.applicants?.[
          //   activeIndex
          // ]?.work_income_detail?.gst_number.replace(/\s/g, '');
          // if (
          //   !gstPattern.test(cleanedGSTNumber) &&
          //   values?.applicants?.[activeIndex]?.work_income_detail?.gst_number
          // ) {
          //   setFieldError('work_income_detail.gst_number', 'Inavlid gst number');
          // } else {
          //   handleBlur(e);
          // }
          handleBlur(e);

          if (
            !errors?.applicants?.[activeIndex]?.work_income_detail?.gst_number &&
            values?.applicants?.[activeIndex]?.work_income_detail?.gst_number
          ) {
            editFieldsById(
              values?.applicants?.[activeIndex]?.work_income_detail?.id,
              'work-income',
              {
                gst_number: values?.applicants?.[activeIndex]?.work_income_detail?.gst_number,
              },
              {
                headers: {
                  Authorization: token,
                },
              },
            );
          } else {
            editFieldsById(
              values?.applicants?.[activeIndex]?.work_income_detail?.id,
              'work-income',
              {
                gst_number: '',
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
          e.target.value = e.target.value.toUpperCase();
          const value = e.currentTarget.value;
          const pattern = /^[a-zA-Z0-9]+$/;
          if (!pattern.test(value) && value.length > 0) {
            return;
          }
          if (pattern.exec(value[value.length - 1])) {
            setFieldValue(e.currentTarget.name, value.charAt(0).toUpperCase() + value.slice(1));
          }
        }}
        disabled={values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier ||(values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)}
      />

      <TextInput
        label='Udyam number'
        placeholder='Eg: UDYAM-XX-00-0000000'
        // className='uppercase'
        name={`applicants[${activeIndex}].work_income_detail.udyam_number`}
        value={values?.applicants?.[activeIndex]?.work_income_detail?.udyam_number}
        error={errors?.applicants?.[activeIndex]?.work_income_detail?.udyam_number}
        touched={touched?.applicants?.[activeIndex]?.work_income_detail?.udyam_number}
        onBlur={(e) => {
          handleBlur(e);

          if (
            !errors?.applicants?.[activeIndex]?.work_income_detail?.udyam_number &&
            values?.applicants?.[activeIndex]?.work_income_detail?.udyam_number
          ) {
            editFieldsById(
              values?.applicants?.[activeIndex]?.work_income_detail?.id,
              'work-income',
              {
                udyam_number: values?.applicants?.[activeIndex]?.work_income_detail?.udyam_number,
              },
              {
                headers: {
                  Authorization: token,
                },
              },
            );
          } else {
            editFieldsById(
              values?.applicants?.[activeIndex]?.work_income_detail?.id,
              'work-income',
              {
                udyam_number: '',
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
          if (e.target.value === ' ') {
            return;
          }
          let value = e.target.value;
          value = value.trimStart().replace(/\s\s+/g, ' ');
          const pattern = /^[A-Za-z0-9-]+$/;

          if (value?.trim() == '') {
            setFieldValue(e.target.name, value);
          }

          if (pattern.test(value)) {
            setFieldValue(e.target.name, value.toUpperCase());
          }
        }}
        disabled={values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier ||(values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)}
      />

      <TextInput
        type='number'
        label='No. of current loan(s)'
        placeholder='Eg: 1'
        pattern='\d*'
        required
        name={`applicants[${activeIndex}].work_income_detail.no_current_loan`}
        value={values?.applicants?.[activeIndex]?.work_income_detail?.no_current_loan}
        error={errors?.applicants?.[activeIndex]?.work_income_detail?.no_current_loan}
        touched={touched?.applicants?.[activeIndex]?.work_income_detail?.no_current_loan}
        onBlur={(e) => {
          handleBlur(e);

          if (
            !errors?.applicants?.[activeIndex]?.work_income_detail?.no_current_loan &&
            (values?.applicants?.[activeIndex]?.work_income_detail?.no_current_loan ||
              values?.applicants?.[activeIndex]?.work_income_detail?.no_current_loan == 0)
          ) {
            editFieldsById(
              values?.applicants?.[activeIndex]?.work_income_detail?.id,
              'work-income',
              {
                no_current_loan: parseInt(
                  values?.applicants?.[activeIndex]?.work_income_detail?.no_current_loan,
                ),
              },
              {
                headers: {
                  Authorization: token,
                },
              },
            );

            setRequiredFieldsStatus((prev) => ({
              ...prev,
              no_current_loan: true,
            }));

            if (e.target.value == 0) {
              setFieldValue(`applicants[${activeIndex}].work_income_detail.ongoing_emi`, '');
              editFieldsById(
                values?.applicants?.[activeIndex]?.work_income_detail?.id,
                'work-income',
                {
                  ongoing_emi: null,
                },
                {
                  headers: {
                    Authorization: token,
                  },
                },
              );

              let currentRequired = {...requiredFieldsStatus};

              currentRequired.ongoing_emi = true;

              currentRequired.no_current_loan = true;

              // setRequiredFieldsStatus((prev) => {     // heree **
              //   return {
              //     ...prev,
              //     no_current_loan: true,
              //     ongoing_emi: true,
              //   };
              // });

              setRequiredFieldsStatus(currentRequired);

            } else if (
              errors?.applicants?.[activeIndex]?.work_income_detail?.ongoing_emi ||
              !values?.applicants?.[activeIndex]?.work_income_detail?.ongoing_emi
            ) {
              setRequiredFieldsStatus((prev) => ({
                ...prev,
                ongoing_emi: false,
              }));
            }
          } else {
            setRequiredFieldsStatus((prev) => ({
              ...prev,
              ['no_current_loan']: false,
            }));

            editFieldsById(
              values?.applicants?.[activeIndex]?.work_income_detail?.id,
              'work-income',
              {
                no_current_loan: null,
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
          const address_pattern = /[^\d]/g;
          if (address_pattern.test(value)) {
            return;
          }

          setFieldValue(e.currentTarget.name, value && parseInt(value));

          setRequiredFieldsStatus((prev) => ({
            ...prev,
            no_current_loan: false,
          }));
        }}
        disabled={values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier ||(values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)}
      />

      <CurrencyInput
        label='Ongoing EMI(s)'
        placeholder='Eg: 10,000'
        required
        name={`applicants[${activeIndex}].work_income_detail.ongoing_emi`}
        value={values?.applicants?.[activeIndex]?.work_income_detail?.ongoing_emi}
        error={
          values?.applicants?.[activeIndex]?.work_income_detail?.no_current_loan != 0
            ? errors?.applicants?.[activeIndex]?.work_income_detail?.ongoing_emi
            : null
        }
        touched={touched?.applicants?.[activeIndex]?.work_income_detail?.ongoing_emi}
        onBlur={(e) => {
          handleBlur(e);

          if (
            !errors?.applicants?.[activeIndex]?.work_income_detail?.ongoing_emi &&
            values?.applicants?.[activeIndex]?.work_income_detail?.ongoing_emi
          ) {
            editFieldsById(
              values?.applicants?.[activeIndex]?.work_income_detail?.id,
              'work-income',
              {
                ongoing_emi: values?.applicants?.[activeIndex]?.work_income_detail?.ongoing_emi,
              },
              {
                headers: {
                  Authorization: token,
                },
              },
            );

            if (!requiredFieldsStatus.ongoing_emi) {
              setRequiredFieldsStatus((prev) => ({
                ...prev,
                ongoing_emi: true,
              }));
            }
          } else {
            setRequiredFieldsStatus((prev) => ({
              ...prev,
              ['ongoing_emi']: false,
            }));

            editFieldsById(
              values?.applicants?.[activeIndex]?.work_income_detail?.id,
              'work-income',
              {
                ongoing_emi: '',
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
          const address_pattern = /^[a-zA-Z0-9\/-\s,]+$/;
          if (address_pattern.exec(value[value.length - 1])) {
            setFieldValue(e.currentTarget.name, value.charAt(0).toUpperCase() + value.slice(1));
          }
        }}
        hint='Total ongoing EMI(s) based on the ongoing loan(s)'
        disabled={
          values?.applicants?.[activeIndex]?.work_income_detail?.no_current_loan == 0
            ? true
            : false || values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier ||(values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
        }
        labelDisabled={
          values?.applicants?.[activeIndex]?.work_income_detail?.no_current_loan == 0 ? true : false
        }
      />

        <TextInput
        type = 'number'
        label='Monthly Income'
        placeholder='Eg: 10,000'
        required
        name={`applicants[${activeIndex}].work_income_detail.monthly_income`}
        value={values?.applicants?.[activeIndex]?.work_income_detail?.monthly_income}
        error={
          errors?.applicants?.[activeIndex]?.work_income_detail?.monthly_income
        }
        touched={touched?.applicants?.[activeIndex]?.work_income_detail?.monthly_income}
        onBlur={async (e) => {
          handleBlur(e);

          try{

            let value = values?.applicants?.[activeIndex]?.work_income_detail?.monthly_income;
          const updated = await 
      editFieldsById(
        values?.applicants?.[activeIndex]?.work_income_detail?.id,
        'work-income',
        {
          monthly_income:value?parseInt(value):null,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );

       if(values?.applicants?.[activeIndex]?.work_income_detail?.monthly_income <5000 || values?.applicants?.[activeIndex]?.work_income_detail?.monthly_income > 1000000 || errors?.applicants?.[activeIndex]?.work_income_detail?.monthly_income){
           setRequiredFieldsStatus((prev)=>{
        return {...prev,monthly_income:false}
      })
            return;
          }

      setRequiredFieldsStatus((prev)=>{
        return {...prev,monthly_income:true}
      })

    }

    catch(err){
      console.log(err)
    }
   //waiting here
        }}
        onChange={(e) => {
          

          // if(e?.target?.value<5000){
          //   setFieldError(`work_income_detail.monthly_income`,"Minimum Amount Should be 5000")
          // }

                    const value = e.currentTarget.value;

          setFieldValue(e?.target?.name,value);
          //parsing here
        }}
        disabled = {values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier || (values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)}
      />
    </>



  );
}
