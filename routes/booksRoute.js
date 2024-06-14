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
// Get all physical books
router.get('/physical', bookController.getPhysicalBooks);

// Get all pdf books
router.get('/pdf', bookController.getPdfBooks);

// Get all books to new page
router.get('/', bookController.getAllBooksWithUserInfo);

// Get all books created by the logged-in user
router.get('/user/books', bookController.getBooksByUser);
router.get('/user/book-requests', bookController.getUserBookRequests);


// Get all liked books by the logged-in user
router.get('/liked', bookController.getLikedBooks);

router.post('/:bookId/rate', bookController.rateBook);

router.get('/:bookId/user-rating', bookController.getUserRating);


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

// Get the status of a book
router.get('/:bookId/status', bookController.getBookStatus);

// Get requests for a book
router.get('/:bookId/requests', bookController.getBookRequests);

// Accept a request for a book
router.post('/:bookId/requests/:requestId/accept', bookController.acceptBookRequest);

// Add a review to a book
router.post('/:bookId/reviews', bookController.addReview);

// Get reviews for a book
router.get('/:bookId/reviews', bookController.getReviews);
module.exports = router;
