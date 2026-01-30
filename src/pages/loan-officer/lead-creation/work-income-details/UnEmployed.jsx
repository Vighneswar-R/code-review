import { useCallback, useContext, useState, useEffect } from 'react';
import { LeadContext } from '../../../../context/LeadContextProvider';
import TextInput from '../../../../components/TextInput';
import { CardRadio, CurrencyInput } from '../../../../components';
import { editFieldsById } from '../../../../global';
import { AuthContext } from '../../../../context/AuthContextProvider';
import { professionOptions } from '../utils';
import { IconSalarid, IconSelfEmployed } from '../../../../assets/icons';

export default function UnEmployed({ requiredFieldsStatus, setRequiredFieldsStatus }) {
  const { values, errors, touched, handleBlur, setFieldValue, activeIndex, handleChange,tempQualifier,tempQualifierCoApplicant } =
    useContext(LeadContext);

  const { token } = useContext(AuthContext);

  const IncomeProofOptions = [
    {
      label: 'PAN ID',
      value: 'PAN ID',
      icon: <IconSalarid />,
    },
    {
      label: 'Form 60',
      value: 'Form 60',
      icon: <IconSelfEmployed />,
    },
  ];

  const handleRadioChange = useCallback(
    (e) => {
      setFieldValue(e.name, e.value);

      if (!errors.applicants?.[activeIndex]?.work_income_detail?.income_proof) {
        editFieldsById(
          values?.applicants?.[activeIndex]?.work_income_detail?.id,
          'work-income',
          {
            income_proof: e.value,
          },
          {
            headers: {
              Authorization: token,
            },
          },
        );
        const name = e.name.split('.')[2];

        setRequiredFieldsStatus((prev) => ({ ...prev, [name]: true }));
      } else {
        const name = e.name.split('.')[2];
        setRequiredFieldsStatus((prev) => ({ ...prev, [name]: false }));
      }
    },
    [values],
  );
//added for auto population for PAn Number
useEffect(()=>{
  if(values?.applicants?.[activeIndex]?.personal_details?.id_type === 'PAN'){
    setFieldValue(`applicants[${activeIndex}].work_income_detail.income_proof`, 'PAN ID');
    editFieldsById(
      values?.applicants?.[activeIndex]?.work_income_detail?.id,
      'work-income',
      {
        income_proof: 'PAN ID',
      },
      {
        headers: {
          Authorization: token,
        },
      },
    );
  }
},[]);

  useEffect(() => {
    if (
      values?.applicants?.[activeIndex]?.personal_details?.id_type === 'PAN' &&
      values?.applicants?.[activeIndex]?.personal_details?.id_number
    ) {
      if (values?.applicants?.[activeIndex]?.work_income_detail?.income_proof) {
        setRequiredFieldsStatus((prev) => ({ ...prev, ['income_proof']: true }));
      } else {
        setRequiredFieldsStatus((prev) => ({ ...prev, ['income_proof']: false }));
      }
    } else {
      if (values?.applicants?.[activeIndex]?.work_income_detail?.pan_number) {
        setRequiredFieldsStatus((prev) => ({ ...prev, ['pan_number']: true }));
      }
    }

    if (values?.applicants?.[activeIndex]?.work_income_detail?.income_proof === 'Form 60') {
      setRequiredFieldsStatus((prev) => {
        let newPrev = { ...prev };
        if ('pan_number' in newPrev) delete newPrev.pan_number;

        return newPrev;
      });
    } else {
      setRequiredFieldsStatus((prev) => {
        let newPrev = {
          ...prev,
          ['pan_number']: !!values?.applicants?.[activeIndex]?.work_income_detail?.pan_number,
        };

        return newPrev;
      });
    }
  }, [values?.applicants?.[activeIndex]?.work_income_detail?.income_proof]);

  return (
    <>
      <label htmlFor='loan-purpose' className='flex gap-0.5 font-medium text-black'>
        Income proof <span className='text-primary-red text-xs'>*</span>
      </label>

      <div className={`flex gap-4 w-full`}>
        {IncomeProofOptions.map((option) => {
          return (
            <CardRadio
              key={option.value}
              label={option.label}
              name={`applicants[${activeIndex}].work_income_detail.income_proof`}
              value={option.value}
              current={values?.applicants?.[activeIndex]?.work_income_detail?.income_proof}
              onChange={handleRadioChange}
              containerClasses='flex-1'
              disabled={
                values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier ||(values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)||
                (option.value === 'Form 60' &&
                  values?.applicants?.[activeIndex]?.personal_details?.id_type === 'PAN')
              }
            >
              {option.icon}
            </CardRadio>
          );
        })}
      </div>

      {values?.applicants?.[activeIndex]?.work_income_detail?.income_proof === 'PAN ID' && (
        <TextInput
          label='Enter PAN number'
          placeholder='Eg: ABCD1256D'
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
            values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier ||(values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
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
      )}

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

              console.log("CHANGED VALUE",currentRequired)
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

            if (!requiredFieldsStatus['ongoing_emi']) {
              setRequiredFieldsStatus((prev) => ({
                ...prev,
                ['ongoing_emi']: true,
              }));
            }
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
    </>
  );
}
