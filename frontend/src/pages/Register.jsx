import { useState } from 'react';
import { registerUser } from '../api';
import { Icons } from '../components/Icons';
import Step1Account  from '../components/steps/Step1Account';
import Step2Profile  from '../components/steps/Step2Profile';
import Step3Work     from '../components/steps/Step3Work';
import Step4Identity from '../components/steps/Step4Identity';
import Step5Payout   from '../components/steps/Step5Payout';
import Step6Location from '../components/steps/Step6Location';

const STEPS = [
  { label: 'Account'  },
  { label: 'Profile'  },
  { label: 'Work'     },
  { label: 'Identity' },
  { label: 'Payout'   },
  { label: 'Location' },
];

function ProgressBar({ current, total }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <p className="text-slate-400 text-xs">Step {current} of {total}</p>
        <p className="text-slate-400 text-xs">{STEPS[current - 1]?.label}</p>
      </div>
      <div className="flex gap-1">
        {STEPS.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
            i < current ? 'bg-blue-500' : 'bg-white/[0.08]'
          }`} />
        ))}
      </div>
    </div>
  );
}

function CompletionScreen({ data, onDashboard }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center mx-auto">
          {Icons.check('w-8 h-8 text-emerald-400')}
        </div>
        <div>
          <h2 className="text-white font-black text-2xl">You're all set!</h2>
          <p className="text-slate-400 text-sm mt-1">Your profile is ready. You can now activate coverage.</p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 space-y-3">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Profile Summary</p>
        {[
          { label: 'Name',         value: data.name                                    },
          { label: 'City',         value: data.city                                    },
          { label: 'Platform',     value: data.platform                                },
          { label: 'Daily Income', value: `₹${data.dailyIncome}`                       },
          { label: 'Work Type',    value: data.workType === 'fulltime' ? 'Full-time' : 'Part-time' },
          { label: 'Hourly Income',value: `₹${data.hourlyIncome}/hr`                   },
          { label: 'UPI ID',       value: data.upiId                                   },
          { label: 'Verified',     value: data.isVerified ? 'Yes' : 'Pending'          },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between py-1.5 border-b border-white/[0.05] last:border-0">
            <p className="text-slate-500 text-xs">{label}</p>
            <p className={`text-xs font-semibold ${label === 'Verified' && !data.isVerified ? 'text-amber-400' : 'text-white'}`}>{value}</p>
          </div>
        ))}
      </div>

      <button onClick={onDashboard}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl text-sm transition flex items-center justify-center gap-2">
        Go to Dashboard {Icons.arrowRight('w-4 h-4')}
      </button>
    </div>
  );
}

export default function Register({ onRegistered, onBack }) {
  const [step, setStep]       = useState(1);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [done, setDone]       = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const merge = (data) => setFormData(prev => ({ ...prev, ...data }));

  const handleStep = (stepData) => {
    merge(stepData);
    if (step < 6) { setStep(s => s + 1); return; }
    // Step 6 complete — submit
    submitAll({ ...formData, ...stepData });
  };

  const submitAll = async (data) => {
    setLoading(true); setError('');
    try {
      const payload = {
        phone:              (data.phone || '').trim(),
        email:              (data.email || '').trim().toLowerCase(),
        password:           data.password || 'insuregig_default',
        name:               (data.name || '').trim(),
        dob:                data.dob,
        gender:             data.gender,
        city:               (data.city || '').trim(),
        platform:           (data.platform || '').trim(),
        dailyIncome:        data.dailyIncome,
        avgWorkHours:       data.avgWorkHours,
        hourlyIncome:       data.hourlyIncome,
        aadhaar:            (data.aadhaar || '').trim(),
        pan:                (data.pan || '').trim().toUpperCase(),
        isVerified:         data.isVerified || false,
        upiId:              (data.upiId || '').trim().toLowerCase(),
        locationPermission: data.locationPermission || false,
      };
      const user = await registerUser(payload);
      if (user._id) {
        setRegisteredUser({ ...user, ...data });
        setDone(true);
      } else {
        setError(user.error || 'Registration failed');
      }
    } catch {
      setError('Server error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#08111f] px-3 py-4">
      <div className="mx-auto flex h-[calc(100vh-2rem)] max-w-[400px] flex-col overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#0d1728] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 pt-8 pb-4 shrink-0">
          <button onClick={step === 1 ? onBack : () => setStep(s => s - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-400 transition hover:text-white">
            {Icons.arrowLeft('w-4 h-4')}
          </button>
          <div className="min-w-0 flex-1">
            {!done ? (
              <ProgressBar current={step} total={6} />
            ) : (
              <div>
                <p className="text-sm font-black tracking-tight text-white">InsureGig</p>
                <p className="text-xs text-slate-400">Registration Complete</p>
              </div>
            )}
          </div>
          {!done && (
            <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1">
              <span className="text-[11px] font-semibold text-cyan-300">Next</span>
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-4">
              <div className="h-12 w-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></div>
              <p className="text-sm text-slate-400">Creating your account...</p>
            </div>
          ) : done ? (
            <CompletionScreen data={{ ...formData, ...registeredUser }} onDashboard={() => onRegistered(registeredUser)} />
          ) : (
            <>
              {step === 1 && <Step1Account  data={formData} onNext={handleStep} />}
              {step === 2 && <Step2Profile  data={formData} onNext={handleStep} />}
              {step === 3 && <Step3Work     data={formData} onNext={handleStep} />}
              {step === 4 && <Step4Identity data={formData} onNext={handleStep} />}
              {step === 5 && <Step5Payout   data={formData} onNext={handleStep} />}
              {step === 6 && <Step6Location data={formData} onNext={handleStep} />}
              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                  {Icons.alert('w-4 h-4 text-red-400 shrink-0')}
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
