import React, { useMemo } from 'react';
import { Savings } from '../types';

interface SavingsSummaryProps {
  savings: Savings[];
}

const SavingsSummary: React.FC<SavingsSummaryProps> = ({ savings }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ETFs':
        return '📊';
      case 'Stocks':
        return '📈';
      case 'Savings Account':
        return '🏦';
      default:
        return '💰';
    }
  };

  const categoryTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    
    savings.forEach(saving => {
      const category = saving.category;
      totals[category] = (totals[category] || 0) + saving.amount;
    });

    return Object.entries(totals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [savings]);

  const totalSavings = savings.reduce((sum, saving) => sum + saving.amount, 0);

  if (savings.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <h3 style={{ color: '#059669', marginBottom: '16px' }}>💎 Savings Summary by Category</h3>
      
      <div className="summary-total" style={{ 
        backgroundColor: '#f0fdf4', 
        border: '1px solid #bbf7d0', 
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '14px', color: '#059669', marginBottom: '4px' }}>
          Total Savings
        </div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#065f46' }}>
          {formatCurrency(totalSavings)}
        </div>
      </div>

      <div className="summary-grid">
        {categoryTotals.map(({ category, amount }) => {
          const percentage = totalSavings > 0 ? (amount / totalSavings) * 100 : 0;
          
          return (
            <div key={category} className="summary-item">
              <div className="summary-header">
                <span className="category-name">
                  {getCategoryIcon(category)} {category}
                </span>
                <span className="category-amount">{formatCurrency(amount)}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill savings-progress" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="percentage">
                {percentage.toFixed(1)}% of total savings
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SavingsSummary;