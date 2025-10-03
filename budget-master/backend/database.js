const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, 'budget.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create salaries table
      db.run(`
        CREATE TABLE IF NOT EXISTS salaries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          amount REAL NOT NULL,
          month TEXT NOT NULL,
          year INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (salariesErr) => {
        if (salariesErr) {
          console.error('Error creating salaries table:', salariesErr);
          reject(salariesErr);
          return;
        }

        // Create savings table
        db.run(`
          CREATE TABLE IF NOT EXISTS savings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            description TEXT,
            category TEXT NOT NULL CHECK(category IN ('ETFs', 'Stocks', 'Savings Account')),
            month TEXT NOT NULL,
            year INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (savingsErr) => {
          if (savingsErr) {
            console.error('Error creating savings table:', savingsErr);
            reject(savingsErr);
            return;
          }

          // Create stock_watchlist table
          db.run(`
            CREATE TABLE IF NOT EXISTS stock_watchlist (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              ticker TEXT NOT NULL UNIQUE,
              added_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `, (stockErr) => {
            if (stockErr) {
              console.error('Error creating stock_watchlist table:', stockErr);
              reject(stockErr);
            } else {
              console.log('Database initialized successfully');
              resolve();
            }
          });
        });
      });
    });
  });
};

module.exports = { db, initDatabase };