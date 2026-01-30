import moment from 'moment';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

export default function AdminDateRangePicker({ selectionRange, setSelectionRange, open, setOpen }) {
  return (
    <div
      className='flex justify-center items-center absolute top-2/4 -translate-y-2/4 left-2/4 -translate-x-2/4'
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      {open ? (
        <DateRange
          ranges={[selectionRange]}
          onChange={({ selection }) => {
            setSelectionRange(selection);
            // let endDate = moment(selection.endDate);
            // let startDate = moment(selection.startDate);

            // endDate = endDate.format('DD');
            // startDate = startDate.format('DD');

            // if (selection.endDate > selection.startDate || endDate == startDate) {
            //   setOpen(false);
            // }

            if (selection.endDate > selection.startDate) {
              setOpen(false);
            }
          }}
          rangeColors={['#E33439', '#147257']}
          maxDate={new Date()}
          className='absolute left-0 -translate-x-48 z-[99] bg-white border border-light-grey border-opacity-20 px-5 shadow-calendar rounded-lg'
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
