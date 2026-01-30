import { IconHomeLoan, IconLoanAgainstProperty } from '../../../../assets/icons';

export const loanTypeOptions = [
  {
    label: 'Home Loan',
    value: 'Home Loan',
    icon: <IconHomeLoan />,
  },
  {
    label: 'Loan against Property',
    value: 'LAP',
    icon: <IconLoanAgainstProperty />,
  },
];

export const loanOptions = {
  'Home Purchase': [
    {
      label: 'Residential House',
      value: 'Residential House',
    },
    {
      label: 'Plot + Construction',
      value: 'Plot + Construction',
    },
    {
      label: 'Ready Built Flat',
      value: 'Ready Built Flat',
    },
  ],
  'Home Construction': [
    {
      label: 'Owned Plot',
      value: 'Owned Plot',
    },
    {
      label: 'Plot + Construction',
      value: 'Plot + Construction',
    },
  ],
  'Home Renovation/Extension': [
    {
      label: 'Residential House',
      value: 'Residential House',
    },
  ],
  'BT+Top-up': [
    {
      label: 'Residential House',
      value: 'Residential House',
    },
    {
      label: 'Plot + Construction',
      value: 'Plot + Construction',
    },
    {
      label: 'Ready Built Flat',
      value: 'Ready Built Flat',
    },
    {
      label: 'Owned Plot',
      value: 'Owned Plot',
    },
  ],
};

export const loanPurposeData = [
  {
    label: 'Home Purchase',
    value: 'Home Purchase',
  },
  {
    label: 'Home Construction',
    value: 'Home Construction',
  },
  {
    label: 'Home Renovation',
    value: 'Home Renovation',
  },
  {
    label: 'Home Extension',
    value: 'Home Extension',
  },
  {
    label: 'BT+Top-up',
    value: 'BT+Top-up',
  },
];

export const loanPurposeDataLap = [
  {
    label: 'Business',
    value: 'Business',
  },
  {
    label: 'Personal usage',
    value: 'Personal Usage',
  },
  {
    label: 'BT+Top-up',
    value: 'BT+Top-up',
  },
];

export const loanOptionsLap = {
  Business: [
    {
      label: 'Residential House',
      value: 'Residential House',
    },
    {
      label: 'Ready Built Flat',
      value: 'Ready Built Flat',
    },
    {
      label: 'Commercial Shop/Unit',
      value: 'Commercial Shop/Unit',
    },
    {
      label: 'Commercial Building',
      value: 'Commercial Building',
    },
    {
      label: 'Plot + Construction',
      value: 'Plot + Construction',
    },
  ],
  'Personal usage': [
    {
      label: 'Residential House',
      value: 'Residential House',
    },
    {
      label: 'Ready Built Flat',
      value: 'Ready Built Flat',
    },
    {
      label: 'Commercial Shop/Unit',
      value: 'Commercial Shop/Unit',
    },
    {
      label: 'Commercial Building',
      value: 'Commercial Building',
    },
  ],
  'Personal usage BT+Top-up': [
    {
      label: 'Residential House',
      value: 'Residential House',
    },
    {
      label: 'Ready Built Flat',
      value: 'Ready Built Flat',
    },
    {
      label: 'Commercial Shop/Unit',
      value: 'Commercial Shop/Unit',
    },
    {
      label: 'Commercial Building',
      value: 'Commercial Building',
    },
  ],
};
