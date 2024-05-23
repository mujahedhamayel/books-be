const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const verifyToken = require('../middlewares/verifyToken');

router.get('/books', verifyToken, searchController.searchBooks);
router.get('/users', verifyToken, searchController.searchUsers);
router.get('/posts', verifyToken, searchController.searchPosts);

module.exports = router;