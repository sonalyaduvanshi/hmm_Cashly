
import React, { useState } from 'react';
import friendService from '../../services/friendService';

const AddFriend = ({ onFriendAdded }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await friendService.addFriend({ name, email });
      setSuccess('Friend added successfully!');
      setName('');
      setEmail('');
      if (onFriendAdded) onFriendAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add friend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-friend-container">
      <h3>Add Friend</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Friend'}
        </button>
      </form>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
    </div>
  );
};

export default AddFriend;