/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ClassificationType = 'needs' | 'wants' | 'savings';

export const CLASSIFICATION_LABELS: Record<ClassificationType, string> = {
  needs: 'Kebutuhan (50%)',
  wants: 'Kesenangan / Keinginan (30%)',
  savings: 'Investasi / Tabungan (20%)',
};

export const CLASSIFICATION_PERCENTAGES: Record<ClassificationType, number> = {
  needs: 0.50,
  wants: 0.30,
  savings: 0.20,
};

export function classifyInput(text: string): ClassificationType {
  const norm = text.toLowerCase();
  
  const needsKeywords = [
    'makan', 'kuliner', 'pangan', 'beras', 'lauk', 'sup', 'mi ', 'warung', 'diet', 'gizi',
    'bensin', 'pertamax', 'gojek', 'grab', 'ojek', 'transport', 'mrt', 'lrt', 'angkot', 'bus', 'parkir', 'tol',
    'tagihan', 'listrik', 'token', ' air', 'pdam', 'internet', 'wifi', 'indihome', 'pulsa', 'kuota',
    'kpr', 'kost', 'kosan', 'kontrakan', 'sewa', 'cicilan', 'bayar', 'iuran', 'asuransi',
    'obat', 'sehat', 'dokter', 'rumahsakit', 'klinik', 'apotek', 'pajak', 'belanja bulanan', 'sembako'
  ];

  const wantsKeywords = [
    'netflix', 'spotify', 'disney', 'bioskop', 'nonton', 'cinema', 'xxi', 'mall', 'shopee', 'tokopedia',
    'kopi', 'starbucks', 'cafe', 'kafe', 'kopi susu', 'jajan', 'boba', 'camilan', 'snack', 'rokok',
    'game', 'games', 'steam', 'playstation', 'gundam', 'tonton', 'wisata', 'healing', 'travel',
    'liburan', 'hotel', 'villa', 'konser', 'shopping', 'baju', 'kaos', 'sepatu', 'aksesoris', 'pesta'
  ];

  const savingsKeywords = [
    'tabungan', 'simpanan', 'celengan', 'darurat', 'investasi', 'saham', 'reksa', 'reksadana',
    'bibit', 'emas', 'antam', 'kyoto', 'deposito', 'crypto', 'kripto', 'bitcoin', 'saham', 'invest'
  ];

  if (needsKeywords.some(kw => norm.includes(kw))) return 'needs';
  if (wantsKeywords.some(kw => norm.includes(kw))) return 'wants';
  if (savingsKeywords.some(kw => norm.includes(kw))) return 'savings';

  // Fallback to needs because we must output one of them
  return 'needs';
}

export function getAutoAllocatedLimit(balance: number, type: ClassificationType): number {
  const positiveBalance = Math.max(0, balance);
  return positiveBalance * CLASSIFICATION_PERCENTAGES[type];
}
