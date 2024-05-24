const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const Post = require('../models/Post');

const Book = require('../models/Book');

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

exports.getUserProfile = async (req, res) => {
  try {
    // Find the user and populate relevant fields
    const user = await User.findById(req.user._id)
      .populate('books') // Populate the books field
      .populate('likedBooks') // Populate the likedBooks field
      .populate('requests') // Populate the requests field
      .populate('followedUsers', 'name email'); // Populate the followedUsers field

    if (!user) {
      return res.status(404).send({
        message: 'User not found'
      });
    }

    // Count the number of posts created by the user
    const postCount = await Post.countDocuments({ id: req.user._id });

    // Count the number of followers (users who follow the current user)
    const followersCount = await User.countDocuments({ followedUsers: req.user._id });

    // Count the number of users the current user is following
    const followingCount = user.followedUsers.length;

    // Count the number of books the user has added
    const booksCount = user.books.length;

    return res.status(200).send({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        birthday: user.birthday,
        books: user.books,
        likedBooks: user.likedBooks,
        requests: user.requests,
        followedUsers: user.followedUsers,
        postCount: postCount,
        followersCount: followersCount,
        followingCount: followingCount,
        booksCount: booksCount
      }
    });
  } catch (error) {
    console.error("getUserProfile error: ", error);
    return res.status(500).send({
      message: 'Server error',
      error: error.message
    });
  }
};

// Follow or unfollow a user
exports.followUser = async (req, res) => {
  try {
      const userToFollow = await User.findById(req.params.userId);
      if (!userToFollow) {
          return res.status(404).json({ message: 'User not found' });
      }

      const currentUser = await User.findById(req.user._id);

      // Check if the user is already following the other user
      if (currentUser.followedUsers.includes(req.params.userId)) {
          // Unfollow the user
          await User.findByIdAndUpdate(req.user._id, { $pull: { followedUsers: req.params.userId } });
          return res.status(200).json({ message: 'User unfollowed successfully' });
      } else {
          // Follow the user
          await User.findByIdAndUpdate(req.user._id, { $push: { followedUsers: req.params.userId } });
          return res.status(200).json({ message: 'User followed successfully' });
      }
  } catch (error) {
      console.error("followUser error: ", error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.logout = (req, res) => {
  //res.redirect('/login/login');
  req.session.destroy();
  res.send(" logout done ");
};
