const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    username: { type: String, required: true },

    text: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const BookSchema = new Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['pdf', 'physical'], required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    author: { type: String, required: true },
    location: { type: String, required: function() { return this.type === 'physical'; } },
    owner: { type: String, required: true }, // Changed to store the username
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    requests: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['requested', 'accepted', 'available'], default: 'available' },
        requestDate: { type: Date, default: Date.now }
    }],
    pdfLink: { type: String, required: function() { return this.type === 'pdf'; } },
    reviews: [ReviewSchema]
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Book = mongoose.model('Book', BookSchema);
module.exports = Book;
