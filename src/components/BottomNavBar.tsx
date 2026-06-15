/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, PieChart, Receipt, FileText, BrainCircuit } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function BottomNavBar({ activeTab, setActiveTab }: BottomNavBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-3xl border-t border-white/10 px-2 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2 shadow-[0_-10px_35px_rgba(0,0,0,0.6)] z-45 max-w-lg mx-auto rounded-t-[32px] md:hidden">
      <div className="flex justify-between items-center h-14 select-none relative px-2">
        
        {/* Left Item 1: Saku (Beranda) */}
        <button
          id="nav-btn-saku"
          onClick={() => setActiveTab('dashboard')}
          className="flex flex-col items-center justify-center flex-1 h-full relative focus:outline-none group active:scale-90 transition-transform duration-100"
        >
          {activeTab === 'dashboard' && (
            <div className="absolute top-1 w-11 h-8 rounded-full bg-emerald-500/10 -z-10 animate-pulse" />
          )}
          <Home className={`w-5 h-5 transition-all duration-200 ${activeTab === 'dashboard' ? 'text-emerald-400 scale-110 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]' : 'text-slate-450 text-slate-400 group-hover:text-slate-200'}`} />
          <span className={`text-[8.5px] font-black mt-1 transition-colors duration-200 ${activeTab === 'dashboard' ? 'text-slate-100' : 'text-slate-400'}`}>Saku</span>
        </button>

        {/* Left Item 2: Alokasi Pagu */}
        <button
          id="nav-btn-alokasi"
          onClick={() => setActiveTab('budgets')}
          className="flex flex-col items-center justify-center flex-1 h-full relative focus:outline-none group active:scale-90 transition-transform duration-100"
        >
          {activeTab === 'budgets' && (
            <div className="absolute top-1 w-11 h-8 rounded-full bg-amber-500/10 -z-10 animate-pulse" />
          )}
          <PieChart className={`w-5 h-5 transition-all duration-200 ${activeTab === 'budgets' ? 'text-amber-400 scale-110 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'text-slate-450 text-slate-400 group-hover:text-slate-200'}`} />
          <span className={`text-[8.5px] font-black mt-1 transition-colors duration-200 ${activeTab === 'budgets' ? 'text-slate-100 px-0.5' : 'text-slate-400'}`}>Alokasi</span>
        </button>

        {/* Central Floating Action: Transaksi (Large Elevated Circle) */}
        <div className="flex-1 flex justify-center -mt-6 relative z-50">
          <button
            id="nav-btn-central-transaksi"
            onClick={() => setActiveTab('transactions')}
            className={`w-13 h-13 rounded-full flex flex-col items-center justify-center shadow-[0_8px_20px_rgba(244,63,94,0.35)] focus:outline-none active:scale-95 transition-all duration-200 border-2 ${
              activeTab === 'transactions' 
                ? 'border-white bg-gradient-to-tr from-rose-500 to-orange-400 ring-4 ring-rose-500/20' 
                : 'border-slate-900 bg-gradient-to-tr from-rose-600 to-orange-500 hover:scale-105'
            }`}
            title="Catat Transaksi"
          >
            <div className="relative flex items-center justify-center w-full h-full">
              {activeTab === 'transactions' && (
                <span className="absolute inset-x-0 inset-y-0 rounded-full border border-white/50 animate-ping opacity-50" />
              )}
              <Receipt className="w-5.5 h-5.5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
            </div>
          </button>
        </div>

        {/* Right Item 1: Rapor Keuangan */}
        <button
          id="nav-btn-rapor"
          onClick={() => setActiveTab('financial-report')}
          className="flex flex-col items-center justify-center flex-1 h-full relative focus:outline-none group active:scale-90 transition-transform duration-100"
        >
          {activeTab === 'financial-report' && (
            <div className="absolute top-1 w-11 h-8 rounded-full bg-cyan-500/10 -z-10 animate-pulse" />
          )}
          <FileText className={`w-5 h-5 transition-all duration-200 ${activeTab === 'financial-report' ? 'text-cyan-400 scale-110 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'text-slate-450 text-slate-400 group-hover:text-slate-200'}`} />
          <span className={`text-[8.5px] font-black mt-1 transition-colors duration-200 ${activeTab === 'financial-report' ? 'text-slate-100' : 'text-slate-400'}`}>Rapor</span>
        </button>

        {/* Right Item 2: SakuPintar AI Advisor */}
        <button
          id="nav-btn-sakuai"
          onClick={() => setActiveTab('ai-advisor')}
          className="flex flex-col items-center justify-center flex-1 h-full relative focus:outline-none group active:scale-90 transition-transform duration-100"
        >
          {activeTab === 'ai-advisor' && (
            <div className="absolute top-1 w-11 h-8 rounded-full bg-teal-500/10 -z-10 animate-pulse" />
          )}
          <BrainCircuit className={`w-5 h-5 transition-all duration-200 ${activeTab === 'ai-advisor' ? 'text-teal-400 scale-110 drop-shadow-[0_0_10px_rgba(20,184,166,0.3)]' : 'text-slate-450 text-slate-400 group-hover:text-slate-200'}`} />
          <span className={`text-[8.5px] font-black mt-1 transition-colors duration-200 ${activeTab === 'ai-advisor' ? 'text-slate-100' : 'text-slate-400'}`}>SakuPintar AI</span>
        </button>

      </div>
    </div>
  );
}
