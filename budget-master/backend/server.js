require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { db, initDatabase } = require('./database');
const stockService = require('./services/alphaVantageService');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize database
initDatabase()
  .then(() => {
    console.log('Database ready for connections');
  })
  .catch((err) => {
    console.error('FATAL: Failed to initialize database:', err);
    console.error('Server cannot start without a working database connection.');
    process.exit(1);
  });

// Routes

// Root route - API information
app.get('/', (req, res) => {
  res.json({
    message: 'Budget Master API Server',
    version: '1.0.0',
    endpoints: [
      'GET /api/salaries - Get all salaries',
      'POST /api/salaries - Add new salary',
      'DELETE /api/salaries/:id - Delete salary',
      'GET /api/savings - Get all savings',
      'POST /api/savings - Add new savings entry',
      'POST /api/savings/allocation - Add savings entries from percentage allocation',
      'DELETE /api/savings/:id - Delete savings entry',
      'GET /api/budget-summary - Get budget summary',
      'GET /api/stocks/watchlist - Get all stock tickers in watchlist',
      'POST /api/stocks/watchlist - Add ticker to watchlist',
      'DELETE /api/stocks/watchlist/:ticker - Remove ticker from watchlist',
      'GET /api/stocks/quote/:ticker - Get real-time quote for a ticker',
      'GET /api/stocks/data/:ticker - Get complete stock data (quote + dividend)',
      'GET /health - Health check'
    ]
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Get all salaries
app.get('/api/salaries', (req, res) => {
  db.all('SELECT * FROM salaries ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new salary
app.post('/api/salaries', (req, res) => {
  const { amount, month, year } = req.body;
  
  if (!amount || !month || !year) {
    res.status(400).json({ error: 'Amount, month, and year are required' });
    return;
  }

  db.run(
    'INSERT INTO salaries (amount, month, year) VALUES (?, ?, ?)',
    [amount, month, year],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        amount,
        month,
        year,
        message: 'Salary added successfully'
      });
    }
  );
});


// Get all savings
app.get('/api/savings', (req, res) => {
  db.all('SELECT * FROM savings ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new savings entry
app.post('/api/savings', (req, res) => {
  const { amount, description, category, month, year } = req.body;
  
  if (!amount || !category || !month || !year) {
    res.status(400).json({ error: 'Amount, category, month, and year are required' });
    return;
  }

  const validCategories = ['ETFs', 'Stocks', 'Savings Account'];
  if (!validCategories.includes(category)) {
    res.status(400).json({ error: 'Category must be one of: ETFs, Stocks, Savings Account' });
    return;
  }

  db.run(
    'INSERT INTO savings (amount, description, category, month, year) VALUES (?, ?, ?, ?, ?)',
    [amount, description || '', category, month, year],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        amount,
        description,
        category,
        month,
        year,
        message: 'Savings entry added successfully'
      });
    }
  );
});

// Add bulk savings entries from allocation
app.post('/api/savings/allocation', (req, res) => {
  const { 
    monthlyAmount, 
    description, 
    etfPercentage, 
    stockPercentage, 
    savingsPercentage, 
    selectedMonth,
    year 
  } = req.body;
  
  if (!monthlyAmount || etfPercentage === undefined || stockPercentage === undefined || 
      savingsPercentage === undefined || !selectedMonth || !year) {
    res.status(400).json({ error: 'All allocation fields are required' });
    return;
  }

  // Validate percentages sum to 100
  if (Math.abs((etfPercentage + stockPercentage + savingsPercentage) - 100) > 0.01) {
    res.status(400).json({ error: 'Percentages must sum to 100%' });
    return;
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (!months.includes(selectedMonth)) {
    res.status(400).json({ error: 'Invalid selected month' });
    return;
  }

  // Calculate amounts for each category from the monthly total
  const monthlyETF = (monthlyAmount * etfPercentage) / 100;
  const monthlyStock = (monthlyAmount * stockPercentage) / 100;
  const monthlySavingsAmount = (monthlyAmount * savingsPercentage) / 100;

  // Prepare all insertions for the selected month
  const insertions = [];

  // Only add entries for categories with non-zero percentages
  if (etfPercentage > 0) {
    insertions.push({
      amount: monthlyETF,
      description: description || '',
      category: 'ETFs',
      month: selectedMonth,
      year: year
    });
  }
  
  if (stockPercentage > 0) {
    insertions.push({
      amount: monthlyStock,
      description: description || '',
      category: 'Stocks',
      month: selectedMonth,
      year: year
    });
  }
  
  if (savingsPercentage > 0) {
    insertions.push({
      amount: monthlySavingsAmount,
      description: description || '',
      category: 'Savings Account',
      month: selectedMonth,
      year: year
    });
  }

  // Execute all insertions in a transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    let completed = 0;
    let hasError = false;
    const results = [];

    if (insertions.length === 0) {
      db.run('ROLLBACK');
      res.status(400).json({ error: 'No valid entries to create' });
      return;
    }

    insertions.forEach((insertion, index) => {
      db.run(
        'INSERT INTO savings (amount, description, category, month, year) VALUES (?, ?, ?, ?, ?)',
        [insertion.amount, insertion.description, insertion.category, insertion.month, insertion.year],
        function(err) {
          if (err && !hasError) {
            hasError = true;
            db.run('ROLLBACK');
            res.status(500).json({ error: err.message });
            return;
          }
          
          if (!hasError) {
            results.push({
              id: this.lastID,
              ...insertion
            });
            
            completed++;
            if (completed === insertions.length) {
              db.run('COMMIT', (commitErr) => {
                if (commitErr) {
                  res.status(500).json({ error: commitErr.message });
                } else {
                  res.json({
                    message: `Successfully created ${results.length} savings entries for ${selectedMonth} ${year}`,
                    entries: results,
                    summary: {
                      monthlyAmount,
                      selectedMonth,
                      year,
                      categoriesCreated: {
                        ETFs: etfPercentage > 0 ? 1 : 0,
                        Stocks: stockPercentage > 0 ? 1 : 0,
                        'Savings Account': savingsPercentage > 0 ? 1 : 0
                      }
                    }
                  });
                }
              });
            }
          }
        }
      );
    });
  });
});

// Delete savings entry
app.delete('/api/savings/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM savings WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Savings entry not found' });
      return;
    }
    res.json({ message: 'Savings entry deleted successfully' });
  });
});

// Get budget summary (total salaries)
app.get('/api/budget-summary', (req, res) => {
  db.get('SELECT SUM(amount) as total FROM salaries', (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const totalSalaries = row.total || 0;
    res.json({
      totalSalaries
    });
  });
});

// Delete salary
app.delete('/api/salaries/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM salaries WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Salary not found' });
      return;
    }
    res.json({ message: 'Salary deleted successfully' });
  });
});

// Stock Watchlist Routes

// Get all tickers in watchlist
app.get('/api/stocks/watchlist', (req, res) => {
  db.all('SELECT * FROM stock_watchlist ORDER BY added_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add ticker to watchlist
app.post('/api/stocks/watchlist', async (req, res) => {
  const { ticker } = req.body;
  
  if (!ticker) {
    res.status(400).json({ error: 'Ticker symbol is required' });
    return;
  }

  // Validate ticker format (1-5 uppercase letters)
  const tickerUpper = ticker.toUpperCase().trim();
  if (!/^[A-Z]{1,5}$/.test(tickerUpper)) {
    res.status(400).json({ error: 'Invalid ticker format. Use 1-5 letters only.' });
    return;
  }

  try {
    // Validate ticker exists via Alpha Vantage
    const isValid = await stockService.validateTicker(tickerUpper);
    
    if (!isValid) {
      res.status(400).json({ error: 'Invalid ticker symbol. Ticker not found.' });
      return;
    }

    // Add to database
    db.run(
      'INSERT INTO stock_watchlist (ticker) VALUES (?)',
      [tickerUpper],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            res.status(400).json({ error: 'Ticker already in watchlist' });
          } else {
            res.status(500).json({ error: err.message });
          }
          return;
        }
        res.json({
          id: this.lastID,
          ticker: tickerUpper,
          message: 'Ticker added to watchlist successfully'
        });
      }
    );
  } catch (error) {
    if (error.message === 'INVALID_TICKER') {
      res.status(400).json({ error: 'Invalid ticker symbol. Ticker not found.' });
    } else if (error.message === 'API_RATE_LIMIT_EXCEEDED') {
      res.status(429).json({ error: 'API rate limit exceeded. Please try again in a minute.' });
    } else {
      res.status(500).json({ error: 'Failed to validate ticker. Please try again.' });
    }
  }
});

// Remove ticker from watchlist
app.delete('/api/stocks/watchlist/:ticker', (req, res) => {
  const { ticker } = req.params;
  
  db.run('DELETE FROM stock_watchlist WHERE ticker = ?', [ticker.toUpperCase()], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Ticker not found in watchlist' });
      return;
    }
    res.json({ message: 'Ticker removed from watchlist successfully' });
  });
});

// Get real-time quote for a ticker
app.get('/api/stocks/quote/:ticker', async (req, res) => {
  const { ticker } = req.params;
  
  try {
    const quote = await stockService.getGlobalQuote(ticker);
    res.json(quote);
  } catch (error) {
    if (error.message === 'INVALID_TICKER') {
      res.status(404).json({ error: 'Ticker not found' });
    } else if (error.message === 'API_RATE_LIMIT_EXCEEDED') {
      res.status(429).json({ error: 'API rate limit exceeded. Please try again in a minute.' });
    } else {
      res.status(500).json({ error: 'Failed to fetch stock quote' });
    }
  }
});

// Get complete stock data (quote + dividend info)
app.get('/api/stocks/data/:ticker', async (req, res) => {
  const { ticker } = req.params;
  
  try {
    const data = await stockService.getStockData(ticker);
    res.json(data);
  } catch (error) {
    if (error.message === 'INVALID_TICKER') {
      res.status(404).json({ error: 'Ticker not found' });
    } else if (error.message === 'API_RATE_LIMIT_EXCEEDED') {
      res.status(429).json({ error: 'API rate limit exceeded. Please try again in a minute.' });
    } else {
      res.status(500).json({ error: 'Failed to fetch stock data' });
    }
  }
});


app.listen(PORT, () => {
  console.log(`Budget Master backend server running on port ${PORT}`);
});