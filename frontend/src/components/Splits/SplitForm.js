import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { splitService } from '../../services/splitService';

const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Other'];

const SplitForm = ({ open, onClose, onSubmit, friends }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date(),
    paidBy: 'me',
    splitWith: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFriendToggle = (friendId) => {
    const newSplitWith = formData.splitWith.includes(friendId)
      ? formData.splitWith.filter(id => id !== friendId)
      : [...formData.splitWith, friendId];
    setFormData({ ...formData, splitWith: newSplitWith });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.description) {
      newErrors.description = 'Description is required';
    }
    if (formData.splitWith.length === 0) {
      newErrors.splitWith = 'Select at least one friend to split with';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const data = {
        ...formData,
        paidBy: formData.paidBy === 'me' ? undefined : formData.paidBy
      };
      await splitService.createSplit(data);
      onSubmit();
    } catch (error) {
      console.error('Error creating split:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSplitAmount = () => {
    if (!formData.amount || formData.splitWith.length === 0) return 0;
    return (parseFloat(formData.amount) / (formData.splitWith.length + 1)).toFixed(2);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Split Expense</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="amount"
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              error={!!errors.amount}
              helperText={errors.amount}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.category}>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Category"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="description"
              label="What was this expense for?"
              value={formData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
              placeholder="Dinner at restaurant"
            />
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Paid by</InputLabel>
              <Select
                name="paidBy"
                value={formData.paidBy}
                onChange={handleChange}
                label="Paid by"
              >
                <MenuItem value="me">You</MenuItem>
                {friends.map((friend) => (
                  <MenuItem key={friend._id} value={friend._id}>
                    {friend.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(newValue) => setFormData({ ...formData, date: newValue })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Split with
            </Typography>
            {errors.splitWith && (
              <Typography color="error" variant="caption">
                {errors.splitWith}
              </Typography>
            )}
            <Box>
              {friends.map((friend) => (
                <FormControlLabel
                  key={friend._id}
                  control={
                    <Checkbox
                      checked={formData.splitWith.includes(friend._id)}
                      onChange={() => handleFriendToggle(friend._id)}
                    />
                  }
                  label={friend.name}
                />
              ))}
            </Box>
          </Grid>

          {formData.amount && formData.splitWith.length > 0 && (
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Split amount per person:
                </Typography>
                <Typography variant="h6">
                  ${calculateSplitAmount()}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  (${formData.amount} ÷ {formData.splitWith.length + 1} people)
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Split Expense
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SplitForm;