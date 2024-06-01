
const admin = require('firebase-admin');

const sendNotification = (token, title, body) => {
    const message = {
      notification: {
        title: title,
        body: body
      },
      token: token
    };
  
    admin.messaging().send(message)
      .then(response => {
        console.log('Successfully sent message:', response);
      })
      .catch(error => {
        console.log('Error sending message:', error);
      });
  };
  
//   // Example usage when a user follows another user
//   const userFollowsAnotherUser = (followerId, followedId) => {
//     // Fetch the device token of the followed user from your database
//     const followedUserToken = getDeviceToken(followedId); // Implement this function
  
//     sendNotification(followedUserToken, 'New Follower', 'You have a new follower!');
//   };
  
  module.exports = {
    sendNotification,
  };