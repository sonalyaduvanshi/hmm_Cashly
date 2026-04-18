const Split = require('../models/Split');
const Friend = require('../models/Friend');
const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');

// Get all splits
exports.getSplits = async (req, res) => {
  try {
    const splits = await Split.find({ 
      $or: [
        { paidBy: req.userId },
        { 'splits.user': req.userId }
      ]
    })
    .populate('paidBy', 'name email')
    .populate('splits.friend', 'name email')
    .sort({ date: -1 });

    res.json(splits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create split
exports.createSplit = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, category, description, date, paidBy, splitWith } = req.body;

    // Calculate split amounts
    const totalParticipants = splitWith.length + 1; // +1 for the user
    const perPersonAmount = amount / totalParticipants;

    // Create splits array
    const splits = splitWith.map(friendId => ({
      friend: friendId,
      amount: perPersonAmount,
      isPaid: false
    }));

    // Add the paying user's split
    splits.push({
      user: req.userId,
      amount: perPersonAmount,
      isPaid: paidBy === req.userId
    });

    // Create split transaction
    const split = new Split({
      paidBy: paidBy || req.userId,
      totalAmount: amount,
      category,
      description,
      date,
      splits
    });

    await split.save();

    // Update friend balances
    for (const friendId of splitWith) {
      const friend = await Friend.findOne({ _id: friendId, user: req.userId });
      if (friend) {
        if (paidBy === req.userId) {
          // Friend owes the user
          friend.balance += perPersonAmount;
        } else {
          // User owes the friend
          friend.balance -= perPersonAmount;
        }
        await friend.save();
      }
    }

    // Create expense transaction for the payer
    if (paidBy === req.userId) {
      const transaction = new Transaction({
        user: req.userId,
        type: 'expense',
        amount: amount,
        category,
        description: `Split: ${description}`,
        date,
        isRecurring: false
      });
      await transaction.save();
    }

    res.status(201).json(split);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Settle up with friend
exports.settleUp = async (req, res) => {
  try {
    const { friendId, amount } = req.body;

    const friend = await Friend.findOne({ _id: friendId, user: req.userId });
    if (!friend) {
      return res.status(404).json({ error: 'Friend not found' });
    }

    // Update friend balance
    friend.balance -= amount;
    await friend.save();

    // Create settlement transaction
    const transaction = new Transaction({
      user: req.userId,
      type: friend.balance > 0 ? 'income' : 'expense',
      amount: Math.abs(amount),
      category: 'Settlement',
      description: `Settled with ${friend.name}`,
      date: new Date(),
      isRecurring: false
    });
    await transaction.save();

    res.json({ message: 'Settled successfully', friend });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};