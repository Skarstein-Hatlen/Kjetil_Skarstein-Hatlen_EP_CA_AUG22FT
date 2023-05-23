const jwt = require('jsonwebtoken');

// Generate a JWT secret token
function generateTokenSecret() {
    const tokenSecret = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: '12' });
    return tokenSecret;
}

module.exports = generateTokenSecret;
