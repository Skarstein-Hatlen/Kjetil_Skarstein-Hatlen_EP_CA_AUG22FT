const express = require('express');
const router = express.Router();
const { Op, Sequelize } = require('sequelize');
const { Item, Category, Role, User } = require('../models');
const crypto = require('crypto');
const fetch = require('node-fetch');


// Populates database and creates Admin user.
router.post('/setup', async (req, res) => {
    try {
        const itemsCount = await Item.count();
        if (itemsCount > 0) {
            return res.status(400).json({ message: 'Database already populated.' });
        }
        const response = await fetch('http://143.42.108.232:8888/items/stock');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const itemsData = await response.json();
        console.log('Items Data: ', itemsData);
        for (const itemData of itemsData.data) {
            const { id, item_name, price, stock_quantity, sku, category } = itemData;
            const [categoryObj] = await Category.findOrCreate({
                where: { name: category },
            });
            await Item.create({
                id,
                name: item_name,
                price,
                stock_quantity,
                sku,
                categoryId: categoryObj.id,
            });
        }
        await Role.bulkCreate([
            { name: 'Admin' },
            { name: 'User' },
        ]);
        const adminRole = await Role.findOne({ where: { name: 'Admin' } });
        if (!adminRole) {
            return res.status(500).json({ message: 'Admin role not found.' });
        }
        const hashedPassword = 'P@ssword2023'; 
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


//Search for items
router.post('/search', async (req, res) => {
    try {
        const { searchQuery, categoryName, sku } = req.body;
        
        let conditions = {};
        if (searchQuery) {
            conditions.name = Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('Item.name')), 'LIKE', `%${searchQuery.toLowerCase()}%`);
        }
        if (sku) {
            conditions.sku = Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('Item.sku')), 'LIKE', `%${sku.toLowerCase()}%`);
        }
        if (categoryName) {
            conditions['$Category.name$'] = Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('Category.name')), 'LIKE', `%${categoryName.toLowerCase()}%`);
        }
        const items = await Item.findAll({
            where: conditions,
            include: [{
                model: Category,
                required: true
            }]
        });
        return res.json({ items });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while searching for items.', error });
    }
});


module.exports = router;
