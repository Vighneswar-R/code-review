import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../context/AuthContextProvider';
import {
  deleteUserMapping,
  getBmAndLoCodes,
  getUserMappingList,
  loBmRelation,
} from '../../../global';
import { Button, DropDown } from '../../../components';
import AdminActionControl from '../../../components/AdminActionControl';
import AdminTable from '../../../components/UserTable/AdminTable';
import AdminPagination from '../../../components/AdminPagination';
import axios from 'axios';
const TableHeaderList = [
  {
    heading: 'ID',
    width: 140,
  },
  {
    heading: 'LO CODE',
    width: 140,
  },
  {
    heading: 'BM CODE',
    width: 140,
  },
  {
    heading: 'ACTION',
    width: 140,
  },
];

function UserAssigning() {
  const { token } = useContext(AuthContext);
  const [selectedBM, setSelectedBM] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOfficers, setSelectedOfficers] = useState([]);
  const [branchManagerCodes, setBranchManagerCodes] = useState([]);
  const [loanOfficerCodes, setLoanOfficerCodes] = useState([]);
  const [showActionControlPopup, setShowActionControlPopup] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const [userActionId, setUserActionId] = useState(null);
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentDisplayedList, setCurrentDisplayedList] = useState([]);
  const [displayedList, setDisplayedList] = useState([]);
  const bmAndLoCodes = async () => {
    const response = await getBmAndLoCodes({
      headers: {
        Authorization: token,
      },
    });
    const { loanOfficerCodes, branchManagerCodes } = response?.data?.data || {};

    setBranchManagerCodes(branchManagerCodes);
    setLoanOfficerCodes(loanOfficerCodes);
    return response;
  };

  const userMappingList = async () => {
    const response = await getUserMappingList({
      headers: {
        Authorization: token,
      },
    });
    const { result } = response?.data || [];
   
    setDisplayedList(result);
  };
  useEffect(() => {
    bmAndLoCodes();
    userMappingList();
  }, []);

  const loList = branchManagerCodes.map((manager) => ({
    value: manager.employee_code,
    label: manager.employee_code,
  }));
  const officerList = loanOfficerCodes.map((officer) => ({
    value: officer.employee_code,
    label: officer.employee_code,
  }));
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bmCode = branchManagerCodes.find(
      (manager) => manager.employee_code === selectedBM,
    )?.employee_code;
    const loCodes = selectedOfficers
      .map((officer) => loanOfficerCodes.find((lo) => lo.employee_code === officer)?.employee_code)
      .filter(Boolean);
    const values = {
      bmCode,
      loCodes,
    };

    await loBmRelation(values, {
      headers: {
        Authorization: token,
      },
    });
    setIsPopupOpen(false);
    onClose();
  };

  const onClose = () => {
    setSelectedOfficers([]);
    setSelectedBM('');
    userMappingList();
    bmAndLoCodes();
  };

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
    onClose();
  };

  const toggleOfficer = (officer) => {
    setSelectedOfficers((prevSelected) =>
      prevSelected.includes(officer)
        ? prevSelected.filter((item) => item !== officer)
        : [...prevSelected, officer],
    );
  };
  const handleDelete = (deleteId) => {
    setShowActionControlPopup(true);
    setUserActionId(deleteId);
  };
  const deleteUser = async (deleteId) => {
    try {
      const response = await deleteUserMapping(deleteId, {
        headers: {
          Authorization: token,
        },
      });
      if (response.status && response.data) {
        console.log(response.data.message);
        setUserStatus(true);
        setShowActionControlPopup(false);
        setUserActionId(null);
        userMappingList();
        bmAndLoCodes();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleDataChange = () => {
    if (userActionId) {
      deleteUser(userActionId);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    setCount(Math.ceil(displayedList.length / 10));
    setCurrentDisplayedList(
      displayedList.filter((_, i) => {
        return i < 10;
      }),
    );
  }, [displayedList]);

  // pagination filter
  const handleChange = (event, value) => {
    setCurrentPage(value);
    // Assuming each page contains a fixed number of items, let's say 10 items per page
    const itemsPerPage = 10;
    // Calculate the start and end count based on the current page
    const startCount = (value - 1) * itemsPerPage;
    const endCount = value * itemsPerPage - 1;
    setCurrentDisplayedList(
      displayedList.filter((log, i) => {
        return i >= startCount && i <= endCount;
      }),
    );
    console.log(displayedList);
  };

  return (
    <>
      <AdminActionControl
        title='Delete Mapping'
        actionMsg='Yes, Delete'
        subtitle={
          userStatus
            ? userStatus?.value === 'active'
              ? 'Would you like to activate this user?'
              : 'Would you like to inactivate this user?'
            : userActionId?.value === 'Edit'
            ? 'Would you like to save the changes?'
            : 'Would you like to delete this Mapping?'
        }
        showpopup={showActionControlPopup}
        setShowPopUp={setShowActionControlPopup}
        handleActionClick={handleDataChange}
        handleResetAction={userStatus ? () => setUserStatus(null) : () => {}}
      />
      <div className='p-3 border-b bg-white'>
        <Button
          inputClasses='h-10 md:!py-2.5 px-2 ml-auto md:!text-base'
          primary
          onClick={togglePopup}
        >
          Add New One
        </Button>
      </div>
      <div className='px-6 py-4 bg-medium-grey grow overflow-y-auto overflow-x-hidden false'>
        <div className='overflow-x-auto'>
          {displayedList.length && (
            <AdminTable TableHeaderList={TableHeaderList}>
              {currentDisplayedList.map(({ id ,LO,BM}, i) => {
                return (
                  <tr
                    key={i}
                    className='bg-white text-primary-black font-normal text-sm hover:bg-gray-50'
                  >
                    <td className='p-4 text-gray-700'>{id}</td>
                    <td className='p-4 text-gray-700'>{LO}</td>
                    <td className='p-4 text-gray-700'>{BM}</td>
                    <td className='p-4 text-gray-700'>
                      <button
                        className='text-gray-600 hover:text-gray-900 focus:outline-none'
                        onClick={() => handleDelete(id)}
                      >
                        <svg
                          fill='rgb(114 115 118)'
                          height='20px'
                          width='20px'
                          version='1.1'
                          id='Layer_1'
                          xmlns='http://www.w3.org/2000/svg'
                          xmlnsXlink='http://www.w3.org/1999/xlink'
                          viewBox='0 0 330 330'
                          xmlSpace='preserve'
                        >
                          <g id='SVGRepo_bgCarrier' strokeWidth='0'></g>
                          <g
                            id='SVGRepo_tracerCarrier'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          ></g>
                          <g id='SVGRepo_iconCarrier'>
                            <g id='XMLID_6_'>
                              <g id='XMLID_11_'>
                                <path d='M240,121.076H30V275c0,8.284,6.716,15,15,15h60h37.596c19.246,24.348,49.031,40,82.404,40c57.897,0,105-47.103,105-105 C330,172.195,290.816,128.377,240,121.076z M225,300c-41.355,0-75-33.645-75-75s33.645-75,75-75s75,33.645,75,75 S266.355,300,225,300z'></path>
                              </g>
                              <g id='XMLID_18_'>
                                <path d='M240,90h15c8.284,0,15-6.716,15-15s-6.716-15-15-15h-30h-15V15c0-8.284-6.716-15-15-15H75c-8.284,0-15,6.716-15,15v45H45 H15C6.716,60,0,66.716,0,75s6.716,15,15,15h15H240z M90,30h90v30h-15h-60H90V30z'></path>
                              </g>
                              <g id='XMLID_23_'>
                                <path d='M256.819,193.181c-5.857-5.858-15.355-5.858-21.213,0L225,203.787l-10.606-10.606c-5.857-5.858-15.355-5.858-21.213,0 c-5.858,5.858-5.858,15.355,0,21.213L203.787,225l-10.606,10.606c-5.858,5.858-5.858,15.355,0,21.213 c2.929,2.929,6.768,4.394,10.606,4.394c3.839,0,7.678-1.465,10.607-4.394L225,246.213l10.606,10.606 c2.929,2.929,6.768,4.394,10.607,4.394c3.839,0,7.678-1.465,10.606-4.394c5.858-5.858,5.858-15.355,0-21.213L246.213,225 l10.606-10.606C262.678,208.535,262.678,199.039,256.819,193.181z'></path>
                              </g>
                            </g>
                          </g>
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </AdminTable>
          )}
          <AdminPagination
            count={count}
            currentPage={currentPage}
            handlePageChangeCb={handleChange}
            inputClasses=' flex justify-end mt-3'
          />
          {/* <table className='min-w-full bg-white'>
            <thead className='bg-gray-100 border-b'>
              <tr>
                <th className='text-dark-grey font-medium text-xs leading-5 p-4 bg-white text-left'>
                  ID
                </th>
                <th className='text-dark-grey font-medium text-xs leading-5 p-4 bg-white text-left'>
                  LO CODE
                </th>
                <th className='text-dark-grey font-medium text-xs leading-5 p-4 bg-white text-left'>
                  BM CODE
                </th>
                <th className='text-dark-grey font-medium text-xs leading-5 p-4 bg-white text-left'>
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedList.map(({ Id, LOCode, BMCode }, index) => (
                <tr
                  key={index}
                  className='bg-white text-primary-black font-normal text-sm hover:bg-gray-50'
                >
                  <td className='p-4 text-gray-700'>{Id}</td>
                  <td className='p-4 text-gray-700'>{LOCode}</td>
                  <td className='p-4 text-gray-700'>{BMCode}</td>
                  <td className='p-4'>
                    <button className='text-gray-600 hover:text-gray-900 focus:outline-none' onClick={()=>handleDelete(Id)}>
                      <svg
                        fill='rgb(114 115 118)'
                        height='20px'
                        width='20px'
                        version='1.1'
                        id='Layer_1'
                        xmlns='http://www.w3.org/2000/svg'
                        xmlnsXlink='http://www.w3.org/1999/xlink'
                        viewBox='0 0 330 330'
                        xmlSpace='preserve'
                      >
                        <g id='SVGRepo_bgCarrier' strokeWidth='0'></g>
                        <g
                          id='SVGRepo_tracerCarrier'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        ></g>
                        <g id='SVGRepo_iconCarrier'>
                          <g id='XMLID_6_'>
                            <g id='XMLID_11_'>
                              <path d='M240,121.076H30V275c0,8.284,6.716,15,15,15h60h37.596c19.246,24.348,49.031,40,82.404,40c57.897,0,105-47.103,105-105 C330,172.195,290.816,128.377,240,121.076z M225,300c-41.355,0-75-33.645-75-75s33.645-75,75-75s75,33.645,75,75 S266.355,300,225,300z'></path>
                            </g>
                            <g id='XMLID_18_'>
                              <path d='M240,90h15c8.284,0,15-6.716,15-15s-6.716-15-15-15h-30h-15V15c0-8.284-6.716-15-15-15H75c-8.284,0-15,6.716-15,15v45H45 H15C6.716,60,0,66.716,0,75s6.716,15,15,15h15H240z M90,30h90v30h-15h-60H90V30z'></path>
                            </g>
                            <g id='XMLID_23_'>
                              <path d='M256.819,193.181c-5.857-5.858-15.355-5.858-21.213,0L225,203.787l-10.606-10.606c-5.857-5.858-15.355-5.858-21.213,0 c-5.858,5.858-5.858,15.355,0,21.213L203.787,225l-10.606,10.606c-5.858,5.858-5.858,15.355,0,21.213 c2.929,2.929,6.768,4.394,10.606,4.394c3.839,0,7.678-1.465,10.607-4.394L225,246.213l10.606,10.606 c2.929,2.929,6.768,4.394,10.607,4.394c3.839,0,7.678-1.465,10.606-4.394c5.858-5.858,5.858-15.355,0-21.213L246.213,225 l10.606-10.606C262.678,208.535,262.678,199.039,256.819,193.181z'></path>
                            </g>
                          </g>
                        </g>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table> */}
        </div>

        {isPopupOpen && (
          <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex z-50 justify-center items-center'>
            <div className='bg-white p-6 rounded shadow-lg relative border w-full max-w-3xl mx-4'>
              <div className='flex mb-4 justify-between'>
                <h3 className='text-lg font-bold'>Mapping</h3>
                <button className='text-black' onClick={togglePopup}>
                  <svg
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M5.00098 5L19 18.9991'
                      stroke='#373435'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    ></path>
                    <path
                      d='M5.00009 18.9991L18.9991 5'
                      stroke='#373435'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    ></path>
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <DropDown
                  name='Branch Manager'
                  options={loList}
                  placeholder='Branch Manager'
                  onChange={(selection) => setSelectedBM(selection)}
                  disabled={false}
                  defaultSelected={selectedBM}
                  className='flex-grow'
                />
                <div className='relative w-full'>
                  <div
                    className='border flex justify-between border-gray-300 text-black px-5 py-3 text-sm rounded-lg cursor-pointer'
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    {selectedOfficers.length > 0 ? selectedOfficers.join(', ') : 'Loan Officer'}
                    <svg
                      width='24'
                      height='24'
                      viewBox='0 0 24 24'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M6 9L12 15L18 9'
                        stroke='#373435'
                        stroke-width='1.5'
                        stroke-linecap='round'
                        stroke-linejoin='round'
                      ></path>
                    </svg>
                  </div>
                  {isOpen && (
                    <div
                      style={{ maxHeight: '170px' }}
                      className='rounded-lg bg-white shadow-secondary p-2 text-sm  absolute top-full w-full overflow-y-auto z-20 border border-stroke'
                    >
                      {officerList.map((officer) => (
                        <div
                          key={officer.value}
                          className={`px-3 py-3  cursor-pointer border-b border-gray-300 mx-2 ${
                            selectedOfficers.includes(officer.value) && 'text-red-600'
                          }`}
                          onClick={() => {
                            toggleOfficer(officer.value);
                            setIsOpen(false);
                          }}
                        >
                          <div className='flex justify-between'>
                            <p>{officer.label}</p>
                            {selectedOfficers.includes(officer.value) && (
                              <svg
                                width='24'
                                height='24'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                              >
                                <path
                                  d='M20 6L9 17L4 12'
                                  stroke='#E33439'
                                  stroke-width='2'
                                  stroke-linecap='round'
                                  stroke-linejoin='round'
                                ></path>
                              </svg>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type='submit'
                  className='mt-4 bg-red-500 text-white py-2 px-4 rounded w-full'
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default UserAssigning;
