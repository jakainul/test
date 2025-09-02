const express = require('express');
const { body, validationResult } = require('express-validator');
const database = require('../models/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all categories for user
router.get('/', async (req, res) => {
  try {
    const categories = await database.query(`
      SELECT id, name, color, icon, type, created_at
      FROM categories
      WHERE user_id = ?
      ORDER BY type, name
    `, [req.user.id]);

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new category
router.post('/', [
  body('name').trim().isLength({ min: 1, max: 50 }),
  body('type').isIn(['income', 'expense']),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i),
  body('icon').optional().trim().isLength({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, color = '#1976d2', icon = 'category' } = req.body;

    // Check if category name already exists for this user
    const existingCategory = await database.query(
      'SELECT id FROM categories WHERE user_id = ? AND name = ?',
      [req.user.id, name]
    );

    if (existingCategory.length > 0) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }

    const result = await database.run(`
      INSERT INTO categories (user_id, name, type, color, icon)
      VALUES (?, ?, ?, ?, ?)
    `, [req.user.id, name, type, color, icon]);

    const newCategory = await database.query(
      'SELECT id, name, color, icon, type, created_at FROM categories WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      message: 'Category created successfully',
      category: newCategory[0]
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update category
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 1, max: 50 }),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i),
  body('icon').optional().trim().isLength({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, color, icon } = req.body;

    // Check if category exists and belongs to user
    const existingCategory = await database.query(
      'SELECT id FROM categories WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existingCategory.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // If name is being updated, check for duplicates
    if (name) {
      const duplicateCategory = await database.query(
        'SELECT id FROM categories WHERE user_id = ? AND name = ? AND id != ?',
        [req.user.id, name, req.params.id]
      );

      if (duplicateCategory.length > 0) {
        return res.status(400).json({ error: 'Category with this name already exists' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (color !== undefined) {
      updates.push('color = ?');
      params.push(color);
    }
    if (icon !== undefined) {
      updates.push('icon = ?');
      params.push(icon);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    params.push(req.params.id, req.user.id);

    await database.run(`
      UPDATE categories 
      SET ${updates.join(', ')}
      WHERE id = ? AND user_id = ?
    `, params);

    const updatedCategory = await database.query(
      'SELECT id, name, color, icon, type, created_at FROM categories WHERE id = ?',
      [req.params.id]
    );

    res.json({
      message: 'Category updated successfully',
      category: updatedCategory[0]
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    // Check if category has any transactions
    const transactions = await database.query(
      'SELECT COUNT(*) as count FROM transactions WHERE category_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (transactions[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category that has transactions. Please reassign or delete transactions first.' 
      });
    }

    const result = await database.run(
      'DELETE FROM categories WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;