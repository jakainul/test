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
          month TEXT NOT NULL,
          year INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database initialized successfully');
          resolve();
        }
      });
    });
  });
};

module.exports = { db, initDatabase };