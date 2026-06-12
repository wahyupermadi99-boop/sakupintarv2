/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini API client safely
  let ai: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // API endpoint for AI Financial Health Diagnostic
  app.post("/api/analyze", async (req, res) => {
    try {
      const { transactions, budgets, debts, totalIncome, totalExpense } = req.body;

      if (!ai) {
        return res.status(503).json({
          error: "Gemini API Key is not configured on the server. Continuing in local-analysis mode."
        });
      }

      const transactionSummary = transactions && transactions.length > 0
        ? transactions.map((t: any) => `- ${t.date} | [${t.type.toUpperCase()}] ${t.description || 'Tanpa keterangan'} | Rp ${t.amount.toLocaleString('id-ID')} | Pos: ${t.category}`).join("\n")
        : "Tidak ada transaksi bulan ini.";

      const budgetSummary = budgets && budgets.length > 0
        ? budgets.map((b: any) => `- Pos ${b.name}: Alokasi Rp ${b.allocated.toLocaleString('id-ID')} | Terpakai Rp ${b.spent.toLocaleString('id-ID')} | Status: ${b.spent > b.allocated ? 'Overbudget' : 'Aman'}`).join("\n")
        : "Belum membuat pos budget.";

      const debtSummary = debts && debts.length > 0
        ? debts.map((d: any) => `- ${d.name}: Cicilan Rp ${d.monthlyPayment.toLocaleString('id-ID')}/bulan (Sisa Hutang: Rp ${d.totalAmount.toLocaleString('id-ID')})`).join("\n")
        : "Tidak memiliki hutang/cicilan.";

      const totalMonthlyDebt = debts ? debts.reduce((sum: number, d: any) => sum + d.monthlyPayment, 0) : 0;
      const debtRatio = totalIncome > 0 ? (totalMonthlyDebt / totalIncome) * 100 : 0;

      const prompt = `
Anda adalah seorang Financial Planner & Konsultan Keuangan Pribdi Terbaik di Indonesia.
Analisis data keuangan pribadi pengguna berikut ini secara mendalam, cerdas, ramah, enerjik dan penuh motivasi. Berikan evaluasi rasio keuangan, kesehatan pos belanja, dan saran taktis yang konkret.

### DATA KEUANGAN PENGGUNA:
- **Total Pemasukan Bulan ini**: Rp ${totalIncome.toLocaleString('id-ID')}
- **Total Pengeluaran Bulan ini**: Rp ${totalExpense.toLocaleString('id-ID')}
- **Rasio Hutang Bulanan**: ${debtRatio.toFixed(1)}% (Total cicilan bulanan: Rp ${totalMonthlyDebt.toLocaleString('id-ID')} dari Total Pemasukan)

### BREAKDOWN BUDGET / POS PADA GAJI:
${budgetSummary}

### RINCIAN HUTANG & CICILAN:
${debtSummary}

### HISTORI TRANSAKSI BULAN INI:
${transactionSummary}

---
### TUGAS ANALISIS ANDA:
1. **Analisis Kesehatan Finansial**: Berikan skor kesehatan finansial keseluruhan (0 s.d 100) dan berikan argumen singkat di baliknya.
2. **Evaluasi Budget**: Berikan analisis pos-pos anggaran mana yang bermasalah (overbudget) dan bagaimana cara menanganinya secara konkret. Apakah pembagian pos gaji sudah ideal (misal 50% Kebutuhan, 30% Keinginan, 20% Tabungan)?
3. **Analisis Rasio Hutang**: Berikan status rasio hutang saat ini:
   - Di bawah 30%: Sehat (Aman).
   - 30% - 35%: Batas Waspada.
   - Di atas 35%: Bahaya / Kritis (Harus direstrukturisasi).
4. **3 Rekomendasi Paling Konkret & Taktis (Actionable Advice)**: Berikan saran praktis, hemat, dan kreatif untuk meningkatkan kesehatan keuangan pengguna di bulan depan. Gunakan sapaan yang ramah, hangat, dan informatif.

### FORMAT OUTPUT (Kembalikan HARUS dalam format JSON murni berstruktur persis berikut ini, NO wrapper, NO markdown formatting di luar JSON, NO escape error):
{
  "healthScore": <integer 0-100>,
  "debtRatio": <float rasio hutang persen>,
  "debtStatus": "<sehat | waspada | bahaya>",
  "reportMarkdown": "<String berformat Markdown lengkap, gunakan emoji, sub-judul, bullet points, dan tip taktis>"
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Model generated an empty response");
      }

      const analysisData = JSON.parse(responseText.trim());
      res.json(analysisData);

    } catch (error: any) {
      console.error("Gemini Analysis Server Error:", error);
      res.status(500).json({ error: error?.message || "Terjadi kesalahan saat meminta analisis AI." });
    }
  });

  // Serve static assets or use Vite dev middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
