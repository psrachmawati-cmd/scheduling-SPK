import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingDown,
  Building,
  Filter,
  Activity,
  Gauge,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  exportWbsProgressCSV,
  exportTimesheetCSV,
  exportSCurveCSV,
  exportTerrestrialProductivityCSV,
  printReport,
} from '../utils/exportUtils';
import { formatIDR } from '../utils/wbsLogic';

export const ReportsView: React.FC = () => {
  const {
    project,
    wbsNodes,
    timesheets,
    scurveData,
    terrestrialProductivityLogs,
  } = useApp();

  const [selectedReportType, setSelectedReportType] = useState<
    | 'TERRESTRIAL_PRODUCTIVITY'
    | 'WBS_PROGRESS'
    | 'S_CURVE'
    | 'TIMESHEET_SUMMARY'
    | 'DEVIATION_DELAY'
  >('TERRESTRIAL_PRODUCTIVITY');

  // Delayed tasks for deviation report
  const delayedTasks = wbsNodes.filter((n) => n.status === 'DELAYED');

  const handleExportCSV = () => {
    switch (selectedReportType) {
      case 'TERRESTRIAL_PRODUCTIVITY':
        exportTerrestrialProductivityCSV(terrestrialProductivityLogs);
        break;
      case 'WBS_PROGRESS':
        exportWbsProgressCSV(project, wbsNodes);
        break;
      case 'S_CURVE':
        exportSCurveCSV(project, scurveData);
        break;
      case 'TIMESHEET_SUMMARY':
        exportTimesheetCSV(project, timesheets);
        break;
      case 'DEVIATION_DELAY':
        exportWbsProgressCSV(project, delayedTasks);
        break;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs no-print">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Pusat Pelaporan & Export Dokumen
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Generate laporan resmi operasional untuk Pertamina EP Zona 4, Manajemen, dan Subkontraktor
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel (.CSV)</span>
            </button>

            <button
              onClick={printReport}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Report Tabs Selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-5 pt-4 border-t border-slate-100 text-xs">
          <button
            onClick={() => setSelectedReportType('TERRESTRIAL_PRODUCTIVITY')}
            className={`p-3 rounded-xl border text-left transition ${
              selectedReportType === 'TERRESTRIAL_PRODUCTIVITY'
                ? 'border-blue-500 bg-blue-50/60 font-bold text-blue-900 shadow-2xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="text-xs font-bold">1. Monitoring Produktivitas</div>
            <div className="text-[10px] text-slate-500 font-normal mt-0.5">
              Ha / Tim / Hari Terestris
            </div>
          </button>

          <button
            onClick={() => setSelectedReportType('WBS_PROGRESS')}
            className={`p-3 rounded-xl border text-left transition ${
              selectedReportType === 'WBS_PROGRESS'
                ? 'border-blue-500 bg-blue-50/60 font-bold text-blue-900 shadow-2xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="text-xs font-bold">2. Progress per WBS</div>
            <div className="text-[10px] text-slate-500 font-normal mt-0.5">
              Tabel detail plan vs actual
            </div>
          </button>

          <button
            onClick={() => setSelectedReportType('S_CURVE')}
            className={`p-3 rounded-xl border text-left transition ${
              selectedReportType === 'S_CURVE'
                ? 'border-blue-500 bg-blue-50/60 font-bold text-blue-900 shadow-2xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="text-xs font-bold">3. S-Curve Report</div>
            <div className="text-[10px] text-slate-500 font-normal mt-0.5">
              Kumulatif progres mingguan
            </div>
          </button>

          <button
            onClick={() => setSelectedReportType('TIMESHEET_SUMMARY')}
            className={`p-3 rounded-xl border text-left transition ${
              selectedReportType === 'TIMESHEET_SUMMARY'
                ? 'border-blue-500 bg-blue-50/60 font-bold text-blue-900 shadow-2xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="text-xs font-bold">4. Rekap Timesheet</div>
            <div className="text-[10px] text-slate-500 font-normal mt-0.5">
              Jam kerja tenaga kerja
            </div>
          </button>

          <button
            onClick={() => setSelectedReportType('DEVIATION_DELAY')}
            className={`p-3 rounded-xl border text-left transition ${
              selectedReportType === 'DEVIATION_DELAY'
                ? 'border-blue-500 bg-blue-50/60 font-bold text-blue-900 shadow-2xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="text-xs font-bold">5. Deviasi & Delay</div>
            <div className="text-[10px] text-slate-500 font-normal mt-0.5">
              Daftar task terlambat
            </div>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none">
        {/* Printable Formal Header */}
        <div className="border-b-2 border-slate-800 pb-4 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                PT PERTAMINA EP ZONA 4 • COPYRIGHT © PT SUCOFINDO CABANG PALEMBANG
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                {selectedReportType === 'TERRESTRIAL_PRODUCTIVITY' &&
                  'MONITORING PRODUKTIVITAS SURVEI TERESTRIS / PENGUKURAN DETIL (HA/TIM/HARI)'}
                {selectedReportType === 'WBS_PROGRESS' &&
                  'LAPORAN REALISASI & ROLL-UP PROGRESS WBS'}
                {selectedReportType === 'S_CURVE' &&
                  'LAPORAN HISTORI & PROGRES KUMULATIF KURVA-S'}
                {selectedReportType === 'TIMESHEET_SUMMARY' &&
                  'REKAPITULASI TIMESHEET & PRODUKTIVITAS TENAGA KERJA'}
                {selectedReportType === 'DEVIATION_DELAY' &&
                  'LAPORAN KETERLAMBATAN & DEVIASI JADWAL (DELAY REPORT)'}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Wilayah Operasional: Prabumulih, Limau, Pendopo, Adera, Ramba • Klien: PT Pertamina EP Zona 4
              </p>
            </div>
            <div className="text-right text-xs text-slate-500 space-y-0.5">
              <div>
                Tanggal Cetak:{' '}
                <span className="font-mono font-bold text-slate-800">
                  {new Date().toLocaleDateString('id-ID')}
                </span>
              </div>
              <div>
                Status Data: <span className="font-semibold text-emerald-700">10 September 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* 1. TERRESTRIAL PRODUCTIVITY CONTENT */}
        {selectedReportType === 'TERRESTRIAL_PRODUCTIVITY' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold text-[11px]">
                    <th className="p-2.5">Tanggal</th>
                    <th className="p-2.5">Lokasi Bor & Field</th>
                    <th className="p-2.5 text-center">Luas Terukur (Ha)</th>
                    <th className="p-2.5 text-center">Jumlah Tim</th>
                    <th className="p-2.5 text-center">Produktivitas (Ha/Tim/Hari)</th>
                    <th className="p-2.5">Personil & Tim</th>
                    <th className="p-2.5">Peralatan</th>
                    <th className="p-2.5">Evaluasi & Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {terrestrialProductivityLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="p-2.5 font-mono text-[11px]">{log.date}</td>
                      <td className="p-2.5 font-bold text-slate-900">
                        {log.wellName} <span className="text-slate-400 font-normal">({log.fieldArea})</span>
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-blue-700">
                        {log.hectaresToday} Ha
                      </td>
                      <td className="p-2.5 text-center font-mono font-semibold text-slate-700">
                        {log.teamsCount} Tim
                      </td>
                      <td className="p-2.5 text-center font-mono font-black text-emerald-700 bg-emerald-50/50">
                        {log.productivityHaPerTeam} Ha/Tim/Hari
                      </td>
                      <td className="p-2.5 text-slate-700 text-[11px] max-w-xs truncate">{log.teamMembers || '-'}</td>
                      <td className="p-2.5 text-slate-600 text-[11px]">{log.equipment}</td>
                      <td className="p-2.5 text-slate-600 text-[11px] italic">{log.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. WBS PROGRESS REPORT CONTENT */}
        {selectedReportType === 'WBS_PROGRESS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold">
                  <th className="p-2.5">WBS</th>
                  <th className="p-2.5 min-w-[220px]">Uraian Pekerjaan</th>
                  <th className="p-2.5 text-center">Bobot</th>
                  <th className="p-2.5">Mulai Rencana</th>
                  <th className="p-2.5">Selesai Rencana</th>
                  <th className="p-2.5 text-center">Plan</th>
                  <th className="p-2.5 text-center">Aktual</th>
                  <th className="p-2.5 text-center">Deviasi</th>
                  <th className="p-2.5">Sub-Kontraktor</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {wbsNodes.map((n) => {
                  const dev = Number((n.progressActual - n.progressPlan).toFixed(1));
                  return (
                    <tr
                      key={n.id}
                      className={n.level === 0 ? 'bg-slate-50/80 font-bold' : ''}
                    >
                      <td className="p-2 font-mono text-blue-700">{n.wbsCode}</td>
                      <td className="p-2" style={{ paddingLeft: `${n.level * 16 + 8}px` }}>
                        {n.workName}
                      </td>
                      <td className="p-2 text-center font-mono">{n.weight}%</td>
                      <td className="p-2 font-mono text-[11px]">{n.startPlan}</td>
                      <td className="p-2 font-mono text-[11px]">{n.finishPlan}</td>
                      <td className="p-2 text-center font-mono text-indigo-700">{n.progressPlan}%</td>
                      <td className="p-2 text-center font-mono font-bold">{n.progressActual}%</td>
                      <td
                        className={`p-2 text-center font-mono font-semibold ${
                          dev < 0 ? 'text-rose-600' : dev > 0 ? 'text-emerald-600' : 'text-slate-500'
                        }`}
                      >
                        {dev > 0 ? `+${dev}` : dev}%
                      </td>
                      <td className="p-2 text-[11px]">{n.subcontractorName || 'Internal'}</td>
                      <td className="p-2 text-[11px]">{n.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. S-CURVE REPORT CONTENT */}
        {selectedReportType === 'S_CURVE' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold">
                    <th className="p-2.5">Periode Pemantauan</th>
                    <th className="p-2.5">Tanggal</th>
                    <th className="p-2.5 text-center">Kumulatif Rencana (Plan %)</th>
                    <th className="p-2.5 text-center">Kumulatif Realisasi (Actual %)</th>
                    <th className="p-2.5 text-center">Deviasi (%)</th>
                    <th className="p-2.5">Keterangan Evaluasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {scurveData.map((pt, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-bold text-slate-800">{pt.weekLabel}</td>
                      <td className="p-2.5 font-mono text-slate-600">{pt.date}</td>
                      <td className="p-2.5 text-center font-mono text-indigo-700 font-semibold">
                        {pt.progressPlanCumulative}%
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-slate-900">
                        {pt.progressActualCumulative !== null ? `${pt.progressActualCumulative}%` : '-'}
                      </td>
                      <td
                        className={`p-2.5 text-center font-mono font-bold ${
                          pt.deviation !== null && pt.deviation < 0
                            ? 'text-rose-600'
                            : pt.deviation !== null && pt.deviation > 0
                            ? 'text-emerald-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {pt.deviation !== null
                          ? pt.deviation >= 0
                            ? `+${pt.deviation}%`
                            : `${pt.deviation}%`
                          : '-'}
                      </td>
                      <td className="p-2.5 text-slate-600 text-[11px]">
                        {pt.deviation !== null ? (
                          pt.deviation < 0 ? (
                            <span className="text-rose-600 font-semibold">
                              Deviasi Kritis - Butuh Catch-up Plan
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-semibold">
                              Sesuai / Melampaui Baseline
                            </span>
                          )
                        ) : (
                          'Proyeksi Masa Depan'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. TIMESHEET SUMMARY CONTENT */}
        {selectedReportType === 'TIMESHEET_SUMMARY' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold">
                  <th className="p-2.5">Tanggal</th>
                  <th className="p-2.5">Nama Tenaga Kerja</th>
                  <th className="p-2.5">Sub-Kontraktor</th>
                  <th className="p-2.5">WBS Terkait</th>
                  <th className="p-2.5 text-center">Jam Kerja</th>
                  <th className="p-2.5 text-center">Status Lembur</th>
                  <th className="p-2.5">Status Persetujuan</th>
                  <th className="p-2.5">Uraian Kerja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {timesheets.map((ts) => (
                  <tr key={ts.id}>
                    <td className="p-2.5 font-mono text-[11px]">{ts.date}</td>
                    <td className="p-2.5 font-bold text-slate-800">{ts.userName}</td>
                    <td className="p-2.5 text-slate-600">{ts.subcontractorName || 'Internal'}</td>
                    <td className="p-2.5">
                      <span className="font-mono text-blue-600 font-semibold">[{ts.wbsCode}]</span>{' '}
                      {ts.wbsWorkName}
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold text-slate-900">
                      {ts.totalHours} jam
                    </td>
                    <td className="p-2.5 text-center">
                      {ts.isOvertime ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                          LEMBUR
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Reguler</span>
                      )}
                    </td>
                    <td className="p-2.5 font-semibold">
                      {ts.status === 'APPROVED' ? (
                        <span className="text-emerald-700">Disetujui ({ts.approvedByName || 'PM'})</span>
                      ) : ts.status === 'REJECTED' ? (
                        <span className="text-rose-700">Ditolak</span>
                      ) : (
                        <span className="text-amber-700">Pending Review</span>
                      )}
                    </td>
                    <td className="p-2.5 text-slate-500 italic max-w-xs truncate">
                      "{ts.workDescription}"
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. DEVIATION / DELAY REPORT */}
        {selectedReportType === 'DEVIATION_DELAY' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-rose-950">Analisis Deviasi Operasional:</strong>
                <p className="mt-0.5">
                  Terdapat {delayedTasks.length} paket pekerjaan yang melewati tanggal rencana (finish_plan) atau
                  memiliki realisasi yang tertinggal dari baseline jadwal.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold">
                    <th className="p-2.5">WBS</th>
                    <th className="p-2.5">Paket Pekerjaan Terlambat</th>
                    <th className="p-2.5">Sub-Kontraktor Bertanggung Jawab</th>
                    <th className="p-2.5 text-center">Target Plan</th>
                    <th className="p-2.5 text-center">Realisasi</th>
                    <th className="p-2.5 text-center">Defisit Deviasi</th>
                    <th className="p-2.5">Tenggat Selesai</th>
                    <th className="p-2.5">Rencana Tindakan (Action Plan)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {delayedTasks.map((node) => {
                    const dev = (node.progressActual - node.progressPlan).toFixed(1);
                    return (
                      <tr key={node.id}>
                        <td className="p-2.5 font-mono font-bold text-rose-700">{node.wbsCode}</td>
                        <td className="p-2.5 font-bold text-slate-900">{node.workName}</td>
                        <td className="p-2.5">{node.subcontractorName || '-'}</td>
                        <td className="p-2.5 text-center font-mono text-indigo-700">{node.progressPlan}%</td>
                        <td className="p-2.5 text-center font-mono font-bold text-slate-900">
                          {node.progressActual}%
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-rose-600">{dev}%</td>
                        <td className="p-2.5 font-mono text-slate-500">{node.finishPlan}</td>
                        <td className="p-2.5 text-slate-700 font-medium">
                          Penambahan personil survey & percepatan drafting CAD
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Formal Signature Footer for Print */}
        <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-3 gap-8 text-center text-xs">
          <div>
            <p className="text-slate-500 mb-16">Dibuat Oleh (Koordinator Survey):</p>
            <p className="font-bold text-slate-900 underline">Yogi Armansyah</p>
            <p className="text-[11px] text-slate-400">Koordinator Survey & Pengawas Lapangan</p>
          </div>
          <div>
            <p className="text-slate-500 mb-16">Mengetahui (Koordinator Subkontraktor):</p>
            <p className="font-bold text-slate-900 underline">Ivan / Juli</p>
            <p className="text-[11px] text-slate-400">Koordinator Subkontraktor Resmi (KJSB Subkhi & Syahrial)</p>
          </div>
          <div>
            <p className="text-slate-500 mb-16">Disetujui Oleh (Super Admin):</p>
            <p className="font-bold text-slate-900 underline">Admin</p>
            <p className="text-[11px] text-slate-400">Pjs. Manager Project Engineering Zona 4</p>
          </div>
        </div>
      </div>
    </div>
  );
};
