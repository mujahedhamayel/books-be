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
    }]
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
