const express = require('express');
const router = express.Router();
const { Category, Item } = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');
const authRole = require('../middlewares/authRole');


// Get ALL items
router.get('/items', async (req, res) => {
    try {
        const items = await Item.findAll({ include: Category });
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching items.', error });
    }
});

// Create a new item (accessible by Admin User)
router.post('/item', authMiddleware, authRole('Admin'), async (req, res) => {
    try {
        const { name, price, sku, stock_quantity, categoryId } = req.body;

        // Check if the category exists
        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        // Create the item
        const item = await category.createItem({
            name,
            price,
            sku,
            stock_quantity
        });

        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while creating the item.', error });
    }
});



// Update an existing item (accessible by Admin User)
router.put('/item/:id', authMiddleware, authRole('Admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, stock_quantity, sku, categoryId } = req.body;
        // Find the item by ID
        const item = await Item.findByPk(id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        // Update the item
        await item.update({
            name,
            price,
            stock_quantity,
            sku,
            categoryId
        });
        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while updating the item.', error });
    }
});


// Delete an item (accessible by Admin User)
router.delete('/item/:id', authMiddleware, authRole('Admin'), async (req, res) => {
    try {
        const { id } = req.params;

        // Find the item by ID
        const item = await Item.findByPk(id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }

        // Delete the item
        await item.destroy();

        res.json({ message: 'Item deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while deleting the item.', error });
    }
});


module.exports = router;
