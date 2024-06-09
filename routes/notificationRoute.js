const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/verifyToken');

// Middleware to verify token for all routes
router.use(authMiddleware);

// Create a new book
router.post('/chat/:userId/:message', notificationController.sendChat);


module.exports = router;
