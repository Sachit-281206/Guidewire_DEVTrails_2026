import { useState } from 'react';
import { loginUser } from '../api';
import { Icons } from '../components/Icons';

const inputCls = "w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:bg-white/[0.08] transition";

export default function Login({ onLoggedIn, onBack }) {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const data = await loginUser({ identifier: form.email, password: form.password });
    if (data._id) onLoggedIn(data);
    else setError(data.error || 'Invalid credentials');
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0f1e]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-6">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition">
          {Icons.arrowLeft('w-4 h-4')}
        </button>
        <span className="text-white font-semibold">Sign In</span>
      </div>

      <div className="flex-1 px-6">
        <div className="mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white mb-4">
            {Icons.logo('w-6 h-6')}
          </div>
          <h1 className="text-2xl font-black text-white">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your InsureGig account</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{Icons.mail('w-4 h-4')}</div>
            <input name="email" type="text" placeholder="Phone number or email" value={form.email} onChange={handle} required
              className={`${inputCls} pl-10`} />
          </div>
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handle} required
            className={inputCls} />

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              {Icons.alert('w-4 h-4 text-red-400 shrink-0')}
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
            {loading ? 'Signing in...' : (<>Sign In {Icons.arrowRight('w-4 h-4')}</>)}
          </button>
        </form>
      </div>
    </div>
  );
}
