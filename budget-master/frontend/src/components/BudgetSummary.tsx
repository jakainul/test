import React from 'react';
import { BudgetSummary as BudgetSummaryType } from '../types';

interface BudgetSummaryProps {
  summary: BudgetSummaryType;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ summary }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="card budget-summary-card">
      <div className="totals-grid">
        <div className="total-card total-income">
          <div className="total-amount">{formatCurrency(summary.totalSalaries)}</div>
          <div className="total-label">Total Salaries</div>
        </div>
      </div>
    </div>
  );
};

export default BudgetSummary;