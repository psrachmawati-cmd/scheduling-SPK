import React, { useState } from 'react';
import { Play, Pause, Square, Clock, X, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FloatingTimer: React.FC = () => {
  const {
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimerAndSave,
    discardTimer,
    wbsNodes,
    currentUser,
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedWbsId, setSelectedWbsId] = useState('');
  const [workNotes, setWorkNotes] = useState('');

  // Leaf tasks only
  const availableTasks = wbsNodes.filter((n) => {
    const isLeaf = !wbsNodes.some((other) => other.parentId === n.id);
    if (currentUser.role === 'SUBCONTRACTOR' && currentUser.subcontractorId) {
      return isLeaf && n.subcontractorId === currentUser.subcontractorId;
    }
    return isLeaf;
  });

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartNew = () => {
    if (!selectedWbsId) return;
    const task = wbsNodes.find((n) => n.id === selectedWbsId);
    if (!task) return;
    startTimer(task.id, `${task.wbsCode} - ${task.workName}`, workNotes);
    setIsExpanded(false);
  };

  if (!timerState.isRunning && !isExpanded) {
    return (
      <div className="fixed bottom-5 right-5 z-40 no-print">
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-semibold border border-white/20"
        >
          <Clock className="w-4 h-4 animate-pulse" />
          <span>Mulai Timer Kerja</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 no-print">
      <div className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold tracking-wide uppercase">
              Time Tracker Operasional
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white transition"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Body when running */}
        {timerState.isRunning ? (
          <div className="p-4 bg-slate-50/50">
            <div className="text-center py-2">
              <div className="text-3xl font-mono font-bold text-slate-900 tracking-wider">
                {formatTimer(timerState.seconds)}
              </div>
              <div className="text-xs font-semibold text-blue-600 mt-1 line-clamp-1">
                {timerState.wbsWorkName}
              </div>
              {timerState.description && (
                <div className="text-[11px] text-slate-500 mt-0.5 italic line-clamp-1">
                  "{timerState.description}"
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-3 mt-3 pt-2 border-t border-slate-200">
              {timerState.isPaused ? (
                <button
                  onClick={resumeTimer}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Lanjutkan</span>
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Jeda</span>
                </button>
              )}

              <button
                onClick={stopTimerAndSave}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Log</span>
              </button>

              <button
                onClick={discardTimer}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Batalkan timer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Form when setting up new timer */
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Task WBS yang Dikerjakan:
              </label>
              <select
                value={selectedWbsId}
                onChange={(e) => setSelectedWbsId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Pilih Pekerjaan WBS --</option>
                {availableTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.wbsCode} - {t.workName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Aktivitas / Catatan Singkat:
              </label>
              <input
                type="text"
                placeholder="Contoh: Pengelasan balok grid B, perakitan tulangan"
                value={workNotes}
                onChange={(e) => setWorkNotes(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="text-xs text-slate-500 hover:text-slate-700 font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleStartNew}
                disabled={!selectedWbsId}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Mulai Sekarang</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
