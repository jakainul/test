import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Refresh
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import axios from 'axios';
import { TransactionSummary, Transaction } from '../types';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('thisMonth');

  const getDateRange = (range: string) => {
    const now = new Date();
    switch (range) {
      case 'last7days':
        return {
          startDate: format(subDays(now, 7), 'yyyy-MM-dd'),
          endDate: format(now, 'yyyy-MM-dd')
        };
      case 'last30days':
        return {
          startDate: format(subDays(now, 30), 'yyyy-MM-dd'),
          endDate: format(now, 'yyyy-MM-dd')
        };
      case 'thisMonth':
        return {
          startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(now), 'yyyy-MM-dd')
        };
      case 'all':
      default:
        return {};
    }
  };

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dateParams = getDateRange(dateRange);
      const params = new URLSearchParams();
      
      if (dateParams.startDate) params.append('startDate', dateParams.startDate);
      if (dateParams.endDate) params.append('endDate', dateParams.endDate);

      const response = await axios.get(`/transactions/summary/stats?${params}`);
      setSummary(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch summary data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [dateRange]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <IconButton color="inherit" size="small" onClick={fetchSummary}>
          <Refresh />
        </IconButton>
      }>
        {error}
      </Alert>
    );
  }

  if (!summary) {
    return (
      <Alert severity="info">
        No data available. Start by adding some transactions!
      </Alert>
    );
  }

  const { summary: stats, categoryBreakdown, recentTransactions } = summary;

  // Prepare data for charts
  const expenseData = categoryBreakdown
    .filter(cat => cat.type === 'expense')
    .map(cat => ({
      name: cat.name,
      value: cat.total,
      color: cat.color
    }));

  const incomeData = categoryBreakdown
    .filter(cat => cat.type === 'income')
    .map(cat => ({
      name: cat.name,
      value: cat.total,
      color: cat.color
    }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Financial Overview
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Period</InputLabel>
            <Select
              value={dateRange}
              label="Time Period"
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="last7days">Last 7 Days</MenuItem>
              <MenuItem value="last30days">Last 30 Days</MenuItem>
              <MenuItem value="thisMonth">This Month</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={fetchSummary}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
                <Typography color="textSecondary" gutterBottom>
                  Total Income
                </Typography>
              </Box>
              <Typography variant="h5" component="div" color="success.main">
                {formatCurrency(stats.income)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingDown sx={{ color: 'error.main', mr: 1 }} />
                <Typography color="textSecondary" gutterBottom>
                  Total Expenses
                </Typography>
              </Box>
              <Typography variant="h5" component="div" color="error.main">
                {formatCurrency(stats.expenses)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalance sx={{ color: stats.balance >= 0 ? 'success.main' : 'error.main', mr: 1 }} />
                <Typography color="textSecondary" gutterBottom>
                  Net Balance
                </Typography>
              </Box>
              <Typography 
                variant="h5" 
                component="div" 
                color={stats.balance >= 0 ? 'success.main' : 'error.main'}
              >
                {formatCurrency(stats.balance)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Expense Breakdown Chart */}
        {expenseData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Expense Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Income Breakdown Chart */}
        {incomeData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Income Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            {recentTransactions.length === 0 ? (
              <Typography color="textSecondary">
                No transactions found. Start by adding your first transaction!
              </Typography>
            ) : (
              <List>
                {recentTransactions.map((transaction) => (
                  <ListItem key={transaction.id} divider>
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: transaction.category_color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.8rem'
                        }}
                      >
                        {transaction.category_icon}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1">
                            {transaction.description}
                          </Typography>
                          <Typography
                            variant="h6"
                            color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                          >
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Chip
                            label={transaction.category_name}
                            size="small"
                            sx={{
                              backgroundColor: transaction.category_color,
                              color: 'white'
                            }}
                          />
                          <Typography variant="body2" color="textSecondary">
                            {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;