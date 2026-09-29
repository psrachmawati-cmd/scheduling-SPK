import { WbsNode, TaskStatus } from '../types';

export interface StandardWbsItemTemplate {
  code: string;
  parentCode: string | null;
  workName: string;
  sowReference: string;
  category: 'Persiapan' | 'Alat Ukur' | 'Drone' | 'Administrasi';
  picPelaksana: 'KJSB' | 'KJSB/PM' | 'KJSB & PIHAK I';
  level: number;
  weight: number; // Percentage relative to siblings (summing to 100% per level group)
  startRatio: number; // 0.0 to 1.0 (relative to project duration)
  finishRatio: number; // 0.0 to 1.0 (relative to project duration)
  isMilestone?: boolean;
  isCritical?: boolean;
  notes?: string;
  volumeUnit?: string;
}

/**
 * STRUKTUR RESMI WORK BREAKDOWN STRUCTURE (WBS) — HANYA SAMPAI ORDE 2 (1.1, 2.4, 3.3, dst)
 * Sesuai Dokumen Acuan SOW Pertamina EP Zona 4 (Ps. 2.1 s.d. Ps. 2.4)
 * Orde 1: 4 Divisi Pekerjaan Utama
 * Orde 2: 19 Paket Pekerjaan Operasional
 * 5 Milestone Operasional (M1 s/d M5)
 */
export const STANDARD_WBS_TEMPLATE: StandardWbsItemTemplate[] = [
  // =========================================================================
  // 1. PERSIAPAN PEKERJAAN (Ps. 2.1) - Bobot 15%
  // =========================================================================
  {
    code: '1',
    parentCode: null,
    workName: 'PERSIAPAN PEKERJAAN',
    sowReference: 'Ps. 2.1',
    category: 'Persiapan',
    picPelaksana: 'KJSB',
    level: 0,
    weight: 15.0,
    startRatio: 0.0,
    finishRatio: 0.25,
    notes: 'Paket persiapan administrasi, K3, mobilisasi, dan akomodasi lapangan.',
  },
  {
    code: '1.1',
    parentCode: '1',
    workName: 'Perizinan, JSA, SIKA & Dokumentasi',
    sowReference: '2.1.1',
    category: 'Persiapan',
    picPelaksana: 'KJSB',
    level: 1,
    weight: 35.0,
    startRatio: 0.0,
    finishRatio: 0.2,
    isCritical: true,
    notes: 'Penyusunan rencana kerja, pengajuan JSA & SIKA ke Fungsi HSSE Pertamina EP, koordinasi HUMAS, perizinan desa, dan safety induction.',
  },
  {
    code: '1.2',
    parentCode: '1',
    workName: 'Medical Check Up (MCU) Personil',
    sowReference: '2.1.2',
    category: 'Persiapan',
    picPelaksana: 'KJSB',
    level: 1,
    weight: 20.0,
    startRatio: 0.0,
    finishRatio: 0.12,
    notes: 'Pemeriksaan kesehatan kerja personil (fit to work) oleh RS rujukan dan penyerahan laporan MCU resmi.',
  },
  {
    code: '1.3',
    parentCode: '1',
    workName: 'Mobilisasi & Demobilisasi',
    sowReference: '2.1.3',
    category: 'Persiapan',
    picPelaksana: 'KJSB',
    level: 1,
    weight: 25.0,
    startRatio: 0.02,
    finishRatio: 1.0,
    isCritical: true,
    notes: 'Mobilisasi tim dan peralatan (Total Station, GPS Geodetik, UAV) serta demobilisasi di akhir proyek.',
  },
  {
    code: '1.4',
    parentCode: '1',
    workName: 'Akomodasi & Perlengkapan Kerja',
    sowReference: '2.1.4-2.1.5',
    category: 'Persiapan',
    picPelaksana: 'KJSB',
    level: 1,
    weight: 20.0,
    startRatio: 0.0,
    finishRatio: 0.15,
    notes: 'Penyediaan base camp kantor perwakilan di Prabumulih dan APD keselamatan kerja standar migas.',
  },

  // =========================================================================
  // 2. SURVEY PEMETAAN — ALAT UKUR (TERESTRIS) (Ps. 2.2) - Bobot 45%
  // =========================================================================
  {
    code: '2',
    parentCode: null,
    workName: 'SURVEY PEMETAAN — ALAT UKUR (TERESTRIS)',
    sowReference: 'Ps. 2.2',
    category: 'Alat Ukur',
    picPelaksana: 'KJSB',
    level: 0,
    weight: 45.0,
    startRatio: 0.1,
    finishRatio: 0.85,
    notes: 'Paket survey darat terestris, perapatan titik kontrol BM, poligon dan profil.',
  },
  {
    code: '2.1',
    parentCode: '2',
    workName: 'Survey Pendahuluan (Scouting)',
    sowReference: '2.2.1',
    category: 'Alat Ukur',
    picPelaksana: 'KJSB',
    level: 1,
    weight: 8.0,
    startRatio: 0.08,
    finishRatio: 0.22,
    notes: 'Koordinasi lapangan, identifikasi rute aksesibilitas mobilisasi, dan laporan kondisi lapangan awal.',
  },
  {
    code: '2.2',
    parentCode: '2',
    workName: 'Pembuatan & Pemasangan Patok Bench Mark (BM)',
    sowReference: '2.2.2',
    category: 'Alat Ukur',
    picPelaksana: 'KJSB',
    level: 1,
    weight: 12.0,
    startRatio: 0.15,
    finishRatio: 0.38,
    volumeUnit: 'titik BM',
    notes: 'Konstruksi beton bertulang K-250 dan distribusi min 2 BM berpasangan per lokasi sumur.',
  },
  {
    code: '2.3',
    parentCode: '2',
    workName: 'Pengukuran Koordinat BM dengan GPS Geodetik',
    sowReference: '2.2.3',
    category: 'Alat Ukur',
    picPelaksana: 'KJSB',
    level: 1,
    weight: 15.0,
    startRatio: 0.25,
    finishRatio: 0.48,
    isCritical: true,
    volumeUnit: 'sesi ukur',
    notes: 'Pengamatan statik GPS dual-frequency min 4 jam terikat pilar jaring kontrol geodesi nasional BIG.',
  },
  {
    code: '2.4',
    parentCode: '2',
    workName: 'Pengukuran KKH, KKV & Detail Situasi Topografi',
    sowReference: '2.2.4',
    category: 'Alat Ukur',
    picPelaksana: 'KJSB',
    level: 1,
    weight: 25.0,
    startRatio: 0.35,
    finishRatio: 0.72,
    isCritical: true,
    volumeUnit: 'Ha',
    notes: 'Poligon horizontal, levelling vertikal, dan pengukuran rapat detail situasi topografi batas tapak bor.',
  },
  {
    code: '2.5',
    parentCode: '2',
    workName: 'Desain Siteplan',
    sowReference: '2.2.5',
    category: 'Alat Ukur',
    picPelaksana: 'KJSB',
    level: 1,
    weight: 12.0,
    startRatio: 0.55,
    finishRatio: 0.76,
    volumeUnit: 'm3 cut/fill',
    notes: 'Desain tata letak sumur, cut and fill volume balancing AutoCAD Civil 3D, dan profil lintasan.',
  },
  {
    code: '2.6',
    parentCode: '2',
    workName: 'Pengukuran & Peta Pembebasan Lahan',
    sowReference: '2.2.6',
    category: 'Alat Ukur',
    picPelaksana: 'KJSB',
    level: 1,
    weight: 12.0,
    startRatio: 0.45,
    finishRatio: 0.72,
    volumeUnit: 'bidang lahan',
    notes: 'Inventarisasi tanam tumbuh, kepemilikan lahan per bidang, patok batas, dan peta pembebasan lahan.',
  },
  {
    code: '2.7',
    parentCode: '2',
    workName: 'Pekerjaan Pematokan (Stake Out)',
    sowReference: '2.2.7',
    category: 'Alat Ukur',
    picPelaksana: 'KJSB',
    level: 1,
    weight: 8.0,
    startRatio: 0.65,
    finishRatio: 0.8,
    volumeUnit: 'patok batas',
    notes: 'Stake out batas tapak bor, fasilitas sipil konstruksi, dan koridor jalan akses.',
  },
  {
    code: '2.8',
    parentCode: '2',
    workName: 'Pemeriksaan & Koreksi Bersama Hasil Survey',
    sowReference: '2.2.8',
    category: 'Alat Ukur',
    picPelaksana: 'KJSB & PIHAK I',
    level: 1,
    weight: 8.0,
    startRatio: 0.72,
    finishRatio: 0.85,
    isCritical: true,
    notes: 'Joint inspection bersama Pengawas Pertamina EP Zona 4, Berita Acara Pemeriksaan, dan koreksi toleransi.',
  },

  // =========================================================================
  // 3. SURVEY PEMETAAN — DRONE LiDAR & FOTOGRAMETRI (Ps. 2.3) - Bobot 30%
  // =========================================================================
  {
    code: '3',
    parentCode: null,
    workName: 'SURVEY PEMETAAN — DRONE LiDAR & FOTOGRAMETRI',
    sowReference: 'Ps. 2.3',
    category: 'Drone',
    picPelaksana: 'KJSB',
    level: 0,
    weight: 30.0,
    startRatio: 0.25,
    finishRatio: 0.88,
    notes: 'Penerbangan UAV, scanning LiDAR resolusi tinggi & ortofoto fotogrametri.',
  },
  {
    code: '3.1',
    parentCode: '3',
    workName: 'Persiapan Titik Kontrol (GCP/ICP)',
    sowReference: '2.3.1-2.3.3',
    category: 'Drone',
    picPelaksana: 'KJSB',
    level: 1,
    weight: 20.0,
    startRatio: 0.25,
    finishRatio: 0.45,
    isCritical: true,
    volumeUnit: 'titik premark',
    notes: 'Perencanaan GCP/ICP acuan SNI 8202, pemasangan tarpaulin premark silang, dan pengamatan koordinat GPS.',
  },
  {
    code: '3.2',
    parentCode: '3',
    workName: 'Pekerjaan UAV Drone LiDAR',
    sowReference: '2.3.4',
    category: 'Drone',
    picPelaksana: 'KJSB',
    level: 1,
    weight: 45.0,
    startRatio: 0.4,
    finishRatio: 0.82,
    isCritical: true,
    volumeUnit: 'Ha / sortie',
    notes: 'Boresight calibration, penerbangan scanning LiDAR min 50 pts/m2, klasifikasi point cloud, DTM, dan kontur.',
  },
  {
    code: '3.3',
    parentCode: '3',
    workName: 'Pekerjaan UAV Drone Fotogrametri',
    sowReference: '2.3.5',
    category: 'Drone',
    picPelaksana: 'KJSB',
    level: 1,
    weight: 35.0,
    startRatio: 0.42,
    finishRatio: 0.85,
    volumeUnit: 'foto scene',
    notes: 'Flight planning, pemotretan udara overlap 80/60%, orthomosaic photo, digitasi layer, dan peta ortofoto 1:1000.',
  },

  // =========================================================================
  // 4. ADMINISTRASI & PELAPORAN (Ps. 2.4) - Bobot 10%
  // =========================================================================
  {
    code: '4',
    parentCode: null,
    workName: 'ADMINISTRASI & PELAPORAN',
    sowReference: 'Ps. 2.4',
    category: 'Administrasi',
    picPelaksana: 'KJSB',
    level: 0,
    weight: 10.0,
    startRatio: 0.05,
    finishRatio: 1.0,
    notes: 'Paket pelaporan progres harian/mingguan, kalibrasi alat, dan album peta akhir.',
  },
  {
    code: '4.1',
    parentCode: '4',
    workName: 'Pelaporan Hasil Survey',
    sowReference: '2.4.1',
    category: 'Administrasi',
    picPelaksana: 'KJSB',
    level: 1,
    weight: 45.0,
    startRatio: 0.1,
    finishRatio: 1.0,
    isCritical: true,
    volumeUnit: 'set laporan',
    notes: 'Laporan harian, mingguan, laporan pendahuluan, album gambar A1/A3 4 rangkap, dan HDD eksternal 1TB.',
  },
  {
    code: '4.2',
    parentCode: '4',
    workName: 'Kalibrasi Alat Ukur Milik PIHAK PERTAMA',
    sowReference: '2.4.2',
    category: 'Administrasi',
    picPelaksana: 'KJSB',
    level: 1,
    weight: 15.0,
    startRatio: 0.05,
    finishRatio: 0.35,
    volumeUnit: 'unit alat',
    notes: 'Kalibrasi Total Station dan Waterpass di laboratorium terakreditasi KAN bersertifikat.',
  },
  {
    code: '4.3',
    parentCode: '4',
    workName: 'Penyediaan Material Operasional Survey',
    sowReference: '2.4.3',
    category: 'Administrasi',
    picPelaksana: 'KJSB',
    level: 1,
    weight: 20.0,
    startRatio: 0.05,
    finishRatio: 0.75,
    notes: 'Pengadaan logistik habis pakai: battery drone/TS, patok kayu, cat, paku payung, meteran, bendera.',
  },
  {
    code: '4.4',
    parentCode: '4',
    workName: 'Service Quality Meeting / Rapat Koordinasi',
    sowReference: '2.4.4',
    category: 'Administrasi',
    picPelaksana: 'KJSB & PIHAK I',
    level: 1,
    weight: 20.0,
    startRatio: 0.1,
    finishRatio: 0.98,
    volumeUnit: 'kali rapat',
    notes: 'Rapat koordinasi berkala evaluasi kinerja kemajuan fisik dan penyelarasan kendala teknis operasional.',
  },
];

/**
 * 5 Standard Milestones (M1 to M5)
 */
export const STANDARD_MILESTONES = [
  {
    code: 'M1',
    workName: '◆ SPK Efektif & Mobilisasi Tim Selesai',
    finishRatio: 0.12,
    notes: 'Milestone 1 tercapai setelah seluruh personil MCU & SIKA aktif.',
  },
  {
    code: 'M2',
    workName: '◆ Bench Mark & Kontrol Horizontal-Vertikal Terpasang',
    finishRatio: 0.45,
    notes: 'Target BM terpasang dan terikat jaring kontrol koordinat.',
  },
  {
    code: 'M3',
    workName: '◆ Peta Topografi Terestris — Final',
    finishRatio: 0.72,
    notes: 'Pengukuran detail topografi dan kontur terestris tuntas.',
  },
  {
    code: 'M4',
    workName: '◆ Akuisisi Data Drone (LiDAR & Fotogrametri) Selesai',
    finishRatio: 0.85,
    notes: 'Misi terbang, point cloud LiDAR dan ortofoto selesai diolah.',
  },
  {
    code: 'M5',
    workName: '◆ Laporan Akhir & Serah Terima Hasil Survey',
    finishRatio: 1.0,
    notes: 'BA Serah Terima Hasil Survey ditandatangani Pihak Pertama.',
  },
];

/**
 * Format a Date object to YYYY-MM-DD
 */
function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

/**
 * Calculate date along project duration using ratio (0.0 to 1.0)
 */
function getDateAtRatio(startDateStr: string, finishDateStr: string, ratio: number): string {
  const start = new Date(startDateStr).getTime();
  const finish = new Date(finishDateStr).getTime();
  const duration = Math.max(86400000, finish - start);
  const targetTime = start + duration * Math.max(0, Math.min(1, ratio));
  return formatDate(new Date(targetTime));
}

/**
 * GENERATE STANDARD WBS NODES FOR ANY SPK (HANYA SAMPAI ORDE 2: 1.1, 2.4, 3.3, dst)
 * Creates 4 main packages (Level 0), 19 Orde 2 packages (Level 1), and 5 milestones.
 */
export function generateStandardWbsForProject(
  projectId: string,
  startDate: string,
  finishDate: string,
  options?: {
    initialStatus?: TaskStatus;
    defaultPic?: string;
    subcontractorName?: string;
  }
): WbsNode[] {
  const subName = options?.subcontractorName || 'KJSB SUBKHI ABDUL HAKIM AT-TIGHOLY & REKAN';
  const defaultPic = options?.defaultPic || 'Ian (Surveyor)';

  // Map to store generated IDs by code (e.g., '1' -> 'wbs-spkX-1')
  const codeToIdMap = new Map<string, string>();

  // 1. Generate IDs for all items
  STANDARD_WBS_TEMPLATE.forEach((item) => {
    const cleanCode = item.code.replace(/\./g, '-');
    codeToIdMap.set(item.code, `wbs-${projectId}-${cleanCode}`);
  });

  const nodes: WbsNode[] = [];

  // 2. Build WBS Nodes
  STANDARD_WBS_TEMPLATE.forEach((item, index) => {
    const id = codeToIdMap.get(item.code)!;
    const parentId = item.parentCode ? codeToIdMap.get(item.parentCode) || null : null;

    const startPlan = getDateAtRatio(startDate, finishDate, item.startRatio);
    const finishPlan = getDateAtRatio(startDate, finishDate, item.finishRatio);

    const s = new Date(startPlan);
    const f = new Date(finishPlan);
    const durationDays = Math.max(1, Math.round((f.getTime() - s.getTime()) / (1000 * 3600 * 24)));

    // Assign realistic default status based on start plan vs now (or NOT_STARTED)
    const status: TaskStatus = options?.initialStatus || 'NOT_STARTED';

    nodes.push({
      id,
      projectId,
      parentId,
      wbsCode: item.code,
      workName: item.workName,
      level: item.level,
      order: index + 1,
      weight: item.weight,
      startPlan,
      finishPlan,
      durationDays,
      progressPlan: 0,
      progressActual: 0,
      status,
      subcontractorId: 'sub-01',
      subcontractorName: subName,
      picName: item.picPelaksana === 'KJSB/PM' ? 'Ivan' : defaultPic,
      baselineLocked: false,
      isCritical: item.isCritical,
      notes: item.notes,
      volumeUnit: item.volumeUnit,
      sowReference: item.sowReference,
      category: item.category,
      picPelaksana: item.picPelaksana,
    });
  });

  // 3. Add Milestones (M1 to M5)
  STANDARD_MILESTONES.forEach((ms, idx) => {
    const msDate = getDateAtRatio(startDate, finishDate, ms.finishRatio);
    nodes.push({
      id: `wbs-${projectId}-${ms.code.toLowerCase()}`,
      projectId,
      parentId: null,
      wbsCode: ms.code,
      workName: ms.workName,
      level: 0,
      order: 100 + idx,
      weight: 0,
      startPlan: msDate,
      finishPlan: msDate,
      durationDays: 0,
      progressPlan: 0,
      progressActual: 0,
      status: 'NOT_STARTED',
      baselineLocked: false,
      isMilestone: true,
      notes: ms.notes,
      sowReference: 'Milestone',
      category: 'Administrasi',
      picPelaksana: 'KJSB & PIHAK I',
    });
  });

  return nodes;
}
