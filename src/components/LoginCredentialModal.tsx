import React, { useState } from 'react';
import {
  X,
  KeyRound,
  Copy,
  Check,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  Compass,
  FileCheck2,
  HardHat,
  FileSpreadsheet,
  Layers,
  PencilRuler,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User, ActorType } from '../types';

interface LoginCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'list' | 'form' | 'matrix';
}

export const LoginCredentialModal: React.FC<LoginCredentialModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'list',
}) => {
  const { users, currentUser, switchUser, loginWithCredentials } = useApp();

  const [activeTab, setActiveTab] = useState<'list' | 'form' | 'matrix'>(initialTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Form states
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  const togglePasswordReveal = (userId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleDirectLogin = (user: User) => {
    switchUser(user.id);
    onClose();
  };

  const handleQuickFill = (user: User) => {
    setFormUsername(user.username || user.email);
    setFormPassword(user.password || '');
    setFormError(null);
    setFormSuccess(null);
    setActiveTab('form');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const res = loginWithCredentials(formUsername, formPassword);
    if (res.success) {
      setFormSuccess('Autentikasi berhasil! Mengarahkan ke dashboard...');
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setFormError(res.message || 'Login gagal.');
    }
  };

  // Helper metadata icon & color for each actor
  const getActorConfig = (actorType?: ActorType) => {
    switch (actorType) {
      case 'SUPER_ADMIN':
        return {
          icon: ShieldCheck,
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
          cardBorder: 'hover:border-purple-300',
          accent: 'purple',
          scopeSummary: 'Akses penuh kontrol sistem, multi-SPK, kelola baseline WBS, approval akhir, dan konfigurasi master.',
        };
      case 'KOORDINATOR_SURVEY':
        return {
          icon: Compass,
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
          cardBorder: 'hover:border-blue-300',
          accent: 'blue',
          scopeSummary: 'Supervisi teknis lapangan, perumusan jadwal & tanggal WBS, approval timesheet surveyor, kontrol kendala migas.',
        };
      case 'KOORDINATOR_SUBKONTRAKTOR':
        return {
          icon: FileCheck2,
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          cardBorder: 'hover:border-emerald-300',
          accent: 'emerald',
          scopeSummary: 'Koordinator pelaksana KJSB Subkhi Abdul Hakim & KJSB Syahrial, input progres mingguan & volume, pengajuan timesheet tim, koordinasi paket SPK.',
        };
      case 'SURVEYOR':
        return {
          icon: HardHat,
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
          cardBorder: 'hover:border-amber-300',
          accent: 'amber',
          scopeSummary: 'Pengukuran terestris, pengamatan GPS BM, drone LiDAR, input absensi harian / timesheet, catat kendala cuaca.',
        };
      case 'KOORDINATOR_ADMINISTRASI':
        return {
          icon: FileSpreadsheet,
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
          cardBorder: 'hover:border-rose-300',
          accent: 'rose',
          scopeSummary: 'Penyusunan berkas penagihan SPK, Call of Order (COO), monitoring BASTP & invoice, arsip laporan resmi.',
        };
      case 'KOORDINATOR_DRAFTER':
        return {
          icon: Layers,
          badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
          cardBorder: 'hover:border-cyan-300',
          accent: 'cyan',
          scopeSummary: 'Supervisi studio drafting, validasi peta kontur & siteplan migas, distribusi tugas CAD/GIS, review standar Pertamina.',
        };
      case 'DRAFTER':
        return {
          icon: PencilRuler,
          badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
          cardBorder: 'hover:border-teal-300',
          accent: 'teal',
          scopeSummary: 'Pengolahan raw data ukur ke AutoCAD/Civil3D & GIS, pembuatan layout tapak bor, input jam kerja timesheet.',
        };
      default:
        return {
          icon: ShieldCheck,
          badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
          cardBorder: 'hover:border-slate-300',
          accent: 'slate',
          scopeSummary: 'Pengguna umum sistem pemantauan proyek.',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 my-6 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Akses Akun Dummy & Kredensial Pengguna
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-900">
                  7 Aktor Lengkap
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Simulasi akun dengan username & password untuk setiap peran teknis proyek survey migas Zona 4
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center px-4 sm:px-6 border-b border-slate-200 bg-slate-50/70 shrink-0">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'list'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Daftar Akun Dummy (Username & PW)</span>
          </button>

          <button
            onClick={() => setActiveTab('form')}
            className={`py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'form'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Form Login Manual</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`py-3 px-3 sm:px-4 text-xs font-semibold border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'matrix'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Matriks Hak Akses</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/40">
          {/* TAB 1: LIST OF 7 ACCOUNTS */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start space-x-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Petunjuk Penggunaan:</span> Anda dapat langsung mengklik tombol{' '}
                  <strong className="font-bold">"Login Sekarang"</strong> pada baris aktor untuk langsung beralih akun,
                  atau salin username & password untuk menguji form login manual.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {users.map((u) => {
                  const cfg = getActorConfig(u.actorType);
                  const Icon = cfg.icon;
                  const isCurrent = currentUser.id === u.id;
                  const isRevealed = !!revealedPasswords[u.id];

                  return (
                    <div
                      key={u.id}
                      className={`p-4 rounded-xl border transition-all bg-white relative flex flex-col justify-between ${
                        isCurrent
                          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                          : `border-slate-200 ${cfg.cardBorder} hover:shadow-xs`
                      }`}
                    >
                      <div>
                        {/* Header: Avatar, Name, Actor badge */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3 min-w-0">
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center space-x-1.5 flex-wrap">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-flex items-center space-x-1 ${cfg.badgeColor}`}
                                >
                                  <Icon className="w-3 h-3 mr-1" />
                                  <span>{u.actorLabel || u.role}</span>
                                </span>
                                {isCurrent && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-600 text-white">
                                    Aktif Saat Ini
                                  </span>
                                )}
                              </div>
                              <h4 className="text-xs font-bold text-slate-900 mt-1 truncate" title={u.name}>
                                {u.name}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate" title={u.roleTitle}>
                                {u.roleTitle}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Credential Box (Username & Password) */}
                        <div className="mt-3.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
                          {/* Username */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[11px] font-medium text-slate-500">Username:</span>
                            <div className="flex items-center space-x-1.5">
                              <code className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                                {u.username}
                              </code>
                              <button
                                type="button"
                                onClick={() => handleCopy(u.username, `u-${u.id}`)}
                                title="Salin Username"
                                className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                              >
                                {copiedKey === `u-${u.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Password */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[11px] font-medium text-slate-500">Password:</span>
                            <div className="flex items-center space-x-1.5">
                              <code className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                                {isRevealed ? u.password : '••••••••'}
                              </code>
                              <button
                                type="button"
                                onClick={() => togglePasswordReveal(u.id)}
                                title={isRevealed ? 'Sembunyikan Password' : 'Lihat Password'}
                                className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                              >
                                {isRevealed ? (
                                  <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopy(u.password || '', `p-${u.id}`)}
                                title="Salin Password"
                                className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                              >
                                {copiedKey === `p-${u.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Brief scope description */}
                        <div className="mt-2.5 text-[11px] text-slate-500 leading-relaxed">
                          <span className="font-medium text-slate-700">Cakupan Kerja: </span>
                          {cfg.scopeSummary}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuickFill(u)}
                          className="text-[11px] font-semibold text-slate-600 hover:text-blue-600 transition"
                        >
                          Isi ke Form
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDirectLogin(u)}
                          disabled={isCurrent}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            isCurrent
                              ? 'bg-slate-100 text-slate-400 cursor-default'
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                          }`}
                        >
                          <span>{isCurrent ? 'Sedang Digunakan' : 'Login Sekarang'}</span>
                          {!isCurrent && <ArrowRight className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL LOGIN FORM */}
          {activeTab === 'form' && (
            <div className="max-w-md mx-auto py-2">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3">
                    <LogIn className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Login Simulasi Akun Proyek</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Masukkan username dan password dari salah satu dari 7 aktor teknis
                  </p>
                </div>

                {/* Quick Actor Selector Pills */}
                <div className="mb-5">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Pilih Cepat Kredensial Aktor:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setFormUsername(u.username);
                          setFormPassword(u.password || '');
                          setFormError(null);
                        }}
                        className={`text-[10px] font-semibold px-2 py-1 rounded-md border transition ${
                          formUsername === u.username
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {u.actorLabel || u.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback messages */}
                {formError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2 animate-in fade-in">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {formSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Username / Email:
                    </label>
                    <input
                      type="text"
                      required
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      placeholder="contoh: koordinator.survey atau superadmin"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password:
                    </label>
                    <div className="relative">
                      <input
                        type={showFormPassword ? 'text' : 'password'}
                        required
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder="Masukkan password"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFormPassword(!showFormPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showFormPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer mt-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Masuk ke Sistem</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: PERMISSION MATRIX */}
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-700">
                Tabel perbandingan kewenangan dan hak akses dari ke-7 aktor dalam operasional proyek WBS Pertamina EP Zona 4.
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">Modul & Fitur Sistem</th>
                      <th className="py-2.5 px-2 text-center text-purple-700">Super Admin</th>
                      <th className="py-2.5 px-2 text-center text-blue-700">Koord. Survey</th>
                      <th className="py-2.5 px-2 text-center text-emerald-700">Koord. Subkon</th>
                      <th className="py-2.5 px-2 text-center text-amber-700">Surveyor</th>
                      <th className="py-2.5 px-2 text-center text-rose-700">Koord. Admin</th>
                      <th className="py-2.5 px-2 text-center text-cyan-700">Koord. Drafter</th>
                      <th className="py-2.5 px-2 text-center text-teal-700">Drafter</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    <tr>
                      <td className="py-2 px-3 font-medium text-slate-800">Monitoring SPK & Buat/Edit SPK</td>
                      <td className="py-2 px-2 text-center text-emerald-600 font-bold">Full</td>
                      <td className="py-2 px-2 text-center text-blue-600">View/Edit</td>
                      <td className="py-2 px-2 text-center text-slate-400">View SPK</td>
                      <td className="py-2 px-2 text-center text-slate-300">-</td>
                      <td className="py-2 px-2 text-center text-blue-600">View Doc</td>
                      <td className="py-2 px-2 text-center text-slate-300">-</td>
                      <td className="py-2 px-2 text-center text-slate-300">-</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-slate-800">Atur Jadwal & WBS (Tanggal Mulai/Selesai)</td>
                      <td className="py-2 px-2 text-center text-emerald-600 font-bold">Ya</td>
                      <td className="py-2 px-2 text-center text-emerald-600 font-bold">Ya</td>
                      <td className="py-2 px-2 text-center text-slate-400">View</td>
                      <td className="py-2 px-2 text-center text-slate-400">View</td>
                      <td className="py-2 px-2 text-center text-slate-400">View</td>
                      <td className="py-2 px-2 text-center text-slate-400">View</td>
                      <td className="py-2 px-2 text-center text-slate-400">View</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-slate-800">Kunci Baseline WBS</td>
                      <td className="py-2 px-2 text-center text-emerald-600 font-bold">Ya</td>
                      <td className="py-2 px-2 text-center text-emerald-600 font-bold">Ya</td>
                      <td className="py-2 px-2 text-center text-slate-300">-</td>
                      <td className="py-2 px-2 text-center text-slate-300">-</td>
                      <td className="py-2 px-2 text-center text-slate-300">-</td>
                      <td className="py-2 px-2 text-center text-slate-300">-</td>
                      <td className="py-2 px-2 text-center text-slate-300">-</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-slate-800">Input & Update Progres Lapangan</td>
                      <td className="py-2 px-2 text-center text-emerald-600 font-bold">Ya</td>
                      <td className="py-2 px-2 text-center text-emerald-600 font-bold">Ya</td>
                      <td className="py-2 px-2 text-center text-emerald-600 font-bold">Ya</td>
                      <td className="py-2 px-2 text-center text-blue-600">Draft</td>
                      <td className="py-2 px-2 text-center text-slate-300">-</td>
                      <td className="py-2 px-2 text-center text-slate-400">View</td>
                      <td className="py-2 px-2 text-center text-slate-400">View</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-slate-800">Pencatatan Timesheet Harian (Jam Kerja)</td>
                      <td className="py-2 px-2 text-center text-slate-400">Approve</td>
                      <td className="py-2 px-2 text-center text-slate-400">Approve</td>
                      <td className="py-2 px-2 text-center text-slate-400">Verifikasi</td>
                      <td className="py-2 px-2 text-center text-emerald-600 font-bold">Input</td>
                      <td className="py-2 px-2 text-center text-blue-600">Rekap</td>
                      <td className="py-2 px-2 text-center text-slate-400">Approve</td>
                      <td className="py-2 px-2 text-center text-emerald-600 font-bold">Input</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-slate-800">Laporan Progres, S-Curve & Export Excel</td>
                      <td className="py-2 px-2 text-center text-emerald-600 font-bold">Ya</td>
                      <td className="py-2 px-2 text-center text-emerald-600 font-bold">Ya</td>
                      <td className="py-2 px-2 text-center text-blue-600">Download</td>
                      <td className="py-2 px-2 text-center text-slate-300">-</td>
                      <td className="py-2 px-2 text-center text-emerald-600 font-bold">Full</td>
                      <td className="py-2 px-2 text-center text-blue-600">Download</td>
                      <td className="py-2 px-2 text-center text-slate-300">-</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-slate-800">Manajemen Dokumen & Gambar Teknis</td>
                      <td className="py-2 px-2 text-center text-blue-600">Full</td>
                      <td className="py-2 px-2 text-center text-emerald-600 font-bold">Validasi</td>
                      <td className="py-2 px-2 text-center text-blue-600">Submit</td>
                      <td className="py-2 px-2 text-center text-blue-600">Raw Data</td>
                      <td className="py-2 px-2 text-center text-emerald-600 font-bold">Arsip</td>
                      <td className="py-2 px-2 text-center text-emerald-600 font-bold">QC CAD/GIS</td>
                      <td className="py-2 px-2 text-center text-blue-600">Upload DWG</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center justify-between text-xs shrink-0">
          <div className="text-slate-500">
            Pengguna aktif saat ini: <strong className="font-semibold text-slate-800">{currentUser.name}</strong> (
            <span className="font-medium text-blue-600">{currentUser.actorLabel || currentUser.roleTitle}</span>)
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
