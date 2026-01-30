import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import OpenAccordian from '../../assets/icons/OpenAccordian';
import ToggleSwitch from '../ToggleSwitch';
import PropTypes from 'prop-types';
import { useState } from 'react';

export default function StepsAccordion({ options, onChange, children }) {
  return (
    <div className='w-full'>
      <Accordion defaultExpanded={options.length < 3} style={{ borderRadius: '8px' }}>
        <AccordionSummary
          expandIcon={options.length > 3 && <OpenAccordian />}
          aria-controls='panel1-content'
          id='panel1-header'
          sx={{
            '& .MuiAccordionSummary-content': {
              margin: '16px 0 !important',
            },
            '& .MuiAccordionSummary-expandIconWrapper': {
              alignSelf: 'flex-start',
              marginTop: '16px',
            },
          }}
        >
          {children}
        </AccordionSummary>
        <AccordionDetails>
          <hr className='border border-lighter-grey w-100 mb-6 mt-2' />
          <div className='gap-2 flex flex-col'>
            {options.map((option, index) => {
              return (
                <div key={index} className='flex justify-between gap-2'>
                  <p className='font-medium'>{option.label}</p>
                  <RenderSwitch option={option} onChange={onChange} />
                </div>
              );
            })}
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

const RenderSwitch = ({ option, onChange }) => {
  const [checked, setChecked] = useState(option.checked);
  const handleSwitchChange = (checked, label) => {
    setChecked(checked);
    onChange(checked, label);
  };
  return (
    <ToggleSwitch
      switchColor='#147257'
      name={option.label}
      checked={checked}
      onChange={(e) => handleSwitchChange(e.target.checked, option.label)}
    />
  );
};

StepsAccordion.propTypes = {
  options: PropTypes.array,
  onChange: PropTypes.func,
  children: PropTypes.element,
};
