const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const friendController = require('../controllers/friendController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get friends
router.get('/', friendController.getFriends);

// Add friend
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], friendController.addFriend);

// Update friend
router.put('/:id', [
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail()
], friendController.updateFriend);

// Delete friend
router.delete('/:id', friendController.deleteFriend);

module.exports = router;