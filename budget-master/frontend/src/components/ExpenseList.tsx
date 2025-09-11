import React, { useState, useMemo } from 'react';
import { Expense } from '../types';
import { deleteExpense } from '../api';
import ExpenseFilter from './ExpenseFilter';

interface ExpenseListProps {
  expenses: Expense[];
  onExpenseDeleted: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onExpenseDeleted, showToast }) => {
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

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const categoryMatch = selectedCategory === 'All Categories' || 
                           expense.category === selectedCategory ||
                           (!expense.category && selectedCategory === 'Other');
      const monthMatch = selectedMonth === 'All Months' || expense.month === selectedMonth;
      const yearMatch = selectedYear === 'All Years' || expense.year.toString() === selectedYear;
      
      return categoryMatch && monthMatch && yearMatch;
    });
  }, [expenses, selectedCategory, selectedMonth, selectedYear]);

  const handleDelete = async (id: number, expense: Expense) => {
    if (window.confirm('Are you sure you want to delete this expense entry?')) {
      try {
        await deleteExpense(id);
        const desc = expense.description ? ` (${expense.description})` : '';
        showToast(`Expense entry for ${expense.month} ${expense.year}${desc} deleted successfully!`, 'success');
        onExpenseDeleted();
      } catch (error) {
        console.error('Error deleting expense:', error);
        showToast('Error deleting expense. Please try again.', 'error');
      }
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="card">
        <h3 style={{ color: '#dc2626', marginBottom: '16px' }}>Expense Entries</h3>
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
          No expense entries yet. Add your first expense above!
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ color: '#dc2626', marginBottom: '16px' }}>Expense Entries</h3>
      
      <ExpenseFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
      />

      {filteredExpenses.length === 0 ? (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
          No expenses match the selected filters.
        </p>
      ) : (
        filteredExpenses.map((expense) => (
        <div key={expense.id} className="list-item">
          <div className="list-item-info">
            <div className="list-item-amount list-item-expense">
              {formatCurrency(expense.amount)}
            </div>
            <div className="list-item-meta">
              {expense.description && (
                <div style={{ fontWeight: '500', color: '#374151' }}>
                  {expense.description}
                </div>
              )}
              {expense.category && (
                <div className="expense-category">
                  📁 {expense.category}
                </div>
              )}
              <div>
                {expense.month} {expense.year}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleDelete(expense.id, expense)}
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

export default ExpenseList;