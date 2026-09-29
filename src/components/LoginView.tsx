import React, { useState } from 'react';
import {
  LogIn,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginView: React.FC = () => {
  const { loginWithCredentials } = useApp();

  // Form State
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = loginWithCredentials(usernameInput, passwordInput);
      if (res.success) {
        setSuccessMessage('Autentikasi berhasil! Mengarahkan...');
      } else {
        setErrorMessage(res.message || 'Login gagal. Periksa username dan password Anda.');
        setIsSubmitting(false);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none">
      {/* Top Bar Branding */}
      <div className="max-w-md w-full mx-auto flex items-center justify-center space-x-3 pt-4 sm:pt-8">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 p-0.5 shadow-lg shadow-blue-500/25 flex items-center justify-center shrink-0">
          <div className="w-full h-full bg-slate-900/80 rounded-[14px] flex items-center justify-center text-white">
            <Building2 className="w-5 h-5 text-blue-400" />
          </div>
        </div>
        <div className="text-left">
          <h2 className="text-sm font-bold text-white tracking-wide">Portal SPK & WBS Topografi</h2>
          <p className="text-xs text-slate-400 font-medium">Copyright © PT Sucofindo Cabang Palembang</p>
        </div>
      </div>

      {/* Main Login Card - Clean Dashboard Login */}
      <div className="max-w-md w-full mx-auto my-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-800">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Masuk ke Akun
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Portal Pengawasan SPK & WBS Topografi
            </p>
          </div>

          {/* Status Notifications */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Regular Login Form */}
          <form onSubmit={handleFormLogin} className="space-y-4">
            {/* Username / Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => {
                    setUsernameInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Masukkan username atau email akun"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Masukkan password akun"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Help */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 transition"
                />
                <span>Ingat saya</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setErrorMessage('Silakan hubungi Super Admin untuk bantuan reset kata sandi akun.');
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer"
              >
                Lupa password?
              </button>
            </div>

            {/* Submit Button: Clean "Masuk" */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-600/30 flex items-center justify-center space-x-2 transition transform active:scale-[0.99] disabled:opacity-70 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'Memproses...' : 'Masuk'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-md w-full mx-auto text-center pb-4 text-[11px] text-slate-400">
        <p className="text-slate-400 font-medium">Copyright © PT Sucofindo Cabang Palembang</p>
      </div>
    </div>
  );
};
