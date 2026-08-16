const jwt = require('jsonwebtoken');
require('dotenv').config();

const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    try {
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } else {
            res.status(401).json({ message: 'No token provided' });
        }
    } catch (err) {
        res.status(401).json({ message: 'Invalid or Expired Token' });
    }

}

module.exports = requireAuth;
