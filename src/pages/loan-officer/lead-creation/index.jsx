import { lazy, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Qualifier from './Qualifier';
import Eligibility from './Eligibility';
import Preview from './preview';
import { Snackbar } from '@mui/material';
import { useSearchParams, useLocation } from 'react-router-dom';
import BankingManual from './banking-details/BankingManual';
import AccountAggregator from './banking-details/AccountAggregator';
import SalesforceRetry from './Salesforce-retry/index';
import FaceLiveness from './face-liveness/index';
import NotFoundImage from '../../../assets/404.svg'; // Replace with your SVG file path
const AddressDetails = lazy(() => import('./address-details'));
const ApplicantDetails = lazy(() => import('./applicant-details'));
const BankingDetails = lazy(() => import('./banking-details'));
const LntCharges = lazy(() => import('./lnt-charges'));
const PersonalDetails = lazy(() => import('./personal-details'));
const ReferenceDetails = lazy(() => import('./reference-details'));
const WorkIncomeDetails = lazy(() => import('./work-income-details'));
const PropertyDetails = lazy(() => import('./property-details'));
const UploadDocuments = lazy(() => import('./upload-documents'));
const AirpayPayment = lazy(() => import('./lnt-charges/airpay'));
const EasebuzzPayment = lazy(() => import('./lnt-charges/easebuzz'));
const ApplicationForm = lazy(() => import('./application-form/index'));

import ErrorBoundary from '../../../components/ErrorBoundary';

import CryptoJS from "crypto-js"
import { AuthContext } from '../../../context/AuthContextProvider';
import { useContext } from 'react';



const LeadCreationRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const preview = searchParams.get('preview');
  const [open, setOpen] = useState(false);
  const [showPreviewFAB, setShowPreviewFAB] = useState(false);

  const { token,loData,setLoData,setToken } = useContext(AuthContext);

  const[localToken,setLocalToken] = useState();

  const[lo,setLO] = useState(JSON.parse(sessionStorage.getItem('user')))  //JSON.stringify(JSON.parse(sessionStorage.getItem('user')))

  useEffect(() => {
    if (preview === location.pathname) {
      setOpen(true);
      setShowPreviewFAB(false);
    } else {
      setOpen(false);
    }
  }, [preview]);

  const handleClose = (e, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowPreviewFAB(true);
  };

  // additional token check for refresh issue
  useEffect(()=> {

    // console.log("DATA FROM LOCAL",localStorage.getItem('data_storage'))

    const encryptedData = sessionStorage.getItem('data_storage')

    // const secretKey = "3cT0Yk2R7!wT9@hQ6Gv#1eLb8zXm$JpF";
    //  const secretKey = import.meta.env.AES_KEY;
     const secretKey = import.meta.env.VITE_AES_KEY;
      // console.log(secretKey, "key is this ------------------",secretKeyv);
    
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    console.log(" I AM THE DECRYPTED DATA",decryptedData)

    setLocalToken(decryptedData?.token);

    // alert(decryptedData?.token)

    if(decryptedData?.loData) {
      // setLO(loData);
    }

  },[])


  // useEffect(()=> {

  //   // console.log("I AM THE LO STORE",lo?.user?.role)
  // },[])




  const gotoPreview = () => navigate('/lead/preview');

  const PreviewSnackbar = () => {
    return (
      <div className='flex-1 w-full p-3 flex flex-col gap-3 rounded bg-[#000000F2] shadow-[0px_8px_32px_0px_rgba(0_0_0_0.20)]'>
        <div className='flex gap-2 items-start'>
          <div className='flex-1 flex flex-col'>
            <h4 className='text-sm not-italic font-normal text-neutral-white'>
              Fill the mandatory fields
            </h4>
            <p className='not-italic font-normal text-[11px] leading-4 text-light-grey'>
              Looks like you have been directed from the <br /> preview page
            </p>
          </div>
          <button onClick={handleClose} className='p-[6px]'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='12'
              height='12'
              fill='none'
              viewBox='0 0 12 12'
            >
              <g stroke='#FEFEFE' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5'>
                <path d='M11 1L1 11'></path>
                <path d='M1 1l10 10'></path>
              </g>
            </svg>
          </button>
        </div>

        <button onClick={gotoPreview} className='ml-auto'>
          <span className='text-right text-sm not-italic font-semibold text-primary-red'>
            Go To Preview
          </span>
        </button>
      </div>
    );
  };

  const PreviewFAB = () => {
    return (
      <div className='flex-1 flex justify-end w-full'>
        <button
          onClick={gotoPreview}
          className='w-fit inline-flex items-center gap-1 p-3 bg-primary-red rounded-full'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='20'
            height='20'
            fill='none'
            viewBox='0 0 20 20'
          >
            <g>
              <g stroke='#FEFEFE' strokeWidth='1.5'>
                <path d='M17.61 8.21a2.57 2.57 0 010 3.579c-1.63 1.715-4.43 4.044-7.609 4.044-3.18 0-5.978-2.33-7.608-4.044a2.57 2.57 0 010-3.578C4.023 6.496 6.822 4.167 10 4.167c3.18 0 5.98 2.33 7.609 4.044z'></path>
                <path d='M12.501 10a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'></path>
              </g>
            </g>
          </svg>
          <span className='text-sm not-italic font-medium text-white'>Go to preview</span>
        </button>
      </div>
    );
  };

  function NotFound() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <img src={NotFoundImage} alt="404" style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }} />
      </div>
    </div>
    );
  }
  return (
    <>
      {/* {params['*'] === 'applicant-details' ||
      params['*'] === 'qualifier' ||
      params['*'] === 'lnt-charges' ||
      params['*'] === 'banking-details/manual' ||
      params['*'] === 'banking-details/account-aggregator' ? null : (
        <SwipeableDrawerComponent />
      )} */}

{/* element={token?<FaceLiveness />:lo?.user?.role == 'Loan Officer'?<Navigate to={'/'}/>:lo?.user?.role == 'Branch Manager'?<Navigate to={'/branch-manager'}/>:<Navigate to={'/admin'}/>} */}
      <Routes>
        <Route index element={<ApplicantDetails />} />
        <Route path='applicant-details' element={token?<ApplicantDetails />:lo?.user?.role == 'Loan Officer'?<Navigate to={'/'}/>:lo?.user?.role == 'Branch Manager'?<Navigate to={'/branch-manager'}/>:<Navigate to={'/admin'}/>} />
       
        <Route path='retry-salesforce' element={token?<SalesforceRetry />:lo?.user?.role == 'Loan Officer'?<Navigate to={'/'}/>:lo?.user?.role == 'Branch Manager'?<Navigate to={'/branch-manager'}/>:<Navigate to={'/admin'}/>} />

          <Route path='generate-form' element={token?<ApplicationForm />:lo?.user?.role == 'Loan Officer'?<Navigate to={'/'}/>:lo?.user?.role == 'Branch Manager'?<Navigate to={'/branch-manager'}/>:<Navigate to={'/admin'}/>} />

        <Route path='face-liveness' element = {<FaceLiveness />}/>  
        <Route path='address-details' element={token?<AddressDetails />:lo?.user?.role == 'Loan Officer'?<Navigate to={'/'}/>:lo?.user?.role == 'Branch Manager'?<Navigate to={'/branch-manager'}/>:<Navigate to={'/admin'}/>}/>
        <Route path='banking-details' element={token?<BankingDetails />:lo?.user?.role == 'Loan Officer'?<Navigate to={'/'}/>:lo?.user?.role == 'Branch Manager'?<Navigate to={'/branch-manager'}/>:<Navigate to={'/admin'}/>} />

        <Route path='banking-details/manual' element={token?<BankingManual />:lo?.user?.role == 'Loan Officer'?<Navigate to={'/'}/>:lo?.user?.role == 'Branch Manager'?<Navigate to={'/branch-manager'}/>:<Navigate to={'/admin'}/>} />

        <Route path='banking-details/account-aggregator'element={token?<AccountAggregator />:lo?.user?.role == 'Loan Officer'?<Navigate to={'/'}/>:lo?.user?.role == 'Branch Manager'?<Navigate to={'/branch-manager'}/>:<Navigate to={'/admin'}/>} />

        <Route path='lnt-charges' element={token?<LntCharges />:lo?.user?.role == 'Loan Officer'?<Navigate to={'/'}/>:lo?.user?.role == 'Branch Manager'?<Navigate to={'/branch-manager'}/>:<Navigate to={'/admin'}/>} />
       
        <Route path='airpay-payment' element={token?<AirpayPayment />:lo?.user?.role == 'Loan Officer'?<Navigate to={'/'}/>:lo?.user?.role == 'Branch Manager'?<Navigate to={'/branch-manager'}/>:<Navigate to={'/admin'}/>} />

        <Route path='easebuzz-payment' element={token?<EasebuzzPayment />:lo?.user?.role == 'Loan Officer'?<Navigate to={'/'}/>:lo?.user?.role == 'Branch Manager'?<Navigate to={'/branch-manager'}/>:<Navigate to={'/admin'}/>} />

        {/* <Route path='personal-details' element={token?<PersonalDetails />:lo?.user?.role == 'Loan Officer'?<Navigate to={'/'}/>:lo?.user?.role == 'Branch Manager'?<Navigate to={'/branch-manager'}/>:<Navigate to={'/admin'}/>} /> */}

        <Route
  path="personal-details"
  element={
    <ErrorBoundary>
      {token ? (
        <PersonalDetails />
      ) : lo?.user?.role === "Loan Officer" ? (
        <Navigate to={"/"} />
      ) : lo?.user?.role === "Branch Manager" ? (
        <Navigate to={"/branch-manager"} />
      ) : (
        <Navigate to={"/admin"} />
      )}
    </ErrorBoundary>
  }
/>

       
        <Route path='reference-details' element={token?<ReferenceDetails />:lo?.user?.role == 'Loan Officer'?<Navigate to={'/'}/>:lo?.user?.role == 'Branch Manager'?<Navigate to={'/branch-manager'}/>:<Navigate to={'/admin'}/>} />

        <Route path='work-income-details'element={token?<WorkIncomeDetails />:lo?.user?.role == 'Loan Officer'?<Navigate to={'/'}/>:lo?.user?.role == 'Branch Manager'?<Navigate to={'/branch-manager'}/>:<Navigate to={'/admin'}/>} />

        <Route path='qualifier' element={token?<Qualifier />:lo?.user?.role == 'Loan Officer'?<Navigate to={'/'}/>:lo?.user?.role == 'Branch Manager'?<Navigate to={'/branch-manager'}/>:<Navigate to={'/admin'}/>}/>

        <Route path='property-details' element={token?<PropertyDetails />:lo?.user?.role == 'Loan Officer'?<Navigate to={'/'}/>:lo?.user?.role == 'Branch Manager'?<Navigate to={'/branch-manager'}/>:<Navigate to={'/admin'}/>} />

        {/* <Route path='upload-documents' element={token?<ErrorBoundary><UploadDocuments /></ErrorBoundary>:lo?.user?.role == 'Loan Officer'?<Navigate to={'/'}/>:lo?.user?.role == 'Branch Manager'?<Navigate to={'/branch-manager'}/>:<Navigate to={'/admin'}/>} /> */}

        <Route
  path="upload-documents"
  element={
    <ErrorBoundary>
      {token ? (
        <UploadDocuments />
      ) : lo?.user?.role === 'Loan Officer' ? (
        <Navigate to={'/'} />
      ) : lo?.user?.role === 'Branch Manager' ? (
        <Navigate to={'/branch-manager'} />
      ) : (
        <Navigate to={'/admin'} />
      )}
    </ErrorBoundary>
  }
/>

        <Route path='eligibility' element={token?<Eligibility />:lo?.user?.role == 'Loan Officer'?<Navigate to={'/'}/>:lo?.user?.role == 'Branch Manager'?<Navigate to={'/branch-manager'}/>:<Navigate to={'/admin'}/>}></Route>

        <Route path='preview' element={token?<Preview />:lo?.user?.role == 'Loan Officer'?<Navigate to={'/'}/>:lo?.user?.role == 'Branch Manager'?<Navigate to={'/branch-manager'}/>:<Navigate to={'/admin'}/>} />

        <Route path='*' element={<h1>404, Page not found!</h1>} />
        <Route path='*' element={<NotFound></NotFound>} />
      </Routes>

   

      {/* Preview snackbar */}
      <Snackbar
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: showPreviewFAB ? 'transparent' : '#000000F2',
            fontFamily: 'Poppins',
            margin: 0,
            padding: 0,
            boxShadow: showPreviewFAB && 'none',
          },

          '& .MuiPaper-root .MuiSnackbarContent-message': {
            color: '#FEFEFE',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: 400,
            padding: 0,
            width: '100%',
          },
        }}
        className='-translate-y-32 m-[10px]'
        open={open}
        onClose={handleClose}
        message={showPreviewFAB ? <PreviewFAB /> : <PreviewSnackbar />}
      />
    </>
  );
};

export default LeadCreationRoutes;

