import { Badge, IconButton, Box, Typography,Modal } from '@mui/material';
import Button from '../Button';
import LanguageSwitcher from '../LanguageSwitcher';
import { useTranslation } from 'react-i18next';




const BranchModal = ({ open, handleClose, content, name, branch }) => {

  const { t } = useTranslation();
  
  return (
    <Modal open={open} onClose={!open}>

      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          width: '95%',
          textAlign: 'left',
        }}
      >

                      <div style={{height:'40px'}}><LanguageSwitcher/></div>

        {/* <Typography variant="h6" component="h2">
          
        </Typography> */}
        {/* <Typography sx={{ mt: 2 }}>{t(content?.line1)}</Typography>
                <Typography sx={{ mt: 2 }}>{content?.line2}</Typography>
        <Typography sx={{ mt: 2,color:'red' }}>{content?.note}</Typography> */}

             <Typography sx={{ mt: 2 }}>{t('line1')} {name}</Typography>
                <Typography sx={{ mt: 2 }}>{t('line2')} {branch} {t('line3')}</Typography>
        <Typography sx={{ mt: 2,color:'red' }}>{t('note1')} {branch} {t('note2')}</Typography>

<Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
 <Button
  onClick={handleClose}
  primary = {true}
>
  Close
</Button>
</Box>  

          {/* <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
          }}
        >
          <CloseIcon />
        </IconButton> */}
      </Box>
    </Modal>
  );
};


export default BranchModal
