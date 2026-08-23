import React from 'react'
import Navbar from '../components/Navbar'

const AdminDashboard: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="container">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor and manage the platform...</p>
      </div>
    </>
  )
}

export default AdminDashboard
