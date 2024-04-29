const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).send({ error: 'No token provided.' });
    }

    try {
        decoded = jwt.decode(token);
        req.userId = decoded.sub;
        next();
    } catch (error) {
        return res.status(401).send({ error: 'Invalid token' });
    }
};

module.exports = {
    authMiddleware
};

