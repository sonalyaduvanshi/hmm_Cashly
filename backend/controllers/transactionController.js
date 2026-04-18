const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Helper: Apply transaction effect
const applyTransactionToBalance = (user, type, amount) => {
  amount = parseFloat(amount);
  if (type === 'income') user.walletBalance += amount;
  else user.walletBalance -= amount;
};

// Helper: Reverse transaction effect
const reverseTransactionFromBalance = (user, type, amount) => {
  amount = parseFloat(amount);
  if (type === 'income') user.walletBalance -= amount;
  else user.walletBalance += amount;
};

// Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    const { month, year, type } = req.query;
    const filter = { user: req.userId };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    if (type) {
      filter.type = type;
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ Create transaction with balance check
exports.createTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, amount, category, description, date, isRecurring, recurringDetails } = req.body;
    const parsedAmount = parseFloat(amount);

    if (parsedAmount < 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    const user = await User.findById(req.userId);

    // ❗Block overspending
    if (type === 'expense' && parsedAmount > user.walletBalance) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    const transaction = new Transaction({
      user: req.userId,
      type,
      amount: parsedAmount,
      category,
      description,
      date,
      isRecurring,
      recurringDetails
    });

    await transaction.save();
    applyTransactionToBalance(user, type, parsedAmount);

    if (Math.abs(user.walletBalance) > 1e9) {
      return res.status(500).json({ error: 'Unrealistic wallet balance detected!' });
    }

    await user.save();
    res.status(201).json({ transaction, walletBalance: user.walletBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ Update transaction with balance check
exports.updateTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.userId });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const oldAmount = parseFloat(transaction.amount);
    const oldType = transaction.type;

    const user = await User.findById(req.userId);
    reverseTransactionFromBalance(user, oldType, oldAmount); // remove old effect

    // Prepare new transaction data
    Object.assign(transaction, req.body);
    transaction.amount = parseFloat(transaction.amount);

    // Check overspending on updated amount
    if (
      transaction.type === 'expense' &&
      transaction.amount > user.walletBalance
    ) {
      // Restore old state
      applyTransactionToBalance(user, oldType, oldAmount);
      return res.status(400).json({ error: 'Insufficient wallet balance for this update' });
    }

    applyTransactionToBalance(user, transaction.type, transaction.amount);
    await transaction.save();

    if (Math.abs(user.walletBalance) > 1e9) {
      return res.status(500).json({ error: 'Unrealistic wallet balance detected!' });
    }

    await user.save();
    res.json({ transaction, walletBalance: user.walletBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.userId });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const user = await User.findById(req.userId);
    reverseTransactionFromBalance(user, transaction.type, transaction.amount);

    if (Math.abs(user.walletBalance) > 1e9) {
      return res.status(500).json({ error: 'Unrealistic wallet balance detected!' });
    }

    await user.save();
    await transaction.deleteOne();

    res.json({ message: 'Transaction deleted', walletBalance: user.walletBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get statistics
exports.getStatistics = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.userId });

    const stats = {
      totalIncome: 0,
      totalExpenses: 0,
      monthlyData: {}
    };

    transactions.forEach(transaction => {
      const amt = parseFloat(transaction.amount);

      if (transaction.type === 'income') {
        stats.totalIncome += amt;
      } else {
        stats.totalExpenses += amt;
      }

      const monthKey = `${transaction.date.getFullYear()}-${transaction.date.getMonth() + 1}`;
      if (!stats.monthlyData[monthKey]) {
        stats.monthlyData[monthKey] = { income: 0, expenses: 0 };
      }

      if (transaction.type === 'income') {
        stats.monthlyData[monthKey].income += amt;
      } else {
        stats.monthlyData[monthKey].expenses += amt;
      }
    });

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Process recurring transactions
exports.processRecurringTransactions = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recurringTransactions = await Transaction.find({
      user: req.userId,
      isRecurring: true,
      'recurringDetails.status': 'active',
      'recurringDetails.nextDate': { $lte: today }
    });

    const newTransactions = [];
    let balanceChange = 0;

    for (const recurring of recurringTransactions) {
      const amt = parseFloat(recurring.amount);

      const newTransaction = new Transaction({
        user: recurring.user,
        type: recurring.type,
        amount: amt,
        category: recurring.category,
        description: recurring.description,
        date: new Date(),
        isRecurring: false
      });

      await newTransaction.save();
      newTransactions.push(newTransaction);

      if (recurring.type === 'income') {
        balanceChange += amt;
      } else {
        balanceChange -= amt;
      }

      // Update nextDate
      const nextDate = new Date(recurring.recurringDetails.nextDate);
      switch (recurring.recurringDetails.frequency) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }

      recurring.recurringDetails.nextDate = nextDate;
      await recurring.save();
    }

    const user = await User.findById(req.userId);
    user.walletBalance += balanceChange;

    if (Math.abs(user.walletBalance) > 1e9) {
      return res.status(500).json({ error: 'Unrealistic wallet balance detected!' });
    }

    await user.save();

    res.json({
      message: `Processed ${newTransactions.length} recurring transactions`,
      transactions: newTransactions,
      walletBalance: user.walletBalance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};