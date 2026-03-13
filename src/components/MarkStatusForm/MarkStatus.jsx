  import React, { useEffect, useState,useContext } from 'react';
  import ApplicantSection from './ApplicantSection'; // Import the new component
  import { LeadContext } from '../../context/LeadContextProvider';
  import { AuthContext } from '../../context/AuthContextProvider';
  import { useNavigate } from 'react-router-dom';
  import { editFieldsById,resetLeadQualifier,deleteBanking,lead_by_pass,sendSMSGlobal,verifyMobileOtp,
    getMobileOtp,
    createApplicationForm,
  form_bypass, 
  editDoc} from '../../global';
  import FormModal from '../FormModal';
  import { Badge, IconButton, Box, Typography,Modal } from '@mui/material';
  import { Backdrop } from '@mui/material';
  import { CircularProgress } from '@mui/material';
  import pako from 'pako';







  const MarkStatus = ({data,close,lead,setLeadData,onHandleReturn}) => {
    const [applicantsData, setApplicantsData] = useState(data);
    const [isApproved, setIsApproved] = useState(null);
    const [editMessages, setEditMessages] = useState(data);
    const [editRemark, setEditRemark] = useState(false); // Start with false to prevent editing initially
    
    const[generalRemark,setGeneralRemark] = useState("")


    const{token} = useContext(AuthContext)

    const{remarkError,setValues,values,isActive} = useContext(LeadContext)

    const navigate = useNavigate();

    const[ApplicationForm,setApplicantForm] = useState(false);

    const[formData,setFormData] = useState([]);

    const[loader,setLoader] = useState(false);

    const[generatedForm,setGeneratedForm] = useState(false);


    function decompressHtml(base64Str) {
  try {
    const compressedData = Uint8Array.from(atob(base64Str), c => c.charCodeAt(0));
    const decompressed = pako.ungzip(compressedData, { to: 'string' });
    return decompressed;
  } catch (err) {
    console.error("Failed to decompress:", err);
    return "<p>Error loading form</p>";
  }
}


function isGzippedBase64(str) {
  try {
    const buffer = Uint8Array.from(atob(str), c => c.charCodeAt(0));
    return buffer[0] === 0x1f && buffer[1] === 0x8b; // GZIP magic number
  } catch {
    return false;
  }
}
    

    useEffect(()=>{

      if(!lead) return;

      const applicants = lead?.applicants || [];

      let all_completed = true;

      applicants.forEach((app)=>{

        console.log("application_form_otp_verified",app?.applicant_details?.application_form_otp_verified)

        if(!app?.applicant_details?.application_form_otp_verified || app?.applicant_details?.application_form_otp_verified == false){
          all_completed = false;
        };

      });

      setGeneratedForm(all_completed);

    },[lead])



    useEffect(()=>{

      if(!lead) return;

      let tempData = [];

      let lead_copy = structuredClone(lead);

      let applicants = lead_copy?.applicants;


        applicants.forEach((app,i)=>{
      let master = {};

        let obj1 = {};

        let obj2 = {};


        obj1.label = 'Applicant Name';
        obj1.value = app?.applicant_details?.first_name;

        obj2.label = 'Mobile Number';
        obj2.value = app?.applicant_details?.mobile_number;

        master.fields = [obj1,obj2];
        master.id = app?.applicant_details?.id;
        master.lead_id = lead_copy?.lead?.id
        master.otp = app?.applicant_details?.application_form_otp
        master.verified = app?.applicant_details?.application_form_otp_verified;
        master.url = app?.applicant_details?.document_meta?.application_form?.[0]?.document_fetch_url || ""
        master.index = i;
        master.form_html = app?.applicant_details?.form_html || null

        console.log("FORM",master.form_html)

        if(master.form_html){

          if (isGzippedBase64(master.form_html)) {
  const compressed = Uint8Array.from(atob(master.form_html), c => c.charCodeAt(0));
  master.form_html = pako.ungzip(compressed, { to: 'string' });
}
        }

        tempData.push(master);
        })



      console.log("TEMP AFTER RENDER",tempData)

      setFormData(tempData)

    },[lead.applicants]);


    const sendApplicationOtp = async(id,index)=>{
    
    
        try{
    
          const res =  await getMobileOtp(id, {
                  headers: {
                    Authorization: token,
                  },
                },"form-otp");
    
                if(res?.data?.message == 'OTP sent successfully'){
                  // write logic here 

                  // unzip the html if present

                  if(res?.data?.form){

                    let lead_copy = structuredClone(lead);

                    const decompressed_form = decompressHtml(res?.data?.form)

                    lead_copy.applicants[index].applicant_details.form_html = decompressed_form;

                    setLeadData(lead_copy);

                  }
    
                  return {
                    message:"OTP sent successfully",
                    code:200,
                    otp:res?.data?.otp
                  }
                }

                else{
                  return{
                  message:"Failed sending OTP",
                  code:400
                  }
                }
                
                // write error here
        }
    
        catch(err){
    
          console.log("ERROR SENDING OTP",err)
    
          // write error toast here

          throw err;


        }
    
    
      }


        const verifyApplicationOtp = async (otp,id,index) =>{
      
          try{
            
      
          const res =  await verifyMobileOtp(id, otp, {
                headers: {
                  Authorization: token,
                },  
              },"form-otp");

              // console.log("RES FROM OTP",res)
      
              if(res?.data?.message == "Valid OTP"){
                
      
              let lead_copy = structuredClone(lead);
      
              lead_copy.applicants[index].applicant_details.application_form_otp = otp;
              lead_copy.applicants[index].applicant_details.application_form_otp_verified = true;

              // console.log("LEAD COPY BEFORE REDNER",lead_copy)
      
              setLeadData(lead_copy)
      
              return({
                message:"Valid OTP",
                updated:lead_copy
              })
      
      
              }
      
            }
      
      
            catch(err){
      
              console.log("Error Verifying OTP")
      
              
              return({
                message:"Invalid OTP"
              })
            }
      
        }


    const openApplicationForm = () =>{
      setApplicantForm(true);
    }


    const onApprove = async () => {
      try {
        setIsApproved(true);
        const id = lead?.lead?.id;
  
        if(!token){
          alert("Login Again to continue");
          return;
        }

        if (lead?.applicants?.length > 0 && lead_by_pass == false) {
          const approvalChange = await Promise.all(lead.applicants.map((applicant) => {
            return editFieldsById(applicant?.applicant_details?.id, 'applicant', { isApproved: true }, {
              headers: { Authorization: token }
            });
          }));
        }
    
        setValues(lead);
        navigate(`/lead/retry-salesforce/${id}`);
      } catch (error) {
        console.error("Error during approval process:", error);
        // Optionally show user feedback (e.g., a toast notification)
      }
    };


    const onReject = () => setIsApproved(false);




    useEffect(()=> {

      // console.log("Hey updated Error>>>>",lead)


      // console.log("I am the data one you are looking for++++++++++",data)
    },[remarkError,data])

    
    const {applicantError,
      coApplicantError,
      } = useContext(LeadContext)

    const handleInputChange = (e, applicantType, sectionIndex, messageIndex) => {
      const updatedData = JSON.parse(JSON.stringify(editMessages)); // Deep copy
      updatedData[applicantType][sectionIndex].messages[messageIndex] = e.target.value;
      setEditMessages(updatedData);
    };

    const handleCancel = () => {
      // setEditMessages(applicantsData);
      close(false)

      setEditRemark(false)
    };



    const handle_is_approved = (key,applicant) => {


      

      if(key == 'banking_details') {
        let banking_detail = applicant?.banking_details?.filter((bank)=>!bank?.extra_params)?.[0];


        if(banking_detail?.bm_status == false) {
          return false;
        }

      }

      else if(key == 'applicant_details') {

        if(applicant?.applicant_details?.bm_status == false) {
          return false;
        }

        else if(applicant?.applicant_details?.upload_bm_status == false) {
          return false;
        }
      }

      else {

        if(applicant?.[key]?.bm_status == false) {
          return false;      
        
        }

      }

    }

    
    const handleSave = async () => {
      // setApplicantsData(editMessages); // Save the edited messages
    // Base data object

    try{

      
    // Check if any of the first screens are Rejected to set Qualifier to false and Manage Eligibility


    let if_primary_rejected = false;   // flag as a key to know weather primsay is rejected or not based on that clear all application forms
        setLoader(true);

    // const applicants = lead?.applicants;

    const applicants = (lead?.applicants || []).sort((a, b) => {
  return b?.applicant_details?.is_primary - a?.applicant_details?.is_primary;
});

    const qualifier_fields = ['address_detail','applicant_details','personal_details','work_income_detail']

    for(const applicant of applicants) {

      const keys = Object.keys(applicant);

      const applicant_id = applicant?.applicant_details?.id;

      const applicant_detail = applicant?.applicant_details

      let extra_params = applicant?.applicant_details?.extra_params


      let all_approved = true;


      for(const key of keys) {

        if(qualifier_fields.includes(key) && applicant[key]?.bm_status == false) {
          extra_params.qualifier = false;
          extra_params.eligibility = false;


          await resetLeadQualifier(applicant_id,{extra_params:extra_params,bre_101_response:null,resumbit_fields:null},{
            headers: {
              Authorization: token,
            },
          })
        }

        // else if(!qualifier_fields.includes(key) && applicant[key]?.bm_status == false) {
        //   extra_params.eligibility = false;

        //   await resetLeadQualifier(applicant_id,{extra_params:extra_params},{
        //     headers: {
        //       Authorization: token,
        //     },
        //   })
        // }

        else {
            extra_params.eligibility = false;

          await resetLeadQualifier(applicant_id,{extra_params:extra_params,resumbit_fields:null},{
            headers: {
              Authorization: token,
            },
          });

  
        }



        // Logic to trigger all approved flag ** 12/12

        if(handle_is_approved(key,applicant) == false) {
          all_approved = false;

          if(applicant?.applicant_details?.is_primary){
            if_primary_rejected = true;
          }
        }
        }


        //check if property details if approved or not and handle for primary applicant

        if(applicant?.applicant_details?.is_primary) {

          if(lead?.property_details?.bm_status == false) {
            all_approved = false;
                        if_primary_rejected = true;
          }
        }


        
        // logic for clearing form data based on all approved
        //Note : - if any section is rejected for applicants ie- all approved is false means form regeneration required


        if(all_approved == false || if_primary_rejected == true){

          let document_meta = structuredClone(applicant?.applicant_details?.document_meta);

          let existing_ids = [];


          if(document_meta?.application_form){

            document_meta.application_form = document_meta.application_form.map((form)=>{

              console.log("ACTIVE FORM",form?.active)

              if(form.active == true){
                existing_ids.push(editDoc(form?.id,{active:false},{
          headers: {
            Authorization: token,
          },
        }))
              }
              return {...form,active:false}
            })
          }

          let data = {
            application_form_otp:null,
            application_form_otp_verified:null,
            form_html:null,
            document_meta:document_meta
          }

          // update applicant table

           await editFieldsById(applicant_id,'applicant',data,{
          headers: {
            Authorization: token,
          },
        })

        // update upload docs (whichever is active there pulled ids before)

        if(existing_ids?.length){
          await Promise.all(existing_ids)
        }
        
        }


             //exception for banking


        const banking_details = applicant?.banking_details?.filter((bank)=> {
          return !bank?.extra_params
        })


        let banking_data = true;

      if(banking_details?.filter((bank)=>!bank?.extra_params)?.[0]?.bm_status == false) {

        await deleteBanking(applicant_id,{},{
          headers: {
            Authorization: token,
          },
        });

        all_approved = false;

        banking_data = false;
      }


        //api call for approved flag


        let update_data = {isApproved:all_approved};

        if(banking_data == false){

          let applicant_params = structuredClone(applicant?.applicant_details?.extra_params);

          applicant_params.banking_progress = 0;

          update_data.extra_params = applicant_params;
        }

      
        await editFieldsById(applicant_id,'applicant',update_data,{
          headers: {
            Authorization: token,
          },
        })
        
        
      }

      
    
      let existing_count = lead?.lead?.reject_count;


    console.log("LEADDDD",lead?.lead)


  let data = { bm_submit: false,reject_count:existing_count+1,bre_201_response:null };

  // Conditionally adding bm_remarks if generalRemark is not empty
  if (generalRemark?.trim()?.length > 0 && isApproved == false) {
    data.bm_remarks = generalRemark;
  }

  if(isApproved == false) {
    try {
      // Make the API request
      const res = await editFieldsById(lead?.lead?.id, 'lead', data, {   // **TEMPORARY
        headers: {
          Authorization: token,
        },
      });

      console.log("awaited res",res)

    
      // If the request is successful, update the local state
      if (res?.bm_submit == false){

        let updatedLead = { ...lead };
    
        // Update the bm_submit field locally
        updatedLead.bm_submit = false;
    
        // If bm_remarks was added, also reflect that in the state
        if (generalRemark?.trim()?.length > 0) {
          updatedLead.bm_remarks = generalRemark;
        }
    
        // Update the lead state with the updated values
        setLeadData(updatedLead);

  // send sms as lead is rejected with remark
        try{

          const sms_sent = await sendSMSGlobal(lead?.lead?.id,'bm_remarks')
        }

        catch(err) {
          console.log("ERROR SENDING SMS TO LO",err)
        }


        setLoader(false);


        onHandleReturn(); // navigate back after rejecting the lead
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  }

    }

    catch(err){

      console.log("Error Rejecting",err);

      setLoader(false)
    }

    finally{
          setLoader(false);
    }

    };

    
    const handleSaveOld = async () => {
      // setApplicantsData(editMessages); // Save the edited messages
    // Base data object

    try{

      
    // Check if any of the first screens are Rejected to set Qualifier to false and Manage Eligibility


    let if_primary_rejected = false;   // flag as a key to know weather primsay is rejected or not based on that clear all application forms
        setLoader(true);

    // const applicants = lead?.applicants;

    const applicants = (lead?.applicants || []).sort((a, b) => {
  return b?.applicant_details?.is_primary - a?.applicant_details?.is_primary;
});

    const qualifier_fields = ['address_detail','applicant_details','personal_details','work_income_detail']

    for(const applicant of applicants) {

      const keys = Object.keys(applicant);

      const applicant_id = applicant?.applicant_details?.id;

      const applicant_detail = applicant?.applicant_details

      let extra_params = applicant?.applicant_details?.extra_params


      let all_approved = true;


      for(const key of keys) {

        if(qualifier_fields.includes(key) && applicant[key]?.bm_status == false) {
          extra_params.qualifier = false;
          extra_params.eligibility = false;


          await resetLeadQualifier(applicant_id,{extra_params:extra_params,bre_101_response:null,resumbit_fields:null},{
            headers: {
              Authorization: token,
            },
          })
        }

        // else if(!qualifier_fields.includes(key) && applicant[key]?.bm_status == false) {
        //   extra_params.eligibility = false;

        //   await resetLeadQualifier(applicant_id,{extra_params:extra_params},{
        //     headers: {
        //       Authorization: token,
        //     },
        //   })
        // }

        else {
            extra_params.eligibility = false;

          await resetLeadQualifier(applicant_id,{extra_params:extra_params,resumbit_fields:null},{
            headers: {
              Authorization: token,
            },
          });

  
        }



        // Logic to trigger all approved flag ** 12/12

        if(handle_is_approved(key,applicant) == false) {
          all_approved = false;

          if(applicant?.applicant_details?.is_primary){
            if_primary_rejected = true;
          }
        }
        }


        //check if property details if approved or not and handle for primary applicant

        if(applicant?.applicant_details?.is_primary) {

          if(lead?.property_details?.bm_status == false) {
            all_approved = false;
          }
        }


        
        // logic for clearing form data based on all approved
        //Note : - if any section is rejected for applicants ie- all approved is false means form regeneration required


        if(all_approved == false || if_primary_rejected == true){

          let document_meta = structuredClone(applicant?.applicant_details?.document_meta);

          let existing_ids = [];


          if(document_meta?.application_form){

            document_meta.application_form = document_meta.application_form.map((form)=>{

              console.log("ACTIVE FORM",form?.active)

              if(form.active == true){
                existing_ids.push(editDoc(form?.id,{active:false},{
          headers: {
            Authorization: token,
          },
        }))
              }
              return {...form,active:false}
            })
          }

          let data = {
            application_form_otp:null,
            application_form_otp_verified:null,
            form_html:null,
            document_meta:document_meta
          }

          // update applicant table

           await editFieldsById(applicant_id,'applicant',data,{
          headers: {
            Authorization: token,
          },
        })

        // update upload docs (whichever is active there pulled ids before)

        if(existing_ids?.length){
          await Promise.all(existing_ids)
        }
        
        }


        //api call for approved flag

      
        await editFieldsById(applicant_id,'applicant',{isApproved:all_approved},{
          headers: {
            Authorization: token,
          },
        })
        

        //exception for banking


        const banking_details = applicant?.banking_details?.filter((bank)=> {
          return !bank?.extra_params
        })


      if(banking_details?.filter((bank)=>!bank?.extra_params)?.[0]?.bm_status == false) {

        await deleteBanking(applicant_id,{},{
          headers: {
            Authorization: token,
          },
        })
      }
        
      }

      
    
      let existing_count = lead?.lead?.reject_count;


    console.log("LEADDDD",lead?.lead)


  let data = { bm_submit: false,reject_count:existing_count+1,bre_201_response:null };

  // Conditionally adding bm_remarks if generalRemark is not empty
  if (generalRemark?.trim()?.length > 0 && isApproved == false) {
    data.bm_remarks = generalRemark;
  }

  if(isApproved == false) {
    try {
      // Make the API request
      const res = await editFieldsById(lead?.lead?.id, 'lead', data, {   // **TEMPORARY
        headers: {
          Authorization: token,
        },
      });

      console.log("awaited res",res)

    
      // If the request is successful, update the local state
      if (res?.bm_submit == false){

        let updatedLead = { ...lead };
    
        // Update the bm_submit field locally
        updatedLead.bm_submit = false;
    
        // If bm_remarks was added, also reflect that in the state
        if (generalRemark?.trim()?.length > 0) {
          updatedLead.bm_remarks = generalRemark;
        }
    
        // Update the lead state with the updated values
        setLeadData(updatedLead);

  // send sms as lead is rejected with remark
        try{

          const sms_sent = await sendSMSGlobal(lead?.lead?.id,'bm_remarks')
        }

        catch(err) {
          console.log("ERROR SENDING SMS TO LO",err)
        }


        setLoader(false);


        onHandleReturn(); // navigate back after rejecting the lead
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  }

    }

    catch(err){

      console.log("Error Rejecting",err);

      setLoader(false)
    }

    finally{
          setLoader(false);
    }

    };

    
    const generateForm = async(id,email,udpated,active) =>{
    
        try{
    
          const res_form = await createApplicationForm(id,{
              headers: {
                Authorization: token,
              },
            },email || false);
    
            let lead_copy = structuredClone(udpated || lead);
          
            if(res_form?.meta){
            lead_copy.applicants[active].applicant_details.document_meta = res_form?.meta;
            };
    
            // console.log("RES FORM",res_form);

            if(res_form?.form){
              lead_copy.applicants[active].applicant_details.form_html = res_form?.form;
            }
    
            setLeadData(lead_copy)
          
          }
    
        catch(err){

    
          console.log("ERROR IN APPLICATION FORM GENERATION");

          throw err;
        }
      }
  // //${
  //         isApproved ? 'justify-between h-screen' : ''
  //       }
    return (
      <div
        className={`container mx-auto p-4 max-w-screen-lg flex flex-col`}  //
      >
        <ModalComponent dynamic={loader}/>

        {ApplicationForm&&<FormModal
        setOpenApplication={setApplicantForm}
        data = {formData}
        sendApplicationOtp = {sendApplicationOtp}
        verifyApplicationOtp = {verifyApplicationOtp}
        generateForm = {generateForm}
        />}
        <div>
          <h3 className='text-lg font-bold mb-4 underline'>Mark Status</h3>
          <div className='flex space-x-4 mb-6'>
            <button
            //
              onClick={onApprove}
              className={`px-4 py-2 text-sm rounded-md font-semibold border border-green-700 ${
                isApproved ? 'bg-green-300 text-black' : 'bg-white'
              } ${applicantError?.length > 0 && lead_by_pass == false || coApplicantError?.length > 0 && lead_by_pass == false ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled = {applicantError?.length>0 && lead_by_pass == false || coApplicantError?.length>0 && lead_by_pass == false}
            >
              Approved
            </button>
            <button
              onClick={onReject}
              className={`px-4 py-2 text-sm rounded-md font-semibold border border-green-700 ${
                !isApproved && isApproved !== null ? 'bg-green-300 text-black' : 'bg-white'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>
        {(
          <div className='rounded-lg'>
                  {/* <button
  className={`border text-sm px-4 py-1 rounded-md 
      ${(applicantError?.length>0 && lead_by_pass == false) || (coApplicantError?.length>0 && lead_by_pass == false) 
        ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
        : 'border-black text-black'}`}
        disabled = {(applicantError?.length>0 && lead_by_pass == false) || (coApplicantError?.length>0 && lead_by_pass == false)}

        onClick={openApplicationForm}
  >                 
                  
                    Generate Application Form
                  </button> */}
            <h4 className='text-lg font-semibold mb-4 underline'>Remarks</h4>
  <ApplicantSection data={data} lead = {lead} setLeadData = {setLeadData} editRemark = {editRemark} setGeneralRemark = {setGeneralRemark}/>


            <div className='text-end my-10'>
              <button
                onClick={
                  () => setEditRemark(true)
                }
                className='border border-black text-sm text-black px-4 py-1 rounded-md'
              >
                Edit Remarks
              </button>
            </div>
            <div className='flex justify-end space-x-4'>
              <button
                className='border border-black text-sm text-black px-4 py-1 rounded-md'
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className='border border-black text-sm text-black px-4 py-1 rounded-md'
                onClick={handleSave}
                disabled = {isApproved == null?true:false}
              >
                SAVE
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };



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
        Processing, please wait...
      </Typography>
    </Box>
  </Backdrop>
    )
  }


  export default MarkStatus
