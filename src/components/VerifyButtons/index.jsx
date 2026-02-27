import React from 'react'
import Button from '@mui/material/Button';
import { useEffect } from 'react';


const YesButton = ({click,disabled}) => {

  useEffect(()=> {
    console.log("Hey AI ",disabled)
  },[])

    return(
    

<Button
variant="contained"
size='small'
sx={{
    minWidth:'50px',
    width:'50px',
    padding: '2px 6px', // Smaller padding
    fontSize: '0.6rem',  // Smaller font size
  backgroundColor: 'rgba(40, 167, 69, 1)',
  color: 'white',
  border: '1px solid #ccc',
  '&:hover': {
    backgroundColor: 'green',
  },
}}

onClick={click}
disabled = {disabled}
>
YES
</Button>
    )
}


const Nobutton = ({click,disabled}) => {
    return(
        
            <Button
        variant="contained"
       
        size='small'
        sx={{
            minWidth:'50px',
            width:'50px',
            padding: '2px 6px', // Smaller padding
    fontSize: '0.6rem',  // Smaller font size
    backgroundColor: 'rgb(227, 52, 57,0.9)',
          color: 'white',
          marginLeft: '10px',
          border: '1px solid #ccc',
          '&:hover': {
            backgroundColor: 'red',
          },
        }}
        onClick={click}
        disabled = {disabled}

      >
        NO
      </Button>
       
    )
}

export {YesButton,Nobutton}