import React, { useContext, useEffect,useRef } from 'react'
import { DropDown } from '../../../components'
import { useState } from 'react'
import { getContestDataExisting,uploadContestImage } from '../../../global'
import { AuthContext } from '../../../context/AuthContextProvider'
import {Button} from '../../../components'
const ContestUpload = () => {

    const[role,setRole] = useState('');

    const[images,setImages] = useState([]);

    const[singleFile,setSingleFile] = useState({})

    const {token} = useContext(AuthContext)

       const getUrls = async () =>{

        try{
        
        const {contest_url} = await getContestDataExisting(role,{headers:{
            Authorization:token
        }});

        console.log("URL FOUND",contest_url);

        setImages(contest_url.images)

    }
    
    catch(err){
        console.log("ERROR IN URLS",err)
    }
        
    }

    useEffect(()=>{

        if(!role) return;

        getUrls()

        

    },[role]);


    const onHandleDeleteImage = async (id) =>{

        try{

            if(!id) throw new Error("No Id Found")

            const updated_data = await uploadContestImage(role,{
                id:id,
                deleteImage:true
            },{headers:{Authorization:token}});


            if(updated_data?.message == "Success"){

                
                setImages(images.filter((img)=>{
                    return img["id"] !== id
                }))
            }

        }

        catch(err){

            console.log("Error in Editing Image",err)
        }

    } 


    const onHandleChange = async (e) =>{

        //uploadContestImage

        if(!e) return;

        try{

            const formData = new FormData();

            let file = e?.target?.files[0];

            formData.append('file',file);

           const {contest_url} = await uploadContestImage(role,formData,{headers:{Authorization:token}});

        //    setImages((prev)=>[...prev,contest_url])

        let existing_images = structuredClone(images || []);

        setImages([...existing_images,contest_url])


        }

        catch(err){
            console.log("ERROR IN UPLOADING CONTEST IMAGE",err)
        }


    }



  return (
    <>

    {!role && 
    <DropDown
            //    label='Choose Role'
               name= {role}
               required
               options={
                 [
                    {label:"Loan Officer",
                        value:"Loan Officer"
                    },
                      {label:"Branch Manager",
                        value:"Branch Manager"
                    }
                 ]
               }
               placeholder='Select Role'
               onChange={(e)=>{
                setRole(e);
               }}
            //    touched={touched && touched?.lead?.purpose_of_loan}
            //    error={errors && errors?.lead?.purpose_of_loan}
            //    onBlur={handleBlur}
               defaultSelected={role}
            //    inputClasses='mt-2'
            //    disabled={
            //      !values?.applicants?.[activeIndex]?.applicant_details?.is_primary ||
            //      values?.applicants?.[activeIndex]?.applicant_details?.extra_params?.qualifier ||(values.applicants[activeIndex]?.applicant_details?.is_primary?tempQualifier:tempQualifierCoApplicant)
            //    }
             />
            }

            {role&&
            <HandleImages role = {role} images = {images} onChange = {onHandleChange} onHandleDeleteImage = {onHandleDeleteImage}/>
            }


    </>
  )
}


const HandleImages = ({role,images,onChange,onHandleDeleteImage}) =>{

      const fileInputRef = useRef(null);


    
  const handleButtonClick = () => {
    fileInputRef.current.click(); // Trigger the hidden input
  };


  const openImageInNewTab = (base64) => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/jpeg' });

  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, '_blank');
};

    return(
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            <h2 className='text-xxxl font-normal text-light-grey mt-10'>Contest Images For {role}</h2>

  <div
    style={{
      display: 'flex',
      flexDirection:'row',
            flexWrap: 'wrap',
    //   justifyContent: 'center',
      gap: '5px',
      maxWidth: '80%',
      marginTop: '20px',
    }}
  >
{images?.map((img)=>{   //onHandleDeleteImage
    return(
        <div onClick={()=>{openImageInNewTab(img?.base64)}} style={{cursor:"pointer"}}>
            <img src={`data:image/jpeg;base64,${img?.base64}`} alt="" style={{width:"250px",height:'300px'}}/>
            <Button
              inputClasses='w-full h-[46px] mt-10'
                      onClick={(e)=>{
                        e.stopPropagation();
                        onHandleDeleteImage(img?.id)}}
            >Delete Image</Button>
            </div>
    )
})}

        </div>


            <input
            type='file'
                   ref={fileInputRef}
        className="hidden"
        onChange={onChange}
                        accept='image/*'

            />

            <Button
                    primary={true}
              inputClasses='w-full h-[46px] mt-10'
                      onClick={handleButtonClick}

            >Upload Image</Button>


        </div>
    )

}



export default ContestUpload