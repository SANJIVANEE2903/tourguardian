import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import TripPlanner from './pages/TripPlanner'
import MapView from './pages/MapView'
import EmergencyContacts from './pages/EmergencyContacts'
import SOSPage from './pages/SOSPage'
import IncidentReport from './pages/IncidentReport'
import AdminDashboard from './pages/AdminDashboard'
import PrivateRoute from './components/PrivateRoute'

function App() {
  const { user } = useSelector((state: any) => state.auth)

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trip-planner" element={<TripPlanner />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/emergency-contacts" element={<EmergencyContacts />} />
          <Route path="/sos" element={<SOSPage />} />
          <Route path="/incident-report" element={<IncidentReport />} />
          {user?.role === 'ADMIN' && (
            <Route path="/admin" element={<AdminDashboard />} />
          )}
        </Route>
      </Routes>
    </Router>
  )
}

export default App
