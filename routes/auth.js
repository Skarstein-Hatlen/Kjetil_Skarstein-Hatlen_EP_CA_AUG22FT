const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Category, Item } = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Signup endpoint
router.post('/signup', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        // Check if username already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists.' });
        }
        // Check email usage count
        const emailCount = await User.count({ where: { email } });
        if (emailCount >= 4) {
            return res.status(400).json({ message: 'Email has been used too many times.' });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create new user
        const newUser = await User.create({
            username,
            password: hashedPassword,
            email,
            role: 'Registered User'
        });
        // Generate JWT token
        const token = jwt.sign({ id: newUser.id, role: newUser.role }, process.env.JWT_SECRET, {
            expiresIn: '2h'
        });
        return res.json({ message: 'User registered successfully.', user: newUser, token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred during registration.', error });
    }
});

module.exports = router;
