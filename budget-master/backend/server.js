const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { db, initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize database
initDatabase().catch(console.error);

// Routes

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
  const { amount, description, month, year } = req.body;
  
  if (!amount || !month || !year) {
    res.status(400).json({ error: 'Amount, month, and year are required' });
    return;
  }

  db.run(
    'INSERT INTO expenses (amount, description, month, year) VALUES (?, ?, ?, ?)',
    [amount, description || '', month, year],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        amount,
        description,
        month,
        year,
        message: 'Expense added successfully'
      });
    }
  );
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