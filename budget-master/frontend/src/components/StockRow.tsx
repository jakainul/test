import React from 'react';
import { StockData } from '../types';

interface StockRowProps {
  stock: StockData;
  loading: boolean;
  error: string | null;
  onDelete: (ticker: string) => void;
}

const StockRow: React.FC<StockRowProps> = ({ stock, loading, error, onDelete }) => {
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
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    } catch {
      return timestamp;
    }
  };

  const getChangeColor = (change: number): string => {
    if (change > 0) return 'stock-row-positive';
    if (change < 0) return 'stock-row-negative';
    return 'stock-row-neutral';
  };

  if (loading) {
    return (
      <tr className="stock-row-loading">
        <td className="stock-row-ticker-cell">
          <span className="stock-row-ticker">{stock.ticker}</span>
        </td>
        <td colSpan={4} className="stock-row-loading-cell">Loading...</td>
        <td className="stock-row-actions">
          <button 
            className="stock-row-delete-btn"
            onClick={() => onDelete(stock.ticker)}
            title="Remove from watchlist"
          >
            ×
          </button>
        </td>
      </tr>
    );
  }

  if (error) {
    return (
      <tr className="stock-row-error">
        <td className="stock-row-ticker-cell">
          <span className="stock-row-ticker">{stock.ticker}</span>
        </td>
        <td colSpan={4} className="stock-row-error-cell">{error}</td>
        <td className="stock-row-actions">
          <button 
            className="stock-row-delete-btn"
            onClick={() => onDelete(stock.ticker)}
            title="Remove from watchlist"
          >
            ×
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="stock-row-ticker-cell">
        <span className="stock-row-ticker">{stock.ticker}</span>
        {stock.companyName && <span className="stock-row-company">{stock.companyName}</span>}
      </td>
      <td>
        <span className="stock-row-price">{formatPrice(stock.price)}</span>
      </td>
      <td>
        <span className={`stock-row-change ${getChangeColor(stock.change)}`}>
          {formatChange(stock.change)} ({formatChangePercent(stock.changePercent)})
        </span>
      </td>
      <td>
        <span className="stock-row-dividend">{formatDividendYield(stock.dividendYield)}</span>
      </td>
      <td>
        <span className="stock-row-timestamp">{formatTimestamp(stock.timestamp)}</span>
      </td>
      <td className="stock-row-actions">
        <button 
          className="stock-row-delete-btn"
          onClick={() => onDelete(stock.ticker)}
          title="Remove from watchlist"
        >
          ×
        </button>
      </td>
    </tr>
  );
};

export default StockRow;
