const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const verifyToken = require('../middlewares/verifyToken');

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.get('/profile', verifyToken, authController.getUserProfile);
router.post('/:userId/follow', verifyToken, authController.followUser);

router.post('/logout', authController.logout);


module.exports = router;