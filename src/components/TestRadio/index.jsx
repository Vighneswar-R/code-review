import { useState } from 'react';
import Radio from '../Radio';

export const EKYC_AUTHENTICATION_METHODS = [
  {
    label: 'OTP',
    value: 'OTP',
  },
  {
    label: 'Biometrics',
    value: 'Biometrics',
  },
  {
    label: 'IRIS',
    value: 'IRIS',
  },
  {
    label: 'Face Authentication',
    value: 'Face Authentication',
  },
];

const TestRadio = () => {
  const [radio, setRadio] = useState('');

  function handleChange(object) {
    setRadio(object.value);
  }
  return (
    <div className='flex flex-col gap-4 items-start'>
      {EKYC_AUTHENTICATION_METHODS.map((data,index) => (
        <Radio value={data.value} key={data.value ?? index} label={data.label} onChange={handleChange} current={radio} />
      ))}
    </div>
  );
};

export default TestRadio;
