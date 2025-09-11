import React, { useState } from 'react';
import { addSavings } from '../api';

interface SavingsFormProps {
  onSavingsAdded: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const SavingsForm: React.FC<SavingsFormProps> = ({ onSavingsAdded, showToast }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'ETFs' | 'Stocks' | 'Savings Account' | ''>('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const categories: Array<'ETFs' | 'Stocks' | 'Savings Account'> = [
    'ETFs',
    'Stocks', 
    'Savings Account'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !month || !year) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await addSavings({
        amount: parseFloat(amount),
        description,
        category,
        month,
        year: parseInt(year)
      });
      
      const savingsDesc = description ? ` for ${description}` : '';
      setAmount('');
      setDescription('');
      setCategory('');
      setMonth('');
      setYear(new Date().getFullYear().toString());
      showToast(`${category} savings of €${parseFloat(amount).toFixed(2)}${savingsDesc} added successfully!`, 'success');
      onSavingsAdded();
    } catch (error) {
      console.error('Error adding savings:', error);
      showToast('Error adding savings entry. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '20px', color: '#059669' }}>Add Savings Entry</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="savings-amount">Amount (€)</label>
          <input
            id="savings-amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter savings amount"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="savings-description">Description (optional)</label>
          <input
            id="savings-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter savings description"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="savings-category">Category</label>
          <select
            id="savings-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as 'ETFs' | 'Stocks' | 'Savings Account')}
            required
          >
            <option value="">Select category</option>
            {categories.map((categoryName) => (
              <option key={categoryName} value={categoryName}>
                {categoryName}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="savings-month">Month</label>
          <select
            id="savings-month"
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
          <label htmlFor="savings-year">Year</label>
          <input
            id="savings-year"
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
          {isSubmitting ? 'Adding...' : 'Add Savings'}
        </button>
      </form>
    </div>
  );
};

export default SavingsForm;