import React, { useState, useMemo } from 'react';
import StockRow from './StockRow';
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

type SortColumn = 'ticker' | 'price' | 'change' | 'dividend' | 'timestamp' | null;
type SortDirection = 'asc' | 'desc' | null;

const StockList: React.FC<StockListProps> = ({ stocks, onDeleteStock, onRefresh, isRefreshing }) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedStocks = useMemo(() => {
    if (!sortColumn || !sortDirection) {
      return stocks;
    }

    const sorted = [...stocks].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case 'ticker':
          aValue = a.ticker.toLowerCase();
          bValue = b.ticker.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'change':
          aValue = a.changePercent;
          bValue = b.changePercent;
          break;
        case 'dividend':
          aValue = a.dividendYield || 0;
          bValue = b.dividendYield || 0;
          break;
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [stocks, sortColumn, sortDirection]);

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return '⇅';
    }
    return sortDirection === 'asc' ? '↑' : '↓';
  };

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
      <div className="stock-table-container">
        <table className="stock-table">
          <thead>
            <tr>
              <th 
                className={`sortable ${sortColumn === 'ticker' ? 'sorted' : ''}`}
                onClick={() => handleSort('ticker')}
              >
                <div className="stock-table-header-content">
                  <span>Ticker / Company</span>
                  <span className="stock-table-sort-icon">{getSortIcon('ticker')}</span>
                </div>
              </th>
              <th 
                className={`sortable ${sortColumn === 'price' ? 'sorted' : ''}`}
                onClick={() => handleSort('price')}
              >
                <div className="stock-table-header-content">
                  <span>Price</span>
                  <span className="stock-table-sort-icon">{getSortIcon('price')}</span>
                </div>
              </th>
              <th 
                className={`sortable ${sortColumn === 'change' ? 'sorted' : ''}`}
                onClick={() => handleSort('change')}
              >
                <div className="stock-table-header-content">
                  <span>Change</span>
                  <span className="stock-table-sort-icon">{getSortIcon('change')}</span>
                </div>
              </th>
              <th 
                className={`sortable ${sortColumn === 'dividend' ? 'sorted' : ''}`}
                onClick={() => handleSort('dividend')}
              >
                <div className="stock-table-header-content">
                  <span>Dividend</span>
                  <span className="stock-table-sort-icon">{getSortIcon('dividend')}</span>
                </div>
              </th>
              <th 
                className={`sortable ${sortColumn === 'timestamp' ? 'sorted' : ''}`}
                onClick={() => handleSort('timestamp')}
              >
                <div className="stock-table-header-content">
                  <span>Last Updated</span>
                  <span className="stock-table-sort-icon">{getSortIcon('timestamp')}</span>
                </div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedStocks.map((stock) => (
              <StockRow
                key={stock.ticker}
                stock={stock}
                loading={stock.loading}
                error={stock.error}
                onDelete={onDeleteStock}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockList;
