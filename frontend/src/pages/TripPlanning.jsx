import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const empty = { title: '', destination: '', start_date: '', end_date: '' };

export default function TripPlanning() {
  const [trips, setTrips] = useState([]);
  const [form, setForm] = useState(empty);
  const [itinerary, setItinerary] = useState([{ day: 1, place: '', notes: '' }]);
  const [saving, setSaving] = useState(false);

  function load() {
    api.get('/trips').then((r) => setTrips(r.data)).catch(() => {});
  }
  useEffect(load, []);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function updateItinerary(idx, field, value) {
    setItinerary((it) => it.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  }

  function addDay() {
    setItinerary((it) => [...it, { day: it.length + 1, place: '', notes: '' }]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/trips', { ...form, itinerary });
      setForm(empty);
      setItinerary([{ day: 1, place: '', notes: '' }]);
      load();
    } finally { setSaving(false); }
  }

  async function updateStatus(id, status) {
    await api.put(`/trips/${id}`, { status });
    load();
  }

  const [weatherMsg, setWeatherMsg] = useState({});

  async function checkWeather(id) {
    setWeatherMsg((prev) => ({ ...prev, [id]: 'Checking Open-Meteo forecast...' }));
    try {
      const res = await api.post(`/trips/${id}/check-weather`);
      const w = res.data?.result;
      if (w?.hasWarning) {
        setWeatherMsg((prev) => ({ ...prev, [id]: `⚠️ Weather Warning: ${w.warnings.join('; ')}` }));
      } else {
        setWeatherMsg((prev) => ({ ...prev, [id]: '☀️ Forecast is clear! No severe weather warnings detected.' }));
      }
    } catch {
      setWeatherMsg((prev) => ({ ...prev, [id]: 'Could not fetch weather forecast.' }));
    }
  }

  async function removeTrip(id) {
    await api.delete(`/trips/${id}`);
    load();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Trip Planning & Weather Risk Assessment</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="card lg:col-span-1 space-y-3 h-fit">
          <h2 className="font-semibold">New Trip</h2>
          <div>
            <label className="label">Title</label>
            <input className="input" required value={form.title} onChange={update('title')} />
          </div>
          <div>
            <label className="label">Destination</label>
            <input className="input" required value={form.destination} onChange={update('destination')} placeholder="e.g. Paris, Tokyo, Mumbai" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Start</label>
              <input className="input" type="date" value={form.start_date} onChange={update('start_date')} />
            </div>
            <div>
              <label className="label">End</label>
              <input className="input" type="date" value={form.end_date} onChange={update('end_date')} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="label mb-0">Itinerary</label>
              <button type="button" onClick={addDay} className="text-xs text-brand-600 font-medium">+ Add day</button>
            </div>
            <div className="space-y-2 mt-1">
              {itinerary.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-xs text-slate-400 mt-2 w-10">Day {row.day}</span>
                  <input className="input text-sm" placeholder="Place" value={row.place} onChange={(e) => updateItinerary(i, 'place', e.target.value)} />
                  <input className="input text-sm" placeholder="Notes" value={row.notes} onChange={(e) => updateItinerary(i, 'notes', e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          <button className="btn-primary w-full" disabled={saving}>{saving ? 'Creating Trip & Checking Weather…' : 'Create Trip & Check Weather'}</button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          {trips.length === 0 && <p className="text-sm text-slate-400">No trips yet.</p>}
          {trips.map((t) => {
            const it = (() => { try { return JSON.parse(t.itinerary || '[]'); } catch { return []; } })();
            return (
              <div key={t.id} className="card space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-800">{t.title}</h3>
                    <p className="text-sm text-slate-500">📍 {t.destination} · 🗓️ {t.start_date || '—'} to {t.end_date || '—'}</p>
                  </div>
                  <select
                    value={t.status}
                    onChange={(e) => updateStatus(t.id, e.target.value)}
                    className="text-xs border border-slate-300 rounded-lg px-2 py-1"
                  >
                    <option value="planned">Planned</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                {it.length > 0 && (
                  <ul className="mt-2 text-sm space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {it.map((row, i) => (
                      <li key={i} className="text-slate-600">Day {row.day}: <strong>{row.place}</strong> {row.notes && `— ${row.notes}`}</li>
                    ))}
                  </ul>
                )}
                {weatherMsg[t.id] && (
                  <p className={`text-xs p-2 rounded-lg font-medium border ${
                    weatherMsg[t.id].includes('Warning') ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {weatherMsg[t.id]}
                  </p>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <button onClick={() => checkWeather(t.id)} className="text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg border border-brand-200">
                    🌤️ Check Weather Forecast
                  </button>
                  <button onClick={() => removeTrip(t.id)} className="text-xs text-rose-500 hover:text-rose-700">Delete trip</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

}
