import React from 'react'
import { useLocation } from 'react-router-dom';
import { useState,useEffect } from 'react'
import axios from 'axios'
import { useCookies } from 'react-cookie';
import { Box } from '@mui/material';


const index = () => {


    const [data, setData] = useState(null);
    const location = useLocation();
    const [error, setError] = useState(null);


    const[tokenCookie] = useCookies(['user'])

    const query = new URLSearchParams(location.search);
    const isBMAuthenticated = query.get('isBMAuthenticated') === 'true'; // Convert string to boolean


    useEffect(()=> {

        console.log("cokiue<>>>",tokenCookie)

        if(!isBMAuthenticated) {

            setError('unauthorized')


            throw new Error('Unauthorized')

        }

        else {
            setError(null)
        }

    },[isBMAuthenticated])

   


  return (
    <div>
 <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100vh" // Full viewport height
        >
            <div>
                {error !== null && <div>{error}</div>}
                <video
                    src= {tokenCookie?.user}
                    width="600"
                    controls
                />
            </div>
        </Box>
    
    </div>
  )
}

export default index