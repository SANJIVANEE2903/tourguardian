import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, loading, error } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', nationality: '' });
  const navigate = useNavigate();

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await register(form);
    if (ok) navigate('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 px-4 py-10">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-3xl mb-1">🛡️</div>
          <h1 className="text-xl font-bold text-slate-800">Create your TourGuardian profile</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" required value={form.name} onChange={update('name')} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={form.email} onChange={update('email')} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" required minLength={6} value={form.password} onChange={update('password')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={update('phone')} />
            </div>
            <div>
              <label className="label">Nationality</label>
              <input className="input" value={form.nationality} onChange={update('nationality')} />
            </div>
          </div>
          {error && <p className="text-sm text-danger-500">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p className="text-sm text-center text-slate-500 mt-4">
          Already have an account? <Link to="/login" className="text-brand-600 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
