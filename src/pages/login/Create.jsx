import { useCallback, useContext, useEffect, useState } from 'react';
import TextInputWithSendOtp from '../../components/TextInput/TextInputWithSendOtp';
import { AuthContext } from '../../context/AuthContextProvider';
import { ToastMessage, Button, TextInput } from '../../components';
import {
  getOTPForResetPassword,
  isEighteenOrAbove,
  setPassword,
  verifyOTPForResetPassword,
} from '../../global';
import { Header } from '../../components';
import OtpInputNoEdit from '../../components/OtpInput/OtpInputNoEdit';
import ErrorTost from '../../components/ToastMessage/ErrorTost';
import TextInputWithEyeIcon from '../../components/TextInput/TextInputWithEyeIcon';
import AdminActionControl from '../../components/AdminActionControl';
import DatePicker2 from '../../components/DatePicker/DatePicker2';
import moment from 'moment';
import { validatePassword } from '../../utils';
import DynamicDrawer from '../../components/SwipeableDrawer/DynamicDrawer';

const DISALLOW_NUM = ['0', '1', '2', '3', '4', '5'];

export default function CreatePassword() {
  const {
    values,
    errors,
    touched,
    handleBlur,
    setFieldValue,
    setFieldError,
    setOtpFailCount,
    toastMessage,
    setToastMessage,
    setPhoneNumberList,
    errorToastMessage,
    setErrorToastMessage,
  } = useContext(AuthContext);

  const [showOTPInput, setShowOTPInput] = useState(false);
  const [hasSentOTPOnce, setHasSentOTPOnce] = useState(false);
  const [disablePhoneNumber, setDisablePhoneNumber] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(values?.is_mobile_verified);
  const [loginError, setLoginError] = useState('');
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const [resetPassword, setResetPassword] = useState(false);
  const [userPassword, setUserPassword] = useState({
    password: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);

  const [userData, setUserData] = useState({
    employee_code: '',
    date_of_birth: '',
  });
  const [userDataError, setUserDataError] = useState({
    employee_code: false,
    date_of_birth: false,
  });
  const [date, setDate] = useState(null);
  const [show, setShow] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);

  const handleOnPhoneNumberChange = useCallback(async (e) => {
    const phoneNumber = e.currentTarget.value;
    setLoginError('');
    const pattern = /^\d+$/;
    if (!pattern.test(phoneNumber) && phoneNumber.length > 0) {
      return;
    }

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

    setShowOTPInput(false);

    setFieldValue('username', phoneNumber);
    setPhoneNumberList((prev) => {
      return { ...prev, lo: phoneNumber };
    });

    if (phoneNumber.length === 10) {
      setHasSentOTPOnce(false);
    }
  }, []);

  const sendMobileOtp = async () => {
    setLoginError('');

    try {
      const otpResetPayload = {
        username: values.username,
        employee_code: userData.employee_code,
        date_of_birth: userData.date_of_birth,
      };

      const res = await getOTPForResetPassword(otpResetPayload);

      if (res.error) {
        setDisablePhoneNumber(false);
        setHasSentOTPOnce(false);
        setShowOTPInput(false);
        setErrorToastMessage(res.message);
        setLoginError(res.message);
        return;
      }

      setDisablePhoneNumber(true);
      setHasSentOTPOnce(true);
      setShowOTPInput(true);
      setLoginError('');
      setToastMessage('OTP has been sent to the mobile number');
    } catch (error) {
      console.log(error);
      if (error.response.data.status === 500) {
        setErrorToastMessage(
          'The information provided does not match the verified mobile number. Please input the correct employee code or date of birth',
        );
      }
    }
  };

  const verifyOTP = useCallback(
    async (loginotp) => {
      const otp = parseInt(loginotp);

      try {
        const otpResetPayload = {
          username: values.username,
          employee_code: userData.employee_code,
          date_of_birth: userData.date_of_birth,
          otp: otp,
        };

        const res = await verifyOTPForResetPassword(otpResetPayload);

        setUser(res.user);
        setToken(res.token);
        setDisablePhoneNumber(false);
        setMobileVerified(true);
        setFieldError('username', undefined);
        setShowOTPInput(false);
      } catch (err) {
        console.log(err);
        setMobileVerified(false);
        setOtpFailCount(err.response.data.fail_count);
      }
    },
    [
      values.username,
      setFieldError,
      setMobileVerified,
      userData.employee_code,
      userData.date_of_birth,
    ],
  );

  const checkDate = async (date) => {
    if (!date) {
      return;
    }

    const finalDate = date;
    let checkDate = date.toString();
    checkDate = checkDate.toUpperCase();

    if (checkDate === 'INVALID DATE') {
      setUserDataError({ ...userDataError, date_of_birth: 'Please enter a valid date' });

      setUserData({ ...userData, date_of_birth: '' });
    } else if (isEighteenOrAbove(finalDate)) {
      setUserDataError({ ...userDataError, date_of_birth: false });
      setUserData({ ...userData, date_of_birth: finalDate });
    } else {
      setUserDataError({
        ...userDataError,
        date_of_birth: 'Date of Birth is Required. Minimum age must be 18 or 18+',
      });

      setUserData({ ...userData, date_of_birth: '' });
    }
  };

  const onDatePickerBlur = (e) => {
    let date = moment(e.target.value, 'DD/MM/YYYY').format('YYYY-MM-DD');
    checkDate(date);
  };

  const handleSetPassword = async () => {
    try {
      const passwordPayload = {
        username: values.username,
        password: userPassword.password,
        token: token,
      };

      const res = await setPassword(passwordPayload);

      if (res) {
        setShowPopUp(true);
      }
    } catch (error) {
      console.log(error);
      setErrorToastMessage(error.response.data.message);
    }
  };

  const handleNavigate = () => {
    window.location.replace('/login');
  };

  const handleCopy = (event) => {
    event.preventDefault();
  };

  const handlePaste = (event) => {
    event.preventDefault();
  };

  const getDateString = () => {
    // let date = userData.date_of_birth;

    // date = date.split('').filter((char) => {
    //   if (char !== '-') return char;
    // });

    // date = date.join('');

    // return date;

    const date = moment(userData.date_of_birth);

    // Format the date to a string without hyphens and Year month day format
    const formatedDate = date.format('YYYYMMDD');

    return formatedDate;
  };

  const getReverseDateString = () => {
    // let date = userData.date_of_birth;

    // date = date.split('').filter((char) => {
    //   if (char !== '-') return char;
    // });

    // date = date.join('');

    // var reversedDate = date.substring(6, 8) + date.substring(4, 6) + date.substring(0, 4);

    // return reversedDate;

    const date = moment(userData.date_of_birth);

    // Format the date to a string without hyphens and Day month year format
    const formatedDate = date.format('DDMMYYYY');

    return formatedDate;
  };

  useEffect(() => {
    if (
      validatePassword(userPassword.password) &&
      !userPassword.password.toUpperCase().includes(userData.employee_code) &&
      !userPassword.password.includes(getDateString()) &&
      !userPassword.password.includes(getReverseDateString()) &&
      !userPassword.password.toLowerCase().includes(user.first_name?.toLowerCase()) &&
      (user.middle_name !== ''
        ? !userPassword.password.toLowerCase().includes(user.middle_name?.toLowerCase())
        : true) &&
      (user.last_name !== ''
        ? !userPassword.password.toLowerCase().includes(user.last_name?.toLowerCase())
        : true) &&
      !userPassword.password.includes(values.username)
    ) {
      setPasswordError(false);
    } else if (
      userPassword.password.toUpperCase().includes(userData.employee_code) ||
      userPassword.password.includes(getDateString()) ||
      userPassword.password.includes(getReverseDateString()) ||
      userPassword.password.toLowerCase().includes(user.first_name?.toLowerCase()) ||
      (user.middle_name !== '' &&
        userPassword.password.toLowerCase().includes(user.middle_name?.toLowerCase())) ||
      (user.last_name !== '' &&
        userPassword.password.toLowerCase().includes(user.last_name?.toLowerCase())) ||
      userPassword.password.includes(values.username)
    ) {
      if (userPassword.password.length !== 0) {
        setPasswordError('Create a strong password');
      } else {
        setPasswordError(false);
      }
    } else {
      if (userPassword.password.length !== 0) {
        setPasswordError(
          'Use minimum of 14 characters that includes at least one number, one uppercase letter, one lowercase letter, and one special character.',
        );
      } else {
        setPasswordError(false);
      }
    }
  }, [userPassword.password]);

  useEffect(() => {
    if (
      userPassword.password !== userPassword.confirmPassword &&
      userPassword.confirmPassword.length !== 0
    ) {
      setConfirmPasswordError('Passwords don’t match');
    } else {
      setConfirmPasswordError(false);
    }
  }, [userPassword.confirmPassword, userPassword.password]);

  useEffect(() => {
    if (userData.employee_code.length > 10) {
      setUserDataError({
        ...userDataError,
        employee_code: 'Emp code can be max 10 characters long',
      });
    } else {
      setUserDataError({
        ...userDataError,
        employee_code: false,
      });
    }
  }, [userData.employee_code]);

  return (
    <>
      <AdminActionControl
        title={'Password created'}
        subtitle={'You successfully created your password.'}
        actionMsg={'Back to login'}
        inputClasses={'hidden'}
        buttonClasses={'!w-full'}
        showpopup={showPopUp}
        setShowPopUp={setShowPopUp}
        handleActionClick={handleNavigate}
        hideClasses={'hidden md:block'}
      />

      <div className={`bg-[#CCE2BE] md:bg-white overflow-hidden h-[100vh] relative md:flex`}>
        <Header inputClasses='md:hidden' />

        <div className='md:hidden'>
          <img src='./IS-Login-Logo.png' alt='login-logo' />
        </div>

        <div className='hidden md:block w-[40%]'>
          <img
            src='./login-desktop.svg'
            alt='login-desktop-logo'
            className='object-cover object-center h-full'
          />
        </div>

        <div className='loginstyles absolute md:relative bottom-0 w-full md:w-[60%] md:px-20 md:pt-10 pb-[80px] md:pb-6 flex flex-col gap-2 md:gap-5 rounded-t-2xl md:rounded-[0px] bg-white overflow-auto no-scrollbar'>
          <ToastMessage message={toastMessage} setMessage={setToastMessage} />
          <ErrorTost message={errorToastMessage} setMessage={setErrorToastMessage} />

          {!resetPassword ? (
            <>
              <div>
                <h2 className='px-4 py-3 md:p-0 md:pb-3 text-primary-black text-xl font-semibold md:relative w-full md:w-auto bg-white md:bg-transparent top-0'>
                  Verify details
                </h2>
              </div>

              <TextInput
                label='Employee code'
                required
                name='employee_code'
                placeholder='Enter employee code'
                value={userData.employee_code}
                onChange={(e) => {
                  let value = e.target.value;
                  value = value.trimStart().replace(/\s\s+/g, ' ');
                  const pattern = /^[a-zA-Z0-9]*$/;
                  if (pattern.exec(value)) {
                    setUserData({ ...userData, employee_code: e.target.value.toUpperCase() });
                  }
                }}
                error={userDataError.employee_code}
                touched={userDataError.employee_code}
                onBlur={() => {
                  if (userData.employee_code.length === 0) {
                    setUserDataError({
                      ...userDataError,
                      employee_code: 'This field is mandatory',
                    });
                  }
                }}
                divClasses={'px-4 md:px-0'}
              />

              <DatePicker2
                value={date}
                required
                name='date_of_birth'
                label='Date of Birth'
                error={userDataError.date_of_birth}
                touched={userDataError.date_of_birth}
                onAccept={(e) => {
                  checkDate(e);
                }}
                onBlur={onDatePickerBlur}
                divClasses={'px-4 md:px-0'}
              />

              <TextInputWithSendOtp
                type='tel'
                hint='An OTP will be sent to the given mobile number'
                inputClasses='hidearrow'
                label='Mobile Number'
                placeholder='Eg: 1234567890'
                required
                name='username'
                value={values.username}
                onChange={handleOnPhoneNumberChange}
                error={errors.username || loginError}
                touched={touched.username}
                onOTPSendClick={sendMobileOtp}
                disabledOtpButton={
                  !values.username || !!errors.username || mobileVerified || hasSentOTPOnce
                }
                disabled={disablePhoneNumber || mobileVerified}
                message={
                  mobileVerified
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
                onBlur={(e) => {
                  handleBlur(e);
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
                onInput={(e) => {
                  if (!e.currentTarget.validity.valid) e.currentTarget.value = '';
                }}
                divClasses={'px-4 md:px-0'}
              />

              {showOTPInput && (
                <OtpInputNoEdit
                  label='Enter OTP'
                  required
                  verified={mobileVerified}
                  setOTPVerified={setMobileVerified}
                  onSendOTPClick={sendMobileOtp}
                  defaultResendTime={30}
                  disableSendOTP={!mobileVerified}
                  verifyOTPCB={verifyOTP}
                  hasSentOTPOnce={hasSentOTPOnce}
                  divClasses={'px-4 md:px-0'}
                />
              )}
            </>
          ) : (
            <>
              <div className='px-4 py-3 md:p-0 w-full md:w-auto bg-white md:bg-transparent top-0'>
                <h2 className='text-primary-black font-semibold text-xl'>Create new password</h2>
                <p className='text-dark-grey font-normal text-xs md:text-sm mt-1 md:mt-0'>
                  Your password will expire in 90 days
                </p>
              </div>

              <TextInput
                label='New Password'
                required
                placeholder='Enter password'
                type='password'
                name='password'
                value={userPassword.password}
                onChange={(e) => {
                  setUserPassword({ ...userPassword, password: e.target.value });
                }}
                error={passwordError}
                touched={passwordError}
                onCopy={handleCopy}
                onPaste={handlePaste}
                min='0' // handle mousewheel down
                divClasses={'px-4 md:px-0'}
              />

              <TextInput
                label='Confirm new password'
                required
                placeholder='Confirm new password'
                type='text'
                name='confirmPassword'
                value={userPassword.confirmPassword}
                onChange={(e) => {
                  setUserPassword({ ...userPassword, confirmPassword: e.target.value });
                }}
                error={confirmPasswordError}
                touched={confirmPasswordError}
                onCopy={handleCopy}
                onPaste={handlePaste}
                min='0' // handle mousewheel down
                divClasses={'px-4 md:px-0'}
              />

              <div className='px-4 md:px-0'>
                <p
                  className={`flex items-center gap-1.5 text-xs md:text-sm font-normal mt-2 ${
                    passwordError ||
                    userPassword.password.length === 0 ||
                    confirmPasswordError ||
                    userPassword.confirmPassword.length === 0
                      ? 'text-dark-grey'
                      : 'text-secondary-green'
                  }`}
                >
                  {passwordError ||
                  userPassword.password.length === 0 ||
                  confirmPasswordError ||
                  userPassword.confirmPassword.length === 0 ? (
                    <div className='min-w-[14px] flex self-start mt-1'>
                      <svg
                        width='14'
                        height='14'
                        viewBox='0 0 14 14'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <circle cx='7' cy='7' r='6.5' stroke='#96989A' />
                        <path
                          d='M4.2002 7.86757L5.61076 8.93394C5.94169 9.18411 6.42165 9.14701 6.70516 8.84934L9.80019 5.59961'
                          stroke='#96989A'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className='min-w-[14px] flex self-start mt-1'>
                      <svg
                        width='14'
                        height='15'
                        viewBox='0 0 14 15'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <circle cx='7' cy='7.5' r='6.5' stroke='#147257' />
                        <path
                          d='M4.2002 8.36757L5.61076 9.43394C5.94169 9.68411 6.42165 9.64701 6.70516 9.34934L9.80019 6.09961'
                          stroke='#147257'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                    </div>
                  )}
                  Use minimum of 14 characters that includes at least one number, one uppercase
                  letter, one lowercase letter, and one special character.
                </p>

                <p
                  className={`flex items-center gap-1.5 text-xs md:text-sm font-normal mt-2 ${
                    passwordError ||
                    userPassword.password.length === 0 ||
                    confirmPasswordError ||
                    userPassword.confirmPassword.length === 0
                      ? 'text-dark-grey'
                      : 'text-secondary-green'
                  }`}
                >
                  {passwordError ||
                  userPassword.password.length === 0 ||
                  confirmPasswordError ||
                  userPassword.confirmPassword.length === 0 ? (
                    <div className='min-w-[14px] flex self-start mt-1'>
                      <svg
                        width='14'
                        height='14'
                        viewBox='0 0 14 14'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <circle cx='7' cy='7' r='6.5' stroke='#96989A' />
                        <path
                          d='M4.2002 7.86757L5.61076 8.93394C5.94169 9.18411 6.42165 9.14701 6.70516 8.84934L9.80019 5.59961'
                          stroke='#96989A'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className='min-w-[14px] flex self-start mt-1'>
                      <svg
                        width='14'
                        height='15'
                        viewBox='0 0 14 15'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <circle cx='7' cy='7.5' r='6.5' stroke='#147257' />
                        <path
                          d='M4.2002 8.36757L5.61076 9.43394C5.94169 9.68411 6.42165 9.64701 6.70516 9.34934L9.80019 6.09961'
                          stroke='#147257'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                    </div>
                  )}
                  Avoid easily guessable information like names or phone numbers.
                </p>

                <p
                  className={`flex items-center gap-1.5 text-xs md:text-sm font-normal mt-2 ${
                    passwordError ||
                    userPassword.password.length === 0 ||
                    confirmPasswordError ||
                    userPassword.confirmPassword.length === 0
                      ? 'text-dark-grey'
                      : 'text-secondary-green'
                  }`}
                >
                  {passwordError ||
                  userPassword.password.length === 0 ||
                  confirmPasswordError ||
                  userPassword.confirmPassword.length === 0 ? (
                    <div className='min-w-[14px] flex self-start mt-1'>
                      <svg
                        width='14'
                        height='14'
                        viewBox='0 0 14 14'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <circle cx='7' cy='7' r='6.5' stroke='#96989A' />
                        <path
                          d='M4.2002 7.86757L5.61076 8.93394C5.94169 9.18411 6.42165 9.14701 6.70516 8.84934L9.80019 5.59961'
                          stroke='#96989A'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className='min-w-[14px] flex self-start mt-1'>
                      <svg
                        width='14'
                        height='15'
                        viewBox='0 0 14 15'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <circle cx='7' cy='7.5' r='6.5' stroke='#147257' />
                        <path
                          d='M4.2002 8.36757L5.61076 9.43394C5.94169 9.68411 6.42165 9.64701 6.70516 9.34934L9.80019 6.09961'
                          stroke='#147257'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                    </div>
                  )}
                  Don’t use identical characters like all-numeric, or all-alphabetical groups.
                </p>
              </div>
            </>
          )}

          <div className='mt-auto flex justify-end fixed md:relative bottom-0 w-full md:w-auto bg-white md:bg-transparent'>
            {!resetPassword ? (
              <Button
                disabled={
                  !mobileVerified ||
                  !userData.employee_code ||
                  !userData.date_of_birth ||
                  userDataError.employee_code ||
                  userDataError.date_of_birth
                }
                primary
                inputClasses='h-12 w-full m-4 md:m-0'
                onClick={() => setResetPassword(true)}
              >
                Create password
              </Button>
            ) : (
              <Button
                disabled={
                  passwordError ||
                  userPassword.password.length === 0 ||
                  confirmPasswordError ||
                  userPassword.confirmPassword.length === 0
                }
                primary
                inputClasses='h-12 w-full m-4 md:m-0'
                onClick={handleSetPassword}
              >
                Confirm password
              </Button>
            )}
          </div>
        </div>
      </div>

      <DynamicDrawer
        open={showPopUp}
        height='180px'
        optionalSheetHandlerClasses={'hidden'}
        drawerChildrenClasses={'!p-0 md:!hidden'}
      >
        <div className='flex gap-1 w-full'>
          <div className='w-full'>
            <h4 className='py-3 px-4 text-center text-xl not-italic font-semibold text-primary-black'>
              Password created
            </h4>
            <hr />
            <p className='text-center text-sm not-italic font-normal text-primary-black py-4 px-4'>
              You successfully created your password.
            </p>
          </div>
        </div>
        <div className='w-full flex gap-4 px-4'>
          <Button primary={true} inputClasses=' w-full h-12' onClick={handleNavigate}>
            Back to login
          </Button>
        </div>
      </DynamicDrawer>
    </>
  );
}
