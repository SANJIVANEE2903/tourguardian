import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const empty = { name: '', phone: '', relation: '' };

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  function load() {
    api.get('/emergency-contacts').then((r) => setContacts(r.data)).catch(() => {});
  }
  useEffect(load, []);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/emergency-contacts', form);
      setForm(empty);
      load();
    } finally { setSaving(false); }
  }

  async function remove(id) {
    await api.delete(`/emergency-contacts/${id}`);
    load();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Emergency Contacts</h1>
      <p className="text-sm text-slate-500 -mt-4">These people are notified automatically whenever you trigger an SOS alert.</p>

      <form onSubmit={handleSubmit} className="card grid sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="label">Name</label>
          <input className="input" required value={form.name} onChange={update('name')} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" required value={form.phone} onChange={update('phone')} />
        </div>
        <div>
          <label className="label">Relation</label>
          <input className="input" placeholder="e.g. Parent, Friend" value={form.relation} onChange={update('relation')} />
        </div>
        <button className="btn-primary sm:col-span-3" disabled={saving}>{saving ? 'Adding…' : 'Add Contact'}</button>
      </form>

      <div className="space-y-2">
        {contacts.length === 0 && <p className="text-sm text-slate-400">No emergency contacts added yet.</p>}
        {contacts.map((c) => (
          <div key={c.id} className="card flex justify-between items-center">
            <div>
              <p className="font-medium">{c.name} <span className="text-xs text-slate-400">({c.relation || 'Contact'})</span></p>
              <p className="text-sm text-slate-500">{c.phone}</p>
            </div>
            <button onClick={() => remove(c.id)} className="text-danger-500 text-sm">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
