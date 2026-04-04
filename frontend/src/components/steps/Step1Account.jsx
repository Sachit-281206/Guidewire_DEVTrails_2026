import { useState } from 'react';
import { Icons } from '../Icons';

const inputCls = "w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition";

export default function Step1Account({ data, onNext }) {
  const [mode,        setMode]        = useState(data.accountMode || (data.email ? 'email' : 'phone'));
  const [identifier,  setId]          = useState(data.identifier || data.phone || data.email || '');
  const [password,    setPassword]    = useState(data.password || '');
  const [confirmPass, setConfirmPass] = useState('');
  const [otp,         setOtp]         = useState('');
  const [otpSent,     setOtpSent]     = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);

  const isPhone = mode === 'phone';

  const validateIdentifier = () => {
    if (isPhone) return /^\d{10}$/.test(identifier);
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  };

  const handleSendOtp = () => {
    setError('');
    if (!validateIdentifier()) {
      setError(isPhone ? 'Enter a valid 10-digit phone number' : 'Enter a valid email address');
      return;
    }
    setLoading(true);
    setTimeout(() => { setOtpSent(true); setLoading(false); }, 1000);
  };

  const handleVerifyOtp = () => {
    setError('');
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return; }
    setOtpVerified(true);
  };

  const handleNext = () => {
    setError('');
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPass)          { setError('Passwords do not match'); return; }
    const cleanIdentifier = isPhone ? identifier.replace(/\D/g, '') : identifier.trim().toLowerCase();
    onNext({
      accountMode: mode,
      identifier: cleanIdentifier,
      password,
      ...(isPhone ? { phone: cleanIdentifier, email: '' } : { email: cleanIdentifier, phone: '' }),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white font-black text-2xl">Create Account</h2>
        <p className="text-slate-400 text-sm mt-1">Sign up with your phone or email</p>
      </div>

      {/* Mode toggle */}
      <div className="flex bg-white/[0.05] rounded-xl p-1">
              {['phone', 'email'].map(m => (
          <button key={m} type="button"
            onClick={() => { setMode(m); setOtpSent(false); setOtpVerified(false); setError(''); setId(''); setOtp(''); setPassword(''); setConfirmPass(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${mode === m ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {m === 'phone' ? 'Phone' : 'Email'}
          </button>
        ))}
      </div>

      {/* Step A — identifier + OTP */}
      {!otpVerified && (
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              {isPhone ? Icons.user('w-4 h-4') : Icons.mail('w-4 h-4')}
            </div>
            <input
              type={isPhone ? 'tel' : 'email'}
              placeholder={isPhone ? '10-digit mobile number' : 'Email address'}
              value={identifier}
              onChange={e => setId(isPhone ? e.target.value.replace(/\D/g, '') : e.target.value)}
              maxLength={isPhone ? 10 : undefined}
              disabled={otpSent}
              className={`${inputCls} pl-10 ${otpSent ? 'opacity-60' : ''}`}
            />
          </div>

          {!otpSent ? (
            <button type="button" onClick={handleSendOtp} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl text-sm transition disabled:opacity-50">
              {loading ? 'Sending OTP...' : `Send OTP via ${isPhone ? 'SMS' : 'Email'}`}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                <p className="text-blue-300 text-xs">
                  OTP sent to <span className="font-bold">{identifier}</span>
                </p>
                <p className="text-slate-500 text-xs mt-0.5">(Enter any 6-digit number for demo)</p>
              </div>

              {/* OTP boxes */}
              <div className="flex gap-2 justify-center">
                {Array.from({ length: 6 }).map((_, i) => (
                  <input key={i} type="text" maxLength={1} inputMode="numeric"
                    value={otp[i] || ''}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/, '');
                      const arr = otp.split('');
                      arr[i] = val;
                      setOtp(arr.join(''));
                      if (val && e.target.nextSibling) e.target.nextSibling.focus();
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !otp[i] && e.target.previousSibling)
                        e.target.previousSibling.focus();
                    }}
                    className="w-11 h-12 bg-white/[0.05] border border-white/10 rounded-xl text-white text-center text-lg font-bold focus:outline-none focus:border-blue-500 transition"
                  />
                ))}
              </div>

              <button type="button" onClick={handleVerifyOtp}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl text-sm transition">
                Verify OTP
              </button>
              <button type="button" onClick={() => { setOtpSent(false); setOtp(''); }}
                className="w-full text-slate-500 hover:text-slate-300 text-xs py-1 transition">
                Change {isPhone ? 'number' : 'email'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step B — password (shown after OTP verified, for BOTH phone and email) */}
      {otpVerified && (
        <div className="space-y-4">
          {/* Verified badge */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              {Icons.check('w-3.5 h-3.5')}
            </div>
            <div>
              <p className="text-emerald-300 font-semibold text-sm">Verified</p>
              <p className="text-slate-400 text-xs">{identifier}</p>
            </div>
          </div>

          {/* Password fields */}
          <div className="space-y-3">
            <div>
              <label className="text-slate-400 text-xs font-medium mb-1.5 block">Create Password</label>
              <input type="password" placeholder="Min. 6 characters" value={password}
                onChange={e => setPassword(e.target.value)}
                className={inputCls} />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-medium mb-1.5 block">Confirm Password</label>
              <input type="password" placeholder="Re-enter password" value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                className={inputCls} />
            </div>
            <p className="text-slate-500 text-xs">
              You'll use this password to log in with your {isPhone ? 'phone number' : 'email'}.
            </p>
          </div>

          <button type="button" onClick={handleNext}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl text-sm transition flex items-center justify-center gap-2">
            Continue {Icons.arrowRight('w-4 h-4')}
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          {Icons.alert('w-4 h-4 text-red-400 shrink-0')}
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}
