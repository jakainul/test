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
      `);

      // Create expenses table
      db.run(`
        CREATE TABLE IF NOT EXISTS expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          amount REAL NOT NULL,
          description TEXT,
          category TEXT DEFAULT 'Other',
          month TEXT NOT NULL,
          year INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          // Add category column to existing table if it doesn't exist
          db.run(`ALTER TABLE expenses ADD COLUMN category TEXT DEFAULT 'Other'`, (alterErr) => {
            // Ignore error if column already exists
            console.log('Database initialized successfully');
            resolve();
          });
        }
      });
    });
  });
};

module.exports = { db, initDatabase };