import React, { useContext } from 'react'
import AdminProductSidebar from '../../components/Sidebar/AdminProductSidebar'
import UploadIncentive from '../admin/upload-incentive'
import ContestUpload from '../admin/contest-upload'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContextProvider'

function AdminProduct() {
  const { token } = useContext(AuthContext)

  return (
    <div className='flex h-screen w-screen'>
      <div className='w-[252px] shrink-0'>
        <AdminProductSidebar />
      </div>

      <div className='flex flex-col grow overflow-x-hidden'>
        <Routes>
          <Route
            index
            element={token ? <UploadIncentive /> : <Navigate to="/admin-product/upload-incentive" />}
          />

          <Route
            path="/upload-incentive"
            element={token ? <UploadIncentive /> : <Navigate to="/admin-product/upload-incentive" />}
          />

          <Route
            path="/contest-upload"
            element={token ? <ContestUpload /> : <Navigate to="/admin-product/upload-incentive" />}
          />
          <Route
            path="*"
            element={<Navigate to="/admin-product" />}
          />

        </Routes>
      </div>
    </div>
  )
}

export default AdminProduct
