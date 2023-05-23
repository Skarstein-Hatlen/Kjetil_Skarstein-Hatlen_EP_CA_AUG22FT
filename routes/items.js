const express = require('express');
const router = express.Router();
const { User, Role, Category, Item, Cart, CartItem, Order } = require('../models');

// Authentication and role check middleware
const authenticate = require('../middlewares/authMiddleware');
const authRole = require('../middlewares/authRole');

// Get ALL items
router.get('/items', async (req, res) => {
    const items = await Item.findAll({ include: Category });
    res.json(items);
});

router.post('/item', authenticate, authRole('Admin'), async (req, res) => {
    try {
        const { name, description, price, categoryId } = req.body;
        // Create the item
        const item = await Item.create({
            name,
            description,
            price,
            CategoryId: categoryId
        });
        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while creating the item.', error });
    }
});



router.put('/item/:id', authenticate, authRole('Admin'), async (req, res) => {
    try {
        const item = await Item.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        await item.update(req.body);
        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while updating the item.', error });
    }
});

router.delete('/item/:id', authenticate, authRole('Admin'), async (req, res) => {
    try {
        const item = await Item.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        await item.destroy();
        res.json({ message: 'Item deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while deleting the item.', error });
    }
});

module.exports = router;
