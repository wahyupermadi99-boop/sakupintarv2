/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Terminal, Activity, Bell, Home, PieChart, Receipt, PercentCircle, BrainCircuit, HelpCircle, Mail, Coins, FileText, Sun, Moon, FileJson } from 'lucide-react';

import BottomNavBar from './components/BottomNavBar';
import Dashboard from './components/Dashboard';
import Budgets from './components/Budgets';
import Transactions from './components/Transactions';
import Debts from './components/Debts';
import AiAdvisor from './components/AiAdvisor';
import FinancialReport from './components/FinancialReport';

// Backup Widget helper
import BackupWidget from './components/BackupWidget';

import { Transaction, BudgetBucket, DebtItem, BankAccount } from './types';

// Seeding standard lively indonesian starting data so the app starts gorgeous
const STARTING_BUDGETS: BudgetBucket[] = [
  { id: 'b1', name: 'Makan & Kuliner', allocated: 2500000, spent: 1450000, icon: '🍔', color: 'from-cyan-400 to-blue-500', classification: 'needs' },
  { id: 'b2', name: 'Transportasi / Gojek', allocated: 800000, spent: 340000, icon: '🚗', color: 'from-orange-400 to-red-500', classification: 'needs' },
  { id: 'b3', name: 'Hiburan / Netflix', allocated: 600000, spent: 186000, icon: '🍿', color: 'from-fuchsia-500 to-pink-500', classification: 'wants' },
  { id: 'b4', name: 'Tabungan Mudik', allocated: 1500000, spent: 0, icon: '📈', color: 'from-lime-400 to-emerald-500', classification: 'savings' },
];

const STARTING_BANKS: BankAccount[] = [
  { id: 'bank_1', bankName: 'BCA', accountName: 'Tabungan Utama', startingBalance: 4000000 },
  { id: 'bank_2', bankName: 'Mandiri', accountName: 'Gaji & Investasi', startingBalance: 2500000 },
  { id: 'bank_3', bankName: 'Bank Jago', accountName: 'Kantong Jajan', startingBalance: 750000 },
];

const STARTING_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'expense', amount: 85000, description: 'Burger King Makan Siang', category: 'Makan & Kuliner', date: '2026-06-10', budgetId: 'b1', sourceType: 'cash' },
  { id: 't2', type: 'expense', amount: 22000, description: 'Gojek Ride ke Kantor', category: 'Transportasi / Gojek', date: '2026-06-11', budgetId: 'b2', sourceType: 'cash' },
  { id: 't3', type: 'expense', amount: 186000, description: 'Langganan Netflix Premium', category: 'Hiburan / Netflix', date: '2026-06-08', budgetId: 'b3', sourceType: 'bank', bankName: 'Bank Jago', bankAccountId: 'bank_3' },
  { id: 't4', type: 'income', amount: 10000000, description: 'Gaji Pokok Utama Bulanan', category: 'Gajian / Pendapatan', date: '2026-06-01', budgetId: null, sourceType: 'bank', bankName: 'BCA', bankAccountId: 'bank_1' },
  { id: 't5', type: 'income', amount: 2500000, description: 'Insentif Bonus Project', category: 'Gajian / Pendapatan', date: '2026-06-05', budgetId: null, sourceType: 'bank', bankName: 'Mandiri', bankAccountId: 'bank_2' },
];

const STARTING_DEBTS: DebtItem[] = [
  { id: 'd1', name: 'KPR BTN Syariah', monthlyPayment: 2100000, totalAmount: 180000000, category: 'mortgage' },
  { id: 'd2', name: 'Cicilan Laptop Asus', monthlyPayment: 750000, totalAmount: 4500000, category: 'credit_card' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('sakupintar_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('sakupintar_theme', theme);
  }, [theme]);

  // Load from localStore or fall back to startup seeds (100% Client-side and offline-secure)
  const [budgets, setBudgets] = useState<BudgetBucket[]>(() => {
    const saved = localStorage.getItem('sakupintar_budgets');
    return saved ? JSON.parse(saved) : STARTING_BUDGETS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('sakupintar_transactions');
    return saved ? JSON.parse(saved) : STARTING_TRANSACTIONS;
  });

  const [debts, setDebts] = useState<DebtItem[]>(() => {
    const saved = localStorage.getItem('sakupintar_debts');
    return saved ? JSON.parse(saved) : STARTING_DEBTS;
  });

  const [startingCash, setStartingCash] = useState<number>(() => {
    const saved = localStorage.getItem('sakupintar_starting_cash');
    return saved ? Number(saved) : 1200000;
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('sakupintar_banks');
    return saved ? JSON.parse(saved) : STARTING_BANKS;
  });

  // Keep offline localStorage of current state updated
  useEffect(() => {
    localStorage.setItem('sakupintar_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('sakupintar_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('sakupintar_debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('sakupintar_starting_cash', startingCash.toString());
  }, [startingCash]);

  useEffect(() => {
    localStorage.setItem('sakupintar_banks', JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  // Derived financial calculation values
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Live Cash calculations
  const liveCashBalance = startingCash + transactions
    .filter((t) => t.type === 'income' && t.sourceType === 'cash')
    .reduce((sum, t) => sum + t.amount, 0)
    - transactions
    .filter((t) => t.type === 'expense' && t.sourceType === 'cash')
    .reduce((sum, t) => sum + t.amount, 0);

  // Live Bank calculations
  const processedBanks = bankAccounts.map((bank) => {
    const incomes = transactions
      .filter((t) => t.type === 'income' && t.sourceType === 'bank' && t.bankAccountId === bank.id)
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === 'expense' && t.sourceType === 'bank' && t.bankAccountId === bank.id)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      ...bank,
      balance: bank.startingBalance + incomes - expenses,
    };
  });

  const totalBankBalance = processedBanks.reduce((sum, b) => sum + b.balance, 0);
  const totalCombinedBalance = liveCashBalance + totalBankBalance;

  // Recalculate 'spent' inside each BudgetBucket live based on actual transaction matches
  const processedBudgets = budgets.map((bucket) => {
    const matchedSpent = transactions
      .filter((t) => t.type === 'expense' && t.budgetId === bucket.id)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      ...bucket,
      spent: matchedSpent,
    };
  });

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Core callback hooks
  const handleAddBudget = (newB: Omit<BudgetBucket, 'id' | 'spent'>) => {
    const budget: BudgetBucket = {
      ...newB,
      id: 'b_' + Date.now(),
      spent: 0,
    };
    setBudgets((prev) => [...prev, budget]);
  };

  const handleDeleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    // Orphan matched transactions clear their budgetId safely
    setTransactions((prev) =>
      prev.map((t) => (t.budgetId === id ? { ...t, budgetId: null } : t))
    );
  };

  const handleUpdateBudget = (id: string, updated: Partial<BudgetBucket>) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updated } : b))
    );
  };

  const handleAddTransaction = (newT: Omit<Transaction, 'id'>) => {
    const trx: Transaction = {
      ...newT,
      id: 't_' + Date.now(),
    };
    setTransactions((prev) => [trx, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddDebt = (newD: Omit<DebtItem, 'id'>) => {
    const debt: DebtItem = {
      ...newD,
      id: 'd_' + Date.now(),
    };
    setDebts((prev) => [...prev, debt]);
  };

  const handleDeleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSetStartingCash = (amount: number) => {
    setStartingCash(amount);
  };

  const handleSetBankAccounts = (newBanks: BankAccount[] | ((prev: BankAccount[]) => BankAccount[])) => {
    const updatedValue = typeof newBanks === 'function' ? newBanks(bankAccounts) : newBanks;
    setBankAccounts(updatedValue);
  };

  const handleExportBackup = () => {
    return {
      budgets,
      transactions,
      debts,
      startingCash,
      bankAccounts,
      exportedAt: new Date().toISOString(),
      app: 'SakuPintar'
    };
  };

  const handleImportBackup = (parsedData: any) => {
    if (!parsedData || typeof parsedData !== 'object') {
      alert('Format data cadangan tidak valid (harus berupa JSON object).');
      return false;
    }
    
    // Check if it's indeed SakuPintar backup
    if (parsedData.app !== 'SakuPintar' && !parsedData.budgets && !parsedData.transactions) {
      alert('Maaf, file ini tidak dikenali sebagai format cadangan SakuPintar.');
      return false;
    }
    
    const { budgets: impBudgets, transactions: impTrx, debts: impDebts, startingCash: impCash, bankAccounts: impBanks } = parsedData;

    try {
      if (Array.isArray(impBudgets)) setBudgets(impBudgets);
      if (Array.isArray(impTrx)) setTransactions(impTrx);
      if (Array.isArray(impDebts)) setDebts(impDebts);
      if (typeof impCash === 'number') setStartingCash(impCash);
      if (Array.isArray(impBanks)) setBankAccounts(impBanks);

      return true;
    } catch (err: any) {
      alert('Gagal mengimpor data ke aplikasi: ' + err.message);
      return false;
    }
  };

  const desktopNavItems = [
    { id: 'dashboard', label: 'SakuPintar Dashboard', icon: Home, color: 'text-emerald-500' },
    { id: 'budgets', label: 'Alokasi Pagu Saku', icon: PieChart, color: 'text-amber-500' },
    { id: 'transactions', label: 'Catatan Keuangan', icon: Receipt, color: 'text-rose-500' },
    { id: 'debts', label: 'Rasio Hutang', icon: PercentCircle, color: 'text-indigo-400' },
    { id: 'financial-report', label: 'Rapor Keuangan & CFP', icon: FileText, color: 'text-cyan-400' },
    { id: 'ai-advisor', label: 'SakuPintar AI Planner', icon: BrainCircuit, color: 'text-teal-500' },
    { id: 'backup', label: 'Manajemen Cadangan', icon: FileJson, color: 'text-violet-400 font-bold' },
  ];

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen w-full flex flex-col md:flex-row font-sans relative antialiased selection:bg-fuchsia-500 selection:text-white overflow-x-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#050110] text-white' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Decorative ambient glowing backdrops mimicking abstract neural space */}
      <div className={`absolute top-10 left-10 w-72 h-72 rounded-full ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-500/5'} blur-[100px] pointer-events-none -z-10`} />
      <div className={`absolute bottom-40 right-20 w-80 h-80 rounded-full ${isDark ? 'bg-fuchsia-500/10' : 'bg-fuchsia-500/5'} blur-[120px] pointer-events-none -z-10`} />
      <div className={`absolute top-1/3 right-1/4 w-96 h-96 rounded-full ${isDark ? 'bg-indigo-500/5' : 'bg-indigo-500/2'} blur-[150px] pointer-events-none -z-10`} />

      {/* 1. DESKTOP SIDEBAR (Show only on md and up) */}
      <aside className={`hidden md:flex flex-col w-64 lg:w-72 fixed top-0 bottom-0 left-0 border-r backdrop-blur-2xl z-30 p-5 select-none justify-between overflow-y-auto transition-colors duration-300 ${
        isDark ? 'bg-slate-950/40 border-white/5' : 'bg-white border-slate-200 shadow-md'
      }`}>
        <div className="space-y-5">
          {/* Logo / Brand block */}
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className={`px-2 py-0.5 text-[8.5px] font-black uppercase rounded-full tracking-wider ${
                  isDark ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20' : 'text-cyan-700 bg-cyan-100 border border-cyan-200'
                }`}>Web Portal</span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              </div>
              <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-orange-400 leading-none">
                SAKUPINTAR
              </h1>
              <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-[8px] font-black tracking-widest uppercase`}>SakuPintar Wealth Studio</p>
            </div>

            {/* Theme switcher button */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-xl transition-all border flex-shrink-0 ${
                isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 text-yellow-400' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700 shadow-sm'
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick Balance Wallet widget inside sidebar */}
          <div className={`border rounded-2xl p-4 transition-colors ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm shadow-slate-100'
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className={`text-[9.5px] font-bold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Sisa Saldo Saku</span>
              <span className="text-emerald-500 text-[10px] font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
              </span>
            </div>
            <div className={`text-lg font-black leading-none ${isDark ? 'text-white' : 'text-slate-850'}`}>
              Rp {totalCombinedBalance.toLocaleString('id-ID')}
            </div>
            
            <div className={`mt-3.5 grid grid-cols-2 gap-2 pt-3 border-t text-[9.5px] ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <div>
                <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-bold block uppercase`}>Tunai (Cash)</span>
                <span className={`font-extrabold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Rp {liveCashBalance.toLocaleString('id-ID')}</span>
              </div>
              <div>
                <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-bold block uppercase`}>Semua Bank</span>
                <span className={`font-extrabold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>Rp {totalBankBalance.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Core Navigation Triggers */}
          <nav className="space-y-1">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    isActive
                      ? isDark 
                        ? 'bg-white/5 border-white/10 text-white shadow-lg' 
                        : 'bg-slate-100 border-slate-200 text-slate-800 shadow-sm'
                      : isDark 
                        ? 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-white/5' 
                        : 'text-slate-505 hover:text-slate-800 border-transparent hover:bg-slate-100/60'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? item.color : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

      </aside>

      {/* 2. MAIN CENTERPIECE VIEWPORT AREA */}
      <div className="flex-1 md:pl-64 lg:pl-72 w-full flex flex-col min-h-screen">
        
        {/* Mobile-only sticky top header bar */}
        <header className={`md:hidden pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 px-5 flex justify-between items-center border-b sticky top-0 backdrop-blur-md z-20 transition-colors duration-300 ${
          isDark ? 'bg-[#050110]/80 border-white/5' : 'bg-slate-50/95 border-slate-200 text-slate-800 shadow-sm'
        }`}>
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-lg font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-orange-400 leading-none">
                SAKUPINTAR
              </h1>
              <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-[7px] font-black tracking-widest uppercase`}>SakuPintar Wealth Studio</p>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            {/* Quick Balance Blob */}
            <div className={`border rounded-2xl px-3 py-1.5 backdrop-blur-xl flex items-center gap-1.5 transition-colors ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 text-slate-805 shadow-xs'
            }`}>
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="font-bold text-xs">Rp {totalCombinedBalance.toLocaleString('id-ID')}</span>
            </div>
            
            {/* Mobile Theme Toggle Button */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-colors ${
                isDark ? 'bg-white/5 border-white/10 text-amber-400' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Responsive Content Stage */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-5 py-6 md:py-10 pb-[calc(env(safe-area-inset-bottom)+7rem)] md:pb-12">

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard
                  transactions={transactions}
                  budgets={processedBudgets}
                  debts={debts}
                  totalIncome={totalIncome}
                  totalExpense={totalExpense}
                  setActiveTab={setActiveTab}
                  onQuickAddTransaction={() => setActiveTab('transactions')}
                  liveCashBalance={liveCashBalance}
                  processedBanks={processedBanks}
                  totalCombinedBalance={totalCombinedBalance}
                  startingCash={startingCash}
                  setStartingCash={handleSetStartingCash}
                  bankAccounts={bankAccounts}
                  setBankAccounts={handleSetBankAccounts}
                />
              )}

              {activeTab === 'budgets' && (
                <Budgets
                  budgets={processedBudgets}
                  totalIncome={totalIncome}
                  onAddBudget={handleAddBudget}
                  onDeleteBudget={handleDeleteBudget}
                  onUpdateBudget={handleUpdateBudget}
                  totalCombinedBalance={totalCombinedBalance}
                />
              )}

              {activeTab === 'transactions' && (
                <Transactions
                  transactions={transactions}
                  budgets={processedBudgets}
                  onAddTransaction={handleAddTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  bankAccounts={processedBanks}
                  totalCombinedBalance={totalCombinedBalance}
                />
              )}

              {activeTab === 'debts' && (
                <Debts
                  debts={debts}
                  totalIncome={totalIncome}
                  onAddDebt={handleAddDebt}
                  onDeleteDebt={handleDeleteDebt}
                />
              )}

              {activeTab === 'financial-report' && (
                <FinancialReport
                  transactions={transactions}
                  budgets={processedBudgets}
                  debts={debts}
                  liveCashBalance={liveCashBalance}
                  totalBankBalance={totalBankBalance}
                  totalCombinedBalance={totalCombinedBalance}
                  theme={theme}
                />
              )}

              {activeTab === 'ai-advisor' && (
                <AiAdvisor
                  transactions={transactions}
                  budgets={processedBudgets}
                  debts={debts}
                  totalIncome={totalIncome}
                  totalExpense={totalExpense}
                />
              )}

              {activeTab === 'backup' && (
                <BackupWidget
                  onExportData={handleExportBackup}
                  onImportData={handleImportBackup}
                  theme={theme}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Global Bottom Navigation (Show only on mobile) */}
        <div className="md:hidden">
          <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
    </div>
  );
}
