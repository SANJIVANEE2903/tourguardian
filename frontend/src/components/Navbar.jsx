import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FakeCallModal from './FakeCallModal';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/trips', label: 'Trips' },
  { to: '/map', label: 'Live Map' },
  { to: '/risk', label: 'Risk Dashboard' },
  { to: '/contacts', label: 'Emergency Contacts' },
  { to: '/alerts', label: 'Alerts' }
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showFakeCall, setShowFakeCall] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="font-bold text-lg text-brand-600 flex items-center gap-2">
            🛡️ TourGuardian
          </Link>
          <nav className="hidden md:flex gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === l.to ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {l.label}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <>
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === '/admin' ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Command Center
                </Link>
                <Link
                  to="/geofences"
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === '/geofences' ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Geofences
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {/* Decoy Fake Call Trigger Button */}
          <button
            onClick={() => setShowFakeCall(true)}
            className="p-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1 transition border border-slate-200"
            title="Trigger Decoy Fake Call to exit uncomfortable situations"
          >
            <span>📞</span>
            <span className="hidden sm:inline">Decoy Call</span>
          </button>

          <span className="text-sm text-slate-500 hidden sm:inline">Hi, {user?.name}</span>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="btn-secondary text-sm"
          >
            Logout
          </button>
        </div>
      </div>
      <nav className="md:hidden flex gap-1 px-4 pb-2 overflow-x-auto">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="text-xs whitespace-nowrap px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600">
            {l.label}
          </Link>
        ))}
      </nav>

      {/* Decoy Call Modal Component */}
      <FakeCallModal isOpen={showFakeCall} onClose={() => setShowFakeCall(false)} />
    </header>
  );
}

