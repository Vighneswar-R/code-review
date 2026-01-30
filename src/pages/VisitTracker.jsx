import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  CardRadio,
  CurrencyInput,
  DropDown,
  Header,
  OtpInput,
  RangeSlider,
  TextInput,
} from '../components';
import { useNavigate } from 'react-router-dom';
import AddLeadIcon from '../assets/icons/add-lead';
import DateRangePicker from '../components/DateRangePicker';
import moment from 'moment';
import { parseISO } from 'date-fns';
import { t } from 'i18next';
import Searchbox from '../components/Searchbox.jsx';
import FormPopUp from '../components/FormPopUp/index.jsx';
import { IconHomeLoan, IconLoanAgainstProperty } from '../assets/icons';
import TextInputWithSendOtp from '../components/TextInput/TextInputWithSendOtp.jsx';
import { professionOptions } from './loan-officer/lead-creation/utils.jsx';
import UploadSelfie from '../components/UploadSelfie';
import { useFormik } from 'formik';
import { visitSchema } from '../schemas/index.js';
import {
  createVisit,
  getAllVisits,
  getLODetails,
  getSingleVisit,
  getVisitMobileOtp,
  lo_check,
  searchVisit,
  updateVisit,
  uploadDoc,
  verifyVisitMobileOtp,
} from '../global/index.js';
import { AuthContext } from '../context/AuthContextProvider.jsx';
import NoLeadIllustration from '../assets/icons/no-lead.jsx';
import NoSearchResultIllustration from '../assets/icons/no-search-lead.jsx';
import LoaderDynamicText from '../components/Loader/LoaderDynamicText.jsx';
import ArrowRightIcon2 from '../assets/icons/arrow-right-2.jsx';
import { Separator } from '@react-pdf-viewer/core';
import Modal from '../components/Open Modal/Modal.jsx';
import Checkbox from '../components/Checkbox/index.jsx';
import DatePicker2 from '../components/DatePicker/DatePicker2.jsx';
import { LeadContext } from '../context/LeadContextProvider.jsx';
import SecureImage from '../components/SecureImage/index.jsx';
import ErrorBoundary from '../components/ErrorBoundary/index.jsx';
import VisitSelfieUploader from '../components/UploadSelfie/visitSelfieUploader.jsx';
import generateImageWithTextWatermark from '../utils/GenerateImageWithTextWatermark.js';

const visitLoanTypeOptions = [
  {
    label: 'Home Loan',
    value: 'Home Loan',
    icon: <IconHomeLoan />,
  },
  {
    label: 'Loan against Property',
    value: 'LAP',
    icon: <IconLoanAgainstProperty />,
  },
];

const initialValue = {
  purpose: '',
  loan_type: '',
  amount: '500000',
  full_name: '',
  mobile: '',
  profession: '',
  company_name: '',
  business_name: '',
  total_area: '',
  area_unit: '',
  is_mobile_verified: false,
  is_submitted: false,
  units: '',
  whatsApp: true,
  stage_unit: '',
  construction_stage: '',
  ap_id: '',
  other_stage: '',
  place: '',
  visit_outcome: '',
  remarks: '',
  follow_up_date: '',
};

const VisitTracker = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const { token, loData, loAllDetails } = useContext(AuthContext);
  const [allVisits, setAllVisits] = useState([]);
  const [selectedLO, setSelectedLO] = useState({ label: 'All', value: '' });
  const [hasSentOTPOnce, setHasSentOTPOnce] = useState(false);
  const { setLoList } = useContext(LeadContext);
  const [loList, setloList] = useState([]);
  const [filterVisit, setFilterVisit] = useState([]);
  const [date, setDate] = useState(null);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [verifiedOnce, setVerifiedOnce] = useState(false);
  const [editVisit, setEditVisit] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [location, setLocation] = useState(null);
  const DISALLOW_NUM = ['0', '1', '2', '3', '4', '5'];
  const [selfie, setSelfie] = useState([]);
  const [selfieFile, setSelfieFile] = useState(null);
  const [selfieUploads, setSelfieUploads] = useState(null);
  const [selfieError, setSelfieError] = useState('');
  const [selfieLoader, setSelfieLoader] = useState(false);
  const [loSelfieLatLong, setLoSelfieLatLong] = useState(null);
  const [visitId, setVisitId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [selectionRange, setSelectionRange] = useState({
    startDate: parseISO(moment().subtract(30, 'days').format()),
    endDate: parseISO(moment().format()),
    key: 'selection',
  });

  function success(pos) {
    setLocation(pos);
  }

  const findLocation = () => {
    let userLocation = navigator.geolocation;
    if (userLocation) {
      userLocation.getCurrentPosition(success, (error) => {
        console.log('Location is not enabled');
      });
    } else {
      console.log('Geolocation not supported');
    }
  };

  const formik = useFormik({
    initialValues: initialValue,
    validationSchema: visitSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      if (values?.whatsApp && !values?.is_mobile_verified) {
        formik.setFieldError('mobile', 'Mobile verification is mandatory');
        return;
      }
      console.log('documentMeta', selfieUploads);

      const payload = {
        ...values,
        amount: values.amount || undefined,
        geo_lat: location.coords.latitude,
        geo_long: location.coords.longitude,
        company_name: values.profession === 'Salaried' ? values.company_name : '',
        business_name: values.profession === 'Self Employed' ? values.business_name : '',
        follow_up_date: values.visit_outcome === 'Follow-up Requested' ? values.follow_up_date : '',
        remarks: values.visit_outcome === 'Not Interested' ? values.remarks : '',
        construction_stage: values.purpose === 'Builder Visit' ? values.construction_stage : '',
        other_stage: values.construction_stage === 'Other' ? values.other_stage : '',
        total_area: values.purpose === 'Builder Visit' ? values.total_area : '',
        units: values.purpose === 'Builder Visit' ? values.units : '',
        loan_type: ['Login Visit', 'Customer Visit', 'Builder Visit'].includes(values.purpose)
          ? values.loan_type
          : '',
        profession: ['Login Visit', 'Customer Visit'].includes(values.purpose)
          ? values.profession
          : '',
        ap_id: values.purpose === 'Collection Visit' ? values.ap_id : '',
        lo_id: loData?.user?.id,
      };

      try {
        setFormSubmitting(true);
        const response = await createVisit(payload, {
          headers: { Authorization: token },
        });

        if (!response?.success || !response?.data?.id) {
          throw new Error('Visit creation failed');
        }

        const visitId = response.data.id;
        console.log(' i am visit id', visitId);

        if (selfieFile) {
          await uploadSelfieWithVisitId(visitId);
        } else {
          setSelfieError('Selfie not uploaded');
        }
        
        formik.resetForm({ values: initialValue });
        setVisitId(visitId);
        getAllVisitsData();
        setShow(false);
      } catch (error) {
        console.error('Error creating visit:', error);
      } finally {
        setFormSubmitting(false);
      }
    },
  });

  const {
    values,
    setFieldValue,
    errors,
    handleBlur,
    setFieldTouched,
    touched,
    handleSubmit,
    setValues,
    setFieldError,
  } = formik;

  const handleChange = (field, value) => {
    console.log(field, value);
    setFieldValue(field, value);
  };
  const test1 = async (mobile_number) => {
    const data = { mobile_number: mobile_number };
    const result = await lo_check(data);
    console.log('lo_check', result['message']);
    return result['message'];
  };
  const handleOnPhoneNumberChange = useCallback(
    async (e) => {
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
      if (phoneNumber.length === 10) {
        test1(phoneNumber).then((lo_identified) => {
          console.log('lo_identified->', lo_identified);
          if (lo_identified === 'User found') {
            setFieldError(`mobile`, 'LO login not allowed');
            setHasSentOTPOnce(true);
          }
        });
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
      setFieldValue(`mobile`, phoneNumber);

      if (phoneNumber.length === 10) {
        setHasSentOTPOnce(false);
      }
    },
    [values],
  );

  const handleTextInputChange = useCallback(
    (e) => {
      const value = e.currentTarget.value;
      const pattern = /[^a-zA-Z.\s]/;
      if (pattern.test(value)) return;

      const name = e?.currentTarget?.name;
      if (!name) return;

      const formatted = value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
      setFieldValue(name, formatted);
    },
    [setFieldValue],
  );

  const getAllVisitsData = async () => {
    try {
      setLoading(true);
      const { data } = await getAllVisits(
        {
          fromDate: selectionRange.startDate,
          toDate: moment(selectionRange.endDate).add(1, 'day'),
          query,
          lo_id: selectedLO?.value,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      setAllVisits(data || []);
      setFilterVisit(data || []);
      setLoading(false);
      console.log(data);
    } catch (error) {
      console.log('error', error);
    }
  };
  useEffect(() => {
    findLocation();
    getAllVisitsData();
  }, [selectionRange, selectedLO]);

  useEffect(() => {
    setFieldValue('whatsApp', true);
  }, [setFieldValue]);

  const getSigleVisitData = async (id) => {
    try {
      const { data } = await getSingleVisit(id, {
        headers: { Authorization: token },
      });
      if (data) {
        console.log('ttttttr', data);
        const activeSelfie = data?.document_meta?.data?.active === true;

        if (activeSelfie) {
          setSelfieUploads({
            type: 'lo_selfie',
            data: data?.document_meta?.data,
          });
        } else {
          setSelfieUploads(null);
        }

        setEditVisit(data);
        setValues(data);

        setShow(true);
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  const isCollectionVisit = values?.purpose === 'Collection Visit';
  const isBuilderVisit = values?.purpose === 'Builder Visit';
  const isLoginOrCustomerVisit =
    values?.purpose === 'Login Visit' || values?.purpose === 'Customer Visit';

  const checkFollowUpDate = async (date) => {
    setFieldTouched('follow_up_date', true, false);

    if (!date) {
      setFieldValue('follow_up_date', '', false);
      setFieldError('follow_up_date', 'Please select a date');
      return;
    }

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < currentDate) {
      setFieldValue('follow_up_date', '', false);
      setFieldError('follow_up_date', 'Follow-up date must be in the future');
      return;
    }
    setFieldError('follow_up_date', undefined);
    setFieldValue('follow_up_date', date, false);
  };

  const onDatePickerBlur = (e) => {
    let date = moment(e.target.value, 'DD/MM/YYYY').format('YYYY-MM-DD');
    checkFollowUpDate(date);
  };
  useEffect(() => {
    if (values?.follow_up_date.length) {
      var dateParts = values?.follow_up_date.split('-');
      var day = parseInt(dateParts[2], 10);
      var month = parseInt(dateParts[1], 10);
      var year = parseInt(dateParts[0], 10);
      setDate(`${day}/${month}/${year}`);
    }
  }, [values?.follow_up_date]);

  const lo_details = async () => {
    const response = await getLODetails(
      {},
      {
        headers: {
          Authorization: token,
        },
      },
    );
    function getFullName(details) {
      const middleName = details.middle_name ? ` ${details.middle_name} ` : ' ';
      const last_name = details?.last_name ? `${details.last_name}` : '';
      return `${details.first_name}${middleName}${last_name}`;
    }

    const options = response.lo_details.map((detail) => {
      const label = getFullName(detail).trim();
      const value = label.toLowerCase() === 'all' ? '' : detail.id;
      return { label, value };
    });
    console.log('options', options);
    setloList(options);
    setLoList(options?.filter((ele) => ele?.label?.trim() !== 'All'));
  };

  useEffect(() => {
    if (token) {
      lo_details();
    }
  }, [token]);

  const handleLOChange = (option) => {
    setSelectedLO({ ...option });
  };

  const uploadSelfieWithVisitId = async (visitId) => {
    try {
      if (!selfieFile) {
        console.warn('No selfie file found');
        return;
      }

      if (!(selfieFile instanceof File)) {
        console.error('Selfie is not a File:', selfieFile);
        setSelfieError('Invalid selfie file. Please re-upload.');
        return;
      }

      if (selfieFile.size > 5000000) {
        setSelfieError('File size should be less than 5MB');
        return;
      }
      console.log('SELFIE FILE:', selfieFile);
      console.log('visitID', visitId);
      console.log('IS FILE:', selfieFile instanceof File);
      const watermarkedImage = await generateImageWithTextWatermark(
        visitId,
        null,
        loAllDetails?.employee_code,
        loAllDetails?.first_name,
        loAllDetails?.middle_name,
        loAllDetails?.last_name,
        loSelfieLatLong?.lat,
        loSelfieLatLong?.long,
        selfieFile,
      );
      console.log('watermarkedImage', watermarkedImage);
      // return;
      const data = new FormData();
      data.append('document_type', 'lo_selfie');
      data.append('document_name', watermarkedImage.name);
      data.append('geo_lat', loSelfieLatLong?.lat);
      data.append('geo_long', loSelfieLatLong?.long);
      data.append('visitId', visitId);
      data.append('file', watermarkedImage);

      const res = await uploadDoc(data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token,
        },
      });

      if (res?.document) {
        setSelfieUploads({
          type: 'lo_selfie',
          data: {
            ...res.document,
            active: true,
          },
        });
        await updateVisit(
          visitId,
          {
            document_meta: {
          type: 'lo_selfie',
          data: {
            ...res.document,
            active: true,
          },
        },
          },
          {
            headers: { Authorization: token },
          },
        );
      }

      console.log('resposneee', res);
    } catch (err) {
      console.error('Selfie upload failed:', err);
      setSelfieError('Selfie upload failed. Please retry.');
    }
  };

  const sendMobileOtp = async () => {
    const otpRes = await getVisitMobileOtp(
      values?.mobile,
      {
        name: `${loData?.user?.first_name || ''} ${loData?.user?.middle_name || ''} ${loData?.user?.last_name || ''}`
          .replace(/\s+/g, ' ')
          .trim(),
        username: loData?.user?.username,
      },
      {
        headers: {
          Authorization: token,
        },
      },
    );

    if (otpRes) {
      setShowOTPInput(true);
      setHasSentOTPOnce(true);
    }
  };
  const verifyOTP = async (otp) => {
    verifyVisitMobileOtp(
      { mobile: values.mobile, otp },
      {
        headers: {
          Authorization: token,
        },
      },
    )
      .then(async (res) => {
        setFieldValue(`is_mobile_verified`, true);
        setShowOTPInput(false);
      })
      .catch((err) => {
        setFieldValue(`is_mobile_verified`, false);
        setShowOTPInput(true);
        setVerifiedOnce(true);
        console.log(err);
        //  setOtpFailCount(err.response.data.fail_count);
        return false;
      });
  };

  return (
    <div className='relative h-screen overflow-hidden'>
      <Header inputClasses='items-center justify-between'>
        <button
          onClick={() => {
            loData?.user?.role === 'Branch Manager' ? navigate('/branch-manager') : navigate('/');
          }}
          className='p-[6px] self-start'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='15'
            height='15'
            fill='none'
            viewBox='0 0 12 12'
          >
            <g stroke='#373435' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5'>
              <path d='M11 1L1 11'></path>
              <path d='M1 1l10 10'></path>
            </g>
          </svg>
        </button>
      </Header>
      <div className='flex justify-between p-4 items-center'>
        <div className='flex items-center'>
          <h4 className='text-[22px] not-italic font-medium text-primary-black'>{t('Visit')}</h4>
          <span className='text-xs not-italic font-normal text-primary-black ml-[6px]'>
            {`(${filterVisit?.length || 0})`}
          </span>
        </div>
        <div>
          <DateRangePicker selectionRange={selectionRange} setSelectionRange={setSelectionRange} />
        </div>
      </div>
      <div className='px-4 pb-4'>
        {loData?.user?.role === 'Branch Manager' && (
          <div className='flex items-center gap-2 w-full'>
            <h4 className='text-lg sm:text-xl mb-4'>Los</h4>
            <DropDown
              name='LO Name'
              options={loList}
              placeholder='Loan Officer Name'
              loSelect={handleLOChange}
              onChange={handleLOChange}
              selected={selectedLO}
              className='flex-grow'
            />
          </div>
        )}
        <Searchbox
          query={query}
          setQuery={setQuery}
          disabled={loading}
          handleReset={() => {
            setQuery('');
            console.log('allvsit', allVisits);
            setFilterVisit(allVisits);
          }}
          prompt='Search for name'
          handleSearchQuery={async (e) => {
            e.preventDefault();
            const result = await searchVisit(
              query,
              selectionRange.startDate,
              moment(selectionRange.endDate).add(1, 'day'),
              selectedLO?.value || loData?.user.id,
              {
                headers: {
                  Authorization: token,
                },
              },
            );
            console.log('Got results', result);
            setFilterVisit(result?.data);
          }}
        />
      </div>
      {!loading ? (
        <div className='px-4 h-full pt-4 bg-[#FAFAFA] overflow-auto'>
          {filterVisit?.length === 0 ? (
            <div className='relative flex-1 flex h-full justify-center translate-y-20'>
              <NoLeadIllustration />
            </div>
          ) : filterVisit?.length ? (
            <div className='relative flex-1 flex flex-col gap-2'>
              {filterVisit.map(({ full_name, id, created_at, mobile, place }, i) => {
                return (
                  <div className='' onClick={() => getSigleVisitData(id)} key={i}>
                    <VisitCard
                      key={i}
                      place={place}
                      id={id}
                      title={full_name || ''}
                      created={moment(created_at).format('DD/MM/YYYY')}
                      mobile={mobile || ''}
                    />
                  </div>
                );
              })}
              <div className='h-[250px]'></div>
            </div>
          ) : (
            <div className='relative flex-1 flex h-full justify-center translate-y-20'>
              <NoSearchResultIllustration />
            </div>
          )}
        </div>
      ) : (
        <div className='absolute flex items-center w-full dashBoardLoaderHeight bg-white'>
          <LoaderDynamicText text='Loading...' textColor='black' height='60%' />
        </div>
      )}
      <div>
        <FormPopUp
          title='Visit Tracker'
          actionMsg='Save'
          className='!flex
    !w-[95%] overflow-hidden
  md:!w-[600px] '
          showpopup={show}
          hideAction={editVisit ? true : false}
          setShowPopUp={setShow}
          handleActionClick={handleSubmit}
          handleResetAction={() => {
            formik.resetForm({
              values: {
                ...initialValue,
              },
            });
            setSelfieFile(null);
            setSelfie([]);
            setSelfieError('');
            setSelfieUploads(null);
          }}
        >
          {formSubmitting && (
            <div className='absolute inset-0 flex items-center justify-center bg-white z-50'>
              <LoaderDynamicText text='' textColor='black' height='60%' />
            </div>
          )}
          <div className='p-6 overflow-y-scroll overflow-x-hidden !relative'>
            <DropDown
              label='Purpose of Visit'
              name='purpose'
              placeholder='Choose purpose of visit'
              value={values?.purpose}
              required
              options={[
                { value: 'Login Visit', label: 'Login Visit' },
                { value: 'Cold Calling', label: 'Cold Calling' },
                { value: 'Connector Visit', label: 'Connector Visit' },
                { value: 'DSA Visit', label: 'DSA Visit' },
                { value: 'Collection Visit', label: 'Collection Visit' },
                { value: 'Customer Visit', label: 'Customer Visit' },
                { value: 'Builder Visit', label: 'Builder Visit' },
              ]}
              onChange={(val) => handleChange('purpose', val)}
              error={errors.purpose}
              onBlur={handleBlur}
              touched={touched.purpose}
              disabled={editVisit}
              defaultSelected={values.purpose}
              inputClasses='flex-1'
            />

            {(isLoginOrCustomerVisit || isBuilderVisit) && (
              <>
                <label className='font-medium'>
                  Loan Type <span className='text-primary-red'>*</span>
                </label>

                <div className='grid grid-cols-2 gap-x-4'>
                  {visitLoanTypeOptions.map((opt) => (
                    <CardRadio
                      key={opt.value}
                      label={opt.label}
                      value={opt.value}
                      disabled={editVisit}
                      name='loan_type'
                      current={values.loan_type}
                      onChange={(val) => handleChange('loan_type', val?.value)}
                      error={errors.loan_type}
                      touched={touched.loan_type}
                    >
                      {opt.icon}
                    </CardRadio>
                  ))}
                  {errors?.loan_type && touched?.loan_type && (
                    <span className='text-xs text-primary-red w-full block'>
                      {errors?.loan_type}
                    </span>
                  )}
                </div>

                <CurrencyInput
                  label='Required Loan Amount'
                  name='amount'
                  disabled={editVisit}
                  required
                  value={values.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  onBlur={handleBlur}
                  error={errors.amount}
                  touched={touched.amount}
                />
                <RangeSlider
                  minValueLabel='5 L'
                  disabled={editVisit}
                  maxValueLabel='75 L'
                  onChange={(e) => {
                    if (e.currentTarget.value > 7500000) {
                      return;
                    }
                    handleChange('amount', e.currentTarget.value);
                  }}
                  initialValue={values?.amount}
                  min={500000}
                  max={7500000}
                  step={50000}
                />
              </>
            )}
            <TextInput
              label='Full Name'
              disabled={editVisit}
              name='full_name'
              required
              placeholder='Eg: Suresh,Priya'
              value={values.full_name}
              onChange={handleTextInputChange}
              onBlur={handleBlur}
              error={errors.full_name}
              touched={touched.full_name}
            />

            <TextInputWithSendOtp
              type='tel'
              inputClasses='hidearrow'
              label='Mobile Number'
              disabled={values?.is_mobile_verified}
              placeholder='Eg: 1234567890'
              required
              name='mobile'
              value={values.mobile}
              onChange={handleOnPhoneNumberChange}
              disabledOtpButton={
                !values.mobile ||
                !values?.full_name ||
                !values?.purpose ||
                !!errors?.mobile ||
                values?.is_mobile_verified ||
                !values?.whatsApp ||
                hasSentOTPOnce ||
                editVisit
              }
              error={errors.mobile}
              touched={touched.mobile}
              onBlur={(e) => {
                handleBlur(e);
                test1(values?.mobile).then((lo_identified) => {
                  console.log('lo_identified->', lo_identified);
                  if (lo_identified === 'User found') {
                    setFieldError(`mobile`, 'LO login not allowed');
                    setHasSentOTPOnce(true);
                  }
                });
              }}
              onOTPSendClick={sendMobileOtp}
              pattern='\d*'
              onFocus={(e) =>
                e.target.addEventListener(
                  'wheel',
                  function (ev) {
                    ev.preventDefault();
                  },
                  { passive: false },
                )
              }
              min='0'
              onInput={(e) => {
                if (!e.currentTarget.validity.valid) e.currentTarget.value = '';
              }}
              message={
                values?.is_mobile_verified
                  ? `<svg

                width='18'

                height='18'

                viewBox='0 0 18 18'

                fill='none'

                xmlns='http://www.w3.org/2000/svg'

            >

                <path

                    d='M15 4.5L6.75 12.75L3 9'

                    stroke='#147257'

                    strokeWidth='1.5'

                    strokeLinecap='round'

                    strokeLinejoin='round'

                />

            </svg> OTP Verfied`
                  : null
              }
            />
            {showOTPInput && (
              <OtpInput
                label='Enter OTP'
                required
                verified={values?.is_mobile_verified}
                verifiedOnce={verifiedOnce}
                setVerifiedOnce={setVerifiedOnce}
                onSendOTPClick={sendMobileOtp}
                defaultResendTime={30}
                disableSendOTP={!values?.is_mobile_verified}
                verifyOTPCB={verifyOTP}
                hasSentOTPOnce={hasSentOTPOnce}
                mobile={values?.mobile}
                // applicant_id = {values?.applicants?.[activeIndex]?.applicant_details?.id}
              />
            )}
            <div className='flex items-center gap-2 mb-3'>
              <Checkbox
                disabled={editVisit}
                checked={values.whatsApp}
                onChange={(e) => setFieldValue('whatsApp', e.target.checked)}
              />
              <span className='text-xs font-medium'>Send WhatsApp</span>
            </div>

            {isLoginOrCustomerVisit && (
              <>
                <label className='font-medium mt-4'>
                  Profession <span className='text-primary-red'>*</span>
                </label>

                <div className='flex gap-4'>
                  {professionOptions.map((opt) => (
                    <CardRadio
                      key={opt.value}
                      label={opt.label}
                      disabled={editVisit}
                      value={opt.value}
                      name='profession'
                      current={values.profession}
                      onChange={(val) => handleChange('profession', val?.value)}
                      error={errors.profession}
                      touched={touched.profession}
                    >
                      {opt.icon}
                    </CardRadio>
                  ))}
                </div>

                {values.profession === 'Salaried' && (
                  <TextInput
                    label='Company Name'
                    name='company_name'
                    required
                    disabled={editVisit}
                    placeholder='India Shelter Finance Pvt. Ltd.'
                    value={values.company_name}
                    onChange={handleTextInputChange}
                    onBlur={handleBlur}
                    error={errors.company_name}
                    touched={touched.company_name}
                  />
                )}

                {values.profession === 'Self Employed' && (
                  <TextInput
                    label='Business Name'
                    name='business_name'
                    required
                    disabled={editVisit}
                    placeholder='India Shelter Finance'
                    value={values.business_name}
                    onChange={handleTextInputChange}
                    onBlur={handleBlur}
                    error={errors.business_name}
                    touched={touched.business_name}
                  />
                )}
              </>
            )}

            {isBuilderVisit && (
              <div>
                <div>
                  <label
                    htmlFor='total-area'
                    className='flex gap-0.5 font-medium text-primary-black'
                  >
                    Total Area <span className='text-primary-red text-xs'>*</span>
                  </label>

                  <div className='flex flex-col sm:flex-row gap-3 w-full'>
                    <TextInput
                      type='number'
                      pattern='\d*'
                      name='total_area'
                      disabled={editVisit}
                      onBlur={handleBlur}
                      value={values.total_area}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        const pattern = /[^\d]/g;
                        if (pattern.test(value)) return;
                        handleChange('total_area', value);
                      }}
                      error={errors.total_area}
                      touched={touched.total_area}
                      divClasses='flex-1'
                      placeholder='Enter total area'
                    />

                    <DropDown
                      placeholder='ex: Sq. Ft'
                      name='area_unit'
                      disabled={editVisit}
                      options={[
                        { value: 'sqft', label: 'Sq. Ft' },
                        { value: 'acres', label: 'Acres' },
                      ]}
                      inputClasses='w-full sm:w-40'
                      onChange={(val) => handleChange('area_unit', val)}
                      error={errors.area_unit}
                      onBlur={handleBlur}
                      touched={touched.area_unit}
                      defaultSelected={values.area_unit}
                    />
                  </div>
                </div>

                <div className=''>
                  <label
                    htmlFor='Number of Units'
                    className='flex gap-0.5 font-medium text-primary-black'
                  >
                    Number of Units <span className='text-primary-red text-xs'>*</span>
                  </label>

                  <div className='flex flex-col sm:flex-row gap-3 w-full'>
                    <TextInput
                      disabled={editVisit}
                      type='number'
                      pattern='\d*'
                      name='units'
                      onBlur={handleBlur}
                      value={values.units}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        const pattern = /[^\d]/g;
                        if (pattern.test(value)) return;
                        handleChange('units', value);
                      }}
                      error={errors.units}
                      touched={touched.units}
                      divClasses='flex-1'
                      placeholder='Enter number of units'
                    />

                    <DropDown
                      placeholder='ex: Launched'
                      disabled={editVisit}
                      name='stage_unit'
                      options={[
                        { value: 'launched', label: 'Launched' },
                        { value: 'proposed', label: 'Proposed' },
                      ]}
                      inputClasses='w-full sm:w-40'
                      onChange={(val) => handleChange('stage_unit', val)}
                      error={errors.stage_unit}
                      onBlur={handleBlur}
                      touched={touched.stage_unit}
                      defaultSelected={values.stage_unit}
                    />
                  </div>
                </div>
                <DropDown
                  label='Stage of Construction'
                  name='construction_stage'
                  disabled={editVisit}
                  placeholder='Choose stage of construction'
                  required
                  options={[
                    { value: 'Land Acquisition', label: 'Land Acquisition' },
                    { value: 'Foundation', label: 'Foundation' },
                    { value: 'Structure', label: 'Structure' },
                    { value: 'Finishing', label: 'Finishing' },
                    { value: 'Ready', label: 'Ready' },
                    { value: 'Other', label: 'Other' },
                  ]}
                  inputClasses='flex-1'
                  onChange={(val) => handleChange('construction_stage', val)}
                  error={errors.construction_stage}
                  onBlur={handleBlur}
                  touched={touched.construction_stage}
                  defaultSelected={values.construction_stage}
                />

                {values?.construction_stage === 'Other' && (
                  <TextInput
                    label='Other Stage'
                    placeholder='Enter Other stage of construction'
                    name='other_stage'
                    disabled={editVisit}
                    onBlur={handleBlur}
                    value={values.other_stage}
                    onChange={handleTextInputChange}
                    error={errors.other_stage}
                    touched={touched.other_stage}
                    required
                  />
                )}
              </div>
            )}

            {isCollectionVisit && (
              <TextInput
                label='AP ID'
                disabled={editVisit}
                name='ap_id'
                required
                value={values.ap_id}
                onChange={(e) => {
                  const { value, name } = e.target;
                  if (/[^a-zA-Z0-9-]/.test(value)) return;
                  const formatted = value.toUpperCase();
                  setFieldValue(name, formatted);
                }}
                onBlur={handleBlur}
                placeholder='Eg: AP-12345678'
                error={errors.ap_id}
                touched={touched.ap_id}
              />
            )}

            <TextInput
              label='Place of Visit'
              disabled={editVisit}
              placeholder='Eg: Raj Nagar'
              name='place'
              required
              value={values.place}
              onChange={handleTextInputChange}
              onBlur={handleBlur}
              error={errors.place}
              touched={touched.place}
            />

            <DropDown
              label='Visit Outcome'
              name='visit_outcome'
              disabled={editVisit}
              required
              placeholder='Summarize your visits in 150 characters'
              options={[
                { label: 'Interested', value: 'Interested' },
                { label: 'Follow-up Requested', value: 'Follow-up Requested' },
                { label: 'Salary Date', value: 'Salary Date' },
                { label: 'Site Visit', value: 'Site Visit' },
                { label: 'Converted to Login', value: 'Converted to Login' },
                { label: 'Not Interested', value: 'Not Interested' },
                { label: 'Fake', value: 'Fake' },
                { label: 'Already Taken', value: 'Already Taken' },
                { label: 'Not Reachable', value: 'Not Reachable' },
              ]}
              defaultSelected={values.visit_outcome}
              onChange={(val) => handleChange('visit_outcome', val)}
              error={errors.visit_outcome}
              touched={touched.visit_outcome}
            />

            {values.visit_outcome === 'Not Interested' && (
              <TextInput
                disabled={editVisit}
                label='Remarks'
                name='remarks'
                required
                value={values.remarks}
                onChange={handleTextInputChange}
                onBlur={handleBlur}
                error={errors.remarks}
                touched={touched.remarks}
              />
            )}

            {values.visit_outcome === 'Follow-up Requested' && (
              <DatePicker2
                label='Next Follow up Date'
                name='follow_up_date'
                disabled={editVisit}
                error={errors.follow_up_date}
                touched={touched.follow_up_date}
                value={date}
                onAccept={(date) => checkFollowUpDate(date)}
                onBlur={onDatePickerBlur}
                required
              />
            )}
            {editVisit ? (
              <SecureImage imageUrl={[selfieUploads?.data?.document_fetch_url]} token={token} />
            ) : (
              <div>
                <div className='flex justify-between gap-2'>
                  <ErrorBoundary>
                    <VisitSelfieUploader
                      visitId={visitId}
                      files={selfie}
                      setFile={setSelfie}
                      setSingleFile={setSelfieFile}
                      uploads={selfieUploads}
                      disabled={editVisit}
                      setUploads={setSelfieUploads}
                      setLatLong={setLoSelfieLatLong}
                      label='Upload selfie'
                      required
                      message={selfieError || errors?.lo_selfie}
                      setMessage={setSelfieError}
                      loader={selfieLoader}
                      setLoader={setSelfieLoader}
                    />
                  </ErrorBoundary>
                </div>
              </div>
            )}
          </div>
        </FormPopUp>
      </div>
      {loData?.user?.role !== 'Branch Manager' && (
        <button
          onClick={() => {
            setShow(true);
            setEditVisit(null);
          }}
          className='fixed bottom-4 right-6 z-50 w-fit inline-flex items-center gap-1 p-3 bg-primary-red rounded-full'
        >
          <AddLeadIcon />
          <span className='text-sm not-italic font-medium text-white'>Add Visit</span>
        </button>
      )}
    </div>
  );
};

export default VisitTracker;

function VisitCard({ title, id, mobile, created, place }) {
  return (
    <div
      className='rounded-lg border border-[#EBEBEB] bg-white p-3 flex flex-col gap-2 active:opacity-90'
      replace={true}
    >
      {' '}
      <div>
        <div className='flex justify-between'>
          <h4 className='overflow-hidden text-black text-sm not-italic font-normal'>
            {title || '-'}
          </h4>

          <div className='ml-auto'>
            <ArrowRightIcon2 />
          </div>
        </div>

        <div className='flex justify-between gap-4 items-center my-2'>
          <p className='not-italic font-medium text-[10px] leading-normal text-light-grey'>
            Visit ID:{' '}
            <span className='not-italic font-medium text-[10px] leading-normal text-dark-grey'>
              {id}
            </span>
          </p>
          <p className='not-italic font-medium text-[10px] leading-normal text-light-grey'>
            MOB NO:{' '}
            <span className='not-italic font-medium text-[10px] leading-normal text-dark-grey'>
              {mobile || '-'}
            </span>
          </p>
        </div>
        <div className='border-t-2 border-b-0 my-2 w-full'></div>

        <Separator />
        <div className='flex items-center justify-between'>
          <p className='not-italic font-medium text-[10px] leading-normal text-light-grey'>
            CREATED:{' '}
            <span className='not-italic font-medium text-[10px] leading-normal text-dark-grey'>
              {created}
            </span>
          </p>
          <p className='not-italic font-medium text-[10px] leading-normal text-light-grey'>
            LOCATION:{' '}
            <span className='not-italic font-medium text-[10px] leading-normal text-dark-grey'>
              {place || ''}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}