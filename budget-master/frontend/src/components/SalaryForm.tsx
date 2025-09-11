import React, { useState } from 'react';
import { addSalary } from '../api';

interface SalaryFormProps {
  onSalaryAdded: () => void;
}

const SalaryForm: React.FC<SalaryFormProps> = ({ onSalaryAdded }) => {
  const [amount, setAmount] = useState('');
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
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await addSalary({
        amount: parseFloat(amount),
        month,
        year: parseInt(year)
      });
      
      setAmount('');
      setMonth('');
      setYear(new Date().getFullYear().toString());
      onSalaryAdded();
    } catch (error) {
      console.error('Error adding salary:', error);
      alert('Error adding salary. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '20px', color: '#059669' }}>Add Monthly Salary</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="salary-amount">Amount (€)</label>
          <input
            id="salary-amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter salary amount"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="salary-month">Month</label>
          <select
            id="salary-month"
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
          <label htmlFor="salary-year">Year</label>
          <input
            id="salary-year"
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
          {isSubmitting ? 'Adding...' : 'Add Salary'}
        </button>
      </form>
    </div>
  );
};

export default SalaryForm;