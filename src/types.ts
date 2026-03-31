export interface Transaction {
  id: string;
  date: string;
  type: 'MPESA' | 'UTILITY' | 'SMS_BUSINESS';
  amount: number;
  description: string;
  category: 'INCOME' | 'EXPENSE';
}

export interface CreditAnalysis {
  score: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  reasoning: string;
  recommendations: string[];
  metrics: {
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
    consistencyScore: number;
  };
}
