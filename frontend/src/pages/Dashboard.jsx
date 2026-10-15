import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CheckInWidget from '../components/CheckInWidget';

export default function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [risks, setRisks] = useState([]);

  useEffect(() => {
    api.get('/trips').then((r) => setTrips(r.data)).catch(() => {});
    api.get('/notifications').then((r) => setAlerts(r.data)).catch(() => {});
    api.get('/risk/history').then((r) => setRisks(r.data)).catch(() => {});
  }, []);

  const upcoming = trips.find((t) => t.status === 'planned' || t.status === 'ongoing');
  const latestRisk = risks[0];
  const unread = alerts.filter((a) => !a.is_read).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500">Here's your travel safety overview.</p>
      </div>

      <CheckInWidget />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-slate-500">Upcoming Trip</p>
          <p className="text-lg font-semibold mt-1">{upcoming ? upcoming.destination : 'None planned'}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Current Risk Level</p>
          <p className={`text-lg font-semibold mt-1 capitalize ${
            latestRisk?.risk_level === 'high' ? 'text-danger-500' : latestRisk?.risk_level === 'medium' ? 'text-amber-500' : 'text-emerald-600'
          }`}>
            {latestRisk ? latestRisk.risk_level : 'Not assessed'}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Unread Alerts</p>
          <p className="text-lg font-semibold mt-1">{unread}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Total Trips</p>
          <p className="text-lg font-semibold mt-1">{trips.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold mb-3">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            <Link to="/trips" className="btn-secondary text-sm">Plan a Trip</Link>
            <Link to="/risk" className="btn-secondary text-sm">Check Risk</Link>
            <Link to="/contacts" className="btn-secondary text-sm">Manage Contacts</Link>
            <Link to="/map" className="btn-secondary text-sm">Live Map</Link>
          </div>
          <p className="text-xs text-slate-400 mt-4">Use the red SOS button anytime you need emergency help — it shares your live location instantly.</p>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3">Recent Trips</h2>
          {trips.length === 0 && <p className="text-sm text-slate-400">No trips yet. Start planning one!</p>}
          <ul className="space-y-2">
            {trips.slice(0, 4).map((t) => (
              <li key={t.id} className="flex justify-between text-sm border-b border-slate-100 pb-2">
                <span>{t.title} — {t.destination}</span>
                <span className="capitalize text-slate-400">{t.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
