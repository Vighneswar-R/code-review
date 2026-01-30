import React from 'react';
import moment from 'moment';
import Button from '../Button';

export default function OcrComparisonDrawer({
  ocrData,
  prevData,
  onAccept,
  onReject,
  disableAcceptButton,
  ocrProcessingStatus,
  ocrComparisonTimestamp,
}) {
  const fields = [
    { label: 'Name', ocrKey: 'name', prevKey: 'name' },
    { label: 'DOB', ocrKey: 'dob', prevKey: 'date_of_birth' },
    { label: 'Id Type', ocrKey: 'idType', prevKey: 'id_type' },
    { label: 'Id Number', ocrKey: 'idNumber', prevKey: 'id_number' },
    { label: 'Address', ocrKey: 'address', prevKey: 'address' },
    { label: 'Father Name', ocrKey: 'fatherName', prevKey: 'father_name' },
  ];

  const normalize = (val) => (val ? String(val).trim() : '');

  const formatPrevDob = (val) => {
    if (!val) return '';
    return moment(val, ['YYYY-M-D', 'YYYY-MM-DD']).format('DD-MM-YYYY');
  };

  const formatTimestamp = (val) => {
    if (!val) return '';
    return moment(val).format('DD-MM-YYYY HH:mm:ss');
  };

  return (
    <div className='w-full px-8 py-4'>
      <h2 className='font-semibold text-lg mb-2'>OCR Results :-</h2>

      <div className='text-sm text-gray-600 mb-4'>
        <div>
          <span className='font-semibold'>Status:</span> {ocrProcessingStatus || '-'}
        </div>
        <div>
          <span className='font-semibold'>Timestamp:</span>{' '}
          {formatTimestamp(ocrComparisonTimestamp)}
        </div>
      </div>

      <div className='grid grid-cols-3 text-sm'>
        <div className='font-bold pb-4'>Field</div>
        <div className='font-bold pb-4 text-center'>OCR Results</div>
        <div className='font-bold pb-4 text-center'>Previous Details</div>

        {fields.map((f) => {
          const ocrVal = normalize(ocrData?.[f.ocrKey]);
          let prevVal = normalize(prevData?.[f.prevKey]);
          if (f.label === 'DOB' && prevVal) {
            prevVal = formatPrevDob(prevVal);
          }

          const isDiff = ocrVal && prevVal && ocrVal !== prevVal;
          const isMissing = !ocrVal;

          return (
            <React.Fragment key={f.label}>
              <div className='py-3 border-t'>{f.label}</div>

              <div
                className={`py-3 border-t text-center ${
                  isMissing
                    ? 'bg-red-100 text-red-700'
                    : isDiff
                      ? 'bg-yellow-100 text-yellow-800'
                      : ''
                }`}
              >
                {ocrVal || '— Not Found —'}
              </div>

              <div className='py-3 border-t text-center'>{prevVal || '-'}</div>
            </React.Fragment>
          );
        })}
      </div>

      <div className='flex justify-center gap-4 mt-6'>
        <Button disabled={disableAcceptButton} onClick={onAccept} primary={true}>
          Accept
        </Button>
        <Button onClick={onReject} primary={false}>
          Reject
        </Button>
      </div>
    </div>
  );
}
