import React, { useState, useEffect } from 'react';
import './index.css';
import SalaryForm from './components/SalaryForm';
import ExpenseForm from './components/ExpenseForm';
import BudgetSummary from './components/BudgetSummary';
import SalaryList from './components/SalaryList';
import ExpenseList from './components/ExpenseList';
import ExpenseSummary from './components/ExpenseSummary';
import Toast from './components/Toast';
import { getSalaries, getExpenses, getBudgetSummary } from './api';
import { Salary, Expense, BudgetSummary as BudgetSummaryType } from './types';

function App() {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
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
      const [salariesData, expensesData, summaryData] = await Promise.all([
        getSalaries(),
        getExpenses(),
        getBudgetSummary()
      ]);
      
      setSalaries(salariesData);
      setExpenses(expensesData);
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