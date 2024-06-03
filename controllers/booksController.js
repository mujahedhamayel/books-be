const Book = require('../models/Book');
const User = require('../models/User');

// Create a new book
exports.createBook = async (req, res) => {
    try {
        const { title, type, price, image, author, location, pdfLink } = req.body;

        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newBook = new Book({
            title,
            type,
            price,
            image,
            author,
            location: type === 'physical' ? location : undefined,
            pdfLink: type === 'pdf' ? pdfLink : undefined,
            owner: user.name // Store the username instead of the user ID
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
    console.log("sdasd"); 
    try {
        const books = await Book.find();
        
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all physical books
exports.getPhysicalBooks = async (req, res) => {
    try {
        const books = await Book.find({ type: 'physical' });
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all pdf books
exports.getPdfBooks = async (req, res) => {
    try {
        const books = await Book.find({ type: 'pdf' });
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


exports.getAllBooksWithUserInfo = async (req, res) => {
    try {
        const books = await Book.find().populate('owner', 'name email');

        const currentUser = await User.findById(req.user._id).populate('followedUsers');

        const followedUsers = currentUser.followedUsers.map(user => user._id.toString());

        const booksWithUserInfo = books.map(book => ({
            ...book._doc,
            isFollowed: followedUsers.includes(book.owner._id.toString()),
        }));

        res.json(booksWithUserInfo);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }

 
};
   // Add a review to a book
   exports.addReview = async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newReview = {
            username: user.name,
            text: req.body.text,
            date: new Date()
        };

        book.reviews.push(newReview);
        await book.save();

        res.status(201).json({ message: 'Review added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get reviews for a book
exports.getReviews = async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json(book.reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
