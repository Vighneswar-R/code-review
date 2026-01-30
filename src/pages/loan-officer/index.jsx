import { useContext, useEffect, useState,useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge, IconButton, Box, Typography,Modal } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReportProblemIcon from '@mui/icons-material/ReportProblem'; // To get the triangle with '!' inside
import { Backdrop } from '@mui/material';
import { CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContestModal from '../../components/ContestModal/index.jsx';

import CaseAssigning from '../../assets/icons/CaseAssign.jsx';
import BranchModal from '../../components/BranchModal/index.jsx';
import EditIcon from '../../assets/icons/edit.jsx';
import SalesforceRetry from '../loan-officer/lead-creation/Salesforce-retry/index.jsx'
import { getDashboardLeadList, logout, case_assign,checkLeadRule,searchLead,API_URL,getContestUrl,performanceLogin } from '../../global';
import { Button, Header } from '../../components';
import AddLeadIcon from '../../assets/icons/add-lead';
import Searchbox from '../../components/Searchbox.jsx/index.jsx';
import ArrowRightIcon2 from '../../assets/icons/arrow-right-2';
import NoLeadIllustration from '../../assets/icons/no-lead';
import NoSearchResultIllustration from '../../assets/icons/no-search-lead';
import DateRangePicker from '../../components/DateRangePicker';
import ProgressBadge from '../../components/ProgressBadge';
import moment from 'moment';
import { parseISO } from 'date-fns';
import { LeadContext } from '../../context/LeadContextProvider';
import { defaultValuesLead } from '../../context/defaultValuesLead';
import PropTypes from 'prop-types';
import LoaderDynamicText from '../../components/Loader/LoaderDynamicText';
import LogoutIcon from '../../assets/icons/logout-icon';
import DynamicDrawer from '../../components/SwipeableDrawer/DynamicDrawer';
import { IconClose } from '../../assets/icons';
import { AuthContext } from '../../context/AuthContextProvider';
import CaseAssignIcon from '../../assets/icons/CaseAssign.jsx';
import ServiceQueryIcon from '../../assets/icons/servicequery.jsx';
import { useLocation } from 'react-router-dom';
import CryptoJS from "crypto-js"
import ContestFrame from '../../components/ContestFrame/index.jsx';
LeadCard.propTypes = {
  title: PropTypes.string,
  progress: PropTypes.number,
  id: PropTypes.any,
  mobile: PropTypes.any,
  created: PropTypes.any,
};
import DownTimePopUp from '../../components/DownTimePopUp/index.jsx';
import { getMaintenanceConfiguration } from '../../global';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher/index.jsx';
import ErrorTost from '../../components/ToastMessage/ErrorTost.jsx';
import { start_downtime,end_downtime,downTimeMessage } from '../../global';
import {DropDown} from '../../components';

export default function Dashboard() {
  //const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
 
  const [dynamicMessage, setDynamicMessage] = useState('We are checking...');
  const { setValues, setActiveIndex, handleReset,updateTempQualifier,setTempQualifier,
    setTempQualifierCoApplicant,setApproved } = useContext(LeadContext);
  const [leadList, setLeadList] = useState([]);
  const [primaryApplicantList, setPrimaryApplicantList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [retryCounter, setRetryCounter] = useState([30, 60, 120, 240, 480]);
  const [showLogout, setShowLogout] = useState();

  const[toastMessage,setToastMessage] = useState('')

  const [loading, setLoading] = useState(false);

  const cardRef = useRef(0);


  const { t } = useTranslation();
 

  const [query, setQuery] = useState('');
  console.log('leadListleadList',leadList)
  const [selectionRange, setSelectionRange] = useState({
    startDate: parseISO(moment().subtract(30, 'days').format()),
    endDate: parseISO(moment().format()),
    key: 'selection',
  });
  const navigate = useNavigate();

  const location = useLocation()

  const { token,loData,setLoData,setToken,setIsAuthenticated } = useContext(AuthContext);


  const[localToken,setLocalToken] = useState();

  const[skipCount,setSkipCount] = useState(0); // default

  const[takeCount,setTakeCount] = useState(10); // default

  const scrollLimit = useRef(200);

  const[isRefreshing,setIsRefreshing] = useState(true);

  const[dynamic,setDynamic] = useState(false);

  const[searching,setIsSearching] = useState(false);

  const[contest,setContent] = useState(false);

  const[contestUrl,setContestUrl] = useState('');

  const[branchPopup,setBranchPopup] = useState(false);

  const[proceed,setProceed] = useState(false);

  const[openPerformance,setOpenPerformance] = useState(false);

  const[performanceUrl,setPerformanceUrl] = useState(null);

  const[performanceLoader,setPerformanceLoader] = useState(false);
const [contestLoader,setContestLoader] = useState(false)
  // show branch name to confirm;

  useEffect(()=>{

    // initial load show branch pop up

    let ifRefreshing = sessionStorage.getItem('branch');

    if(ifRefreshing){
      setProceed(true);
      return;
    }
    setBranchPopup(true);

  },[]);

// hyperverge sdk remove if exists;
  useEffect(() => {

    if(!proceed) return;
    return () => {
      const existingScript = document.getElementById("hyperverge-sdk");
      if (existingScript) {
        document.head.removeChild(existingScript);
        console.log("HyperVerge SDK removed on unmount");
      }
    };
  }, [proceed]);


  // scroll handler for pagination

  const scrollPaginate = () => {

    if(cardRef?.current?.scrollTop >= scrollLimit?.current){
      setSkipCount((prev)=>prev+10)
      scrollLimit.current += 200
    }

  }

  useEffect(()=> {

    if(!proceed) return;

    if(isRefreshing == true){
      setIsRefreshing(false);
      return;
    }
    if(localToken || token) {

      (async () => {
        try {
          // setLoading(true);
          setDynamic(true);
          const data = await getDashboardLeadList(
            {
              fromDate: selectionRange.startDate,
              toDate: moment(selectionRange.endDate).add(1, 'day'),
            },
            {
              headers: {
                Authorization: token??localToken,
              },
            },
          skipCount,takeCount);
          const formatted = data?.leads?.filter((l) => l.applicants?.length > 0);
          setLeadList([...leadList,...formatted]);
        } catch (err) {
          console.error(err);
        } finally {
          // setLoading(false);
          setDynamic(false);
        }
      })();
    }
  },[skipCount,proceed])

  useEffect(() => {
        if(!proceed) return;

    const cardEl = cardRef.current;
    if (cardEl) {
      cardEl.addEventListener('scroll', scrollPaginate);
    }

    // Cleanup
    return () => {
      if (cardEl) {
        cardEl.removeEventListener('scroll', scrollPaginate);
      }
    };
  }, [proceed]);

    const dynamicContestUrl = async () => {
// let sanitized = API_URL.split(':');

// sanitized[2] = sanitized[2]?.split('/')?.shift();

// // return 'https://indiashelter.my.canva.site/lo-contest'

// return `${sanitized.join(':')}/static/contest-lo.html`
setContestLoader(true)
try{
const url = await getContestUrl(loData?.user?.id,{headers:{
  Authorization:token
}});

console.log("RETRIVED ONES",url?.contest_url?.["images"])
setContestLoader(false)
setContestUrl(url?.contest_url?.["images"] || []);

// setContestUrl(url?.contest_url);

// window.open(url?.contest_url,'_blank')

}

catch(err){
  setContestLoader(false)
  console.log("ERROR IN CONTEST URL FETCH",err)
}



  }

  useEffect(()=>{

        if(!proceed) return;


    if(!loData?.user?.id || !token) return;

    dynamicContestUrl();

  },[loData,proceed])
  


  useEffect(()=> {


    // console.log("DATA FROM LOCAL",localStorage.getItem('data_storage'))

    const encryptedData = sessionStorage.getItem('data_storage')

    const secretKey = "3cT0Yk2R7!wT9@hQ6Gv#1eLb8zXm$JpF";


    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));


    console.log(" I AM THE DECRYPTED DATA",decryptedData)

    setLocalToken(decryptedData?.token);

    // alert(decryptedData?.token)

    if(decryptedData?.loData && decryptedData?.token) {
      setLoData(decryptedData?.loData);
      setToken(decryptedData?.token)
      setIsAuthenticated(true);
    }


  },[])




  useEffect(()=> {

    if(!proceed) return;


    setTempQualifier(false)
    setTempQualifierCoApplicant(false)

  },[proceed])



  const handleSearch = (e) => {
    e.preventDefault();
    // returning as of now
    let value = query.replace(/ /g, '').toLowerCase();

    return;
    setFilteredList(
      primaryApplicantList.filter((lead) => {
        const applicant = lead?.applicants?.find((applicant) => applicant?.is_primary);
        const fullName = String(applicant.first_name + applicant.middle_name + applicant.last_name);
        return (
          String(applicant.lead_id).includes(value) ||
          fullName.toLowerCase().includes(value) ||
          String(applicant.mobile_number).toLowerCase().includes(value)
        );
      }),
    );
  };

  const handleResetSearch = () => {
    setQuery('');
    setIsSearching(false);
    setSkipCount(10);
    setFilteredList(primaryApplicantList);
  };

    const onHandleChangeMenu = async (e) => {

    if(!e) return;

    const selected = e;

    switch(selected){
      case("Logout"):
      setShowLogout(true)
      break;
      case("Pending Incentive"):
      navigate('/pending-incentive');
      break;
      case("DSR"):
      navigate('/visit-tracker')
      break;

      case("Performance"):
      try{
      setOpenPerformance(true);
      setPerformanceLoader(true);
      const data = await performanceLogin({headers:{Authorization:token}});
      setPerformanceUrl(data?.url || "");
      setPerformanceLoader(false);
      return () => clearTimeout(timer);
      // doing here
      }

      catch(err){
        setPerformanceLoader(false);
        console.log("Error Logging in to Performance")
      }
      
      break;

      case("Contest"):
      setContent(true)
      // window.open(contestUrl,'_blank')

      break;
      
      default:
        return null

    }

  }

  const handleLogout = async () => {
    try {
      await logout(
        {
          status: 'no',
          logout_via: 'New Login',
        },
        {
          headers: {
            Authorization: token??localToken,
          },
        },
      );

      sessionStorage.clear();

      window.location.replace('/');

    } catch (err) {
      window.location.replace('/');
      console.log(err);
    }
  };

  // case assign

  const caseassign = async () => {
    let lo_id =filteredList[0]?.lo_id;

    if(!lo_id || filteredList?.length == 0) {
      setToastMessage("NO LEADS FOUND");
      return;
    }
    try {
      setIsLoading(true); // Start loading
      setDynamicMessage('Assigning case, please wait...'); // Update message

      let count = await case_assign(lo_id,{
        headers: {
          Authorization: token,
        },
      }); // here send 1 as lo id need to do dynamic
      if (count > 0) {

        setDynamicMessage(`Successfully assigned ${count} cases.`); // Update message based on count
        await refreshLeads(); // Refresh leads after assigning
      }else{
        setDynamicMessage(`No new cases.`); // Update message based on count
      }
    
    } catch (err) {
      console.log(err);
      setDynamicMessage('An error occurred. Please try again.'); // Update message on error
    } finally {
      setTimeout(() => {
        setIsLoading(false); // Stop loading after delay
      }, 10000); // Delay of 2 seconds (2000 milliseconds)
    }
  };

  const refreshLeads = async () => {
    try {
      setLoading(true);
      const data = await getDashboardLeadList(
        {
          fromDate: selectionRange.startDate,
          toDate: moment(selectionRange.endDate).add(1, 'day'),
        },
        {
          headers: {
            Authorization: token??localToken,
          },
        },
        0,10
      );
      const formatted = data?.leads?.filter((l) => l.applicants?.length > 0);
      setLeadList(formatted);
      setPrimaryApplicantList(formatted);
      setFilteredList(formatted);
      setSkipCount(0);
      setIsRefreshing(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
 

  useEffect(() => {

        // if(!proceed) return;


    if(localToken || token) {
      (async () => {
        try {
          setLoading(true);
          const data = await getDashboardLeadList(
            {
              fromDate: selectionRange.startDate,
              toDate: moment(selectionRange.endDate).add(1, 'day'),
            },
            {
              headers: {
                Authorization: token??localToken,
              },
            },
          0,10);

                    console.log("FORMATTED FINAL",data)

          const formatted = data?.leads?.filter((l) => l.applicants?.length > 0);
          setLeadList(formatted);

        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      })();
    }

  }, [selectionRange,localToken,token,proceed]);

  useEffect(() => {
        if(!proceed) return;

    // setLoading(true);
    const data = leadList;
    setPrimaryApplicantList(data);
    setFilteredList(data);
    // setLoading(false);
  }, [leadList,proceed]);

  //downtime handlers


  //testing blob here

  const [downTimePopUp, setDownTimePopUp] = useState(false)
 
  const [popUpOptions, setPopUpOptions] = useState([])
  const [currentDowntime, setCurrentDowntime] = useState(null);
  const [isClosable, setIsClosable] = useState(false);
 
 
  useEffect(() => {
        if(!proceed) return;

    checkDowntime();
  }, [proceed])


  const checkDowntime = () => {

    let date = new Date();

    let options = { timeZone: "Asia/Kolkata", hour12: false };
    // let hours = date.toLocaleString("en-US", { ...options, hour: "2-digit" });

    let hours = date.toLocaleString("en-US", { ...options, hour: "2-digit" });
    let minutes = date.toLocaleString("en-US", { ...options, minute: "2-digit" });

    let formatted_current = `${hours}:${minutes}`;

    if(start_downtime && end_downtime) {
      if(formatted_current >= start_downtime && formatted_current <= end_downtime) {
        setDownTimePopUp(true);
        setIsClosable(true)
  }
    }

  }
 
  // const getDownTime = async () => {
  //   try {
  //     // debugger
  //     const response = await getMaintenanceConfiguration({
  //       headers: {
  //         Authorization: token,
  //       },
  //     });
 
 
  //     console.log('API Response:', response);
 
 
  //     if (response && typeof response === 'object') {
 
  //       const {start_time, end_time, message}  = response.data
 
  //       setCurrentDowntime({start_time, end_time, message});
 
  //       const now = moment();
  //       const startTIme = moment(start_time);
  //       const endTime = moment(end_time);

  //       console.log("NOW>>>))___",now)
  //       if(now.isBefore(startTIme)){
  //         setPopUpOptions([{label : message, value : message}])
  //         setDownTimePopUp(true);
  //         setIsClosable(true)
  //       }
  //       else if(now.isBetween(startTIme, endTime)){
  //         setPopUpOptions([{ label : message, value : message}]);
  //         setDownTimePopUp(true)
  //         setIsClosable(false)
 
  //       }
  //       else{
  //         console.error('Unexpected data format:', response);
  //       }
 
   
  //     }
     
  //   } catch (error) {
  //     console.error('Error fetching maintenance configuration:', error);
  //   }
  // };
 
 
 
  const handleOptionSelect = () => {
    if (isClosable) {
      setDownTimePopUp(false);
    }
  };


  return (
    <div className='relative h-screen overflow-hidden'>


      <IframeModal isOpen = {openPerformance} setIsOpen={setOpenPerformance} url = {performanceUrl} loader = {performanceLoader} setLoader = {setPerformanceLoader} token = {token}/>

      <BranchModal open={branchPopup} handleClose = {()=>{
        setBranchPopup(false)

        setProceed(true);
        setContent(true)

        sessionStorage.setItem('branch',true)
        
        }} content = {{line1:`Hey ${loData?.user?.first_name},`,line2:`You are assigned to ${loData?.user?.branch} for punching new leads.`,note:`Note: If ${loData?.user?.branch} is not your desired branch then contact your ABM/RBH for branch movement before lead creation.`}} name = {loData?.user?.first_name} branch = {loData?.user?.branch}/>
      <ErrorTost 
      message={toastMessage}
      setMessage={setToastMessage}/>
      < Header inputClasses = 'items-center'>
      {/* <LanguageSwitcher/> */}
      <button style={{position:'relative', right:'45px'}} onClick={caseassign} className='ml-auto'>
          <CaseAssignIcon />
        </button>      
        {/* <button onClick={() => setShowLogout(true)} className='ml-auto'>
          <LogoutIcon />
        </button> 
        {label:"Contest",value:"Contest"},{label:"Incentive",value:"Incentive"},{label:"Performance",value:"Performance"}
        */}

        <div className='' style={{ width: '150px' }}>
          <DropDown
            inputClasses='relative sm:absolute w-full sm:w-[40%]'
            placeholder='Menu'
            options={[
              { label: 'Contest', value: 'Contest' },
              { label: 'DSR', value: 'DSR' },
              { label: 'Pending Incentive', value: 'Pending Incentive' },
              { label: 'Logout', value: 'Logout' },
            ]}
          defaultSelected = "Menu"
          show = {true}
          isMainMenu = {true}
          onChange = {onHandleChangeMenu}
          optionsMaxHeight = '250px'
          />
          </div>
      </Header>
      {/* Dashboard Title */}
      <div className='p-4 pb-5 bg-neutral-white space-y-4'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center'>
            <h4 className='text-[22px] not-italic font-medium text-primary-black'>{t('myLeads')}</h4>
            <span className='text-xs not-italic font-normal text-primary-black ml-[6px]'>
              {`(${filteredList?.length || 0})`}
            </span>
          </div>
          <div>
            <DateRangePicker
              selectionRange={selectionRange}
              setSelectionRange={setSelectionRange}
              user = {loData}
            />
          </div>
        </div>
        <div className=''>
          <Searchbox
            query={query}
            setQuery={setQuery}
            handleSubmit={handleSearch}
            handleReset={handleResetSearch}
            disabled={loading}
            prompt='Search for name, ID, mobile number'
            handleSearchQuery = {async()=>{
              const result = await searchLead(query,selectionRange.startDate,moment(selectionRange.endDate).add(1, 'day'), {
                headers: {
                  Authorization: token??localToken,
                },
              },);
              //fromDate: selectionRange.startDate,

              console.log("Got results",result);

              setFilteredList(result?.leadlist);

              setIsSearching(true)
            }}
          />
        </div>
      </div>

      <div>
      <DownTimePopUp
            showpopup = {downTimePopUp}
            onClose = {handleLogout}
            title = {downTimeMessage || "DOWN TIME, Please try later"}
            options = {popUpOptions}
            handleOptionSelect={handleOptionSelect}
 
 
       />
      </div>

      <ModalComponent dynamic={dynamic}/>

      <ContestModal open = {contest} handleClose={()=>{setContent(false)}}>
      {contest == true && 
   <ContestFrame loader={contestLoader}  source={contestUrl}/>}


        </ContestModal>

      {!loading ? (
        <div className='px-4 h-full bg-[#FAFAFA] overflow-auto' ref={cardRef}>
          {/* List of leads */}
          {leadList?.applicants?.length === 0 ? (
            <div className='relative flex-1 flex h-full justify-center translate-y-20'>
              <NoLeadIllustration />
            </div>
          ) : filteredList?.length ? (
            <div className='relative flex-1 flex flex-col gap-2'>
              {filteredList.map((lead, i) => {
                const applicant = lead?.applicants?.find((applicant) => applicant?.is_primary);
                return (
                  <LeadCard
                 
                    key={i}
                    id={applicant?.lead_id ?? '-'}
                    title={`${
                      applicant
                        ? applicant.first_name +
                          ' ' +
                          (applicant?.middle_name!=null?applicant?.middle_name:"") +
                          ' ' +
                          applicant?.last_name
                        : '-'
                    }`}
                    progress={lead?.extra_params?.progress ?? 0}
                    created={moment(applicant?.created_at).format('DD/MM/YYYY')}
                    mobile={applicant?.mobile_number ?? '-'}
                    lead={lead}
                    loData = {loData}
                    status = {lead?.status == 'Login Reject'?'Login Reject':lead?.bm_submit == true?"Submitted":lead?.bm_submit == false?"Rejected":""}
                    setLeadList = {setLeadList}
                  />
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
      ) :

      (
        <div className='absolute flex items-center w-full dashBoardLoaderHeight bg-white'>
          <LoaderDynamicText text='Loading...' textColor='black' height='60%' />
        </div>
      )}

      {/* Case assign*/}
      <DynamicDrawer open={isLoading} setOpen={setIsLoading} height='182px'>
        <div className='flex gap-1 w-full'>
          <div className=' w-full'>
            <h4 className='text-center text-base not-italic font-semibold text-primary-black mb-2'>
              Case Assigning
            </h4>
            <p className='text-center text-xs not-italic font-normal text-primary-black'>
              {dynamicMessage}
            </p>
          </div>
        </div>
 
        <div className='w-full flex gap-4 mt-6'>
          <Button inputClasses='w-full h-[46px]' onClick={() => setIsLoading(false)}>
            Close
          </Button>
        </div>
      </DynamicDrawer>

      {/* Confirm skip for now */}
      <DynamicDrawer open={showLogout} setOpen={setShowLogout} height='182px'>
        <div className='flex gap-1 w-full'>
          <div className=' w-full'>
            <h4 className='text-center text-base not-italic font-semibold text-primary-black mb-2'>
              Are you sure you want to log out?
            </h4>
            <p className='text-center text-xs not-italic font-normal text-primary-black'>
              You can login back to access your content
            </p>
          </div>
          <div className='mb-auto'>
            <button onClick={() => setShowLogout(false)}>
              <IconClose />
            </button>
          </div>
        </div>

        <div className='w-full flex gap-4 mt-6'>
          <Button inputClasses='w-full h-[46px]' onClick={() => setShowLogout(false)}>
            Cancel
          </Button>
          <Button primary={true} inputClasses=' w-full h-[46px]' onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </DynamicDrawer>

      <button
        onClick={async() => {

          // primary check for lead rule:-
          try{

          if(!token) return;
          // const ruleCheck = await checkLeadRule({
          //   headers: {
          //     Authorization: token??localToken,
          //   },
          // },)
          setTempQualifier(false)
          setTempQualifierCoApplicant(false)
          handleReset();
          let newDefaultValues = structuredClone(defaultValuesLead);
          newDefaultValues.applicants
          setValues(newDefaultValues);
          setActiveIndex(0);
          navigate('/lead/applicant-details');
          }
          catch(err){
            const messsage = err?.response?.data?.message || "Something Went Wrong"

            setToastMessage(messsage)
          }
               
        }}
        className='fixed bottom-4 right-6 z-50 w-fit inline-flex items-center gap-1 p-3 bg-primary-red rounded-full'
      >
        {}
        
        <AddLeadIcon />
        <span className='text-sm not-italic font-medium text-white'>{t('addNewLead')}
        </span>
      </button>
    </div>
  );
}
const NotificationFlag = ({openModal}) => {
  return (
    <Box
      sx={{
        position: 'absolute', // Set the parent container as relative
        width: '50px',
        height: '30px', // Height of the icon container
        display: 'inline-block', // Ensures it behaves like text
        left:'70%'
      }}

      onClick = {()=>{

        if(location?.pathname !== '/dashboard') {
          openModal();
        };
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f44336', // Red background
          borderRadius: '2px', // Reduced border radius
          padding: '1.5px', // Smaller padding
          width:'30px',
          position: 'absolute', // Make the bubble absolute
          top: '0', // Align it properly
          left: '0', // Align it properly
          zIndex: '1', // Ensures it appears on top
        }}
      >
        {/* Triangle Icon with Exclamation Mark */}
        <ReportProblemIcon sx={{ color: '#fff', fontSize: '17px' }} /> {/* Reduced font size */}
      </Box>

      {/* The small triangle for message pointer */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-6px', // Adjust position for the smaller icon
          left: '8px',
          width: '0',
          height: '0',
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '8px solid #f44336', // Adjusted size of the triangle
        }}
      />
    </Box>
  );
};

export {NotificationFlag};


function LeadCard({ title, progress, id, mobile, created, lead,loData,status,setLeadList}) {
  return (
    <Link    
      to={'/dashboard/' + id}
      className='rounded-lg border border-[#EBEBEB] bg-white p-3 flex flex-col gap-2 active:opacity-90'
      replace = {true}
      onClick = {() => setLeadList([])}
    >  {/* Vijay Uniyal changes on 5 Jun 2024*/}
    <div>
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {lead.lead_code != null ? <CaseAssigning /> : null}
        {lead.applicant_type != null ? <ServiceQueryIcon /> : null}
    </div>
      
    <div className='flex justify-between'>
        <h4 className='overflow-hidden text-black text-sm not-italic font-normal'>
          {title || '-'}
        </h4>

        {loData?.user?.role === 'Loan Officer' && lead?.bm_submit === false?
        <NotificationFlag/>:null}
    
        <ProgressBadge progress={progress} />
 
      </div>

      <div className='flex gap-4 items-center'>        
        <p className='not-italic font-medium text-[10px] leading-normal text-light-grey'>
            ID:{' '}
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

        <div className='ml-auto'>
          <span>{status}</span>
        </div>
    </div>
      
      <Separator />
      <div className='flex items-center'>
      
        <p className='not-italic font-medium text-[10px] leading-normal text-light-grey'>
          CREATED:{' '}
          <span className='not-italic font-medium text-[10px] leading-normal text-dark-grey'>
            {created}
          </span>
        </p>
        
        <div className='ml-auto'>
          <ArrowRightIcon2  />
      
        </div>
      </div>

      {/* {lead.sfdc_count !== 0 && lead.sfdc_count <= 10 ? (
        <div className='flex justify-between items-center'>
          <p className='text-[10px] leading-4 text-primary-black font-light'>
            Salesforce ID: {lead?.sfdc_submit_pwa?.Application_Id}
          </p> */}
{/* 
          {lead.sfdc_status === 'Complete' ? (
            <div className='flex gap-1 items-center justify-end text-[10px] font-medium leading-4 text-secondary-green'>
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M4.843 16.372C3.273 16.372 2 15.099 2 13.529C2 11.959 3.273 10.686 4.843 10.686C4.843 7.546 7.389 5 10.529 5C12.879 5 14.895 6.426 15.762 8.46C16.051 8.394 16.349 8.351 16.658 8.351C18.873 8.351 20.668 10.146 20.668 12.361C20.668 14.576 18.873 16.371 16.658 16.371'
                  stroke='#147257'
                  strokeMiterlimit='10'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M15 13L10.1875 18L8 15.7273'
                  stroke='#147257'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
              DATA PUSH IS SUCCESSFUL
            </div>
          ) : (
            <div className='flex gap-1 items-center justify-end text-[10px] font-medium leading-4 text-[#EF8D32]'>
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M5.843 16.372C4.273 16.372 3 15.099 3 13.529C3 11.959 4.273 10.686 5.843 10.686C5.843 7.546 8.389 5 11.529 5C13.879 5 15.895 6.426 16.762 8.46C17.051 8.394 17.349 8.351 17.658 8.351C19.873 8.351 21.668 10.146 21.668 12.361C21.668 14.576 19.873 16.371 17.658 16.371'
                  stroke='#EF8D32'
                  strokeMiterlimit='10'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M8 15C8 12.7909 9.79086 11 12 11C14.2091 11 16 12.7909 16 15C16 17.2091 14.2091 19 12 19C10.5194 19 9.22675 18.1956 8.53513 17M8.53513 17V19M8.53513 17H10.5'
                  stroke='#EF8D32'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
              RETRY SALESFORCE PUSH
            </div>
          )} */}
        {/* </div>
      ) : null} */}

          {/* <div>Temp Code</div> */}

    {lead.salesforce_application_id !== null ? (
        <div className='flex justify-between items-center'>
          <p className='text-[10px] leading-4 text-primary-black font-light'>
            Salesforce ID: {lead?.sfdc_submit_pwa?.Application_Id}
          </p>

          {lead.sfdc_status === 'Complete' ? (
            <div className='flex gap-1 items-center justify-end text-[10px] font-medium leading-4 text-secondary-green'>
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M4.843 16.372C3.273 16.372 2 15.099 2 13.529C2 11.959 3.273 10.686 4.843 10.686C4.843 7.546 7.389 5 10.529 5C12.879 5 14.895 6.426 15.762 8.46C16.051 8.394 16.349 8.351 16.658 8.351C18.873 8.351 20.668 10.146 20.668 12.361C20.668 14.576 18.873 16.371 16.658 16.371'
                  stroke='#147257'
                  strokeMiterlimit='10'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M15 13L10.1875 18L8 15.7273'
                  stroke='#147257'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
              DATA PUSH IS SUCCESSFUL
            </div>):null}
          </div>) : null}
        {/* //   // ) : (
        //   //   <div className='flex gap-1 items-center justify-end text-[10px] font-medium leading-4 text-[#EF8D32]'>
        //   //     <svg
        //   //       width='24'
        //   //       height='24'
        //   //       viewBox='0 0 24 24'
        //   //       fill='none'
        //   //       xmlns='http://www.w3.org/2000/svg'
        //   //     >
        //   //       <path
        //   //         d='M5.843 16.372C4.273 16.372 3 15.099 3 13.529C3 11.959 4.273 10.686 5.843 10.686C5.843 7.546 8.389 5 11.529 5C13.879 5 15.895 6.426 16.762 8.46C17.051 8.394 17.349 8.351 17.658 8.351C19.873 8.351 21.668 10.146 21.668 12.361C21.668 14.576 19.873 16.371 17.658 16.371'
        //   //         stroke='#EF8D32'
        //   //         strokeMiterlimit='10'
        //   //         strokeLinecap='round'
        //   //         strokeLinejoin='round'
        //   //       />
        //   //       <path
        //   //         d='M8 15C8 12.7909 9.79086 11 12 11C14.2091 11 16 12.7909 16 15C16 17.2091 14.2091 19 12 19C10.5194 19 9.22675 18.1956 8.53513 17M8.53513 17V19M8.53513 17H10.5'
        //   //         stroke='#EF8D32'
        //   //         strokeLinecap='round'
        //   //         strokeLinejoin='round'
        //   //       />
        //   //     </svg>
        //   //     RETRY SALESFORCE PUSH
        //   //   </div>
        //   // )}
        // </div>
      */}

    {/* <div>temp code end</div> */}

      {/* {lead.sfdc_count > 10 && lead.sfdc_status !== 'Complete' && (
        <div className='flex gap-1 items-center justify-end text-[10px] font-medium leading-4 text-[#96989A]'>
           <p className='text-[10px] leading-4 text-primary-black font-light'>
            Salesforce ID: {lead?.sfdc_submit_pwa?.Application_Id}
          </p>
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <g opacity='0.6'>
              <path
                d='M17.658 15.371C19.873 15.371 21.668 13.576 21.668 11.361C21.668 9.146 19.873 7.351 17.658 7.351C17.349 7.351 17.051 7.393 16.762 7.46C15.896 5.426 13.879 4 11.529 4C8.389 4 5.843 6.546 5.843 9.686C4.273 9.686 3 10.959 3 12.529C3 14.099 4.273 15.372 5.843 15.372M14.355 13.022L9.368 18.009M15.387 15.516C15.387 17.4634 13.8084 19.042 11.861 19.042C9.91364 19.042 8.335 17.4634 8.335 15.516C8.335 13.5686 9.91364 11.99 11.861 11.99C13.8084 11.99 15.387 13.5686 15.387 15.516Z'
                stroke='#96989A'
                strokeWidth='1.5'
                strokeMiterlimit='10'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </g>
          </svg>
        
          DATA PUSH IS UNSUCCESSFUL
        </div>
      )}

      {lead.sfdc_count > 10 && lead.sfdc_status === 'Complete' ? (
        <div className='flex gap-1 items-center justify-end text-[10px] font-medium leading-4 text-secondary-green' >
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M4.843 16.372C3.273 16.372 2 15.099 2 13.529C2 11.959 3.273 10.686 4.843 10.686C4.843 7.546 7.389 5 10.529 5C12.879 5 14.895 6.426 15.762 8.46C16.051 8.394 16.349 8.351 16.658 8.351C18.873 8.351 20.668 10.146 20.668 12.361C20.668 14.576 18.873 16.371 16.658 16.371'
              stroke='#147257'
              strokeMiterlimit='10'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M15 13L10.1875 18L8 15.7273'
              stroke='#147257'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          DATA PUSH IS SUCCESSFUL
        </div>
      ) : null} */}

    </div>
          </Link>
  );
}

const ModalComponent = ({dynamic}) => {

  return(
  <Backdrop
  sx={{
    color: '#fff',
    zIndex: (theme) => theme.zIndex.modal + 1, // Ensures it is above other content but below other modals
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Slightly transparent background to show the content behind
    position: 'fixed', // To position it over the entire screen
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}
  open={dynamic} // Set to true to make the backdrop visible
>
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: 'transparent', // Make the box background transparent
      padding: '20px', // Optional padding for spacing around the loader
    }}
  >
    <CircularProgress color="inherit" />
    <Typography variant="h6" sx={{ mt: 2,color:'#ef5350' }}>
      Loading, please wait...
    </Typography>
  </Box>
</Backdrop>
  )
}



// const BranchModal = ({ open, handleClose, content }) => {
//   return (
//     <Modal open={open} onClose={!open}>
//       <Box
//         sx={{
//           position: 'absolute',
//           top: '50%',
//           left: '50%',
//           transform: 'translate(-50%, -50%)',
//           bgcolor: 'background.paper',
//           boxShadow: 24,
//           p: 4,
//           borderRadius: 2,
//           width: '95%',
//           textAlign: 'left',
//         }}
//       >
//         {/* <Typography variant="h6" component="h2">
          
//         </Typography> */}
//         <Typography sx={{ mt: 2 }}>{content?.line1}</Typography>
//                 <Typography sx={{ mt: 2 }}>{content?.line2}</Typography>
//         <Typography sx={{ mt: 2,color:'red' }}>{content?.note}</Typography>

//         {/* <Button
//           onClick={handleClose}
//           variant="contained"
//           sx={{ mt: 3 }}
//         >
//           Close
//         </Button> */}

//           <IconButton
//           onClick={handleClose}
//           sx={{
//             position: 'absolute',
//             top: 8,
//             right: 8,
//           }}
//         >
//           <CloseIcon />
//         </IconButton>
//       </Box>
//     </Modal>
//   );
// };


// const ContestModal = ({ open, handleClose,children }) => {

//   const style = {
//   position: 'absolute',
//   top: '50%',
//   left: '50%',
//   transform: 'translate(-50%, -50%)',
//   width: '90%',
//   height: '90%',
//   bgcolor: 'background.paper',
//   boxShadow: 24,
//   outline: 'none',
// };
//   return (
//     <Modal open={open} onClose={handleClose}>
//       <Box sx={style}>
//         <IconButton
//           onClick={handleClose}
//           sx={{ position: 'absolute', top: 8, right: 8,backgroundColor:'white' }}
//         >
//           <CloseIcon />
//         </IconButton>
//     {children}
//       </Box>
//     </Modal>
//   );
// };

const Separator = () => {
  return <div className='border-t-2 border-b-0 my-2 w-full'></div>;
};


const IframeModal = ({ isOpen, setIsOpen, url,loader,setLoader,token }) => {

  const iframeRef = useRef(null)

  const postMes = (arg1,arg2) =>{

    alert("CALLED ME")
  document.querySelector("iframe").contentWindow.postMessage(
        { token: token },
        "http://localhost:5174"//url
  )
  }
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999999]"
        >
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-white text-2xl font-bold z-[1000000]"
          >
            &times;
          </button>

          {/* Iframe Box */}

            {!loader?<div className="w-[90vw] h-[90vh] bg-white rounded-xl shadow-xl overflow-hidden z-[999999]">
            <iframe
              src={"http://localhost:5174"}
              title="App B"
              className="w-full h-full border-none"
              onLoad={()=>{
                // if(url && iframeRef.current && token){

                setTimeout(()=>{
                iframeRef.current?.contentWindow?.postMessage(
  { token: "abc123" },
  "http://localhost:5174"
);
         
                },5000)
       
              }}
              ref={iframeRef}
            />
          </div>:
   <div className='z-[999999]'>
          <LoaderDynamicText text='Loading...' textColor='white' height='60%' className='z-[999999]'/>
        </div>
            }
          
        </div>
  
      )}
      
      {/*absolute flex items-center w-full dashBoardLoaderHeight bg-white*/}
{/* 
      {loader && <div className='z-[999999]'>
          <LoaderDynamicText text='Loading...' textColor='black' height='60%' className='z-[999999]'/>
        </div>} */}
    </>
  );
};