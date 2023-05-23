const authRole = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.role === role) {
            next();
        } else {
            res.status(403).json({ message: 'Access denied. You do not have the required role.' });
        }
    };
};

module.exports = authRole;
