import { Outlet } from 'react-router-dom';
import LeadContextProvider from './LeadContextProvider';
import AuthContextProvider from './AuthContextProvider';

const ContextLayout = () => {
  return (
    <AuthContextProvider>
      <LeadContextProvider>
        <Outlet />
      </LeadContextProvider>
    </AuthContextProvider>
  );
};

export default ContextLayout;
