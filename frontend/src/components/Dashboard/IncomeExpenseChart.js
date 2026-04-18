import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const IncomeExpenseChart = ({ data }) => {
  if (!data) return null;

  // Transform data for Recharts
  const chartData = Object.entries(data).map(([month, values]) => ({
    month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    income: values.income,
    expenses: values.expenses
  })).sort((a, b) => new Date(a.month) - new Date(b.month));

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Income vs Expenses
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Monthly comparison
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
          <Legend />
          <Bar dataKey="income" fill="#4caf50" name="Income" />
          <Bar dataKey="expenses" fill="#f44336" name="Expenses" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default IncomeExpenseChart;