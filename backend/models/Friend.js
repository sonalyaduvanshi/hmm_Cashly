const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  balance: {
    type: Number,
    default: 0  // Positive means friend owes user, negative means user owes friend
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique friends per user
friendSchema.index({ user: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Friend', friendSchema);