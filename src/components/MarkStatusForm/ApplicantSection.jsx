import React, { useContext, useEffect, useState } from 'react';
import {
  editFieldsById,editPropertyById
} from '../../global';
import { AuthContext } from '../../context/AuthContextProvider';
import { LeadContext } from '../../context/LeadContextProvider';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { Box } from '@mui/material';


const ApplicantSection = ({data,editRemark,lead,setLeadData,setGeneralRemark,disabled,loData }) => {


  const {token} = useContext(AuthContext)

  const {applicantError,
    setApplicantError,
    coApplicantError,
    setCoApplicantError,
    remarkError,setRemarkError} = useContext(LeadContext)


  const[primaryErrors,setPrimaryErrors] = useState([])

  const[coApplicantErrors,setCoApplcantErrors] = useState([])
  
  const[edit,setEdit] = useState("")

 
  const [isDisabled, setIsDisabled] = useState(true);
  useEffect(() => {
    if (editRemark !== undefined) setIsDisabled(!editRemark);
  }, [editRemark]);



  const sortPrimaryApplicant = () => {   // structure the data for primary applicant remark


    let keys = Object.keys(data?.primaryApplicant)


    let remarkData = []
    
     keys.forEach((key)=> {
    
     let store = {}
    
     let formattedKey =  key
     .replace(/_/g, ' ') // Replace underscores with spaces
     .split(' ') // Split the string into an array of words
     .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter and lowercase the rest
     .join(' '); // Join the array back into a string


     
     if(key == 'banking_details') {

      if(loData?.user?.role == 'Loan Officer') {



        if(!data?.primaryApplicant?.banking_details?.filter((bank)=>!bank?.extra_params)?.length) {

          store.section = formattedKey;
          let prevData = data?.primaryApplicant?.banking_details?.filter((bank)=>bank?.extra_params)//data?.primaryApplicant?.[key]?.[0]?.bm_remarks;

          store.remark = prevData?.[prevData?.length-1]?.bm_remarks;
          store.id =  prevData?.[prevData?.length-1]?.bm_remarks?.id
          store.origin = key;
          store.status =   prevData?.[prevData?.length-1]?.bm_status

        }

      }

      else {
        store.section = formattedKey;
        store.remark = data?.primaryApplicant?.banking_details?.filter((bank)=>!bank?.extra_params)?.[0]?.bm_remarks//data?.primaryApplicant?.[key]?.[0]?.bm_remarks;
        store.id = data?.primaryApplicant?.banking_details?.filter((bank)=>!bank?.extra_params)?.[0]?.id
        store.origin = key;
        store.status =  data?.primaryApplicant?.banking_details?.filter((bank)=>!bank?.extra_params)?.[0]?.bm_status
      }
     
     }
     
     else {
      store.section = formattedKey;
      store.remark = data?.primaryApplicant?.[key]?.bm_remarks;
      store.id = data?.primaryApplicant?.[key]?.id
      store.origin = key;
      store.status =  data?.primaryApplicant?.[key]?.bm_status
     }
  


    //  console.log("I AM STORE",store)
    
     if(store?.remark?.trim()?.length > 0 && store.status == false) {
      remarkData.push(store)

      console.log("I am store",store)
     }
    
     })

     if(lead?.property_details?.bm_status === false) {
      let newObj = {}

      const formatted = "property_details".replace(/_/g, ' ') // Replace underscores with spaces
      .split(' ') // Split the string into an array of words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter and lowercase the rest
      .join(' '); // Join the array back into a string

      newObj.section = formatted;
      newObj.remark = lead?.property_details?.bm_remarks;
      newObj.origin = "property_details";

      remarkData = [...remarkData,newObj]

     }

     if(data?.primaryApplicant?.applicant_details?.upload_bm_status == false) {

      let newObj = {}

      const formatted = "upload_documents".replace(/_/g, ' ') // Replace underscores with spaces
      .split(' ') // Split the string into an array of words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter and lowercase the rest
      .join(' '); // Join the array back into a string

      newObj.section = formatted;
      newObj.remark = data?.primaryApplicant?.applicant_details?.upload_bm_remarks;
      newObj.origin = "upload_documents";

      remarkData = [...remarkData,newObj]
     }

     let document_data = data?.primaryApplicant?.applicant_details?.document_meta;

     let newSet = []


     if(document_data) {   // safe access of documents

      let keys = Object.keys(document_data)


           
      keys?.forEach((doc_section)=> {

        let newObj = {}

        for(const data of document_data?.[doc_section]) {
          if(data?.active && data?.bm_status == false) {
            const formatted = doc_section.replace(/_/g, ' ') // Replace underscores with spaces
      .split(' ') // Split the string into an array of words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter and lowercase the rest
      .join(' '); // Join the array back into a string

            newObj.section = formatted;
            newObj.remark = data?.bm_remarks
            newObj.origin = 'applicant_details'
            newSet = [...newSet,newObj]
            break;
          }
        }
        

      })


      // console.log("NEW ERRORS DOC",newSet)
     }

     let docError = {isDocs:true,data:newSet}

    //  console.log("DOC FINAL",docError)

     if(docError?.data?.length>0) {
      remarkData = [...remarkData,docError]
     }


    
     setPrimaryErrors(remarkData)

    //  console.log("REMARK ERROR",remarkData)

     setApplicantError(remarkData)
  }


  const sortCoApplicants = () => {

    let coApplicantData = [];

    data?.coApplicants?.forEach((applicants,index)=> {

      let store = {};

      let keys = Object.keys(applicants)


      let datas = [];

      keys.forEach((key)=> {


        let obj = {};

        if(key == 'banking_details') {

          if(loData?.user?.role == 'Loan Officer') {

            let formattedKey = key
          .replace(/_/g, ' ') // Replace underscores with spaces
          .split(' ') // Split the string into an array of words
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter and lowercase the rest
          .join(' '); // Join the array back into a string
    
    
            if(!applicants.banking_details?.filter((bank)=>!bank?.extra_params)?.length) {

              obj.section = formattedKey;
              let prevData = applicants.banking_details?.filter((bank)=>bank?.extra_params !== null)//data?.primaryApplicant?.[key]?.[0]?.bm_remarks;
    
              obj.remark = prevData?.[prevData?.length-1]?.bm_remarks;
              obj.id =  prevData?.[prevData?.length-1]?.bm_remarks?.id
              obj.origin = key;
              obj.status =   prevData?.[prevData?.length-1]?.bm_status
              
          if(obj?.remark?.trim()?.length > 0 && obj.status == false) {
            datas.push(obj)
          }
    
            }
    
          }
    
          else {

            let formattedKey = key
            .replace(/_/g, ' ') // Replace underscores with spaces
            .split(' ') // Split the string into an array of words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter and lowercase the rest
            .join(' '); // Join the array back into a string



            obj.section = formattedKey;
            obj.remark = applicants.banking_details?.filter((bank)=>!bank?.extra_params)?.[0]?.bm_remarks//data?.primaryApplicant?.[key]?.[0]?.bm_remarks;
            obj.id = applicants?.banking_details?.filter((bank)=>!bank?.extra_params)?.[0]?.id
            obj.origin = key;
            obj.status = applicants?.banking_details?.filter((bank)=>!bank?.extra_params)?.[0]?.bm_status


            
          if(obj?.remark?.trim()?.length > 0 && obj.status == false) {
            datas.push(obj)
          }


          }
         
         }

         else {
          let formattedKey = key
          .replace(/_/g, ' ') // Replace underscores with spaces
          .split(' ') // Split the string into an array of words
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter and lowercase the rest
          .join(' '); // Join the array back into a string
         
         
          obj.section = formattedKey;
          obj.remark = applicants?.[key]?.bm_remarks;
          obj.id = applicants?.[key]?.id
          obj.origin = key;
          obj.status = applicants?.[key]?.bm_status
          console.log("status",applicants?.[key])
  
         
          if(obj?.remark?.trim()?.length > 0 && obj.status == false) {
            datas.push(obj)
          }
         }
       
        })

        if(applicants?.applicant_details?.upload_bm_status == false) {
          let newObj = {}
          let formattedKey = "upload_documents"
        .replace(/_/g, ' ') // Replace underscores with spaces
        .split(' ') // Split the string into an array of words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter and lowercase the rest
        .join(' '); // Join the array back into a string

         
        newObj.section = formattedKey;
        newObj.remark = applicants?.applicant_details?.upload_bm_remarks;
        newObj.id = ""
        newObj.origin = "upload_documents"
        newObj.status = applicants?.applicant_details?.upload_bm_status


        if(newObj?.remark?.trim()?.length > 0 && newObj?.status == false) {
          datas.push(newObj)
        }


                }   //ending

                let document_data = applicants.applicant_details?.document_meta;   // starting

                if(document_data) {

                

                let newSet = []
           
           
                if(document_data) {   // safe access of documents
           
                 let keys = Object.keys(document_data)
           
           
                      
                 keys?.forEach((doc_section)=> {
           
                   let newObj = {}
           
                   for(const data of document_data?.[doc_section]) {
                     if(data?.active && data?.bm_status == false) {
                       const formatted = doc_section.replace(/_/g, ' ') // Replace underscores with spaces
                 .split(' ') // Split the string into an array of words
                 .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter and lowercase the rest
                 .join(' '); // Join the array back into a string
           
                       newObj.section = formatted;
                       newObj.remark = data?.bm_remarks
                       newObj.origin = 'applicant_details'
                       newSet = [...newSet,newObj]
                       break;
                     }
                   }
                   
           
                 })
           
           
                 console.log("NEW ERRORS DOC",newSet)
                }
           
                let docError = {isDocs:true,data:newSet}
           
                console.log("COAPP",docError)

                if(docError?.data?.length) {
                  datas.push(docError)
                }
        
              }
        

        if(datas?.length >0) {
          store.remarks = datas;
          store.id = index+1;
          store.name = applicants?.applicant_details?.first_name

          coApplicantData.push(store)
        }
        
        console.log("Hey data",coApplicantData)
    })




    setCoApplcantErrors(coApplicantData)

    setCoApplicantError(coApplicantData)

  }
  
  const onHandleBlur = async(id,page,type,field) => {

    try{
    // console.log("i am the id",id)

    if(page == "property") {
      await editPropertyById(lead?.property_details?.id,{
        bm_remarks: lead?.property_details?.bm_remarks
      },
      {
        headers: {
          Authorization: token,
        },
      },)
    }

    else {

      let index = findIndex(type,id,field)

      const updated = await editFieldsById(
        id,
        page,
        {
          bm_remarks: lead?.applicants?.[index]?.[field]?.bm_remarks
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
  
  
      console.log('success',updated)
    }
  } catch(err) {
    console.log("something went wrong while saving remarks")
  }

  }


  function findIndex (type,id,origin) {

    let index = 0;

    if(type == "primary") {
      lead?.applicants?.forEach((applicant,i)=> {
        if(applicant.applicant_details.is_primary) {

          // console.log("I am the primary applicant",index)
          index = i;
        }
      })
    }

    else {

      lead?.applicants?.forEach((applicant,i)=> {

        // console.log(applicant?.[origin],"here")

        if(applicant?.[origin]?.id == id) {

          index = i;

          // console.log("I am the selected index >>>>",index)

        }
      })
    }


    return index;

  }

  const handleOnChange = (e,id,type,key,position) => {

    // idendifying the changes

    let primary = data?.primaryApplicant;

    let co_applicants = data?.coApplicants;

    let leadRef = { ...lead };


    if(type === "primary") {

      if(key == "property_details") {

        let feedback = e.target.value;

        leadRef.property_details.bm_remarks = feedback;
        setLeadData(leadRef)

      }

      else if(primary && primary[key] && key == 'banking_details') {
        primary[key][0].bm_remarks = e.target.value;
      }

      else {
        if (primary && primary[key]) {
          primary[key].bm_remarks = e.target.value;
        }
  
        let index = 0;
  
        lead?.applicants?.forEach((applicant,i)=> {
          if(applicant.applicant_details.is_primary) {
  
            // console.log("I am the primary applicant",index)
  
            index = i;
          }
        })
        
  
        leadRef.applicants[index] = primary;
  
        setLeadData(leadRef)
      }
    
   

    }

    else {


      let applicant = data?.coApplicants?.[position]

      if (applicant[key]) {
        applicant[key].bm_remarks = e.target.value;
      }

      co_applicants[position] = applicant;

      
      console.log("I am position",position)

      leadRef.applicants = [{ ...primary }, ...co_applicants];

      setLeadData(leadRef)

    }
  }

  useEffect(()=> {

    // console.log("I am the product lead",lead)
  },[lead])


  const getGeneralRemark = (event) => {

    setGeneralRemark(event.target.value)
  }


useEffect(()=> {

  sortPrimaryApplicant();

  sortCoApplicants();

  // console.log(data)


  },[])


  useEffect(()=> {

    setRemarkError({primary:primaryErrors,coApplicant:coApplicantErrors})


  },[primaryErrors,coApplicantErrors])

  return (
    
    <div className='rounded-lg border border-[#EBEBEB] bg-blue p-3 flex flex-col gap-2 active:opacity-90 mt-2.5 shadow-[0_4px_15px_rgba(0,0,0,0.2)]'>

      {remarkError?.primary?.length <=0 && remarkError?.coApplicant?.length <=0 && !data?.general_remark? <Box
      maxWidth='xs'
      fullWidth
      open={true} // Always open the modal

      sx={{
        '& .MuiDialog-paper': { background: '#64748b', borderRadius: '25px' },
        '& .MuiDialogTitle-root': {
          padding: '10px 20px',
          fontSize: '15px',
          textDecoration: 'underline',
        },
        '& .MuiDialogContent-root  ': {
          margin: '0',
          padding: '0',
        },
      }}
    >

      
      <DialogContent
        sx={{
          '& .MuiDialogContent': {
            margin: '0',
          },
        }}
        dividers
      >

        <TextField
          placeholder='Enter message Here...!'
          sx={{ marginTop: '0', background: 'white', padding: '10px' }}
          autoFocus
          margin='dense'
          id='remarks'
          label='Enter your remarks'
          type='text'
          fullWidth
          multiline
          rows={10} // Adjust this for textarea height
          variant='outlined'
          onChange={getGeneralRemark}
          disabled = {disabled}
         
        />
      </DialogContent>
      </Box>:data?.general_remark && remarkError?.primary?.length <=0 && remarkError?.coApplicant?.length <=0?
          <div key={20} className='mb-4'>
          <h6 className='font-xs font-semibold'>REMARKS</h6>
            <input
              disabled={true}
              defaultValue={data?.general_remark}
              // onChange={(e)=>handleOnChange(e,sections.id,"primary",sections.origin)}
              className='border border-black p-2 rounded-md w-full mb-2'
              // onBlur={()=>onHandleBlur(sections.id,sections.origin.split('_')[0],"primary",sections.origin)}
            />
      
        </div>
      
      :
      <div>
      <h5 className='text-lg font-semibold mb-2 underline'>Primary Applicant</h5>
      {primaryErrors.map((sections, index) => (
  sections?.isDocs === true ? (
    <div key={index} className="mb-4">
      {/* Header when isDocs is true */}
      {/* Inputs when isDocs is true */}
      {sections?.data?.map((inner, innerIndex) => (
        <div key={innerIndex} className="mb-4">
        <h6 className="font-xs font-semibold">{inner.section}</h6>

          <input
            disabled={true}
            defaultValue={inner.remark}
            className="border border-black p-2 rounded-md w-full mb-2"
          />
        </div>
      ))}
    </div>
  ) : (
    <div key={index} className="mb-4">
      {/* Header when isDocs is false */}
      <h6 className="font-xs font-semibold">{sections.section}</h6>
      {/* Single input when isDocs is false */}
      <input
        disabled={!editRemark}
        defaultValue={sections.remark}
        onChange={(e) => handleOnChange(e, sections.id, "primary", sections.origin)}
        className="border border-black p-2 rounded-md w-full mb-2"
        onBlur={() => onHandleBlur(sections.id, sections.origin.split("_")[0], "primary", sections.origin)}
      />
    </div>
  )
))}

<h5 className='text-lg font-semibold mb-2 underline'>Co - Applicants</h5>

      {coApplicantErrors.map((sections, index) => (
        <div key={index} className='mb-4'>
        <h5 className='text-lg font-semibold mb-2'>{sections?.name}</h5>
        {sections.remarks?.map((remark, i) => (
  <div key={i} className="mb-4">
    {/* Render based on isDocs */}
    {remark.isDocs ? (
      // If remark.isDocs is true, map through remark.data
      remark.data?.map((innerRemark, innerIndex) => (
        <div key={innerIndex} className="mb-4">
          <h6 className="font-xs font-semibold">{innerRemark.section}</h6>
          <input
            defaultValue={innerRemark.remark}
            // onChange={(e) => handleOnChange(e, innerRemark.id, "co-applicant", innerRemark.origin, index)}
            className="border border-black p-2 rounded-md w-full mb-2"
            // onBlur={() => onHandleBlur(innerRemark.id, innerRemark.origin.split('_')[0], "co-applicant", innerRemark.origin)}
            disabled={true}
          />
        </div>
      ))
    ) : (
      // If remark.isDocs is false, render the regular remark
      <div className="mb-4">
        <h6 className="font-xs font-semibold">{remark.section}</h6>
        <input
          defaultValue={remark.remark}
          onChange={(e) => handleOnChange(e, remark.id, "co-applicant", remark.origin, index)}
          className="border border-black p-2 rounded-md w-full mb-2"
          onBlur={() => onHandleBlur(remark.id, remark.origin.split('_')[0], "co-applicant", remark.origin)}
          disabled={!editRemark}
        />
      </div>
    )}
  </div>
))}
        </div>
      ))}

      <div>
      </div></div>}
    
    </div>
  );
};


export default ApplicantSection;