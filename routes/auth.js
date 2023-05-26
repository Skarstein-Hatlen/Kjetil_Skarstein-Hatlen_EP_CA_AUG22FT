const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User, Role, Cart } = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Signup endpoint
router.post('/signup', async (req, res) => {
    try {
        const { fullName, username, password, email } = req.body;
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists.' });
        }
        const emailCount = await User.count({ where: { email } });
        if (emailCount >= 4) {
            return res.status(400).json({ message: 'Email has been used too many times.' });
        }
        const userRole = await Role.findOne({ where: { name: 'User' } });
        if (!userRole) {
            return res.status(500).json({ message: 'User role not found.' });
        }
        const newUser = await User.create({
            fullName,
            username,
            email,
            password,
            roleId: userRole.id,
        });
        const newCart = await Cart.create();
        await newUser.setCart(newCart);

        return res.json({ message: 'User registered successfully.', user: newUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred during registration.', error });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Fetch the user from the database and include the Role model
        const user = await User.findOne({ 
            where: { username }, 
            include: {
                model: Role
            }
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // Use the salt to hash the input password
        const hashedPassword = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha256').toString('hex');

        // Check if the hashed input password matches the stored hash
        if (hashedPassword !== user.password) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // If the password is correct, sign and return a JWT
        const token = jwt.sign({ id: user.id, role: user.Role.name }, process.env.JWT_SECRET, { expiresIn: '2h' });
        return res.json({ message: 'User logged in successfully.', user, token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred during login.', error });
    }
});



module.exports = router;
