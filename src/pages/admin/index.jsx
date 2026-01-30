import { Routes, Route } from 'react-router-dom';
import CaseAssigning from './case-assignment';
import UserManagement from './user-management';
import StepConfiguration from './step-configuration';
import MasterManagement from './master-management';
import SideBar from '../../components/Sidebar';
import History from './user-management/history';
import ColateralStatePin from './ColateralStatePin';
import BulkUpload from './bulk-upload';
import StatePin from './state-pin';
import BranchMaster from './branch-master';
import UserAssigning from './user-assignment';
import MaintenanceConfiguration from './Maintenance-configuration'
import { AuthContext } from '../../context/AuthContextProvider';
import { useContext,useState } from 'react';
import { Navigate } from 'react-router-dom';
import UploadIncentive from './upload-incentive';
import ContestUpload from './contest-upload';

const AdminRoutes = () => {
  const{token} = useContext(AuthContext);

  const[role,setRole] = useState(JSON.parse(sessionStorage.getItem('user'))?.user?.role)

  return (
    <div className='flex h-screen w-screen'>
      <div className='w-[252px] shrink-0'>
        <SideBar />
      </div>
      <div className='flex flex-col grow overflow-x-hidden'>  
        <Routes>
          <Route index element={<UserManagement />}></Route>   
          <Route path='/user-management' element={<UserManagement />}></Route>
          <Route path='/user-management/history' element={token?<History />:<Navigate to = '/admin/user-management'/>}></Route>
          <Route path='/master-management' element={token?<MasterManagement />:<Navigate to = '/admin/user-management'/>}></Route>
          <Route path='/step-configuration' element={token?<StepConfiguration />:<Navigate to = '/admin/user-management'/>}></Route>
          <Route path='/case-assignment' element={token?<CaseAssigning />:<Navigate to = '/admin/user-management'/>}></Route>
          <Route path='/user-assignment' element={token?<UserAssigning />:<Navigate to = '/admin/user-management'/>}></Route>
          <Route path='/ColateralStatePin' element={token?<ColateralStatePin />:<Navigate to = '/admin/user-management'/>}></Route>
          <Route path='/bulk-upload' element={token?<BulkUpload />:<Navigate to = '/admin/user-management'/>}></Route>
          <Route path = '/Maintenance-configuration' element={token?<MaintenanceConfiguration />:<Navigate to = '/admin/user-management'/>}></Route>
         
          <Route
            path=
            '/state-pin'
            element=
            {token?<StatePin />:<Navigate to = '/admin/user-management'/>}></Route>
          <Route
            path=
            '/branch-master'
            element=
            {token?<BranchMaster />:<Navigate to = '/admin/user-management'/>}></Route>
            <Route
            path=
            '/upload-incentive'
            element=
            {token?<UploadIncentive />:<Navigate to = '/admin/user-management'/>}></Route>
             <Route
            path=
            '/contest-upload'
            element=
            {token?<ContestUpload />:<Navigate to = '/admin/user-management'/>}></Route>
        </Routes>
      </div>
    </div>
  );
};

export default AdminRoutes;