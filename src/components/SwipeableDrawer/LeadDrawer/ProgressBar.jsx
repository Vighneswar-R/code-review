import LinearProgress from '@mui/material/LinearProgress';
import { Box } from '@mui/system';
import propTypes from 'prop-types';

function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant='determinate' {...props} />
      </Box>
      <Box sx={{ minWidth: 35, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <span className='text-[10px] font-normal'>{`${Math.round(props.value)}%`}</span>
      </Box>
    </Box>
  );
}

LinearProgressWithLabel.propTypes = {
  value: propTypes.number.isRequired,
};

export default function ProgressBar({ progress }) {
  return <LinearProgressWithLabel className='rounded' variant='determinate' value={progress} />;
}

ProgressBar.propTypes = {
  progress: propTypes.any,
};
