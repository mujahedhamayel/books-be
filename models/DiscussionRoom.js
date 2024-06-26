const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DiscussionRoomSchema = new Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    zoomLink: { type: String, required: true },
    topic: { type: String, required: true }, 

    createdAt: { type: Date, default: Date.now }
});

const DiscussionRoom = mongoose.model('DiscussionRoom', DiscussionRoomSchema);
module.exports = DiscussionRoom;
