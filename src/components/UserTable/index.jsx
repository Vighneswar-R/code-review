import { useEffect, useState } from 'react';
import NoUsersOnSearchIcon from '../../assets/icons/NoUsersOnSearch';
import UserRow from '../UserRow';

const TableHeaderList = [
  'EMPLOYEE CODE',
  'EMPLOYEE NAME',
  'BRANCH',
  'ROLE',
  'MOBILE NUMBER',
  'LAST MODIFIED',
  'STATUS',
  'ACTION',
];

const UserTable = ({ userslist }) => {
  
  const [adminStatusPopupId, setAdminStatusPopupId] = useState(null);
  const [adminActionPopupId, setAdminActionPopupId] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      let target = event.target.getAttribute('data-ispopup') === 'popup';
      let closestTarget = event.target.closest('button[data-ispopup="popup"]');
      if (!target && !closestTarget) {
        setAdminStatusPopupId(null);
        setAdminActionPopupId(null);
        return;
      }
    };

    if (adminActionPopupId !== null || adminStatusPopupId !== null) {
      document.body.addEventListener('click', handleClickOutside, true);
    } else {
      document.body.removeEventListener('click', handleClickOutside, true);
    }
    return () => document.body.removeEventListener('click', handleClickOutside, true);
  }, [adminActionPopupId, adminStatusPopupId]);

  const handleAdminStatusPopupId = (index) => {
    setAdminActionPopupId(null);
    if (adminStatusPopupId === index) {
      setAdminStatusPopupId(null);
    } else {
      setAdminStatusPopupId(index);
    }
  };

  const handleAdminActionPopupId = (index) => {
    setAdminStatusPopupId(null);
    if (adminActionPopupId === index) {
      setAdminActionPopupId(null);
    } else {
      setAdminActionPopupId(index);
    }
  };

  return (
    <div className='custom-table'>
      {/* Table height h-[570px] */}
      {!userslist.length ? (
        <div className='flex justify-center items-center h-full'>
          <NoUsersOnSearchIcon />
        </div>
      ) : (
        <table className='w-full table-fixed'>
          <thead>
            <tr>
              {TableHeaderList.map((heading, i) => (
                <th
                  className={`
                  ${heading === 'EMPLOYEE NAME' && 'w-[230px]'} ${
                    heading === 'ACTION' && 'w-[82px]'
                  } 
                  text-dark-grey font-medium text-xs leading-5 p-4 bg-white text-left`}
                  key={i}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {userslist.map((user, i) => (
              <UserRow
                user={user}
                key={user.id}
                i={i}
                isAdminStatusPopupOpen={adminStatusPopupId === i}
                handleAdminStatusPopupId={handleAdminStatusPopupId}
                setAdminStatusPopupId={setAdminStatusPopupId}
                isAdminActionPopupId={adminActionPopupId === i}
                handleAdminActionPopupId={handleAdminActionPopupId}
                setAdminActionPopupId={setAdminActionPopupId}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default UserTable;
