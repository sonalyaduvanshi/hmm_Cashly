import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteIcon from '@mui/icons-material/Delete';
import { transactionService } from '../../services/transactionService';
import { formatDate, formatCurrency } from '../../utils/formatters';

const RecurringTransactions = ({ onProcess }) => {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRecurringTransactions();
  }, []);

  const fetchRecurringTransactions = async () => {
    try {
      const transactions = await transactionService.getTransactions();
      const recurring = transactions.filter(t => t.isRecurring);
      setRecurringTransactions(recurring);
    } catch (error) {
      console.error('Error fetching recurring transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRecurring = async () => {
    setProcessing(true);
    try {
      const result = await transactionService.processRecurringTransactions();
      alert(result.message);
      onProcess();
      fetchRecurringTransactions();
    } catch (error) {
      console.error('Error processing recurring transactions:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleStatus = async (transaction) => {
    const newStatus = transaction.recurringDetails.status === 'active' ? 'paused' : 'active';
    try {
      await transactionService.updateTransaction(transaction._id, {
        recurringDetails: {
          ...transaction.recurringDetails,
          status: newStatus
        }
      });
      fetchRecurringTransactions();
    } catch (error) {
      console.error('Error updating transaction status:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recurring transaction?')) {
      try {
        await transactionService.deleteTransaction(id);
        fetchRecurringTransactions();
        onProcess();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Recurring Transactions</Typography>
        <Button
          variant="contained"
          onClick={handleProcessRecurring}
          disabled={processing}
          startIcon={processing ? <CircularProgress size={20} /> : null}
        >
          Process Pending Recurring Transactions
        </Button>
      </Box>

      {recurringTransactions.length === 0 ? (
        <Typography color="textSecondary">No recurring transactions set up</Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell>Next Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recurringTransactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>
                    <Chip
                      label={transaction.type}
                      color={transaction.type === 'income' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>{transaction.recurringDetails.frequency}</TableCell>
                  <TableCell>
                    {formatDate(transaction.recurringDetails.nextDate)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.recurringDetails.status}
                      color={transaction.recurringDetails.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleToggleStatus(transaction)}
                      color={transaction.recurringDetails.status === 'active' ? 'warning' : 'success'}
                    >
                      {transaction.recurringDetails.status === 'active' ? <PauseIcon /> : <PlayArrowIcon />}
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(transaction._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default RecurringTransactions;