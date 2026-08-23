import React from 'react'
import Navbar from '../components/Navbar'

const EmergencyContacts: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="container">
        <h1 className="text-3xl font-bold mb-8">Emergency Contacts</h1>
        <p className="text-gray-600">Manage your trusted emergency contacts...</p>
      </div>
    </>
  )
}

export default EmergencyContacts
