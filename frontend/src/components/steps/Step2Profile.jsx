import { useState } from 'react';
import { Icons } from '../Icons';

const cities    = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'];
const platforms = ['Swiggy', 'Zomato', 'Blinkit', 'Zepto', 'Porter', 'Dunzo', 'Other'];
const genders   = ['Male', 'Female', 'Other'];

const inputCls  = "w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition";
const selectCls = `${inputCls} appearance-none`;

export default function Step2Profile({ data, onNext }) {
  const [form, setForm] = useState({
    name: data.name || '', dob: data.dob || '',
    gender: data.gender || '', city: data.city || '', platform: data.platform || '',
  });
  const [error, setError] = useState('');

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleNext = () => {
    if (!form.name || !form.dob || !form.gender || !form.city || !form.platform) {
      setError('All fields are required'); return;
    }
    setError('');
    onNext(form);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-black text-2xl">Basic Profile</h2>
        <p className="text-slate-400 text-sm mt-1">Tell us about yourself</p>
      </div>

      <div className="space-y-3">
        {/* Full Name */}
        <div>
          <label className="text-slate-400 text-xs font-medium mb-1.5 block">Full Name</label>
          <input name="name" placeholder="e.g. Rahul Sharma" value={form.name} onChange={handle}
            className={inputCls} />
        </div>

        {/* DOB */}
        <div>
          <label className="text-slate-400 text-xs font-medium mb-1.5 block">Date of Birth</label>
          <input name="dob" type="date" value={form.dob} onChange={handle}
            className={`${inputCls} [color-scheme:dark]`} />
        </div>

        {/* Gender */}
        <div>
          <label className="text-slate-400 text-xs font-medium mb-1.5 block">Gender</label>
          <div className="flex gap-2">
            {genders.map(g => (
              <button key={g} type="button" onClick={() => setForm({ ...form, gender: g })}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition ${
                  form.gender === g
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-white/[0.05] border-white/10 text-slate-400 hover:text-white'
                }`}>
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* City */}
        <div>
          <label className="text-slate-400 text-xs font-medium mb-1.5 block">Base City</label>
          <select name="city" value={form.city} onChange={handle} className={selectCls}>
            <option value="" className="bg-[#0a0f1e]">Select your city</option>
            {cities.map(c => <option key={c} value={c} className="bg-[#0a0f1e]">{c}</option>)}
          </select>
        </div>

        {/* Platform */}
        <div>
          <label className="text-slate-400 text-xs font-medium mb-1.5 block">Delivery Platform</label>
          <div className="grid grid-cols-3 gap-2">
            {platforms.map(p => (
              <button key={p} type="button" onClick={() => setForm({ ...form, platform: p })}
                className={`py-2.5 rounded-xl text-xs font-semibold border transition ${
                  form.platform === p
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-white/[0.05] border-white/10 text-slate-400 hover:text-white'
                }`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          {Icons.alert('w-4 h-4 text-red-400 shrink-0')}
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      <button type="button" onClick={handleNext}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-2xl text-sm transition flex items-center justify-center gap-2">
        Continue {Icons.arrowRight('w-4 h-4')}
      </button>
    </div>
  );
}
