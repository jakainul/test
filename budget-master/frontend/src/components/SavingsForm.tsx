import React, { useState } from 'react';
import { addSavingsAllocation } from '../api';

interface SavingsFormProps {
  onSavingsAdded: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const SavingsForm: React.FC<SavingsFormProps> = ({ onSavingsAdded, showToast }) => {
  const [totalAmount, setTotalAmount] = useState('');
  const [description, setDescription] = useState('');
  const [etfPercentage, setEtfPercentage] = useState(40);
  const [stockPercentage, setStockPercentage] = useState(30);
  const [savingsPercentage, setSavingsPercentage] = useState(30);
  const [monthlyDistribution, setMonthlyDistribution] = useState(1);
  const [startMonth, setStartMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Auto-adjust percentages to sum to 100
  const adjustPercentages = (changedSlider: 'etf' | 'stock' | 'savings', newValue: number) => {
    const total = etfPercentage + stockPercentage + savingsPercentage;
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
    const total = parseFloat(totalAmount) || 0;
    const monthlyTotal = total / monthlyDistribution;
    
    return {
      totalETF: (total * etfPercentage) / 100,
      totalStock: (total * stockPercentage) / 100,
      totalSavings: (total * savingsPercentage) / 100,
      monthlyETF: (monthlyTotal * etfPercentage) / 100,
      monthlyStock: (monthlyTotal * stockPercentage) / 100,
      monthlySavings: (monthlyTotal * savingsPercentage) / 100,
    };
  };

  const amounts = calculateAmounts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!totalAmount || !startMonth || !year) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (!isValidPercentage) {
      showToast('Percentages must sum to 100%', 'error');
      return;
    }

    if (parseFloat(totalAmount) <= 0) {
      showToast('Total amount must be greater than 0', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addSavingsAllocation({
        totalAmount: parseFloat(totalAmount),
        description,
        etfPercentage,
        stockPercentage,
        savingsPercentage,
        monthlyDistribution,
        startMonth,
        year: parseInt(year)
      });
      
      const savingsDesc = description ? ` for ${description}` : '';
      setTotalAmount('');
      setDescription('');
      setEtfPercentage(40);
      setStockPercentage(30);
      setSavingsPercentage(30);
      setMonthlyDistribution(1);
      setStartMonth('');
      setYear(new Date().getFullYear().toString());
      
      showToast(
        `Successfully created ${result.entries.length} savings entries totaling €${parseFloat(totalAmount).toFixed(2)}${savingsDesc}!`, 
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
          <label htmlFor="total-amount">Total Amount (€)</label>
          <input
            id="total-amount"
            type="number"
            step="0.01"
            min="0"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            placeholder="Enter total savings amount"
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

        {/* Monthly Distribution */}
        <div className="form-group">
          <label htmlFor="monthly-distribution">Distribute over months</label>
          <div className="slider-container">
            <div className="slider-header">
              <span className="slider-label">Number of months</span>
              <span className="slider-value">{monthlyDistribution} month{monthlyDistribution !== 1 ? 's' : ''}</span>
            </div>
            <input
              id="monthly-distribution"
              type="range"
              min="1"
              max="12"
              value={monthlyDistribution}
              onChange={(e) => setMonthlyDistribution(parseInt(e.target.value))}
              className="slider"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="start-month">Starting Month</label>
          <select
            id="start-month"
            value={startMonth}
            onChange={(e) => setStartMonth(e.target.value)}
            required
          >
            <option value="">Select starting month</option>
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

        {/* Allocation Preview */}
        {totalAmount && parseFloat(totalAmount) > 0 && (
          <div className="allocation-preview">
            <div className="allocation-title">Allocation Preview</div>
            <div className="allocation-grid">
              <div className="allocation-item">
                <div className="allocation-category">ETFs</div>
                <div className="allocation-amount">€{amounts.totalETF.toFixed(2)}</div>
              </div>
              <div className="allocation-item">
                <div className="allocation-category">Stocks</div>
                <div className="allocation-amount">€{amounts.totalStock.toFixed(2)}</div>
              </div>
              <div className="allocation-item">
                <div className="allocation-category">Savings</div>
                <div className="allocation-amount">€{amounts.totalSavings.toFixed(2)}</div>
              </div>
            </div>
            
            {monthlyDistribution > 1 && (
              <div className="monthly-breakdown">
                <div className="monthly-breakdown-title">Monthly Breakdown</div>
                <div className="monthly-breakdown-grid">
                  <div className="monthly-breakdown-item">
                    ETFs<br />
                    <span className="monthly-breakdown-amount">€{amounts.monthlyETF.toFixed(2)}/month</span>
                  </div>
                  <div className="monthly-breakdown-item">
                    Stocks<br />
                    <span className="monthly-breakdown-amount">€{amounts.monthlyStock.toFixed(2)}/month</span>
                  </div>
                  <div className="monthly-breakdown-item">
                    Savings<br />
                    <span className="monthly-breakdown-amount">€{amounts.monthlySavings.toFixed(2)}/month</span>
                  </div>
                </div>
              </div>
            )}
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