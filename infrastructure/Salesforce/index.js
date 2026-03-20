const axios = require('axios');

const get_access_token = async() =>{


    try{

     const newInstance = axios.create();
           const sf_token = await newInstance.post(`${process.env.SF_TOKEN_API}`,{},{headers:{
            "Content-Type":"application/json"
    }});

    const access_token = sf_token?.data?.access_token;

}

catch(err){
    
}
}