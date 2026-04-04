import { Icons } from '../Icons';

const statusStyles = {
  FULL: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  PARTIAL: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
  REVIEW: 'bg-rose-500/20 text-rose-200 border-rose-500/30',
};

const disruptionIcon = {
  Rain: Icons.rain,
  Heat: Icons.heat,
  AQI: Icons.pollution,
  Flood: Icons.rain,
  Outage: Icons.alert,
};

export default function ClaimsTab({ claims }) {
  const totalPayout = claims.reduce((sum, claim) => sum + claim.payout, 0);
  const fullCount = claims.filter((claim) => claim.status === 'FULL').length;
  const partialCount = claims.filter((claim) => claim.status === 'PARTIAL').length;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-[linear-gradient(135deg,#0f766e,#134e4a)] p-5">
        <p className="mb-1 text-xs font-medium text-emerald-100">Automated claim payouts</p>
        <p className="text-3xl font-black text-white">Rs {totalPayout.toFixed(0)}</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: 'Claims', value: claims.length },
            { label: 'Full', value: fullCount },
            { label: 'Partial', value: partialCount },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-white/10 p-2.5 text-center">
              <p className="text-xs text-emerald-100/70">{label}</p>
              <p className="font-bold text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {claims.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-slate-500">
            {Icons.claims('w-6 h-6')}
          </div>
          <p className="text-sm font-semibold text-white">No claims yet</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">The system will create claims automatically when a monitored disruption hits during an active protected shift.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => {
            const ClaimIcon = disruptionIcon[claim.disruption] || Icons.alert;
            return (
              <div key={claim._id} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-slate-300 shrink-0">
                      {ClaimIcon('w-4 h-4')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{claim.disruption}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(claim.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyles[claim.status]}`}>
                    {claim.status}
                  </span>
                </div>
                <div className="mb-3 grid grid-cols-3 gap-2">
                  {[
                    { label: 'Trigger', value: claim.triggerType },
                    { label: 'Confidence', value: `${(claim.confidence * 100).toFixed(0)}%` },
                    { label: 'Payout', value: `Rs ${claim.payout}`, green: true },
                  ].map(({ label, value, green }) => (
                    <div key={label} className="rounded-xl bg-white/[0.04] p-2 text-center">
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className={`text-sm font-bold ${green ? 'text-emerald-300' : 'text-white'}`}>{value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5">
                  {Icons.check('w-3.5 h-3.5 text-emerald-300')}
                  <p className="text-xs font-medium text-emerald-200">Payout calculated automatically from severity, ML risk, and confidence.</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
