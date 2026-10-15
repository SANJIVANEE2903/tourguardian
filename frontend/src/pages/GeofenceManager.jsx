import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import MapView from '../components/MapView';

export default function GeofenceManager() {
  const [geofences, setGeofences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('danger');
  const [lat, setLat] = useState('19.0760');
  const [lng, setLng] = useState('72.8777');
  const [radius, setRadius] = useState('1000');
  const [desc, setDesc] = useState('');
  const [msg, setMsg] = useState('');

  function loadGeofences() {
    api.get('/geofences')
      .then((r) => setGeofences(r.data))
      .catch(() => {});
  }

  useEffect(() => {
    loadGeofences();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      await api.post('/geofences', {
        name,
        type,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        radius_meters: parseInt(radius, 10),
        description: desc
      });
      setMsg('Geofence safety perimeter created successfully!');
      setName(''); setDesc('');
      loadGeofences();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to create geofence.');
    } finally { setLoading(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this geofence perimeter?')) return;
    try {
      await api.delete(`/geofences/${id}`);
      loadGeofences();
    } catch (err) {}
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Geofence Safety Perimeters</h1>
        <p className="text-sm text-slate-500">Configure spatial risk zones (Safe, Caution, Danger) to automate breach warnings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card space-y-4">
          <h2 className="font-bold text-slate-800">Add Safety Perimeter</h2>
          <form onSubmit={handleCreate} className="space-y-3 text-sm">
            <div>
              <label className="label">Zone Name</label>
              <input className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Night Market High Risk Zone" />
            </div>
            <div>
              <label className="label">Risk Classification</label>
              <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="danger">🔴 Danger Zone (High Risk)</option>
                <option value="caution">🟡 Caution Zone (Moderate Risk)</option>
                <option value="safe">🟢 Safe Zone (Police Patrol)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">Latitude</label>
                <input className="input" type="number" step="any" required value={lat} onChange={(e) => setLat(e.target.value)} />
              </div>
              <div>
                <label className="label">Longitude</label>
                <input className="input" type="number" step="any" required value={lng} onChange={(e) => setLng(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Radius (meters)</label>
              <input className="input" type="number" required value={radius} onChange={(e) => setRadius(e.target.value)} />
            </div>
            <div>
              <label className="label">Description / Safety Notes</label>
              <textarea className="input" rows="2" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Reasoning and guidance for travelers" />
            </div>
            {msg && <p className="text-xs font-semibold text-brand-600">{msg}</p>}
            <button className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating...' : '➕ Create Geofence Perimeter'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="card p-2">
            <MapView geofences={geofences} height="400px" />
          </div>

          <div className="card overflow-x-auto">
            <h3 className="font-bold text-slate-800 mb-3">Active Geofences ({geofences.length})</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2">Name</th><th>Type</th><th>Coordinates</th><th>Radius</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {geofences.map((g) => (
                  <tr key={g.id} className="border-b border-slate-100">
                    <td className="py-2 font-medium">{g.name}</td>
                    <td className="capitalize font-semibold">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        g.type === 'danger' ? 'bg-rose-100 text-rose-700' :
                        g.type === 'caution' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {g.type}
                      </span>
                    </td>
                    <td className="font-mono text-xs">{Number(g.latitude).toFixed(4)}, {Number(g.longitude).toFixed(4)}</td>
                    <td>{g.radius_meters}m</td>
                    <td>
                      <button onClick={() => handleDelete(g.id)} className="text-xs text-rose-600 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
