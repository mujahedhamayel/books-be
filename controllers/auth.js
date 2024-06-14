const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const Post = require('../models/Post');
const NotificationService = require('../services/notification_service'); 

const Book = require('../models/Book');

// const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");
// const multer = require('multer');
// const upload = multer({ storage: multer.memoryStorage() });

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
    const user = await User.findById(req.user._id)
      .populate('books')
      .populate('likedBooks')
      .populate('requests')
      .populate('followedUsers', 'name email')
      .populate('imageUrl')
      .populate('deviceToken');

    if (!user) {
      return res.status(404).send({
        message: 'User not found'
      });
    }

    return res.status(200).send({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
        birthday: user.birthday,
        books: user.books,
        likedBooks: user.likedBooks,
        requests: user.requests,
        followedUsers: user.followedUsers,
        deviceToken: user.deviceToken,
        postCount: user.postCount,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        booksCount: user.booksCount,
        location: user.location
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


// Example controller method
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('books').populate('likedBooks').populate('requests').populate('followedUsers');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude passwords from the response
    res.status(200).json(users);
  } catch (error) {
    console.error("getAllUsers error: ", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
exports.getFollowedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id)
      .populate('followedUsers', 'name email imageUrl'); // Populate the followedUsers field with specific details

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(currentUser.followedUsers);
  } catch (error) {
    console.error(`getFollowedUsers error: ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Controller method

exports.getUserByName = async (req, res) => {
  try {
    console.log(`Searching for user with name: ${req.params.name}`);
    const user = await User.findOne({ name: req.params.name })
      .populate('books')
      .populate('likedBooks')
      .populate('requests')
      .populate('followedUsers');

    if (!user) {
      console.log(`User with name ${req.params.name} not found`);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`User found: ${user}`);
    res.json(user);
  } catch (error) {
    console.error(`Server error: ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
exports.addChattedUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.user._id);

    if (!currentUser.chattedUsers.includes(userId)) {
      currentUser.chattedUsers.push(userId);
      await currentUser.save();
    }

    res.status(200).json({ message: 'User added to chatted list' });
  } catch (error) {
    console.error(`addChattedUser error: ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getChattedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id)
      .populate('chattedUsers', 'name email imageUrl'); // Populate chattedUsers field

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(currentUser.chattedUsers);
  } catch (error) {
    console.error(`getChattedUsers error: ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
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
      await User.findByIdAndUpdate(req.user._id, { 
        $pull: { followedUsers: req.params.userId },
        $inc: { followingCount: -1 }
      });
      await User.findByIdAndUpdate(req.params.userId, {
        $inc: { followersCount: -1 }
      });
      return res.status(200).json({ message: 'User unfollowed successfully' });
    } else {
      // Follow the user
      await User.findByIdAndUpdate(req.user._id, { 
        $push: { followedUsers: req.params.userId },
        $inc: { followingCount: 1 }
      });
      await User.findByIdAndUpdate(req.params.userId, {
        $inc: { followersCount: 1 }
      });

      // Remove from chattedUsers if present
      await User.findByIdAndUpdate(req.user._id, { $pull: { chattedUsers: req.params.userId } });

      // Send notification to the followed user
      if (userToFollow.deviceToken) {
        NotificationService.sendNotification(
          userToFollow.deviceToken,
          'New Follower',
          `${currentUser.name} has followed you!`
        );
      }

      return res.status(200).json({ message: 'User followed successfully' });
    }
  } catch (error) {
    console.error("followUser error: ", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateUserProfilePhoto = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.imageUrl = imageUrl;
    await user.save();

    res.status(200).json({ message: 'Profile photo updated successfully', imageUrl });
  } catch (error) {
    console.error('updateUserProfilePhoto error: ', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.logout = (req, res) => {
  //res.redirect('/login/login');
  req.session.destroy();
  res.send(" logout done ");
};
