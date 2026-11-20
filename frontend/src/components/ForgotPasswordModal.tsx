import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { KeyRound, Mail, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Send, RefreshCw, ShieldCheck } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  initialIdentifier?: string;
  onClose: () => void;
  onProceedToLogin: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  initialIdentifier = '',
  onClose,
  onProceedToLogin,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync initial identifier when opened
  useEffect(() => {
    if (isOpen) {
      if (initialIdentifier) {
        setIdentifier(initialIdentifier);
      }
      setStep(1);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialIdentifier]);

  if (!isOpen) return null;

  // Step 1: Send OTP to Candidate's Email from winoraproject@gmail.com
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Please enter your registered Email or Candidate ID.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await api.requestPasswordReset(identifier.trim());
      if (res.success) {
        const destEmail = res.candidateEmail || identifier.trim();
        setCandidateEmail(destEmail);
        setSuccessMsg(`OTP sent successfully to candidate email: ${destEmail}`);
        setStep(2);
      } else {
        setErrorMsg(res.message || 'No registered candidate found with this Email or Candidate ID.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error sending OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP in Step 2
  const handleResendOtp = async () => {
    setResending(true);
    setErrorMsg(null);
    try {
      const res = await api.requestPasswordReset(identifier.trim());
      if (res.success) {
        setSuccessMsg(`Fresh OTP sent to ${res.candidateEmail || candidateEmail || identifier}! Please check inbox.`);
      } else {
        setErrorMsg(res.message || 'Failed to resend OTP.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error resending OTP.');
    } finally {
      setResending(false);
    }
  };

  // Step 2: Strictly Verify OTP Code BEFORE unlocking password update
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setErrorMsg('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await api.verifyResetOtp(identifier.trim(), otp.trim());
      if (res.success) {
        setSuccessMsg('Email OTP verified successfully! You may now set your new password.');
        setStep(3);
      } else {
        setErrorMsg(res.message || 'Incorrect OTP code. Please check your email inbox.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to verify OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set New Password (Allowed ONLY after OTP is verified!)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setErrorMsg('Please enter and confirm your new password.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.resetPasswordWithOtp(identifier.trim(), otp.trim(), newPassword);
      if (res.success) {
        setSuccessMsg('Password updated successfully! Redirecting to login...');
        setTimeout(() => {
          onClose();
          onProceedToLogin();
        }, 1500);
      } else {
        setErrorMsg(res.message || 'Failed to update password.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
              <img src="/inzovate-logo.png" alt="Inzovate Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                Password Recovery
              </span>
              <h3 className="text-xl font-black text-[#0A1128] mt-0.5">Forgot Password</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold">
          <div className={`py-1.5 rounded-lg border transition-colors ${
            step === 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-500 border-slate-200'
          }`}>
            1. Send OTP
          </div>
          <div className={`py-1.5 rounded-lg border transition-colors ${
            step === 2 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-500 border-slate-200'
          }`}>
            2. Verify OTP
          </div>
          <div className={`py-1.5 rounded-lg border transition-colors ${
            step === 3 ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-500 border-slate-200'
          }`}>
            3. New Password
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Enter Identifier & Click Send OTP */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
            <div className="space-y-1">
              <p className="text-slate-600 leading-relaxed font-medium">
                Enter your registered Candidate Email or Candidate ID below and click <strong>"Send OTP"</strong>.
              </p>
              <p className="text-[11px] text-slate-500">
                A 6-digit secure code will be dispatched directly to your inbox from <strong className="text-blue-700 font-mono">winoraproject@gmail.com</strong>.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Candidate Email or Candidate ID *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. mousik2001@gmail.com or INZ-CAND-2026-00008"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Sending OTP to Email...' : 'Send OTP'}</span>
            </button>
          </form>
        )}

        {/* STEP 2: Enter 6-digit OTP & Verify */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] space-y-1">
              <p>
                An OTP email has been sent from <strong className="font-mono text-blue-700">winoraproject@gmail.com</strong> to:
              </p>
              <p className="font-mono font-bold text-blue-800 break-all text-xs">
                {candidateEmail || identifier}
              </p>
              <p className="text-[10px] text-slate-500 pt-1">
                Please check your inbox (and spam/junk folder) and enter the 6-digit code below.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Enter 6-Digit Email OTP *</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-center tracking-widest text-base font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                <span>{resending ? 'Resending...' : 'Resend OTP'}</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[11px] text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Change Email / ID
              </button>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Verifying...' : 'Verify OTP'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Unlock New Password fields */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>OTP Verified! Create your new password below.</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">New Password (Min 6 Characters) *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Saving...' : 'Save New Password & Login'}</span>
                <KeyRound className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
