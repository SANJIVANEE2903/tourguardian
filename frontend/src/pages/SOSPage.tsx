import React from 'react'
import Navbar from '../components/Navbar'

const SOSPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="container">
        <div className="flex flex-col items-center justify-center min-h-96">
          <div className="sos-button">
            SOS
          </div>
          <p className="text-xl font-semibold mt-8">Emergency Assistance</p>
          <p className="text-gray-600">Tap the SOS button to request emergency help</p>
        </div>
      </div>
    </>
  )
}

export default SOSPage
