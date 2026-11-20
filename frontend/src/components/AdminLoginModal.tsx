import React, { useState } from 'react';
import { api } from '../services/api';
import { Lock, ShieldAlert, ArrowRight, AlertCircle, Key } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminLoginSuccess: (adminUser: any, token: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onAdminLoginSuccess,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Please enter the Admin Security Password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.adminLogin(identifier, password);
      if (res.success && res.user) {
        localStorage.setItem('inzovate_token', res.token);
        onAdminLoginSuccess(res.user, res.token);
        onClose();
      } else {
        setErrorMsg(res.message || 'Access Denied. Invalid Admin Credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Administrator gateway error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#0A1128] text-white rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-700 shadow-md flex items-center justify-center shrink-0">
              <img src="/inzovate-logo.png" alt="Inzovate Technologies" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 font-mono">
                Restricted Access (Shortcut: Alt + A)
              </span>
              <h3 className="text-lg font-black text-white">Administrator Gateway</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-bold p-1"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-300 space-y-1">
          <p className="font-semibold text-sky-400 flex items-center space-x-1">
            <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
            <span>Authorized Administrator Access Only</span>
          </p>
          <p className="text-slate-400 text-[10px]">
            This terminal is restricted to Inzovate assessment administrators and drive controllers. All login attempts are cryptographically verified and recorded in the audit ledger.
          </p>
        </div>

        <form onSubmit={handleAdminSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Admin Username / Email</label>
            <input
              type="text"
              required
              placeholder="Enter administrator email or username..."
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Admin Security Password *</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="Enter admin password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-1.5"
          >
            <span>{loading ? 'Verifying Credentials...' : 'Unlock Admin Command Center'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
