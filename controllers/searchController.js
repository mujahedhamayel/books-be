const Book = require('../models/Book');
const User = require('../models/User');
const Post = require('../models/Post');

// Search for books
exports.searchBooks = async (req, res) => {
    console.log("mo mo ");
    try {
        const { query } = req.query;
        const books = await Book.find({ 
            $or: [
                { title: new RegExp(query, 'i') },
                { author: new RegExp(query, 'i') }
            ]
        }).populate('owner', 'name email');
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Search for users
exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const users = await User.find({
            $or: [
                { name: new RegExp(query, 'i') },
                { email: new RegExp(query, 'i') }
            ]
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Search for posts
exports.searchPosts = async (req, res) => {
    try {
        const { query } = req.query;
        const posts = await Post.find({ 
            description: new RegExp(query, 'i')
        }).populate('id', 'name email'); // id is for the owner (the name in post schema is "id")
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
