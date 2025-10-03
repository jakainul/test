# Stock Feature Implementation Plan 📈

## Overview
Adding real-time stock data functionality to Budget Master using Alpha Vantage API to track personalized stock lists with live prices and dividend information.

## Features to Implement

### 1. Personalized Stock Watchlist
- Add stock tickers to a personal watchlist
- Remove stock tickers from the watchlist
- Persist watchlist in SQLite database
- Validate ticker symbols before adding

### 2. Real-Time Stock Data Display
- Show current stock price for each ticker in watchlist
- Display dividend yield information
- Auto-refresh data at configurable intervals
- Display price change (% and absolute)
- Show last updated timestamp
- Handle API rate limits gracefully

## Technical Architecture

### Backend Changes

#### 1. Database Schema
**New Table: `stock_watchlist`**
```sql
CREATE TABLE stock_watchlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticker TEXT NOT NULL UNIQUE,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

#### 2. API Endpoints
- `GET /api/stocks/watchlist` - Get all tickers in watchlist
- `POST /api/stocks/watchlist` - Add ticker to watchlist
- `DELETE /api/stocks/watchlist/:ticker` - Remove ticker from watchlist
- `GET /api/stocks/quote/:ticker` - Get real-time quote for a ticker
- `GET /api/stocks/quotes` - Get quotes for all watchlist tickers
- `GET /api/stocks/dividend/:ticker` - Get dividend data for a ticker

#### 3. Environment Variables
- `ALPHA_VANTAGE_API_KEY` - Store API key securely in backend
- Add `.env` file support with `dotenv` package

#### 4. Alpha Vantage Integration Service
Create `backend/services/alphaVantageService.js`:
- Rate limiting (5 requests/minute for free tier)
- Caching mechanism (cache quotes for 1 minute)
- Error handling for API failures
- Functions:
  - `getGlobalQuote(ticker)` - Get current price
  - `getOverview(ticker)` - Get company overview with dividend info
  - `validateTicker(ticker)` - Check if ticker exists

### Frontend Changes

#### 1. New Components

**`components/StockWatchlist.tsx`**
- Main container component
- Manages state for watchlist
- Handles data fetching and refresh

**`components/StockForm.tsx`**
- Add/remove ticker form
- Ticker input with validation
- Add/delete buttons

**`components/StockList.tsx`**
- Display list of stocks with real-time data
- Show: ticker, company name, price, change %, dividend yield
- Color coding for price changes (green/red)
- Loading states for each stock
- Delete button for each ticker

**`components/StockCard.tsx`**
- Individual stock display card
- Detailed view with:
  - Ticker symbol and company name
  - Current price (large, prominent)
  - Change amount and percentage (colored)
  - Dividend yield (if available)
  - Last updated timestamp
  - Loading spinner

#### 2. Type Definitions (`types.ts`)
```typescript
export interface StockTicker {
  id: number;
  ticker: string;
  added_at: string;
}

export interface StockQuote {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
  companyName?: string;
}

export interface StockDividend {
  ticker: string;
  dividendYield: number;
  exDividendDate?: string;
  paymentDate?: string;
}

export interface StockData {
  ticker: string;
  quote: StockQuote | null;
  dividend: StockDividend | null;
  loading: boolean;
  error: string | null;
}
```

#### 3. API Functions (`api.ts`)
```typescript
export const getStockWatchlist(): Promise<StockTicker[]>
export const addStockToWatchlist(ticker: string): Promise<StockTicker>
export const removeStockFromWatchlist(ticker: string): Promise<void>
export const getStockQuote(ticker: string): Promise<StockQuote>
export const getStockQuotes(): Promise<StockQuote[]>
export const getStockDividend(ticker: string): Promise<StockDividend>
```

#### 4. App.tsx Integration
- Add new "Stock Watchlist" section after Savings section
- Use same layout pattern as existing sections
- Include header with icon: "📈 Stock Watchlist"

#### 5. Styling
- Use existing CSS patterns from `index.css`
- Color scheme:
  - Green (#10b981) for positive changes
  - Red (#ef4444) for negative changes
  - Blue (#3b82f6) for neutral/info
- Card-based layout matching existing design
- Responsive grid layout

## Implementation Steps

### Phase 1: Backend Setup (Estimated: 2-3 hours)
1. ✅ Install dependencies: `dotenv` for environment variables
2. ✅ Create `.env` file with API key
3. ✅ Update `database.js` to create `stock_watchlist` table
4. ✅ Create `backend/services/alphaVantageService.js`
5. ✅ Implement caching and rate limiting in service
6. ✅ Add stock API routes to `server.js`
7. ✅ Test endpoints with Postman/curl

### Phase 2: Frontend Types & API (Estimated: 1 hour)
1. ✅ Add TypeScript interfaces to `types.ts`
2. ✅ Add API functions to `api.ts`
3. ✅ Test API integration

### Phase 3: UI Components (Estimated: 3-4 hours)
1. ✅ Create `StockCard.tsx` - Individual stock display
2. ✅ Create `StockForm.tsx` - Add/remove ticker form
3. ✅ Create `StockList.tsx` - List of stocks with data
4. ✅ Create `StockWatchlist.tsx` - Main container
5. ✅ Add CSS styles for stock components
6. ✅ Integrate into `App.tsx`

### Phase 4: Polish & Error Handling (Estimated: 1-2 hours)
1. ✅ Add loading states
2. ✅ Add error handling and user feedback
3. ✅ Implement auto-refresh (every 60 seconds)
4. ✅ Add manual refresh button
5. ✅ Handle API rate limits gracefully
6. ✅ Add toast notifications for actions
7. ✅ Test edge cases

### Phase 5: Testing & Documentation (Estimated: 1 hour)
1. ✅ Test all CRUD operations
2. ✅ Test with various ticker symbols
3. ✅ Test rate limiting behavior
4. ✅ Update README with new features
5. ✅ Document API key setup

## Alpha Vantage API Details

### Endpoints to Use

**1. GLOBAL_QUOTE** (Real-time price)
```
https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=YOUR_KEY
```
Returns: Current price, change, volume, etc.

**2. OVERVIEW** (Company info including dividend)
```
https://www.alphavantage.co/query?function=OVERVIEW&symbol=AAPL&apikey=YOUR_KEY
```
Returns: Company name, dividend yield, dividend date, etc.

### Rate Limits
- **Free Tier**: 5 API calls per minute, 500 per day
- **Strategy**: 
  - Cache responses for 60 seconds
  - Implement request queue
  - Show stale data with timestamp
  - Warn users about rate limits

## Environment Setup

### Backend `.env` File
```env
ALPHA_VANTAGE_API_KEY=your_api_key_here
PORT=5001
```

### Frontend Environment Variables
Not needed - backend proxies all API calls to protect the key

## Security Considerations

1. ✅ **API Key Protection**: Store key only in backend `.env` file
2. ✅ **Backend Proxy**: All Alpha Vantage calls go through backend
3. ✅ **Input Validation**: Validate ticker symbols (uppercase, 1-5 chars)
4. ✅ **Rate Limiting**: Implement on backend to prevent abuse
5. ✅ **Error Handling**: Don't expose API errors to frontend

## User Experience Features

1. **Loading States**: Show spinners while fetching data
2. **Error Messages**: Clear, actionable error messages
3. **Stale Data Indicator**: Show when data is cached/old
4. **Manual Refresh**: Button to force refresh
5. **Auto-refresh**: Configurable auto-refresh interval
6. **Empty State**: Helpful message when watchlist is empty
7. **Ticker Validation**: Validate before allowing add
8. **Duplicate Prevention**: Prevent adding same ticker twice
9. **Price Formatting**: Currency formatting ($XX.XX)
10. **Percentage Formatting**: Show + or - with color coding

## File Structure

```
budget-master/
├── backend/
│   ├── services/
│   │   └── alphaVantageService.js  [NEW]
│   ├── database.js                  [MODIFIED]
│   ├── server.js                    [MODIFIED]
│   ├── .env                         [NEW]
│   └── package.json                 [MODIFIED - add dotenv]
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── StockWatchlist.tsx   [NEW]
│   │   │   ├── StockForm.tsx        [NEW]
│   │   │   ├── StockList.tsx        [NEW]
│   │   │   └── StockCard.tsx        [NEW]
│   │   ├── api.ts                   [MODIFIED]
│   │   ├── types.ts                 [MODIFIED]
│   │   ├── App.tsx                  [MODIFIED]
│   │   └── index.css                [MODIFIED]
│   └── package.json
└── README.md                        [MODIFIED]
```

## Dependencies to Install

### Backend
```bash
cd backend
npm install dotenv
```

### Frontend
No additional dependencies needed (using existing React, TypeScript, axios)

## Testing Checklist

- [ ] Add ticker to watchlist
- [ ] Remove ticker from watchlist
- [ ] View stock price updates
- [ ] View dividend information
- [ ] Handle invalid ticker gracefully
- [ ] Handle API rate limit gracefully
- [ ] Handle network errors gracefully
- [ ] Auto-refresh works correctly
- [ ] Manual refresh button works
- [ ] Multiple stocks display correctly
- [ ] Empty watchlist shows helpful message
- [ ] Duplicate ticker prevention works
- [ ] Price change colors (green/red) work
- [ ] Loading states display correctly
- [ ] Toast notifications work
- [ ] Data persists after page reload

## Future Enhancements (Post-MVP)

1. **Historical Charts**: Add price charts using chart.js
2. **Stock News**: Display recent news for each stock
3. **Alerts**: Price alerts when stock reaches target
4. **Portfolio Tracking**: Link stocks to actual holdings with quantity
5. **Performance Metrics**: Calculate portfolio gains/losses
6. **Export Data**: Export watchlist and prices to CSV
7. **Search**: Autocomplete for ticker symbols
8. **Categories**: Group stocks by sector/category
9. **Notes**: Add personal notes to each stock
10. **Multiple Watchlists**: Support for different watchlists

## Success Metrics

- ✅ Users can add/remove tickers
- ✅ Real-time prices display correctly
- ✅ Dividend data shows when available
- ✅ App handles API limits gracefully
- ✅ Data persists across sessions
- ✅ UI is responsive and matches existing design
- ✅ No console errors
- ✅ Performance: Page loads in < 2 seconds

## Estimated Total Time: 8-11 hours

## Notes

- Free Alpha Vantage API key available at: https://www.alphavantage.co/support/#api-key
- Demo/development can use example key, but production needs registered key
- Consider upgrading to paid tier if app gets heavy usage
- Alpha Vantage free tier is sufficient for personal use (25 tickers with 1-min refresh = ~25 calls/min if not cached properly, but with 60s cache = max 1-2 calls per stock per hour)

## API Key Setup Instructions

1. Go to https://www.alphavantage.co/support/#api-key
2. Enter email and click "GET FREE API KEY"
3. Copy the API key
4. Create `backend/.env` file
5. Add: `ALPHA_VANTAGE_API_KEY=your_key_here`
6. Restart backend server

## Example Usage Flow

1. User opens Budget Master app
2. Scrolls to "Stock Watchlist" section
3. Enters ticker "AAPL" and clicks "Add to Watchlist"
4. Backend validates ticker and adds to database
5. Frontend fetches quote and dividend data
6. Displays card with:
   - AAPL - Apple Inc.
   - $175.43 ▲ $2.15 (+1.24%)
   - Dividend Yield: 0.52%
   - Last updated: 2:30 PM
7. User can add more tickers (MSFT, GOOGL, etc.)
8. Data auto-refreshes every 60 seconds
9. User can manually refresh with button
10. User can delete tickers from watchlist
