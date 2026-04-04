import { useState } from 'react';
import { Icons } from '../Icons';

const inputCls = "w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition";

export default function Step5Payout({ data, onNext }) {
  const [upiId, setUpiId] = useState(data.upiId || '');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!upiId.includes('@')) { setError('Enter a valid UPI ID (must contain @)'); return; }
    setError('');
    onNext({ upiId });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-black text-2xl">Payout Setup</h2>
        <p className="text-slate-400 text-sm mt-1">Where should we credit your claim payouts?</p>
      </div>

      {/* Info card */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          {Icons.upi('w-4 h-4 text-blue-400')}
          <p className="text-blue-300 font-semibold text-sm">Instant UPI Payouts</p>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed">
          When a disruption is detected during your work session, the payout is credited to your UPI ID instantly — no manual claim needed.
        </p>
      </div>

      <div>
        <label className="text-slate-400 text-xs font-medium mb-1.5 block">UPI ID</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{Icons.upi('w-4 h-4')}</div>
          <input placeholder="e.g. name@okaxis" value={upiId}
            onChange={e => setUpiId(e.target.value)}
            className={`${inputCls} pl-10`} />
        </div>
        <p className="text-slate-500 text-xs mt-1.5">Accepted: @okaxis, @ybl, @paytm, @upi, etc.</p>
      </div>

      {upiId.includes('@') && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2">
          {Icons.check('w-4 h-4 text-emerald-400')}
          <p className="text-emerald-300 text-xs">Payouts will be credited to <span className="font-bold">{upiId}</span></p>
        </div>
      )}

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
