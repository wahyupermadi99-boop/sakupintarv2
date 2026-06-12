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
  FileCheck2,
  Copy,
  Share2,
  FileText,
  Clipboard
} from 'lucide-react';

interface BackupWidgetProps {
  onExportData: () => any;
  onImportData: (data: any) => boolean;
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
  
  // Custom states for the new robust APK capabilities
  const [activeMode, setActiveMode] = useState<'file' | 'text'>('file');
  const [copied, setCopied] = useState(false);
  const [shareSupported, setShareSupported] = useState(false);
  const [importText, setImportText] = useState('');
  const [showTextDisplay, setShowTextDisplay] = useState(false);
  const [generatedText, setGeneratedText] = useState('');

  useEffect(() => {
    // Check if sharing is supported natively (perfect for Android/Ionic apps)
    if (navigator.share) {
      setShareSupported(true);
    }

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

  const recordBackupTime = () => {
    const now = Date.now();
    localStorage.setItem('sakupintar_last_backup_time', now.toString());
    setLastBackup(new Date(now).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
    setNeedsBackupRemind(false);
    setDaysElapsed(0);
  };

  // Robust method 1: Download backup using Blob ObjectURL (standard browser support)
  const handleDownloadBackup = () => {
    try {
      const data = onExportData();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.download = `sakupintar_backup_${dateStr}.json`;
      
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      
      // Minor delay to remove
      setTimeout(() => {
        document.body.removeChild(downloadAnchor);
        URL.revokeObjectURL(url);
      }, 100);
      
      recordBackupTime();
    } catch (e: any) {
      alert('Gagal mengunduh file cadangan: ' + e.message);
    }
  };

  // Robust method 2: Native Android Sharing via API (Highly recommended for Ionic Apps)
  const handleShareBackup = async () => {
    try {
      const data = onExportData();
      const text = JSON.stringify(data, null, 2);
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `sakupintar_backup_${dateStr}.json`;
      
      // Create a native File object
      const file = new File([text], filename, { type: 'application/json' });
      
      // Check if sharing files is supported
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Cadangan SakuPintar',
          text: `File Cadangan Data SakuPintar (${dateStr})`
        });
        recordBackupTime();
        return;
      }
      
      // If file share is unsupported, fallback to native sharing as plain text
      if (navigator.share) {
        await navigator.share({
          title: 'Cadangan SakuPintar',
          text: text
        });
        recordBackupTime();
        return;
      }
      
      alert('Fitur berbagi tidak didukung oleh perangkat atau browser Anda.');
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        alert('Gagal membagikan cadangan: ' + err.message);
      }
    }
  };

  // Robust method 3: Local Text Copying (100% foolproof fallback)
  const handleCopyBackup = async () => {
    try {
      const data = onExportData();
      const text = JSON.stringify(data, null, 2);
      
      await navigator.clipboard.writeText(text);
      setCopied(true);
      recordBackupTime();
      setTimeout(() => setCopied(false), 2500);
    } catch (err: any) {
      // Older device/webview API fallback
      try {
        const data = onExportData();
        const text = JSON.stringify(data, null, 2);
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = text;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
        setCopied(true);
        recordBackupTime();
        setTimeout(() => setCopied(false), 2500);
      } catch (e) {
        alert('Gagal menyalin teks cadangan secara otomatis. Anda dapat mengetuk tombol "Tampilkan Kode Teks" di bagian Mode Teks untuk menyalin secara manual.');
      }
    }
  };

  const handleGenerateText = () => {
    const data = onExportData();
    setGeneratedText(JSON.stringify(data, null, 2));
    setShowTextDisplay(true);
  };

  const handleImportFromText = () => {
    if (!importText.trim()) {
      alert('Harap tempelkan teks cadangan JSON yang valid terlebih dahulu.');
      return;
    }
    
    try {
      const parsed = JSON.parse(importText);
      const success = onImportData(parsed);
      if (success) {
        setUploadSuccess(true);
        setImportText('');
        setTimeout(() => setUploadSuccess(false), 4000);
      }
    } catch (err: any) {
      alert('Teks cadangan tidak valid. Pastikan format teks yang Anda tempel sesuai dengan format JSON SakuPintar.\n\nDetail error: ' + err.message);
    }
  };

  const processJsonFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const success = onImportData(json);
        if (success) {
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 4000);
        }
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
              Kedaulatan & Portabilitas Data APK
            </span>
          </div>
          <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Cadangan & Pemulihan Data
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-1 font-medium`}>
            Simpan atau pulihkan seluruh pembukuan lokal Anda. Sangat kompatibel dengan instalasi HP/APK Android Ionic.
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

      {/* Mode Navigation tabs - perfect for Android Webview constraints */}
      <div className={`flex p-1 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
        <button
          onClick={() => setActiveMode('file')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black tracking-wider transition-all uppercase flex items-center justify-center gap-2 cursor-pointer ${
            activeMode === 'file'
              ? 'bg-indigo-600 text-white shadow-md'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileJson className="w-4 h-4" />
          📦 Mode Berkas (JSON)
        </button>
        <button
          onClick={() => setActiveMode('text')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black tracking-wider transition-all uppercase flex items-center justify-center gap-2 cursor-pointer ${
            activeMode === 'text'
              ? 'bg-indigo-600 text-white shadow-md'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          ✍️ Mode Salin-Tempel (Teks)
        </button>
      </div>

      {activeMode === 'file' ? (
        /* File Mode Column Grid */
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
                    Ekspor Berkas
                  </h3>
                  <span className="text-[10px] text-slate-500 font-bold">Amankan data berdaulat Anda</span>
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Dapatkan berkas cadangan master `.json` langsung. Sangat disarankan untuk dicadangkan berkala.
              </p>

              <div className={`p-4 rounded-xl space-y-2 ${isDark ? 'bg-black/30' : 'bg-slate-50 border border-slate-100'}`}>
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-slate-500 font-bold">Terakhir Backup:</span>
                  <span className={`font-black uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {lastBackup || 'Belum dicatat'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-slate-500 font-bold">Opsi Berbagi APK:</span>
                  <span className="text-emerald-400 font-black flex items-center gap-1">
                    Aktif & Siap <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {/* Native Sharing Button (Highly robust on mobile APKs) */}
              {shareSupported && (
                <button
                  onClick={handleShareBackup}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-white" />
                  Bagikan / Kirim Berkas Cadangan
                </button>
              )}

              {/* Standard browser download */}
              <button
                onClick={handleDownloadBackup}
                className={`w-full inline-flex items-center justify-center gap-2.5 px-4 py-3 border font-extrabold text-xs rounded-2xl transition-all active:scale-[0.98] cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-white border-white/5'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-850 border-slate-200 shadow-sm'
                }`}
              >
                <Download className="w-4 h-4" />
                Unduh File JSON Cadangan
              </button>
            </div>
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
                    Restore Dari Berkas
                  </h3>
                  <span className="text-[10px] text-slate-500 font-bold">Sinkronkan kembali data eksternal Anda</span>
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Pilih atau seret berkas `.json` cadangan SakuPintar Anda ke area di bawah untuk memuat dan merestorasi seluruh data keuangan.
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
                    <h4 className="text-sm font-black text-emerald-400">Restorasi Sukses!</h4>
                    <p className="text-[11px] text-slate-400">Akun, pagu anggaran, hutang, dan pembukuan berhasil dipulihkan.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="inline-flex p-3 rounded-full bg-slate-800/80 text-indigo-400">
                      <FileJson className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <p className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        Sentuh di sini untuk <span className="text-indigo-400 font-extrabold underline">mencari file .json</span> cadangan
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold">(Mendukung file JSON enkripsi bawaan SakuPintar)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center text-[10.5px] text-slate-400 leading-normal">
              <div className="p-2 bg-indigo-500/10 border border-indigo-400/20 rounded-xl flex gap-2 items-start w-full">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                <p className="text-[10px] text-slate-350">
                  <span className="font-bold text-slate-250">Catatan:</span> Melakukan restorasi berkas akan menimpa saldo lokal saat ini. Pastikan Anda merestorasi berkas yang benar.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Text-Based Mode (100% Android WebView safe - no file permissions required) */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Text-based Export */}
          <div className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-6 ${
            isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200/80 shadow-md'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-3 border-slate-200/5">
                <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                  <Copy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Salin Kode Cadangan Tekstual
                  </h3>
                  <span className="text-[10px] text-slate-500 font-bold">Kopi kode cadangan tanpa file</span>
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Dapatkan seluruh data finansial SakuPintar Anda dalam bentuk teks sandi format JSON. Anda bisa langsung menyalinnya, menyimpannya di catatan hp, atau mengirimkannya ke WhatsApp Anda sendiri.
              </p>

              {showTextDisplay ? (
                <div className="space-y-2">
                  <textarea
                    readOnly
                    value={generatedText}
                    onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                    className={`w-full h-40 rounded-xl p-3 font-mono text-[10px] resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      isDark ? 'bg-black/40 text-indigo-300 border-white/5' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  />
                  <p className="text-[9.5px] text-slate-500 font-bold italic">
                    *Ketuk di dalam kotak untuk menyeleksi seluruh teks kode di atas.
                  </p>
                </div>
              ) : (
                <div className={`p-5 rounded-2xl text-center border ${isDark ? 'border-indigo-500/10 bg-indigo-500/5' : 'border-slate-100 bg-slate-50'}`}>
                  <p className={`text-xs font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Keamanan Lokal Terjamin: Ketuk tombol di bawah untuk men-generate kode teks secara instan.
                  </p>
                  <button
                    onClick={handleGenerateText}
                    className="px-4 py-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 text-[11px] font-black rounded-lg transition-colors border border-indigo-500/25 cursor-pointer"
                  >
                    Tampilkan Kode Teks Cadangan
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                onClick={handleCopyBackup}
                className={`w-full inline-flex items-center justify-center gap-2.5 px-4 py-3.5 font-extrabold text-xs rounded-2xl transition-all active:scale-[0.98] cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    Teks Kode Berhasil Disalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-white" />
                    Salin Teks Kode Cadangan Saku
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Text-based Import */}
          <div className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-6 ${
            isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200/80 shadow-md'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-3 border-slate-200/5">
                <div className="p-2 rounded-xl bg-fuchsia-500/10 text-fuchsia-400">
                  <Clipboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Pulihkan Lewat Teks Cadangan
                  </h3>
                  <span className="text-[10px] text-slate-500 font-bold">Tempel teks untuk memulihkan instan</span>
                </div>
              </div>

              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Tempelkan teks kode JSON cadangan hasil salinan sebelumnya ke kolom di bawah ini, lalu klik "Pulihkan Data Finansial Saku".
              </p>

              <div>
                <textarea
                  placeholder="Tempel teks kode JSON di sini (diawali dengan { dan diakhiri dengan } )"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className={`w-full h-40 rounded-xl p-3 font-mono text-[10px] resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    isDark
                      ? 'bg-black/50 text-emerald-400 border-white/10 placeholder-slate-600'
                      : 'bg-slate-50 text-emerald-700 border-slate-200 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleImportFromText}
                className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-3.5 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-white" />
                Pulihkan Data Finansial Saku (Kirim Teks)
              </button>
            </div>
          </div>
        </div>
      )}

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
