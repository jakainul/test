require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

// Cache for API responses (1 minute TTL)
const cache = new Map();
const CACHE_TTL = 60 * 1000; // 60 seconds

// Rate limiting (5 requests per minute for free tier)
const requestQueue = [];
const MAX_REQUESTS_PER_MINUTE = 5;
let requestsInLastMinute = 0;

// Reset request counter every minute
setInterval(() => {
  requestsInLastMinute = 0;
}, 60 * 1000);

/**
 * Make a rate-limited API request to Alpha Vantage
 */
const makeApiRequest = async (params) => {
  // Check cache first (include API key to avoid cross-key cache collisions)
  const cacheKey = JSON.stringify({ ...params, apikey: API_KEY });
  const cachedData = cache.get(cacheKey);
  
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    console.log(`Cache hit for ${params.symbol || params.function}`);
    return cachedData.data;
  }

  // Check rate limit
  if (requestsInLastMinute >= MAX_REQUESTS_PER_MINUTE) {
    throw new Error('API_RATE_LIMIT_EXCEEDED');
  }

  try {
    requestsInLastMinute++;
    const response = await axios.get(BASE_URL, {
      params: {
        ...params,
        apikey: API_KEY,
      },
      timeout: 10000, // 10 second timeout
    });

    // Check for API errors
    if (response.data['Error Message']) {
      throw new Error('INVALID_TICKER');
    }

    if (response.data['Note']) {
      // Rate limit message from API
      throw new Error('API_RATE_LIMIT_EXCEEDED');
    }

    // Cache the response
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now(),
    });

    return response.data;
  } catch (error) {
    if (error.message === 'INVALID_TICKER' || error.message === 'API_RATE_LIMIT_EXCEEDED') {
      throw error;
    }
    console.error('Alpha Vantage API error:', error.message);
    throw new Error('API_REQUEST_FAILED');
  }
};

/**
 * Get global quote (current price, change, etc.)
 */
const getGlobalQuote = async (ticker) => {
  try {
    const data = await makeApiRequest({
      function: 'GLOBAL_QUOTE',
      symbol: ticker.toUpperCase(),
    });

    const quote = data['Global Quote'];
    
    if (!quote || Object.keys(quote).length === 0) {
      throw new Error('INVALID_TICKER');
    }

    return {
      ticker: ticker.toUpperCase(),
      price: parseFloat(quote['05. price']) || 0,
      change: parseFloat(quote['09. change']) || 0,
      changePercent: parseFloat(quote['10. change percent']?.replace('%', '')) || 0,
      volume: parseInt(quote['06. volume']) || 0,
      timestamp: quote['07. latest trading day'] || new Date().toISOString(),
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get company overview (includes dividend information)
 */
const getOverview = async (ticker) => {
  try {
    const data = await makeApiRequest({
      function: 'OVERVIEW',
      symbol: ticker.toUpperCase(),
    });

    if (!data || !data.Symbol) {
      throw new Error('INVALID_TICKER');
    }

    return {
      ticker: ticker.toUpperCase(),
      companyName: data.Name || ticker.toUpperCase(),
      dividendYield: parseFloat(data.DividendYield) || 0,
      exDividendDate: data.ExDividendDate || null,
      dividendPerShare: parseFloat(data.DividendPerShare) || 0,
      description: data.Description || '',
      sector: data.Sector || '',
      industry: data.Industry || '',
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Validate if a ticker symbol exists
 */
const validateTicker = async (ticker) => {
  try {
    await getGlobalQuote(ticker);
    return true;
  } catch (error) {
    if (error.message === 'INVALID_TICKER') {
      return false;
    }
    throw error;
  }
};

/**
 * Get complete stock data (quote + overview)
 */
const getStockData = async (ticker) => {
  try {
    const [quote, overview] = await Promise.all([
      getGlobalQuote(ticker),
      getOverview(ticker),
    ]);

    return {
      ...quote,
      companyName: overview.companyName,
      dividendYield: overview.dividendYield,
      exDividendDate: overview.exDividendDate,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getGlobalQuote,
  getOverview,
  validateTicker,
  getStockData,
};
