import React from 'react';
import { Expense } from '../types';
import { deleteExpense } from '../api';

interface ExpenseListProps {
  expenses: Expense[];
  onExpenseDeleted: () => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onExpenseDeleted }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense entry?')) {
      try {
        await deleteExpense(id);
        onExpenseDeleted();
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Error deleting expense. Please try again.');
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
      {expenses.map((expense) => (
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
              <div>
                {expense.month} {expense.year}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleDelete(expense.id)}
            className="btn btn-danger"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;