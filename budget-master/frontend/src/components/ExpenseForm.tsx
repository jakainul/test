import React, { useState } from 'react';
import { addExpense } from '../api';

interface ExpenseFormProps {
  onExpenseAdded: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onExpenseAdded }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !month || !year) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await addExpense({
        amount: parseFloat(amount),
        description,
        month,
        year: parseInt(year)
      });
      
      setAmount('');
      setDescription('');
      setMonth('');
      setYear(new Date().getFullYear().toString());
      onExpenseAdded();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Error adding expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '20px', color: '#dc2626' }}>Add Monthly Expense</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="expense-amount">Amount (€)</label>
          <input
            id="expense-amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter expense amount"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="expense-description">Description (optional)</label>
          <input
            id="expense-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter expense description"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="expense-month">Month</label>
          <select
            id="expense-month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
          >
            <option value="">Select month</option>
            {months.map((monthName) => (
              <option key={monthName} value={monthName}>
                {monthName}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="expense-year">Year</label>
          <input
            id="expense-year"
            type="number"
            min="2020"
            max="2030"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;