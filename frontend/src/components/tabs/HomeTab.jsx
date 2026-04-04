import { Icons } from '../Icons';

const triggerColors = {
  RAIN: 'bg-sky-500/10 border-sky-500/20 text-sky-200',
  HEAT: 'bg-orange-500/10 border-orange-500/20 text-orange-200',
  AQI: 'bg-slate-500/10 border-slate-400/20 text-slate-200',
  FLOOD: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-200',
  OUTAGE: 'bg-rose-500/10 border-rose-500/20 text-rose-200',
};

const triggerIcons = {
  RAIN: Icons.rain,
  HEAT: Icons.heat,
  AQI: Icons.pollution,
  FLOOD: Icons.rain,
  OUTAGE: Icons.alert,
};

function Metric({ label, value, color, danger }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs text-slate-500">{label}</p>
        <p className={`text-xs font-bold ${danger ? 'text-rose-300' : 'text-white'}`}>{Math.round(value * 100)}%</p>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06]">
        <div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
    </div>
  );
}

export default function HomeTab({ user, policy, shift, claims, riskLevel, onGetPremium, loadingPremium, monitoring }) {
  const policyActive = policy && new Date() <= new Date(policy.endDate);
  const environment = monitoring?.environment;
  const activeAlert = monitoring?.activeAlert;
  const latestClaim = monitoring?.latestClaim || claims[0];
  const totalPayout = claims.reduce((sum, claim) => sum + claim.payout, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.35),_transparent_45%),linear-gradient(135deg,_#10304a,_#0f1c33_65%,_#091221)] p-5">
        <p className="mb-1 text-xs font-medium text-cyan-200">Live protection dashboard</p>
        <p className="text-xl font-black text-white">{user.name}</p>
        <p className="mt-0.5 text-xs text-cyan-100/80">{user.platform} in {user.city}</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: 'Daily', value: `Rs ${user.dailyIncome}` },
            { label: 'Claims', value: claims.length },
            { label: 'Paid', value: `Rs ${totalPayout.toFixed(0)}` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl bg-white/10 p-2.5 text-center">
              <p className="text-[11px] text-cyan-100/70">{label}</p>
              <p className="text-sm font-bold text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-2xl border p-4 ${policyActive ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/[0.07] bg-white/[0.03]'}`}>
          <div className="mb-2 flex items-center gap-1.5">
            {Icons.shield(`w-3.5 h-3.5 ${policyActive ? 'text-emerald-400' : 'text-slate-500'}`)}
            <p className="text-xs text-slate-400">Policy</p>
          </div>
          <p className={`text-sm font-bold ${policyActive ? 'text-emerald-300' : 'text-slate-500'}`}>{policyActive ? 'Active' : 'Inactive'}</p>
        </div>
        <div className={`rounded-2xl border p-4 ${shift ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/[0.07] bg-white/[0.03]'}`}>
          <div className="mb-2 flex items-center gap-1.5">
            {Icons.work(`w-3.5 h-3.5 ${shift ? 'text-emerald-400' : 'text-slate-500'}`)}
            <p className="text-xs text-slate-400">Shift</p>
          </div>
          <p className={`text-sm font-bold ${shift ? 'text-emerald-300' : 'text-slate-500'}`}>{shift ? 'On duty' : 'Off duty'}</p>
        </div>
      </div>

      {!riskLevel && (
        <button
          onClick={onGetPremium}
          disabled={loadingPremium}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 py-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
        >
          {Icons.trending('w-4 h-4')}
          {loadingPremium ? 'Refreshing premium...' : 'Recalculate dynamic premium'}
        </button>
      )}

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icons.signal('w-4 h-4 text-cyan-300')}
            <p className="text-sm font-semibold text-white">Live Monitoring Panel</p>
          </div>
          <span className={`text-xs font-medium ${monitoring?.monitoringActive ? 'text-emerald-300' : 'text-amber-300'}`}>
            {monitoring?.monitoringActive ? 'Monitoring environment...' : 'Waiting for active policy + shift'}
          </span>
        </div>
        {environment ? (
          <div className="space-y-3">
            <Metric label="Rainfall" value={environment.rainfall} color="bg-sky-500" danger={environment.rainfall > 0.7} />
            <Metric label="Temperature" value={environment.temperature} color="bg-orange-500" danger={environment.temperature > 0.85} />
            <Metric label="AQI" value={environment.aqi} color="bg-violet-500" danger={environment.aqi > 0.8} />
            <p className="pt-1 text-center text-xs text-slate-500">
              Source: {environment.source} | Updated {new Date(environment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-500">Waiting for environment snapshot...</p>
        )}
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-3">
        <div className="flex items-center gap-2">
          {Icons.alert('w-4 h-4 text-amber-300')}
          <p className="text-sm font-semibold text-white">Auto Alerts</p>
        </div>
        {activeAlert ? (() => {
          const AlertIcon = triggerIcons[activeAlert.type] || Icons.alert;
          return (
            <div className={`flex items-center gap-3 rounded-2xl border p-3 ${triggerColors[activeAlert.type] || 'bg-white/5 border-white/10 text-slate-200'}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                {AlertIcon('w-4 h-4')}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{activeAlert.type} detected</p>
                <p className="mt-0.5 text-xs opacity-75">
                  Rain {Math.round(activeAlert.inputs.rainfall * 100)}% | Temp {Math.round(activeAlert.inputs.temperature * 100)}% | AQI {Math.round(activeAlert.inputs.aqi * 100)}%
                </p>
              </div>
            </div>
          );
        })() : (
          <p className="text-xs text-slate-500">No active disruption in the latest monitoring cycle.</p>
        )}
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icons.claims('w-4 h-4 text-emerald-300')}
            <p className="text-sm font-semibold text-white">Claim Status</p>
          </div>
          {latestClaim && <span className="text-xs font-medium text-emerald-300">Claim processed automatically</span>}
        </div>
        {latestClaim ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-sm font-semibold text-white">{latestClaim.disruption}</p>
            <p className="mt-1 text-xs text-emerald-200/80">
              Payout Rs {latestClaim.payout} | Status {latestClaim.status}
            </p>
            <p className="mt-2 text-xs text-slate-300">
              Generated at {new Date(latestClaim.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-500">Claims will appear here once the engine detects a disruption during an active shift.</p>
        )}
      </div>
    </div>
  );
}
