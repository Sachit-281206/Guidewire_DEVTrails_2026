import { useState, useEffect, useCallback } from 'react';
import { getPremium, activatePolicy, getPolicy, startShift, endShift, getShift, getClaims, getMonitoring } from '../api';
import { Icons } from '../components/Icons';
import HomeTab    from '../components/tabs/HomeTab';
import PolicyTab  from '../components/tabs/PolicyTab';
import WorkTab    from '../components/tabs/WorkTab';
import ClaimsTab  from '../components/tabs/ClaimsTab';
import ProfileTab from '../components/tabs/ProfileTab';

const TABS = [
  { id: 'home',    Icon: Icons.home,    label: 'Home' },
  { id: 'policy',  Icon: Icons.shield,  label: 'Policy' },
  { id: 'work',    Icon: Icons.work,    label: 'Work' },
  { id: 'claims',  Icon: Icons.claims,  label: 'Claims' },
  { id: 'profile', Icon: Icons.profile, label: 'Profile' },
];

const TAB_TITLES = { home: 'Dashboard', policy: 'My Policy', work: 'Work Session', claims: 'My Claims', profile: 'Profile' };

export default function Dashboard({ user, onLogout }) {
  const [tab, setTab] = useState('home');
  const [premium, setPremium] = useState(null);
  const [riskLevel, setRiskLevel] = useState(null);
  const [riskScore, setRiskScore] = useState(null);
  const [riskSource, setRiskSource] = useState(null);
  const [riskPayload, setRiskPayload] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [shift, setShift] = useState(null);
  const [claims, setClaims] = useState([]);
  const [latestClaim, setLatestClaim] = useState(null);
  const [monitoring, setMonitoring] = useState(null);
  const [loadingPremium, setLoadingPremium] = useState(false);
  const [loadingPolicy, setLoadingPolicy] = useState(false);
  const [loadingShift, setLoadingShift] = useState(false);

  const refreshClaims = useCallback(async () => {
    const data = await getClaims(user._id);
    if (Array.isArray(data)) {
      setClaims(data);
      setLatestClaim(data[0] || null);
    }
  }, [user._id]);

  const refreshCore = useCallback(async () => {
    const [policyData, shiftData, monitoringData] = await Promise.all([
      getPolicy(user._id),
      getShift(user._id),
      getMonitoring(user._id),
    ]);

    setPolicy(policyData?._id ? policyData : null);
    setShift(shiftData?._id ? shiftData : null);
    setMonitoring(monitoringData?.city ? monitoringData : null);
  }, [user._id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshCore();
      refreshClaims();
    }, 0);

    return () => clearTimeout(timer);
  }, [refreshCore, refreshClaims]);

  useEffect(() => {
    const timer = setInterval(() => {
      refreshCore();
      refreshClaims();
    }, 12000);
    return () => clearInterval(timer);
  }, [refreshCore, refreshClaims]);

  const handleGetPremium = async () => {
    setLoadingPremium(true);
    const data = await getPremium(user._id);
    if (data.premium) {
      setPremium(data.premium);
      setRiskLevel(data.riskLevel);
      setRiskScore(data.risk);
      setRiskSource(data.source);
      setRiskPayload(data.payload);
      setBreakdown(data.breakdown || null);
      setMonitoring(prev => prev ? { ...prev, environment: data.environment || prev.environment } : prev);
    }
    setLoadingPremium(false);
  };

  const handleActivatePolicy = async () => {
    if (!premium) return;
    setLoadingPolicy(true);
    const data = await activatePolicy(user._id, premium);
    if (data._id) setPolicy(data);
    await refreshCore();
    setLoadingPolicy(false);
  };

  const handleShiftToggle = async () => {
    setLoadingShift(true);
    if (shift) await endShift(user._id);
    else await startShift(user._id);
    await refreshCore();
    setLoadingShift(false);
  };

  const sharedProps = {
    user,
    policy,
    shift,
    claims,
    premium,
    riskLevel,
    riskScore,
    riskSource,
    riskPayload,
    breakdown,
    monitoring,
    latestClaim,
  };

  return (
    <div className="h-screen overflow-hidden bg-[#08111f] px-3 py-4">
      <div className="mx-auto flex h-[calc(100vh-2rem)] max-w-[400px] flex-col overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#0d1728] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 pt-8 pb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500 text-white">
              {Icons.logo('w-4 h-4')}
            </div>
            <div>
              <span className="block text-sm font-black tracking-tight text-white">InsureGig</span>
              <span className="block text-[10px] uppercase tracking-[0.24em] text-cyan-300/70">Auto Protection</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {monitoring?.monitoringActive && (
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-medium text-emerald-300">Monitoring</span>
              </div>
            )}
            <span className="text-sm font-medium text-slate-400">{TAB_TITLES[tab]}</span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {tab === 'home'    && <HomeTab   {...sharedProps} onGetPremium={handleGetPremium} loadingPremium={loadingPremium} />}
          {tab === 'policy'  && <PolicyTab {...sharedProps} onGetPremium={handleGetPremium} onActivate={handleActivatePolicy} loadingPremium={loadingPremium} loadingPolicy={loadingPolicy} />}
          {tab === 'work'    && <WorkTab   policy={policy} shift={shift} latestClaim={latestClaim} monitoring={monitoring} onShiftToggle={handleShiftToggle} loadingShift={loadingShift} />}
          {tab === 'claims'  && <ClaimsTab claims={claims} />}
          {tab === 'profile' && <ProfileTab user={user} claims={claims} onLogout={onLogout} />}
        </div>

        <div className="border-t border-white/[0.07] bg-[#0d1728]/95 px-2 py-2 backdrop-blur-md shrink-0">
          <div className="flex justify-around">
            {TABS.map(({ id, Icon, label }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all ${active ? 'text-cyan-300' : 'text-slate-600 hover:text-slate-400'}`}
                >
                  <div className={`flex h-6 w-6 items-center justify-center ${active ? 'text-cyan-300' : ''}`}>
                    {Icon('w-5 h-5')}
                  </div>
                  <span className={`text-xs font-semibold ${active ? 'text-cyan-300' : ''}`}>{label}</span>
                  {active && <span className="h-1 w-1 rounded-full bg-cyan-300"></span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
