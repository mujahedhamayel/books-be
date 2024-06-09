const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const verifyToken = require('../middlewares/verifyToken');
const User = require('../models/User'); // Assuming you have a User model
const NotificationService = require('../services/notification_service'); // Assuming you have a User model

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', verifyToken, authController.logout);
router.get('/profile', verifyToken, authController.getUserProfile);
router.get('/users', verifyToken, authController.getAllUsers);

router.get('/followed-users', verifyToken, authController.getFollowedUsers);
router.get('/chatted-users', verifyToken, authController.getChattedUsers);

router.get('/:userId', verifyToken, authController.getUserById);

router.get('/name/:name', verifyToken, authController.getUserByName);
router.post('/:userId/chat', verifyToken, authController.addChattedUser);


router.post('/:userId/follow', verifyToken, authController.followUser);

router.get('/:userId/is-following', verifyToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const isFollowing = currentUser.followedUsers.includes(req.params.userId);
    res.status(200).json({ isFollowing });
  } catch (error) {
    console.error("isFollowing error: ", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});




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

  router.put('/:userId/update-photo', verifyToken, authController.updateUserProfilePhoto);


module.exports = router;