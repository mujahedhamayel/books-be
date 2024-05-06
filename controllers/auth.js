const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');

exports.signup = async (req, res) => {
  const newUser = new User(req.body);
  newUser.id = uuid.v4();
  newUser.password = bcrypt.hashSync(req.body.password, 10);
  try {
    const user = await newUser.save();
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    return res.status(200).send({
      token: token
    });
  }
  catch (err) {
    return res.status(500).send({
      message: err
    });
  }
};

exports.login = async (req, res) => {
  try {
    console.log("exports.login ")
    const { email, password } = req.body;
    // Find the user by email
    console.log("email :"+email)
    console.log("password :"+password)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    console.log("user "+ user)
    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);
  
    console.log("passwordMatch "+passwordMatch)
    if (!passwordMatch) {
      return res.status(401).send({ message: 'Incorrect password' });
    }
    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    console.log("login JWT: " + token)
    return res.status(200).send({
      token: token
    });
  } catch (error) {
    return res.status(500).send({
      message: error
    });
  }
};

exports.getUserProfile = (req, res) => {
  console.log("getUserProfile")
  return res.status(200).send({
    user: req.user
  });
};

exports.logout = (req, res) => {

};
