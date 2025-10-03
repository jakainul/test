import React from 'react';
import StockCard from './StockCard';
import { StockData } from '../types';

interface StockWithState extends StockData {
  loading: boolean;
  error: string | null;
}

interface StockListProps {
  stocks: StockWithState[];
  onDeleteStock: (ticker: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const StockList: React.FC<StockListProps> = ({ stocks, onDeleteStock, onRefresh, isRefreshing }) => {
  if (stocks.length === 0) {
    return (
      <div className="empty-state">
        <p>📊 Your watchlist is empty</p>
        <p className="empty-state-hint">Add some stock tickers above to start tracking!</p>
      </div>
    );
  }

  return (
    <div className="stock-list-container">
      <div className="stock-list-header">
        <h3>Your Stocks ({stocks.length})</h3>
        <button 
          onClick={onRefresh} 
          disabled={isRefreshing}
          className="btn-refresh"
        >
          {isRefreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
        </button>
      </div>
      <div className="stock-list">
        {stocks.map((stock) => (
          <StockCard
            key={stock.ticker}
            stock={stock}
            loading={stock.loading}
            error={stock.error}
            onDelete={onDeleteStock}
          />
        ))}
      </div>
    </div>
  );
};

export default StockList;
