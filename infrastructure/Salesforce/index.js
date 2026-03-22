const axios = require('axios');



const axiosInstance = axios.create();


const main = {

get_access_token: async() =>{

    try{


           const sf_token = await axiosInstance.post(`${process.env.SF_TOKEN_API}`,{},{headers:{
            "Content-Type":"application/json"
    }});

    const access_token = sf_token?.data?.access_token;

    if(!access_token) throw new Error("Error Generating Access Token!",err);

}

catch(err){


    throw err;

}

},

get_collection_list:async(empCode,ins,cs)=>{

    try{


    const access_token = main.get_access_token();

    if(!access_token) throw new Error("Error Generating Access Token");


    const collection_list = await axiosInstance.get(`${process.env.SF_CASH_COLLECTION_URL}?empCode=${empCode}&ins=${ins}&cs=${cs}`,{
         headers:{
            Authorization:`Bearer ${access_token}`
        }
    })

        return collection_list || [];

    }
    catch(err){

        console.log("Error Fetching collection List",err);
        throw err;

    }
},

add_follow_up:async(sf_body)=>{

    try{

        const access_token = main.get_access_token();

        if(!access_token) throw new Error("Error Generating Access Token!",err);

        const SF_URL = process.env.SF_FOLLOW_UP_URL;

        const updated_sf = await axiosInstance.post(`${SF_URL}`,sf_body,{
            headers:{
                Authorization:`Bearer ${access_token}`
            }
        });

        return {message:"Success"}

    }

    catch(err){

        console.log("Error Updating Follow Up on Salesforce",err);

        throw err;
    }
},


add_address_mobile:async(sf_body)=>{

    try{

        const access_token = main.get_access_token();

        if(!access_token) throw new Error("Error Generating Access Token!",err);

        const SF_URL = process.env.SF_MOBILE_ADDRESS_UPDATE_URL;

        const updated_sf = await axiosInstance.post(`${SF_URL}`,sf_body,{
            headers:{
                Authorization:`Bearer ${access_token}`
            }
        });

        return {message:"Success"}

    }

    catch(err){

        console.log("Error Updating Mobile/Address on Salesforce",err);

        throw err;
    }
},


add_attendance:async(sf_body)=>{

    try{

        const access_token = main.get_access_token();

        if(!access_token) throw new Error("Error Generating Access Token!",err);

        const SF_URL = process.env.SF_ATTENDANCE_URL;

        const updated_sf = await axiosInstance.post(`${SF_URL}`,sf_body,{
            headers:{
                Authorization:`Bearer ${access_token}`
            }
        });

        return {message:"Success"}

    }

    catch(err){

        console.log("Error Updating Attendance in Salesforce",err);

        throw err;
    }
}


}


module.exports = main;




