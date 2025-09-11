import axios from 'axios';
import { Salary, Expense, BudgetSummary } from './types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Salary API calls
export const getSalaries = async (): Promise<Salary[]> => {
  const response = await api.get('/salaries');
  return response.data;
};

export const addSalary = async (salary: Omit<Salary, 'id' | 'created_at'>): Promise<Salary> => {
  const response = await api.post('/salaries', salary);
  return response.data;
};

export const deleteSalary = async (id: number): Promise<void> => {
  await api.delete(`/salaries/${id}`);
};

// Expense API calls
export const getExpenses = async (): Promise<Expense[]> => {
  const response = await api.get('/expenses');
  return response.data;
};

export const addExpense = async (expense: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> => {
  const response = await api.post('/expenses', expense);
  return response.data;
};

export const deleteExpense = async (id: number): Promise<void> => {
  await api.delete(`/expenses/${id}`);
};

// Budget summary
export const getBudgetSummary = async (): Promise<BudgetSummary> => {
  const response = await api.get('/budget-summary');
  return response.data;
};