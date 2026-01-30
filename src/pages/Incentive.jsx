import React from 'react'
import { useContext,useState,useEffect } from 'react'
import { AuthContext } from '../context/AuthContextProvider'
import { Button } from '../components'
import { relationOptions,primaryPagesRoute } from '../utils'
import {Header} from '../components'
import { useNavigate } from 'react-router-dom'
import {DropDown} from '../components'
import ErrorTost from '../components/ToastMessage/ErrorTost'
import { LeadContext } from '../context/LeadContextProvider'
import { getIncentiveData } from '../global'
import LoaderDynamicText from '../components/Loader/LoaderDynamicText'
import NoIncentives from '../assets/icons/no-incentives'
import { Box, Typography, Divider, Grid,Paper  } from '@mui/material';
import {months} from '../utils'
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';


const Incentive = () => {
    const navigate = useNavigate();

    const{loData} = useContext(AuthContext);

    const{loList} = useContext(LeadContext)

    const[selectedType,setSelectedType] = useState(null);

    const[data,setData] = useState([]);

    const[selectedLO,setSelectedLO] = useState(null);


    const[loader,setLoader] = useState(false);
 
    const onHandleSelect = (args) => {

        if(args == "self"){
            setErrorMsg("");
            setSelectedType(args);

            return;
        }

        if(selectedType == "team" && !selectedLO){
            setErrorMsg("Please Select The Loan Officer Below");
        }

                setSelectedType(args);

    }

    const[errorMsg,setErrorMsg] = useState("")

    
    const getIncentives = async() => {

  try{

  setLoader(true)

  const response = await getIncentiveData({
    type:selectedType,
    id:loData?.user?.id,
    lo_id:selectedLO
  })

  if(!response || !response?.incentive){
    setErrorMsg("Error Fetching Incentive Data Please Try Again11");
        setLoader(false)
    return;
  }

  console.log("RESSS",response?.incentive)

  setData(response?.incentive);

     setLoader(false)



}


catch(err){
    setLoader(false)
    setErrorMsg("Error Fetching Incentive Data Please Try Again");

}

    }

    useEffect(()=> {

    if(!selectedType) return;

    if(selectedType == "team" && !selectedLO) return;

        
  // api call for getting data based on LO Or BM

      getIncentives();

    },[selectedType,selectedLO])




    useEffect(()=> {

        if(loData?.user?.role == "Loan Officer"){
            setSelectedType("self");
        }


    },[loData])



  return (

    <Box sx={{height:'100vh'}}>
    <ErrorTost message={errorMsg}  setMessage={setErrorMsg}/>

    <div className='flex justify-between items-center'>
          <Header className='flex justify-between items-center'></Header>
          <Button
                primary = {true}
          inputClasses='mr-3 w-20 h-8 text-sm'

          onClick = {()=>{

            setTimeout(()=>{

       if(loData && loData?.user?.role == "Branch Manager"){              
              if(!selectedType){
               navigate('/branch-manager');
               return;
              }
              setSelectedType(null)
            }

            else{   
                navigate('/')
            }
        },0)
        
          }}
          >
            Back
          </Button>
          
          </div>
    {(loData && loData?.user?.role == "Branch Manager" && !selectedType)?<SelectComponent onHandleSelect = {onHandleSelect}/>:null}

    {loader? <LoaderDynamicText text='Loading...' textColor='black' height='100%'/>:


    selectedType&& <IncentiveData data={data} selectedType = {selectedType} loList = {loList} setSelectedLO = {setSelectedLO} setErrorMsg = {setErrorMsg} selectedLO = {selectedLO}/>
}

    
    </Box>
  )
}



const SelectComponent = ({onHandleSelect}) => {

    return(
        <Box sx = {{height:'100%',display:'flex'}}>

        <Box sx={{width:'70%',margin:'auto',textAlign:'center',height:'30%'}}>
      <Button
      primary = {true}
          inputClasses='w-[50%] h-[46px] m-auto'
          onClick = {()=>onHandleSelect("self")}
        >
         My Incentives
        </Button> 

        
             <Button
         primary = {true}
          inputClasses='w-[50%] h-[46px] mt-10 m-auto'
          onClick = {()=>onHandleSelect("team")}

        >
            LO Incentive
        </Button> 
          
           </Box>

        </Box>
    )

}


const IncentiveData = ({data,selectedType,loList,setSelectedLO,setErrorMsg,selectedLO}) => {

  const sanitizeMonth = (month) => {

    if(!month || !month?.length) return "";


    const slicedMonth = month.slice(0,3)?.trim();

    console.log("SLICED ",slicedMonth)

    return months[slicedMonth?.toLowerCase()]


  }

//    return (
    // <Box sx={{ maxWidth: 700, mx: 'auto', py: 4 }}>
    //   <Typography variant="h5" align="center" gutterBottom>
    //     Incentive Last 12 Months
    //   </Typography>

    //   {selectedType == "team" && <DropDown
    //             options={loList}
    //             onChange={(e)=>{
    //                 setSelectedLO(e);
    //                 setErrorMsg("")
    //             }}
    //             disabled={false}
    //             defaultSelected='All'
    //             className='flex-grow' // Ensure dropdown takes remaining space
    //     />}

//         {data?.length == 0 || !data?.length?<NoIncentives/>:

//       <Box sx={{ mt: 6, position: 'relative' }}>
//         {/* Vertical Line */}
//         <Box
//           sx={{
//             position: 'absolute',
//             left: '50%',
//             top: 0,
//             bottom: 0,
//             width: '2px',
//             bgcolor: 'grey.400',
//             transform: 'translateX(-50%)',
//           }}
//         />

//         {data.map((month, index) => {
//           const isLeft = index % 2 === 0;

//           return (
//             <Box
//               key={index}
//               sx={{
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 height: 80,
//                 alignItems: 'center',
//               }}
//             >
//               <Box
//                 sx={{
//                   width: '50%',
//                   textAlign: isLeft ? 'right' : 'left',
//                   pr: isLeft ? 2 : 0,
//                   pl: isLeft ? 0 : 2,
//                   borderRight: isLeft ? '1px solid' : 'none',
//                   borderColor: 'grey.300',
//                 }}
//               >
//                 {isLeft ? (
//                   <Typography color="error" fontWeight="bold">
//                     ₹{month.Incentive_amount.toLocaleString()} ——————
//                   </Typography>
//                 ) : (
//                   <Typography fontWeight="medium" sx={{marginLeft: '25%'}}>
//                     {month.Incentive_month} {month.Year}
//                   </Typography>
//                 )}
//               </Box>

//               <Box
//                 sx={{
//                   width: '50%',
//                   textAlign: isLeft ? 'left' : 'right',
//                   pl: isLeft ? 2 : 0,
//                   pr: isLeft ? 0 : 2,
//                   borderLeft: isLeft ? 'none' : '1px solid',
//                   borderColor: 'grey.300',
//                 }}
//               >
//                 {isLeft ? (
//                   <Typography fontWeight="medium">
//                     {month.Incentive_month} {month.Year}
//                   </Typography>
//                 ) : (
//                   <Typography color="error" fontWeight="bold">
//                     —————— ₹{month.Incentive_amount.toLocaleString()}
//                   </Typography>
//                 )}
//               </Box>
//             </Box>
//           );
//         })}
//       </Box>
// }
//     </Box>
//   );
return(
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Incentive Last 12 Months
      </Typography>

      <Box sx={{width:'88%',margin:'auto',padding:'30px'}}>

      {selectedType == "team" && <DropDown
                options={loList}
                onChange={(e)=>{
                    setSelectedLO(e);
                    setErrorMsg("")
                }}
                disabled={false}
                defaultSelected={selectedLO?selectedLO:"All"}
                className='flex-grow' // Ensure dropdown takes remaining space
        />}
        </Box>

        {((!data?.length || data?.length== 0 && selectedType)) && 
        <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
        <NoIncentives/>
        </div>}
      <Timeline position="right">
        {data.map((event, index) => (
          <TimelineItem key={index}>
            {/* Time on the left */}
            <TimelineOppositeContent
  sx={{
    flex: 'none',         // Prevent it from growing or shrinking
    width: '150px',       // Set your desired width
    pr: 1.5,              // Optional padding between text and dot
    fontSize: '0.9rem',
    color: '#555',
    textAlign: 'left',   // Optional: Align the text to right
    marginLeft:'30px'
  }}            >     
              {sanitizeMonth(event?.Incentive_month)} {event.Year}
              
            </TimelineOppositeContent>

            {/* Dot and connector */}
            <TimelineSeparator>
              <TimelineDot color="error" />
              {index < data.length - 1 && <TimelineConnector />}
            </TimelineSeparator>

            {/* Event details */}
            <TimelineContent sx={{ py: 1 }}>
              <Paper elevation={0}   sx={{
    p: 1.5,
    width: '150px',
    borderBottom: '2px solid #555555',
    borderRadius: 0, // Optional: remove rounded corners
  }}>
                <Typography fontWeight="bold">{event.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                ₹{event.Incentive_amount?.toLocaleString("en-us")}

                </Typography>
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );

}

export default Incentive