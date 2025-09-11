import React, { useState, useEffect } from 'react';
import './index.css';
import SalaryForm from './components/SalaryForm';
import ExpenseForm from './components/ExpenseForm';
import BudgetSummary from './components/BudgetSummary';
import SalaryList from './components/SalaryList';
import ExpenseList from './components/ExpenseList';
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
      alert('Error loading data. Please make sure the backend server is running.');
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
        <SalaryForm onSalaryAdded={handleDataChange} />
        <ExpenseForm onExpenseAdded={handleDataChange} />
      </div>

      <div className="grid">
        <SalaryList salaries={salaries} onSalaryDeleted={handleDataChange} />
        <ExpenseList expenses={expenses} onExpenseDeleted={handleDataChange} />
      </div>
    </div>
  );
}

export default App;