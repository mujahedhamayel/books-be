const Book = require('../models/Book');
const User = require('../models/User');
const NotificationService = require('../services/notification_service'); 


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
        await User.findByIdAndUpdate(req.user._id, { $push: { books: savedBook._id },$inc: { booksCount: 1 } });

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

// Get all books created by the logged-in user
exports.getBooksByUser = async (req, res) => {
    try {
        const books = await Book.find({ owner: req.user.name });
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

        


    }
    
    
    catch (error) {
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
       // Get the logged-in user's ID
    const userId = req.user._id.toString();

    // Find the user's rating
    const userRatingObj = book.ratings.find(rating => rating.user.toString() === userId);
    const userRating = userRatingObj ? userRatingObj.score : null;

    res.json({ ...book.toJSON(), userRating });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getUserRating = async (req, res) => {
    try {
      const book = await Book.findById(req.params.bookId);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
  
      const userId = req.user._id.toString();
      const userRatingObj = book.ratings.find(rating => rating.user.toString() === userId);
      const userRating = userRatingObj ? userRatingObj.score : null;
  
      res.json({ userRating });
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
        // Remove the book from the user's books array and decrement the books count
        await User.findByIdAndUpdate(deletedBook.owner, { 
            $pull: { books: deletedBook._id },
            $inc: { booksCount: -1 }
        });
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Like or unlike a book
exports.likeBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const userIndex = book.likes.indexOf(req.user._id);

        if (userIndex > -1) {
            // User already liked the book, so unlike it
            book.likes.splice(userIndex, 1);
            await book.save();

            // Remove the book from the user's likedBooks array
            await User.findByIdAndUpdate(req.user._id, { $pull: { likedBooks: book._id } });

            return res.json({ message: 'Book unliked successfully' });
        } else {
            // User has not liked the book, so like it
            book.likes.push(req.user._id);
            await book.save();

            // Add the book to the user's likedBooks array
            await User.findByIdAndUpdate(req.user._id, { $push: { likedBooks: book._id } });

            return res.json({ message: 'Book liked successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// // Request to buy or exchange a book
// exports.requestBook = async (req, res) => {
//     try {
//         const book = await Book.findById(req.params.bookId);
//         if (!book) {
//             return res.status(404).json({ message: 'Book not found' });
//         }

//         // Check if the user is the owner of the book
//         if (book.owner.equals(req.user._id)) {
//             return res.status(400).json({ message: 'You cannot request your own book' });
//         }

//         // Check if the user has already requested the book
//         const existingRequest = book.requests.find(request => request.user.equals(req.user._id));
//         if (existingRequest) {
//             return res.status(400).json({ message: 'You have already requested this book' });
//         }

//         book.requests.push({ user: req.user._id, status: 'requested' });
//         await book.save();

//         // Add the book to the user's requests array
//         await User.findByIdAndUpdate(req.user._id, { $push: { requests: book._id } });

//         res.json({ message: 'Request sent successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };


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

// Get all liked books by the logged-in user
exports.getLikedBooks = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('likedBooks');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.likedBooks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.rateBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existingRating = book.ratings.find(rating => rating.user.equals(req.user._id));
        if (existingRating) {
            existingRating.score = req.body.score;
        } else {
            book.ratings.push({ user: req.user._id, score: req.body.score });
        }

        // Calculate the average rating
        const totalRating = book.ratings.reduce((acc, rating) => acc + rating.score, 0);
        book.rate = totalRating / book.ratings.length;

        await book.save();

        res.status(200).json({ message: 'Rating added successfully', book });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.requestBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const userId = req.user._id; // Assuming you have the user's ID from authentication middleware

        const book = await Book.findById(bookId).populate('requests.user');

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Check if the book is already booked
        if (book.status === 'booked') {
            return res.status(400).json({ message: 'The book is already booked up.' });

        }
        // Check if the user has already requested the book
        const existingRequest = book.requests.find(request => request.user._id.equals(userId));
        if (existingRequest) {
            return res.status(400).json({ message: 'You have already requested this book.' });
        }
        // Check if the book is available for request
        if (book.status === 'available') {
            book.status = 'requested';
            book.requests.push({ user: userId, status: "requested" });
            await book.save();
            // Send notification to the book owner
            const bookOwner = await User.findOne({ name: book.owner });
            if (bookOwner && bookOwner.deviceToken) {
                NotificationService.sendNotification(
                    bookOwner.deviceToken,
                    'New Book Request',
                    `${req.user.name} has requested your book: ${book.title}`
                );
            }

            return res.status(200).json({ message: 'You have successfully requested the book.' });

        }

        // Check if the book is requested but not yet accepted
        //const existingRequest = book.requests.find(req => req.status === 'requested');
        if (book.status == 'requested') {
            book.requests.push({ user: userId, status: "requested" });
            await book.save();

             // Send notification to the book owner
             const bookOwner = await User.findOne({ name: book.owner });
             if (bookOwner && bookOwner.deviceToken) {
                 NotificationService.sendNotification(
                     bookOwner.deviceToken,
                     'New Book Request',
                     `${req.user.name} has requested your book: ${book.title}`
                 );
             }

            return res.status(200).json({ message: 'The book is already requested but your request has been added to the list.' });
        }

        res.status(400).json({ message: 'Invalid request state.' });
    } catch (error) {
        console.error('requestBook error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get the status of a book
exports.getBookStatus = async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        let statusMessage = 'The book is available for request.';

        if (book.status === 'booked') {
            statusMessage = 'The book is booked up.';
        } else if (book.status === 'requested') {
            const existingRequest = book.requests.find(req => req.user.equals(book.owner) && req.status === 'accepted');
            if (existingRequest) {
                statusMessage = 'The book is booked up.';
            } else {
                statusMessage = 'The book is requested but your request can be added to the list.';
            }
        }

        res.json({ status: book.status, message: statusMessage });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all requests for books owned by the logged-in user
exports.getUserBookRequests = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const books = await Book.find({ owner: user.name }).populate('requests.user');
        if (!books.length) {
            return res.status(404).json({ message: 'No books found for the user' });
        }

        const physicalBooksWithRequests = books.filter(book => book.type === 'physical' && book.requests.length > 0);

        if (!physicalBooksWithRequests.length) {
            return res.status(404).json({ message: 'No physical books found for the user' });
        }


        const requests = physicalBooksWithRequests.map(book => ({
            _id: book._id,
            title: book.title,
            image: book.image,
            requests: book.requests.map(req => ({
                user: req.user._id,
                status: req.status,
                _id: req._id,
                requestDate: req.requestDate
            })),
            type: book.type,
            owner:book.owner,
            updatedAt:book.updatedAt,
            author:book.author,
            location:book.location,
            rate:book.rate,
            pdfLink:book.pdfLink,
            userRating:book.userRating,
            price:book.price,
            likes: book.likes,




        }));

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getUserRequestsForOtherBooks = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find books where the logged-in user has made requests
        const books = await Book.find({ "requests.user": userId }).populate('requests.user');

        // Filter out only the requests made by the logged-in user
        const filteredBooks = books.map(book => {
            const userRequests = book.requests.filter(req => req.user._id.equals(userId));
            return {
                _id: book._id,
                title: book.title,
                image: book.image,
                requests: userRequests.map(req => ({
                    user: req.user._id,
                    status: req.status,
                    _id: req._id,
                    requestDate: req.requestDate
                })),
                type: book.type,
                owner: book.owner,
                updatedAt: book.updatedAt,
                author: book.author,
                location: book.location,
                rate: book.rate,
                pdfLink: book.pdfLink,
                userRating: book.userRating,
                price: book.price,
                likes: book.likes,
            };
        });

        res.json(filteredBooks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.deleteRequest = async (req, res) => {
    try {
      const { bookId, requestId } = req.params;
  
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
  
      // Find the request to be deleted
      const requestIndex = book.requests.findIndex(req => req._id.equals(requestId));
      if (requestIndex === -1) {
        return res.status(404).json({ message: 'Request not found' });
      }
      
      // Remove the request
      book.requests.splice(requestIndex, 1);

      // Check if there are any accepted requests
    const hasAcceptedRequest = book.requests.some(req => req.status === 'accepted');
  
      // Update the book status based on remaining requests
      if (book.status === 'booked'  && !hasAcceptedRequest && book.requests.length > 0 ) {
        book.status = 'requested';
      } else if (book.requests.length === 0) {
        book.status = 'available';
      }
  
      await book.save();
  
      res.status(200).json({ message: 'Request deleted successfully', book });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };


// Get requests for a book
exports.getBookRequests = async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId).populate('requests.user');
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }


        if (book.owner !== req.user.name) {
            return res.status(403).json({ message: 'You are not authorized to view requests for this book' });
        }

        res.json(book.requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Accept a request for a book
exports.acceptBookRequest = async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

       // Ensure the book owner is the one making the request
       if (book.owner !== req.user.name) {
        return res.status(403).json({ message: 'You are not authorized to accept requests for this book' });
    }

        const request = book.requests.id(req.params.requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        request.status = 'accepted';
        book.status = 'booked';
        
        // Deny all other requests
        book.requests.forEach((req) => {
            if (req._id.toString() !== request.id.toString()) {
                req.status = 'denied';
            }
        });

        await book.save();

         // Send notification to the requester
         const requester = await User.findById(request.user);
         if (requester && requester.deviceToken) {
             NotificationService.sendNotification(
                 requester.deviceToken,
                 'Request Accepted',
                 `Your request for the book "${book.title}" has been accepted by the owner "${book.owner}" contact with him :).`
             );
         }

        res.json({ message: 'Request accepted successfully', book });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Deny a request for a book
exports.denyBookRequest = async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Ensure the book owner is the one making the request
        if (book.owner !== req.user.name) {
            return res.status(403).json({ message: 'You are not authorized to deny requests for this book' });
        }

        const request = book.requests.id(req.params.requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Deny the specific request
        request.status = 'denied';

        await book.save();

        res.json({ message: 'Request denied successfully', book });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Get book by URL (or another unique identifier like pdfLink)
exports.getBookByUrl = async (req, res) => {
    try {
        const { pdfLink } = req.params;
        const book = await Book.findOne({ pdfLink });
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
