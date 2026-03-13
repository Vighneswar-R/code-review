import React, { useContext, useState } from 'react';
import CaseAssignment from '../../assets/icons/caseAssignment';
import indiaShelterLogo from '../../assets/logo.svg';
import SideBarLogout from '../../assets/icons/sideBarLogout';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContextProvider';

const tabs = [
  {
    icon: (isActive) => <CaseAssignment isActive={isActive} />,
    label: 'Incentive Upload',
    link: '/admin-product/upload-incentive',
  },
  {
    icon: (isActive) => <CaseAssignment isActive={isActive} />,
    label: 'Contest Upload',
    link: '/admin-product/contest-upload',
  },
];
function AdminProductSidebar() {
  const [activeTab, setActiveTab] = useState('Incentive Upload');
  const { token } = useContext(AuthContext);
  const handleLogout = async () => {
    try {
      await logout(
        {
          status: 'no',
          logout_via: 'New Login',
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );

      window.location.replace('/');
    } catch (err) {
      window.location.replace('/');
      console.log("Something went wrong while logging out the user");
    }
  };

  return (
    <nav className='h-screen flex flex-col w-full shrink-0 border-r border-lighter-grey'>
      <div className='px-6 py-4'>
        <img src={indiaShelterLogo} alt='India Shelter' style={{ height: '36px' }} />
        <p className='mt-2 text-primary-red text-sm'>Admin Product</p>
      </div>
      <div className='px-6'>
        <div className='h-px bg-lighter-grey'></div>
      </div>
      <div className='py-4 grow text-light-grey'>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.label;
          return (
            <Link to={tab.link} key={tab.label}>
              <button
                key={tab.label}
                className='flex py-[14px] mb-1 items-center w-full'
                onClick={() => setActiveTab(tab.label)}
              >
                <div className={`w-1 rounded-sm ${isActive && 'bg-primary-red'} h-6 mr-6`}></div>
                {tab.icon(isActive)}
                <p className={`${isActive && 'text-primary-red'} ml-2 text-sm`}>{tab.label}</p>
              </button>
            </Link>
          );
        })}
      </div>
      <div className='px-6'>
        <div className='h-px bg-lighter-grey'></div>
      </div>
      <div className='mx-7 my-[30px] mr-auto flex items-center cursor-pointer'>
        <SideBarLogout />
        <p className='ml-2 text-light-grey text-sm' onClick={handleLogout}>
          Log out
        </p>
      </div>
    </nav>
  );
}

export default AdminProductSidebar;