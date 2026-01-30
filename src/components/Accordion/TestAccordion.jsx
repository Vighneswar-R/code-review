import LntChargesIcon from '../../assets/icons/lntCharges';
import StepsAccordion from './index';

export default function TestAccordion() {
  const options = [
    {
      label: 'Cash',
      checked: true,
    },
    {
      label: 'E-kyc',
      checked: false,
    },
    {
      label: 'E-kyc',
      checked: false,
    },
    {
      label: 'E-kyc',
      checked: false,
    },
  ];
  const handleSwitchChange = (checked, label) => {
    // handle switchChange logic
    console.log(label, ' marked as ', checked);
  };
  return (
    <StepsAccordion options={options} onChange={handleSwitchChange}>
      <div className='flex'>
        <LntChargesIcon />
        <div className='ml-2'>
          <p className='font-medium'>L&T Charges</p>
          <p className='text-sm text-light-grey mt-2'>
            This will allow the iTrust app to access the payment options
          </p>
        </div>
      </div>
    </StepsAccordion>
  );
}
