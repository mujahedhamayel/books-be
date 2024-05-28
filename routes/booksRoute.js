const express = require('express');
const router = express.Router();
const bookController = require('../controllers/booksController');
const authMiddleware = require('../middlewares/verifyToken');

// Middleware to verify token for all routes
router.use(authMiddleware);

// Create a new book
router.post('/', bookController.createBook);

// Get all books
router.get('/', bookController.getAllBooks);

// Get all books to new page
router.get('/', bookController.getAllBooksWithUserInfo);

// Get a single book by ID
router.get('/:bookId', bookController.getBookById);

// Update a book
router.put('/:bookId', bookController.updateBook);

// Delete a book
router.delete('/:bookId', bookController.deleteBook);

// Like a book
router.post('/:bookId/like', bookController.likeBook);

// Request to buy or exchange a book
router.post('/:bookId/request', bookController.requestBook);

// Add a review to a book
router.post('/:bookId/reviews', bookController.addReview);

// Get reviews for a book
router.get('/:bookId/reviews', bookController.getReviews);

module.exports = router;
