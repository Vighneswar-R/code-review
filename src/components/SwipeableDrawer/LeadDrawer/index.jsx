import { styled } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { useCallback, useContext, useEffect, useState } from 'react';
import propTypes from 'prop-types';
import BottomSheetHandle from '../../BottomSheetHandle';
import SwipeableViews from 'react-swipeable-views';
import { useTheme } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import DrawerFooter from './DrawerFooter';
import { LeadContext } from '../../../context/LeadContextProvider';
import PrimaryApplicantTab from './PrimaryApplicantTab';
import CoApplicantTab from './CoApplicantTab';
import ToolsTab from './ToolsTab';
import DynamicDrawer from '../DynamicDrawer';
import { AuthContext } from '../../../context/AuthContextProvider';
import { editFieldsById,updatePrimary,editUploadFlags } from '../../../global';
import { IconClose } from '../../../assets/icons';
import Button from '../../Button';
import Loader from '../../Loader';
import loading from '../../../assets/icons/loading.svg';



const drawerBleeding = 0;

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#fff' : grey[800],
}));

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

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

export default function SwipeableDrawerComponent() {
  const {
    drawerOpen,
    setDrawerOpen,
    values,
    drawerTabIndex,
    setDrawerTabIndex,
    primaryIndex,
    setPrimaryIndex,
    setFieldValue,
    setActiveIndex,
    activeCoApplicantIndex,
    updateCompleteFormProgress,
    coApplicantDrawerUpdate,
    updateProgressApplicantSteps,
    setTempQualifierCoApplicant,
    setTempQualifier,
    activeIndex
  } = useContext(LeadContext);

  const { token, phoneNumberList, setPhoneNumberList } = useContext(AuthContext);

  const theme = useTheme();

  const [toggle, setToggle] = useState(false);

  const[switched,setSwitched] = useState(false)

  const [changePrimaryAlert, setChangePrimaryAlert] = useState(false);

  const [deleteAlert, setDeleteAlert] = useState(false);


  const[switchLoader,setSwitchLoader] = useState(false);

  useEffect(()=>{

    
    let tabIndex;

    let is_primary = values?.applicants?.[activeIndex]?.applicant_details?.is_primary;

    if(is_primary){
      setDrawerTabIndex(0);    
    }

    else{
      setDrawerTabIndex(1);
    }


  },[])

  const handleChange = (event, newValue) => {
    // let newData = structuredClone(values);
    // coApplicantDrawerUpdate(newData?.applicants);
    coApplicantDrawerUpdate(values?.applicants);
    setDrawerTabIndex(newValue);
  };

  const handleChangeIndex = useCallback((index) => {
    setDrawerTabIndex(index);
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };

  const handleMakePrimary = async () => {    //*****here */  ** new update 05/02

    try {

   
    setToggle(true);
    setSwitchLoader(true)
    let newData = structuredClone(values);

    newData.applicants[activeCoApplicantIndex].applicant_details = {
      ...newData.applicants[activeCoApplicantIndex].applicant_details,
      is_primary: true,
      applicant_type: 'Primary Applicant',
    };


    // reset tempQualifiers while switching to avoid disable issue


    setTempQualifier(false);

    setTempQualifierCoApplicant(false);

    // initial check if the switched to primary applicant qualifier is done or not **

    if(newData?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params?.qualifier == true) {

      newData.applicants[activeCoApplicantIndex].address_detail.extra_params.required_fields_status.address_for_tax_purpose = true;

      newData.applicants[activeCoApplicantIndex].work_income_detail.extra_params.required_fields_status.comfortable_emi = true;

      newData.applicants[activeCoApplicantIndex].personal_details.extra_params.required_fields_status.caste = true;


    }

    else {

      //check if values already exist and proceed


      //personal ** new

       if(newData.applicants[activeCoApplicantIndex].personal_details?.caste?.length) {
        newData.applicants[activeCoApplicantIndex].personal_details.extra_params.required_fields_status.caste = true;
      }

      else {
        newData.applicants[activeCoApplicantIndex].personal_details.extra_params.required_fields_status.caste = false;
      }

      if(newData.applicants[activeCoApplicantIndex].address_detail?.address_for_tax_purpose?.length) {
        newData.applicants[activeCoApplicantIndex].address_detail.extra_params.required_fields_status.address_for_tax_purpose = true;
      }

      else {
        newData.applicants[activeCoApplicantIndex].address_detail.extra_params.required_fields_status.address_for_tax_purpose = false;
      }

      //work income **

      if(newData.applicants[activeCoApplicantIndex].work_income_detail?.comfortable_emi?.length) {
        newData.applicants[activeCoApplicantIndex].work_income_detail.extra_params.required_fields_status.comfortable_emi = true;
      }

      else {
        newData.applicants[activeCoApplicantIndex].work_income_detail.extra_params.required_fields_status.comfortable_emi = false;
      }

      if(newData.applicants[activeCoApplicantIndex].work_income_detail?.profession?.length) {
        newData.applicants[activeCoApplicantIndex].work_income_detail.extra_params.required_fields_status.profession = true;
      }

      else {
          newData.applicants[activeCoApplicantIndex].work_income_detail.extra_params.required_fields_status.profession = false;
      }

      if(newData.applicants[activeCoApplicantIndex].work_income_detail?.no_of_dependents?.length) {
        newData.applicants[activeCoApplicantIndex].work_income_detail.extra_params.required_fields_status.no_of_dependents = true;
      }

      else {
          newData.applicants[activeCoApplicantIndex].work_income_detail.extra_params.required_fields_status.no_of_dependents = false;
      }

      if(newData.applicants[activeCoApplicantIndex].work_income_detail?.total_family_number?.length) {
        newData.applicants[activeCoApplicantIndex].work_income_detail.extra_params.required_fields_status.total_family_number = true;
      }

      else {
          newData.applicants[activeCoApplicantIndex].work_income_detail.extra_params.required_fields_status.total_family_number = false;
      }

      if(newData.applicants[activeCoApplicantIndex].work_income_detail?.total_household_income?.length) {
        newData.applicants[activeCoApplicantIndex].work_income_detail.extra_params.required_fields_status.total_household_income = true;
      }

      else {
          newData.applicants[activeCoApplicantIndex].work_income_detail.extra_params.required_fields_status.total_household_income = false;
      }


    }

//--------------------------
    // if(newData.applicants[activeCoApplicantIndex].address_detail?.address_for_tax_purpose?.length) {
    //   newData.applicants[activeCoApplicantIndex].address_detail.extra_params.required_fields_status.address_for_tax_purpose = true;
    // }

    // else {

    //   if(newData?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params?.qualifier == true) {
    //     newData.applicants[activeCoApplicantIndex].address_detail.extra_params.required_fields_status.address_for_tax_purpose = true;
    //   }
    //   else {
    //     newData.applicants[activeCoApplicantIndex].address_detail.extra_params.required_fields_status.address_for_tax_purpose = false;
    //   }
  
    // }

    // handle upload screen issues seperately for primary

    if(newData?.applicants?.[activeCoApplicantIndex]?.applicant_details?.document_meta?.property_paper_photos) {
      newData.applicants[activeCoApplicantIndex].applicant_details.extra_params.upload_required_fields_status.property_paper = true;
    }

    else {

      //check if current primary has property paper photos in document meta if yes replace it

      if(newData?.applicants?.[primaryIndex]?.applicant_details?.document_meta?.property_paper_photos?.length) {
      newData.applicants[activeCoApplicantIndex].applicant_details.extra_params.upload_required_fields_status.property_paper = true;
  
      newData.applicants[activeCoApplicantIndex].applicant_details.document_meta.property_paper_photos = newData?.applicants?.[primaryIndex]?.applicant_details?.document_meta?.property_paper_photos;

      }

      else {
        newData.applicants[activeCoApplicantIndex].applicant_details.extra_params.upload_required_fields_status.property_paper = false;
      }
    }


    if(newData?.applicants?.[activeCoApplicantIndex]?.applicant_details?.document_meta?.lo_selfie) {
      newData.applicants[activeCoApplicantIndex].applicant_details.extra_params.upload_required_fields_status.upload_selfie = true;
    }
    else {

       //check if current primary has property paper photos in document meta if yes replace it

       if(newData?.applicants?.[primaryIndex]?.applicant_details?.document_meta?.lo_selfie?.length) {
        newData.applicants[activeCoApplicantIndex].applicant_details.extra_params.upload_required_fields_status.upload_selfie = true;
    
        newData.applicants[activeCoApplicantIndex].applicant_details.document_meta.lo_selfie = newData?.applicants?.[primaryIndex]?.applicant_details?.document_meta?.lo_selfie;

        if(newData?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.is_upload_otp_verified == true) {
          newData.applicants[activeCoApplicantIndex].applicant_details.extra_params.is_upload_otp_verified = true;
        }
  
        }
  
        else {
          newData.applicants[activeCoApplicantIndex].applicant_details.extra_params.upload_required_fields_status.upload_selfie = false;
        }
    }

    // handle for relation with applicant ** for switching to primary

    newData.applicants[activeCoApplicantIndex].personal_details.relation_with_main_applicant = "Self"

    newData.applicants[activeCoApplicantIndex].applicant_details.extra_params.upload_required_fields_status.relation_with_main_applicant = true;


    newData.applicants[primaryIndex].applicant_details = {
      ...newData.applicants[primaryIndex].applicant_details,
      is_primary: false,
      applicant_type: 'Co Applicant',
    };



    console.log("BEFORE SWITCH",newData?.applicants?.[primaryIndex]?.work_income_detail)

        delete  newData.applicants[primaryIndex].personal_details.extra_params.required_fields_status.caste


    delete  newData.applicants[primaryIndex].address_detail.extra_params.required_fields_status.address_for_tax_purpose

    delete  newData.applicants[primaryIndex].work_income_detail.extra_params.required_fields_status.comfortable_emi

    // issue on applicant switch ** 28-05

    if(newData.applicants[primaryIndex]?.applicant_details?.extra_params?.qualifier == false){

      newData.applicants[primaryIndex].work_income_detail.extra_params.required_fields_status.no_of_dependents = true;

      newData.applicants[primaryIndex].work_income_detail.extra_params.required_fields_status.total_family_number = true;
  
      newData.applicants[primaryIndex].work_income_detail.extra_params.required_fields_status.total_household_income = true;
    }





    if(newData?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.upload_required_fields_status?.hasOwnProperty("property_paper")){
      delete newData?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.upload_required_fields_status?.property_paper
    }

    if(newData?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.upload_required_fields_status?.hasOwnProperty("upload_selfie")) {
      delete newData?.applicants?.[primaryIndex]?.applicant_details?.extra_params?.upload_required_fields_status?.upload_selfie
    }

    // handle for relation with applicant ** for switching to co applicant

    if(newData.applicants[primaryIndex]?.applicant_details?.isApproved){
          newData.applicants[primaryIndex].applicant_details.extra_params.upload_required_fields_status.relation_with_main_applicant = true;

          newData.applicants[primaryIndex].personal_details.relation_with_main_applicant = null

    }

    else{
    newData.applicants[primaryIndex].personal_details.relation_with_main_applicant = null

    newData.applicants[primaryIndex].applicant_details.extra_params.upload_required_fields_status.relation_with_main_applicant = false;
    }




    //update progress based on the new required fields after switching

    //calculateTotalProgress

        newData.applicants[activeCoApplicantIndex].personal_details.extra_params.progress = calculateTotalProgress(newData?.applicants?.[activeCoApplicantIndex]?.personal_details?.extra_params.required_fields_status);

    newData.applicants[activeCoApplicantIndex].address_detail.extra_params.progress = calculateTotalProgress(newData?.applicants?.[activeCoApplicantIndex]?.address_detail?.extra_params.required_fields_status);

    // newData.applicants[activeCoApplicantIndex].work_income_detail.extra_params.progress = calculateTotalProgress(newData?.applicants?.[activeCoApplicantIndex]?.work_income_detail?.extra_params.required_fields_status);

    newData.applicants[activeCoApplicantIndex].work_income_detail.extra_params.progress = newData?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params?.qualifier == true?100:calculateTotalProgress(newData?.applicants?.[activeCoApplicantIndex]?.work_income_detail?.extra_params.required_fields_status)

    newData.applicants[activeCoApplicantIndex].applicant_details.extra_params.upload_progress = calculateTotalProgress(newData?.applicants?.[activeCoApplicantIndex]?.applicant_details?.extra_params.upload_required_fields_status)


    
    newData.applicants[primaryIndex].personal_details.extra_params.progress = calculateTotalProgress(newData?.applicants?.[primaryIndex]?.personal_details?.extra_params.required_fields_status)

    newData.applicants[primaryIndex].address_detail.extra_params.progress = calculateTotalProgress(newData?.applicants?.[primaryIndex]?.address_detail?.extra_params.required_fields_status)



    // newData.applicants[primaryIndex].work_income_detail.extra_params.progress = calculateTotalProgress(newData?.applicants?.[primaryIndex]?.work_income_detail?.extra_params.required_fields_status)


    newData.applicants[primaryIndex].work_income_detail.extra_params.progress = newData?.applicants[primaryIndex]?.applicant_details?.extra_params?.qualifier == true?100:calculateTotalProgress(newData?.applicants?.[primaryIndex]?.work_income_detail?.extra_params.required_fields_status)

    newData.applicants[primaryIndex].applicant_details.extra_params.upload_progress = calculateTotalProgress(newData?.applicants?.[primaryIndex]?.applicant_details?.extra_params.upload_required_fields_status)

    // await editFieldsById(
    //   values?.applicants[activeCoApplicantIndex]?.applicant_details?.id,
    //   'applicant',
    //   {
    //     is_primary: true,
    //     applicant_type: 'Primary Applicant',
    //   },
    //   {
    //     headers: {
    //       Authorization: token,
    //     },
    //   },
    // );

    // await editFieldsById(
    //   values?.applicants[primaryIndex]?.applicant_details?.id,
    //   'applicant',
    //   {
    //     is_primary: false,
    //     applicant_type: 'Co Applicant',
    //   },
    //   {
    //     headers: {
    //       Authorization: token,
    //     },
    //   },
    // );

    const res = await updatePrimary(
      values?.applicants[activeCoApplicantIndex]?.applicant_details?.id,
      'applicant',
      {
        primary_id : {applicant:values?.applicants[primaryIndex]?.applicant_details?.id,address:values?.applicants[primaryIndex]?.address_detail?.id,work_income:values?.applicants[primaryIndex]?.work_income_detail?.id},
        coapp_id : {applicant:values?.applicants[activeCoApplicantIndex]?.applicant_details?.id,address:values?.applicants[activeCoApplicantIndex]?.address_detail?.id,work_income:values?.applicants[activeCoApplicantIndex]?.work_income_detail?.id}
      },
      {
        headers: {
          Authorization: token,
        },
      },
    );

    // additionally handle if the applicant form is already generated ** clear for all

    let batch = [];

    newData?.applicants?.forEach((app,index)=>{

      let applicant_details = app?.applicant_details;

      let meta = applicant_details?.document_meta;

      if(applicant_details?.application_form_otp_verified){

        let app_forms = meta?.application_form?.map((form)=>{
          
          form.active = false;

          return form;
        
        }) || [];

        meta.application_form = app_forms;

        newData.applicants[index].applicant_details.document_meta = meta;
        newData.applicants[index].applicant_details.application_form_otp_verified = null;
        newData.applicants[index].applicant_details.application_form_otp = null;
        newData.applicants[index].applicant_details.form_html = null;

      
        batch.push(editFieldsById(applicant_details?.id,'applicant',{
          document_meta:meta,
          application_form_otp_verified:null,
          application_form_otp:null,
          form_html:null
        },{headers:{
          Authorization:token
        }}));

        //additionally push upload edit active as well to sync it during salesforce dms upload

        if (applicant_details?.id) {
        batch.push(editUploadFlags(applicant_details?.id,{headers:{
          Authorization:token
        }}))
      }


      }

    });

    if(batch?.length){

      const promise = await Promise.all(batch);
    }


    // reset relation with main applicant for others as well

   newData.applicants.forEach((app,index)=>{
    if([primaryIndex,activeCoApplicantIndex].includes(index) || app.applicant_details.isApproved == true) return;

       app.personal_details.relation_with_main_applicant = "";
       app.applicant_details.extra_params.upload_required_fields_status.relation_with_main_applicant = false;
       app.applicant_details.extra_params.upload_progress = calculateTotalProgress(app.applicant_details.extra_params.upload_required_fields_status)

    
   })

    console.log('primary res',newData.applicants)

    setFieldValue('applicants', newData.applicants);

    console.log("UPDATED SWITCH APPLICANTS",newData.applicants)

    setToggle(false);

    setSwitchLoader(false);

    setSwitched(!switched)

    // updateProgressApplicantSteps('address_detail', newData.applicants[activeCoApplicantIndex].address_detail.extra_params.required_fields_status, 'address')

    // updateProgressApplicantSteps('address_detail', newData.applicants[primaryIndex].address_detail.extra_params.required_fields_status, 'address')

    // setFieldValue(`applicants[${primaryIndex}].address_detail.extra_params.progress`, 10)

    setChangePrimaryAlert(false);

    updateCompleteFormProgress();

    coApplicantDrawerUpdate(newData.applicants);

    // switch the active index

    
    switch(drawerTabIndex){
      case(0):
      setDrawerTabIndex(1)

      break;

      case(1):
      setDrawerTabIndex(0)

      break;
    }

  }

  catch(error) {
    alert("switching of main applicant is not allowed")    // need change



    setSwitchLoader(false);
    setToggle(false);
  }
  };


  // useEffect(()=> {

  //   alert(drawerTabIndex)

  // },[drawerTabIndex])




  const calculateTotalProgress = (requiredsFields) => {
    let trueCount = 0;

    for (const field in requiredsFields) {
      if (requiredsFields[field] === true) {
        trueCount++;
      }
    }

    let finalProgress = parseInt(
      (parseInt(trueCount) / parseInt(Object.keys(requiredsFields).length)) * 100,
    );

    return finalProgress;

  }



  const handleDelete = async () => {
    let ogData = structuredClone(values);

    let newData = structuredClone(ogData);

    newData.applicants = newData.applicants.filter((e, index) => index !== activeCoApplicantIndex);

    newData.applicants.map((e, index) => {
      if (e.applicant_details.is_primary) {
        setPrimaryIndex(index);
        setActiveIndex(index);
      }
    });

    setFieldValue('applicants', newData.applicants);
   try{
    await editFieldsById(
      ogData?.applicants[activeCoApplicantIndex]?.applicant_details?.id,
      'applicant',
      {
        is_deleted: true,
      },
      {
        headers: {
          Authorization: token,
        },
      },
    );

    let newPhoneNumbers = {
      lo: phoneNumberList.lo,
      reference_1: newData?.reference_details?.reference_1_phone_number ?? '',
      reference_2: newData?.reference_details?.reference_2_phone_number ?? '',
    };
    newData.applicants.map((applicant, idx) => {
      newPhoneNumbers[`applicant_${idx}`] = applicant?.applicant_details?.mobile_number ?? '';
    });

    setPhoneNumberList(newPhoneNumbers);

    setDeleteAlert(false);

    updateCompleteFormProgress();
  } catch(err) {
    alert("failed to delete co-applicant"); 
  }
  };

  return (
    <div> 
    
      <SwipeableDrawer
        anchor='bottom'
        open={drawerOpen}
        onClose={toggleDrawer}
        onOpen={toggleDrawer}
        swipeAreaWidth={drawerBleeding}
        allowSwipeInChildren={true}
        disableSwipeToOpen={false}
        disableBackdropTransition
        ModalProps={{
          keepMounted: true,
        }}
        className='swipeableDrawerSteps'
      >
        <StyledBox
          sx={{
            position: 'relative',
            marginTop: `${-drawerBleeding}px`,
            visibility: 'visible',
            right: 0,
            left: 0,
          }}
          className='rounded-t-2xl'
        >
          <div className='pt-2 flex justify-center flex-col'>
            <BottomSheetHandle />
            <div className='flex justify-between p-4 pt-2 pb-1'>
              <div className='flex gap-1'>
                <h4 className='text-base font-medium'>
                  {values?.applicants?.[primaryIndex]?.applicant_details?.first_name}
                </h4>
                <h4 className='text-base font-medium'>
                  {values?.applicants?.[primaryIndex]?.applicant_details?.middle_name}
                </h4>
                <h4 className='text-base font-medium'>
                  {values?.applicants?.[primaryIndex]?.applicant_details?.last_name}
                </h4>
              </div>
              <div className='flex flex-col items-end'>
                <span className='text-base text-[#E33439] font-medium'>
                  {values?.lead?.extra_params?.progress}%
                </span>
                <span className='text-xs text-[#727376] font-normal'>Completed</span>
              </div>
            </div>
          </div>
        </StyledBox>
        <StyledBox
          sx={{
            pb: 2,
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              bgcolor: 'background.paper',
            }}
          >
            <Tabs
              value={drawerTabIndex}
              onChange={handleChange}
              textColor='inherit'
              variant='fullWidth'
              aria-label='full width tabs example'
              className='border-solid border bg-[#FAFAFA]'
            >
              <Tab label='Primary' {...a11yProps(0)} className='tabLabels' />
              <Tab label='Co-Applicants' {...a11yProps(1)} className='tabLabels' />
              <Tab label='Tools' {...a11yProps(2)} className='tabLabels' />
            </Tabs>

            <SwipeableViews
              axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
              index={drawerTabIndex}
              onChangeIndex={handleChangeIndex}
            >
              {/* Tabs start ---------------*/}
              <PrimaryApplicantTab />
              <CoApplicantTab
                toggle={toggle}
                setChangePrimaryAlert={setChangePrimaryAlert}
                setDeleteAlert={setDeleteAlert}
                calculateTotalProgress = {calculateTotalProgress}
                switched = {switched}
              />
              <ToolsTab />
              {/* Tabs end ---------------*/}
            </SwipeableViews>
          </Box>
        </StyledBox>
      </SwipeableDrawer>
      <DrawerFooter />

      <DynamicDrawer open={changePrimaryAlert} setOpen={setChangePrimaryAlert} height='223px'>
        <div className='flex gap-1'>
          <div className=''>
            <h4 className='text-center text-base not-italic font-semibold text-primary-black mb-2'>
              Are you sure you want to make this Co-applicant a Primary?
            </h4>
            <p className='text-center text-xs not-italic font-normal text-primary-black'>
              Changing the primary applicant will change the primary owner of the application
            </p>
          </div>
          <div className=''>
            <button onClick={() => setChangePrimaryAlert(false)}>
              <IconClose />
            </button>
          </div>
        </div>

        <div className='w-full flex gap-4 mt-6'>
          <Button inputClasses='w-full h-[46px]' onClick={() => setChangePrimaryAlert(false)}>
            No
          </Button>
          <Button
            primary={true}
            inputClasses=' w-full h-[46px]'
            onClick={() => handleMakePrimary()}
          >
            Yes
          </Button>
        </div>
      </DynamicDrawer>

      <DynamicDrawer open={deleteAlert} setOpen={setDeleteAlert} height='223px'>
        <div className='flex gap-1'>
          <div className=''>
            <h4 className='text-center text-base not-italic font-semibold text-primary-black mb-2'>
              Are you sure you want to remove this Co-applicant?
            </h4>
            <p className='text-center text-xs not-italic font-normal text-primary-black'>
              The data will be lost forever
            </p>
          </div>
          <div className=''>
            <button onClick={() => setDeleteAlert(false)}>
              <IconClose />
            </button>
          </div>
        </div>

        <div className='w-full flex gap-4 mt-6'>
          <Button inputClasses='w-full h-[46px]' onClick={() => setDeleteAlert(false)}>
            No, keep
          </Button>
          <Button primary={true} inputClasses=' w-full h-[46px]' onClick={() => handleDelete()}>
            Yes, remove
          </Button>
        </div>
      </DynamicDrawer>
    </div>
  );
}
