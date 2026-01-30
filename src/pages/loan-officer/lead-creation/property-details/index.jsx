import { useCallback, useState, useContext, useEffect } from 'react';
import { IconPropertyIdentified, IconPropertyUnIdentified } from '../../../../assets/icons';
import { CardRadio } from '../../../../components';
import IdentificationDoneFields from './IdentificationDoneFields';
import { LeadContext } from '../../../../context/LeadContextProvider';
import { addApi, editFieldsById, editPropertyById } from '../../../../global';
import PreviousNextButtons from '../../../../components/PreviousNextButtons';
import { defaultValuesLead } from '../../../../context/defaultValuesLead';
import Topbar from '../../../../components/Topbar';
import SwipeableDrawerComponent from '../../../../components/SwipeableDrawer/LeadDrawer';
import Popup from '../../../../components/Popup';
import { AuthContext } from '../../../../context/AuthContextProvider';
import PropertyPopUp from '../../../../components/PropertyPopUp';
import InfoIcon from '@mui/icons-material/Info';
const propertyIdentificationOptions = [
  {
    label: 'Done!',
    value: 'done',
    icon: <IconPropertyIdentified />,
  },
  // {
  //   label: 'Not yet...',
  //   value: 'not-yet',
  //   icon: <IconPropertyUnIdentified />,
  // },
];
const selectedLoanType = 'LAP';
const PropertyDetails = () => {
  const {
    values,
    errors,
    touched,
    setFieldValue,
    updateProgressApplicantSteps,
    activeIndex,
    setCurrentStepIndex,
    showMap,
    approved,
    activeLNT,
    checkIfApplicationDone
  } = useContext(LeadContext);

  const { token } = useContext(AuthContext);
  const [requiredFieldsStatus, setRequiredFieldsStatus] = useState({
    ...values?.property_details?.extra_params?.required_fields_status,
  });
  const [openQualifierNotActivePopup, setOpenQualifierNotActivePopup] = useState(false);
  const handleCloseQualifierNotActivePopup = () => {
    setOpenQualifierNotActivePopup(false);
  };
  const [latLong, setLatLong] = useState({});

  const[updated,setUpdated] = useState(false);


  


  const getLNTPath = () => {

    if(values?.applicants?.[activeIndex]?.applicant_details?.lt_bre_101_response?.body?.['L&T_API'] == 'AirPay'){
      return '/lead/airpay-payment'
    }

    else {
      return '/lead/easebuzz-payment'
    }
  }


  useEffect(() => {
    let userLocation = navigator.geolocation;

    if (userLocation) {
      userLocation.getCurrentPosition(success);
    } else {
      console.log('The geolocation API is not supported by your browser.');
    }

    function success(data) {
      let lat = data.coords.latitude;
      let long = data.coords.longitude;
      setLatLong({
        geo_lat: String(lat),
        geo_long: String(long),
      });
    }
  }, []);
  


  // handle qualifier if not activated according to BRE validation on mount


  const updateQualifier = async () =>{
        try{

     let existing_params = values?.applicants?.[activeIndex]?.applicant_details?.extra_params;

     if(!existing_params?.qualifier || existing_params?.qualifier == false){

      const bre_101_response = values?.applicants?.[activeIndex]?.applicant_details?.bre_101_response;
    
  
        if (bre_101_response && bre_101_response?.errorType!='TypeError') {

          existing_params.qualifier = true;

          await editFieldsById(
            values?.applicants?.[activeIndex]?.applicant_details?.id,
            'applicant',
            {
              extra_params: existing_params,
            },
            {
              headers: {
                Authorization: token,
              },
            },
          );        
          
          setFieldValue(`applicants[${activeIndex}].applicant_details.extra_params`, existing_params);    


        }
  
     }

    }

    catch(err){
      console.log("error updating qualifier",err)
    }

    setUpdated(true)
  }

  useEffect(()=>{
updateQualifier();

  },[])

  useEffect(() => {
    setRequiredFieldsStatus(values?.property_details?.extra_params?.required_fields_status);
  }, [activeIndex]);

  useEffect(() => {

    if(!updated) return;

    // check if already application form is created ** in case user comes back and change data

    
    updateProgressApplicantSteps('property_details', requiredFieldsStatus, 'property');
  }, [requiredFieldsStatus,updated]);

  const [openModal, setOpenModal] = useState(false);


  const handleRadioChange = useCallback(
    async (e) => {

      if(values?.property_details?.property_identification_is === 'done') return;
      const name = e.name;
      setFieldValue('property_details.property_identification_is', e.value);
      if (values?.property_details?.id) {  //values?.property_details?.id
        if (e.value === 'not-yet') {
          editPropertyById(
            values?.property_details?.id,
            {
              property_identification_is: e.value,
              property_value_estimate: '',
              current_owner_name: '',
              plot_house_flat: '',
              project_society_colony: '',
              pincode: null,
              city: '',
              state: '',
              ...latLong,
              extra_params: {
                ...values?.property_details?.extra_params,
                progress: 100,
                required_fields_status: {
                  property_identification_is: true,
                },
              },
            },
            {
              headers: {
                Authorization: token,
              },
            },
          );

          setFieldValue('property_details', {
            ...values.property_details,
            property_identification_is: e.value,
            property_value_estimate: '',
            current_owner_name: '',
            plot_house_flat: '',
            project_society_colony: '',
            pincode: null,
            city: '',
            state: '',
            extra_params: {
              ...values?.property_details?.extra_params,
              progress: 100,
              required_fields_status: {
                property_identification_is: true,
              },
            },
          });

          setRequiredFieldsStatus({
            property_identification_is: true,
          });
        } else {
          editPropertyById(
            values?.property_details?.id,
            {
              property_identification_is: e.value,
              property_value_estimate: '',
              current_owner_name: '',
              plot_house_flat: '',
              project_society_colony: '',
              pincode: null,
              city: '',
              state: '',
              ...latLong,
              extra_params: {
                ...values?.property_details?.extra_params,
                progress: 16,
                required_fields_status: {
                  current_owner_name: false,
                  pincode: false,
                  plot_house_flat: false,
                  project_society_colony: false,
                  property_identification_is: true,
                  property_value_estimate: false,
                },
              },
            },
            {
              headers: {
                Authorization: token,
              },
            },
          );
          setRequiredFieldsStatus({
            current_owner_name: false,
            pincode: false,
            plot_house_flat: false,
            project_society_colony: false,
            property_identification_is: true,
            property_value_estimate: false,
          });
        }
      } else {

        let newDefaultValues = structuredClone(defaultValuesLead);
        let addData = { ...newDefaultValues.property_details, [name]: e.value };
        if (e.value === 'not-yet') {
          
          addData.extra_params = {
            ...addData.extra_params,
            progress: 100,
            required_fields_status: {
              property_identification_is: true,
            },
          };
        } else {
          addData.extra_params = {
            ...addData.extra_params,
            progress: 16,
            required_fields_status: {
              property_identification_is: true,
              property_value_estimate: false,
              current_owner_name: false,
              plot_house_flat: false,
              project_society_colony: false,
              pincode: false,
            },
          };
        }
        await addApi(
          'property',
          {
            ...addData,
            lead_id: values?.lead?.id,
          },
          {
            headers: {
              Authorization: token,
            },
          },
        )
          .then(async (res) => {
            await editFieldsById(
              values.lead.id,
              'lead',
              {
                extra_2: String(res.id),
              },
              {
                headers: {
                  Authorization: token,
                },
              },
            )
            setFieldValue('property_details', { ...addData, id: res.id });
            setRequiredFieldsStatus({ ...addData.extra_params.required_fields_status });
          })
          .catch((err) => {
            console.log("property_error",err);

            if(err?.response?.data?.message == "Already Exists") {
              setFieldValue('property_details', err?.response?.data?.table);
            }
          });
      }
    },
    [requiredFieldsStatus, setFieldValue],
  );
  return (
    <>


      <Popup
        handleClose={handleCloseQualifierNotActivePopup}
        open={openQualifierNotActivePopup}
        setOpen={setOpenQualifierNotActivePopup}
        title='Step is lock.'
        description='Complete Qualifier to Unlock.'
      />
      <div className='overflow-hidden flex flex-col h-[100vh] justify-between'>
        {!showMap ? <Topbar title='Lead Creation' id={values?.lead?.id} showClose={true} /> : null}
        <div className='flex flex-col bg-medium-grey gap-2 overflow-auto max-[480px]:no-scrollbar p-[20px] pb-[160px] flex-1'>
          <label
            htmlFor='property-identification'
            className='flex gap-0.5 font-medium text-primary-black h-5'
          >
            The Property identification is <span className='text-primary-red text-xs'>*</span>
            <div className='text-center' style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
<button
  className="bg-red-600 h-5 w-5 rounded text-white my-3 "
  onClick={() => setOpenModal(true)}
  style={{display:'none'}}    // display none for property icon ** TEMP
>
  <InfoIcon fontSize='xsmall'/>
</button>

            {openModal && (
              <div className='fixed text-left z-[100] inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center'>
                <div className='bg-white p-5 mx-4 w-full md:w-1/2 h-3/4 overflow-y-auto rounded-md relative'>
                  <button
                    className='absolute top-2 right-2 text-gray-600 hover:text-gray-900'
                    onClick={() => setOpenModal(false)}
                  >
                    &times;
                  </button>
                <PropertyPopUp></PropertyPopUp>
                </div>
              </div>
            )}
          </div>
            
          </label>
          
          <h2 className='text-xs font-normal text-light-grey'>
            To know more about property related details if it’s identified
          </h2>
          
          <div className='flex gap-4'>
            {propertyIdentificationOptions.map((option) => (
              <CardRadio
                key={option.value}
                label={option.label}
                name='property_identification_is'
                value={option.value}
                current={values?.property_details?.property_identification_is}
                onChange={handleRadioChange}
                containerClasses='flex-1'
              >
                {option.icon}
              </CardRadio>
            ))}
          </div>
          {errors?.property_details?.property_identification_is &&
          touched?.property_details?.property_identification_is ? (
            <span
              className='text-xs text-primary-red'
              dangerouslySetInnerHTML={{
                __html: errors?.property_details?.property_identification_is,
              }}
            />
          ) : (
            ''
          )}
          {values?.property_details?.property_identification_is === 'done' ? (
            <IdentificationDoneFields
              selectedLoanType={selectedLoanType}
              requiredFieldsStatus={requiredFieldsStatus}
              setRequiredFieldsStatus={setRequiredFieldsStatus}
              latLong={latLong}
            />
          ) : null}
        </div>
        {/* <button onClick={handleSubmit}>submit</button> */}
        <PreviousNextButtons
          linkPrevious={
            values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier
              ? values?.applicants?.[activeIndex]?.applicant_details?.lt_bre_101_response?.body?.['L&T_API']?.length?getLNTPath():
              activeLNT =='any'?'/lead/lnt-charges':activeLNT==0?'/lead/airpay-payment':'/lead/easebuzz-payment'
              : null
          }
          linkNext={
            values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier
              ? '/lead/banking-details'
              : null
          }
          onNextClick={() => {
            setCurrentStepIndex(7);
            !values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier
              ? setOpenQualifierNotActivePopup(true)
              : null;
          }}
          onPreviousClick={() => {
            setCurrentStepIndex(5);
            !values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier
              ? setOpenQualifierNotActivePopup(true)
              : null;
          }}
        />

        {!showMap ? <SwipeableDrawerComponent /> : null}
      </div>
    </>
  );
};
export default PropertyDetails;