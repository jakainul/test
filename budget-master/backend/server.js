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