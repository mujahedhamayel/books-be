'use strict';

const express = require('express');
const router = express.Router();
const postController = require('../controllers/postsController');
const authMiddleware = require('../middlewares/verifyToken'); // Assuming you have an authentication middleware

// Routes for posts
router.post('/', authMiddleware, postController.createPost);
router.get('/', authMiddleware, postController.getPosts);
router.get('/:postId', authMiddleware, postController.getPostById);
router.put('/:postId', authMiddleware, postController.updatePost);
router.delete('/:postId', authMiddleware, postController.deletePost);
router.post('/:postId/like', authMiddleware, postController.likePost);
router.post('/:postId/comment', authMiddleware, postController.commentOnPost);
router.post('/:postId/comments/:commentId/like', authMiddleware, postController.likeComment);

module.exports = router;
