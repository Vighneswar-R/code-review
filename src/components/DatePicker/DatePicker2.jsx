/* eslint-disable react/prop-types */
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from './x-date-pickers/DatePicker';
import moment from 'moment';
import { TextField } from '@mui/material';

export default function DatePicker2({
  label,
  name,
  error,
  touched,
  disabled,
  value,
  onAccept,
  onBlur,
  divClasses,
}) {
  return (
    <div className={`flex flex-col gap-1 ${divClasses}`}>
      <label htmlFor={name} className='flex gap-0.5 items-center text-primary-black w-fit'>
        {label}
        {true && <span className='text-primary-red text-sm'>*</span>}
      </label>
      <div
        className={`input-container px-4 py-3 border justify-between  rounded-lg flex w-full items-center    
      ${
        error && touched
          ? 'border-[#E33439] shadow-primary shadow-[#E33439]'
          : value
          ? 'border-dark-grey'
          : 'border-[#D9D9D9]'
      }
      ${disabled ? 'bg-disabled-grey pointer-events-none cursor-not-allowed' : 'bg-white'}
      `}
      >
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <DatePicker
            views={['year', 'month', 'day']}
            format='DD/MM/YYYY'
            slotProps={{
              field: { clearable: true },
            }}
            slots={{
              textField: (params) => <TextField name={name} {...params} onBlur={onBlur} />,
            }}
            onAccept={(e) => {
              let date = e?.format('YYYY-MM-DD');
              onAccept(date);
            }}
            value={moment(value, 'DD/MM/YYYY')}
            name={name}
          />
        </LocalizationProvider>
      </div>
      {error && touched ? (
        <span
          className='text-xs text-primary-red'
          dangerouslySetInnerHTML={{
            __html: error && touched ? error : String.fromCharCode(160),
          }}
        />
      ) : (
        <span
          className='text-xs text-primary-red'
          dangerouslySetInnerHTML={{
            __html: String.fromCharCode(160),
          }}
        />
      )}
    </div>
  );
}
