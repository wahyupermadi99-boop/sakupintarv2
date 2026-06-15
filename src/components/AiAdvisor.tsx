/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrainCircuit, Sparkles, AlertCircle, RefreshCw, CheckCircle2, ChevronRight, Activity, Terminal } from 'lucide-react';
import { Transaction, BudgetBucket, DebtItem, AIAnalysisReport } from '../types';
import { runOfflineFinancialAnalysis } from '../lib/expertSystem';

interface AiAdvisorProps {
  transactions: Transaction[];
  budgets: BudgetBucket[];
  debts: DebtItem[];
  totalIncome: number;
  totalExpense: number;
}

export default function AiAdvisor({
  transactions,
  budgets,
  debts,
  totalIncome,
  totalExpense,
}: AiAdvisorProps) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AIAnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagnosticMode, setDiagnosticMode] = useState<'none' | 'cloud' | 'local'>('none');

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setReport(null);

    // Call actual backend Node API
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions,
          budgets,
          debts,
          totalIncome,
          totalExpense,
        }),
      });

      if (!response.ok) {
        throw new Error('Server API unavailable');
      }

      const data = await response.json();
      
      if (data.error) {
        // Safe backend response with fallback warning
        throw new Error(data.error);
      }

      setReport({
        id: 'report_cloud_' + Date.now(),
        timestamp: new Date().toISOString(),
        totalIncome,
        totalExpense,
        debtRatio: data.debtRatio || 0,
        debtStatus: data.debtStatus || 'sehat',
        healthScore: data.healthScore || 70,
        markdownReport: data.reportMarkdown || 'Gagal merender isi analisis cloud.',
      });
      setDiagnosticMode('cloud');
    } catch (err: any) {
      console.warn('Backend API request skipped or failed. Activating local financial logic engine.', err);
      
      // Automatic intelligent run fallback using expertSystem.ts
      setTimeout(() => {
        const localReport = runOfflineFinancialAnalysis(transactions, budgets, debts, totalIncome, totalExpense);
        setReport(localReport);
        setDiagnosticMode('local');
        setLoading(false);
      }, 1500); // Small realistic computation delay for native vibe
      return;
    }

    setLoading(false);
  };

  // Simple, elegant, regex-free markdown compiler that converts lines to clean React tags for visual styling
  const renderMarkdown = (md: string) => {
    const lines = md.split('\n');
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-lg font-black text-white mt-5 mb-2.5 flex items-center gap-1.5 border-b border-white/5 pb-1">
            <span className="text-cyan-400">#</span> {trimmed.replace('## ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm font-extrabold text-cyan-300 mt-4 mb-2">
            {trimmed.replace('### ', '')}
          </h4>
        );
      }
      if (trimmed.startsWith('- **') || trimmed.startsWith('* **')) {
        // Bullet list item with bold prefix
        const cleansed = trimmed.replace(/^[-*]\s+/, '');
        const match = cleansed.match(/^\*\*(.*?)\*\*(.*)/);
        if (match) {
          return (
            <div key={idx} className="flex gap-2.5 text-xs text-slate-300 ml-2 mb-2 leading-relaxed font-semibold">
              <span className="text-fuchsia-400">•</span>
              <span>
                <strong className="text-white font-black">{match[1]}</strong>
                {match[2]}
              </span>
            </div>
          );
        }
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <div key={idx} className="flex gap-2.5 text-xs text-slate-300 ml-2 mb-2 leading-relaxed font-semibold">
            <span className="text-cyan-400">•</span>
            <span>{trimmed.replace(/^[-*]\s+/, '')}</span>
          </div>
        );
      }
      if (trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ')) {
        const number = trimmed.substring(0, 3);
        const text = trimmed.substring(3);
        const match = text.match(/^\*\*(.*?)\*\*(.*)/);
        return (
          <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex gap-3 text-xs text-slate-300 mt-3 mb-3 hover:border-white/10 transition-colors">
            <div className="w-5 h-5 rounded-full bg-cyan-400/10 text-cyan-400 flex items-center justify-center font-black text-[10px] flex-shrink-0 mt-0.5">
              {number.replace('. ', '')}
            </div>
            <div>
              {match ? (
                <span>
                  <strong className="text-white font-black block text-sm mb-1">{match[1]}</strong>
                  <span className="font-medium text-slate-400 leading-relaxed">{match[2]}</span>
                </span>
              ) : (
                <span className="font-medium text-slate-300">{text}</span>
              )}
            </div>
          </div>
        );
      }
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        return (
          <p key={idx} className="text-sm font-black text-rose-400 mt-2.5 mb-2.5">
            {trimmed.replace(/\*\*/g, '')}
          </p>
        );
      }
      if (trimmed === '---') {
        return <div key={idx} className="h-[1px] bg-white/5 my-4" />;
      }
      if (trimmed === '') {
        return <div key={idx} className="h-2" />;
      }

      // Inline strong tag rendering helper for simple bold sentences
      const boldParts = trimmed.split('**');
      if (boldParts.length > 2) {
        return (
          <p key={idx} className="text-xs font-semibold text-slate-300 leading-relaxed mb-2.5">
            {boldParts.map((part, pIdx) => 
              pIdx % 2 === 1 ? <strong key={pIdx} className="text-white font-black">{part}</strong> : part
            )}
          </p>
        );
      }

      return (
        <p key={idx} className="text-xs font-semibold text-slate-300 leading-relaxed mb-2.5">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6 pb-24 text-white">
      {/* Upper header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <span className="text-[10px] font-black tracking-widest uppercase text-teal-400">ANALISIS PREVENTIF</span>
        <h2 className="text-2xl font-black tracking-tight text-white m-0 flex items-center gap-2">
          SakuPintar AI Advisor <span className="text-xl">✨</span>
        </h2>
        <p className="text-slate-400 text-xs">Konsultasikan kesehatan dan kestabilan keuangan harian Anda langsung pada AI.</p>
      </motion.div>

      {/* Launcher Hub Core Card */}
      {!report && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-indigo-950 via-[#0a0520] to-[#050110] border border-white/10 rounded-[40px] p-8 flex flex-col items-center text-center relative overflow-hidden shadow-2xl"
        >
          {/* Animated Purple Vector background circles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px]" />
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-400/10 rounded-full blur-[60px]" />

          <div className="relative z-10 space-y-6 flex flex-col items-center">
            {/* Main big glowing interactive AI orb */}
            <button
              onClick={runAnalysis}
              className="w-24 h-24 rounded-full bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-indigo-700 p-0.5 shadow-[0_0_30px_rgba(192,38,211,0.5)] cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-300 ai-pulse-glow flex items-center justify-center border-2 border-white/20"
            >
              <div className="w-full h-full rounded-full bg-[#050110] flex items-center justify-center">
                <BrainCircuit className="w-11 h-11 text-cyan-400" />
              </div>
            </button>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-white">Mulai Diagnosa Finansial</h3>
              <p className="text-xs text-slate-400 max-w-[250px] mx-auto leading-relaxed font-bold">
                Uji apakah pola rincian pengeluaran, budgeting pos gaji, dan cicilan hutang bulananmu sehat atau rapuh dengan sekali sentuh.
              </p>
            </div>

            <button
              onClick={runAnalysis}
              className="px-6 py-3 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-orange-400 hover:from-cyan-500 hover:to-orange-500 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl transition-all"
            >
              Jalankan Diagnosa AI ✨
            </button>
          </div>
        </motion.div>
      )}

      {/* Loading States with rotating reassuring status lines */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white/5 border border-white/10 p-8 rounded-[40px] text-center space-y-6 flex flex-col items-center justify-center min-h-[300px]"
          >
            <div className="w-16 h-16 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              <BrainCircuit className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-black text-white flex items-center gap-1.5 justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Sedang Menghitung Estimasi...
              </h4>
              <p className="text-slate-400 text-xs max-w-[240px] mx-auto font-bold leading-relaxed">
                Membaca histori belanja, porsi pos gaji, kalkulasi rasio hutang serta merumuskan rekomendasi aman untukmu.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Output Diagnostic View */}
      {report && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Cloud vs Offline Fallback Status Indicator Banner */}
          {diagnosticMode === 'local' ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-2.5 text-xs text-amber-300 font-bold leading-relaxed">
              <Terminal className="w-4.5 h-4.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span>Offline Engine Aktif:</span> Menggunakan algoritma perencanaan finansial lokal (SakuPintar Expert Solver) agar asisten bekerja lancar tanpa server Node.
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex gap-2.5 text-xs text-emerald-400 font-bold leading-relaxed">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span>Cloud AI Aktif:</span> Pola belanja dianalisis menggunakan kecerdasan buatan Gemini Generative SDK terkini.
              </div>
            </div>
          )}

          {/* Core Score Ring Container */}
          <div className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-white/10 rounded-[35px] p-5">
            <div className="flex items-center gap-4">
              {/* Numerical score visual block */}
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${
                report.healthScore >= 80 ? 'from-emerald-400 to-teal-500' : report.healthScore >= 60 ? 'from-amber-400 to-orange-500' : 'from-rose-500 to-orange-500'
              } flex flex-col items-center justify-center text-slate-950 flex-shrink-0 shadow-lg`}>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#050110] opacity-80 leading-none">SCORE</span>
                <span className="text-3xl font-black text-[#050110] tracking-tighter leading-none mt-1">{report.healthScore}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">PREDIKAT KESEHATAN</span>
                <h3 className="text-base font-black text-white mt-0.5">
                  {report.healthScore >= 80 ? 'Sangat Aman & Sehat 🌿' : report.healthScore >= 60 ? 'Perlu Rem Belanja! ⚠️' : 'Kritis / Defisit Kas! 🚨'}
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">
                  Rasio Hutang: {report.debtRatio.toFixed(1)}% ({report.debtStatus === 'sehat' ? 'Efisien' : 'Waspada'})
                </p>
              </div>
            </div>
          </div>

          {/* Markdown advice display */}
          <div className="bg-white/5 border border-white/10 rounded-[35px] p-6 text-left shadow-lg overflow-hidden whitespace-normal">
            {renderMarkdown(report.markdownReport)}
          </div>

          <button
            onClick={runAnalysis}
            className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 active:scale-95 text-slate-300 hover:text-white"
          >
            <RefreshCw className="w-4.5 h-4.5" /> Jalankan Analisis Ulang
          </button>
        </motion.div>
      )}
    </div>
  );
}
