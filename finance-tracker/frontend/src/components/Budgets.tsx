import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Warning,
  CheckCircle
} from '@mui/icons-material';
import axios from 'axios';
import { Budget, Category, CreateBudgetData } from '../types';
import { format, addDays, addMonths, addYears, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

const Budgets: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateBudgetData>({
    categoryId: 0,
    amount: 0,
    period: 'monthly',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addMonths(new Date(), 1), 'yyyy-MM-dd')
  });

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/budgets');
      setBudgets(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/categories');
      setCategories(response.data.filter(cat => cat.type === 'expense'));
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchBudgets();
  }, []);

  const calculateDateRange = (period: string, startDate: string) => {
    const start = new Date(startDate);
    let end: Date;

    switch (period) {
      case 'weekly':
        end = addDays(start, 7);
        break;
      case 'monthly':
        end = addMonths(start, 1);
        break;
      case 'yearly':
        end = addYears(start, 1);
        break;
      default:
        end = addMonths(start, 1);
    }

    return format(end, 'yyyy-MM-dd');
  };

  const handlePeriodChange = (period: string) => {
    const today = new Date();
    let startDate: Date;

    switch (period) {
      case 'weekly':
        startDate = startOfWeek(today);
        break;
      case 'monthly':
        startDate = startOfMonth(today);
        break;
      case 'yearly':
        startDate = startOfYear(today);
        break;
      default:
        startDate = startOfMonth(today);
    }

    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const endDate = calculateDateRange(period, formattedStartDate);

    setFormData({
      ...formData,
      period: period as 'weekly' | 'monthly' | 'yearly',
      startDate: formattedStartDate,
      endDate
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBudget) {
        await axios.put(`/budgets/${editingBudget.id}`, formData);
      } else {
        await axios.post('/budgets', formData);
      }
      
      setOpenDialog(false);
      setEditingBudget(null);
      resetForm();
      fetchBudgets();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to save budget');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await axios.delete(`/budgets/${id}`);
        fetchBudgets();
      } catch (error: any) {
        setError(error.response?.data?.error || 'Failed to delete budget');
      }
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      categoryId: budget.category_id,
      amount: budget.amount,
      period: budget.period,
      startDate: budget.start_date,
      endDate: budget.end_date
    });
    setOpenDialog(true);
  };

  const resetForm = () => {
    const today = new Date();
    const startDate = format(startOfMonth(today), 'yyyy-MM-dd');
    const endDate = format(addMonths(today, 1), 'yyyy-MM-dd');

    setFormData({
      categoryId: 0,
      amount: 0,
      period: 'monthly',
      startDate,
      endDate
    });
  };

  const handleAddNew = () => {
    setEditingBudget(null);
    resetForm();
    setOpenDialog(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getBudgetStatus = (budget: Budget) => {
    if (budget.isOverBudget) {
      return { color: 'error', icon: <Warning />, text: 'Over Budget' };
    } else if (budget.percentage > 80) {
      return { color: 'warning', icon: <Warning />, text: 'Near Limit' };
    } else {
      return { color: 'success', icon: <CheckCircle />, text: 'On Track' };
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Budgets
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAddNew}>
          Add Budget
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {budgets.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No budgets set up yet
          </Typography>
          <Typography color="textSecondary" paragraph>
            Create budgets to track your spending and stay on top of your finances.
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleAddNew}>
            Create Your First Budget
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {budgets.map((budget) => {
            const status = getBudgetStatus(budget);
            return (
              <Grid item xs={12} md={6} lg={4} key={budget.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: budget.category_color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          mr: 2,
                          fontSize: '0.9rem'
                        }}
                      >
                        {budget.category_icon}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">
                          {budget.category_name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {budget.period} budget
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => handleEdit(budget)}>
                          <Edit />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(budget.id)} color="error">
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          Spent: {formatCurrency(budget.spent)}
                        </Typography>
                        <Typography variant="body2">
                          Budget: {formatCurrency(budget.amount)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(budget.percentage, 100)}
                        color={status.color as any}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        {budget.percentage.toFixed(1)}% used
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        icon={status.icon}
                        label={status.text}
                        color={status.color as any}
                        size="small"
                      />
                      <Typography variant="body2" color="textSecondary">
                        {format(new Date(budget.start_date), 'MMM dd')} - {format(new Date(budget.end_date), 'MMM dd')}
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Remaining: <strong>{formatCurrency(budget.remaining)}</strong>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Add/Edit Budget Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingBudget ? 'Edit Budget' : 'Create New Budget'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.categoryId || ''}
                    label="Category"
                    onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Budget Amount"
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Period</InputLabel>
                  <Select
                    value={formData.period}
                    label="Period"
                    onChange={(e) => handlePeriodChange(e.target.value)}
                  >
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => {
                    const newStartDate = e.target.value;
                    const newEndDate = calculateDateRange(formData.period, newStartDate);
                    setFormData({ 
                      ...formData, 
                      startDate: newStartDate,
                      endDate: newEndDate
                    });
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingBudget ? 'Update' : 'Create'} Budget
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Budgets;