const Book = require('../models/Book');
const User = require('../models/User');

// Create a new book
exports.createBook = async (req, res) => {
    try {
        const { title, type, price, image, author, location, pdfLink } = req.body;

        const newBook = new Book({
            title,
            type,
            price,
            image,
            author,
            location: type === 'physical' ? location : undefined,
            pdfLink: type === 'pdf' ? pdfLink : undefined,
            owner: req.user._id // Assuming user ID is stored in req.user._id
        });

        const savedBook = await newBook.save();

        // Add the book to the user's books array
        await User.findByIdAndUpdate(req.user._id, { $push: { books: savedBook._id } });

        res.status(201).json(savedBook);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all books
exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get a single book by ID
exports.getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update a book
exports.updateBook = async (req, res) => {
    try {
        const { title, type, price, image, author, location, pdfLink } = req.body;

        const updatedBook = await Book.findByIdAndUpdate(
            req.params.bookId,
            {
                title,
                type,
                price,
                image,
                author,
                location: type === 'physical' ? location : undefined,
                pdfLink: type === 'pdf' ? pdfLink : undefined
            },
            { new: true, runValidators: true }
        );

        if (!updatedBook) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json(updatedBook);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a book
exports.deleteBook = async (req, res) => {
    try {
        const deletedBook = await Book.findByIdAndDelete(req.params.bookId);
        if (!deletedBook) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Like a book
exports.likeBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Check if the user has already liked the book
        if (book.likes.includes(req.user._id)) {
            return res.status(400).json({ message: 'You have already liked this book' });
        }

        book.likes.push(req.user._id);
        await book.save();

        // Add the book to the user's likedBooks array
        await User.findByIdAndUpdate(req.user._id, { $push: { likedBooks: book._id } });

        res.json({ message: 'Book liked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Request to buy or exchange a book
exports.requestBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Check if the user is the owner of the book
        if (book.owner.equals(req.user._id)) {
            return res.status(400).json({ message: 'You cannot request your own book' });
        }

        // Check if the user has already requested the book
        const existingRequest = book.requests.find(request => request.user.equals(req.user._id));
        if (existingRequest) {
            return res.status(400).json({ message: 'You have already requested this book' });
        }

        book.requests.push({ user: req.user._id, status: 'requested' });
        await book.save();

        // Add the book to the user's requests array
        await User.findByIdAndUpdate(req.user._id, { $push: { requests: book._id } });

        res.json({ message: 'Request sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
