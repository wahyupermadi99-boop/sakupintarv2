/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  Upload, 
  AlertTriangle, 
  Calendar, 
  Info, 
  Check, 
  Clock, 
  FileJson,
  ShieldCheck,
  RefreshCw,
  Database,
  ArrowRight,
  Sparkles,
  ArrowUpRight,
  FileCheck2
} from 'lucide-react';

interface BackupWidgetProps {
  onExportData: () => void;
  onImportData: (data: any) => void;
  theme: 'dark' | 'light';
}

export default function BackupWidget({
  onExportData,
  onImportData,
  theme
}: BackupWidgetProps) {
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [needsBackupRemind, setNeedsBackupRemind] = useState(false);
  const [daysElapsed, setDaysElapsed] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    // Check backup timing
    const lastBackupTime = localStorage.getItem('sakupintar_last_backup_time');
    const now = Date.now();

    if (!lastBackupTime) {
      // Initialize with now
      localStorage.setItem('sakupintar_last_backup_time', now.toString());
      setLastBackup(new Date(now).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
    } else {
      const lastTimeMs = Number(lastBackupTime);
      const diffMs = now - lastTimeMs;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      setDaysElapsed(diffDays);
      setLastBackup(new Date(lastTimeMs).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));

      // Remind if 7 days or more
      if (diffDays >= 7) {
        setNeedsBackupRemind(true);
      }
    }
  }, []);

  const triggerExport = () => {
    onExportData();
    // Update last backup timestamp
    const now = Date.now();
    localStorage.setItem('sakupintar_last_backup_time', now.toString());
    setLastBackup(new Date(now).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
    setNeedsBackupRemind(false);
    setDaysElapsed(0);
  };

  const processJsonFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onImportData(json);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 4000);
      } catch (err) {
        alert('Gagal membaca file backup. Pastikan file berformat JSON SakuPintar (.json)');
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processJsonFile(file);
    e.target.value = '';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.json')) {
        processJsonFile(file);
      } else {
        alert('Format file salah! Harap masukkan file berformat JSON (.json) hasil ekspor SakuPintar.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className={`p-1.5 rounded-lg ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <Database className="w-5 h-5" />
            </div>
            <span className={`text-[10.5px] font-black uppercase tracking-wider ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
              Kedaulatan & Portabilitas Data
            </span>
          </div>
          <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Manajemen Cadangan Data
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-1 font-medium`}>
            Ekspor seluruh pembukuan, pos anggaran, dan bank Anda ke dalam satu file terenkripsi lokal, atau pulihkan kapan saja tanpa internet.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-[11px] font-black flex items-center gap-1.5 border ${
            needsBackupRemind 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' 
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
          }`}>
            <span className={`w-2 h-2 rounded-full ${needsBackupRemind ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            {needsBackupRemind ? `Disarankan Backup (Sudah ${daysElapsed} hari)` : 'Data Aman & Segar'}
          </span>
        </div>
      </div>

      {/* Main Grid Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Export Column */}
        <div className={`lg:col-span-1 p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-6 ${
          isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200/80 shadow-md'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-3 border-slate-200/5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  Amankan Salinan data
                </h3>
                <span className="text-[10px] text-slate-500 font-bold">Ekspor Berkas Pembukuan</span>
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Dapatkan salinan master berbentuk file JSON universal. File ini memuat seluruh data keuangan pribadi Anda di SakuPintar termasuk tabungan, catatan limit 50/30/20, hutang, dan akun bank.
            </p>

            <div className={`p-4 rounded-xl space-y-2 ${isDark ? 'bg-black/30' : 'bg-slate-50 border border-slate-100'}`}>
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-slate-500 font-bold">Terakhir Backup:</span>
                <span className={`font-black uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {lastBackup || 'Belum dicatat'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-slate-500 font-bold">Format Ekspor:</span>
                <span className="bg-cyan-500/10 text-cyan-400 text-[9.5px] px-1.5 py-0.5 rounded font-black">JSON</span>
              </div>
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-slate-500 font-bold">Sertifikasi Privasi:</span>
                <span className="text-emerald-400 font-black flex items-center gap-1">
                  100% Client-Side <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={triggerExport}
            className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md hover:shadow-indigo-500/10 active:scale-[0.98] cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            Amankan Cadangan Data Saku (JSON)
          </button>
        </div>

        {/* Import drag-drop Zone Column */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-6 ${
          isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200/80 shadow-md'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-3 border-slate-200/5">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  Restore / Impor Cadangan Saku
                </h3>
                <span className="text-[10px] text-slate-500 font-bold">Impor dan sinkronisasi data seketika</span>
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Punya file cadangan SakuPintar sebelumnya? Seret dan letakkan berkas JSON Anda di sini untuk memulihkan seluruh laporan keuangan ke browser Anda seketika.
            </p>

            {/* Interactive Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-500/5 scale-[1.01]' 
                  : uploadSuccess
                  ? 'border-emerald-500 bg-emerald-500/5'
                  : isDark 
                  ? 'border-white/10 hover:border-white/20 bg-black/20 hover:bg-black/30' 
                  : 'border-slate-200 hover:border-indigo-400/60 bg-slate-50 hover:bg-slate-100/50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />

              {uploadSuccess ? (
                <div className="space-y-2 text-center py-2">
                  <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 animate-bounce">
                    <FileCheck2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-black text-emerald-400">Impor Berhasil Terpasang!</h4>
                  <p className="text-[11px] text-slate-400">Seluruh saldo saku, hutang, dan pos riwayat Anda telah dipulihkan.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="inline-flex p-3 rounded-full bg-slate-800/80 text-indigo-400 group-hover:scale-110 transition-transform">
                    <FileJson className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      Seret berkas <span className="text-indigo-400 font-extrabold">.json</span> ke sini atau <span className="text-indigo-500 font-extrabold underline">browse berkas lokal</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold">Mendukung file backup terenkripsi SakuPintar</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center text-[10.5px] text-slate-400 leading-normal">
            <div className="p-2 bg-indigo-500/10 border border-indigo-400/20 rounded-xl flex gap-2 items-start w-full">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
              <p className="text-[10px] text-slate-350">
                <span className="font-bold text-slate-200">Perhatian:</span> Melakukan impor akan mengganti data keuangan lokal yang ada di browser saat ini secara keseluruhan. Pastikan Anda telah mengekspor versi saat ini terlebih dahulu jika ragu!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Guarantee Block */}
      <div className={`p-5 rounded-3xl border ${
        isDark ? 'bg-gradient-to-r from-emerald-950/10 to-indigo-950/5 border-emerald-500/10' : 'bg-emerald-50/40 border-emerald-200/50 shadow-sm'
      }`}>
        <div className="flex gap-3.5 items-start">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Jaminan Keamanan Mutlak: Tanpa Cloud / Database Pihak Ketiga
            </h4>
            <p className={`text-[11.5px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              SakuPintar tidak mentransmisikan nominal tabungan, rincian hutang, atau rekening bank Anda ke server mana pun di internet. Seluruh pengelolaan dan kalkulasi berlangsung 100% secara lokal di browser Anda. Dengan mengunduh file cadangan secara berkala, Anda memegang kendali kepemilikan berdaulat penuh atas privasi finansial Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

