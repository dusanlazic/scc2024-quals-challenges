const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { authMiddleware } = require('../middleware');
const { checkPassword, hashPassword } = require('../util');

let db;

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/chat', authMiddleware, (req, res) => {
    res.render('chat');
});

router.post('/register', async (req, res) => {
    return res.status(503).send({ error: 'Disabled temporarily.' });

    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send({ error: 'Please provide username and password.' });
    }

    try {
        const hashedPassword = await hashPassword(password);
        const userId = await db.registerUser(username, hashedPassword);

        res.status(201).send({ message: 'User registered successfully', userId });
    } catch (error) {
        res.status(500).send({ error: 'Failed to register user' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!/^[a-zA-Z0-9]+$/.test(username)) {
        return res.status(401).send({ error: 'Hacking attempt!!!!' });
    }

    if (!username || !password) {
        return res.status(400).send({ error: 'Please provide username and password.' });
    }

    try {
        const user = await db.getUserByUsername(username);

        if (!user) {
            return res.status(401).send({ error: 'Bad credentials.' });
        }

        const passwordMatches = await checkPassword(password, user.password);
        if (!passwordMatches) {
            return res.status(401).send({ error: 'Bad credentials.' });
        }

        const token = jwt.sign({ sub: user.id }, process.env.SECRET_KEY, { expiresIn: '1d' });

        res.cookie('token', token, { httpOnly: true, secure: true });
        res.status(200).send({ message: `Welcome, ${user.username}` });
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: 'Server error. Try again later.' });
    }
});

router.get('/messages', authMiddleware, async (req, res) => {
    try {
        const user = await db.getUserById(req.userId);
        const messages = await db.getUserInbox(user.username);
        res.json({ messages });
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: 'Server error. Try again later.' });
    }
});

router.post('/messages', authMiddleware, async (req, res) => {
    return res.status(503).send({ error: 'Disabled temporarily.' });

    try {
        const { receiverUsername, content } = req.body;
        const sender = await db.getUserById(req.userId);
        const receiver = await db.getUserByUsername(receiverUsername);

        await db.persistMessage(sender.id, receiver.id, content);

        res.status(201).send({ message: 'Message sent.' });
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: 'Server error. Try again later.' });
    }
})

module.exports = database => {
    db = database;
    return router;
};
