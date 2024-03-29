const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token == null) {
            // Not authorized (Guest User)
            req.user = { role: 'Guest User' };
            return next();
        }
        jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
            if (err) {
                return res.status(403).send('Invalid token');
            }
            // Registered User or Admin User
            const dbUser = await User.findByPk(user.id, {
                include: [{ model: Role, as: 'Role' }] 
            });
            if (!dbUser) {
                return res.status(404).send('User not found');
            }
            req.user = { 
                id: dbUser.id, 
                role: dbUser.Role ? dbUser.Role.name : 'User', 
                userId: dbUser.id, 
                email: dbUser.email
            };
            next();
        });
    } catch (error) {
        next(error);
    }
};

module.exports = authMiddleware;
