const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { db, initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize database
initDatabase().catch(console.error);

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
      'GET /api/expenses - Get all expenses',
      'POST /api/expenses - Add new expense',
      'DELETE /api/expenses/:id - Delete expense',
      'GET /api/savings - Get all savings',
      'POST /api/savings - Add new savings entry',
      'POST /api/savings/allocation - Add savings entries from percentage allocation',
      'DELETE /api/savings/:id - Delete savings entry',
      'GET /api/budget-summary - Get budget summary',
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

// Get all expenses
app.get('/api/expenses', (req, res) => {
  db.all('SELECT * FROM expenses ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new expense
app.post('/api/expenses', (req, res) => {
  const { amount, description, category, month, year } = req.body;
  
  if (!amount || !month || !year) {
    res.status(400).json({ error: 'Amount, month, and year are required' });
    return;
  }

  db.run(
    'INSERT INTO expenses (amount, description, category, month, year) VALUES (?, ?, ?, ?, ?)',
    [amount, description || '', category || 'Other', month, year],
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
        message: 'Expense added successfully'
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

// Get budget summary (total salaries - total expenses)
app.get('/api/budget-summary', (req, res) => {
  const getTotalSalaries = new Promise((resolve, reject) => {
    db.get('SELECT SUM(amount) as total FROM salaries', (err, row) => {
      if (err) reject(err);
      else resolve(row.total || 0);
    });
  });

  const getTotalExpenses = new Promise((resolve, reject) => {
    db.get('SELECT SUM(amount) as total FROM expenses', (err, row) => {
      if (err) reject(err);
      else resolve(row.total || 0);
    });
  });

  Promise.all([getTotalSalaries, getTotalExpenses])
    .then(([totalSalaries, totalExpenses]) => {
      const balance = totalSalaries - totalExpenses;
      res.json({
        totalSalaries,
        totalExpenses,
        balance
      });
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
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

// Delete expense
app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM expenses WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }
    res.json({ message: 'Expense deleted successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`Budget Master backend server running on port ${PORT}`);
});