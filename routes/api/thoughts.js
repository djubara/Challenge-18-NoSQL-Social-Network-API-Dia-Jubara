const { User, Thought } = require('../../models');
const { Error: MongooseError } = require('mongoose');

// Purpose: API routes for the application.
const router = require('express').Router();

router.get('/', async (req, res) => {
    try {
        const thoughts = await Thought.find({}).select('-__v');
        res.json(thoughts);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

router.get('/:thoughtId', async (req, res) => {
    try {
        const thought = await Thought.findOne({ _id: req.params.thoughtId }).select('-__v');
        if (!thought) {
            res.status(404).json({ message: 'No thought found with this id!' });
            return;
        }
        res.json(thought);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

router.post('/', async (req, res) => {
    try {
        const { text, userId } = req.body;
        const user = await User.findOne({ _id: userId }).select("username");
        if (!user) {
            res.status(404).json({ message: 'No user found with this id!' });
            return;
        }

        const thought = await Thought.create({ text, username: user.username });
        await user.updateOne({ $push: { thoughts: thought._id } });
        res.json(thought);
    } catch (err) {
        if (err instanceof MongooseError.ValidationError) {
            res.status(400).json(err);
            return;
        }

        console.error(err);
        res.status(500).json(err);
    }
});
router.put('/:thoughtId', async (req, res) => {
    try {
        const { text } = req.body;
        const thought = await Thought.findOneAndUpdate({ _id: req.params.thoughtId }, { text }, { new: true });
        if (!thought) {
            res.status(404).json({ message: 'No thought found with this id!' });
            return;
        }
        res.json(thought);
    } catch (err) {
        if (err instanceof MongooseError.ValidationError) {
            res.status(400).json(err);
            return;
        }
        console.error(err);
        res.status(500).json(err);
    }
});

router.delete('/:thoughtId', async (req, res) => {
    try {
        const thought = await Thought.findOneAndDelete({ _id: req.params.thoughtId });
        if (!thought) {
            res.status(404).json({ message: 'No thought found with this id!' });
            return;
        }
        res.json(thought);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});
router.post('/:thoughtId/reactions', async (req, res) => {
    try {
        const { body, userId } = req.body;
        const user = await User.findOne({ _id: userId }).select("username");
        if (!user) {
            res.status(404).json({ message: 'No user found with this id!' });
            return;
        }

        const thought = await Thought.findOneAndUpdate({ _id: req.params.thoughtId }, { $push: { reactions: { body, username: user.username } } }, { new: true, runValidators: true });
        if (!thought) {
            res.status(404).json({ message: 'No thought found with this id!' });
            return;
        }
        res.json(thought);
    } catch (err) {
        if (err instanceof MongooseError.ValidationError) {
            res.status(400).json(err);
            return;
        }
        console.error(err);
        res.status(500).json(err);
    }
}
);
router.delete('/:thoughtId/reactions/:reactionId', async (req, res) => {
    try {
        const { thoughtId, reactionId } = req.params;
        const thought = await Thought.findOneAndUpdate({ _id: thoughtId }, { $pull: { reactions: { _id: reactionId } } }, { new: true });
        if (!thought) {
            res.status(404).json({ message: 'No thought found with this id!' });
            return;
        }
        await User.findOneAndUpdate({ thoughts: thoughtId }, { $pull: { thoughts: thoughtId } });
        res.json(thought);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});





module.exports = router;