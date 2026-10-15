import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function CheckInWidget() {
  const [timer, setTimer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  function loadStatus() {
    api.get('/checkins')
      .then((r) => setTimer(r.data))
      .catch(() => {});
  }

  useEffect(() => {
    loadStatus();
  }, []);

  async function handleCheckin() {
    setLoading(true); setMsg('');
    try {
      const res = await api.post('/checkins/ping');
      setMsg(res.data.message);
      loadStatus();
    } catch (err) {
      setMsg('Check-in failed.');
    } finally { setLoading(false); }
  }

  async function handleSetTimer(mins) {
    setLoading(true); setMsg('');
    try {
      await api.post('/checkins/timer', { interval_minutes: mins });
      loadStatus();
    } catch (err) {
      setMsg('Failed to update timer.');
    } finally { setLoading(false); }
  }

  if (!timer) return null;

  return (
    <div className="card space-y-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <span>⏱️</span> Safety Check-In Timer
          </h3>
          <p className="text-xs text-slate-500">
            Confirm your safety periodically to prevent emergency contact alerts.
          </p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${
          timer.status === 'overdue' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {timer.status || 'Active'}
        </span>
      </div>

      <div className="flex justify-between items-center text-sm border-t border-emerald-100 pt-2">
        <span className="text-xs text-slate-600">
          Next Check-In Due: {timer.next_checkin_at ? new Date(timer.next_checkin_at).toLocaleTimeString() : 'Not Set'}
        </span>
        <button
          onClick={handleCheckin}
          disabled={loading}
          className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-700 py-1.5"
        >
          {loading ? 'Recording...' : '✅ I Am Safe (Check In)'}
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
        <span>Interval:</span>
        {[30, 60, 120, 240].map((m) => (
          <button
            key={m}
            onClick={() => handleSetTimer(m)}
            className={`px-2 py-0.5 rounded border ${
              timer.interval_minutes === m ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {m}m
          </button>
        ))}
      </div>
      {msg && <p className="text-xs text-emerald-700 font-medium">{msg}</p>}
    </div>
  );
}
