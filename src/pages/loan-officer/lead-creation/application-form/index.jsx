import React from 'react'
import FormModal from '../../../../components/FormModal'
import { useState,useEffect,useRef } from 'react'
import { useContext } from 'react'
import { LeadContext } from '../../../../context/LeadContextProvider'
import { AuthContext } from '../../../../context/AuthContextProvider'
import PreviousNextButtons from '../../../../components/PreviousNextButtons';
import { Button } from '../../../../components';
import pako from 'pako';
import Topbar from '../../../../components/Topbar'
import {createApplicationForm,verifyMobileOtp,getMobileOtp,checkFaceMatchScore} from '../../../../global'


const ApplicationForm = () => {

    const {
    values,
    setValues,
    setActiveIndex
  } = useContext(LeadContext);

  const {token} = useContext(AuthContext)


  const[ApplicationForm,setApplicantForm] =  useState(false);

  const[disableSubmit,setDisableSubmit] = useState(true);

  const[formData,setFormData] = useState([]);

  const[primaryIndex,setPrimaryIndex] = useState(null);

  const[activeApplicant,setActiveApplicant] = useState(0);

  const[disableOpen,setDisableOpen] = useState(true);

  const[mounted,setMounted] = useState(false);



//   useEffect(()=>{

//     if(mounted || !values?.applicants?.length) return;

//     console.log("VALUES",values)


//     let value_copy = structuredClone(values);

//     let primary;

//     let others = [];

//     let primary_index_new;

// value_copy?.applicants.forEach((app,index)=>{

//       console.log("APP",app)

//       if(app?.applicant_details?.is_primary == true){
//         primary = app;
//         primary_index_new = index;
//       }
//       else{
//         others.push(app);
//       }
// })




//     others = [primary,...others];

//     console.log("OTHER L",others);

//     value_copy.applicants = others;

//     const sameOrder = values.applicants.every( (a, i) => a.applicant_details?.id === values.applicants[i]?.applicant_details?.id );

//     if(sameOrder) return;

//     setActiveIndex(primary_index_new || 0);

//     setMounted(true);

//     setValues(value_copy)  // setting by sequence

//   },[values?.applicants]);


useEffect(() => {
  if (!values?.applicants?.length) return;

  let lead_copy = structuredClone(values);

  const primary = lead_copy.applicants.find(
    app => app?.applicant_details?.is_primary == true
  );
  const others = lead_copy.applicants.filter(
    app => app?.applicant_details?.is_primary != true
  );

  if (primary) {
    const reordered = [primary, ...others];

    const sameOrder = reordered.every(
      (a, i) => a.applicant_details?.id === values.applicants[i]?.applicant_details?.id
    );

    if (!sameOrder) {
      lead_copy.applicants = reordered;
      setValues(lead_copy);
      setActiveIndex(0);
    }
  }

  setMounted(true)
}, [values?.applicants]);



  useEffect(()=>{

    if(!mounted) return 

    const primary_app = values?.applicants?.filter((app)=>app?.applicant_details?.is_primary);

    console.log("PRIMARY APP",primary_app)

    if(primary_app?.[0]?.applicant_details?.application_form_otp_verified) setDisableOpen(false);

  },[values,mounted])

  useEffect(()=>{

        if(!mounted) return 

    values?.applicants?.forEach((app,index)=>{
      if(app?.applicant_details?.is_primary){
        setPrimaryIndex(index);
        return;
      }
    })

  },[mounted,values])


  useEffect(()=>{

        if(!mounted) return 


    const applicants = values?.applicants || [];

    let disable = false;

    for(const app of applicants){

      if(!app?.applicant_details?.application_form_otp_verified || app?.applicant_details?.application_form_otp_verified == false){

        disable = true;
      }
    }

    setDisableSubmit(disable);

  },[values])



    
function isGzippedBase64(str) {
  try {
    const buffer = Uint8Array.from(atob(str), c => c.charCodeAt(0));
    return buffer[0] === 0x1f && buffer[1] === 0x8b; // GZIP magic number
  } catch {
    return false;
  }
}


  
          useEffect(()=>{
      
    if(!mounted) return 
          
            let tempData = [];
      
            let lead_copy = structuredClone(values);
      
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
      
              // console.log("FORM",master.form_html)
      
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
      
          },[values?.applicants,mounted]);

    
    const sendApplicationOtp = async(id,index)=>{
    
    
        try{

          // call face match api first ** top

          const face_match_api = await checkFaceMatchScore(id,{
            headers:{
              Authorization:token
            }
          })
    
          const res =  await getMobileOtp(id, {
                  headers: {
                    Authorization: token,
                  },
                },"form-otp");
    
                if(res?.data?.message == 'OTP sent successfully'){
                  // write logic here 

                  // unzip the html if present

                  if(res?.data?.form){

                    let lead_copy = structuredClone(values);

                    const decompressed_form = decompressHtml(res?.data?.form)

                    lead_copy.applicants[index].applicant_details.form_html = decompressed_form;

                    setValues(lead_copy);

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

      
              if(res?.data?.message == "Valid OTP"){
                
      
              let lead_copy = structuredClone(values);
      
              lead_copy.applicants[index].applicant_details.application_form_otp = otp;
              lead_copy.applicants[index].applicant_details.application_form_otp_verified = true;

              console.log("LEAD COPY BEFORE REDNER",lead_copy)
      
              setValues(lead_copy)
      
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

        


                    const generateForm = async(id,email,udpated,active) =>{
                    
                        try{
                    
                          const res_form = await createApplicationForm(id,{
                              headers: {
                                Authorization: token,
                              },
                            },email || false);
                    
                            let lead_copy = structuredClone(udpated || values);
                          
                            if(res_form?.meta){
                            lead_copy.applicants[active].applicant_details.document_meta = res_form?.meta;
                            };
                    
                            console.log("RES FORM",res_form);
                
                            if(res_form?.form){
                              lead_copy.applicants[active].applicant_details.form_html = res_form?.form;
                            }
        
                            if(res_form?.form_html){
                              lead_copy.applicants[active].applicant_details.form_html = res_form?.form_html;
                            }
                    
                            setValues(lead_copy)
                          
                          }
                    
                        catch(err){
                
                    
                          console.log("ERROR IN APPLICATION FORM GENERATION");
                
                          throw err;
                        }
                      }
        


  return (
    <div className='min-h-screen flex flex-col'>

<Topbar title= {values?.applicants?.[primaryIndex]?.applicant_details?.first_name} id={values?.lead?.id} showClose = {true}/>


{values?.applicants?.map((app,index)=>{
  return(
  <Button
  key={app?.id}
                            inputClasses='w-full h-[46px] mt-5'
                            onClick = {()=>{
                              setApplicantForm(true);
                              setActiveApplicant(index);
                            }}
                            primary = {true}
                            specific = {formData?.[index]?.verified === true?'bg-green-500':null}
                            disabled = {!app?.applicant_details?.is_primary && disableOpen}
                          >

                            <div className='w-[300px] overflow:none'>
                              
                            Application Form {`${app?.applicant_details?.first_name} >`}
</div>
                          </Button>
  )
})}
                         {/* <Button
                            inputClasses='w-200px h-[46px]'
                            onClick = {()=>setApplicantForm(true)}
                            primary = {true}
                            specific = {disableSubmit === false?'bg-green-500':null}
                          >
                            Application Form {">"}

                          </Button> */}

                {ApplicationForm&&<FormModal
                containerClassName="mt-16"
                setOpenApplication={setApplicantForm}
                data = {formData}
                sendApplicationOtp = {sendApplicationOtp}
                verifyApplicationOtp = {verifyApplicationOtp}
                generateForm = {generateForm}
                activeApplicant = {activeApplicant}
                />}
                
                     <div
                          // className='flex w-[100vw] p-[18px] bg-white gap-[20px] justify-end'
className="flex w-full p-[18px] bg-white gap-[20px] justify-end mt-auto mb-10"
                          style={{ boxShadow: '0px -5px 10px #E5E5E580' }}
                        >
                          <Button
                            inputClasses='w-1/2 h-[46px]'
                            link={'/lead/preview'}
                            primary = {true}
                          >
                            Previous

                          </Button>
                             <Button
                            inputClasses='w-1/2 h-[46px]'
                            link={'/lead/eligibility'}
                            disabled = {disableSubmit}
                            primary = {true}
                          >
                            Submit
                          </Button>

        
    </div>

    </div>
  )
}

export default ApplicationForm