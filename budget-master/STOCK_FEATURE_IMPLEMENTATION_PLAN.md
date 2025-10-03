# Stock Portfolio Feature Implementation Plan

## Overview
Add real-time stock portfolio tracking functionality to Budget Master using Alpha Vantage API. Users will be able to track their stock investments with live price data and portfolio performance metrics.

## API Key
Alpha Vantage API Key: `6KAF0613N0D1L7AX`

## Features to Implement

### 1. Database Schema
Add a new `stock_holdings` table to track user's stock portfolio:
```sql
CREATE TABLE stock_holdings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  company_name TEXT,
  quantity INTEGER NOT NULL,
  purchase_price REAL NOT NULL,
  purchase_date TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### 2. Backend API Endpoints
- `GET /api/stocks/holdings` - Get all stock holdings
- `POST /api/stocks/holdings` - Add a new stock holding
- `DELETE /api/stocks/holdings/:id` - Delete a stock holding
- `GET /api/stocks/quote/:symbol` - Get real-time stock quote from Alpha Vantage
- `GET /api/stocks/portfolio-value` - Calculate total portfolio value with current prices

### 3. Alpha Vantage Integration
Create a service module to:
- Fetch real-time stock quotes (GLOBAL_QUOTE endpoint)
- Cache API responses to avoid rate limits (5 calls/minute, 100 calls/day for free tier)
- Handle API errors gracefully
- Validate stock symbols

### 4. Frontend Components

#### StockHoldingForm Component
- Input fields: Symbol, Company Name, Quantity, Purchase Price, Purchase Date
- Symbol validation
- Real-time price lookup on symbol entry
- Form validation

#### StockHoldingsList Component
- Display all stock holdings in a table
- Show: Symbol, Company, Quantity, Purchase Price, Current Price, Gain/Loss, Gain/Loss %
- Delete functionality
- Live price refresh button

#### StockPortfolioSummary Component
- Total investment amount
- Current portfolio value
- Total gain/loss ($ and %)
- Individual stock performance breakdown

### 5. TypeScript Types
```typescript
interface StockHolding {
  id: number;
  symbol: string;
  company_name: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  created_at: string;
}

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: string;
  volume: number;
  lastUpdated: string;
}

interface PortfolioValue {
  totalInvestment: number;
  currentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  holdings: Array<{
    id: number;
    symbol: string;
    quantity: number;
    purchasePrice: number;
    currentPrice: number;
    currentValue: number;
    gainLoss: number;
    gainLossPercent: number;
  }>;
}
```

## Implementation Steps

1. **Backend Setup**
   - Install axios for API calls: `npm install axios`
   - Create Alpha Vantage service module
   - Update database.js with stock_holdings table
   - Add stock endpoints to server.js

2. **Frontend Setup**
   - Update types.ts with stock-related interfaces
   - Create stock API functions in api.ts
   - Create StockHoldingForm component
   - Create StockHoldingsList component
   - Create StockPortfolioSummary component
   - Integrate into App.tsx

3. **Testing**
   - Test API integration with Alpha Vantage
   - Test CRUD operations for stock holdings
   - Test portfolio value calculations
   - Test error handling for invalid symbols

## UI Design Notes
- Add a new section "📈 Stock Portfolio" below savings section
- Use green for gains, red for losses
- Show loading states during API calls
- Display last updated timestamp for prices
- Responsive table design

## Rate Limiting Strategy
- Implement simple in-memory cache with 5-minute expiration
- Batch portfolio updates to minimize API calls
- Show cached data timestamp to user
- Handle rate limit errors gracefully

## Error Handling
- Invalid stock symbols
- API rate limits
- Network errors
- Missing API key
- Database errors

## Future Enhancements (Not in initial implementation)
- Historical performance charts
- Multiple portfolios
- Automatic portfolio rebalancing suggestions
- Dividend tracking
- Export to CSV
- Price alerts
