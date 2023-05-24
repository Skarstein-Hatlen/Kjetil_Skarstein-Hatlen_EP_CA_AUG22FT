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
        const hashedPassword = crypto.createHash('sha256').update(password.trim()).digest('hex');
        const userRole = await Role.findOne({ where: { name: 'User' } });
        if (!userRole) {
            return res.status(500).json({ message: 'User role not found.' });
        }
        const newUser = await User.create({
            fullName,
            username,
            email,
            password: hashedPassword,
            roleId: userRole.id
        });
        const newCart = await Cart.create();
        await newUser.setCart(newCart);

        //Nødvendig?
        const token = jwt.sign({ id: newUser.id, role: newUser.roleId }, process.env.JWT_SECRET, {
            expiresIn: '2h'
        });
        return res.json({ message: 'User registered successfully.', user: newUser, token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred during registration.', error });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });
        console.log("Fetched user from DB:", user);  // debug log
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }
        const hashedPassword = crypto.createHash('sha256').update(password.trim()).digest('hex');
        console.log("Hashed password from request:", hashedPassword);  // debug log
        const passwordMatch = (hashedPassword === user.password);
        console.log('Login Password match: ', passwordMatch); //debug log
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }
        const token = jwt.sign({ id: user.id, role: user.roleId }, process.env.JWT_SECRET, {
            expiresIn: '2h'
        });
        return res.json({ message: 'User logged in successfully.', user, token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred during login.', error });
    }
});


module.exports = router;
