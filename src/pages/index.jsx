import { Route, Routes } from 'react-router-dom';
import Dashboard from './loan-officer';
import LeadCreationRoutes from './loan-officer/lead-creation';
import Login from './login/Login';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContextProvider';
import DashboardApplicant from './loan-officer/DashboardApplicant';
import SalesforceRetry from '../pages/loan-officer/lead-creation/Salesforce-retry/index.jsx'
import FaceLiveness from '../pages/loan-officer/lead-creation/face-liveness/index.jsx';
import PropTypes from 'prop-types';
import AdminRoutes from './admin/index.jsx';
import ResetPassword from './login/Reset.jsx';
import CreatePassword from './login/Create.jsx';
import NotFoundImage from '../assets/404.svg'; // Replace with your SVG file path
import Thankyou from './login/Thankyou.jsx';
import InProgressFace from './login/InprogessFace.jsx';
import FailFace from './login/FailFace.jsx';
import BMDashboard from '../pages/branch-manager/BM-Dashboard/index.jsx'
import BMDashboardApplicant from '../pages/branch-manager/BM-Dashboard-Applicant/index.jsx'
const TIMEOUT = 15 * 60 * 1000; // 15 minutes
import FaceVideo from '../components/FaceLiveness'
import CryptoJS from "crypto-js"
import Incentive from './Incentive.jsx';
import VisitTracker from './VisitTracker.jsx';
import AdminProduct from './admin-product/index.jsx';




const DashboardRoutes = () => {
  const RequireAuth = ({ children }) => {
    const { isAuthenticated, token, setIsBMAuthenticated, isBMAuthenticated } = useContext(AuthContext);

    // useEffect(() => {
    //   const resetSessionTimer = () => {
    //     const reset = async () => {
    //       try {
    //         await logout( 
    //           {
    //             status: 'no',
    //             logout_via: 'New Login',
    //           },
    //           {
    //             headers: {
    //               Authorization: token,
    //             },
    //           },
    //         );

    //         window.location.reload();
    //       } catch (err) {
    //         window.location.reload();
    //         console.log(err);
    //       }
    //     };

    //     // // Reset the session timer when the user is active
    //     const timer = setTimeout(reset, TIMEOUT);

    //     return () => clearTimeout(timer);
    //   };

    //   // Attach an event listener to track user activity
    //   window.addEventListener('touchmove', resetSessionTimer);

    //   // Clean up the event listener when the component unmounts
    //   return () => {
    //     window.removeEventListener('touchmove', resetSessionTimer);
    //   };
    // }, []);

    // Check authentication once and render accordingly


  

      // console.log("DATA FROM LOCAL",localStorage.getItem('data_storage'))
  
      const encryptedData = sessionStorage.getItem('data_storage')
  
      // const secretKey = "3cT0Yk2R7!wT9@hQ6Gv#1eLb8zXm$JpF";
      const secretKey = import.meta.env.VITE_AES_KEY;


      if(!encryptedData) {
        return <Navigate to='/login'/>;
 
      }
  
  
      const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  
  
      // console.log(" I AM THE DECRYPTED DATA",decryptedData)
  

      if(decryptedData?.isAuthenticated || isAuthenticated || decryptedData?.isBMAuthenticated || isBMAuthenticated) {

        return children;

      }

      else {
        return <Navigate to='/login' />;
      }
  


    if (isAuthenticated || isBMAuthenticated) {
      return children;
    } else {
      return <Navigate to='/login' />;
    }
    // return children;
  };



  const DashboardApplicantAuth = ({children}) => {
    const { isAuthenticated, token, setIsBMAuthenticated, isBMAuthenticated,loData } = useContext(AuthContext);

    
    const encryptedData = sessionStorage.getItem('data_storage')
  
    // const secretKey = "3cT0Yk2R7!wT9@hQ6Gv#1eLb8zXm$JpF";
    const secretKey = import.meta.env.VITE_AES_KEY;


    if(!encryptedData) {
      return <Navigate to='/login' />;

    }

    // console.log("key is something ", secretKey);

    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));


    // console.log(" I AM THE DECRYPTED DATA",decryptedData)


    if (isAuthenticated || isBMAuthenticated) {
      return children;
    } 

    if(decryptedData?.loData?.user?.role == 'Loan Officer') {

      if(!isAuthenticated && decryptedData?.isAuthenticated) {
        return <Navigate to='/dashboard' />;
      }
    }
    
    else if(decryptedData?.loData?.user?.role == 'Branch Manager') {

      return <Navigate to='/branch-manager' />;
    }
    
  }

  const BMdashboardApplicantAuth = ({children}) => {
    const { isAuthenticated, token, setIsBMAuthenticated, isBMAuthenticated } = useContext(AuthContext);

    
    const encryptedData = sessionStorage.getItem('data_storage')
  
    // const secretKey = "3cT0Yk2R7!wT9@hQ6Gv#1eLb8zXm$JpF";
        const secretKey = import.meta.env.VITE_AES_KEY;


    if(!encryptedData) {
      return <Navigate to='/login' />;

    }


    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));


    console.log(" I AM THE DECRYPTED DATA",decryptedData)


    if (isBMAuthenticated) {
      return children;
    } 
    
    else if(!isBMAuthenticated && decryptedData?.isBMAuthenticated) {

      return <Navigate to='/branch-manager' />;

    }
    
  }


 

    // For branch manager authentication 

    const BMRequireAuth = ({ children }) => {      

      const { isBMAuthenticated,loData, token } = useContext(AuthContext);

      const encryptedData = sessionStorage.getItem('data_storage')
  
      // const secretKey = "3cT0Yk2R7!wT9@hQ6Gv#1eLb8zXm$JpF";
      const secretKey = import.meta.env.VITE_AES_KEY;

  
      if(!encryptedData) {
        return <Navigate to='/login' />;
  
      }
  
  
      const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  
  
  
      if (isBMAuthenticated || decryptedData?.isBMAuthenticated) {
        return children;
      } else {
        return <Navigate to='/login' />;
      }
    };

  const AdminRequireAuth = ({ children }) => {
    const { isAdminAuthenticated, token } = useContext(AuthContext);


    
    const encryptedData = sessionStorage.getItem('data_storage')
  
    // const secretKey = "3cT0Yk2R7!wT9@hQ6Gv#1eLb8zXm$JpF";
        const secretKey = import.meta.env.VITE_AES_KEY;


    if(!encryptedData) {
      return <Navigate to='/login' />;

    }


    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));



    if (isAdminAuthenticated || decryptedData?.isAdminAuthenticated) {
      return children;
    } else {
      return <Navigate to='/login' />;
    }
  };

    const AdminProductRequireAuth = ({ children }) => {
    const { isAdminProductAuthenticated, token } = useContext(AuthContext);
    // console.log("I AM THE ADMIN PRODUCT AUTHENTICATED", isAdminProductAuthenticated);


    
    const encryptedData = sessionStorage.getItem('data_storage')
  
    // const secretKey = "3cT0Yk2R7!wT9@hQ6Gv#1eLb8zXm$JpF";
        const secretKey = import.meta.env.VITE_AES_KEY;


    if(!encryptedData) {
      return <Navigate to='/login' />;

    }


    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
// console.log("I AM THE DECRYPTED DATA", decryptedData?.isAdminProductAuthenticated)


    if (isAdminProductAuthenticated || decryptedData?.isAdminProductAuthenticated) {
      return children;
    } else {
      return <Navigate to='/login' />;
    }
  };

  return (
    <>
      <Routes>
        <Route path='/login' element={<Login />}></Route>
        <Route path="/static-page" element={<Thankyou />} />

        <Route path="/failure-page" element={<FailFace />} />

        <Route path="/inprogress-page" element={<InProgressFace />} />
     
        
        <Route path='/create-password' element={<CreatePassword />}></Route>
        <Route path='/reset-password' element={<ResetPassword />}></Route>
        <Route
          path='/admin/*'
          element={
            <AdminRequireAuth>
              <AdminRoutes />
            </AdminRequireAuth>
          }
        />
         <Route
          path='/admin-product/*'
          element={
            <AdminProductRequireAuth>
              <AdminProduct />
            </AdminProductRequireAuth>
          }
        />
        
        <Route
          path='/'
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />


          <Route
          path='/pending-incentive'
          element={
            <DashboardApplicantAuth>
              <Incentive/>
            </DashboardApplicantAuth>
          }
        />
          <Route
          path='/visit-tracker'
          element={
            <DashboardApplicantAuth>
              <VisitTracker/>
            </DashboardApplicantAuth>
          }
        />

        
        <Route
          path='/dashboard'
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />

<Route path='/branch-manager' element={
            <BMRequireAuth>
              <BMDashboard />
            </BMRequireAuth>
          }/>

        <Route path='/branch-manager/:id' element={
          <BMdashboardApplicantAuth>
            <BMDashboardApplicant/>
          </BMdashboardApplicantAuth>
        } />

            {/* <Route
          path='/retry-push'
          element={
            <RequireAuth>
              <SalesforceRetry />
            </RequireAuth>
          }
        /> */}
        <Route
          path='/dashboard/:id'
          element={
            <DashboardApplicantAuth>
              {/* {token?<DashboardApplicant />:<Dashboard/>} */}
              <DashboardApplicant />
            </DashboardApplicantAuth>
          }
        />
            <Route
          path='/lead/face-liveness/:id'
          element={
            <RequireAuth>
              <FaceLiveness />
            </RequireAuth>
          }
        />

<Route
          path='/lead/retry-salesforce/:id'
          element={
            <RequireAuth>
              <SalesforceRetry />
            </RequireAuth>
          }
        />
        <Route
          path='/lead/*'
          element={
            <RequireAuth>
              <LeadCreationRoutes />
            </RequireAuth>
          }
        />

     <Route
          path='/verify-video'
          element={
            <RequireAuth>
              <FaceVideo/>
              </RequireAuth>
          }
        />
        {/* <Route path='*' element={<h1>404, Page not found!</h1>} /> */}
        <Route path='*' element={<NotFound></NotFound>} />
      </Routes>
    </>
  );
};
/// Create the NotFound component
function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#fff' }}>
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <img src={NotFoundImage} alt="404" style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }} />
    </div>
  </div>
  );
}
DashboardRoutes.propTypes = {
  children: PropTypes.any,
};

export default DashboardRoutes;