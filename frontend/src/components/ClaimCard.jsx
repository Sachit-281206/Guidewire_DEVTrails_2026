const statusStyles = {
  FULL:    'bg-green-500/20 text-green-300 border-green-500/40',
  PARTIAL: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  REVIEW:  'bg-red-500/20 text-red-300 border-red-500/40',
};
const icons = { Rain: '🌧️', Heat: '🌡️', Pollution: '🌫️' };

export default function ClaimCard({ claim, compact = false }) {
  if (!claim) return null;
  if (compact) return (
    <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3">
      <div className="flex items-center gap-2">
        <span>{icons[claim.disruption] || '⚡'}</span>
        <div>
          <p className="text-white text-xs font-semibold">{claim.disruption}</p>
          <p className="text-blue-300 text-xs">{new Date(claim.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-green-400 font-bold text-sm">₹{claim.payout.toFixed(0)}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusStyles[claim.status]}`}>{claim.status}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white/10 border border-white/20 rounded-2xl p-5 space-y-4 animate-pulse-once">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-yellow-400 text-xs font-semibold">⚠️ Disruption Detected</p>
          <p className="text-white font-bold text-base">{icons[claim.disruption]} {claim.disruption}</p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusStyles[claim.status]}`}>
          {claim.status}
        </span>
      </div>

      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-2 text-center">
        <p className="text-green-300 text-xs font-semibold">✅ Claim Processed Automatically</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-blue-300 text-xs">Lost Hours</p>
          <p className="text-white font-bold text-lg">{claim.lostHours}h</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-blue-300 text-xs">AI Confidence</p>
          <p className="text-white font-bold text-lg">{(claim.confidence * 100).toFixed(0)}%</p>
        </div>
      </div>

      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
        <p className="text-green-300 text-xs mb-1">Payout Amount</p>
        <p className="text-green-400 font-black text-3xl">₹{claim.payout.toFixed(2)}</p>
        <p className="text-green-300 text-xs mt-2 font-semibold">💸 Amount Credited Instantly</p>
        <p className="text-blue-300/60 text-xs mt-1">→ {claim.upiId || 'UPI'}</p>
      </div>

      <p className="text-blue-300/60 text-xs text-center italic">
        Zero-touch claims powered by parametric triggers and AI confidence scoring
      </p>
    </div>
  );
}
