import IconSelfOwned from '../../../../assets/icons/self-owned';
import IconRent from '../../../../assets/icons/rent';
import CommunicationIcon from '../../../../assets/icons/communication';
import PermanentIcon from '../../../../assets/icons/permanent';

export const residenceData = [
  {
    label: 'Rented',
    value: 'Rented',
    icon: <IconRent />,
  },
  {
    label: 'Self owned',
    value: 'Self owned',
    icon: <IconSelfOwned />,
  },
];

export const yearsResidingData = [
  {
    label: '0-1',
    value: '1',
  },
  {
    label: '2-5',
    value: '5',
  },
  {
    label: '6-10',
    value: '10',
  },
  {
    label: '10+',
    value: '11',
  },
];

export const typeOfAddressData = [
  {
    label: 'Communication',
    value: 'Communication Address',
    icon: <CommunicationIcon />,
  },
  {
    label: 'Permanent',
    value: 'Permanent Address',
    icon: <PermanentIcon />,
  },
];


export const dynamicAddress = [

  {label: 'Current',
   value: 'Current',},
  {
    label: 'Communication',
    value: 'Communication Address',
  },
  {
    label: 'Permanent',
    value: 'Permanent Address',
  },
]
