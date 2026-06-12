/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Filter, Calendar, Tag, FileText, CheckCircle2, Sparkles, X, AlertTriangle } from 'lucide-react';
import { Transaction, BudgetBucket, BankAccount } from '../types';

import { classifyInput, getAutoAllocatedLimit, CLASSIFICATION_LABELS } from '../lib/budgetClassifier';

interface TransactionsProps {
  transactions: Transaction[];
  budgets: BudgetBucket[];
  bankAccounts?: BankAccount[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  totalCombinedBalance: number;
}

export default function Transactions({
  transactions,
  budgets,
  bankAccounts = [],
  onAddTransaction,
  onDeleteTransaction,
  totalCombinedBalance,
}: TransactionsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [budgetId, setBudgetId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const [sourceType, setSourceType] = useState<'cash' | 'bank'>('cash');
  const [bankAccountId, setBankAccountId] = useState(bankAccounts[0]?.id || '');

  const numAmount = Number(amount.replace(/[^0-9]/g, '')) || 0;
  const currentClassification = description.trim() ? classifyInput(description) : null;
  const isOverLimit = (() => {
    if (type !== 'expense' || !currentClassification || numAmount <= 0) return false;
    const pct = currentClassification === 'needs' ? 0.5 : currentClassification === 'wants' ? 0.3 : 0.2;
    const limit = totalCombinedBalance * pct;
    return numAmount > limit;
  })();

  const classificationLimitAmount = (() => {
    if (!currentClassification) return 0;
    const pct = currentClassification === 'needs' ? 0.5 : currentClassification === 'wants' ? 0.3 : 0.2;
    return totalCombinedBalance * pct;
  })();

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    if (type === 'expense' && val.trim().length > 1) {
      const cls = classifyInput(val);
      const matchedBudget = budgets.find((b) => b.classification === cls);
      if (matchedBudget) {
        setBudgetId(matchedBudget.id);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmount = Number(amount.replace(/[^0-9]/g, ''));
    if (!rawAmount || rawAmount <= 0 || !description.trim()) return;

    let selectedCategory = 'Umum';
    let chosenBudgetId: string | null = null;

    if (type === 'expense' && budgetId) {
      const budget = budgets.find((b) => b.id === budgetId);
      if (budget) {
        selectedCategory = budget.name;
        chosenBudgetId = budget.id;
      }
    } else if (type === 'income') {
      selectedCategory = 'Gajian / Pendapatan';
    }

    const selectedBank = sourceType === 'bank' 
      ? (bankAccounts.find((b) => b.id === bankAccountId) || bankAccounts[0])
      : null;

    onAddTransaction({
      type,
      amount: rawAmount,
      description: description.trim(),
      category: selectedCategory,
      date,
      budgetId: chosenBudgetId,
      sourceType,
      bankName: selectedBank ? selectedBank.bankName : undefined,
      bankAccountId: selectedBank ? selectedBank.id : undefined,
    });

    // Reset Form
    setAmount('');
    setDescription('');
    setBudgetId('');
    setIsAdding(false);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  return (
    <div className="space-y-6 pb-24 text-white">
      {/* Upper header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-black tracking-widest uppercase text-fuchsia-400">BUKU KELOLA SAKU</span>
          <h2 className="text-2xl font-black tracking-tight text-white">Catat Keuangan</h2>
          <p className="text-slate-400 text-xs">Arsip keluar masuknya rupiah di dalam saku.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="w-11 h-11 bg-lime-400 hover:bg-lime-300 rounded-2xl flex items-center justify-center font-black text-xl text-slate-950 shadow-[0_0_15px_rgba(163,230,53,0.4)] active:scale-95 transition-all"
        >
          {isAdding ? <X className="w-5 h-5 text-slate-950" /> : <Plus className="w-5 h-5 text-slate-950" />}
        </button>
      </motion.div>

      {/* Quick Filter tabs with vivid styling */}
      <div className="flex gap-2">
        {(['all', 'income', 'expense'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setFilterType(filter)}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs capitalize border tracking-wide transition-all ${
              filterType === filter
                ? filter === 'all'
                  ? 'bg-white/10 text-white border-white/20'
                  : filter === 'income'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-inner'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-inner'
                : 'bg-transparent text-slate-400 border-white/5 hover:text-white hover:bg-white/5'
            }`}
          >
            {filter === 'all' ? 'Semua' : filter === 'income' ? 'Pendapatan' : 'Pengeluaran'}
          </button>
        ))}
      </div>

      {/* Form Slide down card */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4 overflow-hidden"
          >
            <h3 className="text-sm font-black text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Sparkles className="w-4 h-4 text-cyan-400" /> Input Transaksi Baru
            </h3>

            {/* Income vs Expense Selector */}
            <div className="grid grid-cols-2 gap-2.5 bg-black/30 p-1 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 px-3 rounded-xl text-xs font-black tracking-wide transition-all ${
                  type === 'expense' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400'
                }`}
              >
                💸 Keluar (Expense)
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 px-3 rounded-xl text-xs font-black tracking-wide transition-all ${
                  type === 'income' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400'
                }`}
              >
                💵 Masuk (Inflow)
              </button>
            </div>

            {/* Sumber / Tujuan Saldo Selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1">
                🏧 Sumber Dana / Akun
              </label>
              <div className="grid grid-cols-2 gap-2 bg-black/30 p-1 rounded-2xl border border-white/5 mb-2.5">
                <button
                  type="button"
                  onClick={() => setSourceType('cash')}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all ${
                    sourceType === 'cash' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400'
                  }`}
                >
                  🪙 Kas Tunai
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSourceType('bank');
                    if (!bankAccountId && bankAccounts.length > 0) {
                      setBankAccountId(bankAccounts[0].id);
                    }
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all ${
                    sourceType === 'bank' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400'
                  }`}
                >
                  🏦 Rekening Bank
                </button>
              </div>

              {sourceType === 'bank' && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                  {bankAccounts.length === 0 ? (
                    <div className="text-[11px] text-amber-400 font-bold p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      Belum ada rekening bank terdaftar. Silakan tambahkan rekening bank baru di tab Beranda!
                    </div>
                  ) : (
                    <select
                      value={bankAccountId}
                      onChange={(e) => setBankAccountId(e.target.value)}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 text-white font-bold transition-all"
                    >
                      {bankAccounts.map((b) => (
                        <option key={b.id} value={b.id} className="bg-[#111122] text-white">
                          {b.bankName} - {b.accountName} (Sisa: Rp {b.balance.toLocaleString('id-ID')})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            {/* Amount Field */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Nominal Uang (Rp)
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  if (!raw) {
                    setAmount('');
                    return;
                  }
                  const formatted = parseInt(raw, 10).toLocaleString('id-ID');
                  setAmount(formatted);
                }}
                required
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 text-white placeholder-slate-500 font-bold transition-all"
              />
            </div>

            {/* If Expense, Select Budget Pot */}
            {type === 'expense' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                  Pot Alokasi Saku? (Koneksi ke Pagu)
                </label>
                {budgets.length === 0 ? (
                  <div className="bg-amber-500/10 border border-amber-400/20 p-3.5 rounded-2xl text-amber-300 text-xs font-bold flex items-start gap-2">
                    <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                    <div>
                      <span>Kamu belum membuat pos saku! Transaksi akan digolongkan ke pos &quot;Umum&quot;. Lebih baik buat alokasi dulu di tab &apos;Alokasi&apos;.</span>
                    </div>
                  </div>
                ) : (
                  <select
                    value={budgetId}
                    onChange={(e) => setBudgetId(e.target.value)}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 text-white placeholder-slate-500 font-bold transition-all"
                  >
                    <option value="" className="bg-slate-900 text-slate-500">-- Pilih Pagu Saku Alokasi --</option>
                    {budgets.map((b) => (
                      <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                        {b.icon} {b.name} (Sisa pagu: Rp {(b.allocated - b.spent).toLocaleString('id-ID')})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Description Field */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Keterangan / Catatan
              </label>
              <input
                type="text"
                placeholder="Misal: Beli makan siang, Gojek, Bonus Gaji"
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                required
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 text-white placeholder-slate-500 font-bold transition-all"
              />

              {/* Dynamic 50/30/20 Classification & Limit Banner */}
              {type === 'expense' && currentClassification && (
                <div className="mt-2.5 space-y-2">
                  <div className="px-3.5 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                      Auto-Klasifikasi: {CLASSIFICATION_LABELS[currentClassification]}
                    </span>
                    <span className="text-[10px] bg-indigo-500/20 px-1.5 py-0.5 rounded-md font-bold">
                      Limit {currentClassification === 'needs' ? '50%' : currentClassification === 'wants' ? '30%' : '20%'} Saldo
                    </span>
                  </div>

                  {isOverLimit && (
                    <div className="p-3.5 rounded-xl bg-orange-505 bg-rose-500/10 border border-rose-400/20 text-rose-400 text-[11px] leading-relaxed font-bold space-y-1">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 animate-bounce" />
                        <span>⚠️ PERINGATAN OVER-LIMIT (Rule 50/30/20)!</span>
                      </div>
                      <p className="font-semibold text-slate-200">
                        Input Rp {numAmount.toLocaleString('id-ID')} melebihi batas aman klasifikasi ini ({currentClassification === 'needs' ? '50%' : currentClassification === 'wants' ? '30%' : '20%'} saldo saku saat ini = Rp {classificationLimitAmount.toLocaleString('id-ID')}). Terlalu boros!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Date Field */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Tanggal Transaksi
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 text-white font-bold transition-all"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all hover:scale-[1.01] active:scale-95 ${
                type === 'expense'
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-950/20'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-950/20'
              }`}
            >
              Simpan Transaksi 💾
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* History Ledger List with beautiful visual indicators */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="bg-white/5 border border-white/15 p-12 rounded-3xl text-center space-y-3.5">
            <div className="text-4xl animate-pulse">📝</div>
            <p className="text-xs text-slate-400 leading-relaxed font-bold">
              Buku catatan kosong. Belum ada transaksi tercatat di filter ini. Tap tombol tambah (+) untuk mulai mencatat.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredTransactions.map((item) => {
              // Try to find if this transaction connects to an active budget pot
              const matchingBudget = budgets.find((b) => b.id === item.budgetId);
              const customIcon = matchingBudget ? matchingBudget.icon : item.type === 'income' ? '💰' : '💸';
              const customColor = matchingBudget ? matchingBudget.color : item.type === 'income' ? 'from-emerald-400 to-teal-500' : 'from-rose-500 to-orange-500';

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -25 }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-4 flex justify-between items-center hover:border-white/20 transition-all group scale-100 duration-150"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Vivid Gradient Icon frame */}
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${customColor} flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-md`}>
                      <span className="drop-shadow-sm select-none">{customIcon}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-white truncate pr-2 max-w-[200px]">{item.description}</h4>
                        <span className={`text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                          item.sourceType === 'bank' 
                            ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20' 
                            : 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                        }`}>
                          {item.sourceType === 'bank' ? `🏦 ${item.bankName || 'Bank'}` : '🪙 Tunai'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{item.category}</span>
                        <span className="text-slate-600 text-[10px]">•</span>
                        <span className="text-[9.5px] text-slate-400 font-semibold">{item.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 flex-shrink-0">
                    <span className={`text-base font-black ${item.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.type === 'income' ? '+' : '-'}Rp {item.amount.toLocaleString('id-ID')}
                    </span>
                    <button
                      onClick={() => onDeleteTransaction(item.id)}
                      className="p-1.5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                      title="Hapus Catatan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
