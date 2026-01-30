import React from 'react';
import { Modal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';


const ContestModal = ({ open, handleClose,children }) => {

  const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  height: '90%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  outline: 'none',
  overflow: 'auto',   
};
  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', top: 8, right: 8,backgroundColor:'white' }}
        >
          <CloseIcon />
        </IconButton>
    {children}
      </Box>
    </Modal>
  );
};

export default ContestModal