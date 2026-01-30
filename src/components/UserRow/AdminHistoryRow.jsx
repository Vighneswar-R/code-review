import moment from 'moment';
import Tooltip from '@mui/material/Tooltip';
import { useMemo } from 'react';

const Row = ({ log, i }) => {
  const getLoEmployeeCode = useMemo(() => {
    return (
      log?.dump?.new_object?.employee_code ||
      log?.dump?.request?.body?.employee_code ||
      log?.dump?.old_object?.employee_code
    );
  }, [
    log?.dump?.new_object?.employee_code,
    log?.dump?.request?.body?.employee_code,
    log?.dump?.old_object?.employee_code,
  ]);

  const getLoEmployeeName = useMemo(() => {
    if (log?.dump?.new_object?.first_name) {
      return String(
        log?.dump?.new_object?.first_name +
          ' ' +
          log?.dump?.new_object?.middle_name +
          ' ' +
          log?.dump?.new_object?.last_name,
      );
    } else if (log?.dump?.request?.body?.first_name) {
      return String(
        log?.dump?.request?.body?.first_name +
          ' ' +
          log?.dump?.request?.body?.middle_name +
          ' ' +
          log?.dump?.request?.body?.last_name,
      );
    } else {
      return String(
        log?.dump?.old_object?.first_name +
          ' ' +
          log?.dump?.old_object?.middle_name +
          ' ' +
          log?.dump?.old_object?.last_name,
      );
    }
  }, [
    log?.dump?.new_object?.first_name,
    log?.dump?.request?.body?.first_name,
    log?.dump?.old_object?.first_name,
  ]);

  const status = useMemo(() => {
    if (log?.endpoint == '/add-user/') {
      return 'Created';
    } else if (log?.endpoint?.includes('/delete-user/')) {
      return 'Deleted';
    } else if (log?.endpoint?.includes('/edit-user/')) {
      if (log?.dump?.new_object?.status !== log?.dump?.old_object?.status) {
        if (log?.dump?.new_object?.status === 'active') return 'Activated';
        else if (log?.dump?.new_object?.status === 'inActive') return 'Inactivated';
      } else return 'Edited';
    }
  }, [log.endpoint]);

  const fieldsToCompare = [
    'employee_code',
    'date_of_birth',
    'role',
    'first_name',
    'middle_name',
    'last_name',
    'mobile_number',
    'branch',
    'department',
  ];

  const compareObjects = useMemo(() => {
    const changedFields = {
      newValue: {},
      oldValue: {},
    };
    if (status === 'Created') {
      fieldsToCompare.forEach((field) => {
        changedFields.newValue[field] =
          log?.dump?.request?.body?.[field] != '' ? log?.dump?.request?.body?.[field] : '-';
      });
      changedFields.oldValue = {};
    } else if (status === 'Deleted') {
      fieldsToCompare.forEach((field) => {
        changedFields.oldValue[field] =
          log?.dump?.old_object?.[field] != '' ? log?.dump?.old_object?.[field] : '-';
      });
      changedFields.newValue = {};
    } else {
      if (status === 'Activated') {
        changedFields.newValue['status'] = true;
        changedFields.oldValue['status'] = false;
      } else if (status === 'Inactivated') {
        changedFields.newValue['status'] = false;
        changedFields.oldValue['status'] = true;
      } else {
        fieldsToCompare.forEach((field) => {
          if (log?.dump?.new_object?.[field] !== log?.dump?.old_object?.[field]) {
            changedFields.newValue[field] =
              log?.dump?.new_object?.[field] != '' ? log?.dump?.new_object?.[field] : '-';
            changedFields.oldValue[field] =
              log?.dump?.old_object?.[field] != '' ? log?.dump?.old_object?.[field] : '-';
          }
        });
      }
    }
    return changedFields;
  }, [log]);

  return (
    <tr
      className={`${
        i % 2 !== 0 ? 'bg-transparent' : 'bg-white'
      } text-primary-black font-normal text-sm`}
    >
      <td className='px-4 py-[11px]'>{log?.dump?.request?.user_detail?.employee_code}</td>
      <td className='px-4 py-[11px] truncate'>
        {String(
          log?.dump?.request?.user_detail?.first_name +
            ' ' +
            log?.dump?.request?.user_detail?.last_name,
        )}
      </td>
      <td className='px-4 py-[11px]'>{getLoEmployeeCode}</td>
      <td className='px-4 py-[11px] truncate'>{getLoEmployeeName}</td>
      <td className='px-4 py-[11px]'>{moment(log.timestamp).format('DD/MM/YYYY')}</td>
      <td
        className={`${
          status === 'Activated'
            ? 'text-secondary-green'
            : status === 'Deleted'
            ? 'text-light-grey'
            : status === 'Inactivated'
            ? 'text-[#EF8D32]'
            : 'text-primary-black'
        } px-4 py-[11px] font-medium`}
      >
        {status}
      </td>
      <Tooltip
        title={
          Object.keys(compareObjects?.newValue).length ? (
            <pre style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {Object.entries(compareObjects?.newValue).map(
                ([key, value]) => `${key}: ${value != '-' ? `${value}` : `""`}\n`,
              )}
            </pre>
          ) : // <div>
          //   {Object.entries(compareObjects?.newValue).map(([key, value]) => (
          //     <div key={key}>
          //       {key}: {value != '-' ? value : `""`}
          //     </div>
          //   ))}
          // </div>
          null
        }
        placement='top'
        arrow
      >
        <td className='px-4 py-[11px] whitespace-nowrap truncate'>
          {Object.values(compareObjects?.newValue || {}).join(', ')}
        </td>
      </Tooltip>
      <Tooltip
        title={
          Object.keys(compareObjects?.oldValue).length ? (
            <pre style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {Object.entries(compareObjects?.oldValue).map(
                ([key, value]) => `${key}: ${value != '-' ? `${value}` : `""`}\n`,
              )}
            </pre>
          ) : null
        }
        placement='top'
        arrow
      >
        <td className='px-4 py-[11px] whitespace-nowrap truncate text-light-grey'>
          {Object.values(compareObjects?.oldValue || {}).join(', ')}
        </td>
      </Tooltip>
      <td className='px-4 py-[11px]'>{log?.dump?.ip_address}</td>
    </tr>
  );
};

export default Row;
