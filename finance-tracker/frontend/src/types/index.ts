export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  type: 'income' | 'expense';
  created_at: string;
}

export interface Transaction {
  id: number;
  amount: number;
  description: string;
  transaction_date: string;
  type: 'income' | 'expense';
  created_at: string;
  updated_at?: string;
  category_name: string;
  category_color: string;
  category_icon: string;
  category_id?: number;
}

export interface Budget {
  id: number;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at?: string;
  category_name: string;
  category_color: string;
  category_icon: string;
  category_id: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

export interface TransactionSummary {
  summary: {
    income: number;
    expenses: number;
    balance: number;
    transactionCount: number;
  };
  categoryBreakdown: Array<{
    name: string;
    color: string;
    icon: string;
    type: 'income' | 'expense';
    total: number;
    count: number;
  }>;
  recentTransactions: Transaction[];
}

export interface CreateTransactionData {
  amount: number;
  description: string;
  categoryId: number;
  transactionDate: string;
  type: 'income' | 'expense';
}

export interface CreateCategoryData {
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
}

export interface CreateBudgetData {
  categoryId: number;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
}