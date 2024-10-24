const jwt = require('jsonwebtoken');

// Middleware to authenticate user
const authenticateUser = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized! No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification error:', err);  // Log the error
            return res.status(403).json({ message: 'Unauthorized! Invalid token.' });
        }

        req.user = user;
        next();
    });
};


module.exports = { authenticateUser };
