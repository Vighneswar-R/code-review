import { useCallback, useContext, useEffect, useState } from 'react';
import TextInputWithSendOtp from '../../components/TextInput/TextInputWithSendOtp';
import { AuthContext } from '../../context/AuthContextProvider';
import { ToastMessage, Button } from '../../components';
import {
  checkLoanOfficerExists,
  getContestUrl,
  getLoginOtp,
  getOTPonCall,
  getUserById,
  logout,
  verifyLoginOtp,
} from '../../global';
import DynamicDrawer from '../../components/SwipeableDrawer/DynamicDrawer';
import { Header } from '../../components';
import { Link, useNavigate } from 'react-router-dom';
import OtpInputNoEdit from '../../components/OtpInput/OtpInputNoEdit';
import ErrorTost from '../../components/ToastMessage/ErrorTost';
import TextInputWithEyeIcon from '../../components/TextInput/TextInputWithEyeIcon';
import AdminActionControl from '../../components/AdminActionControl';
import { validatePassword } from '../../utils';
import ReCAPTCHA from 'react-google-recaptcha';
const DISALLOW_NUM = ['0', '1', '2', '3', '4', '5'];
import CryptoJS from "crypto-js";
import ContestModal from '../../components/ContestModal';
import ContestFrame from '../../components/ContestFrame';

export default function Login() {
  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    setFieldValue,
    setFieldError,
    isAuthenticated,
    setIsAuthenticated,
    isAdminAuthenticated,
    setIsAdminAuthenticated,
    setOtpFailCount,
    token,
    setToken,
    toastMessage,
    setToastMessage,
    loData,
    setLoData,
    setPhoneNumberList,
    errorToastMessage,
    setErrorToastMessage,
    isBMAuthenticated,
    setIsBMAuthenticated,
    setIsAdminProductAuthenticated,
    disableEkycMobiles,
    setDisableEkycMobiles,
  } = useContext(AuthContext);

  const navigate = useNavigate();
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [disabledOtpButton, setDisabledOtpButton] = useState(false);
  const [hasSentOTPOnce, setHasSentOTPOnce] = useState(false);
  const [disablePhoneNumber, setDisablePhoneNumber] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(values?.is_mobile_verified);
  const [isOpen, setIsOpen] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [show, setShow] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);
  const [showExpiryPopUp, setShowExpiryPopUp] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');

  const[signleLogin,setSingleLogin] = useState(false);
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


  useEffect(()=> {

    if(signleLogin == true){
      if (isAuthenticated) {
        console.log("Navigating to /");
        setTimeout(() => navigate('/'), 0);
      } else if (isBMAuthenticated) {
        console.log("Navigating to /branch-manager");
        navigate('/branch-manager');
      } else {
        console.log("Navigating to /admin");
        navigate('/admin');
      }
    }

  },[signleLogin])

  const sendMobileOtp = async () => {
    setLoginError('');

    try {

      // if (!captchaValue) {
      //   alert('Please verify CAPTCHA');
      //   return;
      // }
      setDisabledOtpButton(true);

      await checkLoanOfficerExists(values.username);

      const res = await getLoginOtp(values.username, { password: password });


      if (res.error) {
        setDisablePhoneNumber(false);
        setHasSentOTPOnce(false);
        setShowOTPInput(false);
        setDisabledOtpButton(false);

        if (res.fail_count === 1) {
          setErrorToastMessage(
            `You've entered an incorrect mobile number or password. Please input the correct details or select 'Forgot password' to reset your password (you have 3 attempt(s) left)`,
          );
        } else if (res.fail_count === 2) {
          setErrorToastMessage(
            `You've entered an incorrect mobile number or password. Please input the correct details or select 'Forgot password' to reset your password (you have 2 attempt(s) left)`,
          );
        } else if (res.fail_count === 3) {
          setErrorToastMessage(
            `You've entered an incorrect mobile number or password. Please input the correct details or select 'Forgot password' to reset your password (you have 1 attempt left)`,
          );
        } else if (res.message === 'Password is older than 90 days. Please reset your password.') {
          setShowExpiryPopUp(true);
        } else {
          setShowPopUp(true);
        }

        return;
      }

      setDisablePhoneNumber(true);
      setHasSentOTPOnce(true);
      setShowOTPInput(true);
      setLoginError('');
      setToastMessage('OTP has been sent to the mobile number');
    } catch (error) {
      console.log(error);
      if (!error.response.data.status) {
        setFieldError('username', 'Invalid username or password');
      }
    }
  };

  const verifyOTP = useCallback(
    async (loginotp) => {
      const otp = parseInt(loginotp);

      //For bypass
      if (import.meta.env.VITE_DEV === 'true') {
        if (values.username.toString() === '9876543210' && otp === 12345) {
          setDisablePhoneNumber(false);
          setMobileVerified(true);
          setFieldError('username', undefined);
          setShowOTPInput(false);
          setIsAuthenticated(true);
          setLoData({
            message: 'Successfully Logged In.',
            token:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQsInVzZXJuYW1lIjoiNzAzOTczOTA5OSIsImlhdCI6MTY5OTQyMTQxMCwiZXhwIjoxNjk5NDUwMjEwfQ.wDspaOCJoLeExV8mYllXCc3wpMMmEzzVC_dvDQ8DsTE',
            session: {
              id: 878,
              token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQsInVzZXJuYW1lIjoiNzAzOTczOTA5OSIsImlhdCI6MTY5OTQyMTQxMCwiZXhwIjoxNjk5NDUwMjEwfQ.wDspaOCJoLeExV8mYllXCc3wpMMmEzzVC_dvDQ8DsTE',
              user_id: 14,
              employee_code: null,
              login_via: null,
              logout_via: null,
              logged_out_at: null,
              device_details: 'Mobile Safari 16.6.0 iOS 16.6.0 iPhone 0.0.0',
              geo_lat: null,
              geo_long: null,
              sms_logs: {
                sms_request: {
                  ip: '::ffff:127.0.0.1',
                  user_agent:
                    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1 Edg/119.0.0.0',
                  sms_log_data: {
                    id: 3098,
                    dump: {},
                    method: 'post',
                    endpoint:
                      'https://202e24cd06a2adb8bffc7b9ca64a60766273f41e5dcbc729:5f7970a89d1842ab66962aa5a48141cb79b05031753a2fc6@api.exotel.com/v1/Accounts/indiashelter1/Sms/send?From=ISFCHL&To=7039739099&Body=Your%20OTP%20for%20login%20is%2058218.%0APlease%20enter%20this%20code%20to%20access%20your%20account.%20Do%20not%20share%20this%20OTP%20to%20anyone%20for%20security%20reasons.%0AThank%20You%0A-%20India%20Shelter%20Finance%20Corporation&DltEntityId=1201159141940678598&DltTemplateId=1007169458013483608&SmsType=transactional',
                    timestamp: '2023-11-08T05:29:37.819Z',
                  },
                  response_data:
                    '<?xml version="1.0" encoding="UTF-8"?>\n<TwilioResponse><SMSMessage><Sid>8f8932ef6fbcc255c0bf4e0dc0eb17b8</Sid><AccountSid>indiashelter1</AccountSid><From>/ISFCHL</From><To>07039739099</To><DateCreated>2023-11-08 10:59:38</DateCreated><DateUpdated>2023-11-08 10:59:38</DateUpdated><DateSent>1970-01-01 05:30:00</DateSent><Body>Your OTP for login is 58218.&#xA;Please enter this code to access your account. Do not share this OTP to anyone for security reasons.&#xA;Thank You&#xA;- India Shelter Finance Corporation</Body><Direction>outbound-api</Direction><Uri>/v1/Accounts/indiashelter1/SMS/Messages/8f8932ef6fbcc255c0bf4e0dc0eb17b8</Uri><ApiVersion></ApiVersion><Price></Price><Status>queued</Status><SmsUnits></SmsUnits><DetailedStatusCode>21010</DetailedStatusCode><DetailedStatus>PENDING_TO_OPERATOR</DetailedStatus></SMSMessage></TwilioResponse>',
                  response_date: '2023-11-08T05:29:38.087Z',
                  response_status: 200,
                  response_headers: {
                    date: 'Wed, 08 Nov 2023 05:29:38 GMT',
                    connection: 'close',
                    'content-type': 'application/xml',
                    'content-length': '850',
                    'x-frame-options': 'SAMEORIGIN',
                    'x-xss-protection': '1; mode=block',
                    'x-content-type-options': 'nosniff',
                  },
                },
              },
              extra_params: null,
              created_at: '2023-11-08T05:30:10.692Z',
              updated_at: '2023-11-08T05:30:10.692Z',
            },
            old_session_message: 'Old sessions',
          });
          return true;
        }
      }

      try {
        const res = await verifyLoginOtp(values.username, {
          otp,
        });

        console.log("I AM RESP LOG",res)


        if (!res) return;

        if (res.old_session_message == 'No old sessions') {
          setToken(res?.token);
          setDisablePhoneNumber(false);
          setMobileVerified(true);
          setFieldError('username', undefined);
          setShowOTPInput(true);
          setLoData(res);
          setDisableEkycMobiles(res?.user?.username)

          // new change for refresh issue - encrypted data in Session storage

          
      let local_data = {loData:res,isAuthenticated:res?.user?.role === 'Loan Officer'?true:false,isBMAuthenticated:res?.user?.role === 'Branch Manager'?true:false,isAdminAuthenticated:res?.user?.role != 'Loan Officer' && res.user.role != 'Branch Manager'?true:false,token:res?.token};

      let result = encrypt_data(local_data);

      if(result) {
        sessionStorage.setItem('data_storage',result)
        sessionStorage.setItem('user', JSON.stringify({user:{ role: res?.user?.role }}));

      }

          if (res?.user?.role == 'Loan Officer') {
            setIsAuthenticated(true);
            return true;
          } else if(res?.user?.role == 'Branch Manager') {
            setIsBMAuthenticated(true);
          }
           else if(res?.user?.role == 'Admin Product') {
            setIsAdminProductAuthenticated(true);
          }

          setIsAdminAuthenticated(true);
          return true;
        }

        setIsOpen(true);
        setToken(res?.token);
        setDisablePhoneNumber(false);
        setMobileVerified(true);
        setFieldError('username', undefined);
        setShowOTPInput(true);
        // setIsOpen(true);
        setLoData(res);
        setDisableEkycMobiles(res?.user?.username)
      } catch (err) {
        setMobileVerified(false);
        setOtpFailCount(err.response.data.fail_count);
        setIsAuthenticated(false);
        return false;
      }
    },
    [values.username, setFieldError, setMobileVerified],
  );

  const handleLogout = async () => {
    try {
      const res = await logout(
        {
          status: 'no',
          logout_via: 'New Login',
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );

      if (!res) return;

      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await logout(
        {
          status: 'yes',
          logout_via: 'New Login',
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );

      //debugger;

      if (!res) return;

      console.log(loData.user.role)


      //NEW LOGIC FOR REFRESH ISSUE ** 16/01

      let local_data = {loData:loData,isAuthenticated:loData.user.role === 'Loan Officer'?true:false,isBMAuthenticated:loData.user.role === 'Branch Manager'?true:false,isAdminAuthenticated:loData.user.role != 'Loan Officer' && loData.user.role != 'Branch Manager'?true:false,token:token};

      let result = encrypt_data(local_data);

      if(result) {
        sessionStorage.setItem('data_storage',result);
        sessionStorage.setItem('user', JSON.stringify({user:{ role: loData?.user?.role }}));
      }

      if (loData.user.role === 'Loan Officer') {
        setIsAuthenticated(true);
        navigate('/');
      } 

      else if(loData.user.role === 'Branch Manager') {
          setIsBMAuthenticated(true);
          navigate('/branch-manager')
      } 
      else if(loData.user.role === 'Admin Product') {
          setIsAdminProductAuthenticated(true);
          navigate('/admin-product')
      } 
      else {
        setIsAdminAuthenticated(true);
        navigate('/admin');
      }
    } catch (err) {
      console.log(err);
    }
    setContest(false)
  };

  const handleNavigate = () => {
    window.location.replace('/reset-password');
  };

  const handleCaptchaChange = (value) => {
    console.log('Captcha value:', value);
    setCaptchaValue(value);
  };


  const encrypt_data = (data) => {     // crypto encrypt for local storage

    const secretKey = "3cT0Yk2R7!wT9@hQ6Gv#1eLb8zXm$JpF";
    
    try {
      // Encrypt data before storing
      const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();

      return encryptedData;
  } catch (error) {
      console.error("Error encrypting data:", error);
      return null;
  }

  }

  const handleOTPOnCall = async()=>{
    setLoginError('');
    try {
      const {data} = await getOTPonCall(values.username)
      if(data.message){
        setDisablePhoneNumber(true);
        setHasSentOTPOnce(true);
        setShowOTPInput(true);
        setLoginError('');
        setToastMessage('OTP has been sent via call successfully.');
      }
    } catch (error) {
      console.log(error);
      setDisablePhoneNumber(false);
      setHasSentOTPOnce(false);
      setShowOTPInput(false);
      setDisabledOtpButton(false);
    }
  }
  return (
    <>
      <AdminActionControl
        title={'Reset password'}
        subtitle={'Your account is currently locked. Please reset your password to unlock access.'}
        actionMsg={'Reset password'}
        inputClasses={'hidden'}
        buttonClasses={'!w-full'}
        showpopup={showPopUp}
        setShowPopUp={setShowPopUp}
        handleActionClick={handleNavigate}
        hideClasses={'hidden md:block'}
      />

      <AdminActionControl
        title={'Expired password alert'}
        subtitle={
          'Your account has been locked due to an expired password. Please reset your password to unlock access.'
        }
        actionMsg={'Reset password'}
        inputClasses={'hidden'}
        buttonClasses={'!w-full'}
        showpopup={showExpiryPopUp}
        setShowPopUp={setShowExpiryPopUp}
        handleActionClick={handleNavigate}
        hideClasses={'hidden md:block'}
      />

      {/* <div className='md:hidden'>
        <ToastMessage message={toastMessage} setMessage={setToastMessage} />
        <ErrorTost message={errorToastMessage} setMessage={setErrorToastMessage} />
      </div> 
      //./SI-Login-Logo.png
      //bg-[#CCE2BE]
      */}

      <div className={`bg-black md:bg-white overflow-hidden h-[100vh] relative md:flex`}>
        <Header inputClasses='md:hidden' />

       {/* <div className='md:hidden'> 
          <img src='./Home Image.png' alt='login-logo' className='h-full'/>  
        </div> */}
        
          {/* Mobile image */}
<div className="md:hidden w-full aspect-[16/8]">
  <img
    src="./Home Image.png"
    alt="login-logo"
    className="object-cover w-full h-full"
  />
</div>
{/* 
        <div className='hidden md:block w-[40%] '>
          <img
            src='./Home Image.png'      //./login-desktop.svg
            alt='login-desktop-logo'
            className=' h-full w-full '  //object-cover object-center
          />
        </div> */}

        <div className="hidden md:flex w-[40%] justify-center items-center bg-black">
  <img
    src="./Home Image.png"
    alt="login-desktop-logo"
    className="max-h-full w-auto"
  />
</div>



        <div className='loginstyles absolute md:relative bottom-0 w-full md:w-[60%] md:px-20 md:pt-10 pb-[80px] md:pb-6 flex flex-col gap-2 md:gap-5 rounded-t-2xl md:rounded-[0px] bg-white overflow-auto no-scrollbar'>
          <ToastMessage message={toastMessage} setMessage={setToastMessage} />
          <ErrorTost message={errorToastMessage} setMessage={setErrorToastMessage} />

          <div className='px-4 py-3 md:p-0 w-full md:w-auto bg-white md:bg-transparent top-0'>
            <h2 className='text-primary-black font-semibold text-xl'>Welcome back!</h2>
            <p className='text-dark-grey font-normal text-xs md:text-sm mt-1 md:mt-0'>
              Login to continue
            </p>
          </div>

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
            // onOTPSendClick={sendMobileOtp}
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
            hideOTPButton={true}
            divClasses={'px-4 md:px-0'}
          />

          <TextInputWithEyeIcon
            label='Password'
            required
            placeholder='Enter password'
            disabled={disablePhoneNumber || mobileVerified}
            type={show ? 'text' : 'password'}
            name='password'
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            onBlur={() => {
              if (password.length === 0) {
                setPasswordError('This field is mandatory');
              } else {
                setPasswordError(false);
              }
            }}
            error={passwordError}
            touched={passwordError}
            min='0' // handle mousewheel down
            show={show}
            setShow={setShow}
            divClasses={'px-4 md:px-0'}
          />

          {!showOTPInput && !mobileVerified && (
            <Link
              to={'/reset-password'}
              className='flex self-end w-fit font-semibold text-base text-primary-red mr-4 md:mr-0'
            >
              Forgot Password?
            </Link>
          )}

          {showOTPInput && !mobileVerified ? (   // here**
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
              OTPonCall = {true}
              getOTPOnCall={handleOTPOnCall}
              divClasses={'px-4 md:px-0'}
            />
          ) : null}

          <br />
          <ReCAPTCHA
            sitekey="6LeJWPAqAAAAAGr0mWdraypSN33hHivp1wl1fhiV"//"6LfGyxIqAAAAAH09FYbQrOavdEjgaZDMZbkawJnk"
            onChange={handleCaptchaChange}
            className='flex self-center w-fit font-semibold text-base text-primary-red mr-0 md:mr-0'
          />

          <div className='mt-auto flex justify-end fixed md:relative bottom-0 w-full md:w-auto bg-white md:bg-transparent'>
            {!showOTPInput ? (   //!captchaValue||
              <Button
                disabled={passwordError || !password || errors.username || !values.username || disabledOtpButton }
                primary
                inputClasses='h-12 w-full m-4 md:m-0'
                onClick={sendMobileOtp}
              >
                Confirm & Send OTP
              </Button>
            ) : null}

            <Button
            type="button"
              disabled={!mobileVerified && !captchaValue}
              primary
              inputClasses={`h-12 w-full m-4 md:m-0 ${showOTPInput ? 'flex' : 'hidden'}`}
              // link={isAuthenticated ? '/' : isBMAuthenticated?'/branch-manager':'/admin'}
              onClick={() => {
                setSingleLogin(true)
              }}

            >
              Login
            </Button>
          </div>
        </div>
      </div>

      <DynamicDrawer
        open={isOpen}
        setOpen={() => {}}
        height='200px'
        hideClasses={'hidden md:block'}
      >
        <div className='flex gap-1'>
          <div className=''>
            <h4 className='text-center text-base not-italic font-semibold text-primary-black mb-1'>
              Previous session was not properly logged out
            </h4>
            <p className='text-center text-sm not-italic font-normal text-primary-black'>
              Do you want to log out previous session and continue with the new one?
            </p>
          </div>
        </div>
        <div className='w-full flex gap-4 mt-6'>
          <Button inputClasses='w-full h-[46px]' onClick={handleLogout}>
            No
          </Button>
          <Button primary={true} inputClasses=' w-full h-[46px]' onClick={handleLogin}>
            Yes
          </Button>
        </div>
      </DynamicDrawer>

      <DynamicDrawer
        open={showPopUp}
        height='200px'
        optionalSheetHandlerClasses={'hidden'}
        drawerChildrenClasses={'!p-0 md:!hidden'}
      >
        <div className='flex gap-1 w-full'>
          <div className='w-full'>
            <h4 className='py-3 px-4 text-center text-xl not-italic font-semibold text-primary-black'>
              Reset password
            </h4>
            <hr />
            <p className='text-center text-sm not-italic font-normal text-primary-black py-4 px-4'>
              Your account is currently locked. Please reset your password to unlock access.
            </p>
          </div>
        </div>
        <div className='w-full flex gap-4 px-4'>
          <Button primary={true} inputClasses=' w-full h-12' onClick={handleNavigate}>
            Reset password
          </Button>
        </div>
      </DynamicDrawer>

      <DynamicDrawer
        open={showExpiryPopUp}
        height='230px'
        optionalSheetHandlerClasses={'hidden'}
        drawerChildrenClasses={'!p-0 md:!hidden'}
      >
        <div className='flex gap-1 w-full'>
          <div className='w-full'>
            <h4 className='py-3 px-4 text-center text-xl not-italic font-semibold text-primary-black'>
              Expired password alert
            </h4>
            <hr />
            <p className='text-center text-sm not-italic font-normal text-primary-black py-4 px-4'>
              Your account has been locked due to an expired password. Please reset your password to
              unlock access.
            </p>
          </div>
        </div>
        <div className='w-full flex gap-4 px-4'>
          <Button primary={true} inputClasses=' w-full h-12' onClick={handleNavigate}>
            Reset password
          </Button>
        </div>
      </DynamicDrawer>
    </>
  );
}
