import { Icons } from '../Icons';

export default function ProfileTab({ user, claims, onLogout }) {
  const totalPayout = claims.reduce((sum, claim) => sum + claim.payout, 0);
  const displayName = user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User';
  const initials = displayName.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  const primaryContact = user.email || user.phone || 'No contact added';
  const accountDetails = [
    { label: 'Full Name', value: displayName },
    { label: 'Phone', value: user.phone || 'Not added' },
    { label: 'Email', value: user.email || 'Not added' },
    { label: 'Gender', value: user.gender || 'Not added' },
    { label: 'Date of Birth', value: user.dob || 'Not added' },
    { label: 'Platform', value: user.platform || 'Not added' },
    { label: 'City', value: user.city || 'Not added' },
    { label: 'UPI ID', value: user.upiId || 'Not added' },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.25),_transparent_45%),linear-gradient(135deg,_#1e3a5f,_#172033_70%,_#111827)] p-6 text-center">
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/20 bg-white/15 text-2xl font-black text-white">
          {initials}
        </div>
        <p className="text-xl font-black text-white">{displayName}</p>
        <p className="mt-1 break-all text-xs text-cyan-100/80">{primaryContact}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">{user.platform || 'Platform not added'}</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">{user.city || 'City not added'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { Icon: Icons.rupee, label: 'Daily Income', value: `Rs ${user.dailyIncome || 0}` },
          { Icon: Icons.trending, label: 'Total Earned', value: `Rs ${totalPayout.toFixed(0)}` },
          { Icon: Icons.claims, label: 'Total Claims', value: claims.length },
          { Icon: Icons.upi, label: 'UPI ID', value: user.upiId || 'Not added' },
        ].map(({ Icon, label, value }) => (
          <div key={label} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-slate-400">
              {Icon('w-4 h-4')}
            </div>
            <p className="text-xs text-slate-400">{label}</p>
            <p className="mt-0.5 break-words text-sm font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
        <div className="mb-3 flex items-center gap-2">
          {Icons.user('w-4 h-4 text-slate-400')}
          <p className="text-sm font-semibold text-white">Account Details</p>
        </div>
        <div className="space-y-3">
          {accountDetails.map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-1 break-words text-sm font-medium text-white">{value}</p>
            </div>
          ))}
          <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Identity Status</p>
            <p className={`mt-1 text-sm font-medium ${user.isVerified ? 'text-emerald-300' : 'text-amber-300'}`}>
              {user.isVerified ? 'Verified' : 'Pending verification'}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
        <p className="mb-2 text-sm font-semibold text-white">About InsureGig</p>
        <p className="text-xs leading-relaxed text-slate-400">
          InsureGig uses AI-powered parametric triggers to automatically detect disruptions and process claims, with zero manual claim filing for the user.
        </p>
        <p className="mt-3 text-xs italic text-slate-600">
          Zero-touch claims powered by parametric triggers and AI confidence scoring
        </p>
      </div>

      <button
        onClick={onLogout}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] py-4 text-sm font-semibold text-slate-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
      >
        {Icons.logout('w-4 h-4')}
        Sign Out
      </button>
    </div>
  );
}
