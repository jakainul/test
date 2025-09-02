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
  Chip,
  Fab
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Palette
} from '@mui/icons-material';
import axios from 'axios';
import { Category, CreateCategoryData } from '../types';

const predefinedColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#A8E6CF', '#FFD93D', '#FF8A80',
  '#81C784', '#64B5F6', '#FFB74D', '#F06292', '#9575CD'
];

const predefinedIcons = [
  'restaurant', 'directions_car', 'shopping_bag', 'movie', 'receipt',
  'local_hospital', 'work', 'business_center', 'trending_up', 'home',
  'school', 'fitness_center', 'pets', 'flight', 'hotel',
  'local_gas_station', 'phone', 'wifi', 'electric_bolt', 'water_drop'
];

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: '',
    type: 'expense',
    color: predefinedColors[0],
    icon: predefinedIcons[0]
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/categories');
      setCategories(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await axios.put(`/categories/${editingCategory.id}`, formData);
      } else {
        await axios.post('/categories', formData);
      }
      
      setOpenDialog(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to save category');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        await axios.delete(`/categories/${id}`);
        fetchCategories();
      } catch (error: any) {
        setError(error.response?.data?.error || 'Failed to delete category');
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon
    });
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'expense',
      color: predefinedColors[0],
      icon: predefinedIcons[0]
    });
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    resetForm();
    setOpenDialog(true);
  };

  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const incomeCategories = categories.filter(cat => cat.type === 'income');

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
          Categories
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAddNew}>
          Add Category
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Expense Categories */}
      <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 2 }}>
        Expense Categories
      </Typography>
      <Grid container spacing={2}>
        {expenseCategories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: category.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      mr: 2,
                      fontSize: '0.9rem'
                    }}
                  >
                    {category.icon}
                  </Box>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {category.name}
                  </Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleEdit(category)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(category.id)} color="error">
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
                <Chip
                  label="Expense"
                  size="small"
                  color="error"
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Income Categories */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Income Categories
      </Typography>
      <Grid container spacing={2}>
        {incomeCategories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: category.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      mr: 2,
                      fontSize: '0.9rem'
                    }}
                  >
                    {category.icon}
                  </Box>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    {category.name}
                  </Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleEdit(category)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(category.id)} color="error">
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
                <Chip
                  label="Income"
                  size="small"
                  color="success"
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Category Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Category Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Type"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                  >
                    <MenuItem value="expense">Expense</MenuItem>
                    <MenuItem value="income">Income</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Color
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {predefinedColors.map((color) => (
                    <Box
                      key={color}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: color,
                        cursor: 'pointer',
                        border: formData.color === color ? '3px solid #000' : '2px solid #ccc',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Icon</InputLabel>
                  <Select
                    value={formData.icon}
                    label="Icon"
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  >
                    {predefinedIcons.map((icon) => (
                      <MenuItem key={icon} value={icon}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{icon}</span>
                          <Typography>{icon.replace(/_/g, ' ')}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingCategory ? 'Update' : 'Create'} Category
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Categories;