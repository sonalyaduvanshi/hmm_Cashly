const Friend = require('../models/Friend');
const { validationResult } = require('express-validator');

// Get all friends
exports.getFriends = async (req, res) => {
  try {
    const friends = await Friend.find({ user: req.userId });
    res.json(friends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add friend
exports.addFriend = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email } = req.body;

    // Check if friend already exists
    const existingFriend = await Friend.findOne({ user: req.userId, email });
    if (existingFriend) {
      return res.status(400).json({ error: 'Friend already exists' });
    }

    const friend = new Friend({
      user: req.userId,
      name,
      email
    });

    await friend.save();
    res.status(201).json(friend);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update friend
exports.updateFriend = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const friend = await Friend.findOne({ _id: req.params.id, user: req.userId });
    if (!friend) {
      return res.status(404).json({ error: 'Friend not found' });
    }

    Object.assign(friend, req.body);
    await friend.save();
    res.json(friend);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete friend
exports.deleteFriend = async (req, res) => {
  try {
    const friend = await Friend.findOne({ _id: req.params.id, user: req.userId });
    if (!friend) {
      return res.status(404).json({ error: 'Friend not found' });
    }

    await friend.deleteOne();
    res.json({ message: 'Friend deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};