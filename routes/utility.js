const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Op } = require('sequelize');
const { Item, Category, Role, User } = require('../models');
const bcrypt = require('bcrypt');

router.post('/setup', async (req, res) => {
    try {
        const itemsCount = await Item.count();
        if (itemsCount > 0) {
        return res.status(400).json({ message: 'Database already populated.' });
        }

        // Populate items and categories from Noroff API
        const response = await axios.get('http://143.42.108.232:8888/items/stock');
        const itemsData = response.data;

        for (const itemData of itemsData) {
        const { id, item_name, price, stock, category } = itemData;

        const [categoryObj] = await Category.findOrCreate({
            where: { name: category },
        });

        await Item.create({
            id,
            name: item_name,
            price,
            stock,
            categoryId: categoryObj.id,
        });
        }

        // Populate roles table
        await Role.bulkCreate([
        { name: 'Admin' },
        { name: 'User' },
        ]);

        // Create Admin user
        const hashedPassword = await bcrypt.hash('P@ssword2023', 10);
        await User.create({
        username: 'Admin',
        password: hashedPassword,
        role: 'Admin',
        });

        return res.json({ message: 'Database populated successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while populating the database.', error });
    }
});

router.post('/search', async (req, res) => {
    try {
        const { searchQuery } = req.body;
        const items = await Item.findAll({
        where: {
            [Op.or]: [
            { name: { [Op.iLike]: `%${searchQuery}%` } },
            { '$Category.name$': { [Op.iLike]: `%${searchQuery}%` } },
            { sku: { [Op.iLike]: `%${searchQuery}%` } },
            ],
        },
        include: [Category],
        });
        return res.json({ items });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while searching for items.', error });
    }
});

module.exports = router;
