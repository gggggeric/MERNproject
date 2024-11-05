const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        console.error('No token provided'); // Log when no token is present
        return res.status(401).json({ message: 'Unauthorized! No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification error:', err);  // Log the error
            return res.status(403).json({ message: 'Unauthorized! Invalid token.' });
        }

        console.log('Decoded user from token:', user); // Log the user object for debugging
        req.user = user; // Ensure req.user is set properly
        next();
    });
};


module.exports = { authenticateUser };
