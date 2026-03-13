// import Box from '@mui/material/Box';
// import { useContext, useState } from 'react';
// import propTypes from 'prop-types';
// import { useTheme } from '@mui/material/styles';
// import DrawerSteps from './DrawerSteps';
// import { LeadContext } from '../../../context/LeadContextProvider';
// import { DustbinIcon, ToolTipIcon } from '../../../assets/icons';
// import { ClickAwayListener, IconButton, Tooltip } from '@mui/material';
// import ToggleSwitch from '../../ToggleSwitch';
// import DrawerStepBanking from './DrawerStepBanking';
// import QualifierStep from './QualifierStep';
// import UploadSteps from './UplodSteps';
// import CoApplicantDropDownDrawer from '../../DropDown/CoApplicantDropDownDrawer';
 
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
 
// export default function CoApplicantTab({ toggle, setChangePrimaryAlert, setDeleteAlert }) {
//   const {
//     addApplicant,
//     values,
//     coApplicantStepsProgress,
//     drawerTabIndex,
//     primaryIndex,
//     activeCoApplicantIndex,
//     setActiveCoApplicantIndex,
//     coApplicants,
//   } = useContext(LeadContext);
 
//   const theme = useTheme();
 
//   const [open, setOpen] = useState(false);
 
//   const handleTooltipClose = () => {
//     setOpen(false);
//   };
 
//   const handleTooltipToggle = () => {
//     setOpen((prev) => !prev);
//   };
 
//   return (
//     <TabPanel
//       className='tabPanel'
//       style={{ height: `calc(100vh - 175px)`, overflow: 'auto' }}
//       value={drawerTabIndex}
//       index={1}
//       dir={theme.direction}
//     >
//       <div className='flex flex-col justify-between w-[100%] h-[100%] p-[15px]'>
//         <div className='flex flex-col gap-[16px] w-[100%]'>
//           <div className='flex flex-col justify-end gap-4 mt-[5px]'>
//             <div className='flex flex-col gap-1'>
//               <div className='flex justify-between'>
//                 <div className='flex gap-2 items-center'>
//                   <span className='font-medium text-[16px] leading-[24px]'>Co-applicants</span>
//                   <ClickAwayListener onClickAway={handleTooltipClose}>
//                     <div>
//                       <Tooltip
//                         PopperProps={{
//                           disablePortal: true,
//                         }}
//                         onClose={handleTooltipClose}
//                         open={open}
//                         title='You can add upto 4 Co-applicants'
//                         placement='bottom-start'
//                         arrow
//                       >
//                         <IconButton onClick={handleTooltipToggle}>
//                           <ToolTipIcon />
//                         </IconButton>
//                       </Tooltip>
//                     </div>
//                   </ClickAwayListener>
 
//                   <span className='font-semibold text-[16px] leading-[24px] text-[#373435]'>
//                     {values.applicants.filter((e) => !e.applicant_details.is_primary).length}
//                     <span className='text-[#96989A]'>/4</span>
//                   </span>
//                 </div>
 
//                 <button
//                   onClick={() => {
//                     // setActiveCoApplicantIndex(values?.applicants?.length);
//                     addApplicant();
//                   }}
//                   className={
//                     values.applicants.filter((e) => e.applicant_details.is_mobile_verified)
//                       .length >= 5 ||
//                     values?.applicants?.[primaryIndex]?.applicant_details?.extra_params
//                       ?.progress !== 100
//                       ? 'text-[#96989A] font-medium text-[16px]'
//                       : 'text-primary-red font-medium text-[16px]'
//                   }
//                   disabled={
//                     values.applicants.filter((e) => e.applicant_details.is_mobile_verified)
//                       .length >= 5 ||
//                     values?.applicants?.[primaryIndex]?.applicant_details?.extra_params
//                       ?.progress !== 100
//                   }
//                 >
//                   + Add
//                 </button>
//               </div>
//               {/* <span className='font-normal text-[12px] leading-[18px] text-[#727376]'>
//             After the qualifier is complete, co-applicants can be made primary
//           </span> */}
//             </div>
 
//             {values?.applicants &&
//             values.applicants.length >= 2 &&
//             !!values.applicants?.find((e) => e.applicant_details.is_mobile_verified) ? (
//               <div className='flex flex-col gap-4'>
//                 <CoApplicantDropDownDrawer
//                   options={coApplicants}
//                   onChange={(e) => {
//                     setActiveCoApplicantIndex(e);
//                   }}
//                   value={coApplicants?.[activeCoApplicantIndex]?.value}
//                   defaultSelected={coApplicants?.[activeCoApplicantIndex]?.value}
//                   disabledError={true}
//                 />
//                 <div className='flex justify-between'>
//                   {values?.applicants?.[activeCoApplicantIndex]?.applicant_details
//                     ?.is_mobile_verified ? (
//                     <>
//                       <div className='flex gap-1 items-center'>
//                         <span className='text-[12px] font-[400] text-[#727376]'>
//                           Make it primary
//                         </span>
//                         <ToggleSwitch
//                           name='make_it_primary'
//                           checked={toggle}
//                           onChange={() => setChangePrimaryAlert(true)}
//                         />
//                       </div>
 
//                       <div className='flex justify-end gap-2 items-center'>
//                         <span className='text-[#727376] text-[12px] font-normal'>
//                           Qualifier:
//                           {values?.applicants?.[activeCoApplicantIndex]?.applicant_details
//                             ?.bre_101_response?.body?.Display?.red_amber_green === 'Red' ? (
//                             <span className='text-[#E33439] text-[12px] font-semibold ml-[5px]'>
//                               Red
//                             </span>
//                           ) : values?.applicants?.[activeCoApplicantIndex]?.applicant_details
//                               ?.bre_101_response?.body?.Display?.red_amber_green === 'Amber' ? (
//                             <span className='text-[#FF9D4A] text-[12px] font-semibold ml-[5px]'>
//                               Amber
//                             </span>
//                           ) : values?.applicants?.[activeCoApplicantIndex]?.applicant_details
//                               ?.bre_101_response?.body?.Display?.red_amber_green === 'Green' ? (
//                             <span className='text-[#147257] text-[12px] font-semibold ml-[5px]'>
//                               Green
//                             </span>
//                           ) : null}
//                         </span>
 
//                         <button disabled={true}  onClick={() => setDeleteAlert(true)}>
//                           <DustbinIcon />
//                         </button>
//                       </div>
//                     </>
//                   ) : null}
//                 </div>
 
//                 <div className='flex flex-col gap-[16px] w-[100%] pb-[80px]'>
//                   <DrawerSteps
//                     key={0}
//                     details={coApplicantStepsProgress[0]}
//                     steps={true}
//                     index={activeCoApplicantIndex}
//                     stepIndex={0}
//                   />
//                   <DrawerSteps
//                     key={1}
//                     details={coApplicantStepsProgress[1]}
//                     steps={true}
//                     index={activeCoApplicantIndex}
//                     stepIndex={1}
//                     lock={
//                       values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params
//                         ?.progress !== 100 ||
//                         values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.is_locked
//                     }
//                   />
//                   <DrawerSteps
//                     key={2}
//                     details={coApplicantStepsProgress[2]}
//                     steps={true}
//                     index={activeCoApplicantIndex}
//                     stepIndex={2}
//                     lock={
//                       values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params
//                         ?.progress !== 100 ||
//                         values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.is_locked
//                     }
//                   />
//                   <DrawerSteps
//                     key={3}
//                     details={coApplicantStepsProgress[3]}
//                     steps={true}
//                     index={activeCoApplicantIndex}
//                     stepIndex={3}
//                     lock={
//                       values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params
//                         ?.progress !== 100 ||
//                         values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.is_locked
//                     }
//                   />
//                   <QualifierStep
//                     key={4}
//                     details={coApplicantStepsProgress[4]}
//                     steps={true}
//                     index={activeCoApplicantIndex}
//                     stepIndex={4}
//                     noProgress={true}
//                     lock={
//                       values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params
//                         ?.progress !== 100 ||
//                       values?.applicants?.[activeCoApplicantIndex]?.personal_details?.extra_params
//                         ?.progress !== 100 ||
//                       values?.applicants?.[activeCoApplicantIndex]?.address_detail?.extra_params
//                         ?.progress !== 100 ||
//                       values?.applicants?.[activeCoApplicantIndex]?.work_income_detail?.extra_params
//                         ?.progress !== 100 ||
//                         values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.is_locked
//                     }
//                   />
//                   <DrawerStepBanking
//                     key={5}
//                     details={coApplicantStepsProgress[5]}
//                     steps={true}
//                     index={activeCoApplicantIndex}
//                     stepIndex={5}
//                     lock={
//                       values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params
//                         ?.progress !== 100 ||
//                       !values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params
//                         ?.qualifier ||
//                         values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.is_locked
//                     }
//                   />
//                   <UploadSteps
//                     key={6}
//                     details={coApplicantStepsProgress[6]}
//                     steps={true}
//                     index={activeCoApplicantIndex}
//                     stepIndex={6}
//                     lock={
//                       values?.applicants?.[primaryIndex]?.applicant_details?.extra_params
//                         ?.progress !== 100 ||
//                       !values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params
//                         ?.qualifier ||
//                         values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.is_locked
//                     }
//                   />
//                 </div>
//               </div>
//             ) : (
//               <button
//                 disabled={
//                   values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !==
//                   100
//                 }
//                 onClick={() => {
//                   // setActiveCoApplicantIndex(values?.applicants?.length);
//                   addApplicant();
//                 }}
//                 className={`w-[100%] h-[48px] border rounded-[4px] flex items-center justify-center text-[16px] font-normal
//             ${
//               values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !== 100
//                 ? 'text-[#96989A] border-[#96989A]'
//                 : 'text-white bg-[#E33439]'
//             }`}
//               >
//                 Add Co-applicant
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </TabPanel>
//   );
// }
 
// CoApplicantTab.propTypes = {
//   toggle: propTypes.func,
//   setChangePrimaryAlert: propTypes.func,
//   setDeleteAlert: propTypes.func,
// };
 
import Box from '@mui/material/Box';
import { useContext, useEffect, useState } from 'react';
import propTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import DrawerSteps from './DrawerSteps';
import { LeadContext } from '../../../context/LeadContextProvider';
import { DustbinIcon, ToolTipIcon } from '../../../assets/icons';
import { ClickAwayListener, IconButton, Tooltip } from '@mui/material';
import ToggleSwitch from '../../ToggleSwitch';
import DrawerStepBanking from './DrawerStepBanking';
import QualifierStep from './QualifierStep';
import UploadSteps from './UplodSteps';
import CoApplicantDropDownDrawer from '../../DropDown/CoApplicantDropDownDrawer';
import { editFieldsById } from '../../../global';
import { progress } from 'framer-motion';
import { AuthContext } from '../../../context/AuthContextProvider';
 
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
 
export default function CoApplicantTab({ toggle, setChangePrimaryAlert, setDeleteAlert,calculateTotalProgress,switched }) {
  const {
    addApplicant,
    values,
    coApplicantStepsProgress,
    drawerTabIndex,
    primaryIndex,
    activeCoApplicantIndex,
    setActiveCoApplicantIndex,
    coApplicants,
    activeIndex
  } = useContext(LeadContext);

  const {token} = useContext(AuthContext);
 
  const theme = useTheme();
 
  const [open, setOpen] = useState(false);
 
  const handleTooltipClose = () => {
    setOpen(false);
  };
 
  const handleTooltipToggle = () => {
    setOpen((prev) => !prev);
  };



  // in cases of internet fluctuation and extra params already added due to incomplete api calls ** 13/02


  const validateParams = async() => {


    const applicants = values?.applicants;

    for(const app of applicants) {


    let need_update = false;


    const active_applicant = app;

    if(app?.applicant_details?.is_primary == true || app?.applicant_details?.extra_params?.qualifier == true) {
      return;
    }


    // check work income

    let work_income_params = {...active_applicant?.work_income_detail?.extra_params}

    // if(work_income_params?.required_fields_status.hasOwnProperty('comfortable_emi')) {
    //   need_update = true;
    //   delete work_income_params?.required_fields_status?.comfortable_emi
    // }

    // if(work_income_params?.required_fields_status.hasOwnProperty('no_of_dependents')) {
    //   need_update = true;

    //   delete work_income_params?.required_fields_status?.no_of_dependents
    // }

    // if(work_income_params?.required_fields_status.hasOwnProperty('total_household_income')) {
    //   need_update = true;

    //   delete work_income_params?.required_fields_status?.total_household_income
    // }

    // if(work_income_params?.required_fields_status.hasOwnProperty('total_family_number')) {
    //   need_update = true;
    //   delete work_income_params?.required_fields_status?.total_family_number
    // }

    if(active_applicant?.work_income_detail?.no_current_loan ==0) {

      work_income_params.required_fields_status.no_current_loan = true;
      work_income_params.required_fields_status.ongoing_emi = true;
      need_update = true;

    }

    else if(active_applicant?.work_income_detail?.no_current_loan>0 && active_applicant?.work_income_detail?.ongoing_emi >=0){
      work_income_params.required_fields_status.no_current_loan = true;
      work_income_params.required_fields_status.ongoing_emi = true;
      need_update = true;
    }

    //if(need_update == true) {
      try{
      await editFieldsById(
        active_applicant?.work_income_detail?.id,
        'work-income',
        {
          extra_params: {...work_income_params,progress:calculateTotalProgress(work_income_params?.required_fields_status)},
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );

      let index;

      for(let i =0; i<applicants?.length; i++) {
        if(applicants[i]?.applicant_details?.id == app?.id) {
          index = i;
        }
      }

      setFieldValue(
        `applicants[${index}].work_income_detail.extra_params`,
        {...work_income_params,progress:calculateTotalProgress(work_income_params?.required_fields_status)}
        ,
      );
    }
    catch(err) {

      console.log("ERROR UPDATING PARAMS VALIDATION ADD",err)
    }
  //}
    

  }

}

  // useEffect(()=> {

  //   validateParams();
  // },[switched])




 
  return (
    <TabPanel
      className='tabPanel'
      style={{ height: `calc(100vh - 175px)`, overflow: 'auto' }}
      value={drawerTabIndex}
      index={1}
      dir={theme.direction}
    >
      <div className='flex flex-col justify-between w-[100%] h-[100%] p-[15px]'>
        <div className='flex flex-col gap-[16px] w-[100%]'>
          <div className='flex flex-col justify-end gap-4 mt-[5px]'>
            <div className='flex flex-col gap-1'>
              <div className='flex justify-between'>
                <div className='flex gap-2 items-center'>
                  <span className='font-medium text-[16px] leading-[24px]'>Co-applicants</span>
                  <ClickAwayListener onClickAway={handleTooltipClose}>
                    <div>
                      <Tooltip
                        PopperProps={{
                          disablePortal: true,
                        }}
                        onClose={handleTooltipClose}
                        open={open}
                        title='You can add upto 4 Co-applicants'
                        placement='bottom-start'
                        arrow
                      >
                        <IconButton onClick={handleTooltipToggle}>
                          <ToolTipIcon />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </ClickAwayListener>
 
                  <span className='font-semibold text-[16px] leading-[24px] text-[#373435]'>
                    {values.applicants.filter((e) => !e.applicant_details.is_primary).length}
                    <span className='text-[#96989A]'>/14</span>
                  </span>
                </div>
 
                <button
                  onClick={() => {
                    // setActiveCoApplicantIndex(values?.applicants?.length);
                    addApplicant();
                  }}
                  className={
                    values.applicants.filter((e) => e.applicant_details.is_mobile_verified)
                      .length >= 5 ||
                    values?.applicants?.[primaryIndex]?.applicant_details?.extra_params
                      ?.progress !== 100
                      ? 'text-[#96989A] font-medium text-[16px]'
                      : 'text-primary-red font-medium text-[16px]'
                  }
                  disabled={
                    values.applicants.filter((e) => e.applicant_details.is_mobile_verified)
                      .length >= 15 ||
                    values?.applicants?.[primaryIndex]?.applicant_details?.extra_params
                      ?.progress !== 100
                  }
                >
                  + Add
                </button>
              </div>
              {/* <span className='font-normal text-[12px] leading-[18px] text-[#727376]'>
            After the qualifier is complete, co-applicants can be made primary
          </span> */}
            </div>
 
            {values?.applicants &&
            values.applicants.length >= 2 &&
            !!values.applicants?.find((e) => e.applicant_details.is_mobile_verified) ? (
              <div className='flex flex-col gap-4'>
                <CoApplicantDropDownDrawer
                  options={coApplicants}
                  onChange={(e) => {
                    setActiveCoApplicantIndex(e);

                    console.log("APPLI",coApplicants)
                  }}
                  value={coApplicants?.[activeCoApplicantIndex]?.value}
                  defaultSelected={coApplicants?.[activeCoApplicantIndex]?.value}
                  disabledError={true}
                />
                <div className='flex justify-between'>
                  {values?.applicants?.[activeCoApplicantIndex]?.applicant_details
                    ?.is_mobile_verified ? (
                    <>
                      <div className='flex gap-1 items-center'>
                        <span className='text-[12px] font-[400] text-[#727376]'>
                          Make it primary
                        </span>
                        <ToggleSwitch
                          name='make_it_primary'
                          checked={toggle}
                          disabled={values?.lead?.salesforce_application_id}
                          onChange={() => setChangePrimaryAlert(true)}
                        />
                      </div>
 
                      <div className='flex justify-end gap-2 items-center'>
                        <span className='text-[#727376] text-[12px] font-normal'>
                          Qualifier:
                          {values?.applicants?.[activeCoApplicantIndex]?.applicant_details
                            ?.bre_101_response?.body?.Display?.red_amber_green === 'Red' ? (
                            <span className='text-[#E33439] text-[12px] font-semibold ml-[5px]'>
                              Red
                            </span>
                          ) : values?.applicants?.[activeCoApplicantIndex]?.applicant_details
                              ?.bre_101_response?.body?.Display?.red_amber_green === 'Amber' ? (
                            <span className='text-[#FF9D4A] text-[12px] font-semibold ml-[5px]'>
                              Amber
                            </span>
                          ) : values?.applicants?.[activeCoApplicantIndex]?.applicant_details
                              ?.bre_101_response?.body?.Display?.red_amber_green === 'Green' ? (
                            <span className='text-[#147257] text-[12px] font-semibold ml-[5px]'>
                              Green
                            </span>
                          ) : null}
                        </span>
 
                        <button disabled={true}  onClick={() => setDeleteAlert(true)}>
                          <DustbinIcon />
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
 
                <div className='flex flex-col gap-[16px] w-[100%] pb-[80px]'>
                  <DrawerSteps
                    key={0}
                    details={coApplicantStepsProgress[0]}
                    steps={true}
                    index={activeCoApplicantIndex}
                    stepIndex={0}
                    lock={ values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params?.qualifier === true}
                  />
                  <DrawerSteps
                    key={1}
                    details={coApplicantStepsProgress[1]}
                    steps={true}
                    index={activeCoApplicantIndex}
                    stepIndex={1}
                    lock={
                      values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params
                        ?.progress !== 100 ||
                        values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.is_locked
                        ||  values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params?.qualifier === true
                    }
                  />
                  <DrawerSteps
                    key={2}
                    details={coApplicantStepsProgress[2]}
                    steps={true}
                    index={activeCoApplicantIndex}
                    stepIndex={2}
                    lock={
                      values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params
                        ?.progress !== 100 ||
                        values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.is_locked
                        ||  values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params?.qualifier === true
                    }
                  />
                  <DrawerSteps
                    key={3}
                    details={coApplicantStepsProgress[3]}
                    steps={true}
                    index={activeCoApplicantIndex}
                    stepIndex={3}
                    lock={
                      values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params
                        ?.progress !== 100 ||
                        values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.is_locked
                        ||  values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params?.qualifier === true
                    }
                  />
                   <QualifierStep
                    key={4}
                    details={coApplicantStepsProgress[4]}
                    steps={true}
                    index={activeCoApplicantIndex}
                    stepIndex={4}
                    noProgress={true}
                    // lock={
                    //   values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params
                    //     ?.progress !== 100 ||
                    //   values?.applicants?.[activeCoApplicantIndex]?.personal_details?.extra_params
                    //     ?.progress !== 100 ||
                    //   values?.applicants?.[activeCoApplicantIndex]?.address_detail?.extra_params
                    //     ?.progress !== 100 ||
                    //   values?.applicants?.[activeCoApplicantIndex]?.work_income_detail?.extra_params
                    //     ?.progress !== 100 ||
                    //     values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.is_locked
                    // }

                         lock={
                      (values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params
                        ?.progress !== 100 ||
                      values?.applicants?.[activeCoApplicantIndex]?.personal_details?.extra_params
                        ?.progress !== 100 ||
                      values?.applicants?.[activeCoApplicantIndex]?.address_detail?.extra_params
                        ?.progress !== 100 ||
                      values?.applicants?.[activeCoApplicantIndex]?.work_income_detail?.extra_params
                        ?.progress !== 100 ||
                        values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.is_locked)
                      && values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params?.qualifier == false

                    }
                  />
                  <DrawerStepBanking
                    key={5}
                    details={coApplicantStepsProgress[5]}
                    steps={true}
                    index={activeCoApplicantIndex}
                    stepIndex={5}
                    lock={
                      values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params
                        ?.progress !== 100 ||
                      !values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params
                        ?.qualifier ||
                        values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.is_locked
                        || values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.isApproved == true 

                    }
                  />
                  <UploadSteps
                    key={6}
                    details={coApplicantStepsProgress[6]}
                    steps={true}
                    index={activeCoApplicantIndex}
                    stepIndex={6}
                    lock={
                      values?.applicants?.[primaryIndex]?.applicant_details?.extra_params
                        ?.progress !== 100 ||
                      !values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params
                        ?.qualifier ||
                        values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.is_locked
                        || values?.applicants?.[activeCoApplicantIndex]?.applicant_details?.isApproved == true 

                    }
                  />
                </div>
              </div>
            ) : (
              <button
                disabled={
                  values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !==
                  100
                }
                onClick={() => {
                  // setActiveCoApplicantIndex(values?.applicants?.length);
                  addApplicant();
                }}
                className={`w-[100%] h-[48px] border rounded-[4px] flex items-center justify-center text-[16px] font-normal
            ${
              values?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.progress !== 100
                ? 'text-[#96989A] border-[#96989A]'
                : 'text-white bg-[#E33439]'
            }`}
              >
                Add Co-applicant
              </button>
            )}
          </div>
        </div>
      </div>
    </TabPanel>
  );
}
 
CoApplicantTab.propTypes = {
  toggle: propTypes.func,
  setChangePrimaryAlert: propTypes.func,
  setDeleteAlert: propTypes.func,
};
 
