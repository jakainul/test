export interface Salary {
  id: number;
  amount: number;
  month: string;
  year: number;
  created_at: string;
}

export interface Expense {
  id: number;
  amount: number;
  description: string;
  category: string;
  month: string;
  year: number;
  created_at: string;
}

export interface BudgetSummary {
  totalSalaries: number;
  totalExpenses: number;
  balance: number;
}