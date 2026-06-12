/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, PieChart, Receipt, PercentCircle, BrainCircuit, FileText, FileJson } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function BottomNavBar({ activeTab, setActiveTab }: BottomNavBarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Saku', icon: Home, color: 'text-emerald-500' },
    { id: 'budgets', label: 'Alokasi', icon: PieChart, color: 'text-amber-500' },
    { id: 'transactions', label: 'Catatan', icon: Receipt, color: 'text-rose-500' },
    { id: 'debts', label: 'Rasio Hutang', icon: PercentCircle, color: 'text-indigo-400' },
    { id: 'financial-report', label: 'Rapor', icon: FileText, color: 'text-cyan-400' },
    { id: 'ai-advisor', label: 'SakuAI', icon: BrainCircuit, color: 'text-teal-500' },
    { id: 'backup', label: 'Cadangan', icon: FileJson, color: 'text-violet-400 font-bold' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-2xl border-t border-white/10 px-1 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-1.5 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-40 max-w-md mx-auto rounded-t-3xl">
      <div className="flex justify-between items-center h-14 select-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center flex-1 h-full py-0.5 relative focus:outline-none group active:scale-90 transition-transform duration-100"
            >
              {/* Highlight background blob on active tab */}
              {isActive && (
                <div className="absolute top-1 w-11 h-8 rounded-full bg-white/5 -z-10 transition-all duration-300" />
              )}
              <Icon
                className={`w-4.5 h-4.5 transition-all duration-300 ${
                  isActive
                    ? `${item.color} scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]`
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              <span
                className={`text-[8.5px] font-black mt-1 transition-colors duration-300 truncate max-w-full px-0.5 ${
                  isActive ? 'text-slate-100' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
