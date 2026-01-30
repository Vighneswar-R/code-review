import moment from 'moment';
import { useRef, useState } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { IconCalendar } from '../../assets/icons';

export default function DateRangePicker({ selectionRange, setSelectionRange,user }) {
  // const [selectionRange, setSelectionRange] = useState({
  //   startDate: moment().startOf('month'),
  //   endDate: moment().endOf('month'),
  //   key: 'selection',
  // });
  const [open, setOpen] = useState(false);

  return (
    <div
      className='relative'
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <button
        className='flex justify-center items-center h-10 w-full px-3 py-2 border border-lighter-grey bg-[#FEFEFE] rounded-lg text-sm md:text-base lg:text-lg'
        onClick={() => setOpen(!open)}
      >
        <div className='mr-1'>
          <IconCalendar className='w-4 h-4' />
        </div>
        <span className='overflow-hidden text-center sm:text-xs  not-italic font-normal text-dark-grey'>
          {`${moment(selectionRange.startDate).format('DD/MM/YYYY')} - ${moment(
            selectionRange.endDate,
          ).format('DD/MM/YYYY')}`}
        </span>
      </button>

      {open ? (
        <DateRange
          ranges={[selectionRange]}
          onChange={({ selection }) => {
            setSelectionRange(selection);
            if (selection.endDate > selection.startDate) {
              setOpen(false);
            }
          }}
          rangeColors={['#E33439', '#147257']}
          maxDate={new Date()}
         className={`absolute top-1/2 ${user?.user?.role == 'Branch Manager'?'left-1/2':''} z-[99] bg-white border border-light-grey border-opacity-20 px-5 shadow-calendar rounded-lg transform -translate-x-1/2 -translate-y-1/2 mt-[180px]`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setOpen(false);
            }
          }}
        />
      ) : null}
    </div>
  );
}
