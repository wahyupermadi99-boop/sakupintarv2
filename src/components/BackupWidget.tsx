/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Copy, 
  Clipboard, 
  RefreshCw, 
  Database, 
  ShieldCheck, 
  Info 
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

  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [needsBackupRemind, setNeedsBackupRemind] = useState(false);
  const [daysElapsed, setDaysElapsed] = useState(0);
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    // Generate text automatically on load so user doesn't have to wait or tap twice
    try {
      const data = onExportData();
      setGeneratedText(JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Failed to pre-generate backup data', e);
    }

    // Check backup timing
    const lastBackupTime = localStorage.getItem('sakupintar_last_backup_time');
    const now = Date.now();

    if (!lastBackupTime) {
      localStorage.setItem('sakupintar_last_backup_time', now.toString());
      setLastBackup(new Date(now).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
    } else {
      const lastTimeMs = Number(lastBackupTime);
      const diffMs = now - lastTimeMs;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      setDaysElapsed(diffDays);
      setLastBackup(new Date(lastTimeMs).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
      
      if (diffDays >= 7) {
        setNeedsBackupRemind(true);
      }
    }
  }, [onExportData]);

  const recordBackupTime = () => {
    const now = Date.now();
    localStorage.setItem('sakupintar_last_backup_time', now.toString());
    setLastBackup(new Date(now).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
    setNeedsBackupRemind(false);
    setDaysElapsed(0);
  };

  const handleCopyBackup = async () => {
    try {
      if (!generatedText) {
        const data = onExportData();
        const text = JSON.stringify(data, null, 2);
        setGeneratedText(text);
      }
      
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      recordBackupTime();
      setTimeout(() => setCopied(false), 2500);
    } catch (err: any) {
      try {
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = generatedText;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
        setCopied(true);
        recordBackupTime();
        setTimeout(() => setCopied(false), 2500);
      } catch (e) {
        alert('Gagal menyalin teks cadangan secara otomatis. Silakan salin teks di dalam kotak secara manual.');
      }
    }
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
        // Regenerate current backup block to show newly restored content
        setTimeout(() => {
          try {
            const data = onExportData();
            setGeneratedText(JSON.stringify(data, null, 2));
          } catch (e) {}
          setUploadSuccess(false);
          alert('Data finansial SakuPintar berhasil dipulihkan!');
        }, 1500);
      }
    } catch (err: any) {
      alert('Teks cadangan tidak valid. Pastikan format teks yang Anda tempel sesuai dengan format JSON SakuPintar.\n\nDetail error: ' + err.message);
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
            Cadangan & Pemulihan Teks
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} mt-1 font-medium`}>
            Simpan atau pulihkan seluruh pembukuan lokal Anda secara instan menggunakan salin-tempel teks. Sangat kompatibel dengan instalasi ponsel Android Ionic dan bebas izin file eksternal!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-[11px] font-black flex items-center gap-1.5 border ${
            needsBackupRemind 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' 
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
          }`}>
            <span className={`w-2 h-2 rounded-full ${needsBackupRemind ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            {needsBackupRemind ? `Disarankan Cadangkan (Sudah ${daysElapsed} hari)` : 'Data Aman & Segar'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Text-based Export Panel */}
        <div className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-5 ${
          isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200/80 shadow-md'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-3 border-slate-200/5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Copy className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  1. Salin Kode Cadangan Anda
                </h3>
                <span className="text-[10px] text-slate-500 font-bold">Kopi kode cadangan tanpa memerlukan file</span>
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-350' : 'text-slate-600'}`}>
              Di bawah ini adalah seluruh rangkuman akun, anggaran, pembukuan, transaksi, dan hutang Anda dalam bentuk kode teks JSON. Simpan teks ini di catatan pribadi HP (Notes/Keep) atau kirim ke WhatsApp sendiri.
            </p>

            <div className="space-y-2">
              <textarea
                readOnly
                value={generatedText}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                className={`w-full h-48 rounded-xl p-3 font-mono text-[10px] resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  isDark ? 'bg-black/40 text-indigo-300 border-white/5' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              />
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-slate-500 font-bold">Terakhir Disalin: <span className="text-slate-400">{lastBackup || 'Belum dicatat'}</span></span>
                <span className="text-slate-500 font-bold italic">*Ketuk sekali untuk pilih semua teks</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
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
                  KODE CADANGAN BERHASIL DISALIN!
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

        {/* Text-based Import Panel */}
        <div className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-5 ${
          isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200/80 shadow-md'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-3 border-slate-200/5">
              <div className="p-2 rounded-xl bg-fuchsia-500/10 text-fuchsia-400">
                <Clipboard className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  2. Pulihkan Lewat Teks Cadangan
                </h3>
                <span className="text-[10px] text-slate-500 font-bold">Tempelkan teks kode untuk pemulihan instan</span>
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-355' : 'text-slate-600'}`}>
              Punya teks cadangan SakuPintar yang sudah Anda simpan di catatan HP? Cukup tempelkan seluruh teks tersebut pada kolom di bawah ini untuk memulihkan seluruh laporan keuangan Anda secara lengkap.
            </p>

            <div>
              <textarea
                placeholder="Tempelkan teks kode JSON di sini (diawali dengan { dan diakhiri dengan } )"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className={`w-full h-48 rounded-xl p-3 font-mono text-[10px] resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  isDark
                    ? 'bg-black/50 text-emerald-400 border-white/10 placeholder-slate-600'
                    : 'bg-slate-50 text-emerald-700 border-slate-200 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleImportFromText}
              disabled={uploadSuccess}
              className={`w-full inline-flex items-center justify-center gap-2.5 px-4 py-3.5 text-white font-extrabold text-xs rounded-2xl transition-all shadow-md active:scale-[0.98] cursor-pointer ${
                uploadSuccess 
                  ? 'bg-emerald-600' 
                  : 'bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500'
              }`}
            >
              <RefreshCw className={`w-4 h-4 text-white ${uploadSuccess ? 'animate-spin' : ''}`} />
              {uploadSuccess ? 'Sedang Memulihkan Data...' : 'Kirim & Pulihkan Data Finansial Saku'}
            </button>
          </div>
        </div>
      </div>

      {/* Warning/Privacy Info widget */}
      <div className={`p-4 rounded-2xl flex gap-3.5 items-start ${
        isDark ? 'bg-indigo-500/5 border border-indigo-400/10' : 'bg-slate-50 border border-slate-200'
      }`}>
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-0.5">
          <p className={`text-[11.5px] font-black uppercase tracking-wide ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            Kenapa mode teks adalah yang terbaik untuk Ionic / Mobile?
          </p>
          <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Pada beberapa smartphone, sistem operasi (Android/iOS) membatasi akses aplikasi web modern ke sistem penyimpanan file lokal. Menggunakan salin-tempel teks (Clipboard) menjamin fitur cadangan dan pemulihan data bekerja **100% tanpa hambatan, tanpa memerlukan izin khusus**, dan sangat mudah dibagikan.
          </p>
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
