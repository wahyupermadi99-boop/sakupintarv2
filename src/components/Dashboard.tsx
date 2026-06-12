/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  AlertTriangle, 
  BatteryCharging, 
  Trophy, 
  PiggyBank, 
  Coins, 
  Wallet, 
  Plus, 
  Trash2, 
  Sparkles, 
  X, 
  Edit2, 
  AlertCircle, 
  Lightbulb, 
  ShieldCheck,
  Check,
  PercentCircle
} from 'lucide-react';
import { Transaction, BudgetBucket, DebtItem, BankAccount } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  budgets: BudgetBucket[];
  debts: DebtItem[];
  totalIncome: number;
  totalExpense: number;
  setActiveTab: (tab: string) => void;
  onQuickAddTransaction: () => void;

  liveCashBalance: number;
  processedBanks: BankAccount[];
  totalCombinedBalance: number;
  startingCash: number;
  setStartingCash: (val: number) => void;
  bankAccounts: BankAccount[];
  setBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
}

const MOTIVATIONAL_QUOTES = [
  {
    quote: "Jangan menolak sedikit demi sedikit tabungan. Gunung yang tinggi itu asalnya dari kumpulan butiran debu kecil.",
    author: "Pepatah Finansial"
  },
  {
    quote: "Prioritaskan mengisi Dana Darurat terlebih dahulu hingga aman (minimal 3x pengeluaran bulanan), sebelum melangkah ke liburan atau keinginan tersier.",
    author: "Prinsip SakuPintar"
  },
  {
    quote: "Menabung bukanlah menyisyakan apa yang tidak habis dibelanjakan. Menabung adalah menyisihkan uang di awal, sebelum mulai berbelanja.",
    author: "Warren Buffett"
  },
  {
    quote: "Kekayaan tidak diukur dari berapa banyak yang kamu hasilkan, melainkan dari seberapa teratur dan bijak kamu mengelolanya.",
    author: "Nasihat Bijak Keuangan"
  },
  {
    quote: "Jangan menaruh seluruh telurmu di dalam satu keranjang. Pisahkan dana tunaimu di dompet dan tabungan terpercaya di bank pilihanmu.",
    author: "Aturan Alokasi Portofolio"
  },
  {
    quote: "Dana darurat adalah asuransi ketenangan pikiran terbaik. Ketika menghadapi krisis, tabungan darurat menjagamu tetap tegak berdiri tanpa hutang.",
    author: "Prinsip Bebas Finansial"
  },
  {
    quote: "Ingatlah rumus 50-30-20: 50% untuk kebutuhan pokok, 30% untuk pos keinginanmu, dan wajib 20% langsung dikunci untuk tabungan & dana darurat.",
    author: "SakuPintar Rule"
  }
];

export default function Dashboard({
  transactions,
  budgets,
  debts,
  totalIncome,
  totalExpense,
  setActiveTab,
  onQuickAddTransaction,
  liveCashBalance,
  processedBanks,
  totalCombinedBalance,
  startingCash,
  setStartingCash,
  bankAccounts,
  setBankAccounts,
}: DashboardProps) {
  
  const isDeficit = totalCombinedBalance < 0;

  // Calculate debt ratio
  const totalMonthlyDebt = debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  const debtRatio = totalIncome > 0 ? (totalMonthlyDebt / totalIncome) * 100 : 0;

  // Find overbudget buckets
  const overbudgetBuckets = budgets.filter((b) => b.spent > b.allocated);

  // Quote State
  const [quoteIndex, setQuoteIndex] = useState(() => {
    return Math.floor(new Date().getDate() % MOTIVATIONAL_QUOTES.length);
  });

  // Emergency Fund State
  const [emGoal, setEmGoal] = useState<number>(() => {
    const saved = localStorage.getItem('sakupintar_em_goal');
    return saved ? Number(saved) : 15000000;
  });

  const [emCurrent, setEmCurrent] = useState<number>(() => {
    const saved = localStorage.getItem('sakupintar_em_current');
    return saved ? Number(saved) : 4500000;
  });

  const [isEditingEm, setIsEditingEm] = useState(false);
  const [tempEmGoal, setTempEmGoal] = useState(emGoal.toString());
  const [tempEmCurrent, setTempEmCurrent] = useState(emCurrent.toString());

  // Cash adjustment states
  const [isEditingCash, setIsEditingCash] = useState(false);
  const [tempCash, setTempCash] = useState(startingCash.toString());

  // New Bank state forms
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [newBankBrand, setNewBankBrand] = useState('BCA');
  const [newAccountName, setNewAccountName] = useState('');
  const [newStartingBalance, setNewStartingBalance] = useState('');

  // Delete bank inline safety
  const [bankToDeleteConfirm, setBankToDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('sakupintar_em_goal', emGoal.toString());
  }, [emGoal]);

  useEffect(() => {
    localStorage.setItem('sakupintar_em_current', emCurrent.toString());
  }, [emCurrent]);

  const handleAddNewBank = (e: React.FormEvent) => {
    e.preventDefault();
    const balanceVal = Number(newStartingBalance.replace(/[^0-9]/g, '')) || 0;
    if (!newAccountName.trim()) return;

    const newB: BankAccount = {
      id: 'bank_' + Date.now(),
      bankName: newBankBrand,
      accountName: newAccountName.trim(),
      startingBalance: balanceVal,
    };

    setBankAccounts(prev => [...prev, newB]);
    setNewAccountName('');
    setNewStartingBalance('');
    setIsAddingBank(false);
  };

  const handleConfirmDeleteBank = (id: string) => {
    setBankAccounts(prev => prev.filter(b => b.id !== id));
    setBankToDeleteConfirm(null);
  };

  const saveEmergencyFund = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedGoal = Number(tempEmGoal.replace(/[^0-9]/g, '')) || 0;
    const cleanedCurrent = Number(tempEmCurrent.replace(/[^0-9]/g, '')) || 0;
    setEmGoal(cleanedGoal);
    setEmCurrent(cleanedCurrent);
    setIsEditingEm(false);
  };

  const saveCashBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedCash = Number(tempCash.replace(/[^0-9]/g, '')) || 0;
    setStartingCash(cleanedCash);
    setIsEditingCash(false);
  };

  // Render Premium Indonesian Bank Color Badges
  const renderBankIcon = (bankName: string) => {
    const norm = bankName.toLowerCase().trim();
    if (norm.includes('bca')) {
      return (
        <div className="w-12 h-8 rounded-lg bg-blue-600 text-white font-black text-[11px] flex items-center justify-center tracking-tight select-none shadow-sm border border-blue-500 flex-shrink-0">
          BCA
        </div>
      );
    }
    if (norm.includes('mandiri')) {
      return (
        <div className="w-12 h-8 rounded-lg bg-[#1B2A5D] text-yellow-300 font-extrabold text-[8px] flex flex-col items-center justify-center tracking-tighter leading-none select-none shadow-sm border border-[#233575] flex-shrink-0">
          <span className="font-sans font-black scale-90">mandiri</span>
        </div>
      );
    }
    if (norm.includes('bni')) {
      return (
        <div className="w-12 h-8 rounded-lg bg-[#005e6a] text-orange-400 font-black text-[10px] flex items-center justify-center tracking-tighter select-none shadow-sm border border-teal-700 flex-shrink-0">
          BNI
        </div>
      );
    }
    if (norm.includes('bri')) {
      return (
        <div className="w-12 h-8 rounded-lg bg-blue-800 text-white font-black text-[11px] flex items-center justify-center tracking-wider select-none shadow-sm border border-blue-950 flex-shrink-0">
          BRI
        </div>
      );
    }
    if (norm.includes('jago')) {
      return (
        <div className="w-12 h-8 rounded-lg bg-[#F4CF15] text-slate-950 font-black text-[10px] flex items-center justify-center select-none shadow-sm border border-yellow-500 flex-shrink-0">
          JAGO
        </div>
      );
    }
    if (norm.includes('seabank') || norm.includes('sea bank')) {
      return (
        <div className="w-12 h-8 rounded-lg bg-orange-500 text-white font-black text-[9px] flex items-center justify-center tracking-tighter select-none shadow-sm border border-orange-400 flex-shrink-0">
          Sea
        </div>
      );
    }
    if (norm.includes('btn')) {
      return (
        <div className="w-12 h-8 rounded-lg bg-blue-900 text-yellow-450 font-black text-[10px] flex items-center justify-center select-none shadow-sm border border-blue-850 flex-shrink-0">
          BTN
        </div>
      );
    }
    if (norm.includes('cimb') || norm.includes('niaga')) {
      return (
        <div className="w-12 h-8 rounded-lg bg-red-650 bg-red-600 text-white font-black text-[9px] flex items-center justify-center select-none shadow-sm border border-red-500 flex-shrink-0">
          CIMB
        </div>
      );
    }
    return (
      <div className="w-12 h-8 rounded-lg bg-slate-800 text-slate-300 font-bold text-[9px] flex items-center justify-center select-none shadow-sm border border-slate-700 flex-shrink-0">
        BANK
      </div>
    );
  };

  const currentQuote = MOTIVATIONAL_QUOTES[quoteIndex];

  // Motivational quote of the day trigger card
  const getMotivationalHeader = () => {
    if (isDeficit) {
      return {
        title: "Yuk Stabilkan Cashflow! 💪",
        subtitle: "Likitiditas bersih kamu sedang minus. Mari tunda belanja impulsif ya!",
        gradient: "from-amber-500 via-orange-600 to-rose-600",
        icon: BatteryCharging,
      };
    }
    if (debtRatio > 35) {
      return {
        title: "Kendalikan Beban Cicilan! 💳",
        subtitle: "Beban utang bulananmu sudah di zona kritis (>35%). Waktunya diet spending!",
        gradient: "from-rose-600 via-amber-500 to-indigo-700",
        icon: AlertTriangle,
      };
    }
    if (totalCombinedBalance > 2000000 && overbudgetBuckets.length === 0) {
      return {
        title: "Financial Goal Tracker On Fire! 🏆",
        subtitle: "Pertumbuhan saku tumbuh gemilang, semua alokasi belanja terkontrol aman!",
        gradient: "from-emerald-500 via-teal-600 to-emerald-700",
        icon: Trophy,
      };
    }
    return {
      title: "Yuk, Fokus Wealth Building! 🚀",
      subtitle: "Amankan emergency fund dan atur alokasi saku belanja demi masa depan cerah.",
      gradient: "from-indigo-600 via-fuchsia-600 to-pink-500",
      icon: PiggyBank,
    };
  };

  const headerMeta = getMotivationalHeader();
  const HeaderIcon = headerMeta.icon;

  const emProgress = emGoal > 0 ? (emCurrent / emGoal) * 100 : 0;
  const emPercentage = Math.min(100, Math.round(emProgress));

  return (
    <div className="space-y-6 pb-24 text-slate-800">
      
      {/* 1. GREETINGS HEADER with SPINNING COIN AVATAR */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <span className="text-xs font-black tracking-wider uppercase text-slate-400">Radar Kesehatan Finansial</span>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-1.5">
            Smart Saku Dashboard <span className="animate-bounce">⚡</span>
          </h2>
        </div>
        
        {/* Dynamic Coin Avatar replacing legacy SH initials */}
        <div 
          onClick={onQuickAddTransaction}
          className="w-11 h-11 rounded-2xl bg-amber-400 hover:bg-amber-300 border border-amber-300 flex items-center justify-center cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 transition-all group"
          title="Catat Aliran Kas"
        >
          <Coins className="w-5 h-5 text-slate-950 animate-pulse group-hover:rotate-12 transition-transform" />
        </div>
      </motion.div>

      {/* Motivational Pop Card Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br ${headerMeta.gradient} text-white shadow-xl`}
      >
        <div className="absolute right-0 bottom-0 translate-x-2 translate-y-3 opacity-15 select-none pointer-events-none">
          <HeaderIcon className="w-40 h-40" />
        </div>
        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wide backdrop-blur-md">
              <HeaderIcon className="w-3.5 h-3.5" />
              SakuPintar Financial Health
            </span>
            <h3 className="text-xl font-black mt-2">{headerMeta.title}</h3>
            <p className="text-xs text-white/90 font-medium leading-relaxed max-w-[85%]">{headerMeta.subtitle}</p>
          </div>

          <button
            onClick={() => setActiveTab('ai-advisor')}
            className="self-start px-4 py-2 mt-1 bg-white text-slate-950 rounded-2xl text-[11.5px] font-extrabold hover:bg-slate-100 transition-colors shadow-md active:scale-95 flex items-center gap-1"
          >
            Konsultasi SakuAI Planner ✨
          </button>
        </div>
      </motion.div>

      {/* 2. DYNAMIC WISDOM MOTIVATION BANNER */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-slate-900/60 border border-white/10 rounded-3xl p-4.5 flex items-start gap-3 relative overflow-hidden"
      >
        <div className="absolute top-1 right-1 w-24 h-24 rounded-full bg-cyan-400/5 blur-xl pointer-events-none" />
        <div className="p-2 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex-shrink-0 text-slate-950 shadow-md">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div className="space-y-1 my-auto pr-9">
          <span className="text-[9px] font-black tracking-widest text-amber-400 uppercase">Daily Financial Capsule</span>
          <p className="text-xs text-slate-200 font-medium leading-relaxed italic">
            &quot;{currentQuote.quote}&quot;
          </p>
          <p className="text-[10px] text-slate-400 font-bold">— {currentQuote.author}</p>
        </div>
        <button
          onClick={() => setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Inspirasi Finansial Baru"
        >
          🔄
        </button>
      </motion.div>

      {/* 3. COMBINED SALDO BAR */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md relative"
      >
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Net Worth Gabungan (Aset Likuid)</span>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-xl font-extrabold text-slate-400">Rp</span>
          <span className={`text-[34px] font-black tracking-tight leading-none ${isDeficit ? 'text-rose-500' : 'text-emerald-500'}`}>
            {totalCombinedBalance.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Real-time Indicator Tag */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap text-xs">
          {isDeficit ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 font-bold">
              <AlertTriangle className="w-3.5 h-3.5" /> Cashflow Defisit (Boncos) ⚠️
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold">
              <TrendingUp className="w-3.5 h-3.5" /> Cashflow Surplus (Aman) ✅
            </span>
          )}
          {debtRatio > 0 && (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${debtRatio > 35 ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
              Debt to Income Ratio: {debtRatio.toFixed(0)}%
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-slate-100 my-4" />

        {/* Quick Summary Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[9.5px] font-bold text-slate-400 block uppercase">Cash Inflow (Masuk)</span>
              <span className="text-sm font-black text-slate-800">Rp {totalIncome.toLocaleString('id-ID')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
              <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[9.5px] font-bold text-slate-400 block uppercase">Cash Outflow (Keluar)</span>
              <span className="text-sm font-black text-slate-800">Rp {totalExpense.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4. SEPARATE DETAILS: CASH WALLET & INDONESIAN BANK OUTLETS */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-3"
      >
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black tracking-wider uppercase text-slate-400">Liquid Assets (Uang Cash & Rekening Bank)</h3>
          <button
            onClick={() => setIsAddingBank(!isAddingBank)}
            className="text-[11.5px] font-black text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 uppercase tracking-wide"
          >
            <Plus className="w-4 h-4" /> Koneksi Kantong Baru
          </button>
        </div>

        {/* Add Bank Form Expandable */}
        <AnimatePresence>
          {isAddingBank && (
            <motion.form
              onSubmit={handleAddNewBank}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-2xl p-4.5 space-y-3.5 overflow-hidden"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs font-black text-white flex items-center gap-1">
                  🏦 Tambah Koneksi Rekening / e-Wallet Baru
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingBank(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Brand Selection */}
                <div>
                  <label className="block text-[9.5px] font-bold text-slate-400 uppercase mb-1">
                    Institusi / e-Wallet
                  </label>
                  <select
                    value={newBankBrand}
                    onChange={(e) => setNewBankBrand(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-400 text-white font-bold transition-all"
                  >
                    <option value="BCA">BCA (Bank Central Asia)</option>
                    <option value="Mandiri">Bank Mandiri</option>
                    <option value="BNI">BNI (Bank Negara Indonesia)</option>
                    <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                    <option value="Bank Jago">Bank Jago</option>
                    <option value="SeaBank">SeaBank</option>
                    <option value="BTN">BTN (Bank Tabungan Negara)</option>
                    <option value="CIMB Niaga">CIMB Niaga</option>
                    <option value="GoPay">GoPay</option>
                    <option value="OVO">OVO</option>
                    <option value="DANA">DANA</option>
                    <option value="Lainnya">Instansi Lainnya</option>
                  </select>
                </div>

                {/* Account Name */}
                <div>
                  <label className="block text-[9.5px] font-bold text-slate-400 uppercase mb-1">
                    Nama Kantong / Alokasi
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Kantong Utama, Tabungan Nikah, Dana Saham"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-400 text-white font-bold transition-all"
                  />
                </div>

                {/* Initial Balance */}
                <div className="md:col-span-2">
                  <label className="block text-[9.5px] font-bold text-slate-400 uppercase mb-1">
                    Initial Balance / Saldo Mulai (Rp)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: 1.000.000"
                    value={newStartingBalance}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      if (!raw) {
                        setNewStartingBalance('');
                        return;
                      }
                      setNewStartingBalance(parseInt(raw, 10).toLocaleString('id-ID'));
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-400 text-white font-bold transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-extrabold text-[11px] uppercase tracking-wide rounded-xl transition-colors shadow-md"
              >
                Simpan Kantong Finansial 💾
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* A. CASH WALLET CARD */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-slate-200 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <Wallet className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Kas Fisik (Dompet)</span>
                  <span className="text-xs text-slate-400 font-bold">Cash on Hand</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTempCash(startingCash.toString());
                  setIsEditingCash(!isEditingCash);
                }}
                className="text-slate-400 hover:text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100"
                title="Atur Sisa Uang Cash"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>

            {isEditingCash ? (
              <form onSubmit={saveCashBalance} className="mt-3.5 space-y-2">
                <label className="block text-[9px] font-bold text-slate-500 uppercase">Set Uang Kas Tunai (Rp)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={tempCash}
                    onChange={(e) => setTempCash(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-bold rounded-lg focus:outline-none"
                  />
                  <button type="submit" className="px-3 bg-emerald-500 text-white rounded-lg text-xs font-bold">Simpan</button>
                </div>
              </form>
            ) : (
              <div className="mt-4">
                <span className="text-xs text-slate-400 font-bold block leading-none mb-1">Sisa Kas Fisik:</span>
                <span className="text-xl font-black text-slate-800">
                  Rp {liveCashBalance.toLocaleString('id-ID')}
                </span>
                <span className="text-[9.5px] text-emerald-600 font-bold block mt-0.5">
                  Basis Mulai: Rp {startingCash.toLocaleString('id-ID')}
                </span>
              </div>
            )}
          </div>

          {/* B. BANK ACCOUNT CARDS */}
          {processedBanks.map((bank) => (
            <div 
              key={bank.id} 
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-slate-200 transition-all relative overflow-hidden"
            >
              {bankToDeleteConfirm === bank.id ? (
                <div className="absolute inset-0 bg-slate-900/95 z-20 p-4 flex flex-col justify-between text-white">
                  <span className="text-xs font-extrabold flex items-center gap-1.5 text-rose-400">
                    <AlertCircle className="w-4 h-4" /> Yakin hapus {bank.bankName}?
                  </span>
                  <p className="text-[10px] text-slate-300 leading-relaxed font-bold">
                    Transaksi tersimpan yang memakai bank ini akan dialihkan ke bank default atau dianggap umum.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleConfirmDeleteBank(bank.id)}
                      className="py-1.5 bg-rose-500 hover:bg-rose-600 rounded-lg text-[10px] font-black uppercase text-white transition-colors"
                    >
                      Hapus
                    </button>
                    <button
                      type="button"
                      onClick={() => setBankToDeleteConfirm(null)}
                      className="py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black uppercase text-slate-200 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  {renderBankIcon(bank.bankName)}
                  <div>
                    <span className="text-sm font-black text-slate-800 block line-clamp-1">{bank.bankName}</span>
                    <span className="text-[10.5px] text-slate-400 font-bold block line-clamp-1">{bank.accountName}</span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setBankToDeleteConfirm(bank.id)}
                  className="text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 p-1.5 rounded-lg border border-slate-100 hover:border-rose-100 transition-colors"
                  title="Hapus Rekening"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              <div className="mt-4">
                <span className="text-xs text-slate-400 font-bold block leading-none mb-1">Saldo Berjalan:</span>
                <span className="text-[19px] font-black text-slate-800 leading-none">
                  Rp {bank.balance.toLocaleString('id-ID')}
                </span>
                <span className="text-[9.5px] text-slate-400 font-bold block mt-0.5">
                  Basis Mulai: Rp {bank.startingBalance.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          ))}

        </div>
      </motion.div>

      {/* 5. INTERACTIVE DANA DARURAT (EMERGENCY FUND) ADVISOR & TRACKER */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-indigo-950/40 border border-indigo-500/10 p-5 rounded-3xl space-y-4 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <PiggyBank className="w-24 h-24 text-indigo-400" />
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[8.5px] font-black uppercase text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded-full tracking-widest leading-none">
              <ShieldCheck className="w-3 h-3" /> Emergency Fund Guard
            </span>
            <h3 className="text-base font-black text-white">Dana Darurat (Emergency Fund)</h3>
          </div>
          
          <button
            onClick={() => {
              setTempEmGoal(emGoal.toString());
              setTempEmCurrent(emCurrent.toString());
              setIsEditingEm(!isEditingEm);
            }}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl border border-white/5 hover:border-white/10 text-[10.5px] font-extrabold flex items-center gap-1 shadow-inner transition-all shrink-0"
          >
            <Edit2 className="w-3 h-3" /> Atur Target Dana Darurat
          </button>
        </div>

        {isEditingEm ? (
          <form onSubmit={saveEmergencyFund} className="bg-slate-900 border border-white/5 p-4 rounded-2xl space-y-3.5">
            <div className="grid grid-cols-2 gap-3 text-xs text-white">
              <div>
                <label className="block text-[9.5px] font-bold text-slate-400 uppercase mb-1">Target Dana Darurat</label>
                <input
                  type="text"
                  value={tempEmGoal}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setTempEmGoal(raw ? parseInt(raw, 10).toLocaleString('id-ID') : '');
                  }}
                  className="w-full bg-black/45 border border-white/10 p-2 text-xs font-bold rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9.5px] font-bold text-slate-400 uppercase mb-1">Alokasi Terkini</label>
                <input
                  type="text"
                  value={tempEmCurrent}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setTempEmCurrent(raw ? parseInt(raw, 10).toLocaleString('id-ID') : '');
                  }}
                  className="w-full bg-black/45 border border-white/10 p-2 text-xs font-bold rounded-lg focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-1 px-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg text-xs font-bold py-2 shadow-md transition-colors">
                Kunci Target 💾
              </button>
              <button type="button" onClick={() => setIsEditingEm(false)} className="px-3 bg-slate-800 text-white rounded-lg text-xs font-bold py-2 hover:bg-slate-700 transition-colors">
                Batal
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3.5">
            
            {/* Fund progress gauge or stats bar */}
            <div className="flex justify-between items-baseline mb-0.5 text-white">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase leading-none">Dana Darurat Terkumpul</span>
                <span className="text-lg font-black text-emerald-400">
                  Rp {emCurrent.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-slate-400"> dari target ideal Rp {emGoal.toLocaleString('id-ID')}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-cyan-400 px-2 py-0.5 rounded-md bg-cyan-400/10 border border-cyan-400/20">
                  {emPercentage}% Secured
                </span>
              </div>
            </div>

            {/* Horizontal progress bar */}
            <div className="w-full h-3.5 bg-black/30 rounded-full overflow-hidden p-[2px] flex items-center border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${emPercentage}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-md"
              />
            </div>

            {/* Emergency Fund Smart Reminders Bubble */}
            <div className="p-3 bg-cyan-450/10 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl flex items-start gap-2.5 text-slate-300">
              <AlertCircle className="w-4.5 h-4.5 text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed font-semibold">
                {emPercentage < 100 
                  ? `Kurang Rp ${(emGoal - emCurrent).toLocaleString('id-ID')} lagi untuk mencapai zona aman bebas finansial. Tabung sisa cashflow bulananmu ke pos Dana Darurat ini!` 
                  : `Perfect! Sabuk pengaman finansialmu sudah secure 100% penuh. Lanjutkan ke langkah investasi produktif.`}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* 6. Dynamic Budget Allocation Alerts */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black tracking-wider uppercase text-slate-400">Monitoring Alokasi Saku</h3>
          <button onClick={() => setActiveTab('budgets')} className="text-[11.5px] font-extrabold text-indigo-400 hover:underline">
            Kelola Alokasi
          </button>
        </div>

        {budgets.length === 0 ? (
          <div className="bg-slate-900 border border-dashed border-white/10 p-5 rounded-3xl text-center">
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Alokasi Saku masih kosong! Atur pengeluaran bulananmu (Pangan, Bill, Investasi) agar cashflow tetap sehat.
            </p>
            <button
              onClick={() => setActiveTab('budgets')}
              className="mt-3 text-xs bg-amber-400 text-slate-950 px-4 py-2 rounded-xl font-bold shadow-sm"
            >
              Atur Alokasi Saku
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {budgets.slice(0, 3).map((item) => {
              const isOver = item.spent > item.allocated;
              const ratio = item.allocated > 0 ? (item.spent / item.allocated) * 100 : 0;
              const percentage = Math.min(100, ratio);

              return (
                <div
                  key={item.id}
                  className={`bg-white p-4 rounded-xl border ${
                    isOver ? 'border-rose-200 bg-rose-50/20' : 'border-slate-100 hover:border-slate-200'
                  } transition-all`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="flex items-center gap-2 text-sm font-black text-slate-800">
                      <span className="text-lg">{item.icon}</span>
                      {item.name}
                    </span>
                    <span className="text-[11.5px] font-black text-slate-500">
                      {isOver ? (
                        <span className="text-rose-500 font-black">Overbudget (Boncos!)</span>
                      ) : (
                        <span>Aman (Undercontrol: {percentage.toFixed(0)}%)</span>
                      )}
                    </span>
                  </div>

                  {/* Horizontal visual progress bars */}
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mt-1 px-[1px] flex items-center">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-2 rounded-full ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10.5px] text-slate-400 mt-2 font-bold">
                    <span>Eksekusi: Rp {item.spent.toLocaleString('id-ID')}</span>
                    <span>Pagu/Limit Saku: Rp {item.allocated.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. Fitur Tambahan (Rasio Hutang & Manajemen Cadangan) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        
        {/* Rasio Hutang Quick Link Card */}
        <div 
          onClick={() => setActiveTab('debts')}
          className="bg-white/5 border border-white/10 hover:border-indigo-500/20 p-5 rounded-3xl cursor-pointer transition-all hover:scale-[1.01] active:scale-95 group relative overflow-hidden shadow-sm"
        >
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
            <PercentCircle className="w-20 h-20 text-indigo-400" />
          </div>
          <div>
            <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider block">Kesehatan Kredit</span>
            <h4 className="text-sm font-black text-white mt-1 group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
              Rasio Hutang & Cicilan 💳
            </h4>
            <p className="text-xs text-slate-400 mt-2.5 leading-relaxed font-semibold">
              Kalkulasi Debt-to-Income (DTI) sesuai acuan CFP. Total cicilan anda saat ini adalah <strong className="text-rose-400">Rp {totalMonthlyDebt.toLocaleString('id-ID')}</strong>/bulan. Tap untuk kelola hutang.
            </p>
          </div>
        </div>

        {/* Manajemen Cadangan Quick Link Card */}
        <div 
          onClick={() => setActiveTab('backup')}
          className="bg-white/5 border border-white/10 hover:border-violet-500/20 p-5 rounded-3xl cursor-pointer transition-all hover:scale-[1.01] active:scale-95 group relative overflow-hidden shadow-sm"
        >
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
            <Check className="w-20 h-20 text-violet-400" />
          </div>
          <div>
            <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-wider block">Konektivitas Data</span>
            <h4 className="text-sm font-black text-white mt-1 group-hover:text-violet-300 transition-colors flex items-center gap-1.5">
              Backup / Restore Text 🔄
            </h4>
            <p className="text-xs text-slate-400 mt-2.5 leading-relaxed font-semibold">
              Ekspor seluruh catatan mutasi keuangan, alokasi saku, dan dana darurat anda ke dalam format teks salin-tempel yang aman dan praktis. Tap untuk backup.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
