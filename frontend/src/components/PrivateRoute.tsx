import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

const PrivateRoute: React.FC = () => {
  const { user, token } = useSelector((state: any) => state.auth)

  return token && user ? <Outlet /> : <Navigate to="/login" />
}

export default PrivateRoute
