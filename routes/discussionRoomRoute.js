const express = require('express');
const router = express.Router();
const DiscussionRoom = require('../models/DiscussionRoom');
const User = require('../models/User');
const authMiddleware = require('../middlewares/verifyToken');

router.use(authMiddleware);


// Create a discussion room
router.post('/create', async (req, res) => {
    try {
        const { participants, zoomLink, topic } = req.body;
        const newRoom = new DiscussionRoom({
            creator: req.user._id,
            participants: [req.user._id, ...participants],
            zoomLink,
            topic,
        });
        const savedRoom = await newRoom.save();
        
        // Notify participants (implement your notification logic)
        // For example, using Firebase Cloud Messaging
        // participants.forEach(participantId => {
        //     // Send notification to participant
        // });

        res.status(201).json(savedRoom);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get discussion rooms for the logged-in user
router.get('/', async (req, res) => {
    try {
        const rooms = await DiscussionRoom.find({
            participants: req.user._id
        }).populate('creator participants', 'name email');

        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// Delete a discussion room by the owner
router.delete('/:roomId',  async (req, res) => {
    try {
        console.log(`Deleting room with ID: ${req.params.roomId}`);
        const room = await DiscussionRoom.findById(req.params.roomId);
        if (!room) {
            console.log('Room not found');
            return res.status(404).json({ message: 'Room not found' });
        }

        if (room.creator.toString() !== req.user._id.toString()) {
            console.log('Not authorized to delete this room');
            return res.status(403).json({ message: 'You are not authorized to delete this room' });
        }

        await DiscussionRoom.deleteOne({ _id: room._id });
        console.log('Room deleted successfully');
        res.status(200).json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Remove a participant from a discussion room
router.post('/:roomId/removeParticipant',
    
    async (req, res) => {
    try {
        const room = await DiscussionRoom.findById(req.params.roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        room.participants = room.participants.filter(
            participant => participant.toString() !== req.user._id.toString()
        );

        await room.save();
        res.status(200).json({ message: 'You have left the room' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


module.exports = router;
