import React from 'react'
import Navbar from '../components/Navbar'

const IncidentReport: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="container">
        <h1 className="text-3xl font-bold mb-8">Report Incident</h1>
        <p className="text-gray-600">Report unsafe incidents and locations...</p>
      </div>
    </>
  )
}

export default IncidentReport
