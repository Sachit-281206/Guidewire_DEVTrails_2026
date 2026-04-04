import { useState } from 'react';
import { Icons } from '../Icons';

const inputCls = "w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition";

const WORK_TYPES = [
  { id: 'fulltime',  label: 'Full-time',  sub: '8–12 hrs/day', hours: 10 },
  { id: 'parttime',  label: 'Part-time',  sub: '4–6 hrs/day',  hours: 5  },
];

export default function Step3Work({ data, onNext }) {
  const [dailyIncome, setDailyIncome] = useState(data.dailyIncome || '');
  const [workType, setWorkType]       = useState(data.workType || '');
  const [error, setError]             = useState('');

  const selected = WORK_TYPES.find(w => w.id === workType);

  const handleNext = () => {
    if (!dailyIncome || Number(dailyIncome) <= 0) { setError('Enter a valid daily income'); return; }
    if (!workType) { setError('Select your work type'); return; }
    setError('');
    const avgWorkHours  = selected.hours;
    const hourlyIncome  = parseFloat((Number(dailyIncome) / avgWorkHours).toFixed(2));
    onNext({ dailyIncome: Number(dailyIncome), workType, avgWorkHours, hourlyIncome });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-black text-2xl">Work & Income</h2>
        <p className="text-slate-400 text-sm mt-1">Used to calculate your premium and payouts</p>
      </div>

      <div className="space-y-4">
        {/* Daily Income */}
        <div>
          <label className="text-slate-400 text-xs font-medium mb-1.5 block">Average Daily Income</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{Icons.rupee('w-4 h-4')}</div>
            <input type="number" placeholder="e.g. 800" value={dailyIncome}
              onChange={e => setDailyIncome(e.target.value)}
              className={`${inputCls} pl-10`} />
          </div>
          <p className="text-slate-500 text-xs mt-1.5">Your average earnings per working day</p>
        </div>

        {/* Work Type */}
        <div>
          <label className="text-slate-400 text-xs font-medium mb-1.5 block">Work Type</label>
          <div className="space-y-2">
            {WORK_TYPES.map(w => (
              <button key={w.id} type="button" onClick={() => setWorkType(w.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition ${
                  workType === w.id
                    ? 'bg-blue-600/20 border-blue-500/50 text-white'
                    : 'bg-white/[0.03] border-white/[0.07] text-slate-400 hover:border-white/20'
                }`}>
                <div className="text-left">
                  <p className={`font-semibold text-sm ${workType === w.id ? 'text-white' : 'text-slate-300'}`}>{w.label}</p>
                  <p className="text-xs mt-0.5">{w.sub}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                  workType === w.id ? 'border-blue-400 bg-blue-500' : 'border-slate-600'
                }`}>
                  {workType === w.id && <span className="w-2 h-2 bg-white rounded-full"></span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Derived preview */}
        {dailyIncome && workType && (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 space-y-2">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Calculated Values</p>
            <div className="flex justify-between">
              <p className="text-slate-400 text-xs">Avg Work Hours</p>
              <p className="text-white text-xs font-bold">{selected?.hours} hrs/day</p>
            </div>
            <div className="flex justify-between">
              <p className="text-slate-400 text-xs">Hourly Income</p>
              <p className="text-emerald-400 text-xs font-bold">
                ₹{(Number(dailyIncome) / selected?.hours).toFixed(2)}/hr
              </p>
            </div>
          </div>
        )}
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
