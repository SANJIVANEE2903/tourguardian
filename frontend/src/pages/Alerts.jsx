import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const typeIcon = { sos: '🚨', risk: '⚠️', weather: '🌧️', system: 'ℹ️' };

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  function load() {
    api.get('/notifications').then((r) => setAlerts(r.data)).catch(() => {});
  }
  useEffect(load, []);

  async function markRead(id) {
    await api.put(`/notifications/${id}/read`);
    load();
  }

  async function markAllRead() {
    await api.put('/notifications/read-all');
    load();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Alerts & Notifications</h1>
        <button onClick={markAllRead} className="btn-secondary text-sm">Mark all read</button>
      </div>

      <div className="space-y-2">
        {alerts.length === 0 && <p className="text-sm text-slate-400">No notifications yet.</p>}
        {alerts.map((a) => (
          <div key={a.id} className={`card flex justify-between items-start ${a.is_read ? 'opacity-60' : ''}`}>
            <div className="flex gap-3">
              <span className="text-xl">{typeIcon[a.type] || 'ℹ️'}</span>
              <div>
                <p className="font-medium">{a.title}</p>
                <p className="text-sm text-slate-500">{a.message}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(a.created_at).toLocaleString()}</p>
              </div>
            </div>
            {!a.is_read && (
              <button onClick={() => markRead(a.id)} className="text-xs text-brand-600 font-medium whitespace-nowrap">
                Mark read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
