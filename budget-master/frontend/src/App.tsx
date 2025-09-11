import React, { useState, useEffect } from 'react';
import './index.css';
import SalaryForm from './components/SalaryForm';
import ExpenseForm from './components/ExpenseForm';
import SavingsForm from './components/SavingsForm';
import BudgetSummary from './components/BudgetSummary';
import SalaryList from './components/SalaryList';
import ExpenseList from './components/ExpenseList';
import SavingsList from './components/SavingsList';
import ExpenseSummary from './components/ExpenseSummary';
import SavingsSummary from './components/SavingsSummary';
import Toast from './components/Toast';
import { getSalaries, getExpenses, getSavings, getBudgetSummary } from './api';
import { Salary, Expense, Savings, BudgetSummary as BudgetSummaryType } from './types';

function App() {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savings, setSavings] = useState<Savings[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummaryType>({
    totalSalaries: 0,
    totalExpenses: 0,
    balance: 0
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    try {
      const [salariesData, expensesData, savingsData, summaryData] = await Promise.all([
        getSalaries(),
        getExpenses(),
        getSavings(),
        getBudgetSummary()
      ]);
      
      setSalaries(salariesData);
      setExpenses(expensesData);
      setSavings(savingsData);
      setBudgetSummary(summaryData);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Error loading data. Please make sure the backend server is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDataChange = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Loading Budget Master...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>💰 Budget Master</h1>
        <p>Track your monthly salaries and expenses with ease</p>
      </div>

      <BudgetSummary summary={budgetSummary} />

      <div className="grid">
        <SalaryForm onSalaryAdded={handleDataChange} showToast={showToast} />
        <ExpenseForm onExpenseAdded={handleDataChange} showToast={showToast} />
      </div>

      <div className="grid">
        <SalaryList salaries={salaries} onSalaryDeleted={handleDataChange} showToast={showToast} />
        <ExpenseList expenses={expenses} onExpenseDeleted={handleDataChange} showToast={showToast} />
      </div>

      <ExpenseSummary expenses={expenses} />
      
      {/* Savings Section */}
      <hr className="section-divider" />
      
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', color: '#059669', marginBottom: '8px' }}>💎 Savings & Investments</h2>
        <p style={{ fontSize: '1.1rem', color: '#6b7280' }}>Track your ETFs, stocks, and savings account</p>
      </div>

      <div className="grid">
        <SavingsForm onSavingsAdded={handleDataChange} showToast={showToast} />
        <SavingsList savings={savings} onSavingsDeleted={handleDataChange} showToast={showToast} />
      </div>

      <SavingsSummary savings={savings} />
      
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}

export default App;