const express = require('express');
const { body, validationResult, query } = require('express-validator');
const database = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all transactions for user
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isInt(),
  query('type').optional().isIn(['income', 'expense']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE t.user_id = ?';
    let params = [req.user.id];

    // Add filters
    if (req.query.category) {
      whereClause += ' AND t.category_id = ?';
      params.push(req.query.category);
    }

    if (req.query.type) {
      whereClause += ' AND t.type = ?';
      params.push(req.query.type);
    }

    if (req.query.startDate) {
      whereClause += ' AND t.transaction_date >= ?';
      params.push(req.query.startDate);
    }

    if (req.query.endDate) {
      whereClause += ' AND t.transaction_date <= ?';
      params.push(req.query.endDate);
    }

    const sql = `
      SELECT 
        t.id,
        t.amount,
        t.description,
        t.transaction_date,
        t.type,
        t.created_at,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      ${whereClause}
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);
    const transactions = await database.query(sql, params);

    // Get total count for pagination
    const countSql = `
      SELECT COUNT(*) as total
      FROM transactions t
      ${whereClause}
    `;
    const countResult = await database.query(countSql, params.slice(0, -2)); // Remove limit and offset
    const total = countResult[0].total;

    res.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const transactions = await database.query(`
      SELECT 
        t.id,
        t.amount,
        t.description,
        t.transaction_date,
        t.type,
        t.created_at,
        t.updated_at,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon,
        c.id as category_id
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.id = ? AND t.user_id = ?
    `, [req.params.id, req.user.id]);

    if (transactions.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transactions[0]);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new transaction
router.post('/', [
  body('amount').isFloat({ gt: 0 }),
  body('description').trim().isLength({ min: 1, max: 255 }),
  body('categoryId').isInt(),
  body('transactionDate').isISO8601(),
  body('type').isIn(['income', 'expense'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, description, categoryId, transactionDate, type } = req.body;

    // Verify category belongs to user and matches type
    const categories = await database.query(
      'SELECT id, type FROM categories WHERE id = ? AND user_id = ?',
      [categoryId, req.user.id]
    );

    if (categories.length === 0) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    if (categories[0].type !== type) {
      return res.status(400).json({ error: 'Transaction type must match category type' });
    }

    const result = await database.run(`
      INSERT INTO transactions (user_id, category_id, amount, description, transaction_date, type)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [req.user.id, categoryId, amount, description, transactionDate, type]);

    // Get the created transaction with category info
    const newTransaction = await database.query(`
      SELECT 
        t.id,
        t.amount,
        t.description,
        t.transaction_date,
        t.type,
        t.created_at,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `, [result.id]);

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: newTransaction[0]
    });

  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update transaction
router.put('/:id', [
  body('amount').optional().isFloat({ gt: 0 }),
  body('description').optional().trim().isLength({ min: 1, max: 255 }),
  body('categoryId').optional().isInt(),
  body('transactionDate').optional().isISO8601(),
  body('type').optional().isIn(['income', 'expense'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, description, categoryId, transactionDate, type } = req.body;

    // Check if transaction exists and belongs to user
    const existingTransaction = await database.query(
      'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existingTransaction.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // If categoryId is provided, verify it belongs to user and matches type
    if (categoryId) {
      const categories = await database.query(
        'SELECT id, type FROM categories WHERE id = ? AND user_id = ?',
        [categoryId, req.user.id]
      );

      if (categories.length === 0) {
        return res.status(400).json({ error: 'Invalid category' });
      }

      if (type && categories[0].type !== type) {
        return res.status(400).json({ error: 'Transaction type must match category type' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (amount !== undefined) {
      updates.push('amount = ?');
      params.push(amount);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (categoryId !== undefined) {
      updates.push('category_id = ?');
      params.push(categoryId);
    }
    if (transactionDate !== undefined) {
      updates.push('transaction_date = ?');
      params.push(transactionDate);
    }
    if (type !== undefined) {
      updates.push('type = ?');
      params.push(type);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id, req.user.id);

    await database.run(`
      UPDATE transactions 
      SET ${updates.join(', ')}
      WHERE id = ? AND user_id = ?
    `, params);

    // Get updated transaction
    const updatedTransaction = await database.query(`
      SELECT 
        t.id,
        t.amount,
        t.description,
        t.transaction_date,
        t.type,
        t.created_at,
        t.updated_at,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `, [req.params.id]);

    res.json({
      message: 'Transaction updated successfully',
      transaction: updatedTransaction[0]
    });

  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
  try {
    const result = await database.run(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });

  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transaction summary/statistics
router.get('/summary/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let whereClause = 'WHERE user_id = ?';
    let params = [req.user.id];

    if (startDate) {
      whereClause += ' AND transaction_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND transaction_date <= ?';
      params.push(endDate);
    }

    // Get total income and expenses
    const summary = await database.query(`
      SELECT 
        type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions
      ${whereClause}
      GROUP BY type
    `, params);

    // Get spending by category
    const categoryBreakdown = await database.query(`
      SELECT 
        c.name,
        c.color,
        c.icon,
        t.type,
        SUM(t.amount) as total,
        COUNT(t.id) as count
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      ${whereClause}
      GROUP BY c.id, c.name, c.color, c.icon, t.type
      ORDER BY total DESC
    `, params);

    // Get recent transactions
    const recentTransactions = await database.query(`
      SELECT 
        t.id,
        t.amount,
        t.description,
        t.transaction_date,
        t.type,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      ${whereClause}
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT 10
    `, params);

    const income = summary.find(s => s.type === 'income')?.total || 0;
    const expenses = summary.find(s => s.type === 'expense')?.total || 0;

    res.json({
      summary: {
        income,
        expenses,
        balance: income - expenses,
        transactionCount: summary.reduce((acc, s) => acc + s.count, 0)
      },
      categoryBreakdown,
      recentTransactions
    });

  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;