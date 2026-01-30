import { Box, Typography, Modal } from '@mui/material';
import Button from '../Button';

const DocumentModal = ({ open, handleClose, content }) => {

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 2,
          borderRadius: 2,
          width: '95%',
          textAlign: 'left',
        }}
      >
        {content?.line1 && (
          <Typography sx={{ mt: 2 }}>
            {content.line1}
          </Typography>
        )}

        {content?.line2 && (
          <Typography sx={{ mt: 2 }}>
            {content.line2}
          </Typography>
        )}

        {content?.note && (
          <Typography sx={{ mt: 2, color: 'red' }}>
            {content.note}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button onClick={handleClose} primary={true}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DocumentModal;
