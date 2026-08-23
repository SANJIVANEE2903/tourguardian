import React from 'react'
import Navbar from '../components/Navbar'

const MapView: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="container">
        <h1 className="text-3xl font-bold mb-8">Map View</h1>
        <p className="text-gray-600">View your location and nearby services...</p>
      </div>
    </>
  )
}

export default MapView
