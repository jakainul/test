import React from 'react';
import { StockData } from '../types';

interface StockCardProps {
  stock: StockData;
  loading: boolean;
  error: string | null;
  onDelete: (ticker: string) => void;
}

const StockCard: React.FC<StockCardProps> = ({ stock, loading, error, onDelete }) => {
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  const formatChange = (change: number): string => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };

  const formatChangePercent = (changePercent: number): string => {
    const sign = changePercent >= 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(2)}%`;
  };

  const formatDividendYield = (yield_value?: number): string => {
    if (!yield_value || yield_value === 0) return 'N/A';
    return `${(yield_value * 100).toFixed(2)}%`;
  };

  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const getChangeColor = (change: number): string => {
    if (change > 0) return 'stock-positive';
    if (change < 0) return 'stock-negative';
    return 'stock-neutral';
  };

  if (loading) {
    return (
      <div className="stock-card loading">
        <div className="stock-card-header">
          <h3>{stock.ticker}</h3>
        </div>
        <div className="stock-card-body">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stock-card error">
        <div className="stock-card-header">
          <h3>{stock.ticker}</h3>
          <button 
            className="btn-delete-small"
            onClick={() => onDelete(stock.ticker)}
            title="Remove from watchlist"
          >
            ×
          </button>
        </div>
        <div className="stock-card-body">
          <div className="stock-error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="stock-card">
      <div className="stock-card-header">
        <div className="stock-title">
          <h3>{stock.ticker}</h3>
          {stock.companyName && <span className="company-name">{stock.companyName}</span>}
        </div>
        <button 
          className="btn-delete-small"
          onClick={() => onDelete(stock.ticker)}
          title="Remove from watchlist"
        >
          ×
        </button>
      </div>
      <div className="stock-card-body">
        <div className="stock-price">
          {formatPrice(stock.price)}
        </div>
        <div className={`stock-change ${getChangeColor(stock.change)}`}>
          {formatChange(stock.change)} ({formatChangePercent(stock.changePercent)})
        </div>
        {stock.dividendYield !== undefined && stock.dividendYield > 0 && (
          <div className="stock-dividend">
            <span className="label">Dividend Yield:</span>
            <span className="value">{formatDividendYield(stock.dividendYield)}</span>
          </div>
        )}
        <div className="stock-timestamp">
          Last updated: {formatTimestamp(stock.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default StockCard;
