import React, { useState, useMemo } from 'react';
import { Savings } from '../types';
import { deleteSavings } from '../api';
import SavingsFilter from './SavingsFilter';

interface SavingsListProps {
  savings: Savings[];
  onSavingsDeleted: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const SavingsList: React.FC<SavingsListProps> = ({ savings, onSavingsDeleted, showToast }) => {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedMonth, setSelectedMonth] = useState('All Months');
  const [selectedYear, setSelectedYear] = useState('All Years');

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

  const filteredSavings = useMemo(() => {
    return savings.filter(saving => {
      const categoryMatch = selectedCategory === 'All Categories' || 
                           saving.category === selectedCategory;
      const monthMatch = selectedMonth === 'All Months' || saving.month === selectedMonth;
      const yearMatch = selectedYear === 'All Years' || saving.year.toString() === selectedYear;
      
      return categoryMatch && monthMatch && yearMatch;
    });
  }, [savings, selectedCategory, selectedMonth, selectedYear]);

  const handleDelete = async (id: number, saving: Savings) => {
    if (window.confirm('Are you sure you want to delete this savings entry?')) {
      try {
        await deleteSavings(id);
        const desc = saving.description ? ` (${saving.description})` : '';
        showToast(`${saving.category} entry for ${saving.month} ${saving.year}${desc} deleted successfully!`, 'success');
        onSavingsDeleted();
      } catch (error) {
        console.error('Error deleting savings:', error);
        showToast('Error deleting savings entry. Please try again.', 'error');
      }
    }
  };

  if (savings.length === 0) {
    return (
      <div className="card">
        <h3 style={{ color: '#059669', marginBottom: '16px' }}>Savings Entries</h3>
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
          No savings entries yet. Add your first savings entry above!
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ color: '#059669', marginBottom: '16px' }}>Savings Entries</h3>
      
      <SavingsFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />

      {filteredSavings.length === 0 ? (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
          No savings entries match the selected filters.
        </p>
      ) : (
        filteredSavings.map((saving) => (
        <div key={saving.id} className="list-item">
          <div className="list-item-info">
            <div className="list-item-amount list-item-savings">
              {formatCurrency(saving.amount)}
            </div>
            <div className="list-item-meta">
              {saving.description && (
                <div style={{ fontWeight: '500', color: '#374151' }}>
                  {saving.description}
                </div>
              )}
              <div className="savings-category">
                {getCategoryIcon(saving.category)} {saving.category}
              </div>
              <div>
                {saving.month} {saving.year}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleDelete(saving.id, saving)}
            className="btn btn-danger"
          >
            Delete
          </button>
        </div>
        ))
      )}
    </div>
  );
};

export default SavingsList;