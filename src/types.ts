/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BudgetBucket {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
  icon: string;
  classification?: 'needs' | 'wants' | 'savings'; // 'needs' (50%), 'wants' (30%), 'savings' (20%)
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  description: string;
  budgetId: string | null;  // Connects expense strictly to a budget bucket
  sourceType?: 'cash' | 'bank'; // 'cash' (dompet) or 'bank'
  bankName?: string; // e.g. 'BCA', 'Bank Mandiri', 'Bank Jago', etc.
  bankAccountId?: string; // Links strictly to a BankAccount.id
}

export interface DebtItem {
  id: string;
  name: string;
  monthlyPayment: number;
  totalAmount: number;
  category: 'credit_card' | 'mortgage' | 'car_loan' | 'personal_loan' | 'other';
}

export interface BankAccount {
  id: string;
  bankName: string; // BCA, Mandiri, BNI, BRI, Bank Jago, SeaBank, BTN, CIMB Niaga, Lainnya
  accountName: string; // e.g. "Tabungan Utama"
  startingBalance: number;
  balance?: number;
}

export interface AIAnalysisReport {
  id: string;
  timestamp: string;
  totalIncome: number;
  totalExpense: number;
  debtRatio: number; // monthly debt / income
  debtStatus: 'sehat' | 'waspada' | 'bahaya';
  healthScore: number; // 0 to 100
  markdownReport: string;
}
