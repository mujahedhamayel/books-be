const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send({ message: 'Access denied. No token provided.' });
  }

  try {
    console.log("token: "+token)
    console.log("Secret Key:", process.env.JWT_SECRET);

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    console.log("user id: " + decodedToken.id)

    const user = await User.findOne({id: decodedToken.id});
    

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    req.user = user;
  

    next();
  } catch (error) {
    console.error(error.message);
    console.error(error.stack);
    return res.status(400).send({ message: error });
  }
};

module.exports = verifyToken;
