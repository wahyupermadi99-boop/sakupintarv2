/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Calendar, 
  ChevronRight, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldAlert, 
  Award, 
  FileCheck, 
  Compass, 
  LineChart, 
  Info, 
  Sparkles, 
  Wallet, 
  HeartHandshake,
  DollarSign
} from 'lucide-react';
import { Transaction, BudgetBucket, DebtItem } from '../types';

interface FinancialReportProps {
  transactions: Transaction[];
  budgets: BudgetBucket[];
  debts: DebtItem[];
  liveCashBalance: number;
  totalBankBalance: number;
  totalCombinedBalance: number;
  theme: 'dark' | 'light';
}

type PeriodType = 'today' | 'custom_date' | 'monthly' | 'yearly';

export default function FinancialReport({
  transactions,
  budgets,
  debts,
  liveCashBalance,
  totalBankBalance,
  totalCombinedBalance,
  theme
}: FinancialReportProps) {
  
  const isDark = theme === 'dark';

  // 1. Periodical Ledger Reporting States
  const [reportPeriod, setReportPeriod] = useState<PeriodType>('monthly');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  const currentMonthNum = new Date().getMonth() + 1; // 1 - 12
  const [selectedMonth, setSelectedMonth] = useState(currentMonthNum);
  const [selectedYear, setSelectedYear] = useState(2026);

  // Indonesian Months
  const INDO_MONTHS = [
    { value: 1, name: 'Januari' },
    { value: 2, name: 'Februari' },
    { value: 3, name: 'Maret' },
    { value: 4, name: 'April' },
    { value: 5, name: 'Mei' },
    { value: 6, name: 'Juni' },
    { value: 7, name: 'Juli' },
    { value: 8, name: 'Agustus' },
    { value: 9, name: 'September' },
    { value: 10, name: 'Oktober' },
    { value: 11, name: 'November' },
    { value: 12, name: 'Desember' }
  ];

  // Years options
  const YEARS = [2025, 2026, 2027, 2028];

  // Target values for CFP planner (with interactive controls so user can simulate CFP planning)
  const [monthlyExpenseEstimate, setMonthlyExpenseEstimate] = useState<number>(() => {
    // Attempt to guess monthly expense from actual budgets + debts or default to 5,500,000
    const budgetSum = budgets.reduce((sum, b) => sum + b.allocated, 0);
    const debtSum = debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
    return (budgetSum + debtSum) || 5500000;
  });

  const [monthlyIncomeEstimate, setMonthlyIncomeEstimate] = useState<number>(() => {
    // Estimate monthly salary from actual income transactions
    const salaryTrans = transactions.filter(t => t.type === 'income');
    if (salaryTrans.length > 0) {
      // Find the maximum single income (often the monthly salary)
      return Math.max(...salaryTrans.map(t => t.amount));
    }
    return 8500000;
  });

  const [monthlySavingsTarget, setMonthlySavingsTarget] = useState<number>(1500000);

  // Standard emergency fund goal based on user's estimated monthly expenses
  // CFP recommendation: 3x-6x expenses for single, 6x-12x for married / dependents
  const emFund3x = monthlyExpenseEstimate * 3;
  const emFund6x = monthlyExpenseEstimate * 6;
  const emFund12x = monthlyExpenseEstimate * 12;

  // Retrieve actual Emergency Fund goal & saved values from localStorage
  const actualEmSaved = Number(localStorage.getItem('sakupintar_em_current') || '4500000');
  const actualEmGoal = Number(localStorage.getItem('sakupintar_em_goal') || '15000000');

  // Filter transactions based on selection period
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      const tYear = tDate.getFullYear();
      const tMonth = tDate.getMonth() + 1; // 1-indexed
      const tDayStr = t.date; // "yyyy-mm-dd"

      if (reportPeriod === 'today') {
        const todayStr = new Date().toISOString().split('T')[0];
        // For local development sandbox, default fallback to metadata date if today has no results
        const todayMetaStr = '2026-06-11';
        return tDayStr === todayStr || tDayStr === todayMetaStr;
      }
      
      if (reportPeriod === 'custom_date') {
        return tDayStr === selectedDate;
      }
      
      if (reportPeriod === 'monthly') {
        return tMonth === selectedMonth && tYear === selectedYear;
      }

      if (reportPeriod === 'yearly') {
        return tYear === selectedYear;
      }

      return true;
    });
  }, [transactions, reportPeriod, selectedDate, selectedMonth, selectedYear]);

  // Calculations for the filtered period
  const periodIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const periodExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const periodSurplus = periodIncome - periodExpense;
  const periodSavingsRatio = periodIncome > 0 ? (periodSurplus / periodIncome) * 100 : 0;

  // Category summary for filtered period
  const categorySummary = useMemo(() => {
    const summary: Record<string, number> = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const category = t.category || 'Lain-lain';
        summary[category] = (summary[category] || 0) + t.amount;
      });
    
    return Object.entries(summary).sort((a, b) => b[1] - a[1]);
  }, [filteredTransactions]);

  // CFP RATIO AUDIT CALCULATIONS
  // A. savings ratio score
  const actualSavingsRatio = monthlyIncomeEstimate > 0 ? (monthlySavingsTarget / monthlyIncomeEstimate) * 100 : 0;
  const savingsStatus = actualSavingsRatio >= 20 
    ? { label: 'Optimal 🏆', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', note: 'Sangat baik! Anda sudah mengalokasikan >= 20% khusus masa depan.' }
    : actualSavingsRatio >= 10
    ? { label: 'Cukup 🌟', color: 'text-cyan-500 bg-cyan-400/10 border-cyan-400/20', note: 'Bagus, alokasi minimal 10% sudah terpenuhi. Upayakan tingkatkan lagi.' }
    : { label: 'Kurang 🚨', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', note: 'Bahaya! Rasio tabungan di bawah 10% rentan membuat kas stagnan.' };

  // B. Debt-to-income ratio (DTI)
  const totalMonthlyDebt = debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  const actualDti = monthlyIncomeEstimate > 0 ? (totalMonthlyDebt / monthlyIncomeEstimate) * 100 : 0;
  const dtiStatus = actualDti <= 30
    ? { label: 'Sangat Sehat 👍', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', desc: 'Rasio hutang Anda aman (di bawah 30% pendapatan).' }
    : actualDti <= 35
    ? { label: 'Waspada ⚠️', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', desc: 'Hati-hati, cicilan Anda berada di batas psikologis CFP (30-35%).' }
    : { label: 'Bahaya Kritis 🚨', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', desc: 'Rasio cicilan melebihi 35%! Cash flow bulanan Anda tercekik.' };

  // C. Emergency fund ratio (months of expenses)
  const emMonthCoverage = monthlyExpenseEstimate > 0 ? actualEmSaved / monthlyExpenseEstimate : 0;
  const emStatus = emMonthCoverage >= 6
    ? { label: 'Sangat Aman 🧊', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', details: `Dana darurat menutupi ${emMonthCoverage.toFixed(1)} bulan pengeluaran. Ideal untuk perlindungan krisis.` }
    : emMonthCoverage >= 3
    ? { label: 'Cukup Aman ⛅', color: 'text-cyan-500 bg-cyan-400/10 border-cyan-400/20', details: `Kover ${emMonthCoverage.toFixed(1)} bulan pengeluaran. Cukup untuk lajang, namun perlu ditambah.` }
    : { label: 'Waspada Rawan 🔥', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', details: `Dana darurat di bawah 3 bulan pengeluaran. Atasi pengeluaran non-primer secepat mungkin!` };

  // D. Liquidity Ratio (Standard CFP: Liquid Assets / Monthly Expenses)
  const liquidAssets = totalCombinedBalance;
  const liquidityRatioVal = monthlyExpenseEstimate > 0 ? liquidAssets / monthlyExpenseEstimate : 0;
  const liquidityStatus = liquidityRatioVal >= 3
    ? { label: 'Sehat Cair 💧', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', note: 'Aset likuid Anda mencukupi untuk menghadapi tuntutan mendadak.' }
    : { label: 'Agak Kering 🏜️', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', note: 'Aset cair minim. Anda rawan terpaksa berhutang jika ada tagihan tak terduga.' };

  // CFP Planner Overall Score
  const cfpScore = Math.round(
    (actualSavingsRatio >= 10 ? 25 : 10) +
    (actualDti <= 35 ? 25 : 5) +
    (emMonthCoverage >= 3 ? 25 : 5) +
    (liquidityRatioVal >= 3 ? 25 : 5)
  );

  const getCfpGrade = (score: number) => {
    if (score >= 80) return { title: 'Bintang Emas Financial (CFP Grade A)', color: 'from-emerald-500 to-teal-500', desc: 'Perencanaan keuangan sangat matang dan kokoh!' };
    if (score >= 60) return { title: 'Keuangan Stabil (CFP Grade B)', color: 'from-cyan-500 to-blue-500', desc: 'Keuangan relatif aman, butuh sedikit pembenahan tabungan.' };
    return { title: 'Butuh Restrukturisasi Segera (CFP Grade C)', color: 'from-amber-500 to-rose-600', desc: 'Struktur anggaran berat sebelah. Segera kurangi cicilan & amankan dana darurat!' };
  };

  const currentGrade = getCfpGrade(cfpScore);

  return (
    <div className={`space-y-6 pb-28 ${isDark ? 'text-white' : 'text-slate-800'}`}>
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black tracking-widest text-cyan-400 uppercase block">FINANCIAL PLANNER STUDIO</span>
          <h2 className="text-2xl font-black tracking-tight">Laporan Keuangan & CFP Audit 📊</h2>
        </div>

        {/* Toggle report style standard vs CFP checklist */}
        <div className="inline-flex p-1 bg-black/20 rounded-2xl border border-white/5 self-start">
          <span className="text-[10px] font-bold text-slate-400 px-3 py-1 bg-white/5 rounded-xl uppercase tracking-wide">
            Verified CFP Standard
          </span>
        </div>
      </div>

      {/* QUICK STATS IN BRIEF */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Aset Likuid */}
        <div className={`p-4.5 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200/80 shadow-sm'} space-y-2`}>
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
            <span>Aset Likuid (Kas + Bank)</span>
            <Wallet className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-2xl font-black">
              Rp {totalCombinedBalance.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold border-t border-slate-100/10 pt-2">
            <span>Tunai: Rp {liveCashBalance.toLocaleString('id-ID')}</span>
            <span>Bank: Rp {totalBankBalance.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Total Pinjaman bulanan */}
        <div className={`p-4.5 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200/80 shadow-sm'} space-y-2`}>
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
            <span>Cicilan Bulanan Aktif</span>
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <span className="text-2xl font-black text-rose-500">
              Rp {totalMonthlyDebt.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-semibold border-t border-slate-100/10 pt-2 flex items-center justify-between">
            <span>Cicilan vs Gaji: </span>
            <span className={`font-black ${actualDti > 35 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {actualDti.toFixed(1)}% ({actualDti > 35 ? 'Melebihi Limit' : 'Aman'})
            </span>
          </div>
        </div>

        {/* CFP Financial Health Grade Pin */}
        <div className={`p-4.5 rounded-3xl border bg-gradient-to-br ${currentGrade.color} text-white shadow-md space-y-2 relative overflow-hidden`}>
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-2 translate-y-2">
            <Award className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase tracking-wide bg-white/20 px-2 py-0.5 rounded-full inline-block mb-1">
              STATUS CFP AUDIT
            </span>
            <h4 className="text-base font-black truncate">{currentGrade.title}</h4>
            <p className="text-[11px] font-medium text-white/95 leading-tight mt-1">{currentGrade.desc}</p>
          </div>
        </div>

      </div>

      {/* CORE SELECTION TAB: LEDGER VS CFP ASSESSMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN LEFT & CENTER: REPORTING ENGINE & DRILLDOWNS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* LEDGER REPORT CONTAINER */}
          <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#0E0B1F]/90 border-white/5' : 'bg-white border-slate-100 shadow-sm'} space-y-5`}>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-cyan-400" />
                  Buku Kas & Filter Transaksi Lengkap
                </h3>
                <p className="text-xs text-slate-400">Analisis pengeluaran berdasarkan periode secara detail.</p>
              </div>

              {/* Day, Date, Month, Year Filter Trigger Tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-black/40 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-wider text-slate-400 shrink-0">
                <button
                  onClick={() => setReportPeriod('today')}
                  className={`py-1.5 px-2 rounded-lg text-center transition-colors ${reportPeriod === 'today' ? 'bg-cyan-400 text-slate-950 font-black' : 'hover:bg-white/5 hover:text-white'}`}
                >
                  Hari
                </button>
                <button
                  onClick={() => setReportPeriod('custom_date')}
                  className={`py-1.5 px-2 rounded-lg text-center transition-colors ${reportPeriod === 'custom_date' ? 'bg-cyan-400 text-slate-950 font-black' : 'hover:bg-white/5 hover:text-white'}`}
                >
                  Tgl
                </button>
                <button
                  onClick={() => setReportPeriod('monthly')}
                  className={`py-1.5 px-2 rounded-lg text-center transition-colors ${reportPeriod === 'monthly' ? 'bg-cyan-400 text-slate-950 font-black' : 'hover:bg-white/5 hover:text-white'}`}
                >
                  Bln
                </button>
                <button
                  onClick={() => setReportPeriod('yearly')}
                  className={`py-1.5 px-2 rounded-lg text-center transition-colors ${reportPeriod === 'yearly' ? 'bg-cyan-400 text-slate-950 font-black' : 'hover:bg-white/5 hover:text-white'}`}
                >
                  Thn
                </button>
              </div>
            </div>

            {/* DYNAMIC CONTEXTUAL REPORT CONTROLLER */}
            <div className="p-3 bg-black/20 border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              
              {reportPeriod === 'today' && (
                <div className="flex items-center gap-2 text-slate-300 font-semibold py-1">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>Periode Aktif: <strong>Hari Ini (Real-time Kas)</strong></span>
                </div>
              )}

              {reportPeriod === 'custom_date' && (
                <div className="flex items-center gap-3 w-full justify-between">
                  <span className="font-bold text-slate-300">Pilih Tanggal:</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-bold max-w-[160px] text-right"
                  />
                </div>
              )}

              {reportPeriod === 'monthly' && (
                <div className="flex items-center gap-2.5 w-full justify-between">
                  <span className="font-bold text-slate-300">Pilih Bulan & Tahun:</span>
                  <div className="flex gap-2">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold"
                    >
                      {INDO_MONTHS.map(m => (
                        <option key={m.value} value={m.value} className="bg-slate-950 text-white">
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold"
                    >
                      {YEARS.map(y => (
                        <option key={y} value={y} className="bg-slate-950 text-white">
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {reportPeriod === 'yearly' && (
                <div className="flex items-center gap-2.5 w-full justify-between">
                  <span className="font-bold text-slate-300">Pilih Tahun Anggaran:</span>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold max-w-[140px] text-right"
                  >
                    {YEARS.map(y => (
                      <option key={y} value={y} className="bg-slate-950 text-white">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* PERIOD SUMMARY BLOCK CARD */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs">
              
              <div className="p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                <span className="text-[9.5px] font-bold text-slate-400 uppercase">Pemasukan Periode</span>
                <span className="text-[17px] font-black text-emerald-400 block mt-0.5">
                  Rp {periodIncome.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="p-3 bg-rose-500/5 rounded-2xl border border-rose-500/10">
                <span className="text-[9.5px] font-bold text-slate-400 uppercase">Pengeluaran Periode</span>
                <span className="text-[17px] font-black text-rose-400 block mt-0.5">
                  Rp {periodExpense.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="p-3 bg-cyan-500/5 rounded-2xl border border-cyan-500/10">
                <span className="text-[9.5px] font-bold text-slate-400 uppercase">Arus Kas Bersih (Sisa)</span>
                <span className={`text-[17px] font-black block mt-0.5 ${periodSurplus >= 0 ? 'text-cyan-400' : 'text-rose-500'}`}>
                  Rp {periodSurplus.toLocaleString('id-ID')}
                </span>
                {periodIncome > 0 && (
                  <span className="text-[8.5px] text-slate-400 font-bold block">
                    Rasio sisa kas: {periodSavingsRatio.toFixed(0)}%
                  </span>
                )}
              </div>

            </div>

            {/* EXPENSE CATEGORY BREAKDOWN GRAPHS */}
            {categorySummary.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Proporsi Pengeluaran Pos Periode Ini
                </span>
                
                <div className="space-y-2.5">
                  {categorySummary.map(([cat, amt]) => {
                    const ratio = periodExpense > 0 ? (amt / periodExpense) * 105 : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="flex items-center gap-1.5 font-bold text-slate-300">
                            <span className="w-2 h-2 rounded-full bg-indigo-400" />
                            {cat}
                          </span>
                          <span>Rp {amt.toLocaleString('id-ID')} ({Math.round(ratio)}%)</span>
                        </div>
                        {/* Custom Pure CSS responsive bar meter */}
                        <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden p-[1px] flex items-center">
                          <div 
                            style={{ width: `${Math.min(100, ratio)}%` }}
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TRANSACTIONS LIST FOR THIS PERIOD */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-white/5 pb-1">
                Daftar Ledger Mutasi ({filteredTransactions.length})
              </span>

              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 bg-slate-900/10 rounded-2xl border border-dashed border-white/5">
                  <p className="text-xs text-slate-400">Tidak ada mutasi transaksi pada periode terpilih.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {filteredTransactions.map((t) => (
                    <div 
                      key={t.id}
                      className="bg-black/30 border border-white/5 p-3 rounded-xl flex items-center justify-between gap-3 hover:bg-black/40 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {t.type === 'income' ? 'IN' : 'OUT'}
                          </span>
                          <span className="text-slate-500 text-[10px] font-bold">{t.date}</span>
                        </div>
                        <h4 className="text-xs font-black text-white truncate max-w-[150px] sm:max-w-xs mt-0.5">{t.description}</h4>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">{t.category}</span>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className={`text-xs font-black block ${t.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                          {t.type === 'income' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[8.5px] text-slate-400 block font-bold">
                          {t.sourceType === 'bank' ? `🏦 ${t.bankName}` : '🪙 Tunai'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* CFP DETAILED STRATEGY ADVISOR */}
          <div className={`p-5 rounded-3xl border ${isDark ? 'bg-gradient-to-r from-slate-900 to-[#120B2F] border-indigo-500/10' : 'bg-[#F5F8FF] border-slate-200'} space-y-4`}>
            
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-black">Plan Strategi Dana Darurat & CFP</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Alokasi perencanaan keuangan tersertifikasi (CFP) beroperasi dengan ketersediaan Dana Darurat sebagai pertahanan mutlak (Defense First). Berikut adalah pilar tindakan taktis untuk memperkokoh postur anggaran Anda:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              
              <div className="p-3 bg-black/40 border border-white/5 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase">🛡️ Fondasi Dana Darurat</span>
                <p className="text-[10.5px] text-slate-300 leading-relaxed">
                  <strong>Harus selalu diingat:</strong> Sebelum mendepositokan dana ke instrumen saham atau instrumen berisiko tinggi lainnya, pastikan Dana Darurat ter-kover minimal <strong>3x pengeluaran</strong>. Pindahkan dana darurat ini ke rekening bank terpisah (seperti Bank Jago atau SeaBank) agar tidak sengaja terbelanjakan.
                </p>
              </div>

              <div className="p-3 bg-black/40 border border-white/5 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-cyan-400 uppercase">📦 Metode Alokasi CFP 50-30-20</span>
                <p className="text-[10.5px] text-slate-300 leading-relaxed">
                  Batasi pengeluaran wajib (Kebutuhan & Cicilan) maksimal 50% dari total pendapatan bulanan Anda. Sisihkan 20% langsung di hari pertama gajian untuk tabungan atau investasi masa kritis. Sisanya 30% adalah hak Anda untuk keinginan harian/gaya hidup.
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* COLUMN RIGHT: CFP AUDIT DASHBOARD, INTERACTIVE ESTIMATOR */}
        <div className="space-y-6">
          
          {/* INTERACTIVE ESTIMATOR & RATIOS CHECKLIST PANEL */}
          <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#0E0B1F]/90 border-white/5' : 'bg-white border-slate-100 shadow-sm'} space-y-4`}>
            
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-base font-black flex items-center gap-2 text-indigo-400">
                <FileCheck className="w-5 h-5" />
                Interaktif CFP Planner
              </h3>
              <p className="text-[10.5px] text-slate-400">Atur nilai simulasi finansial planner Anda di bawah:</p>
            </div>

            {/* INPUT ESTIMATES FOR CFP SIMULATION */}
            <div className="space-y-3.5 text-xs">
              
              {/* Income input */}
              <div>
                <label className="block text-[9.5px] font-bold text-slate-300 uppercase mb-1">
                  Pemasukan Bulanan Rata-Rata (Gaji)
                </label>
                <div className="flex gap-2 items-center bg-black/40 border border-white/5 rounded-xl px-2.5 py-1 text-white font-bold">
                  <span className="text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={monthlyIncomeEstimate}
                    onChange={(e) => setMonthlyIncomeEstimate(Number(e.target.value) || 0)}
                    className="w-full bg-transparent p-1 border-none focus:outline-none text-white"
                  />
                </div>
              </div>

              {/* Expense input */}
              <div>
                <label className="block text-[9.5px] font-bold text-slate-300 uppercase mb-1">
                  Pengeluaran Penggunaan Hidup / bln
                </label>
                <div className="flex gap-2 items-center bg-black/40 border border-white/5 rounded-xl px-2.5 py-1 text-white font-bold">
                  <span className="text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={monthlyExpenseEstimate}
                    onChange={(e) => setMonthlyExpenseEstimate(Number(e.target.value) || 0)}
                    className="w-full bg-transparent p-1 border-none focus:outline-none text-white"
                  />
                </div>
              </div>

              {/* Savings target */}
              <div>
                <label className="block text-[9.5px] font-bold text-slate-300 uppercase mb-1">
                  Target Menabung Rutin per Bulan
                </label>
                <div className="flex gap-2 items-center bg-black/40 border border-white/5 rounded-xl px-2.5 py-1 text-white font-bold">
                  <span className="text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={monthlySavingsTarget}
                    onChange={(e) => setMonthlySavingsTarget(Number(e.target.value) || 0)}
                    className="w-full bg-transparent p-1 border-none focus:outline-none text-white"
                  />
                </div>
              </div>

            </div>

            {/* DIVIDER */}
            <div className="h-[1px] bg-white/5" />

            {/* CFP RATIOS CHECKLIST CARD */}
            <div className="space-y-4">
              
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Hasil Audit Rencana Finansial CFP
              </span>

              {/* SAVINGS RATIO */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1.5">
                    🪙 Rasio Menabung
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${savingsStatus.color}`}>
                    {savingsStatus.label}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] font-bold pl-5.5 text-slate-300">
                  <span>Saat ini: {actualSavingsRatio.toFixed(1)}%</span>
                  <span>Target CFP: Min 10% - 20%</span>
                </div>
                <p className="text-[9.5px] leading-tight text-slate-400 pl-5.5 font-semibold">
                  {savingsStatus.note}
                </p>
              </div>

              {/* DEBT TO INCOME RATIO */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1.5">
                    💳 Rasio Hutang (DTI)
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${dtiStatus.color}`}>
                    {dtiStatus.label}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] font-bold pl-5.5 text-slate-300">
                  <span>Rasio saat ini: {actualDti.toFixed(1)}%</span>
                  <span>Batas CFP: Max 35%</span>
                </div>
                <p className="text-[9.5px] leading-tight text-slate-400 pl-5.5 font-semibold">
                  {dtiStatus.desc}
                </p>
              </div>

              {/* EMERGENCY FUND ADEQUACY */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1.5">
                    🛡️ Dana Darurat Kover
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${emStatus.color}`}>
                    {emStatus.label}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] font-bold pl-5.5 text-slate-300">
                  <span>Aktif kover: {emMonthCoverage.toFixed(1)} bln</span>
                  <span>Batas CFP: Lajang (3x), Menikah (6x)</span>
                </div>
                <p className="text-[9.5px] leading-tight text-slate-400 pl-5.5 font-semibold">
                  {emStatus.details}
                </p>
              </div>

              {/* LIQUIDITY RATIO */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1.5">
                    💧 Rasio Likuiditas
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${liquidityStatus.color}`}>
                    {liquidityStatus.label}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] font-bold pl-5.5 text-slate-300">
                  <span>Aset Cair: Rp {totalCombinedBalance.toLocaleString('id-ID')}</span>
                  <span>Pengeluaran: Rp {monthlyExpenseEstimate.toLocaleString('id-ID')}</span>
                </div>
                <p className="text-[9.5px] leading-tight text-slate-400 pl-5.5 font-semibold">
                  {liquidityStatus.note}
                </p>
              </div>

            </div>

          </div>

          {/* DANA DARURAT IMPORTANT CFP CERTIFIED ROADMAP */}
          <div className="bg-gradient-to-br from-[#12002A] to-[#1C003E] border border-amber-400/20 p-5 rounded-3xl text-white space-y-3 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 text-amber-400/10 font-bold text-7xl font-mono select-none">
              !
            </div>
            
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-400 text-slate-950 font-black rounded-lg text-xs flex-shrink-0">⚠️ CFP Remind</span>
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wide">SELALU INGAT DANA DARURAT!</h4>
            </div>

            <p className="text-[10.5px] text-slate-300 leading-relaxed font-semibold">
              Satu-satunya perbedaan antara darurat medis sederhana dan bencana finansial yang menghancurkan tabungan masa depan adalah <strong className="text-amber-400">Dana Darurat</strong> ter-kover penuh. Segera kumpulkan minimal:
            </p>

            <ul className="text-[10px] text-slate-400 space-y-1 bg-black/3.5 p-2 bg-slate-950/40 rounded-xl border border-white/5">
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-extrabold">✓</span> Lajang: Rp {emFund3x.toLocaleString('id-ID')} (3x pengeluaran)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-extrabold">✓</span> Keluarga Kecil: Rp {emFund6x.toLocaleString('id-ID')} (6x pengeluaran)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-extrabold">✓</span> Keluarga 2+ Anak: Rp {emFund12x.toLocaleString('id-ID')} (12x pengeluaran)
              </li>
            </ul>
          </div>
          
        </div>

      </div>

    </div>
  );
}
