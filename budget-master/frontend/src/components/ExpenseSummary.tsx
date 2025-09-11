import React, { useMemo } from 'react';
import { Expense } from '../types';

interface ExpenseSummaryProps {
  expenses: Expense[];
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ expenses }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const categoryTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      const category = expense.category || 'Other';
      totals[category] = (totals[category] || 0) + expense.amount;
    });

    return Object.entries(totals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (expenses.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <h3 style={{ color: '#7c3aed', marginBottom: '16px' }}>💰 Expense Summary by Category</h3>
      
      <div className="summary-grid">
        {categoryTotals.map(({ category, amount }) => {
          const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
          
          return (
            <div key={category} className="summary-item">
              <div className="summary-header">
                <span className="category-name">{category}</span>
                <span className="category-amount">{formatCurrency(amount)}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="percentage">
                {percentage.toFixed(1)}% of total expenses
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseSummary;