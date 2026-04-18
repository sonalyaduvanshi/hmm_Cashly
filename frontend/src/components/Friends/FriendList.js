import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { friendService } from '../../services/friendService';

const FriendList = ({ friends, onUpdate }) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newFriend, setNewFriend] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);

  const handleAddFriend = async () => {
    if (!newFriend.name || !newFriend.email) return;

    setLoading(true);
    try {
      await friendService.addFriend(newFriend);
      setNewFriend({ name: '', email: '' });
      setShowAddDialog(false);
      onUpdate();
    } catch (error) {
      console.error('Error adding friend:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFriend = async (friendId) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) return;

    try {
      await friendService.deleteFriend(friendId);
      onUpdate();
    } catch (error) {
      console.error('Error deleting friend:', error);
    }
  };

  const getBalanceDisplay = (balance) => {
    if (balance > 0) {
      return <Chip label={`Owes you: $${balance.toFixed(2)}`} color="success" size="small" />;
    } else if (balance < 0) {
      return <Chip label={`You owe: $${Math.abs(balance).toFixed(2)}`} color="error" size="small" />;
    } else {
      return <Chip label="Settled up" color="default" size="small" />;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Friends</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddDialog(true)}
        >
          Add Friend
        </Button>
      </Box>

      <Grid container spacing={2}>
        {/* Current User Card */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ backgroundColor: '#f5f5f5' }}>
            <CardContent>
              <Typography variant="h6">You</Typography>
              <Typography color="textSecondary" gutterBottom>
                {JSON.parse(localStorage.getItem('user'))?.email}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Friend Cards */}
        {friends.map((friend) => (
          <Grid item xs={12} md={4} key={friend._id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Box>
                    <Typography variant="h6">{friend.name}</Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {friend.email}
                    </Typography>
                    <Box mt={1}>
                      {getBalanceDisplay(friend.balance)}
                    </Box>
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteFriend(friend._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Friend Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Friend</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Friend's name"
                value={newFriend.name}
                onChange={(e) => setNewFriend({ ...newFriend, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Friend's email"
                type="email"
                value={newFriend.email}
                onChange={(e) => setNewFriend({ ...newFriend, email: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddFriend} 
            variant="contained" 
            disabled={loading || !newFriend.name || !newFriend.email}
          >
            Add Friend
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FriendList;