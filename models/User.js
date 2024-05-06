'use strict';

const mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    Schema = mongoose.Schema;

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
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;


