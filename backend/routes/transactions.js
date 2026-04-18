const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get transactions
router.get('/', transactionController.getTransactions);

// Get statistics
router.get('/statistics', transactionController.getStatistics);

// Process recurring transactions
router.post('/process-recurring', transactionController.processRecurringTransactions);

// Create transaction
router.post('/', [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('category').notEmpty().withMessage('Category is required'),
  body('date').isISO8601().withMessage('Valid date is required')
], transactionController.createTransaction);

// Update transaction
router.put('/:id', [
  body('type').optional().isIn(['income', 'expense']),
  body('amount').optional().isFloat({ min: 0 }),
  body('category').optional().notEmpty(),
  body('date').optional().isISO8601()
], transactionController.updateTransaction);

// Delete transaction
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;