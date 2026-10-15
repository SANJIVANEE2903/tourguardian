import React, { useEffect, useRef, useState } from 'react';
import api from '../api/axios';
import MapView from '../components/MapView';

export default function LiveMap() {
  const [position, setPosition] = useState(null);
  const [telemetry, setTelemetry] = useState({ accuracy: null, speed: null, heading: null });
  const [tracking, setTracking] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [hazardReports, setHazardReports] = useState([]);
  const [error, setError] = useState('');
  const [sosStatus, setSosStatus] = useState(null);
  const watchId = useRef(null);

  // Community Hazard Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [hazardType, setHazardType] = useState('unsafe');
  const [hazardNote, setHazardNote] = useState('');
  const [hazardSubmitting, setHazardSubmitting] = useState(false);
  const [hazardMsg, setHazardMsg] = useState('');

  async function pushLocation(lat, lng) {
    try {
      await api.post('/locations', { latitude: lat, longitude: lng });
    } catch (err) {
      console.warn('Failed to push location:', err);
    }
  }

  function loadHazards() {
    api.get('/hazards')
      .then((res) => setHazardReports(res.data || []))
      .catch(() => {});
  }

  // Restore latest known position, contacts, and community hazard reports on mount
  useEffect(() => {
    api.get('/locations/history')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const latest = res.data[0];
          setPosition({ lat: Number(latest.latitude), lng: Number(latest.longitude) });
        }
      })
      .catch(() => {});

    api.get('/emergency-contacts')
      .then((res) => setContacts(res.data || []))
      .catch(() => {});

    loadHazards();
  }, []);

  function startTracking() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Using simulated demo location.');
      simulateLocation(19.0760, 72.8777);
      return;
    }
    setTracking(true);
    setError('');
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(p);
        setTelemetry({
          accuracy: pos.coords.accuracy ? Math.round(pos.coords.accuracy) : 10,
          speed: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0,
          heading: pos.coords.heading || 0
        });
        pushLocation(p.lat, p.lng);
      },
      (err) => {
        setError(`Browser Geolocation error: ${err.message}. You can use "Simulate Demo Position" below to test.`);
        setTracking(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  }

  function stopTracking() {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setTracking(false);
  }

  function simulateLocation(lat = 19.0760, lng = 72.8777) {
    const randomOffset = () => (Math.random() - 0.5) * 0.008;
    const p = { lat: lat + randomOffset(), lng: lng + randomOffset() };
    setPosition(p);
    setTelemetry({ accuracy: 5, speed: Math.floor(Math.random() * 15) + 5, heading: 90 });
    pushLocation(p.lat, p.lng);
  }

  async function triggerEmergencySOS() {
    setSosStatus('dispatching');
    try {
      const res = await api.post('/sos', {
        latitude: position?.lat,
        longitude: position?.lng,
        message: 'URGENT: Emergency SOS triggered from Live Map!'
      });
      setSosStatus({ ok: true, data: res.data });
    } catch (err) {
      setSosStatus({ ok: false, message: 'Failed to dispatch SOS.' });
    }
  }

  async function handleReportHazard(e) {
    e.preventDefault();
    if (!position) {
      setHazardMsg('Current location is required to submit a hazard report.');
      return;
    }
    setHazardSubmitting(true);
    setHazardMsg('');
    try {
      await api.post('/hazards', {
        type: hazardType,
        note: hazardNote,
        latitude: position.lat,
        longitude: position.lng
      });
      setHazardMsg('✅ Community hazard reported! Other travelers nearby can now see your marker.');
      setHazardNote('');
      loadHazards();
      setTimeout(() => {
        setShowReportModal(false);
        setHazardMsg('');
      }, 1800);
    } catch (err) {
      setHazardMsg('Failed to submit hazard report.');
    } finally {
      setHazardSubmitting(false);
    }
  }

  useEffect(() => () => stopTracking(), []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">High-Precision Live Location Tracking</h1>
          <p className="text-sm text-slate-500">Real-time GPS telemetry, safety points, and community hazard alerts</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {!tracking ? (
            <button className="btn-primary bg-emerald-600 hover:bg-emerald-700" onClick={startTracking}>
              ▶️ Start High-Frequency Live Tracking
            </button>
          ) : (
            <button className="btn-danger" onClick={stopTracking}>⏹️ Stop Tracking</button>
          )}
          <button
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl text-sm transition"
            onClick={() => simulateLocation()}
          >
            📍 Simulate Movement
          </button>
          <button
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm shadow-md transition"
            onClick={() => setShowReportModal(true)}
          >
            ⚠️ Report Community Hazard
          </button>
          <button
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-md animate-pulse"
            onClick={triggerEmergencySOS}
          >
            🚨 Trigger Emergency SOS
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200">{error}</p>}

      {/* Telemetry Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="card p-3">
          <span className="text-xs text-slate-400 block">Status</span>
          <span className={`font-bold ${tracking ? 'text-emerald-600' : 'text-slate-500'}`}>
            {tracking ? '🟢 LIVE SIGNAL ACTIVE' : '⏸ IDLE'}
          </span>
        </div>
        <div className="card p-3">
          <span className="text-xs text-slate-400 block">GPS Accuracy</span>
          <span className="font-mono font-bold text-slate-800">
            {telemetry.accuracy ? `±${telemetry.accuracy} meters` : 'High Precision'}
          </span>
        </div>
        <div className="card p-3">
          <span className="text-xs text-slate-400 block">Current Speed</span>
          <span className="font-mono font-bold text-brand-600">{telemetry.speed || 0} km/h</span>
        </div>
        <div className="card p-3">
          <span className="text-xs text-slate-400 block">Active Community Hazards</span>
          <span className="font-bold text-amber-600">{hazardReports.length} Flagged</span>
        </div>
      </div>

      {/* Map View */}
      <div className="card p-2">
        <MapView
          position={position}
          radius={position ? (telemetry.accuracy || 100) : null}
          label="Live GPS Marker"
          height="500px"
          hazardReports={hazardReports}
          showSafetyPoints={true}
        />
      </div>

      {/* Emergency Contacts Dispatch Confirmation */}
      <div className="card space-y-2">
        <h3 className="text-sm font-bold text-slate-800">Emergency Contacts Receiving Live Alerts ({contacts.length}):</h3>
        {contacts.length === 0 ? (
          <p className="text-xs text-slate-500">
            No emergency contacts added yet. Default Rescue Dispatch (+91-112) will be notified if SOS is triggered.
          </p>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {contacts.map((c) => (
              <span key={c.id} className="text-xs bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 font-medium">
                👤 {c.name} ({c.phone || c.email})
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Community Hazard Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowReportModal(false)}>
          <div className="card max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span>⚠️</span> Flag Location Hazard / Scam
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>
            <form onSubmit={handleReportHazard} className="space-y-3 text-sm">
              <div>
                <label className="label">Hazard Type</label>
                <select className="input" value={hazardType} onChange={(e) => setHazardType(e.target.value)}>
                  <option value="unsafe">🚫 Unsafe Area / Suspicious Activity</option>
                  <option value="scam">💸 Tourist Scam / Overcharging Reported</option>
                  <option value="other">⚠️ General Safety Hazard</option>
                </select>
              </div>
              <div>
                <label className="label">Details & Notes (Optional)</label>
                <textarea
                  className="input"
                  rows="3"
                  value={hazardNote}
                  onChange={(e) => setHazardNote(e.target.value)}
                  placeholder="e.g. Fake taxi driver scam at airport exit, or unlit dark alley..."
                />
              </div>
              {position && (
                <p className="text-[11px] text-slate-400 font-mono">
                  Coordinates: {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
                </p>
              )}
              {hazardMsg && (
                <p className={`text-xs font-semibold p-2 rounded ${hazardMsg.includes('✅') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  {hazardMsg}
                </p>
              )}
              <div className="flex gap-2">
                <button className="btn-primary w-full bg-amber-500 hover:bg-amber-600" disabled={hazardSubmitting}>
                  {hazardSubmitting ? 'Submitting…' : 'Submit Community Hazard Alert'}
                </button>
                <button type="button" onClick={() => setShowReportModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl text-slate-600 font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOS Result Modal */}
      {sosStatus && sosStatus !== 'dispatching' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSosStatus(null)}>
          <div className="card max-w-md w-full space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-rose-600">🚨 EMERGENCY MESSAGES DISPATCHED</h3>
            <p className="text-xs text-slate-600">
              Live Google Maps link (<a href={sosStatus.data?.mapsUrl} target="_blank" rel="noreferrer" className="text-brand-600 underline font-mono">{sosStatus.data?.mapsUrl}</a>) sent via SMS/Email to {sosStatus.data?.contactsNotified?.length || 0} contact(s).
            </p>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {(sosStatus.data?.contactsNotified || []).map((c, i) => (
                <div key={i} className="p-2 bg-emerald-50 text-xs rounded border border-emerald-200">
                  <strong>{c.name} ({c.phone})</strong>: 
                  <span className={c.dispatchStatus && c.dispatchStatus.includes('REAL_') ? "text-emerald-700 font-bold ml-1" : "text-amber-600 font-semibold ml-1"}>
                    {c.dispatchStatus || '✓ DISPATCHED'}
                  </span>
                </div>
              ))}
            </div>
            <button className="btn-primary w-full" onClick={() => setSosStatus(null)}>Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
}
