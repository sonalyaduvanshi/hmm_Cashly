import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Tabs, 
  Tab,
  Button,
  TextField,
  MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import StatsCards from './StatsCards';
import IncomeExpenseChart from './IncomeExpenseChart';
import TransactionList from '../Transactions/TransactionList';
import TransactionForm from '../Transactions/TransactionForm';
import RecurringTransactions from '../Transactions/RecurringTransactions';
import FriendList from '../Friends/FriendList';
import SplitForm from '../Splits/SplitForm';
import { transactionService } from '../../services/transactionService';
import { friendService } from '../../services/friendService';
import { useAuth } from '../../contexts/AuthContext';

function Dashboard() {
  const { user, updateUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [friends, setFriends] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showSplitForm, setShowSplitForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const month = selectedMonth.getMonth() + 1;
      const year = selectedMonth.getFullYear();

      const [transactionsData, friendsData, statsData] = await Promise.all([
        transactionService.getTransactions({ month, year }),
        friendService.getFriends(),
        transactionService.getStatistics()
      ]);

      setTransactions(transactionsData);
      setFriends(friendsData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionCreated = (data) => {
    updateUser({ ...user, walletBalance: data.walletBalance });
    fetchData();
    setShowTransactionForm(false);
  };

  const handleSplitCreated = () => {
    fetchData();
    setShowSplitForm(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12}>
          <StatsCards 
            walletBalance={user?.walletBalance || 0}
            totalIncome={statistics?.totalIncome || 0}
            totalExpenses={statistics?.totalExpenses || 0}
            transactionCount={transactions.length}
          />
        </Grid>

        {/* Add Transaction and Monthly Filter */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Add Transaction
            </Typography>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={() => setShowTransactionForm(true)}
            >
              Add Transaction
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Filter
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={selectedMonth}
                onChange={setSelectedMonth}
                views={['year', 'month']}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Paper>
        </Grid>

        {/* Main Content Tabs */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
              <Tab label="Overview" />
              <Tab label="Transactions" />
              <Tab label="Friends" />
              <Tab label="Splits" />
            </Tabs>

            <Box sx={{ mt: 2 }}>
              {tabValue === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <IncomeExpenseChart data={statistics?.monthlyData} />
                  </Grid>
                  <Grid item xs={12}>
                    <TransactionList 
                      transactions={transactions} 
                      onUpdate={fetchData}
                    />
                  </Grid>
                </Grid>
              )}

              {tabValue === 1 && (
                <Box>
                  <RecurringTransactions onProcess={fetchData} />
                  <TransactionList 
                    transactions={transactions} 
                    onUpdate={fetchData}
                  />
                </Box>
              )}

              {tabValue === 2 && (
                <FriendList friends={friends} onUpdate={fetchData} />
              )}

              {tabValue === 3 && (
                <Box>
                  <Button 
                    variant="contained" 
                    onClick={() => setShowSplitForm(true)}
                    sx={{ mb: 2 }}
                  >
                    Split Expense
                  </Button>
                  {/* Split History Component would go here */}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Transaction Form Dialog */}
      {showTransactionForm && (
        <TransactionForm 
          open={showTransactionForm}
          onClose={() => setShowTransactionForm(false)}
          onSubmit={handleTransactionCreated}
        />
      )}

      {/* Split Form Dialog */}
      {showSplitForm && (
        <SplitForm
          open={showSplitForm}
          onClose={() => setShowSplitForm(false)}
          onSubmit={handleSplitCreated}
          friends={friends}
        />
      )}
    </Container>
  );
}

export default Dashboard;