const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const verifyToken = require('../middlewares/verifyToken');
const User = require('../models/User'); // Assuming you have a User model
const NotificationService = require('../services/notification_service'); // Assuming you have a User model

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.get('/profile', verifyToken, authController.getUserProfile);
router.post('/:userId/follow', verifyToken, authController.followUser);

router.post('/logout', authController.logout);

router.post('/update-token', verifyToken, async (req, res) => {
    try {
      const { deviceToken } = req.body;
      await User.findByIdAndUpdate(req.user._id, { deviceToken: deviceToken });
      res.status(200).send({ message: 'Device token updated successfully' });
      NotificationService.sendNotification(deviceToken, "Test Not", "Hello World!")
    } catch (error) {
      console.error("updateToken error: ", error);
      res.status(500).send({ message: 'Server error', error: error.message });
    }
  });

module.exports = router;