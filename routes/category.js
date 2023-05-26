var express = require('express');
var router = express.Router();
var { Category } = require('../models');

// Authentication and role check middleware
const authenticate = require('../middlewares/authMiddleware');
const authRole = require('../middlewares/authRole');

// GET/categories - Returns all categories in the database
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while retrieving the categories.', error });
    }
});

// POST/category - Creates new category
router.post('/category', authenticate, authRole('Admin'), async (req, res) => {
    try {
        const { name } = req.body;
        const categoryExists = await Category.findOne({ where: { name } });
        if (categoryExists) {
            return res.status(400).json({ message: 'Category already exists.' });
        }
        const category = await Category.create(req.body);
        res.json(category);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while creating the category.', error });
    }
});


router.put('/category/:id', authenticate, authRole('Admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }
        await category.update({ name: name });
        res.json(category);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while updating the category.', error });
    }
});

router.delete('/category/:id', authenticate, authRole('Admin'), async (req, res) => {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }
    const items = await Item.findAll({ where: { categoryId: id } });
    if (items.length > 0) {
        return res.status(400).json({ error: 'Category cannot be deleted as it contains items' });
    }
    await category.destroy();
    res.json({ message: 'Category deleted' });
});


module.exports = router;