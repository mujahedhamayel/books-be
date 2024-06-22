
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
  

  
  module.exports = {
    sendNotification,
  };