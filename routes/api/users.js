const { Error: MongooseError } = require('mongoose');
const { User, Thought } = require('../../models');

// Purpose: API routes for the application.
const router = require('express').Router();

router.get('/', async (req, res) => {
    try {
        const users = await User.find({}).populate(["thoughts", "friends"]).select('-__v');
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.userId }).populate(["thoughts", "friends"]).select('-__v');
        if (!user) {
            res.status(404).json({ message: 'No user found with this id!' });
            return;
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});
router.post('/', async (req, res) => {
    try {
        const { username, email } = req.body;
        const user = await User.create({ username, email });
        res.json(user);
    } catch (err) {
        if (err instanceof MongooseError.ValidationError) {
            res.status(400).json(err);
            return
        }

        console.error(err);
        res.status(500).json(err);
    }
});

router.put('/:userId', async (req, res) => {
    try {
        const { username, email } = req.body;
        const user = await User.findOneAndUpdate({ _id: req.params.userId }, { username, email }, { new: true });
        if (!user) {
            res.status(404).json({ message: 'No user found with this id!' });
            return;
        }
        res.json(user);
    } catch (err) {
        if (err instanceof MongooseError.ValidationError) {
            res.status(400).json(err);
            return
        }
        console.error(err);
        res.status(500).json(err);
    }
});

router.delete('/:userId', async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ _id: req.params.userId });
        if (!user) {
            res.status(404).json({ message: 'No user found with this id!' });
            return;
        }

        await Promise.all([
            Thought.deleteMany({ _id: { $in: user.thoughts } }),
            User.updateMany({ friends: req.params.userId }, { $pull: { friends: req.params.userId } })
        ]);
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

router.post('/:userId/friends/:friendId', async (req, res) => {
    try {
        const { userId, friendId } = req.params;
        if (userId === friendId) {
            res.status(400).json({ message: 'You cannot be friends with yourself!' });
            return;
        }
        const friend = await User.findOne({ _id: friendId });
        if (!friend) {
            res.status(404).json({ message: 'No friend found with this id!' });
            return;
        }

        const user = await User.findOneAndUpdate(
            { _id: userId },
            { $addToSet: { friends: friendId } },
            { new: true }
        ).populate('friends');
        if (!user) {
            res.status(404).json({ message: 'No user found with this id!' });
            return;
        }
        res.status(201).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

router.delete('/:userId/friends/:friendId', async (req, res) => {
    try {
        const { userId, friendId } = req.params;
        const user = await User.findOneAndUpdate(
            { _id: userId },
            { $pull: { friends: friendId } },
            { new: true }
        ).populate('friends');
        if (!user) {
            res.status(404).json({ message: 'No user found with this id!' });
            return;
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

module.exports = router;