import {
  IconManual,
  IconOcr,
  IconEkyc,
  IconMale,
  IconFemale,
  IconTransGender,
  IconMarried,
  IconSingle,
  IconSalarid,
  IconSelfEmployed,
} from '../../../assets/icons';
import IconRetired from '../../../assets/icons/retired';
import IconUnemployed from '../../../assets/icons/unemployed';

export const personalDetailsModeOption = [
  {
    label: 'OCR',
    value: 'OCR',
    icon: <IconOcr />,
  },
  {
    label: 'e-KYC',
    value: 'e-KYC',
    icon: <IconEkyc />,
  },
  {
    label: 'Manual',
    value: 'Manual',
    icon: <IconManual />,
  },
];

export const personalDetailsGenderOption = [
  {
    label: 'Male',
    value: 'Male',
    icon: <IconMale />,
  },
  {
    label: 'Female',
    value: 'Female',
    icon: <IconFemale />,
  },
  {
    label: 'Transgender',
    value: 'Third Gender',
    icon: <IconTransGender />,
  },
];

export const personalMaritalStatusOptions = [
  {
    label: 'Married',
    value: 'Married',
    icon: <IconMarried />,
  },
  {
    label: 'Single',
    value: 'Single',
    icon: <IconSingle />,
  },
];

export const professionOptions = [
  {
    label: 'Salaried',
    value: 'Salaried',
    icon: <IconSalarid />,
  },
  {
    label: 'Self employed',
    value: 'Self Employed',
    icon: <IconSelfEmployed />,
  },
  {
    label: 'Un employed',
    value: 'Un-Employed',
    icon: <IconUnemployed />,
  },
  {
    label: 'Pensioner',
    value: 'Pensioner',
    icon: <IconRetired />,
  },
];

export const noOfDependentsOptions = [
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

export const totalFamilyMembersOptions = [
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

export const otherDocumentOptions = [
  {
    label: 'Electricity Bill',
    value: 'Electricity Bill',
  },
  {
    label: 'Water Bill',
    value: 'Water Bil',
  },
  {
    label: 'Ration Card',
    value: 'Ration Card',
  },

  {
    label: 'NOC (No Objection Certificate',
    value: 'NOC',
  },

  {
    label: 'Extra Work Agreement',
    value: 'Extra Work Agreement',
  },

  {
    label: 'Loan Closure Proof',
    value: 'Loan Closure Proof',
  },

  {
    label: 'Utility Bills',
    value: 'Utility Bills',
  },

  {
    label: 'Telephone Bill',
    value: 'Telephone Bill',
  },

  {
    label: 'Other',
    value: 'Other',
  },
];
