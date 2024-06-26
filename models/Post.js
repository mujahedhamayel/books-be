'use strict';

const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const CommentsSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    date: { type: Date, required: true },
    likes: { type: [String], default: [] }
});

const PostsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    imageuser: { type: String },
    imagepost: { type: String },
    createDate: { type: Date },
    updateDate: { type: Date },
    description: { type: String },
    Like: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: { type: [CommentsSchema], default: [] }
});


PostsSchema.pre('findOne', function() {
    this.populate('id')
        .populate({
            path: 'comments.user',
            select: 'name email imageUrl books likedBooks requests followedUsers deviceToken postCount followersCount followingCount booksCount'
        });
});

PostsSchema.pre('findById', function() {
    this.populate('id')
        .populate({
            path: 'comments.user',
            select: 'name email imageUrl books likedBooks requests followedUsers deviceToken postCount followersCount followingCount booksCount'
        });
});
const Post = mongoose.model('Post', PostsSchema);
module.exports = Post;