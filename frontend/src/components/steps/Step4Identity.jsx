import { useState } from 'react';
import { Icons } from '../Icons';

const inputCls = "w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition";

function FileUpload({ label, value, onChange }) {
  return (
    <div>
      <label className="text-slate-400 text-xs font-medium mb-1.5 block">{label}</label>
      <label className={`flex items-center gap-3 cursor-pointer w-full bg-white/[0.05] border ${value ? 'border-emerald-500/40' : 'border-white/10 border-dashed'} rounded-xl px-4 py-3.5 transition hover:border-blue-500/50`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${value ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.05] text-slate-500'}`}>
          {value ? Icons.check('w-4 h-4') : Icons.claims('w-4 h-4')}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium truncate ${value ? 'text-emerald-300' : 'text-slate-400'}`}>
            {value ? value.name : 'Tap to upload'}
          </p>
          <p className="text-slate-600 text-xs">JPG, PNG or PDF</p>
        </div>
        <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => onChange(e.target.files[0])} />
      </label>
    </div>
  );
}

export default function Step4Identity({ data, onNext }) {
  const [aadhaar, setAadhaar]   = useState(data.aadhaar || '');
  const [pan, setPan]           = useState(data.pan || '');
  const [aadhaarF, setAadhaarF] = useState(null);
  const [aadhaarB, setAadhaarB] = useState(null);
  const [panFile, setPanFile]   = useState(null);
  const [error, setError]       = useState('');

  const isVerified = aadhaar.length === 12 && pan.length >= 10 && aadhaarF && aadhaarB && panFile;

  const handleNext = () => {
    setError('');
    // Optional — user can skip
    onNext({ aadhaar, pan, isVerified: !!isVerified });
  };

  const handleSkip = () => onNext({ aadhaar: '', pan: '', isVerified: false });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-black text-2xl">Identity Verification</h2>
        <p className="text-slate-400 text-sm mt-1">Required for claim eligibility</p>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2">
        {Icons.alert('w-4 h-4 text-amber-400 shrink-0 mt-0.5')}
        <p className="text-amber-300 text-xs leading-relaxed">
          Only verified users are eligible for payouts. You can skip now and verify later.
        </p>
      </div>

      <div className="space-y-3">
        {/* Aadhaar */}
        <div>
          <label className="text-slate-400 text-xs font-medium mb-1.5 block">Aadhaar Number</label>
          <input placeholder="12-digit Aadhaar number" value={aadhaar} maxLength={12} inputMode="numeric"
            onChange={e => setAadhaar(e.target.value.replace(/\D/g, ''))}
            className={inputCls} />
        </div>

        {/* PAN */}
        <div>
          <label className="text-slate-400 text-xs font-medium mb-1.5 block">PAN Number</label>
          <input placeholder="e.g. ABCDE1234F" value={pan} maxLength={10}
            onChange={e => setPan(e.target.value.toUpperCase())}
            className={`${inputCls} uppercase tracking-widest`} />
        </div>

        {/* File uploads */}
        <FileUpload label="Aadhaar Card — Front" value={aadhaarF} onChange={setAadhaarF} />
        <FileUpload label="Aadhaar Card — Back"  value={aadhaarB} onChange={setAadhaarB} />
        <FileUpload label="PAN Card"              value={panFile}  onChange={setPanFile}  />
      </div>

      {/* Verification status */}
      {isVerified && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2">
          {Icons.check('w-4 h-4 text-emerald-400')}
          <p className="text-emerald-300 text-xs font-semibold">Identity verified — eligible for full payouts</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          {Icons.alert('w-4 h-4 text-red-400 shrink-0')}
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      <button type="button" onClick={handleNext}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-2xl text-sm transition flex items-center justify-center gap-2">
        {isVerified ? 'Continue Verified' : 'Continue'} {Icons.arrowRight('w-4 h-4')}
      </button>
      <button type="button" onClick={handleSkip}
        className="w-full text-slate-500 hover:text-slate-300 text-xs py-2 transition">
        Skip for now — verify later
      </button>
    </div>
  );
}
