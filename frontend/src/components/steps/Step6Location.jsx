import { useState } from 'react';
import { Icons } from '../Icons';

export default function Step6Location({ onNext }) {
  const [status, setStatus] = useState('idle'); // idle | granted | denied | loading

  const handleAllow = () => {
    setStatus('loading');
    if (!navigator.geolocation) { setStatus('denied'); return; }
    navigator.geolocation.getCurrentPosition(
      () => setStatus('granted'),
      () => setStatus('denied'),
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white font-black text-2xl">Location Access</h2>
        <p className="text-slate-400 text-sm mt-1">Help us verify disruptions in your area</p>
      </div>

      {/* Illustration card */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center mx-auto">
          {Icons.signal('w-8 h-8 text-blue-400')}
        </div>
        <div>
          <p className="text-white font-bold text-base">Enable Location Access</p>
          <p className="text-slate-400 text-xs mt-2 leading-relaxed">
            We only access your location during active work sessions to verify that disruptions (rain, heat, pollution) are affecting your area.
          </p>
        </div>

        <div className="space-y-2 text-left">
          {[
            'Verify disruption events in your area',
            'Prevent fraudulent claims',
            'Never tracked in background',
          ].map(t => (
            <div key={t} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                {Icons.check('w-2.5 h-2.5')}
              </div>
              <p className="text-slate-300 text-xs">{t}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Status feedback */}
      {status === 'granted' && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2">
          {Icons.check('w-4 h-4 text-emerald-400')}
          <p className="text-emerald-300 text-xs font-semibold">Location access granted</p>
        </div>
      )}
      {status === 'denied' && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-2">
          {Icons.alert('w-4 h-4 text-amber-400 shrink-0')}
          <p className="text-amber-300 text-xs">Location denied. You can enable it later in settings.</p>
        </div>
      )}

      <div className="space-y-3">
        {status !== 'granted' && (
          <button type="button" onClick={handleAllow} disabled={status === 'loading'}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
            {Icons.signal('w-4 h-4')}
            {status === 'loading' ? 'Requesting...' : 'Allow Location Access'}
          </button>
        )}

        <button type="button" onClick={() => onNext({ locationPermission: status === 'granted' })}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-2xl text-sm transition flex items-center justify-center gap-2">
          {status === 'granted' ? 'Continue' : 'Skip for now'} {Icons.arrowRight('w-4 h-4')}
        </button>
      </div>
    </div>
  );
}
