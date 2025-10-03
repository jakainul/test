import React, { useState } from 'react';
import { addSavingsAllocation } from '../api';

interface SavingsFormProps {
  onSavingsAdded: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const SavingsForm: React.FC<SavingsFormProps> = ({ onSavingsAdded, showToast }) => {
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [description, setDescription] = useState('');
  const [etfPercentage, setEtfPercentage] = useState(40);
  const [stockPercentage, setStockPercentage] = useState(30);
  const [savingsPercentage, setSavingsPercentage] = useState(30);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Auto-adjust percentages to sum to 100
  const adjustPercentages = (changedSlider: 'etf' | 'stock' | 'savings', newValue: number) => {
    const remaining = 100 - newValue;
    
    if (changedSlider === 'etf') {
      const otherTotal = stockPercentage + savingsPercentage;
      if (otherTotal > 0) {
        const stockRatio = stockPercentage / otherTotal;
        const savingsRatio = savingsPercentage / otherTotal;
        setEtfPercentage(newValue);
        setStockPercentage(Math.round(remaining * stockRatio));
        setSavingsPercentage(Math.round(remaining * savingsRatio));
      } else {
        setEtfPercentage(newValue);
        setStockPercentage(Math.round(remaining / 2));
        setSavingsPercentage(remaining - Math.round(remaining / 2));
      }
    } else if (changedSlider === 'stock') {
      const otherTotal = etfPercentage + savingsPercentage;
      if (otherTotal > 0) {
        const etfRatio = etfPercentage / otherTotal;
        const savingsRatio = savingsPercentage / otherTotal;
        setStockPercentage(newValue);
        setEtfPercentage(Math.round(remaining * etfRatio));
        setSavingsPercentage(Math.round(remaining * savingsRatio));
      } else {
        setStockPercentage(newValue);
        setEtfPercentage(Math.round(remaining / 2));
        setSavingsPercentage(remaining - Math.round(remaining / 2));
      }
    } else if (changedSlider === 'savings') {
      const otherTotal = etfPercentage + stockPercentage;
      if (otherTotal > 0) {
        const etfRatio = etfPercentage / otherTotal;
        const stockRatio = stockPercentage / otherTotal;
        setSavingsPercentage(newValue);
        setEtfPercentage(Math.round(remaining * etfRatio));
        setStockPercentage(Math.round(remaining * stockRatio));
      } else {
        setSavingsPercentage(newValue);
        setEtfPercentage(Math.round(remaining / 2));
        setStockPercentage(remaining - Math.round(remaining / 2));
      }
    }
  };

  const totalPercentage = etfPercentage + stockPercentage + savingsPercentage;
  const isValidPercentage = Math.abs(totalPercentage - 100) < 1;

  const calculateAmounts = () => {
    const monthly = parseFloat(monthlyAmount) || 0;
    
    return {
      monthlyETF: (monthly * etfPercentage) / 100,
      monthlyStock: (monthly * stockPercentage) / 100,
      monthlySavings: (monthly * savingsPercentage) / 100,
    };
  };

  const amounts = calculateAmounts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!monthlyAmount || !selectedMonth || !year) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (!isValidPercentage) {
      showToast('Percentages must sum to 100%', 'error');
      return;
    }

    if (parseFloat(monthlyAmount) <= 0) {
      showToast('Monthly amount must be greater than 0', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addSavingsAllocation({
        monthlyAmount: parseFloat(monthlyAmount),
        description,
        etfPercentage,
        stockPercentage,
        savingsPercentage,
        selectedMonth,
        year: parseInt(year)
      });
      
      const savingsDesc = description ? ` for ${description}` : '';
      setMonthlyAmount('');
      setDescription('');
      setEtfPercentage(40);
      setStockPercentage(30);
      setSavingsPercentage(30);
      setSelectedMonth('');
      setYear(new Date().getFullYear().toString());
      
      showToast(
        `Successfully created ${result.entries.length} savings entries for ${selectedMonth} ${year}${savingsDesc}!`, 
        'success'
      );
      onSavingsAdded();
    } catch (error) {
      console.error('Error adding savings allocation:', error);
      showToast('Error creating savings allocation. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '20px', color: '#059669' }}>Add Savings Allocation</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="monthly-amount">Monthly Amount (€)</label>
          <input
            id="monthly-amount"
            type="number"
            step="0.01"
            min="0"
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(e.target.value)}
            placeholder="Enter monthly savings amount"
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
          <label htmlFor="selected-month">Month</label>
          <select
            id="selected-month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
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
            max={new Date().getFullYear() + 10}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />
        </div>

        {/* Percentage Sliders */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: '#374151' }}>Allocation Percentages</h3>
          
          <div className="slider-container">
            <div className="slider-header">
              <span className="slider-label">ETFs</span>
              <span className="slider-value">{etfPercentage}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={etfPercentage}
              onChange={(e) => adjustPercentages('etf', parseInt(e.target.value))}
              className="slider"
            />
          </div>

          <div className="slider-container">
            <div className="slider-header">
              <span className="slider-label">Stocks</span>
              <span className="slider-value">{stockPercentage}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={stockPercentage}
              onChange={(e) => adjustPercentages('stock', parseInt(e.target.value))}
              className="slider"
            />
          </div>

          <div className="slider-container">
            <div className="slider-header">
              <span className="slider-label">Savings Account</span>
              <span className="slider-value">{savingsPercentage}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={savingsPercentage}
              onChange={(e) => adjustPercentages('savings', parseInt(e.target.value))}
              className="slider"
            />
          </div>

          <div className={`percentage-total ${isValidPercentage ? 'valid' : 'invalid'}`}>
            Total: {totalPercentage}%
          </div>
        </div>

        {/* Allocation Preview */}
        {monthlyAmount && parseFloat(monthlyAmount) > 0 && (
          <div className="allocation-preview">
            <div className="allocation-title">Monthly Allocation Preview</div>
            <div className="allocation-grid">
              <div className="allocation-item">
                <div className="allocation-category">ETFs</div>
                <div className="allocation-amount">€{amounts.monthlyETF.toFixed(2)}</div>
              </div>
              <div className="allocation-item">
                <div className="allocation-category">Stocks</div>
                <div className="allocation-amount">€{amounts.monthlyStock.toFixed(2)}</div>
              </div>
              <div className="allocation-item">
                <div className="allocation-category">Savings</div>
                <div className="allocation-amount">€{amounts.monthlySavings.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting || !isValidPercentage}
        >
          {isSubmitting ? 'Creating Allocation...' : 'Create Savings Allocation'}
        </button>
      </form>
    </div>
  );
};

export default SavingsForm;