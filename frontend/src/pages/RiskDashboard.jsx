import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const levelColor = { low: 'text-emerald-600 bg-emerald-50', medium: 'text-amber-600 bg-amber-50', high: 'text-danger-500 bg-red-50' };

export default function RiskDashboard() {
  const [locationName, setLocationName] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  function loadHistory() {
    api.get('/risk/history').then((r) => setHistory(r.data)).catch(() => {});
  }
  useEffect(loadHistory, []);

  async function handleAssess(e) {
    e.preventDefault();
    if (!locationName.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/risk/assess', { locationName });
      setResult(data);
      loadHistory();
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">AI Risk Dashboard</h1>

      <form onSubmit={handleAssess} className="card flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <label className="label">Destination / area name</label>
          <input
            className="input"
            placeholder="e.g. Northern border trekking route"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
          />
        </div>
        <button className="btn-primary" disabled={loading}>{loading ? 'Assessing…' : 'Assess Risk'}</button>
      </form>

      {result && (
        <div className="card">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Result for "{locationName}"</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${levelColor[result.level]}`}>
              {result.level} risk ({result.score}/100)
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-2">Contributing Factors</h3>
              <ul className="text-sm text-slate-500 list-disc list-inside space-y-1">
                {result.factors.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-2">Recommendations</h3>
              <ul className="text-sm text-slate-500 list-disc list-inside space-y-1">
                {result.recommendations.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold mb-3">Assessment History</h2>
        {history.length === 0 && <p className="text-sm text-slate-400">No assessments yet.</p>}
        <div className="space-y-2">
          {history.map((h) => (
            <div key={h.id} className="flex justify-between items-center border-b border-slate-100 pb-2 text-sm">
              <span>{h.location_name || `${h.latitude}, ${h.longitude}`}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${levelColor[h.risk_level]}`}>
                {h.risk_level} ({h.risk_score})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
