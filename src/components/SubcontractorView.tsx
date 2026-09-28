import React from 'react';
import {
  Users2,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SubcontractorView: React.FC = () => {
  const { subcontractors, wbsNodes, setActiveTab } = useApp();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <Users2 className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Direktori & Evaluasi Kinerja Sub-Kontraktor
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Manajemen 2 rekanan resmi Kantor Jasa Surveyor Berlisensi (KJSB), monitoring pembobotan WBS, serta efektivitas penyelesaian paket SPK.
            </p>
          </div>
        </div>

        {/* Notice Info Banner */}
        <div className="mt-4 p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 flex items-start space-x-3 text-xs">
          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
            i
          </div>
          <div className="text-slate-700 leading-relaxed">
            <span className="font-bold text-blue-900">Ketentuan Rekanan Resmi: </span>
            Sistem mencatat strictly <strong>2 Subkontraktor Resmi</strong> pelaksana survey pemetaan di lingkungan Wilayah Kerja Zona 4, yaitu{' '}
            <strong className="text-slate-900">KJSB SUBKHI ABDUL HAKIM AT-TIGHOLY & REKAN</strong> dan{' '}
            <strong className="text-slate-900">KJSB SYAHRIAL & REKAN</strong>.{' '}
            <em className="text-blue-950 font-medium">PT Sucofindo berkedudukan sebagai Pengelola/Pelaksana Kontrak Utama PT Pertamina EP Zona 4 (Bukan Kontraktor/Subkontraktor).</em>
          </div>
        </div>
      </div>

      {/* Grid of Subcontractors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {subcontractors.map((sub) => {
          const assignedTasks = wbsNodes.filter((n) => n.subcontractorId === sub.id);
          const totalAssignedWeight = assignedTasks.reduce((sum, n) => sum + (n.weight || 0), 0);
          const completedTasks = assignedTasks.filter((n) => n.progressActual >= 100).length;
          const delayedTasks = assignedTasks.filter((n) => n.status === 'DELAYED').length;

          const calculatedProgress =
            assignedTasks.length > 0
              ? Number(
                  (
                    assignedTasks.reduce(
                      (sum, n) => sum + n.progressActual * (n.weight || 1),
                      0
                    ) / (totalAssignedWeight || 1)
                  ).toFixed(1)
                )
              : sub.averageProgress;

          return (
            <div
              key={sub.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-sm transition space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider font-mono">
                    VENDOR #{sub.id.toUpperCase()}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{sub.specialty}</p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-extrabold font-mono text-slate-900">
                    {calculatedProgress}%
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Progres Tertimbang
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    calculatedProgress >= 80
                      ? 'bg-emerald-500'
                      : calculatedProgress >= 40
                      ? 'bg-blue-600'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, calculatedProgress)}%` }}
                />
              </div>

              {/* Stats 3 columns */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Total Tugas</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {assignedTasks.length} Paket
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Selesai 100%</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    {completedTasks} Paket
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Keterlambatan</span>
                  <span
                    className={`font-bold font-mono ${
                      delayedTasks > 0 ? 'text-rose-600' : 'text-slate-700'
                    }`}
                  >
                    {delayedTasks} Paket
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-700">Kontak:</span>
                  <span>{sub.contactPerson}</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sub.email}</span>
                  <span className="mx-1">•</span>
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sub.phone}</span>
                </div>
              </div>

              {/* List of active WBS tasks */}
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Paket Pekerjaan WBS:
                </p>
                <div className="space-y-1.5">
                  {assignedTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="font-mono font-bold text-blue-600 shrink-0">
                          {t.wbsCode}
                        </span>
                        <span className="truncate text-slate-800">{t.workName}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-700 shrink-0 ml-2">
                        {t.progressActual}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
