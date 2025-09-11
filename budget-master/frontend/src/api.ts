import axios from 'axios';
import { Salary, Expense, BudgetSummary, Savings } from './types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

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

// Savings API calls
export const getSavings = async (): Promise<Savings[]> => {
  const response = await api.get('/savings');
  return response.data;
};

export const addSavings = async (savings: Omit<Savings, 'id' | 'created_at'>): Promise<Savings> => {
  const response = await api.post('/savings', savings);
  return response.data;
};

export const deleteSavings = async (id: number): Promise<void> => {
  await api.delete(`/savings/${id}`);
};

// Budget summary
export const getBudgetSummary = async (): Promise<BudgetSummary> => {
  const response = await api.get('/budget-summary');
  return response.data;
};