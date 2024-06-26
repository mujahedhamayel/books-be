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
         // Increment the post count for the user
         await User.findByIdAndUpdate(req.user._id, { $inc: { postCount: 1 } });

        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all posts
exports.getPosts = async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'createDate', sortOrder = 'desc' } = req.query;

    try {
        const posts = await Post.find()
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const totalPosts = await Post.countDocuments();

        // Fetch and include user statistics for each post creator
        const postsWithUserStats = await Promise.all(posts.map(async (post) => {
            const user = await User.findById(post.id)
                .populate('books')
                .populate('likedBooks')
                .populate('requests')
                .populate('followedUsers', 'name email');

            if (user) {
                

                return {
                    ...post._doc,
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        imageUrl: user.imageUrl,
                        books: user.books,
                        likedBooks: user.likedBooks,
                        requests: user.requests,
                        followedUsers: user.followedUsers,
                        deviceToken: user.deviceToken,
                        postCount: user.postCount,
                        followersCount: user.followersCount,
                        followingCount: user.followingCount,
                        booksCount: user.booksCount,
                    }
                };
            } else {
                return {
                    ...post._doc,
                    user: null
                };
            }
        }));

        res.status(200).json({
            totalPosts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            posts: postsWithUserStats,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Get current user's posts
exports.getCurrentUserPosts = async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'createDate', sortOrder = 'desc' } = req.query;
    
    try {
        const posts = await Post.find({ id: req.user._id })
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const totalPosts = await Post.countDocuments({ id: req.user._id });

        // Fetch and include user statistics for each post creator
        const postsWithUserStats = await Promise.all(posts.map(async (post) => {
            const user = await User.findById(post.id)
                .populate('books')
                .populate('likedBooks')
                .populate('requests')
                .populate('followedUsers', 'name email');

            if (user) {
               
                return {
                    ...post._doc,
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        imageUrl: user.imageUrl,
                        books: user.books,
                        likedBooks: user.likedBooks,
                        requests: user.requests,
                        followedUsers: user.followedUsers,
                        deviceToken: user.deviceToken,
                        postCount: user.postCount,
                        followersCount: user.followersCount,
                        followingCount: user.followingCount,
                        booksCount: user.booksCount,
                    }
                };
            } else {
                return {
                    ...post._doc,
                    user: null
                };
            }
        }));

        res.status(200).json({
            totalPosts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            posts: postsWithUserStats,
        });
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
        // Decrement the post count for the user
        await User.findByIdAndUpdate(req.user._id, { $inc: { postCount: -1 } });
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
            res.status(200).json({ message: 'Post liked', post });
        } else {
            post.Like = post.Like.filter(userId => userId.toString() !== req.user._id.toString());
            res.status(200).json({ message: 'Post unliked', post });
        }

        await post.save();
        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Comment on a post (assuming comments are part of the post schema)
exports.commentOnPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        
        const user = req.user;
        const comment = {
            user: user._id,  // Just store the user ID in the comment
            text: req.body.text,
            date: new Date()
        };

        post.comments.push(comment);
        await post.save();

        // Populate the comments with user details
        const populatedPost = await Post.findById(post._id).populate({
            path: 'comments.user',
            select: 'name email imageUrl books likedBooks requests followedUsers deviceToken postCount followersCount followingCount booksCount' // Select the fields you need
        }).exec();

        res.status(201).json(populatedPost);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// In postsController.js
exports.getComments = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId).populate('comments.user', 'name imageUrl');
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Fetch and include full user details for each comment
        const commentsWithUserDetails = await Promise.all(post.comments.map(async (comment) => {
            const user = await User.findById(comment.user)
                .populate('books')
                .populate('likedBooks')
                .populate('requests')
                .populate('followedUsers', 'name email');

            if (user) {
                return {
                    ...comment._doc,
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        imageUrl: user.imageUrl,
                        books: user.books,
                        likedBooks: user.likedBooks,
                        requests: user.requests,
                        followedUsers: user.followedUsers,
                        deviceToken: user.deviceToken,
                        postCount: user.postCount,
                        followersCount: user.followersCount,
                        followingCount: user.followingCount,
                        booksCount: user.booksCount,
                    },
                };
            } else {
                return {
                    ...comment._doc,
                    user: null,
                };
            }
        }));

        res.status(200).json(commentsWithUserDetails);
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

// Get posts for a specific user by user ID
exports.getUserPosts = async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'createDate', sortOrder = 'desc' } = req.query;
    const userId = req.params.userId;

    try {
        const posts = await Post.find({ id: userId })
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const totalPosts = await Post.countDocuments({ id: userId });

        // Fetch and include user statistics for each post creator
        const postsWithUserStats = await Promise.all(posts.map(async (post) => {
            const user = await User.findById(post.id)
                .populate('books')
                .populate('likedBooks')
                .populate('requests')
                .populate('followedUsers', 'name email');

            if (user) {
                

                return {
                    ...post._doc,
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        imageUrl: user.imageUrl,
                        books: user.books,
                        likedBooks: user.likedBooks,
                        requests: user.requests,
                        followedUsers: user.followedUsers,
                        deviceToken: user.deviceToken,
                        postCount: user.postCount,
                        followersCount: user.followersCount,
                        followingCount: user.followingCount,
                        booksCount: user.booksCount,
                    }
                };
            } else {
                return {
                    ...post._doc,
                    user: null
                };
            }
        }));

        res.status(200).json({
            totalPosts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            posts: postsWithUserStats,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};