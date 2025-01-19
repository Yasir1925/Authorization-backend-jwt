const jwt = require("jsonwebtoken");
const User = require('../modals/user.modal');
const key = "MySecretOkDontTouch"
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        // const token = authHeader.split(' ')[1];
        const token = authHeader.split(' ')[1].replace(/['"]+/g, '');

        const verifyToken = jwt.verify(token, key);

        const user = await User.findById(verifyToken._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = authenticate;
