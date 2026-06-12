/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit3, Check, X, AlertOctagon, Sparkles, Smile, Info } from 'lucide-react';
import { BudgetBucket } from '../types';

import { classifyInput, CLASSIFICATION_LABELS, ClassificationType } from '../lib/budgetClassifier';

interface BudgetsProps {
  budgets: BudgetBucket[];
  totalIncome: number;
  onAddBudget: (budget: Omit<BudgetBucket, 'id' | 'spent'>) => void;
  onDeleteBudget: (id: string) => void;
  onUpdateBudget: (id: string, updated: Partial<BudgetBucket>) => void;
  totalCombinedBalance: number;
}

const PRESET_EMOJIS = ['🍔', '🚗', '🎮', '🏠', '🛍️', '🎓', '🏥', '☕', '🍿', '💡', '✈️', '📈', '🎁', '💖'];
const PRESET_COLORS = [
  'from-cyan-400 to-blue-500',      // Cyan/Blue
  'from-fuchsia-500 to-pink-500',   // Fuchsia
  'from-orange-400 to-red-500',     // Orange/Red
  'from-lime-400 to-emerald-500',   // Green/Lime
  'from-amber-400 to-yellow-500',   // Yellow/Amber
  'from-violet-500 to-indigo-600',  // Purple/Indigo
  'from-teal-400 to-cyan-500',      // Teal
  'from-rose-500 to-red-600',       // Rose Red
];

export default function Budgets({
  budgets,
  totalIncome,
  onAddBudget,
  onDeleteBudget,
  onUpdateBudget,
  totalCombinedBalance,
}: BudgetsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [allocated, setAllocated] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🍔');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAllocated, setEditAllocated] = useState('');
  const [classification, setClassification] = useState<ClassificationType>('needs');

  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
  const unallocatedSalary = totalIncome - totalAllocated;

  const needsAllocatedSum = budgets.filter(b => b.classification === 'needs').reduce((sum, b) => sum + b.allocated, 0);
  const wantsAllocatedSum = budgets.filter(b => b.classification === 'wants').reduce((sum, b) => sum + b.allocated, 0);
  const savingsAllocatedSum = budgets.filter(b => b.classification === 'savings').reduce((sum, b) => sum + b.allocated, 0);

  const needsLimitSum = Math.max(0, totalIncome) * 0.50;
  const wantsLimitSum = Math.max(0, totalIncome) * 0.30;
  const savingsLimitSum = Math.max(0, totalIncome) * 0.20;

  const isNeedsOver = needsAllocatedSum > needsLimitSum && totalIncome > 0;
  const isWantsOver = wantsAllocatedSum > wantsLimitSum && totalIncome > 0;
  const isSavingsOver = savingsAllocatedSum > savingsLimitSum && totalIncome > 0;

  const handleNameChange = (val: string) => {
    setName(val);
    if (val.trim().length > 1) {
      const detectedCls = classifyInput(val);
      setClassification(detectedCls);
      
      if (detectedCls === 'needs') {
        setSelectedEmoji('🍔');
        setSelectedColor(PRESET_COLORS[0]);
      } else if (detectedCls === 'wants') {
        setSelectedEmoji('🎮');
        setSelectedColor(PRESET_COLORS[1]);
      } else if (detectedCls === 'savings') {
        setSelectedEmoji('📈');
        setSelectedColor(PRESET_COLORS[3]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !allocated) return;
    
    const rawAllocated = Number(allocated.replace(/[^0-9]/g, ''));
    if (!rawAllocated || rawAllocated <= 0) return;

    onAddBudget({
      name: name.trim(),
      allocated: rawAllocated,
      color: selectedColor,
      icon: selectedEmoji,
      classification: classification,
    });

    // Reset Form
    setName('');
    setAllocated('');
    setClassification('needs');
    setIsAdding(false);
  };

  const startEditing = (bucket: BudgetBucket) => {
    setEditingId(bucket.id);
    setEditAllocated(bucket.allocated.toLocaleString('id-ID'));
  };

  const saveEdit = (id: string) => {
    const rawEdit = Number(editAllocated.replace(/[^0-9]/g, ''));
    if (!rawEdit || isNaN(rawEdit)) return;
    onUpdateBudget(id, { allocated: rawEdit });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 pb-24 text-white">
      {/* Dynamic Upper Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-black tracking-widest uppercase text-cyan-400">ALOKASI SAKU & PAGU</span>
          <h2 className="text-2xl font-black tracking-tight text-white mb-0.5">Alokasi Saku</h2>
          <p className="text-slate-400 text-xs">Atur alokasi bulanan agar cashflow terhindar dari boncos.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="w-11 h-11 bg-fuchsia-600 rounded-2xl flex items-center justify-center font-black text-xl text-white hover:bg-fuchsia-500 shadow-[0_0_15px_rgba(192,38,211,0.4)] active:scale-95 transition-all"
        >
          {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </motion.div>

      {/* Salary Pot Distribution Health Gauge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-white/10 rounded-3xl p-5 relative overflow-hidden"
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Status Alokasi Saku</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Pagu Terkunci</span>
            <div className="text-lg font-black text-white">Rp {totalAllocated.toLocaleString('id-ID')}</div>
            <span className="text-[9px] text-slate-400 block font-semibold leading-none">dari total inflow</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Inflow Belum Terpeta</span>
            <div className={`text-lg font-black ${unallocatedSalary < 0 ? 'text-rose-400' : 'text-lime-400'}`}>
              Rp {unallocatedSalary.toLocaleString('id-ID')}
            </div>
            <span className="text-[9px] text-slate-400 block font-semibold leading-none">
              {unallocatedSalary < 0 ? 'Alokasi Defisit (Boncos)!' : 'Sisa saldo bebas saku'}
            </span>
          </div>
        </div>

        {/* Balance horizontal fill bar */}
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mt-4 border border-white/5 flex">
          {budgets.map((b) => {
            const widthPct = totalIncome > 0 ? (b.allocated / totalIncome) * 100 : 0;
            return (
              <div
                key={b.id}
                style={{ width: `${widthPct}%` }}
                className={`h-full bg-gradient-to-r ${b.color} opacity-85`}
                title={`${b.name}: ${widthPct.toFixed(0)}%`}
              />
            );
          })}
        </div>
        <div className="flex justify-between items-center mt-2.5 text-[10px] text-slate-400 font-bold">
          <span>Inflow Terpeta: {totalIncome > 0 ? ((totalAllocated / totalIncome) * 100).toFixed(0) : '0'}%</span>
          <span>Target Ideal: 100%</span>
        </div>

        {/* 50/30/20 Rule Live Status Panel */}
        <div className="mt-5 pt-5 border-t border-white/5 space-y-3.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-300">
              Financial Health Radar (Prinsip 50/30/20)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Needs Column */}
            <div className={`p-3 rounded-2xl border transition-all duration-300 ${
              isNeedsOver ? 'bg-rose-500/10 border-rose-500/20' : 'bg-white/5 border-white/5'
            }`}>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400">Kebutuhan Hidup (Needs - 50%)</span>
                {isNeedsOver && (
                  <span className="text-[9px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Over!</span>
                )}
              </div>
              <div className="text-sm font-black text-slate-100 mt-1">
                Rp {needsAllocatedSum.toLocaleString('id-ID')}
              </div>
              <div className="text-[9.5px] text-slate-400 font-medium mt-0.5">
                Pagu Ideal: Rp {needsLimitSum.toLocaleString('id-ID')}
              </div>
              {/* mini progress bar */}
              <div className="w-full h-1 bg-white/5 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${isNeedsOver ? 'bg-rose-500' : 'bg-cyan-400'}`}
                  style={{ width: `${Math.min(100, needsLimitSum > 0 ? (needsAllocatedSum / needsLimitSum) * 100 : 0)}%` }}
                />
              </div>
            </div>

            {/* Wants Column */}
            <div className={`p-3 rounded-2xl border transition-all duration-300 ${
              isWantsOver ? 'bg-rose-500/10 border-rose-500/20' : 'bg-white/5 border-white/5'
            }`}>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400">Gaya Hidup & Keinginan (Wants - 30%)</span>
                {isWantsOver && (
                  <span className="text-[9px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Over!</span>
                )}
              </div>
              <div className="text-sm font-black text-slate-100 mt-1">
                Rp {wantsAllocatedSum.toLocaleString('id-ID')}
              </div>
              <div className="text-[9.5px] text-slate-400 font-medium mt-0.5">
                Pagu Ideal: Rp {wantsLimitSum.toLocaleString('id-ID')}
              </div>
              {/* mini progress bar */}
              <div className="w-full h-1 bg-white/5 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${isWantsOver ? 'bg-rose-500' : 'bg-fuchsia-400'}`}
                  style={{ width: `${Math.min(100, wantsLimitSum > 0 ? (wantsAllocatedSum / wantsLimitSum) * 100 : 0)}%` }}
                />
              </div>
            </div>

            {/* Savings Column */}
            <div className={`p-3 rounded-2xl border transition-all duration-300 ${
              isSavingsOver ? 'bg-rose-500/10 border-rose-500/20' : 'bg-white/5 border-white/5'
            }`}>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400">Masa Depan & Tabungan (Savings - 20%)</span>
                {isSavingsOver && (
                  <span className="text-[9px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Over!</span>
                )}
              </div>
              <div className="text-sm font-black text-slate-100 mt-1">
                Rp {savingsAllocatedSum.toLocaleString('id-ID')}
              </div>
              <div className="text-[9.5px] text-slate-400 font-medium mt-0.5">
                Pagu Ideal: Rp {savingsLimitSum.toLocaleString('id-ID')}
              </div>
              {/* mini progress bar */}
              <div className="w-full h-1 bg-white/5 rounded-full mt-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${isSavingsOver ? 'bg-rose-500' : 'bg-emerald-400'}`}
                  style={{ width: `${Math.min(100, savingsLimitSum > 0 ? (savingsAllocatedSum / savingsLimitSum) * 100 : 0)}%` }}
                />
              </div>
            </div>
          </div>

          {(isNeedsOver || isWantsOver || isSavingsOver) && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10.5px] leading-relaxed font-bold flex gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="block uppercase tracking-wider text-[11px]">Deteksi Risiko Overbudget!</span>
                <p className="font-medium text-slate-300 leading-normal mt-0.5">
                  Berdasarkan alokasi saldo berjalan saku Anda (Rp {totalCombinedBalance.toLocaleString('id-ID')}), beberapa kategori budgeting melebihi rasio 50%-30%-20%. Pertimbangkan untuk menyunting atau menyeimbangkan pos belanja Anda kembali demi kelangsungan keuangan.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Slide-down Form to Add New Budget */}
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
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" /> Buat Pos Alokasi Baru
            </h3>

            <div>
              <label className="block text-[10.5px] font-bold text-slate-400 uppercase mb-1.5 font-sans">Nama Pos Belanja (Deteksi Otomatis Klasifikasi)</label>
              <input
                type="text"
                placeholder="Misal: Makan, Kopi Senja, Langganan Netflix, Investasi Reksadana"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 text-white placeholder-slate-500 font-bold transition-all"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-slate-400 uppercase mb-1.5 font-sans">Kategori Alokasi berjalan (Pilih / Otomatis Terdeteksi)</label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value as ClassificationType)}
                className="w-full bg-black/35 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 text-white font-bold transition-all"
              >
                <option value="needs" className="bg-slate-900 text-white">🍔 Kebutuhan Pokok (Needs - Rasio 50%)</option>
                <option value="wants" className="bg-slate-900 text-white">🎮 Gaya Hidup & Kesenangan (Wants - Rasio 30%)</option>
                <option value="savings" className="bg-slate-900 text-white">📈 Investasi & Tabungan Masa Depan (Savings - Rasio 20%)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-slate-400 uppercase mb-1.5 font-sans">Nominal Pagu Anggaran (Rp)</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Pagu maksimum belanja pos ini"
                value={allocated}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  if (!raw) {
                    setAllocated('');
                    return;
                  }
                  const formatted = parseInt(raw, 10).toLocaleString('id-ID');
                  setAllocated(formatted);
                }}
                required
                className="w-full bg-black/30 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 text-white placeholder-slate-500 font-bold transition-all"
              />
            </div>

            {/* Custom Interactive Icon/Emoji Grid selection */}
            <div>
              <label className="block text-[10.5px] font-bold text-slate-400 uppercase mb-1.5">Pilih Icon Pos</label>
              <div className="flex flex-wrap gap-2 p-3 bg-black/20 rounded-2xl border border-white/5 no-scrollbar max-h-24 overflow-y-auto">
                {PRESET_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`text-xl p-2 rounded-xl transition-all hover:scale-110 active:scale-95 ${
                      selectedEmoji === emoji ? 'bg-cyan-500/20 border border-cyan-400/50 scale-105' : 'bg-transparent border border-transparent'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Theme Color selectors */}
            <div>
              <label className="block text-[10.5px] font-bold text-slate-400 uppercase mb-1.5">Pilih Warna Aksen</label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_COLORS.map((color, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`h-7 rounded-xl bg-gradient-to-r ${color} transition-all relative border ${
                      selectedColor === color ? 'border-white' : 'border-white/10'
                    }`}
                  >
                    {selectedColor === color && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 rounded-2xl font-black text-xs text-slate-950 uppercase tracking-widest shadow-lg transition-all hover:scale-[1.01] active:scale-95"
            >
              Kunci Pagu Saku 🚀
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Main Budget Cards Grid */}
      <div className="space-y-4">
        {budgets.length === 0 ? (
          <div className="bg-white/5 border border-white/15 p-8 rounded-3xl text-center space-y-3">
            <div className="text-4xl animate-bounce">📦</div>
            <p className="text-xs text-slate-400 leading-relaxed font-bold">
              Belum ada alokasi saku terdaftar. Tap tombol tambah (+) di atas untuk memetakan budget saku pertamamu!
            </p>
          </div>
        ) : (
          budgets.map((item) => {
            const isOver = item.spent > item.allocated;
            const ratio = item.allocated > 0 ? (item.spent / item.allocated) * 100 : 0;
            const progress = Math.min(100, ratio);
            const remaining = item.allocated - item.spent;

            return (
              <motion.div
                key={item.id}
                layout
                className={`bg-white/5 border rounded-3xl p-5 relative overflow-hidden transition-all ${
                  isOver ? 'border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Glow Background Gradient */}
                <div className={`absolute -right-12 -top-12 w-28 h-28 bg-gradient-to-br ${item.color} opacity-[0.06] blur-2xl`} />

                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-1 bg-white/5 rounded-2xl border border-white/5">{item.icon}</span>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <h4 className="text-sm font-black text-white">{item.name}</h4>
                        {item.classification && (
                          <span className={`text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                            item.classification === 'needs' 
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-400/20' 
                              : item.classification === 'wants' 
                              ? 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-400/20' 
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/20'
                          }`}>
                            {item.classification === 'needs' ? 'Needs (Pokok)' : item.classification === 'wants' ? 'Wants (Gaya Hidup)' : 'Savings (Investasi)'}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold block">
                        Pagu Limit: Rp {item.allocated.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Inline budget cap editing or normal delete */}
                  <div className="flex items-center gap-1.5 relative z-10">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={editAllocated}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/[^0-9]/g, '');
                            if (!raw) {
                              setEditAllocated('');
                              return;
                            }
                            const formatted = parseInt(raw, 10).toLocaleString('id-ID');
                            setEditAllocated(formatted);
                          }}
                          className="w-24 bg-black/60 border border-white/20 rounded-md px-1.5 py-1 text-xs text-white text-right font-bold focus:outline-none focus:border-cyan-400"
                          autoFocus
                        />
                        <button
                          onClick={() => saveEdit(item.id)}
                          className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/20"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 bg-rose-500/20 text-rose-400 rounded-md border border-rose-500/20"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(item)}
                          className="p-2 hover:bg-white/5 rounded-xl border border-white/5 text-slate-400 hover:text-white transition-colors"
                          title="Ubah Anggaran"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteBudget(item.id)}
                          className="p-2 hover:bg-white/5 rounded-xl border border-white/5 text-rose-400 hover:text-rose-500 transition-colors"
                          title="Hapus Pos"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress bar visual container */}
                <div className="space-y-1.5 mt-4">
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5 px-[1.5px] flex items-center">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-2 rounded-full bg-gradient-to-r ${item.color} ${
                        isOver ? 'shadow-[0_0_10px_rgba(244,63,94,0.4)]' : ''
                      }`}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold pt-1">
                    <span>Realisasi: Rp {item.spent.toLocaleString('id-ID')}</span>
                    <span className={isOver ? 'text-rose-400 font-extrabold' : 'text-slate-400'}>
                      {isOver ? `Boncos Rp ${Math.abs(remaining).toLocaleString('id-ID')}!` : `Sisa Rp ${remaining.toLocaleString('id-ID')}`}
                    </span>
                  </div>
                </div>

                {isOver && (
                  <div className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-400/20 text-rose-400 text-[10px] font-bold">
                    <AlertOctagon className="w-3.5 h-3.5" /> Pos ini terdeteksi boncos (melebihi pagu)! Rem pengeluaran dulu ya.
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Info Advice Banner */}
      <div className="bg-white/5 border border-white/5 p-4 rounded-3xl flex gap-3 text-xs leading-relaxed text-slate-300">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Prinsip 50-30-20:</strong> Idealnya, kelola budget agar 50% pendapatan untuk pos kebutuhan pokok (makan/cicilan/KPR), 30% keinginan santai (hiburan/jajan), dan 20% otomatis masuk tabungan atau investasi.
        </p>
      </div>
    </div>
  );
}
