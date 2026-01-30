// import { useContext, useEffect, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import {
//   getDashboardLeadList,
//   logout,
//   case_assign,
//   getLODetails,
//   LODashboardLeadList,
//   getLeadStatusApi,
//   getMaintenanceConfiguration,
//   API_URL
// } from '../../../global/index.js';
// import { Button, Header, DropDown } fro../../../components/index.jsxnts';
// import AddLeadIcon from '../../../assets/icons/add-lead.jsx';
// import Searchbox from '../../../components/Searchbox.jsx/index.jsx';
// import ArrowRightIcon2 fro../../../assets/icons/arrow-right-2.jsxt-2';
// import NoLeadIllustration fro../../../assets/icons/no-lead.jsxead';
// import NoSearchResultIllustration fro../../../assets/icons/no-search-lead.jsxead';
// import DateRangePicker fro../../../components/DateRangePicker/index.jsxker';
// import ProgressBadge fro../../../components/ProgressBadge/index.jsxdge';
// import moment from 'moment';
// import { format, parseISO } from 'date-fns';
// import { LeadContext } from '../../../context/LeadContextProvider.jsx';
// import { defaultValuesLead } fro../../../context/defaultValuesLead.jsead';
// import PropTypes from 'prop-types';
// import LoaderDynamicText fro../../../components/Loader/LoaderDynamicText.jsxext';
// import LogoutIcon fro../../../assets/icons/logout-icon.jsxcon';
// import CaseAssignIcon from '../../../assets/icons/CaseAssign.jsx';
// //import refreshIcon from '../../assets/icons/refresh.jsx';
// import DynamicDrawer fro../../../components/SwipeableDrawer/DynamicDrawer.jsxwer';
// import { ApplicantDetailsIcon, IconClose } fro../../../assets/icons/index.jsxons';
// import { AuthContext } fro../../../context/AuthContextProvider.jsxder';
// //import { StyledEngineProvider } from '@mui/material';
// import PieChart from '../../../components/PieChart/PieChart.jsx';
// import React from 'react';
// import { Bar } from 'react-chartjs-2'; // Import Bar component from react-chartjs-2
// import { Tabs, Tab, Box } from '@mui/material';
// import MarkStatus from '../../../components/MarkStatusForm/MarkStatus.jsx';
// import ApplicantSection from '../../../components/MarkStatusForm/ApplicantSection.jsx';
// import DownTimePopUp from '../../../components/DownTimePopUp/index.jsx';
// import ServiceQueryIcon from '../../../assets/icons/servicequery.jsx';
// import CryptoJS from "crypto-js"
// import ContestFrame from '../../../components/ContestFrame/index.jsx';
// import ContestModal from '../../../components/ContestModal/index.jsx';
// import BranchModal from '../../../components/BranchModal/index.jsx';

// LeadCard.propTypes = {
//   title: PropTypes.string,
//   progress: PropTypes.number,
//   id: PropTypes.any,
//   mobile: PropTypes.any,
//   created: PropTypes.any,
//   case_assigned: PropTypes.bool, // Add this prop
// };

// export default function Dashboard() {
//   const { setValues, setActiveIndex, handleReset, setBMLeads, bMleads,setTempQualifierCoApplicant,setTempQualifier, setLoList } = useContext(LeadContext);
//   const [leadList, setLeadList] = useState([]);
//   const [primaryApplicantList, setPrimaryApplicantList] = useState([]);
//   const [filteredList, setFilteredList] = useState([]); // here
//   const [showLogout, setShowLogout] = useState();

//   const [filteredBMList, setFilteredBMList] = useState([]); // here
//   const [filteredPendingList, setfilteredPendingList] = useState([]); // 

//   const [pendingLeads, setPendingLeads] = useState([]);

//   const [loading, setLoading] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const [dynamicMessage, setDynamicMessage] = useState('We are checking...');

//   const [loList, setloList] = useState([]);

//   const [query, setQuery] = useState('');

//     const [bmQuery, setBmQuery] = useState('');
//   const [pendingQuery, setPendingQuery] = useState('');

//     const [id, setId] = useState(null);

//   const [selectionRange, setSelectionRange] = useState({
//     startDate: parseISO(moment().subtract(30, 'days').format()),
//     endDate: parseISO(moment().format()),
//     key: 'selection',
//   });
//   const navigate = useNavigate();

//   const [activeTab, setActiveTab] = useState(0); // 0 for first tab, 1 for second, etc.


//   const[selectedLO,setSelectedLO] = useState({label:'All'})

//     // Downtime popup
 
//     const [downTimePopUp, setDownTimePopUp] = useState(false)
 
//     const [popUpOptions, setPopUpOptions] = useState([])
//     const [currentDowntime, setCurrentDowntime] = useState(null);
//     const [isClosable, setIsClosable] = useState(false);

//     const[localToken,setLocalToken] = useState();

//     const[contestUrl,setContestUrl] = useState('');


//       // show branch name to confirm;

//   useEffect(()=>{

//     // initial load show branch pop up

//     let ifRefreshing = sessionStorage.getItem('branch');

//     if(ifRefreshing){
//       setProceed(true);
//       return;
//     }
//     setBranchPopup(true);

//   },[])


   
//     // useEffect(() => {
//     //   getDownTime();
//     // }, [])
   
//     // const getDownTime = async () => {
//     //   try {
//     //     // debugger
//     //     const response = await getMaintenanceConfiguration({
//     //       headers: {
//     //         Authorization: token,
//     //       },
//     //     });
   
   
//     //     console.log('API Response:', response);
   
   
//     //     if (response && typeof response === 'object') {
   
//     //       const {start_time, end_time, message}  = response.data
   
//     //       setCurrentDowntime({start_time, end_time, message});
   
//     //       const now = moment();
//     //       const startTIme = moment(start_time);
//     //       const endTime = moment(end_time);
   
//     //       if(now.isBefore(startTIme)){
//     //         setPopUpOptions([{label : message, value : message}])
//     //         setDownTimePopUp(true);
//     //         setIsClosable(true)
//     //       }
//     //       else if(now.isBetween(startTIme, endTime)){
//     //         setPopUpOptions([{ label : message, value : message}]);
//     //         setDownTimePopUp(true)
//     //         setIsClosable(false)
   
//     //       }
//     //       else{
//     //         console.error('Unexpected data format:', response);
//     //       }
   
     
//     //     }
       
//     //   } catch (error) {
//     //     console.error('Error fetching maintenance configuration:', error);
//     //   }
//     // };

   
   
   
//     const handleOptionSelect = () => {
//       if (isClosable) {
//         setDownTimePopUp(false);
//       }
//     };   // DOWNTIME
     

// const dynamicContestUrl = async () => {
// // let sanitized = API_URL.split(':');

// // sanitized[2] = sanitized[2]?.split('/')?.shift();

// // // return 'https://indiashelter.my.canva.site/lo-contest'

// // return `${sanitized.join(':')}/static/contest-lo.html`

// try{
// const url = await getContestUrl(loData?.user?.id,{headers:{
//   Authorization:token
// }});

// console.log("RETRIVED ONES",url?.contest_url?.["images"])

// setContestUrl(url?.contest_url?.["images"] || []);

// // setContestUrl(url?.contest_url);

// // window.open(url?.contest_url,'_blank')

// }

// catch(err){
//   console.log("ERROR IN CONTEST URL FETCH",err)
// }



//   }



//   const tabContent = [
//     { title: 'Total Leads', content: 'This is the content of Tab 1.' },
//     { title: 'My Leads', content: 'This is the content of Tab 2.' },
//     { title: 'Pending', content: 'This is the content of Tab 3.' },
//   ];
//   const data = {
//     primaryApplicant: [
//       {
//         tableName: 'Personal Details',
//         messages: ['Name not matched', 'Phone number is incorrect'],
//       },
//       { tableName: 'Work & Income Details', messages: ['The person is self-employed'] },
//     ],
//     coApplicant: [
//       { tableName: 'Personal Details', messages: ['Name not matched'] },
//       { tableName: 'Work & Income Details', messages: ['The person is self-employed'] },
//     ],
//   };
//   const [applicantsData, setApplicantsData] = useState(data);
//   const { token, loData, setLoData, setToken,setIsBMAuthenticated } = useContext(AuthContext);

//   const [value, setValue] = useState(0);
//   const[branchPopup,setBranchPopup] = useState(false);

//   const[proceed,setProceed] = useState(false);
  
  
//     useEffect(()=>{

//       if(!proceed) return;


//       if(!loData || !token) return;

//       dynamicContestUrl();

//     },[loData,token,proceed])

  
   
//   useEffect(()=> {

//     // console.log("DATA FROM LOCAL",localStorage.getItem('data_storage'))

//     const encryptedData = sessionStorage.getItem('data_storage')

//     const secretKey = "3cT0Yk2R7!wT9@hQ6Gv#1eLb8zXm$JpF";


//     const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
//     const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));


//     console.log(" I AM THE DECRYPTED DATA",decryptedData)

//     setLocalToken(decryptedData?.token);

//     // alert(decryptedData?.token)

//     if(decryptedData?.loData && decryptedData?.token) {
//       setLoData(decryptedData?.loData);
//       setToken(decryptedData?.token)
//       setIsBMAuthenticated(true);
//     }


//   },[])

//   const handleChange = (event, newValue) => {
//     setValue(newValue);
//   };

//   const handleSearch = (e) => {
//     e.preventDefault();
//     let value = query.replace(/ /g, '').toLowerCase();
//     setFilteredList(
//       primaryApplicantList.filter((lead) => {
//         const applicant = lead?.applicants?.find((applicant) => applicant?.is_primary);
//         const fullName = String(applicant.first_name + applicant.middle_name + applicant.last_name);
//         return (
//           String(applicant.lead_id).includes(value) ||
//           fullName.toLowerCase().includes(value) ||
//           String(applicant.mobile_number).toLowerCase().includes(value)
//         );
//       }),
//     );
//   };


//   useEffect(()=> {
// console.log("FILTERED LIST SEARCH",filteredList)
//   },[filteredList])

//   const handleResetSearch = () => {
//     setQuery('');
//     setFilteredList(primaryApplicantList);
//   };

//   const handleLogout = async () => {
//     try {
//       await logout(
//         {
//           status: 'no',
//           logout_via: 'New Login',
//         },
//         {
//           headers: {
//             Authorization: token,
//           },
//         },
//       );

//       sessionStorage.clear();

//       window.location.replace('/');
//     } catch (err) {
//       window.location.replace('/');
//       console.log(err);
//     }
//   };

//   const caseassign = async () => {
//     await refreshLeads(); // Refresh leads after assigning
//     try {
//       setIsLoading(true); // Start loading
//       setDynamicMessage('Assigning case, please wait...'); // Update message
//       let count = await case_assign(lo_id); //lead.lo_id
//       if (count > 0) {
//         setDynamicMessage(`Successfully assigned ${count} cases.`); // Update message based on count
//         await refreshLeads(); // Refresh leads after assigning
//       } else {
//         setDynamicMessage(`No new cases.`); // Update message based on count
//       }
//     } catch (err) {
//       console.log(err);
//       setDynamicMessage('An error occurred. Please try again.'); // Update message on error
//     } finally {
//       setTimeout(() => {
//         setIsLoading(false); // Stop loading after delay
//         navigate('/dashboard');
//       }, 10000); // Delay of 2 seconds (2000 milliseconds)
//     }
//   };

//     const handleSearchBM = (event) => {
//     event.preventDefault();
//     let value = bmQuery.replace(/ /g, '').toLowerCase();
//     setFilteredBMList(
//       bMleads.filter((lead) => {
//         const applicant = lead?.applicants?.find((applicant) => applicant?.is_primary);
//         return String(applicant.lead_id).includes(value);
//       }),
//     );
//   };

//   const handleResetBmSearch = () => {
//     setBmQuery('');
//     setFilteredBMList(bMleads);
//   };

//   const handleSearchPending = (event) => {
//     event.preventDefault();

//     let value = pendingQuery.replace(/ /g, '').toLowerCase();
//     setfilteredPendingList(
//       pendingLeads.filter((lead) => {
//         const applicant = lead?.applicants?.find((applicant) => applicant?.is_primary);
//         return String(applicant.lead_id).includes(value);
//       }),
//     );

//   };

//   const handleResetPendingSearch = () => {
//     setPendingQuery('');
//     setfilteredPendingList(pendingLeads);
//   };

//   const refreshLeads = async () => {    //**HERE */

//     try {
//       setLoading(true);
//       const getLeadStatusApiResponse = await getLeadStatusApi(loData.user.id, {
//         headers: {
//           Authorization: token,
//         },
//       });

//       const id = loData.user.id;
//       if (id) {     //id
//         const getLeadStatusApiResponse = await getLeadStatusApi(loData.user.id, {
//           headers: {
//             Authorization: token,
//           },
//         });

//         let totalLeads = await getLeadList();

//         console.log("TOTAL LEAD",totalLeads)

//         if(totalLeads?.length == 0) alert("NO LEAD AVAILABLE")


//         // lo refresh data
//         // const data = await getDashboardLeadList(
//         //   {
//         //     fromDate: selectionRange.startDate,
//         //     toDate: moment(selectionRange.endDate).add(1, 'day'),
//         //     id,
//         //   },
//         //   {
//         //     headers: {
//         //       Authorization: token,
//         //     },
//         //   },
//         // );
//         // console.log('lo refresh data', data);
//         // const formatted = data?.leads.filter((l) => l.applicants?.length > 0);

//         // console.log("I AM FORMATTED",formatted)
//         // setLeadList(formatted);
//         // setPrimaryApplicantList(formatted);
//         // setFilteredList(formatted);

//       } else {

//         getLeadList();
//         // const data = await getDashboardLeadList(
//         //   {
//         //     fromDate: selectionRange.startDate,
//         //     toDate: moment(selectionRange.endDate).add(1, 'day'),
//         //   },
//         //   {
//         //     headers: {
//         //       Authorization: token,
//         //     },
//         //   },
//         // );
//         // const formatted = data?.leads.filter((l) => l.applicants?.length > 0);
//         // setLeadList(formatted);
//         // setPrimaryApplicantList(formatted);
//         // setFilteredList(formatted);

//         // setPendingLeads(formatted?.filter((lead) => {
//         //   return lead?.lo_id !== loData?.user?.id && lead?.bm_submit
//         // }),)
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       // setLoading(false);
//     }
//   };

//   useEffect(()=> {

//           if(!proceed) return;


//     setTempQualifierCoApplicant(false);

//     setTempQualifier(false);

//   },[proceed])

//   // Function to calculate the pie chart data
//   // const calculatePieChartData = (leads) => {
//   //   console.log('piechart data leads', leads);
//   //   const statusCounts = {
//   //     Lead: 0,
//   //     'L&T Paid': 6,
//   //     Login: 0,
//   //     'Login Reject': 4,
//   //     Sanction: 5,
//   //     Rejection: 1,
//   //     Disbursement: 1,
//   //   };

//   //   let list = [];

//   //   leads.forEach((lead) => {
//   //     list.push(lead.status);
//   //   });

//   //   let frequencyMap = list.reduce((acc, curr) => {
//   //     acc[curr] = (acc[curr] || 0) + 1;

//   //     return acc;
//   //   }, {});

//   //   let result = Object.keys(frequencyMap).map((key) => ({ key: key, val: frequencyMap[key] }));

//   //   console.log('check status result', frequencyMap);

//   //   return {
//   //     labels: Object.keys(frequencyMap),
//   //     datasets: [
//   //       {
//   //         label: 'Login Status',
//   //         data: Object.values(frequencyMap),
//   //         backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
//   //         hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
//   //       },
//   //     ],
//   //   };
//   // };

//   const calculatePieChartData = (leads) => {
//     console.log('piechart data leads', leads);
  
//     // Fixed color assignments for each status
//     const statusColors = {
//       Lead: 'SteelBlue',        // Similar to the larger blue section in the image
//       'L&T Paid': 'DarkOrange', // Similar to the orange section
//       'Login Reject': 'Brown',  // For a rich, earthy tone
//       'Login from iTrust':'navy',
//       Login: 'Purple',          // A vibrant purple for contrast
//       Sanction: 'Green',        // Green to represent progress or approval
//       Rejection: 'Red',         // Red for a rejected status
//       Disbursement: 'Olive',    // Olive green for a distinct shade
//     };
  
//     // Count occurrences of each lead status
//     let frequencyMap = leads?.reduce((acc, lead) => {

//       if(lead?.status == 'Login from iTrust') {
//         acc['Submit SF'] = (acc['Submit SF'] || 0) + 1;
//       }

//       else {
//         acc[lead.status] = (acc[lead.status] || 0) + 1;

//       }
//       return acc;
//     }, {});
  
//     // Prepare the labels, data, and colors based on available statuses
//     const labels = frequencyMap ? Object.keys(frequencyMap) : [];
//     const data = frequencyMap ? Object.values(frequencyMap) : [];
//     const backgroundColor = labels.map((status) => statusColors[status] || "grey");
  
//     return {
//       labels: labels,
//       datasets: [
//         {
//           label: 'Login Status',
//           data: data,
//           backgroundColor: backgroundColor,
//           hoverBackgroundColor: backgroundColor,
//         },
//       ],
//     };
//   };

//   // Function to fetch LO Data mapped under BM
//   const LOData = async (id) => {
//     setId(id);
//     try {
//       setLoading(true);
//       const data = await LODashboardLeadList(
//         {
//           fromDate: selectionRange.startDate,
//           toDate: moment(selectionRange.endDate).add(1, 'day'),
//           id,
//         },
//         {
//           headers: {
//             Authorization: token,
//           },
//         },
//       );

//       console.log('lolllllll',data)
//       const formatted = data?.leads.filter((l) => l.applicants?.length > 0);
//       setLeadList(formatted);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const options = {
//     plugins: {
//       legend: {
//         display: true,
//         position: 'right',
//         labels: {
//           boxWidth: 20,
//         },
//       },
//       tooltip: {
//         callbacks: {
//           label: function (context) {
//             const label = context.label || '';
//             const value = context.raw || 0;
//             return `${label}: ${value}`;
//           },
//         },
//       },
//       datalabels: {
//         formatter: (value) => {
//           return value;
//         },
//         color: '#fff',
//         font: {
//           weight: 'bold',
//         },
//       },
//     },
//   };

//   const lo_details = async () => {
//     const response = await getLODetails(
//       {},
//       {
//         headers: {
//           Authorization: token,
//         },
//       },
//     );
//     //setloList(response);
//     console.log('Lo Details>>>>>>>>', loList);

//     // Function to generate the full name
//     function getFullName(details) {
//       const middleName = details.middle_name ? ` ${details.middle_name} ` : ' ';

//       const last_name = details?.last_name ? `${details.last_name}`: ''
//       return `${details.first_name}${middleName}${last_name}`;
//     }
//     // Transform the API response into the desired format

//     console.log("I am the response for LO>>>>)))))",response)
//     const options = response.lo_details.map((detail) => ({
//       label: getFullName(detail),
//       value: detail.id,
//     }));

//     setloList(options);



//     setLoList(options?.filter((ele)=>ele?.label?.trim() !== "All"))

//   };

//   // Call lo_details on component mount
//   useEffect(() => {

//           if(!proceed) return;

//     if(token) {
//       lo_details();
//     }
//   }, [token,proceed]); // Empty dependency array ensures this runs once on mount

//   async function getLeadList () {

//     if(token) {
//     try {
//       setLoading(true);
//       const data = await getDashboardLeadList(
//         {
//           fromDate: selectionRange.startDate,
//           toDate: moment(selectionRange.endDate).add(1, 'day'),
//         },
//         {
//           headers: {
//             Authorization: token,
//           },
//         },
//       );

//       console.log('I am the data', data);
//       const formatted = data?.leads.filter((l) => l.applicants?.length > 0);

//       console.log('THESE ARE THE TOTAL LEADS', formatted);


//       // setLeadList(formatted);

//       if(selectedLO["label"] == 'All' || selectedLO?.label == "All ") {


//         console.log('formatted',formatted)

//         let sorted_data = formatted?.sort((a,b)=> {
//           return new Date(b?.updated_at) - new Date(a?.updated_at)
//         })


//         console.log('sorted_data ALL LEAD',sorted_data)

//         setLeadList(sorted_data);
//       }
//       else {
//         let target_leads = formatted?.filter((lead)=> {
//           return lead?.lo_id == selectedLO?.value
//         })

//         let sorted_leads = target_leads?.sort((a,b)=> {
//           return new Date(b?.updated_at) - new Date(a?.updated_at)
//         })
        
//         setLeadList(sorted_leads)


//       }   //ends**********

//       // filtering the BM personal leads

//       console.log('HEY this my lo_id',  formatted.filter((lead) => {
//         return lead.lo_id === loData.user.id;
//       })); // fetched lo_id of the branch manager

//       setBMLeads(
//         formatted.filter((lead) => {
//           return lead.lo_id === loData.user.id;
//         }),
//       );

//                setFilteredBMList(formatted.filter((lead) => {
//   return lead.lo_id === loData.user.id;
//          }),)
      
//       let target = formatted;

//       console.log("TARGETTT>>>",target)


//       if( selectedLO["label"] == 'All' || selectedLO?.label == "All ") {

//         let pending_lead = formatted?.filter((lead) => {
//           // return lead?.lo_id !== loData?.user?.id && lead?.bm_submit && !lead?.sfdc_status;

//           if(lead.applicant_type === 'C') {
//             return lead?.lo_id !== loData?.user?.id && lead?.bm_submit
//           }

//           else {
//             return lead?.lo_id !== loData?.user?.id && lead?.bm_submit && lead?.sfdc_status !== 'complete'
//           }
//         })


//         setPendingLeads(pending_lead?.sort((a,b)=> {
//           return new Date(b?.updated_at) - new Date(a?.updated_at)
//         }))

//           setfilteredPendingList(pending_lead?.sort((a,b)=> {
//           return new Date(b?.updated_at) - new Date(a?.updated_at)
//         }))
       
      
//       }

      
//       else {

//         let target_leads = formatted?.filter((lead)=> {
//           return lead?.lo_id !== loData?.user?.id && lead?.bm_submit && lead?.sfdc_status !== 'complete' && lead?.lo_id == selectedLO?.value
//         })


//         let sorted_lead = target_leads?.sort((a,b)=> {
//           return new Date(b?.updated_at) - new Date(a?.updated_at)
//         })
        
//         setPendingLeads(sorted_lead)
//           setfilteredPendingList(sorted_lead)


//       }
      

//       console.log('I am the formatted one', formatted);

//       return formatted
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }

// }

//   useEffect(() => {
//           if(!proceed) return;

//     getLeadList();    // ** get the lead list and implement filter logic
//   }, [selectionRange,selectedLO,localToken,proceed]);

//   useEffect(() => {
//     console.log(pendingLeads);
//   }, [bMleads,activeTab]);

//   useEffect(() => {
//           if(!proceed) return;

//     // setLoading(true);
//     const data = leadList;
//     setPrimaryApplicantList(data);
//     setFilteredList(data);
//     // setLoading(false);
//   }, [leadList,proceed]);


//   const[pieChartData,setPieChartData] = useState([])

//   useEffect(()=> {
//           if(!proceed) return;

//     const newData = calculatePieChartData(leadList)


//     // setPieChartData(newData)

       
//     if(activeTab === 0) {

//       setPieChartData(calculatePieChartData(leadList))

//     }

//     else if(activeTab === 1) {
//       setPieChartData(calculatePieChartData(bMleads))
//     }

//     else {
//       setPieChartData(calculatePieChartData(pendingLeads))
//     }

//   },[leadList,selectedLO,activeTab,proceed])

//   // const pieChartData = calculatePieChartData(leadList);

//   const[contest,setContest] = useState(false)


//   const onHandleChangeMenu = (e) => {

//     if(!e) return;

//     const selected = e;

//     switch(selected){
//       case("Logout"):
//       setShowLogout(true)
//       break;
//       case("Incentive"):
//       navigate('/incentive');
//       break;

//       case("Contest"):
//       setContest(true)
//       break;
//       default:
//         return null

//     }

//   }


//   return (
//     <div className='relative h-screen overflow-hidden'>
//             <BranchModal open={branchPopup} handleClose = {()=>{
//         setBranchPopup(false)

//         setProceed(true);

//         sessionStorage.setItem('branch',true)
        
//         }} content = {{line1:`Hey ${loData?.user?.first_name},`,line2:`You are assigned to ${loData?.user?.branch} for punching new leads.`,note:`Note: If ${loData?.user?.branch} is not your desired branch then contact your ABM/RBH for branch movement before lead creation.`}} />
//       <Header inputClasses='flex justify-between items-center'>

//         <div className='ml-auto flex items-center'>
          
//             <button onClick={refreshLeads} className='mr-10' disabled = {false}>
//               <CaseAssignIcon />
//             </button>
          
//    <div style={{marginTop:'20px',width:'150px'}}>       

//  <DropDown
//           placeholder = "Menu"
//           options = {[{label:"Contest",value:"Contest"},{label:"Incentive",value:"Incentive"},{label:"Logout",value:"Logout"}]}
//           defaultSelected = "Menu"
//           isMainMenu = {true}
//           onChange = {onHandleChangeMenu}
//           show = {true}
//           bm = {true}
//           />
//           {/* <button onClick={() => setShowLogout(true)}>
//             <LogoutIcon />
//           </button> */}
//         </div>
//               </div>

//       </Header>


//       {/* Dashboard Title */}
//       <div className='p-3 pb-0 bg-neutral-white w-full'>
//         <div className='flex flex-col md:flex-row justify-between items-center flex-wrap w-full'>
//           <div className=' flex-col w-full md:mb-0  justify-center items-center flex'>
//             <div className='flex items-center gap-2 w-full'>
//               <h4 className='text-lg sm:text-xl mb-4'>Los</h4>
//               <DropDown
//                 name='LO Name'
//                 options={loList}
//                 placeholder='Loan Officer Name'
//                 onChange={LOData}
//                 disabled={false}
//                 defaultSelected='All'
//                 className='flex-grow' // Ensure dropdown takes remaining space
//                 loSelect = {setSelectedLO}
//               />
//             </div>
//             <div className='w-full mt-2.5 ,ml-2.5'>
//               <DateRangePicker
//                 selectionRange={selectionRange}
//                 setSelectionRange={setSelectionRange}
//                 user = {loData}
//                 // className='w-full' // Ensure the date picker is full-width
//               />
//             </div>
//           </div>
//         </div>

//         {/* <div className=''> */}
//           {/* <Searchbox
//             query={query}
//             setQuery={setQuery}
//             handleSubmit={handleSearch}
//             handleReset={handleResetSearch}
//             disabled={loading}
//           /> */}
//           {/* <DropDown
//             name='LO Name'
//             options={loList}
//             placeholder='Loan Officer Name'
//             onChange={LOData}
//             disabled={false}
//             defaultSelected='All'
            
//           /> */}
//         {/* </div> */}
//       </div>

//       <div>
//       <DownTimePopUp
//             showpopup = {downTimePopUp}
//             onClose = {handleOptionSelect}
//             title = 'DownTIme'
//             options = {popUpOptions}
//             handleOptionSelect={handleOptionSelect}
 
 
//        />
//       </div>

//         <ContestModal open = {contest} handleClose={()=>{setContest(false)}}>
// <ContestFrame source={contestUrl}/>  
// //setContestUrl(url?.contest_url?.["images"] || []);

//         </ContestModal>

        

//       {!loading ? (
//         <div className='px-4 h-full bg-[#FAFAFA] overflow-auto'>
//           {/* Conditionally render Pie Chart */}
//           {filteredList?.length > 0 && (
//             <div className='pie-chart-container mb-4'>
//               <PieChart data={pieChartData} options={options} />
//             </div>
//           )}

//           {/* List of leads */}
//           {leadList?.applicants?.length === 0 ? (
//             <div className='relative flex-1 flex h-full justify-center translate-y-20'>
//               <NoLeadIllustration />
//             </div>
//           ) : filteredList?.length >=0  ? (
//             <div className='relative flex-1 flex flex-col gap-2'>
//               <Box>
//                 <div className='mx-auto'>
//                   {/* Tab Buttons */}
//                   <div className='flex justify-between border border-black overflow-hidden'>
//                     {tabContent.map((tab, index) => (
//                       <button
//                         key={index}
//                         className={`text-sm w-full py-1 transition-colors duration-300 ${
//                           activeTab === index ? 'bg-primary-red text-white' : ''
//                         }
//         ${index === 1 ? 'border-x border-black' : ''}`}
//                         onClick={() => {
                          
                          
//                           setActiveTab(index)

                        
//                           //pie chart data is refreshed

//                           if(index === 0) {
//                             setPieChartData(calculatePieChartData(leadList))
//                             handleResetSearch()
//                           }

//                           else if(index ===1) {
//                             setPieChartData(calculatePieChartData(bMleads))
//                             handleResetBmSearch()

//                           }

//                           else {
//                             setPieChartData(calculatePieChartData(pendingLeads))
//                             handleResetPendingSearch()

//                           }
                        
//                         }}
//                       >
//                         {tab.title}
//                       </button>
//                     ))}
//                   </div>

//                   {/* Tab Content */}
//                   <div>
//                     {/* <p className='text-sm sm:text-base'>{tabContent[activeTab].content}</p> */}

//                     {activeTab === 0 && (
//                       <div  className='mt-3'>
//                       <Searchbox
//                           query={query}
//                           setQuery={setQuery}
//                           handleSubmit={handleSearch}
//                           handleReset={handleResetSearch}
//                           disabled={loading}
//                           prompt='Lead ID'
//                         />
//                         <LeadContent leadList={filteredList} user={loData} tag='total_leads' />
//                       </div>
//                     )}
//                     {activeTab === 1 && (
//                       <div  className='mt-3'>
//                       <Searchbox
//                           query={bmQuery}
//                           setQuery={setBmQuery}
//                           handleSubmit={handleSearchBM}
//                           handleReset={handleResetBmSearch}
//                           disabled={loading}
//                           prompt='Lead ID'
//                         />
//                         <LeadContent leadList={filteredBMList} user={loData} tag='bm_leads' />
//                       </div>
//                     )}
//                     {activeTab === 2 && (
//                       <div  className='mt-3'>
//                        <Searchbox
//                           query={pendingQuery}
//                           setQuery={setPendingQuery}
//                           handleSubmit={handleSearchPending}
//                           handleReset={handleResetPendingSearch}
//                           disabled={loading}
//                           prompt='Lead ID'
//                         />
//                         <LeadContent leadList={filteredPendingList} user={loData} tag='pending' />
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* 
//       <Tabs value={value} onChange={handleChange} className='flex justify-between border border-black overflow-hidden'>
//         <Tab label="Total Leads"/>
//         <Tab label="My Leads"/>
//         <Tab label="Pending" />
//       </Tabs>
//       {value === 0 && <div><LeadContent leadList={leadList} card={LeadCard}/></div>}
//       {value === 1 && <div><LeadContent leadList={bMleads} card={LeadCard}/></div>}
//       {value === 2 && <div>Pending Content</div>} */}
//               </Box>
//               <div className='h-[250px]'></div>
//             </div>
//           ) : (
//             <div className='relative flex-1 flex h-full justify-center translate-y-20'>
//               {/* <NoSearchResultIllustration /> */}
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className='absolute flex items-center w-full dashBoardLoaderHeight bg-white'>
//           <LoaderDynamicText text='Loading...' textColor='black' height='60%' />
//         </div>
//       )}

//       {/* Case assign*/}
//       <DynamicDrawer open={isLoading} setOpen={setIsLoading} height='182px'>
//         <div className='flex gap-1 w-full'>
//           <div className=' w-full'>
//             <h4 className='text-center text-base not-italic font-semibold text-primary-black mb-2'>
//               Case Assigning
//             </h4>
//             <p className='text-center text-xs not-italic font-normal text-primary-black'>
//               {dynamicMessage}
//             </p>
//           </div>
//         </div>

//         <div className='w-full flex gap-4 mt-6'>
//           <Button inputClasses='w-full h-[46px]' onClick={() => setIsLoading(false)}>
//             Close
//           </Button>
//         </div>
//       </DynamicDrawer>

//       {/* Confirm skip for now */}
//       <DynamicDrawer open={showLogout} setOpen={setShowLogout} height='182px'>
//         <div className='flex gap-1 w-full'>
//           <div className=' w-full'>
//             <h4 className='text-center text-base not-italic font-semibold text-primary-black mb-2'>
//               Are you sure you want to log out?
//             </h4>
//             <p className='text-center text-xs not-italic font-normal text-primary-black'>
//               You can login back to access your content
//             </p>
//           </div>
//           <div className='mb-auto'>
//             <button onClick={() => setShowLogout(false)}>
//               <IconClose />
//             </button>
//           </div>
//         </div>

//         <div className='w-full flex gap-4 mt-6'>
//           <Button inputClasses='w-full h-[46px]' onClick={() => setShowLogout(false)}>
//             Cancel
//           </Button>
//           <Button primary={true} inputClasses=' w-full h-[46px]' onClick={handleLogout}>
//             Log out
//           </Button>
//         </div>
//       </DynamicDrawer>

//       <button
//         onClick={() => {
//           handleReset();
//           let newDefaultValues = structuredClone(defaultValuesLead);
//           setValues(newDefaultValues);
//           setActiveIndex(0);
//           navigate('/lead/applicant-details');
//         }}
//         className='fixed bottom-4 right-6 z-50 w-fit inline-flex items-center gap-1 p-3 bg-primary-red rounded-full'
//       >
//         <AddLeadIcon />
//         <span className='text-sm not-italic font-medium text-white'>Add new lead</span>
//       </button>
//     </div>
//   );
// }
// //loData.user.id
// function LeadCard({
//   title,
//   progress,
//   id,
//   mobile,
//   created,
//   lead,
//   case_assigned,
//   className,
//   value,
//   status,
// }) {



//   const redirectToSalesforce = () => {

//     let all_approved = true;

//     const applicants = lead?.applicants;

//     for(const applicant of applicants) {

//       if(applicant?.applicant_details?.isApproved == false || !applicant?.applicant_details?.isApproved) {
//         all_approved = false;
//       }
//     }

//     return all_approved;
//   }

//   return (
//     <Link
//       // to={lead.lo_id === value.user.id ? '/dashboard/' + id : '/branch-manager/' + id}
//       to={lead.lo_id === value.user.id ? '/dashboard/' + id : lead.lo_id !== value.user.id && lead?.sfdc_status && lead?.sfdc_status !== 'Complete'?`/lead/retry-salesforce/${id}`:redirectToSalesforce() == true && lead?.bm_submit == true ?`/lead/retry-salesforce/${id}` :'/branch-manager/' + id}

//       className='rounded-lg border border-[#EBEBEB] bg-white p-3 flex flex-col gap-2 active:opacity-90 mt-2.5'
//     >
//     <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
//         {/* {lead.lead_code != null ? <CaseAssigning /> : null} */}
//         {lead.applicant_type != null ? <ServiceQueryIcon /> : null}
//     </div>
      
//       <div className='flex justify-between'>
//         <h4 className='overflow-hidden text-black text-sm not-italic font-normal'>
//           {title || '-'}
//         </h4>
//       </div>

//       <div className='flex gap-4 items-center'>
//         <p className='not-italic font-medium text-[10px] leading-normal text-light-grey'>
//           ID:{' '}
//           <span className='not-italic font-medium text-[10px] leading-normal text-dark-grey'>
//             {id}
//           </span>
//         </p>
//         <p className='not-italic font-medium text-[10px] leading-normal text-light-grey'>
//           MOB NO:{' '}
//           <span className='not-italic font-medium text-[10px] leading-normal text-dark-grey'>
//             {mobile || '-'}
//           </span>
//         </p>

//         <div className='ml-auto'>
//           <span>{status}</span>
//         </div>
//       </div>
//       <Separator />
//       <div className='flex items-center'>
//         <p className='not-italic font-medium text-[10px] leading-normal text-light-grey'>
//           CREATED:{' '}
//           <span className='not-italic font-medium text-[10px] leading-normal text-dark-grey'>
//             {created}
//           </span>
//         </p>

//         <div className='ml-auto'>
//           <ArrowRightIcon2 />
//         </div>
//       </div>

//       {lead.sfdc_count !== 0 || lead?.applicant_type == 'C'? (
//         <div className='flex justify-between items-center'>
//           <p className='text-[10px] leading-4 text-primary-black font-light'>
//             Salesforce ID: {lead?.salesforce_application_id}
//           </p>

//           {lead.sfdc_status === 'Complete' ? (
//             <div className='flex gap-1 items-center justify-end text-[10px] font-medium leading-4 text-secondary-green'>
//               <svg
//                 width='24'
//                 height='24'
//                 viewBox='0 0 24 24'
//                 fill='none'
//                 xmlns='http://www.w3.org/2000/svg'
//               >
//                 <path
//                   d='M4.843 16.372C3.273 16.372 2 15.099 2 13.529C2 11.959 3.273 10.686 4.843 10.686C4.843 7.546 7.389 5 10.529 5C12.879 5 14.895 6.426 15.762 8.46C16.051 8.394 16.349 8.351 16.658 8.351C18.873 8.351 20.668 10.146 20.668 12.361C20.668 14.576 18.873 16.371 16.658 16.371'
//                   stroke='#147257'
//                   strokeMiterlimit='10'
//                   strokeLinecap='round'
//                   strokeLinejoin='round'
//                 />
//                 <path
//                   d='M15 13L10.1875 18L8 15.7273'
//                   stroke='#147257'
//                   strokeLinecap='round'
//                   strokeLinejoin='round'
//                 />
//               </svg>
//               DATA PUSH IS SUCCESSFUL
//             </div>
//           )
//         : lead?.sfdc_status == "Login Reject" || lead?.applicant_type == 'C' && lead?.sfdc_status == 'Complete' || lead?.sfdc_count == 0?null:
        
//         (
//             <div className='flex gap-1 items-center justify-end text-[10px] font-medium leading-4 text-[#EF8D32]'>
//               <svg
//                 width='24'
//                 height='24'
//                 viewBox='0 0 24 24'
//                 fill='none'
//                 xmlns='http://www.w3.org/2000/svg'
//               >
//                 <path
//                   d='M5.843 16.372C4.273 16.372 3 15.099 3 13.529C3 11.959 4.273 10.686 5.843 10.686C5.843 7.546 8.389 5 11.529 5C13.879 5 15.895 6.426 16.762 8.46C17.051 8.394 17.349 8.351 17.658 8.351C19.873 8.351 21.668 10.146 21.668 12.361C21.668 14.576 19.873 16.371 17.658 16.371'
//                   stroke='#EF8D32'
//                   strokeMiterlimit='10'
//                   strokeLinecap='round'
//                   strokeLinejoin='round'
//                 />
//                 <path
//                   d='M8 15C8 12.7909 9.79086 11 12 11C14.2091 11 16 12.7909 16 15C16 17.2091 14.2091 19 12 19C10.5194 19 9.22675 18.1956 8.53513 17M8.53513 17V19M8.53513 17H10.5'
//                   stroke='#EF8D32'
//                   strokeLinecap='round'
//                   strokeLinejoin='round'
//                 />
//               </svg>
//               RETRY SALESFORCE PUSH
//             </div>
//           )}
//         </div>
//       ) : null}

//       {/* {lead.sfdc_count > 4 && lead.sfdc_status !== 'Complete' && (
//         <div className='flex gap-1 items-center justify-end text-[10px] font-medium leading-4 text-[#96989A]'>
//           <svg
//             width='24'
//             height='24'
//             viewBox='0 0 24 24'
//             fill='none'
//             xmlns='http://www.w3.org/2000/svg'
//           >
//             <g opacity='0.6'>
//               <path
//                 d='M17.658 15.371C19.873 15.371 21.668 13.576 21.668 11.361C21.668 9.146 19.873 7.351 17.658 7.351C17.349 7.351 17.051 7.393 16.762 7.46C15.896 5.426 13.879 4 11.529 4C8.389 4 5.843 6.546 5.843 9.686C4.273 9.686 3 10.959 3 12.529C3 14.099 4.273 15.372 5.843 15.372M14.355 13.022L9.368 18.009M15.387 15.516C15.387 17.4634 13.8084 19.042 11.861 19.042C9.91364 19.042 8.335 17.4634 8.335 15.516C8.335 13.5686 9.91364 11.99 11.861 11.99C13.8084 11.99 15.387 13.5686 15.387 15.516Z'
//                 stroke='#96989A'
//                 strokeWidth='1.5'
//                 strokeMiterlimit='10'
//                 strokeLinecap='round'
//                 strokeLinejoin='round'
//               />
//             </g>
//           </svg>
//           DATA PUSH IS UNSUCCESSFUL
//         </div>
//       )}
 
//       {lead.sfdc_count > 4 && lead.sfdc_status === 'Complete' ? (
//         <div className='flex gap-1 items-center justify-end text-[10px] font-medium leading-4 text-secondary-green'>
//           <svg
//             width='24'
//             height='24'
//             viewBox='0 0 24 24'
//             fill='none'
//             xmlns='http://www.w3.org/2000/svg'
//           >
//             <path
//               d='M4.843 16.372C3.273 16.372 2 15.099 2 13.529C2 11.959 3.273 10.686 4.843 10.686C4.843 7.546 7.389 5 10.529 5C12.879 5 14.895 6.426 15.762 8.46C16.051 8.394 16.349 8.351 16.658 8.351C18.873 8.351 20.668 10.146 20.668 12.361C20.668 14.576 18.873 16.371 16.658 16.371'
//               stroke='#147257'
//               strokeMiterlimit='10'
//               strokeLinecap='round'
//               strokeLinejoin='round'
//             />
//             <path
//               d='M15 13L10.1875 18L8 15.7273'
//               stroke='#147257'
//               strokeLinecap='round'
//               strokeLinejoin='round'
//             />
//           </svg>
//           DATA PUSH IS SUCCESSFUL
//         </div>
//       ) : null} */}
//     </Link>
//   );
// }

// function LeadContent({ leadList, user, tag }) {
//   console.log('I am lead list target', leadList);
//   return (
//     <>
//       {leadList?.length <= 0 ? (
//         <div className='relative flex-1 flex h-full justify-center translate-y-20'>
//           <NoLeadIllustration />
//         </div>
//       ) : (
//         leadList?.map((lead, i) => {
//           const applicant = lead?.applicants?.find((applicant) => applicant?.is_primary);
//           // Determine the className based on index (i) for alternating colors
//           const cardClassName = i % 2 === 0 ? 'even-card' : 'odd-card';
//           return (
//             <LeadCard
//               //  to={'/dashboard-BM/' + applicant?.lead_id}
//               // to = {'/BM-preview'}
//               value={user}
//               key={i}
//               id={applicant?.lead_id ?? '-'}
//               title={`${
//                 applicant
//                   ? applicant.first_name + ' ' + applicant?.middle_name + ' ' + applicant?.last_name
//                   : '-'
//               }`}
//               progress={lead?.extra_params?.progress ?? 0}
//               created={moment(applicant?.created_at).format('DD/MM/YYYY')}
//               mobile={applicant?.mobile_number ?? '-'}
//               lead={lead}
//               case_assigned={lead.case_assign} // Pass case_assigned prop
//               status={
//                 lead?.status == 'Login from iTrust'
//                   ? 'Submit SF'
//                   :lead?.sfdc_status == 'Login Reject'?'Login Reject'
//                   : lead.bm_submit == true && lead?.sfdc_status !== 'Complete'  // condition for BM leads **
//                   ? 'Verify'
//                   : lead?.bm_submit == false &&  lead?.sfdc_status !== 'Complete' 
//                   ? 'Rejected'
//                   : lead?.status
//               }
//               className={cardClassName}
//             />
//           );
//         })
//       )}
//     </>
//   );
// }

// const Separator = () => {
//   return <div className='border-t-2 border-b-0 my-2 w-full'></div>;
// };