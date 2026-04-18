import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ReceiptIcon from '@mui/icons-material/Receipt';

const StatsCards = ({ walletBalance, totalIncome, totalExpenses, transactionCount }) => {
  const stats = [
    {
      title: 'Wallet Balance',
      value: `$${walletBalance.toFixed(2)}`,
      icon: <AccountBalanceWalletIcon />,
      color: '#2196f3'
    },
    {
      title: 'Total Income',
      value: `$${totalIncome.toFixed(2)}`,
      icon: <TrendingUpIcon />,
      color: '#4caf50'
    },
    {
      title: 'Total Expenses',
      value: `$${totalExpenses.toFixed(2)}`,
      icon: <TrendingDownIcon />,
      color: '#f44336'
    },
    {
      title: 'Transactions',
      value: transactionCount,
      icon: <ReceiptIcon />,
      color: '#ff9800'
    }
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" component="div" style={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Box style={{ color: stat.color }}>
                  {stat.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards;