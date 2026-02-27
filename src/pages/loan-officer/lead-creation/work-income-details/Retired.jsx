import { useCallback, useContext, useState } from 'react';
import { LeadContext } from '../../../../context/LeadContextProvider';
import TextInput from '../../../../components/TextInput';
import { CurrencyInput } from '../../../../components';
import { editFieldsById } from '../../../../global';
import { AuthContext } from '../../../../context/AuthContextProvider';

export default function Retired({ requiredFieldsStatus, setRequiredFieldsStatus }) {
  const { values, errors, handleBlur, touched, setFieldValue, activeIndex,tempQualifier,tempQualifierCoApplicant } =
    useContext(LeadContext);
  const { token } = useContext(AuthContext);

  return (
    <>
      <CurrencyInput
        label='Total pension amount'
        placeholder='Eg: 1,00,000'
        required
        name={`applicants[${activeIndex}].work_income_detail.pention_amount`}
        value={values?.applicants?.[activeIndex]?.work_income_detail?.pention_amount}
        error={errors?.applicants?.[activeIndex]?.work_income_detail?.pention_amount}
        touched={touched?.applicants?.[activeIndex]?.work_income_detail?.pention_amount}
        onBlur={async (e) => {
          handleBlur(e);

          if (
            !errors?.applicants?.[activeIndex]?.work_income_detail?.pention_amount &&
            values?.applicants?.[activeIndex]?.work_income_detail?.pention_amount
          ) {
            try{
            await editFieldsById(
              values?.applicants?.[activeIndex]?.work_income_detail?.id,
              'work-income',
              {
                pention_amount:
                  values?.applicants?.[activeIndex]?.work_income_detail?.pention_amount,
              },
              {
                headers: {
                  Authorization: token,
                },
              },
            );
          } catch(err){
            console.log("failed to save pention ");
          }
          } else {
            setRequiredFieldsStatus((prev) => ({
              ...prev,
              ['pention_amount']: false,
            }));

            try{
           await editFieldsById(
              values?.applicants?.[activeIndex]?.work_income_detail?.id,
              'work-income',
              {
                pention_amount: '',
              },
              {
                headers: {
                  Authorization: token,
                },
              },
            );
          } catch(err){
            console.log("failed to clear pention ");
          }
          }
        }}
        onChange={(e) => {
          const value = e.currentTarget.value;
          const pattern = /^[a-zA-Z0-9\/-\s,.]+$/;
          if (pattern.exec(value[value.length - 1])) {
            setFieldValue(e.currentTarget.name, value.charAt(0).toUpperCase() + value.slice(1));

            if (!requiredFieldsStatus['pention_amount']) {
              setRequiredFieldsStatus((prev) => ({ ...prev, ['pention_amount']: true }));
            }
          }
        }}
        disabled={values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier ||(values?.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)}
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
        onBlur={async (e) => {
          handleBlur(e);

          if (
            !errors?.applicants?.[activeIndex]?.work_income_detail?.no_current_loan &&
            (values?.applicants?.[activeIndex]?.work_income_detail?.no_current_loan ||
              values?.applicants?.[activeIndex]?.work_income_detail?.no_current_loan == 0)
          ) {

            try{
            await editFieldsById(
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
          } catch(error){
            console.log("soemthing went wrong ");
          }

            setRequiredFieldsStatus((prev) => ({
              ...prev,
              no_current_loan: true,
            }));

            if (e.target.value == 0) {
              setFieldValue(`applicants[${activeIndex}].work_income_detail.ongoing_emi`, '');

              try{
             await editFieldsById(
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
            } catch(error){
              console.log("something went wrong ");
            }
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

             try{
            await editFieldsById(
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
          } catch(error){
            console.log("something went wrong ");
          }
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
        disabled={values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier ||(values?.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)}
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
        onBlur={async (e) => {
          handleBlur(e);

          if (
            !errors?.applicants?.[activeIndex]?.work_income_detail?.ongoing_emi &&
            values?.applicants?.[activeIndex]?.work_income_detail?.ongoing_emi
          ) {
            try{
           await editFieldsById(
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
          } catch(err){
            console.log('something went wrong ');
          }
          } else {
            setRequiredFieldsStatus((prev) => ({
              ...prev,
              ['ongoing_emi']: false,
            }));

            try{
            await editFieldsById(
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
            );}
            catch(error){
              console.log('something went wrong');
            }
          }
        }}
        onChange={(e) => {
          const value = e.currentTarget.value;
          const address_pattern = /^[a-zA-Z0-9\/-\s,]+$/;
          if (address_pattern.exec(value[value.length - 1])) {
            setFieldValue(e.currentTarget.name, value.charAt(0).toUpperCase() + value.slice(1));

            if (!requiredFieldsStatus['ongoing_emi']) {
              setRequiredFieldsStatus((prev) => ({ ...prev, ['ongoing_emi']: true }));
            }
          }
        }}
        hint='Total ongoing EMI(s) based on the ongoing loan(s)'
        disabled={
          values?.applicants?.[activeIndex]?.work_income_detail?.no_current_loan == 0
            ? true
            : false || values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier ||(values?.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
        }
        labelDisabled={
          values?.applicants?.[activeIndex]?.work_income_detail?.no_current_loan == 0 ? true : false
        }
      />
    </>
  );
}
