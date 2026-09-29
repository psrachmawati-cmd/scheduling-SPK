import { WbsNode, TimesheetEntry, SCurveDataPoint, Project, TopographyDailyReportItem, TerrestrialProductivityRecord } from '../types';

/**
 * Trigger download of CSV text file
 */
export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export WBS Progress to CSV / Excel readable
 */
export function exportWbsProgressCSV(project: Project, nodes: WbsNode[]) {
  const headers = [
    'Kode WBS',
    'Nama Pekerjaan',
    'Level',
    'Bobot (%)',
    'Mulai Rencana',
    'Selesai Rencana',
    'Durasi (Hari)',
    'Progress Rencana (%)',
    'Progress Aktual (%)',
    'Deviasi (%)',
    'Status',
    'Sub-Kontraktor / Vendor',
    'PIC',
    'Volume Rencana',
    'Volume Aktual',
    'Satuan',
  ];

  const rows = nodes.map((node) => {
    const deviation = (node.progressActual - node.progressPlan).toFixed(2);
    return [
      `"${node.wbsCode}"`,
      `"${node.workName.replace(/"/g, '""')}"`,
      node.level,
      node.weight,
      node.startPlan,
      node.finishPlan,
      node.durationDays,
      node.progressPlan,
      node.progressActual,
      deviation,
      `"${node.status}"`,
      `"${(node.subcontractorName || '-').replace(/"/g, '""')}"`,
      `"${(node.picName || '-').replace(/"/g, '""')}"`,
      node.volumePlan || '',
      node.volumeActual || '',
      `"${node.volumeUnit || ''}"`,
    ].join(';');
  });

  const content = [
    `"LAPORAN WBS & PROGRES PEKERJAAN"`,
    `"Proyek: ${project.name}"`,
    `"Klien: ${project.client}"`,
    `"Tanggal Export: ${new Date().toLocaleDateString('id-ID')}"`,
    '',
    headers.join(';'),
    ...rows,
  ].join('\r\n');

  downloadCSV(`WBS_Progres_${project.code}_${new Date().toISOString().slice(0, 10)}.csv`, content);
}

/**
 * Export Timesheet Summary to CSV
 */
export function exportTimesheetCSV(project: Project, timesheets: TimesheetEntry[]) {
  const headers = [
    'ID Timesheet',
    'Tanggal',
    'Nama Tenaga Kerja',
    'Peran / Role',
    'Sub-Kontraktor',
    'Kode WBS',
    'Nama Pekerjaan WBS',
    'Jam Mulai',
    'Jam Selesai',
    'Total Jam Kerja',
    'Status Lembur (>8 Jam)',
    'Status Approval',
    'Approved By',
    'Deskripsi Pekerjaan',
  ];

  const rows = timesheets.map((ts) => [
    `"${ts.id}"`,
    `"${ts.date}"`,
    `"${ts.userName}"`,
    `"${ts.userRole}"`,
    `"${ts.subcontractorName || '-'}"`,
    `"${ts.wbsCode}"`,
    `"${ts.wbsWorkName.replace(/"/g, '""')}"`,
    `"${ts.startTime}"`,
    `"${ts.endTime}"`,
    ts.totalHours,
    ts.isOvertime ? 'LEMBUR' : 'NORMAL',
    `"${ts.status}"`,
    `"${ts.approvedByName || '-'}"`,
    `"${ts.workDescription.replace(/"/g, '""')}"`,
  ].join(';'));

  const content = [
    `"REKAPITULASI TIMESHEET & JAM KERJA OPERASIONAL"`,
    `"Proyek: ${project.name}"`,
    `"Tanggal Export: ${new Date().toLocaleDateString('id-ID')}"`,
    '',
    headers.join(';'),
    ...rows,
  ].join('\r\n');

  downloadCSV(`Timesheet_${project.code}_${new Date().toISOString().slice(0, 10)}.csv`, content);
}

/**
 * Export S-Curve Data to CSV
 */
export function exportSCurveCSV(project: Project, scurve: SCurveDataPoint[]) {
  const headers = [
    'Periode (Minggu)',
    'Tanggal Titik',
    'Kumulatif Rencana / Plan (%)',
    'Kumulatif Realisasi / Actual (%)',
    'Deviasi (%)',
    'Status Kinerja',
  ];

  const rows = scurve.map((pt) => {
    let status = 'Belum Ada Realisasi';
    if (pt.deviation !== null) {
      if (pt.deviation >= 0) status = 'Ahead / On Schedule';
      else status = `Delayed (${Math.abs(pt.deviation)}%)`;
    }
    return [
      `"${pt.weekLabel}"`,
      `"${pt.date}"`,
      pt.progressPlanCumulative,
      pt.progressActualCumulative !== null ? pt.progressActualCumulative : '',
      pt.deviation !== null ? pt.deviation : '',
      `"${status}"`,
    ].join(';');
  });

  const content = [
    `"HISTORI DATA KURVA-S (S-CURVE REPORT)"`,
    `"Proyek: ${project.name}"`,
    `"Rencana: ${project.targetProgressPlan}% | Realisasi: ${project.currentProgressActual}%"`,
    '',
    headers.join(';'),
    ...rows,
  ].join('\r\n');

  downloadCSV(`KurvaS_${project.code}_${new Date().toISOString().slice(0, 10)}.csv`, content);
}

/**
 * Export 10 September Topography Daily Progress Report to CSV
 */
export function exportTopographyDailyReportCSV(reports: TopographyDailyReportItem[]) {
  const headers = [
    'No',
    'Lokasi Bor / SPK',
    'Sumur',
    'Periode TMT',
    'Hari Ke',
    'Minggu Ke',
    'Cum Plan (%)',
    'Daily Progress (%)',
    'Cum Progress (%)',
    'Deviasi (%)',
    '1. Survey Pendahuluan (%)',
    '2. Pasang BM (%)',
    '3. Survey Terestris (%)',
    '4. Olah Data (%)',
    '5. Desain Siteplan (%)',
    '6. Inventaris Lahan (%)',
    '7. Stake Out (%)',
    '8. Finalisasi Desain (%)',
    '9. Koreksi Bersama (%)',
    '10. Laporan Akhir (%)',
    'Rencana Aktivitas Hari Ini',
    'Alat Kerja',
    'SDM',
    'Jam Kerja',
    'Jam Selamat (K3)',
    'Kendala',
  ];

  const rows = reports.map((r) => [
    r.orderNumber,
    `"${r.title}"`,
    `"${r.wellName}"`,
    `"${r.tmtPeriod}"`,
    `"${r.dayNumber}"`,
    r.weekNumber,
    r.cumPlan,
    r.dailyProgress,
    r.cumProgress,
    r.deviation,
    r.stages.preliminarySurvey !== null ? r.stages.preliminarySurvey : '-',
    r.stages.bmInstallation !== null ? r.stages.bmInstallation : '-',
    r.stages.terrestrialSurvey !== null ? r.stages.terrestrialSurvey : '-',
    r.stages.dataProcessing !== null ? r.stages.dataProcessing : '-',
    r.stages.siteplanDesign !== null ? r.stages.siteplanDesign : '-',
    r.stages.landInventory !== null ? r.stages.landInventory : '-',
    r.stages.stakeOut !== null ? r.stages.stakeOut : '-',
    r.stages.finalDesign !== null ? r.stages.finalDesign : '-',
    r.stages.jointInspection !== null ? r.stages.jointInspection : '-',
    r.stages.finalReport !== null ? r.stages.finalReport : '-',
    `"${(r.plannedActivityToday || '').replace(/"/g, '""')}"`,
    `"${r.equipment}"`,
    `"${r.manpower}"`,
    `"${r.workingHours}"`,
    `"${r.safeHours}"`,
    `"${(r.constraints || '-').replace(/"/g, '""')}"`,
  ].join(';'));

  const content = [
    `"LAPORAN HARIAN PROGRES PEKERJAAN TOPOGRAFI LOKASI BOR"`,
    `"PT PERTAMINA EP ZONA 4 - STATUS: 10 SEPTEMBER 2026"`,
    `"Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}"`,
    '',
    headers.join(';'),
    ...rows,
  ].join('\r\n');

  downloadCSV(`Laporan_Topografi_Lokasi_Bor_10Sep2026.csv`, content);
}

/**
 * Export Terrestrial Survey Productivity Log to CSV
 */
export function exportTerrestrialProductivityCSV(records: TerrestrialProductivityRecord[]) {
  const headers = [
    'Tanggal',
    'Lokasi Bor / Sumur',
    'Nama Proyek SPK',
    'Wilayah / Field',
    'Luas Terukur Hari Ini (Ha)',
    'Jumlah Tim Lapangan',
    'Produktivitas (Ha/Tim/Hari)',
    'Personil / Anggota Tim',
    'Peralatan Ukur',
    'Kondisi Cuaca / Lapangan',
    'Status Evaluasi',
    'Catatan / Kendala',
  ];

  const rows = records.map((r) => [
    `"${r.date}"`,
    `"${r.wellName}"`,
    `"${r.projectName.replace(/"/g, '""')}"`,
    `"${r.fieldArea}"`,
    r.hectaresToday,
    r.teamsCount,
    r.productivityHaPerTeam,
    `"${(r.teamMembers || '').replace(/"/g, '""')}"`,
    `"${r.equipment}"`,
    `"${r.weatherCondition || '-'}"`,
    `"${r.status}"`,
    `"${(r.notes || '').replace(/"/g, '""')}"`,
  ].join(';'));

  const content = [
    `"MONITORING PRODUKTIVITAS SURVEI TERESTRIS / PENGUKURAN DETIL (HA/TIM/HARI)"`,
    `"PT PERTAMINA EP ZONA 4"`,
    `"Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}"`,
    '',
    headers.join(';'),
    ...rows,
  ].join('\r\n');

  downloadCSV(`Monitoring_Produktivitas_Terestris_${new Date().toISOString().slice(0, 10)}.csv`, content);
}

/**
 * Trigger print dialog with clean layout
 */
export function printReport() {
  window.print();
}
