import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { getSocket } from '../socket';
import MapView from '../components/MapView';
import RiskHeatmapView from '../components/RiskHeatmapView';


export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [sos, setSos] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [overdueCheckins, setOverdueCheckins] = useState([]);
  const [liveLocations, setLiveLocations] = useState({});
  const [riskLogs, setRiskLogs] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [tab, setTab] = useState('overview');

  const [banner, setBanner] = useState(null);

  // Dispatch modal state
  const [selectedSOS, setSelectedSOS] = useState(null);
  const [assignedTo, setAssignedTo] = useState('');
  const [eta, setEta] = useState('15');
  const [notes, setNotes] = useState('');
  const [dispatchMsg, setDispatchMsg] = useState('');

  // Broadcast modal state
  const [bTitle, setBTitle] = useState('');
  const [bMessage, setBMessage] = useState('');
  const [bSeverity, setBSeverity] = useState('warning');
  const [bMsg, setBMsg] = useState('');

  function loadData() {
    api.get('/admin/analytics').then((r) => setAnalytics(r.data)).catch(() => {});
    api.get('/admin/users').then((r) => setUsers(r.data)).catch(() => {});
    api.get('/admin/trips').then((r) => setTrips(r.data)).catch(() => {});
    api.get('/admin/sos-alerts').then((r) => setSos(r.data)).catch(() => {});
    api.get('/geofences').then((r) => setGeofences(r.data)).catch(() => {});
    api.get('/checkins/overdue').then((r) => setOverdueCheckins(r.data)).catch(() => {});
    api.get('/admin/locations').then((r) => {
      const locMap = {};
      (r.data || []).forEach((loc) => {
        locMap[loc.user_id] = {
          userId: loc.user_id,
          name: loc.name,
          latitude: Number(loc.latitude),
          longitude: Number(loc.longitude),
          recorded_at: loc.recorded_at
        };
      });
      setLiveLocations(locMap);
    }).catch(() => {});
    api.get('/admin/risk-heatmap').then((r) => setRiskLogs(r.data)).catch(() => {});
    api.get('/admin/hazards').then((r) => setHazards(r.data)).catch(() => {});
  }



  useEffect(() => {
    loadData();
  }, []);

  // --- Real-time socket updates ---
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function handleNewSOS(alert) {
      setSos((prev) => [alert, ...prev]);
      setBanner(`🚨 NEW EMERGENCY SOS from ${alert.user_name || 'a traveler'}!`);
      setAnalytics((a) => a ? { ...a, activeSOS: a.activeSOS + 1 } : a);
    }

    function handleDispatchUpdate(alert) {
      setSos((prev) => prev.map((s) => (s.id === alert.id ? alert : s)));
    }

    function handleResolvedSOS({ id }) {
      setSos((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'resolved' } : s)));
    }

    function handleLocationUpdate(loc) {
      setLiveLocations((prev) => ({ ...prev, [loc.userId]: loc }));
    }

    function handleGeofenceBreach(alert) {
      setBanner(`⚠️ GEOFENCE WARNING: ${alert.userName} entered ${alert.geofenceType} zone "${alert.geofenceName}"!`);
    }

    socket.on('sos:new', handleNewSOS);
    socket.on('sos:dispatch_update', handleDispatchUpdate);
    socket.on('sos:resolved', handleResolvedSOS);
    socket.on('location:update', handleLocationUpdate);
    socket.on('geofence:breach', handleGeofenceBreach);

    return () => {
      socket.off('sos:new', handleNewSOS);
      socket.off('sos:dispatch_update', handleDispatchUpdate);
      socket.off('sos:resolved', handleResolvedSOS);
      socket.off('location:update', handleLocationUpdate);
      socket.off('geofence:breach', handleGeofenceBreach);
    };
  }, []);

  async function handleSendBroadcast(e) {
    e.preventDefault();
    setBMsg('');
    try {
      await api.post('/broadcasts', { title: bTitle, message: bMessage, severity: bSeverity });
      setBMsg('📢 Emergency Broadcast sent to all active users!');
      setBTitle(''); setBMessage('');
    } catch (err) {
      setBMsg('Failed to send broadcast.');
    }
  }

  async function handleSaveDispatch(e) {
    e.preventDefault();
    if (!selectedSOS) return;
    setDispatchMsg('');
    try {
      await api.put(`/sos/${selectedSOS.id}/dispatch`, {
        assigned_to: assignedTo,
        eta_minutes: parseInt(eta, 10),
        responder_notes: notes,
        status: 'dispatched'
      });
      setDispatchMsg('Dispatch team updated!');
      setSelectedSOS(null);
      loadData();
    } catch (err) {
      setDispatchMsg('Failed to update dispatch.');
    }
  }

  async function handleDeleteHazard(id) {
    try {
      await api.delete(`/admin/hazards/${id}`);
      setHazards((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error('Failed to delete hazard report');
    }
  }


  const tabs = ['overview', 'sos', 'live', 'heatmap', 'hazards', 'broadcast', 'overdue', 'users', 'trips'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Enterprise Command Center</h1>
          <p className="text-sm text-slate-500">Real-Time Incident Dispatch & Traveler Risk Monitoring</p>
        </div>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
          System Operational
        </span>
      </div>

      {banner && (
        <div className="bg-rose-600 text-white px-4 py-3 rounded-xl font-medium shadow-lg flex justify-between items-center animate-pulse">
          <span>{banner}</span>
          <button onClick={() => setBanner(null)} className="text-xs bg-white/20 px-2 py-1 rounded">Dismiss</button>
        </div>
      )}

      <div className="flex gap-2 flex-wrap border-b border-slate-200 pb-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition ${
              tab === t ? 'bg-brand-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t === 'live' ? 'Live Map' : t === 'sos' ? 'SOS Dispatch' : t === 'heatmap' ? 'Risk Heatmap 🔥' : t === 'hazards' ? `Hazards (${hazards.length}) ⚠️` : t === 'broadcast' ? 'Mass Broadcast' : t === 'overdue' ? `Overdue (${overdueCheckins.length})` : t}
          </button>
        ))}
      </div>

      {tab === 'overview' && analytics && (

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card"><p className="text-sm text-slate-500">Total Tourists</p><p className="text-2xl font-bold text-slate-800">{analytics.totalUsers}</p></div>
          <div className="card"><p className="text-sm text-slate-500">Total Trips</p><p className="text-2xl font-bold text-slate-800">{analytics.totalTrips}</p></div>
          <div className="card"><p className="text-sm text-slate-500">Active SOS Alerts</p><p className="text-2xl font-bold text-rose-600">{analytics.activeSOS}</p></div>
          <div className="card"><p className="text-sm text-slate-500">High-Risk Logs</p><p className="text-2xl font-bold text-amber-500">{analytics.highRiskLogs}</p></div>
          <div className="card md:col-span-4 space-y-2">
            <p className="text-sm font-semibold text-slate-700">System Geofence Status</p>
            <p className="text-xs text-slate-500">{geofences.length} active spatial risk perimeters monitored continuously.</p>
          </div>
        </div>
      )}

      {tab === 'broadcast' && (
        <div className="card max-w-2xl space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>📢</span> Trigger Mass Emergency Broadcast
          </h2>
          <p className="text-xs text-slate-500">
            Pushes an instant top-level alert banner to all connected travelers across all devices.
          </p>
          <form onSubmit={handleSendBroadcast} className="space-y-3 text-sm">
            <div>
              <label className="label">Alert Title</label>
              <input className="input" required value={bTitle} onChange={(e) => setBTitle(e.target.value)} placeholder="e.g. Severe Flash Flood Warning" />
            </div>
            <div>
              <label className="label">Alert Severity</label>
              <select className="input" value={bSeverity} onChange={(e) => setBSeverity(e.target.value)}>
                <option value="critical">🔴 Critical Evacuation / Danger</option>
                <option value="warning">🟡 Weather / Security Caution</option>
                <option value="info">🔵 Information Bulletin</option>
              </select>
            </div>
            <div>
              <label className="label">Broadcast Message</label>
              <textarea className="input" rows="3" required value={bMessage} onChange={(e) => setBMessage(e.target.value)} placeholder="Detailed safety instruction for travelers in the area..." />
            </div>
            {bMsg && <p className="text-xs font-semibold text-brand-600">{bMsg}</p>}
            <button className="btn-primary w-full bg-rose-600 hover:bg-rose-700">
              🚀 Send Instant Emergency Broadcast
            </button>
          </form>
        </div>
      )}

      {tab === 'sos' && (
        <div className="card space-y-4 overflow-x-auto">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-slate-800">SOS Incident Dispatch Console</h2>
            <span className="text-xs text-slate-400">Real-time WebSocket updates</span>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2">Traveler</th><th>Contact</th><th>Location</th><th>Responder & ETA</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sos.map((s) => (
                <tr key={s.id} className="border-b border-slate-100">
                  <td className="py-2 font-medium">{s.user_name}</td>
                  <td>{s.user_phone || '—'}</td>
                  <td className="font-mono text-xs">{s.latitude}, {s.longitude}</td>
                  <td>
                    {s.assigned_to ? (
                      <span className="text-xs">
                        <strong>{s.assigned_to}</strong> (ETA: {s.eta_minutes || 15}m)
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600 italic">Unassigned</span>
                    )}
                  </td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      s.status === 'active' ? 'bg-rose-100 text-rose-700' :
                      s.status === 'dispatched' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedSOS(s);
                        setAssignedTo(s.assigned_to || 'Police Rescue Unit 1');
                        setEta(s.eta_minutes || 15);
                        setNotes(s.responder_notes || '');
                      }}
                      className="text-xs btn-primary py-1 px-2.5"
                    >
                      Dispatch
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Dispatch Modal */}
          {selectedSOS && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 mt-4">
              <h3 className="font-bold text-slate-800 text-sm">
                Dispatch Emergency Responder for SOS #{selectedSOS.id} ({selectedSOS.user_name})
              </h3>
              <form onSubmit={handleSaveDispatch} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label">Assigned Responder / Unit</label>
                    <input className="input" required value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Estimated Arrival (ETA Minutes)</label>
                    <input className="input" type="number" required value={eta} onChange={(e) => setEta(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">Responder Notes</label>
                  <textarea className="input" rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Action plan or contact details..." />
                </div>
                {dispatchMsg && <p className="text-xs font-semibold text-emerald-700">{dispatchMsg}</p>}
                <div className="flex gap-2">
                  <button className="btn-primary py-1.5 px-4 text-xs">Save Dispatch Details</button>
                  <button type="button" onClick={() => setSelectedSOS(null)} className="px-3 py-1.5 bg-slate-200 rounded-lg text-xs font-semibold text-slate-700">Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {tab === 'overdue' && (
        <div className="card space-y-3 overflow-x-auto">
          <h2 className="font-bold text-slate-800">Overdue Tourist Safety Check-Ins ({overdueCheckins.length})</h2>
          <p className="text-xs text-slate-400">Travelers who have missed their scheduled safety check-in countdown timer.</p>
          {overdueCheckins.length === 0 ? (
            <p className="text-sm text-emerald-600">All active traveler safety check-ins are up to date!</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2">Name</th><th>Email</th><th>Phone</th><th>Expected Check-In</th>
                </tr>
              </thead>
              <tbody>
                {overdueCheckins.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100">
                    <td className="py-2 font-medium">{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone || '—'}</td>
                    <td className="text-rose-600 font-semibold">{new Date(c.next_checkin_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'heatmap' && (
        <div className="card space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Spatial Risk Heatmap Clusters 🔥</h2>
            <p className="text-xs text-slate-400">
              Aggregated risk logs from all traveler interactions and automated evaluations. Darker red zones indicate high incident/risk density.
            </p>
          </div>
          <RiskHeatmapView points={riskLogs} height="500px" />
        </div>
      )}

      {tab === 'hazards' && (
        <div className="card space-y-4 overflow-x-auto">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span>⚠️</span> Community Hazard Moderation Console ({hazards.length})
            </h2>
            <p className="text-xs text-slate-400">
              Review and delete tourist-submitted safety alerts, scam warnings, and location flags.
            </p>
          </div>
          {hazards.length === 0 ? (
            <p className="text-sm text-slate-400">No active hazard reports submitted.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2">Reported By</th><th>Category</th><th>Details / Note</th><th>Coordinates</th><th>Reported At</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {hazards.map((h) => (
                  <tr key={h.id} className="border-b border-slate-100">
                    <td className="py-2 font-medium">{h.user_name || `User #${h.user_id}`}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        h.type === 'scam' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {h.type}
                      </span>
                    </td>
                    <td className="max-w-xs truncate">{h.note || 'No notes provided.'}</td>
                    <td className="font-mono text-xs">{Number(h.latitude).toFixed(4)}, {Number(h.longitude).toFixed(4)}</td>
                    <td className="text-xs text-slate-400">{new Date(h.created_at).toLocaleString()}</td>
                    <td>
                      <button onClick={() => handleDeleteHazard(h.id)} className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 px-2.5 py-1 rounded font-semibold border border-rose-200">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}


      {tab === 'live' && (


        <div className="card space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Real-Time Traveler Locations & Geofences</h2>
            <p className="text-xs text-slate-400">
              Map combines traveler GPS pins with active risk perimeters (Red = Danger, Yellow = Caution, Green = Safe).
            </p>
          </div>

          <MapView
            geofences={geofences}
            positions={Object.values(liveLocations).map((loc) => ({
              id: loc.userId,
              lat: Number(loc.latitude),
              lng: Number(loc.longitude),
              label: `📍 ${loc.name} (${new Date(loc.recorded_at).toLocaleTimeString()})`
            }))}
            height="450px"
          />

          {Object.keys(liveLocations).length === 0 ? (
            <p className="text-sm text-slate-400">No live positions reported yet.</p>
          ) : (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">Active Traveler Coordinates</h3>
              {Object.values(liveLocations).map((loc) => (
                <div key={loc.userId} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <div>
                    <span className="font-medium text-slate-800">{loc.name}</span>
                    <span className="text-xs text-slate-400 block">ID: {loc.userId}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-brand-600 font-mono text-xs block">
                      {Number(loc.latitude).toFixed(5)}, {Number(loc.longitude).toFixed(5)}
                    </span>
                    <span className="text-slate-400 text-xs">{new Date(loc.recorded_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500 border-b"><th className="py-2">Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100">
                  <td className="py-2">{u.name}</td><td>{u.email}</td><td>{u.phone || '—'}</td>
                  <td className="capitalize">{u.role}</td><td>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'trips' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500 border-b"><th className="py-2">Traveler</th><th>Trip</th><th>Destination</th><th>Status</th></tr></thead>
            <tbody>
              {trips.map((t) => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="py-2">{t.user_name}</td><td>{t.title}</td><td>{t.destination}</td>
                  <td className="capitalize">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

