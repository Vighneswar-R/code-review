import { useTheme } from '@mui/material/styles';
import propTypes from 'prop-types';
import { Box } from '@mui/material';
import { useContext } from 'react';
import { LeadContext } from '../../../context/LeadContextProvider';
import { CommingSoon } from '../../../assets/icons';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: propTypes.node,
  index: propTypes.number.isRequired,
  value: propTypes.number.isRequired,
};

export default function ToolsTab() {
  const { drawerTabIndex } = useContext(LeadContext);

  const theme = useTheme();

  return (
    <TabPanel
      className='tabPanel p-0'
      style={{ height: `calc(80vh - 65px)`, overflow: 'auto' }}
      value={drawerTabIndex}
      index={2}
      dir={theme.direction}
    >
      <img src={CommingSoon} alt='' className='w-full' />
    </TabPanel>
  );
}
