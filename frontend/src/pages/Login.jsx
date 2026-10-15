import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 px-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-3xl mb-1">🛡️</div>
          <h1 className="text-xl font-bold text-slate-800">Welcome to TourGuardian</h1>
          <p className="text-sm text-slate-500">Sign in to continue your safe travels</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-danger-500">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="text-sm text-center text-slate-500 mt-4">
          Don't have an account? <Link to="/register" className="text-brand-600 font-medium">Register</Link>
        </p>
      </div>
    </div>
  );
}
