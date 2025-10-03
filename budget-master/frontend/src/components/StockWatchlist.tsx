import React, { useState, useEffect, useCallback } from 'react';
import StockForm from './StockForm';
import StockList from './StockList';
import { getStockWatchlist, addStockToWatchlist, removeStockFromWatchlist, getStockData } from '../api';
import { StockTicker, StockData } from '../types';

interface StockWithState extends StockData {
  loading: boolean;
  error: string | null;
}

interface StockWatchlistProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const StockWatchlist: React.FC<StockWatchlistProps> = ({ showToast }) => {
  const [watchlist, setWatchlist] = useState<StockTicker[]>([]);
  const [stocks, setStocks] = useState<StockWithState[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  // Fetch watchlist from database
  const fetchWatchlist = useCallback(async () => {
    try {
      const tickers = await getStockWatchlist();
      setWatchlist(tickers);
      return tickers;
    } catch (error) {
      showToast('Failed to load watchlist', 'error');
      return [];
    }
  }, [showToast]);

  // Fetch stock data for a single ticker
  const fetchStockData = useCallback(async (ticker: string): Promise<StockWithState> => {
    try {
      const data = await getStockData(ticker);
      return {
        ...data,
        loading: false,
        error: null,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch data';
      return {
        ticker,
        price: 0,
        change: 0,
        changePercent: 0,
        volume: 0,
        timestamp: new Date().toISOString(),
        loading: false,
        error: errorMessage,
      };
    }
  }, []);

  // Fetch data for all stocks in watchlist
  const fetchAllStockData = useCallback(async (tickers: StockTicker[]) => {
    if (tickers.length === 0) {
      setStocks([]);
      return;
    }

    // Initialize stocks with loading state
    const initialStocks: StockWithState[] = tickers.map((t) => ({
      ticker: t.ticker,
      price: 0,
      change: 0,
      changePercent: 0,
      volume: 0,
      timestamp: '',
      loading: true,
      error: null,
    }));
    setStocks(initialStocks);

    // Fetch data for each stock
    const stockPromises = tickers.map((t) => fetchStockData(t.ticker));
    const stocksData = await Promise.all(stockPromises);
    setStocks(stocksData);
  }, [fetchStockData]);

  // Add stock to watchlist
  const handleAddStock = async (ticker: string) => {
    setIsAdding(true);
    try {
      await addStockToWatchlist(ticker);
      showToast(`${ticker} added to watchlist`, 'success');
      const updatedWatchlist = await fetchWatchlist();
      await fetchAllStockData(updatedWatchlist);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to add ticker';
      showToast(errorMessage, 'error');
      throw error;
    } finally {
      setIsAdding(false);
    }
  };

  // Delete stock from watchlist
  const handleDeleteStock = async (ticker: string) => {
    try {
      await removeStockFromWatchlist(ticker);
      showToast(`${ticker} removed from watchlist`, 'success');
      const updatedWatchlist = await fetchWatchlist();
      await fetchAllStockData(updatedWatchlist);
    } catch (error) {
      showToast('Failed to remove ticker', 'error');
    }
  };

  // Refresh all stock data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAllStockData(watchlist);
      showToast('Stock data refreshed', 'success');
    } catch (error) {
      showToast('Failed to refresh data', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      const tickers = await fetchWatchlist();
      await fetchAllStockData(tickers);
    };
    loadData();
  }, [fetchWatchlist, fetchAllStockData]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!autoRefreshEnabled || watchlist.length === 0) return;

    const interval = setInterval(async () => {
      console.log('Auto-refreshing stock data...');
      await fetchAllStockData(watchlist);
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, watchlist, fetchAllStockData]);

  return (
    <div className="stock-watchlist-section">
      <div className="section-header">
        <h2>📈 Stock Watchlist</h2>
        <label className="auto-refresh-toggle">
          <input
            type="checkbox"
            checked={autoRefreshEnabled}
            onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
          />
          <span>Auto-refresh (60s)</span>
        </label>
      </div>
      <StockForm onAddStock={handleAddStock} isAdding={isAdding} />
      <StockList
        stocks={stocks}
        onDeleteStock={handleDeleteStock}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
    </div>
  );
};

export default StockWatchlist;
