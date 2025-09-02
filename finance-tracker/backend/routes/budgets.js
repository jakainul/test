const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all budgets for user
router.get('/', async (req, res) => {
  try {
    const budgets = await database.query(`
      SELECT 
        b.id,
        b.amount,
        b.period,
        b.start_date,
        b.end_date,
        b.created_at,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon,
        c.id as category_id,
        COALESCE(SUM(t.amount), 0) as spent
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      LEFT JOIN transactions t ON t.category_id = b.category_id 
        AND t.user_id = b.user_id 
        AND t.transaction_date BETWEEN b.start_date AND b.end_date
        AND t.type = 'expense'
      WHERE b.user_id = ?
      GROUP BY b.id, b.amount, b.period, b.start_date, b.end_date, b.created_at, c.name, c.color, c.icon, c.id
      ORDER BY b.created_at DESC
    `, [req.user.id]);

    // Calculate remaining and percentage for each budget
    const budgetsWithStats = budgets.map(budget => ({
      ...budget,
      remaining: Math.max(0, budget.amount - budget.spent),
      percentage: budget.amount > 0 ? Math.min(100, (budget.spent / budget.amount) * 100) : 0,
      isOverBudget: budget.spent > budget.amount
    }));

    res.json(budgetsWithStats);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new budget
router.post('/', [
  body('categoryId').isInt(),
  body('amount').isFloat({ gt: 0 }),
  body('period').isIn(['weekly', 'monthly', 'yearly']),
  body('startDate').isISO8601(),
  body('endDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { categoryId, amount, period, startDate, endDate } = req.body;

    // Verify category belongs to user and is expense type
    const categories = await database.query(
      'SELECT id, type, name FROM categories WHERE id = ? AND user_id = ?',
      [categoryId, req.user.id]
    );

    if (categories.length === 0) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    if (categories[0].type !== 'expense') {
      return res.status(400).json({ error: 'Budgets can only be set for expense categories' });
    }

    // Check for overlapping budgets for the same category
    const overlappingBudgets = await database.query(`
      SELECT id FROM budgets
      WHERE user_id = ? AND category_id = ?
      AND (
        (start_date <= ? AND end_date >= ?) OR
        (start_date <= ? AND end_date >= ?) OR
        (start_date >= ? AND end_date <= ?)
      )
    `, [req.user.id, categoryId, startDate, startDate, endDate, endDate, startDate, endDate]);

    if (overlappingBudgets.length > 0) {
      return res.status(400).json({ 
        error: 'A budget already exists for this category in the specified date range' 
      });
    }

    // Validate date range
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    const result = await database.run(`
      INSERT INTO budgets (user_id, category_id, amount, period, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [req.user.id, categoryId, amount, period, startDate, endDate]);

    // Get the created budget with category info
    const newBudget = await database.query(`
      SELECT 
        b.id,
        b.amount,
        b.period,
        b.start_date,
        b.end_date,
        b.created_at,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon,
        c.id as category_id
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?
    `, [result.id]);

    res.status(201).json({
      message: 'Budget created successfully',
      budget: newBudget[0]
    });

  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update budget
router.put('/:id', [
  body('amount').optional().isFloat({ gt: 0 }),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, startDate, endDate } = req.body;

    // Check if budget exists and belongs to user
    const existingBudget = await database.query(
      'SELECT id, start_date, end_date FROM budgets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existingBudget.length === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    // Validate date range if both dates are provided
    const newStartDate = startDate || existingBudget[0].start_date;
    const newEndDate = endDate || existingBudget[0].end_date;

    if (new Date(newStartDate) >= new Date(newEndDate)) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (amount !== undefined) {
      updates.push('amount = ?');
      params.push(amount);
    }
    if (startDate !== undefined) {
      updates.push('start_date = ?');
      params.push(startDate);
    }
    if (endDate !== undefined) {
      updates.push('end_date = ?');
      params.push(endDate);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id, req.user.id);

    await database.run(`
      UPDATE budgets 
      SET ${updates.join(', ')}
      WHERE id = ? AND user_id = ?
    `, params);

    // Get updated budget
    const updatedBudget = await database.query(`
      SELECT 
        b.id,
        b.amount,
        b.period,
        b.start_date,
        b.end_date,
        b.created_at,
        b.updated_at,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon,
        c.id as category_id
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?
    `, [req.params.id]);

    res.json({
      message: 'Budget updated successfully',
      budget: updatedBudget[0]
    });

  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete budget
router.delete('/:id', async (req, res) => {
  try {
    const result = await database.run(
      'DELETE FROM budgets WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });

  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;