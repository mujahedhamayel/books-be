const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['pdf', 'physical'],
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    image: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    location: {
        type: String, // Assuming location is a string. Adjust type as needed.
        required: function() { return this.type === 'physical'; },
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    requests: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['requested', 'accepted', 'available'],
            default: 'available',
        },
        requestDate: {
            type: Date,
            default: Date.now,
        }
    }]
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Book = mongoose.model('Book', BookSchema);
module.exports = Book;
