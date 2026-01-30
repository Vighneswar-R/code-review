// import { useContext } from 'react';
// import DrawerSteps from './DrawerSteps';
// import { LeadContext } from '../../../context/LeadContextProvider';
// import QualifierStep from './QualifierStep';
// import DrawerStepBanking from './DrawerStepBanking';
// import UploadSteps from './UplodSteps';
// import EligibilityStep from './EligibilityStep';
// import { Box } from '@mui/material';
// import propTypes from 'prop-types';
// import { useTheme } from '@mui/material/styles';
 
// function TabPanel(props) {
//   const { children, value, index, ...other } = props;
 
//   return (
//     <div
//       role='tabpanel'
//       hidden={value !== index}
//       id={`full-width-tabpanel-${index}`}
//       aria-labelledby={`full-width-tab-${index}`}
//       {...other}
//     >
//       {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
//     </div>
//   );
// }
 
// TabPanel.propTypes = {
//   children: propTypes.node,
//   index: propTypes.number.isRequired,
//   value: propTypes.number.isRequired,
// };
 
// export default function PrimaryApplicantTab() {
//   const { applicantStepsProgress, values, drawerTabIndex, primaryIndex } = useContext(LeadContext);
//   const theme = useTheme();
//   return (
//     <TabPanel
//       className='tabPanel'
//       style={{ maxHeight: `calc(100vh - 175px)`, overflow: 'auto' }}
//       value={drawerTabIndex}
//       index={0}
//       dir={theme.direction}
//     >
//       <div className='flex flex-col gap-[16px] w-[100%] pb-[80px] p-[15px]'>
//         <DrawerSteps
//           key={0}
//           details={applicantStepsProgress[0]}
//           steps={true}
//           index={primaryIndex}
//           stepIndex={0}
//         />
//         <DrawerSteps
//           key={1}
//           details={applicantStepsProgress[1]}
//           steps={true}
//           index={primaryIndex}
//           stepIndex={1}
//           lock={
//             values?.applicants?.[primaryIndex]?.applicant_details?.is_locked || values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !== 100
         
//           }
//         />
//         <DrawerSteps
//           key={2}
//           details={applicantStepsProgress[2]}
//           steps={true}
//           index={primaryIndex}
//           stepIndex={2}
//           lock={
//             values?.applicants?.[primaryIndex]?.applicant_details?.is_locked || values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !== 100
//           }
//         />
//         <DrawerSteps
//           key={3}
//           details={applicantStepsProgress[3]}
//           steps={true}
//           index={primaryIndex}
//           stepIndex={3}
//           lock={
//             values?.applicants?.[primaryIndex]?.applicant_details?.is_locked || values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !== 100
//           }
//         />
//         <QualifierStep
//           key={4}
//           details={applicantStepsProgress[4]}
//           steps={true}
//           index={primaryIndex}
//           stepIndex={4}
//           noProgress={true}
//           lock={
//             values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !== 100 ||
//             values?.applicants?.[primaryIndex]?.personal_details?.extra_params?.progress !== 100 ||
//             values?.applicants?.[primaryIndex]?.address_detail?.extra_params?.progress !== 100 ||
//             values?.applicants?.[primaryIndex]?.work_income_detail?.extra_params?.progress !== 100 ||
//             values?.applicants?.[primaryIndex]?.applicant_details?.is_locked
//           }
//         />
//         <DrawerSteps
//           key={5}
//           details={applicantStepsProgress[5]}
//           steps={true}
//           index={primaryIndex}
//           stepIndex={5}
//           noProgress={true}
//           lock={
//             values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !== 100 ||
//             !values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.qualifier ||
//             values?.applicants?.[primaryIndex]?.applicant_details?.is_locked
//           }
//         />
//         <DrawerSteps
//           key={6}
//           details={applicantStepsProgress[6]}
//           steps={true}
//           index={primaryIndex}
//           stepIndex={6}
//           lock={
//             values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !== 100 ||
//             !values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.qualifier||
//             values?.applicants?.[primaryIndex]?.applicant_details?.is_locked
//           }
//         />
//         <DrawerStepBanking
//           key={7}
//           details={applicantStepsProgress[7]}
//           steps={true}
//           index={primaryIndex}
//           stepIndex={7}
//           lock={
//             values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !== 100 ||
//             !values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.qualifier ||
//             values?.applicants?.[primaryIndex]?.applicant_details?.is_locked
//           }
//         />
//         <DrawerSteps
//           key={8}
//           details={applicantStepsProgress[8]}
//           steps={true}
//           index={primaryIndex}
//           stepIndex={8}
//           lock={
//             values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !== 100 ||
//             !values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.qualifier ||
//             values?.applicants?.[primaryIndex]?.applicant_details?.is_locked
//           }
//         />
//         <UploadSteps
//           key={9}
//           details={applicantStepsProgress[9]}
//           steps={true}
//           index={primaryIndex}
//           stepIndex={9}
//           lock={
//             values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !== 100 ||
//             !values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.qualifier ||
//             values?.applicants?.[primaryIndex]?.applicant_details?.is_locked
//           }
//         />
//         <DrawerSteps
//           key={10}
//           details={applicantStepsProgress[10]}
//           steps={true}
//           index={primaryIndex}
//           stepIndex={10}
//           noProgress={true}
//           lock={
//             values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !== 100 ||
//             values?.applicants?.[primaryIndex]?.applicant_details?.is_locked
//           }
//         />
//         <EligibilityStep
//           key={11}
//           details={applicantStepsProgress[11]}
//           steps={true}
//           index={primaryIndex}
//           stepIndex={11}
//           noProgress={true}
//           lock={
//             values?.lead?.extra_params?.progress_without_eligibility !== 100 ||
//             values?.applicants?.length < 2 ||
//             values?.applicants?.[primaryIndex]?.applicant_details?.is_locked
//           }
//         />
//       </div>
//     </TabPanel>
//   );
// }
 
import { useContext, useEffect, useState } from 'react';
import DrawerSteps from './DrawerSteps';
import { LeadContext } from '../../../context/LeadContextProvider';
import QualifierStep from './QualifierStep';
import DrawerStepBanking from './DrawerStepBanking';
import UploadSteps from './UplodSteps';
import EligibilityStep from './EligibilityStep';
import { Box } from '@mui/material';
import propTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import ApplicationFormTab from './ApplicationFormTab';
 
function TabPanel(props) {
  const { children, value, index, ...other } = props;
 
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}
 
TabPanel.propTypes = {
  children: propTypes.node,
  index: propTypes.number.isRequired,
  value: propTypes.number.isRequired,
};
 
export default function PrimaryApplicantTab() {
  const { applicantStepsProgress, values, drawerTabIndex, primaryIndex,activeLNT } = useContext(LeadContext);
  const theme = useTheme();


  useEffect(()=>{

    console.log("PRIMARY INDEX HERE",primaryIndex)

    console.log("VALUES LAT",values)

  },[values])
  const[faceDone,setFaceDone] = useState(false);

  const[finalProgress,setFinalProgress] = useState(true)

  const[allLocked,setAllLocked] = useState(true);


  const[appLock,setAppLock] = useState(true);

  const[bankDone,setBankDone] = useState(false);

  const[qualifier,setQualifier] = useState(false)


  useEffect(()=>{

    const applicants = values?.applicants;

    let bank = false;

    let qualifier = true;

    for(const app of applicants){

      const progress = app?.applicant_details?.extra_params?.banking_progress;

      const qualifier_status = app?.applicant_details?.extra_params?.qualifier;

      if(qualifier_status == false) qualifier = false;

      if(progress == 100) bank = true;
    }

    setBankDone(bank);

    setQualifier(qualifier);

  },[values])



  useEffect(()=>{


    const applicants = values?.applicants || [];

    let all_completed = true;

    for(const app of applicants){
      
      if(app?.applicant_details?.application_form_otp_verified == false || !app?.applicant_details?.application_form_otp_verified || !app?.applicant_details?.form_html){
        all_completed = false;
      }
    }

    if(all_completed === true){
      setAppLock(false);
    }

  },[values])

  
  useEffect(()=> {
    

    console.log("STATUS",values?.lead?.extra_params?.progress_without_eligibility);

    let lt_bre;

    for (let i = 0; i < values?.applicants.length; i++) {

      if(values?.applicants?.[i]?.applicant_details?.lt_bre_101_response){
        lt_bre = values?.applicants?.[i]?.applicant_details?.lt_bre_101_response;
      }

      if (values?.applicants?.[i]?.applicant_details?.faceLivliness_status == 'yes') {

        setFaceDone(true);

        return;
      }
    }
    
    //["body"]?.["Face_Liveliness_API"] == "na"

    if(lt_bre && (lt_bre?.["body"]?.["Face_Liveliness_API"] == "na" || lt_bre?.["body"]?.["Face_Liveliness_API"] == "NA")){
      setFaceDone(true);
      return;
    }

  },[])


  const checkAllapplicantProgressManual = () => {

    let all_completed = true;

    let applicant_count;

    let is_approved;


    const applicants = values?.applicants;

    const property_details = {...values?.property_details};

    const reference_details = {...values?.reference_details}


    if(applicants?.length >=2) {
      applicant_count = true;
    }

    let all_banking_progress = []

    for(const applicant of applicants) {

      all_banking_progress = [...all_banking_progress,applicant?.applicant_details?.extra_params?.banking_progress]


      if(applicant?.applicant_details?.isApproved == true){
        return
      }

      if(applicant?.applicant_details?.extra_params?.qualifier == false || applicant?.applicant_details?.extra_params?.upload_progress != 100) {
        all_completed = false;
      }


    }

    // check general details ie - property, reference

    // if(property_details?.extra_params?.progress !== 100 || reference_details?.extra_params?.progress !== 100) {
    //   all_completed = false;
    // }

    if (property_details?.extra_params?.progress == null || 
      reference_details?.extra_params?.progress == null || 
      property_details?.extra_params?.progress !== 100 || 
      reference_details?.extra_params?.progress !== 100) {
    all_completed = false;
  }

    // check if one banking atleast exists and progress is 100

    if(!all_banking_progress.includes(100)) {
      all_completed = false;
    }


    setFinalProgress(all_completed)

    console.log("all completed",all_completed)
  }


  useEffect(()=> {

    checkAllapplicantProgressManual();


  },[values])


  const serviceQueryLock = () => {

    let allLocked = true;


    if(values?.lead?.applicant_type == 'C' || values?.lead?.applicant_type == 'G') {

      values?.applicants?.forEach((applicant)=> {
        if(applicant?.applicant_details?.is_locked == false && applicant?.applicant_details?.is_primary == false) {
          allLocked = false;
        }
      })

    }

    return allLocked;
    
  }

  
  return (
    <TabPanel
      className='tabPanel'
      style={{ maxHeight: `calc(100vh - 175px)`, overflow: 'auto' }}
      value={drawerTabIndex}
      index={0}
      dir={theme.direction}
    >
      <div className='flex flex-col gap-[16px] w-[100%] pb-[80px] p-[15px]'>
        <DrawerSteps
          key={0}
          details={applicantStepsProgress[0]}
          steps={true}
          index={primaryIndex}
          stepIndex={0}
          lock={ values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.qualifier === true}
        />
        <DrawerSteps
          key={1}
          details={applicantStepsProgress[1]}
          steps={true}
          index={primaryIndex}
          stepIndex={1}
          lock={
            values?.applicants?.[primaryIndex]?.applicant_details?.is_locked || values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !== 100
          || values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.qualifier === true
          }
        />
        <DrawerSteps
          key={2}
          details={applicantStepsProgress[2]}
          steps={true}
          index={primaryIndex}
          stepIndex={2}
          lock={
            values?.applicants?.[primaryIndex]?.applicant_details?.is_locked || values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !== 100
            || values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.qualifier === true
          }
        />
        <DrawerSteps
          key={3}
          details={applicantStepsProgress[3]}
          steps={true}
          index={primaryIndex}
          stepIndex={3}
          lock={
            values?.applicants?.[primaryIndex]?.applicant_details?.is_locked || values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !== 100
            || values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.qualifier === true
          }
        />
        <QualifierStep
          key={4}
          details={applicantStepsProgress[4]}
          steps={true}
          index={primaryIndex}
          stepIndex={4}
          noProgress={true}
          lock={
            (values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !== 100 ||
            values?.applicants?.[primaryIndex]?.personal_details?.extra_params?.progress !== 100 ||
            values?.applicants?.[primaryIndex]?.address_detail?.extra_params?.progress !== 100 ||
            values?.applicants?.[primaryIndex]?.work_income_detail?.extra_params?.progress !== 100 ||
            values?.applicants?.[primaryIndex]?.applicant_details?.is_locked)
            && values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.qualifier == false
          }
        />
        <DrawerSteps    // LT CHARGES TAB
          key={5}
          details={applicantStepsProgress[5]}
          steps={true}
          index={primaryIndex}
          stepIndex={5}
          noProgress={true}
          lock={
            values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !== 100 ||
            !values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.qualifier ||
            values?.applicants?.[primaryIndex]?.applicant_details?.is_locked ||
            values?.applicants?.[primaryIndex]?.applicant_details?.isApproved == true 
          }
          tag = 'lt-charges'
        />
        <DrawerSteps
          key={6}
          details={applicantStepsProgress[6]}
          steps={true}
          index={primaryIndex}
          stepIndex={6}
          lock={
            values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !== 100 ||
            !values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.qualifier||
            values?.applicants?.[primaryIndex]?.applicant_details?.is_locked
            || values?.applicants?.[primaryIndex]?.applicant_details?.isApproved == true 

            
          }
        />
        <DrawerStepBanking
          key={7}
          details={applicantStepsProgress[7]}
          steps={true}
          index={primaryIndex}
          stepIndex={7}
          lock={
            values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !== 100 ||
            !values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.qualifier ||
            values?.applicants?.[primaryIndex]?.applicant_details?.is_locked
            || values?.applicants?.[primaryIndex]?.applicant_details?.isApproved == true 

          }
        />
        <DrawerSteps
          key={8}
          details={applicantStepsProgress[8]}
          steps={true}
          index={primaryIndex}
          stepIndex={8}
          lock={
            values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !== 100 ||
            !values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.qualifier ||
            values?.applicants?.[primaryIndex]?.applicant_details?.is_locked
            || values?.applicants?.[primaryIndex]?.applicant_details?.isApproved == true 

          }
        />
        <UploadSteps
          key={9}
          details={applicantStepsProgress[9]}
          steps={true}
          index={primaryIndex}
          stepIndex={9}
          lock={
            values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !== 100 ||
            !values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.qualifier ||
            values?.applicants?.[primaryIndex]?.applicant_details?.is_locked
            || values?.applicants?.[primaryIndex]?.applicant_details?.isApproved == true 

          }
        />
        <DrawerSteps
          key={10}
          details={applicantStepsProgress[10]}
          steps={true}
          index={primaryIndex}
          stepIndex={10}
          noProgress={true}
          lock={
            values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !== 100 ||
            values?.applicants?.[primaryIndex]?.applicant_details?.is_locked

          }
        />

        <ApplicationFormTab
          steps={true}
          index={primaryIndex}
          stepIndex={10}
          noProgress={true}
          lock={
           values?.lead?.extra_params?.progress_without_eligibility !== 100 ||
            values?.applicants?.length < 2 ||
            // values?.applicants?.[primaryIndex]?.applicant_details?.is_locked || 
            // values?.applicants?.[primaryIndex]?.applicant_details?.faceLivliness_status?.trim() !== 'yes'  ||
            faceDone == false ||

            finalProgress == false && serviceQueryLock() || !bankDone || !qualifier

          }
      
        />
        <EligibilityStep
          key={11}
          details={applicantStepsProgress[11]}
          steps={true}
          index={primaryIndex}
          stepIndex={11}
          noProgress={true}
          lock={
            values?.lead?.extra_params?.progress_without_eligibility !== 100 ||
            values?.applicants?.length < 2 ||
            // values?.applicants?.[primaryIndex]?.applicant_details?.is_locked || 
            // values?.applicants?.[primaryIndex]?.applicant_details?.faceLivliness_status?.trim() !== 'yes'  ||
            faceDone == false ||

            finalProgress == false || // additional check for percentage issue
            (values?.lead?.applicant_type == 'C' || values?.lead?.applicant_type == 'G') && serviceQueryLock()
            || appLock
          }
        />
      </div>
    </TabPanel>
  );
}
 
