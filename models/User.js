'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

/**
 * User Schema
 */
const UserSchema = new Schema({
    id: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    imageUrl: {
        type: String,
        trim: true,
        default : "https://firebasestorage.googleapis.com/v0/b/book-app-1356e.appspot.com/o/posts%2Fprofile-user.jpg?alt=media&token=6ebf68a1-4773-4681-86bf-c71393d49818"
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true
    },
    birthday: {
        type: Date // Assuming birthday is a Date type
    },
    password: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    },
    books: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
    }],
    likedBooks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
    }],
    requests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
    }],
    followedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    deviceToken: {
        type: String
    },
    
  chattedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  postCount: {
    type: Number,
    default: 0
},
followersCount: {
    type: Number,
    default: 0
},
followingCount: {
    type: Number,
    default: 0
},
booksCount: {
    type: Number,
    default: 0
},
mobileNumber: {
    type: String,
    trim: true,
    required: true
},
address: {
    type: String,
    trim: true,
    required: true
},
gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true
}
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
