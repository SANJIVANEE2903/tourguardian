import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import SOSButton from './components/SOSButton';
import Chatbot from './components/Chatbot';
import BroadcastBanner from './components/BroadcastBanner';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TripPlanning from './pages/TripPlanning';
import LiveMap from './pages/LiveMap';
import RiskDashboard from './pages/RiskDashboard';
import EmergencyContacts from './pages/EmergencyContacts';
import Alerts from './pages/Alerts';
import AdminDashboard from './pages/AdminDashboard';
import GeofenceManager from './pages/GeofenceManager';

function AppLayout({ children }) {
  return (
    <div className="min-h-screen">
      <BroadcastBanner />
      <Navbar />
      {children}
      <SOSButton />
      <Chatbot />
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
      } />
      <Route path="/trips" element={
        <ProtectedRoute><AppLayout><TripPlanning /></AppLayout></ProtectedRoute>
      } />
      <Route path="/map" element={
        <ProtectedRoute><AppLayout><LiveMap /></AppLayout></ProtectedRoute>
      } />
      <Route path="/risk" element={
        <ProtectedRoute><AppLayout><RiskDashboard /></AppLayout></ProtectedRoute>
      } />
      <Route path="/contacts" element={
        <ProtectedRoute><AppLayout><EmergencyContacts /></AppLayout></ProtectedRoute>
      } />
      <Route path="/alerts" element={
        <ProtectedRoute><AppLayout><Alerts /></AppLayout></ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute adminOnly><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>
      } />
      <Route path="/geofences" element={
        <ProtectedRoute adminOnly><AppLayout><GeofenceManager /></AppLayout></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
    </Routes>
  );
}
