import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { AlertCircle, MapPin, Users, AlertTriangle } from 'lucide-react'

const Dashboard: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Trips</p>
                <p className="text-3xl font-bold text-blue-600">2</p>
              </div>
              <MapPin className="w-12 h-12 text-blue-600 opacity-50" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Safety Score</p>
                <p className="text-3xl font-bold text-green-600">85/100</p>
              </div>
              <AlertCircle className="w-12 h-12 text-green-600 opacity-50" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Alerts</p>
                <p className="text-3xl font-bold text-yellow-600">3</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-yellow-600 opacity-50" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Trusted Contacts</p>
                <p className="text-3xl font-bold text-purple-600">4</p>
              </div>
              <Users className="w-12 h-12 text-purple-600 opacity-50" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/trip-planner"
                  className="p-4 border border-blue-300 rounded-lg hover:bg-blue-50 transition"
                >
                  <h3 className="font-semibold text-blue-600">Plan a Trip</h3>
                  <p className="text-sm text-gray-600">Create a new trip with AI recommendations</p>
                </Link>
                <Link
                  to="/sos"
                  className="p-4 border border-red-300 rounded-lg hover:bg-red-50 transition"
                >
                  <h3 className="font-semibold text-red-600">SOS</h3>
                  <p className="text-sm text-gray-600">Emergency assistance</p>
                </Link>
                <Link
                  to="/map"
                  className="p-4 border border-green-300 rounded-lg hover:bg-green-50 transition"
                >
                  <h3 className="font-semibold text-green-600">View Map</h3>
                  <p className="text-sm text-gray-600">See nearby locations</p>
                </Link>
                <Link
                  to="/emergency-contacts"
                  className="p-4 border border-purple-300 rounded-lg hover:bg-purple-50 transition"
                >
                  <h3 className="font-semibold text-purple-600">Trusted Contacts</h3>
                  <p className="text-sm text-gray-600">Manage emergency contacts</p>
                </Link>
              </div>
            </div>
          </div>

          <div>
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="pb-3 border-b">
                  <p className="font-semibold text-sm">Trip Started</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
                <div className="pb-3 border-b">
                  <p className="font-semibold text-sm">Location Shared</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
                <div>
                  <p className="font-semibold text-sm">Profile Updated</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard
