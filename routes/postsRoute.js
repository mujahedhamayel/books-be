'use strict';

const express = require('express');
const router = express.Router();
const postController = require('../controllers/postsController');
const authMiddleware = require('../middlewares/verifyToken'); // Assuming you have an authentication middleware

// Routes for posts
router.post('/', authMiddleware, postController.createPost);
router.get('/', authMiddleware, postController.getPosts);
// Get current user's posts
router.get('/me',authMiddleware, postController.getCurrentUserPosts);
router.get('/:postId', authMiddleware, postController.getPostById);
router.put('/:postId', authMiddleware, postController.updatePost);
router.delete('/:postId', authMiddleware, postController.deletePost);
router.post('/:postId/like', authMiddleware, postController.likePost);
router.post('/:postId/comment', authMiddleware, postController.commentOnPost);
router.post('/:postId/comments/:commentId/like', authMiddleware, postController.likeComment);
// Add this route to your posts router
router.get('/:postId/comments', authMiddleware, postController.getComments);



router.get('/user/:userId', authMiddleware, postController.getUserPosts);
module.exports = router;
