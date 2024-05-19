'use strict';

const Post = require('../models/Post'); // Adjust the path to where your model is located
const User = require('../models/User'); // Assuming you have a User model

// Create a new post
exports.createPost = async (req, res) => {
    try {
        console.log("create post")
        const newPost = new Post({
            name: req.user.name,
            id: req.user._id,
            imageuser: req.user.profileImage, // Assuming the user has a profile image
            imagepost: req.body.imagepost,
            createDate: new Date().toISOString(),
            updateDate: new Date().toISOString(),
            description: req.body.description,
        });
        const post = await newPost.save();
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all posts (or could be used for getting a user's posts)
exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find({ id: req.user._id }); // Fetching only the posts of the logged-in user
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a specific post by ID
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update a post
exports.updatePost = async (req, res) => {
    try {
        const updatedPost = {
            ...req.body,
            updateDate: new Date() // Only update the updateDate field
        };
        const post = await Post.findOneAndUpdate(
            { _id: req.params.postId, id: req.user._id }, // Ensuring the user can only update their own posts
            updatedPost,
            { new: true, runValidators: true, context: 'query' } // Ensuring createDate is not updated
        );
        if (!post) return res.status(404).json({ message: 'Post not found or user not authorized' });
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete a post
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findOneAndDelete({ _id: req.params.postId, id: req.user._id });
        if (!post) return res.status(404).json({ message: 'Post not found or user not authorized' });
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Like a post
exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (!post.Like.includes(req.user._id)) {
            post.Like.push(req.user._id);
        } else {
            post.Like = post.Like.filter(userId => userId !== req.user._id);
        }

        await post.save();
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Comment on a post (assuming comments are part of the post schema)
exports.commentOnPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = {
            user: req.user._id,
            text: req.body.text,
            date: new Date().toISOString()
        };

        post.comments.push(comment); // Assuming comments is an array in the post schema
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Like a comment
exports.likeComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        if (!comment.likes.includes(req.user._id)) {
            comment.likes.push(req.user._id);
        } else {
            comment.likes = comment.likes.filter(userId => userId !== req.user._id);
        }

        await post.save();
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
