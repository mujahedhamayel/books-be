const Post = require('../models/Post'); 
const User = require('../models/User'); 
const NotificationService = require('../services/notification_service'); 



exports.sendChat = async (req, res) => {
    try {
        const { userId, message } = req.params;
        const user = await User.findById(userId);
        
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        const currentUser = await User.findById(req.user._id);
        
        NotificationService.sendNotification(
          user.deviceToken,
          `${currentUser.name}`,
          message 
        );
    
        res.status(200).json({ message: 'Notification sent successfully' });
      } catch (error) {
        console.error('sendChat error: ', error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }

}