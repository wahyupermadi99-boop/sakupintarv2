/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Percent, DollarSign, ListOrdered, ClipboardList, CheckCircle2, AlertTriangle, Flame, ShieldAlert, Sparkles, X } from 'lucide-react';
import { DebtItem } from '../types';

interface DebtsProps {
  debts: DebtItem[];
  totalIncome: number;
  onAddDebt: (debt: Omit<DebtItem, 'id'>) => void;
  onDeleteDebt: (id: string) => void;
}

export default function Debts({
  debts,
  totalIncome,
  onAddDebt,
  onDeleteDebt,
}: DebtsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [category, setCategory] = useState<'credit_card' | 'mortgage' | 'car_loan' | 'personal_loan' | 'other'>('credit_card');

  const totalMonthlyDebt = debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  const totalOutstandingDebt = debts.reduce((sum, d) => sum + d.totalAmount, 0);
  const debtRatio = totalIncome > 0 ? (totalMonthlyDebt / totalIncome) * 100 : 0;

  // Find status
  let healthCode: 'sehat' | 'waspada' | 'bahaya' = 'sehat';
  let healthTitle = 'AMAN JAYA ✅';
  let healthDesc = 'Beban cicilan bulanan masih di bawah 30% dari pemasukan. Ini rasio paling prima, dompet masih bisa bernapas lega!';
  let healthGradient = 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20 text-emerald-400';
  let IndicatorIcon = CheckCircle2;

  if (debtRatio > 35) {
    healthCode = 'bahaya';
    healthTitle = 'BONCOS RING 1 / KRITIS 🚨';
    healthDesc = 'Rasio cicilan bulanan melebihi 35%! Dompet sangat rentan jebol kalau ada emergency. Waktunya ngerem pinjol / kredit konsumtif!';
    healthGradient = 'from-rose-500/20 to-orange-500/10 border-rose-500/20 text-rose-400';
    IndicatorIcon = Flame;
  } else if (debtRatio > 30) {
    healthCode = 'waspada';
    healthTitle = 'OVERLIMIT / WASPADA ⚠️';
    healthDesc = 'Cicilan bulanan berkisar 30% - 35% pemasukan. Berhati-hatilah dan jangan nekat nambah paylater baru agar cashflow aman!';
    healthGradient = 'from-amber-500/20 to-orange-500/10 border-amber-500/20 text-amber-400';
    IndicatorIcon = AlertTriangle;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !monthlyPayment || !totalAmount) return;

    const rawMonthly = Number(monthlyPayment.replace(/[^0-9]/g, ''));
    const rawTotal = Number(totalAmount.replace(/[^0-9]/g, ''));

    if (!rawMonthly || rawMonthly <= 0 || !rawTotal || rawTotal <= 0) return;

    onAddDebt({
      name: name.trim(),
      monthlyPayment: rawMonthly,
      totalAmount: rawTotal,
      category,
    });

    setName('');
    setMonthlyPayment('');
    setTotalAmount('');
    setIsAdding(false);
  };

  const getCategoryEmoji = (cat: string) => {
    switch (cat) {
      case 'credit_card': return '💳';
      case 'mortgage': return '🏠';
      case 'car_loan': return '🚗';
      case 'personal_loan': return '💵';
      default: return '🪙';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'credit_card': return 'Kartu Kredit';
      case 'mortgage': return 'KPR / Angsuran Rumah';
      case 'car_loan': return 'Cicilan Kendaraan';
      case 'personal_loan': return 'Pinjaman Pribadi';
      default: return 'Lainnya';
    }
  };

  return (
    <div className="space-y-6 pb-24 text-white">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-black tracking-widest uppercase text-indigo-400">ANALISIS HUTANG</span>
          <h2 className="text-2xl font-black tracking-tight text-white">Rasio Hutang</h2>
          <p className="text-slate-400 text-xs">Pantau Debt-to-Income (DTI) Ratio agar kas tetap sehat.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="w-11 h-11 bg-indigo-600 hover:bg-indigo-500 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-95 transition-all"
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </motion.div>

      {/* Main Ratio Dashboard Gauge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-indigo-950 to-slate-950 border border-white/10 rounded-[40px] p-6 relative overflow-hidden flex flex-col items-center justify-center text-center shadow-xl"
      >
        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
        
        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase mt-2">DEBT-TO-INCOME RATIO</span>
        
        <div className="relative mt-4 flex items-center justify-center">
          {/* Visual Round Core Circle */}
          <div className="w-36 h-36 rounded-full border-8 border-slate-800 flex flex-col items-center justify-center relative">
            <span className={`text-4xl font-extrabold ${debtRatio > 35 ? 'text-rose-500' : debtRatio > 30 ? 'text-amber-500' : 'text-cyan-400'} leading-none`}>
              {debtRatio.toFixed(0)}%
            </span>
            <span className="text-[9px] text-slate-400 font-bold block uppercase mt-1">DTI Ratio</span>
          </div>
        </div>

        {/* Dynamic Indonesia warning badge */}
        <div className={`mt-5 px-4 py-2 border rounded-full text-xs font-black bg-gradient-to-r flex items-center gap-1.5 ${healthGradient}`}>
          <IndicatorIcon className="w-4.5 h-4.5" />
          <span>STATUS: {healthTitle}</span>
        </div>

        <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-[90%] mt-3">
          {healthDesc}
        </p>

        {/* Summary grid */}
        <div className="grid grid-cols-2 gap-4 w-full border-t border-white/5 pt-4 mt-5 font-bold text-xs text-left">
          <div className="space-y-0.5 pl-3">
            <span className="text-[9px] text-slate-400 uppercase">Cicilan Bulanan</span>
            <div className="text-sm font-black text-white">Rp {totalMonthlyDebt.toLocaleString('id-ID')}</div>
          </div>
          <div className="space-y-0.5 border-l border-white/5 pl-3">
            <span className="text-[9px] text-slate-400 uppercase">Sisa Pokok Hutang</span>
            <div className="text-sm font-black text-white">Rp {totalOutstandingDebt.toLocaleString('id-ID')}</div>
          </div>
        </div>
      </motion.div>

      {/* Slide-down loan intake form */}
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
              <Sparkles className="w-4 h-4 text-indigo-400" /> Daftarkan Cicilan Baru
            </h3>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Nama Cicilan / Kredit</label>
              <input
                type="text"
                placeholder="Misal: Cicilan Motor, Kartu Kredit Mandiri"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 text-white placeholder-slate-500 font-bold transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Cicilan Bulanan (Rp)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Seberapa besar per bulan"
                  value={monthlyPayment}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    if (!raw) {
                      setMonthlyPayment('');
                      return;
                    }
                    const formatted = parseInt(raw, 10).toLocaleString('id-ID');
                    setMonthlyPayment(formatted);
                  }}
                  required
                  className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 text-white placeholder-slate-500 font-bold transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Total Sisa Pokok (Rp)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Total sisa hutang lunas"
                  value={totalAmount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    if (!raw) {
                      setTotalAmount('');
                      return;
                    }
                    const formatted = parseInt(raw, 10).toLocaleString('id-ID');
                    setTotalAmount(formatted);
                  }}
                  required
                  className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 text-white placeholder-slate-500 font-bold transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Kategori Kredit</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 text-white font-bold transition-all"
              >
                <option value="credit_card" className="bg-slate-900 text-white">💳 Kartu Kredit</option>
                <option value="mortgage" className="bg-slate-900 text-white">🏠 KPR (Kredit Rumah)</option>
                <option value="car_loan" className="bg-slate-900 text-white">🚗 Cicilan Mobil / Motor</option>
                <option value="personal_loan" className="bg-slate-900 text-white">💵 Pinjaman Tunai / Paylater</option>
                <option value="other" className="bg-slate-900 text-white">🪙 Lainnya / Cicilan Produktif</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all hover:scale-[1.01] active:scale-95"
            >
              Simpan & Hubungkan Rasio 📈
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* active liabilities list */}
      <div className="space-y-3">
        {debts.length === 0 ? (
          <div className="bg-white/5 border border-white/15 p-8 rounded-3xl text-center space-y-3">
            <div className="text-4xl animate-bounce">🛡️</div>
            <p className="text-xs text-slate-400 leading-relaxed font-bold">
              Gokil! Kamu bebas cicilan. Pertahankan zero-liability lunas ini biar bebas financial anxiety!
            </p>
          </div>
        ) : (
          debts.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-4 flex justify-between items-center hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="text-2xl p-1.5 bg-indigo-500/10 border border-indigo-400/20 rounded-xl">
                  {getCategoryEmoji(item.category)}
                </span>
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-white truncate max-w-[170px]">{item.name}</h4>
                  <span className="text-[10px] text-indigo-400 font-bold block mt-0.5">{getCategoryLabel(item.category)}</span>
                  <span className="text-[9.5px] text-slate-400 font-semibold block mt-0.5">Sisa Hutang: Rp {item.totalAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-sm font-black text-white block">Rp {item.monthlyPayment.toLocaleString('id-ID')}</span>
                  <span className="text-[8.5px] text-slate-500 font-bold uppercase block">/ bulan</span>
                </div>
                <button
                  onClick={() => onDeleteDebt(item.id)}
                  className="p-1.5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
