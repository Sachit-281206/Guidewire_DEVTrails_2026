import { Icons } from '../components/Icons';

export default function Home({ onLogin, onRegister }) {
  return (
    <div className="h-screen overflow-hidden bg-[#08111f] px-3 py-4">
      <div className="mx-auto flex h-[calc(100vh-2rem)] max-w-[400px] flex-col overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#0d1728] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-2 border-b border-white/[0.07] px-6 pt-8 pb-4 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500 text-white">
            {Icons.logo('w-4 h-4')}
          </div>
          <div>
            <span className="block text-sm font-black tracking-tight text-white">InsureGig</span>
            <span className="block text-[10px] uppercase tracking-[0.24em] text-cyan-300/70">Auto Protection</span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
          <div className="mb-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse"></span>
              <span className="text-xs font-medium text-cyan-300">AI-Powered Protection</span>
            </div>
            <h1 className="mb-3 text-4xl font-black leading-tight text-white">
              Income protection<br />
              <span className="text-cyan-300">built for gig workers</span>
            </h1>
            <p className="text-sm leading-relaxed text-slate-400">
              Parametric insurance that pays out automatically when disruptions affect your work. No claims. No paperwork.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { Icon: Icons.calendar, title: 'Weekly Coverage', desc: 'Activate 7-day protection instantly' },
              { Icon: Icons.rupee, title: 'Automatic Payouts', desc: 'Claims processed without any action from you' },
              { Icon: Icons.shield, title: 'Zero Manual Claims', desc: 'AI detects disruptions and credits your UPI' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300 shrink-0">
                  {Icon('w-4 h-4')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 border-t border-white/[0.07] px-6 py-5 shrink-0">
          <button onClick={onRegister}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 py-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-400">
            Create Account
            {Icons.arrowRight('w-4 h-4')}
          </button>
          <button onClick={onLogin}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-4 text-sm font-semibold text-white transition hover:bg-white/[0.08]">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
