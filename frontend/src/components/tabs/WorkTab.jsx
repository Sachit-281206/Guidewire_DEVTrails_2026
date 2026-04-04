import { Icons } from '../Icons';

const statusStyles = {
  FULL: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  PARTIAL: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
  REVIEW: 'bg-rose-500/20 text-rose-200 border-rose-500/30',
};

export default function WorkTab({ shift, policy, onShiftToggle, loadingShift, latestClaim, monitoring }) {
  const policyActive = policy && new Date() <= new Date(policy.endDate);
  const activeAlert = monitoring?.activeAlert;

  return (
    <div className="space-y-4">
      <div className={`rounded-3xl p-5 ${shift ? 'bg-[linear-gradient(135deg,#0f766e,#134e4a)]' : 'bg-[linear-gradient(135deg,#334155,#1e293b)]'}`}>
        <p className="mb-1 text-xs font-medium text-slate-300">Work session</p>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${shift ? 'bg-emerald-300 animate-pulse' : 'bg-slate-500'}`}></span>
          <p className="text-2xl font-black text-white">{shift ? 'On duty' : 'Off duty'}</p>
        </div>
        <p className="mt-1 text-xs text-slate-300">
          {shift
            ? `Auto protection is live from ${new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'Start a shift to enable the automated pipeline.'}
        </p>
      </div>

      <button
        onClick={onShiftToggle}
        disabled={loadingShift || !policyActive}
        className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition disabled:opacity-50 ${shift ? 'bg-rose-500 text-white hover:bg-rose-400' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'}`}
      >
        {shift ? Icons.stop('w-4 h-4') : Icons.play('w-4 h-4')}
        {loadingShift ? 'Updating...' : shift ? 'End work session' : 'Start work session'}
      </button>

      {!policyActive && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3">
          {Icons.alert('w-4 h-4 text-amber-300 shrink-0')}
          <p className="text-xs text-amber-200">Activate a policy first so the system can auto-monitor your shift.</p>
        </div>
      )}

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Automated pipeline</p>
          <span className={`text-xs font-medium ${monitoring?.monitoringActive ? 'text-emerald-300' : 'text-slate-500'}`}>
            {monitoring?.monitoringActive ? 'Running' : 'Idle'}
          </span>
        </div>
        {[
          { label: 'Environment monitoring', status: 'Runs every 12s' },
          { label: 'Trigger evaluation', status: '5 conditions' },
          { label: 'Claim generation', status: 'Zero-touch' },
          { label: 'Payout calculation', status: 'Deterministic' },
        ].map(({ label, status }) => (
          <div key={label} className="flex items-center justify-between border-b border-white/[0.04] py-1.5 last:border-0">
            <div className="flex items-center gap-2">
              {Icons.check('w-3.5 h-3.5 text-emerald-300')}
              <p className="text-xs text-slate-300">{label}</p>
            </div>
            <p className="text-xs text-slate-500">{status}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-3">
        <p className="text-sm font-semibold text-white">Monitored conditions</p>
        {[
          'Heavy rain: rainfall > 70%',
          'Extreme heat: temperature > 85%',
          'High AQI: AQI > 80%',
          'Flood: rainfall > 80% plus city risk > 70%',
          'Platform outage: deterministic 10% mock event',
        ].map((line) => (
          <div key={line} className="flex items-start gap-2">
            {Icons.alert('w-3.5 h-3.5 text-cyan-300 mt-0.5 shrink-0')}
            <p className="text-xs text-slate-400">{line}</p>
          </div>
        ))}
      </div>

      {activeAlert && (
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">Latest disruption signal</p>
          <p className="mt-1 text-base font-bold text-white">{activeAlert.type}</p>
          <p className="mt-1 text-xs text-slate-300">This alert was detected automatically and evaluated against cooldown + eligibility checks.</p>
        </div>
      )}

      {latestClaim && (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Latest auto claim</p>
              <p className="mt-0.5 text-base font-bold text-white">{latestClaim.disruption}</p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[latestClaim.status]}`}>
              {latestClaim.status}
            </span>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 flex items-center gap-2">
            {Icons.check('w-4 h-4 text-emerald-300')}
            <p className="text-xs font-semibold text-emerald-200">Claim processed automatically</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/[0.04] p-3">
              <p className="text-xs text-slate-500">Lost hours</p>
              <p className="text-lg font-bold text-white">{latestClaim.lostHours}h</p>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-3">
              <p className="text-xs text-slate-500">Confidence</p>
              <p className="text-lg font-bold text-white">{(latestClaim.confidence * 100).toFixed(0)}%</p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
            <p className="text-xs text-slate-400">Payout amount</p>
            <p className="text-3xl font-black text-emerald-300">Rs {latestClaim.payout}</p>
          </div>
        </div>
      )}
    </div>
  );
}
