const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Item, Category, Role, User } = require('../models');
const bcrypt = require('bcrypt');
const fetch = require('node-fetch');

router.post('/setup', async (req, res) => {
    try {
        const itemsCount = await Item.count();
        if (itemsCount > 0) {
            return res.status(400).json({ message: 'Database already populated.' });
        }

        // Populate items and categories from Noroff API
        const response = await fetch('http://143.42.108.232:8888/items/stock');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const itemsData = await response.json();

        console.log('Items Data: ', itemsData);
        for (const itemData of itemsData.data) {
            const { id, item_name, price, stock_quantity: stock, category } = itemData;
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
        const adminRole = await Role.findOne({ where: { name: 'Admin' } });
        if (!adminRole) {
            return res.status(500).json({ message: 'Admin role not found.' });
        }

        const hashedPassword = await bcrypt.hash('P@ssword2023', 10);
        await User.create({
            fullName: 'Admin User',
            username: 'Admin',
            email: 'admin@user.com',
            password: hashedPassword,
            roleId: adminRole.id,
        });

        return res.json({ message: 'Database populated successfully.' });
    } catch (error) {
        console.error('There has been a problem with your fetch operation: ', error);
        return res.status(500).json({ message: 'An error occurred while populating the database.', error: process.env.NODE_ENV === 'development' ? error : {} });
    }
});

// Search (Might need change)
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
