var express = require('express');
var router = express.Router();
var { Category } = require('../models');

// Authentication and role check middleware
const authenticate = require('../middlewares/authMiddleware');
const authRole = require('../middlewares/authRole');

// Category endpoints
router.get('/categories', async (req, res) => {
    const categories = await Category.findAll();
    res.json(categories);
});

router.post('/category', authenticate, authRole('Admin'), async (req, res) => {
    const category = await Category.create(req.body);
    res.json(category);
});

router.put('/category/:id', authenticate, authRole('Admin'), async (req, res) => {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    await category.update(req.body);
    res.json(category);
});

router.delete('/category/:id', authenticate, authRole('Admin'), async (req, res) => {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    await category.destroy();
    res.json({ message: 'Category deleted' });
});

module.exports = router;