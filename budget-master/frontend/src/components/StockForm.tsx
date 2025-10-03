import React, { useState } from 'react';

interface StockFormProps {
  onAddStock: (ticker: string) => Promise<void>;
  isAdding: boolean;
}

const StockForm: React.FC<StockFormProps> = ({ onAddStock, isAdding }) => {
  const [ticker, setTicker] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedTicker = ticker.trim().toUpperCase();
    
    if (!trimmedTicker) {
      setError('Please enter a ticker symbol');
      return;
    }

    if (!/^[A-Z]{1,5}$/.test(trimmedTicker)) {
      setError('Ticker must be 1-5 letters only');
      return;
    }

    try {
      await onAddStock(trimmedTicker);
      setTicker('');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add ticker');
    }
  };

  return (
    <div className="stock-form">
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Enter ticker (e.g., AAPL)"
            maxLength={5}
            disabled={isAdding}
            className="stock-input"
          />
          <button 
            type="submit" 
            disabled={isAdding || !ticker.trim()}
            className="btn-primary"
          >
            {isAdding ? 'Adding...' : 'Add to Watchlist'}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default StockForm;
