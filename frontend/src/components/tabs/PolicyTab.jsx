import { Icons } from '../Icons';

const riskCls = { HIGH: 'text-rose-300', MEDIUM: 'text-amber-300', LOW: 'text-emerald-300' };
const riskBorder = { HIGH: 'border-rose-500/30 bg-rose-500/5', MEDIUM: 'border-amber-500/30 bg-amber-500/5', LOW: 'border-emerald-500/30 bg-emerald-500/5' };

function Row({ label, value, valueClass = 'text-slate-200' }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-xs font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}

export default function PolicyTab({ policy, premium, riskLevel, riskScore, riskSource, riskPayload, breakdown, onGetPremium, onActivate, loadingPremium, loadingPolicy, monitoring }) {
  const policyActive = policy && new Date() <= new Date(policy.endDate);

  return (
    <div className="space-y-4">
      <div className={`rounded-3xl p-5 ${policyActive ? 'bg-[linear-gradient(135deg,#0f766e,#134e4a)]' : 'bg-[linear-gradient(135deg,#334155,#1e293b)]'}`}>
        <p className="mb-1 text-xs font-medium text-slate-200">Coverage status</p>
        <p className="text-2xl font-black text-white">{policyActive ? 'Protected' : 'Protection inactive'}</p>
        <p className="mt-1 text-xs text-slate-300">
          {policyActive
            ? `Active until ${new Date(policy.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
            : 'Activate cover to let the system auto-monitor your shift.'}
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 space-y-4">
        <div className="flex items-center gap-2">
          {Icons.rupee('w-4 h-4 text-cyan-300')}
          <p className="text-sm font-semibold text-white">Dynamic premium</p>
        </div>

        {premium ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-white/[0.04] p-4">
              <div>
                <p className="text-xs text-slate-400">Weekly premium</p>
                <p className="text-3xl font-black text-white">Rs {premium}</p>
                <p className="mt-1 text-xs text-slate-500">Updated from live environment + ML risk score</p>
              </div>
              {riskLevel && <span className={`text-base font-black ${riskCls[riskLevel]}`}>{riskLevel}</span>}
            </div>

            {breakdown && (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 space-y-2">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Explainable pricing</p>
                <Row label="ML risk score" value={riskScore?.toFixed(2) || '0.00'} />
                <Row label="City risk" value={String(breakdown.cityRisk)} />
                <Row label="Season factor" value={`${breakdown.seasonFactor} (${breakdown.seasonLabel})`} />
                <Row label="Expected loss" value={`Rs ${breakdown.expectedLoss}`} />
                <Row label="Margin" value={`Rs ${breakdown.marginAdded}`} />
                <Row label="Transaction cost" value={`Rs ${breakdown.transactionCost}`} />
                <div className="border-t border-white/[0.06] pt-2">
                  <Row label="Total premium" value={`Rs ${premium}`} valueClass="text-white" />
                </div>
              </div>
            )}

            {riskPayload && (
              <div className={`rounded-2xl border p-4 ${riskBorder[riskLevel || 'LOW']}`}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Pricing inputs</p>
                  <span className="text-xs text-slate-300">{riskSource === 'ml' ? 'ML model' : 'Fallback'}</span>
                </div>
                <div className="space-y-2">
                  <Row label="Rainfall" value={String(riskPayload.rainfall)} />
                  <Row label="Temperature" value={String(riskPayload.temperature)} />
                  <Row label="AQI" value={String(riskPayload.aqi)} />
                  <Row label="Work hours" value={`${riskPayload.work_hours}h`} />
                  <Row label="Season flag" value={riskPayload.season === 1 ? 'Monsoon' : 'Standard'} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl bg-white/[0.04] p-5 text-center">
            <p className="text-sm text-slate-400">No premium calculated yet.</p>
            <p className="mt-1 text-xs text-slate-500">The quote uses ML risk, city risk, and seasonal exposure.</p>
          </div>
        )}

        <button
          onClick={onGetPremium}
          disabled={loadingPremium}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
        >
          {Icons.trending('w-4 h-4')}
          {loadingPremium ? 'Calculating...' : 'Refresh premium'}
        </button>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 space-y-3">
        <div className="flex items-center gap-2">
          {Icons.shield('w-4 h-4 text-emerald-300')}
          <p className="text-sm font-semibold text-white">Activation</p>
        </div>
        {policyActive ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-sm font-semibold text-emerald-200">Policy active</p>
            <p className="mt-1 text-xs text-slate-300">Premium paid: Rs {policy.premium}</p>
            <p className="mt-1 text-xs text-slate-400">Auto-monitoring turns on when the shift is active.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400">
              Once active, the user only needs to start a shift. The system handles monitoring, disruption detection, claims, and payout automatically.
            </p>
            <button
              onClick={onActivate}
              disabled={!premium || loadingPolicy}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {Icons.shield('w-4 h-4')}
              {loadingPolicy ? 'Activating...' : !premium ? 'Calculate premium first' : 'Activate 7-day coverage'}
            </button>
          </>
        )}
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-3">
        <p className="text-sm font-semibold text-white">Automation design</p>
        {[
          'Environment monitoring runs in the backend every 12 seconds.',
          'Triggers check rain, heat, AQI, flood risk, and platform outage.',
          'Cooldown prevents repeat claims for 5 minutes per active shift.',
          `Current mode: ${monitoring?.monitoringActive ? 'automation active' : 'awaiting active protection state'}.`,
        ].map((line) => (
          <div key={line} className="flex items-start gap-2">
            {Icons.check('w-3.5 h-3.5 text-emerald-300 mt-0.5 shrink-0')}
            <p className="text-xs text-slate-400">{line}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
