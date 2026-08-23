import React from 'react'
import Navbar from '../components/Navbar'

const TripPlanner: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="container">
        <h1 className="text-3xl font-bold mb-8">Trip Planner</h1>
        <p className="text-gray-600">Plan your trips with AI-powered recommendations...</p>
      </div>
    </>
  )
}

export default TripPlanner
