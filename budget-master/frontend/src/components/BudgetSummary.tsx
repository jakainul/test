import React from 'react';
import { BudgetSummary as BudgetSummaryType } from '../types';

interface BudgetSummaryProps {
  summary: BudgetSummaryType;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ summary }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const isPositive = summary.balance >= 0;

  return (
    <div className="card">
      <div className="totals-grid">
        <div className="total-card total-income">
          <div className="total-amount">{formatCurrency(summary.totalSalaries)}</div>
          <div className="total-label">Total Salaries</div>
        </div>
      </div>
      
      <div className="budget-summary">
        <div 
          className="budget-amount"
          style={{ 
            color: isPositive ? '#10b981' : '#ef4444'
          }}
        >
          {formatCurrency(summary.balance)}
        </div>
        <div className="budget-label">
          Available Budget
        </div>
      </div>
    </div>
  );
};

export default BudgetSummary;