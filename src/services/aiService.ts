import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, CreditAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeCreditworthiness(transactions: Transaction[]): Promise<CreditAnalysis> {
  const prompt = `
    Analyze the following simulated financial transaction data (M-Pesa, Utility payments, SMS business records) 
    to determine creditworthiness for a micro-loan applicant in Kenya.
    
    Transactions:
    ${JSON.stringify(transactions, null, 2)}
    
    Consider:
    1. Income consistency and frequency.
    2. Expense patterns vs income (debt-to-income ratio).
    3. Utility payment regularity (electricity, water).
    4. Business activity if SMS records are present.
    5. Savings behavior.
    
    Provide a credit score (0-1000), risk level, detailed reasoning, and key metrics.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
          reasoning: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          metrics: {
            type: Type.OBJECT,
            properties: {
              monthlyIncome: { type: Type.NUMBER },
              monthlyExpenses: { type: Type.NUMBER },
              savingsRate: { type: Type.NUMBER },
              consistencyScore: { type: Type.NUMBER }
            },
            required: ["monthlyIncome", "monthlyExpenses", "savingsRate", "consistencyScore"]
          }
        },
        required: ["score", "riskLevel", "reasoning", "recommendations", "metrics"]
      }
    }
  });

  return JSON.parse(response.text);
}

export function generateSimulatedData(): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();
  
  // Generate 3 months of data
  for (let i = 0; i < 90; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Monthly Salary/Income
    if (i % 30 === 0) {
      transactions.push({
        id: `inc-${i}`,
        date: dateStr,
        type: 'MPESA',
        amount: 45000 + Math.random() * 5000,
        description: 'Salary Deposit',
        category: 'INCOME'
      });
    }

    // Weekly Utility
    if (i % 7 === 0) {
      transactions.push({
        id: `util-${i}`,
        date: dateStr,
        type: 'UTILITY',
        amount: 1500 + Math.random() * 1000,
        description: 'KPLC Tokens / Water Bill',
        category: 'EXPENSE'
      });
    }

    // Daily Business/Small Transactions
    if (Math.random() > 0.3) {
      const isIncome = Math.random() > 0.6;
      transactions.push({
        id: `biz-${i}`,
        date: dateStr,
        type: Math.random() > 0.5 ? 'MPESA' : 'SMS_BUSINESS',
        amount: Math.random() * 3000,
        description: isIncome ? 'Customer Payment' : 'Supplier Payment',
        category: isIncome ? 'INCOME' : 'EXPENSE'
      });
    }
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
