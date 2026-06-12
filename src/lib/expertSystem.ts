/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction, BudgetBucket, DebtItem, AIAnalysisReport } from '../types';

export function runOfflineFinancialAnalysis(
  transactions: Transaction[],
  budgets: BudgetBucket[],
  debts: DebtItem[],
  totalIncome: number,
  totalExpense: number
): AIAnalysisReport {
  
  // Calculate total debt monthly payment
  const totalMonthlyDebt = debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  const debtRatio = totalIncome > 0 ? (totalMonthlyDebt / totalIncome) * 100 : 0;
  
  // Basic Health Score calculation start with 85
  let healthScore = 80;
  
  // Factor 1: Savings rate
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  if (savingsRate > 20) {
    healthScore += 10;
  } else if (savingsRate < 0) {
    healthScore -= 20; // deficit
  } else if (savingsRate < 10) {
    healthScore -= 5;
  }
  
  // Factor 2: Debt Ratio impact
  let debtStatus: 'sehat' | 'waspada' | 'bahaya' = 'sehat';
  if (debtRatio > 35) {
    debtStatus = 'bahaya';
    healthScore -= 25;
  } else if (debtRatio > 30) {
    debtStatus = 'waspada';
    healthScore -= 10;
  } else {
    healthScore += 5;
  }
  
  // Factor 3: Overbudget categories
  const overbudgetBuckets = budgets.filter((b) => b.spent > b.allocated);
  const overbudgetCount = overbudgetBuckets.length;
  healthScore -= overbudgetCount * 5;
  
  // Normalize score
  healthScore = Math.max(10, Math.min(100, healthScore));
  
  // Generate beautiful, professional Indonesian advice report
  let reportMarkdown = `## 📊 Laporan Analisis Kesehatan Finansial SakuPintar (Offline mode)
*Laporan ini dianalisis menggunakan mesin logika keuangan cerdas lokal untuk akses cepat tanpa internet.*

---

### 🌟 Ringkasan Eksekutif Keuangan Anda
Halo Kak! Kami telah memetakan kondisi keuangan pribadi Anda di bulan ini. Saat ini, skor kesehatan finansial Anda berada di angka **${healthScore}/100**. Kondisi Anda secara umum termasuk dalam kategori **${healthScore >= 80 ? 'Sangat Sehat 🌿' : healthScore >= 60 ? 'Cukup Sehat, Perlu Penyesuaian ⚠️' : 'Kritis / Defisit 🚨'}**.

- **Total Pemasukan:** Rp ${totalIncome.toLocaleString('id-ID')}
- **Total Pengeluaran:** Rp ${totalExpense.toLocaleString('id-ID')}
- **Aliran Dana Tersisa:** Rp ${(totalIncome - totalExpense).toLocaleString('id-ID')} (${savingsRate.toFixed(1)}% disimpan)

---

### 💳 Analisis Rasio Hutang & Cicilan
Rasio Hutang Anda saat ini adalah **${debtRatio.toFixed(1)}%**.
`;

  if (debtStatus === 'sehat') {
    reportMarkdown += `
- **Status:** **AMAn / SEHAT ✅**
- **Penjelasan:** Porsi pembayaran hutang/cicilan bulanan Anda (Rp ${totalMonthlyDebt.toLocaleString('id-ID')}) berada di bawah batas maksimal 30% dari pemasukan. Ini adalah pertanda sangat baik bahwa Anda memiliki ruang bernapas yang cukup lebar untuk tabungan dan investasi masa depan. Pertahankan! 👍
`;
  } else if (debtStatus === 'waspada') {
    reportMarkdown += `
- **Status:** **PERLU WASPADA ⚠️**
- **Penjelasan:** Porsi pembayaran hutang/cicilan bulanan Anda (Rp ${totalMonthlyDebt.toLocaleString('id-ID')}) sudah mendekati batas kritis (30% - 35%). Anda disarankan untuk tidak menambah cicilan baru dalam waktu dekat agar tidak mengganggu arus kas primer Anda.
`;
  } else {
    reportMarkdown += `
- **Status:** **KRITIS / BAHAYA 🚨**
- **Penjelasan:** Rasio cicilan bulanan Anda mencapai **${debtRatio.toFixed(1)}%** (di atas batas aman 35%). Sebagian besar pemasukan Anda habis untuk membayar cicilan/hutang (Rp ${totalMonthlyDebt.toLocaleString('id-ID')}). Ini posisi yang sangat rentan. Anda disarankan melakukan restrukturisasi cicilan, menunda belanja non-primer, dan segera mencari pendapatan tambahan (*side hustle*).
`;
  }

  reportMarkdown += `
---

### 🎯 Evaluasi Pembagian Pos Anggaran (Budgeting)
`;

  if (budgets.length === 0) {
    reportMarkdown += `Anda belum mengalokasikan anggaran Anda ke dalam pos-pos (*buckets*). Kami sangat merekomendasikan Anda untuk mulai memisahkan dana dengan membuat pos anggaran di menu Budgeting agar pengeluaran lebih terarah! 📝\n`;
  } else {
    reportMarkdown += `Anda memiliki **${budgets.length} pos budget aktif** dengan total alokasi Rp ${budgets.reduce((sum, b) => sum + b.allocated, 0).toLocaleString('id-ID')}.\n\n`;
    
    if (overbudgetCount > 0) {
      reportMarkdown += `⚠️ **Pos yang Melebihi Anggaran (Overbudget):**\n`;
      overbudgetBuckets.forEach(b => {
        const overLimit = b.spent - b.allocated;
        reportMarkdown += `- **Pos ${b.name}:** Overbudget sebesar **Rp ${overLimit.toLocaleString('id-ID')}** (Terpakai Rp ${b.spent.toLocaleString('id-ID')} dari jatah Rp ${b.allocated.toLocaleString('id-ID')}).\n`;
      });
      reportMarkdown += `\n**Rekomendasi Kontrol:** Untuk pos yang terlanjur overbudget, di sisa bulan ini Anda harus memangkas pengeluaran dari pos santai lainnya (seperti jajan/hiburan) untuk menutupi selisihnya. Jangan ambil dari pos dana darurat ya!\n`;
    } else {
      reportMarkdown += `🎉 **Luar Biasa!** Semua pos anggaran Anda berada di zona aman. Tidak ada pos budget yang overbudget di sisa bulan ini. Disiplin luar biasa yang wajib Anda pertahankan! 🏆\n`;
    }
  }

  reportMarkdown += `
---

### 💡 3 Saran Konkret Untuk Meningkatkan Keuangan Anda:
1. **Lakukan Auto-Debet Tabungan di Awal Gaji:** Jangan menabung dari uang "sisa" akhir bulan, melainkan langsung pos-kan minimal 10-20% pemasukan di awal bulan ke rekening terpisah untuk mengamankan tabungan masa depan.
2. **Kendalikan Pengeluaran Impulsif di Kategori Santai:** Batasi jajan kuliner trendi dan belanja online dadakan. Gunakan prinsip *delay gratification* — tunggu 24 jam sebelum memutuskan untuk membeli barang non-kebutuhan.
3. **Optimalkan Rasio Hutang ke Aset Produktif:** Pastikan cicilan yang Anda miliki saat ini adalah demi modal usaha atau aset yang nilainya bertumbuh (rumah/tanah), bukan hanya cicilan konsumtif barang elektronik yang nilainya terus turun.

*Semangat Kak! SakuPintar siap membantumu mencapai kebebasan finansial langkah demi langkah! 🚀💪*
`;

  return {
    id: 'report_' + Date.now(),
    timestamp: new Date().toISOString(),
    totalIncome,
    totalExpense,
    debtRatio,
    debtStatus,
    healthScore,
    markdownReport: reportMarkdown
  };
}
