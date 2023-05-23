const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Order, OrderItem, Item, User } = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');

// Get orders for logged-in user (accessible by Registered User)
router.get('/orders', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        // Find orders for the logged-in user
        const orders = await Order.findAll({
            where: { userId },
            include: { model: OrderItem, include: Item },
            order: [['createdAt', 'DESC']]
        });
        return res.json({ orders });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while retrieving orders.', error });
    }
});

// Get all orders (accessible by Admin User)
router.get('/allorders', authMiddleware, async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. Only Admin User can access this endpoint.' });
        }
        // Query to get all orders with items and user information
        const query = `
            SELECT
                o.id AS order_id,
                o.status,
                o.createdAt,
                o.updatedAt,
                oi.quantity,
                i.name,
                i.price,
                u.firstName,
                u.lastName
            FROM
                orders o
            INNER JOIN
                order_items oi ON o.id = oi.orderId
            INNER JOIN
                items i ON oi.itemId = i.id
            INNER JOIN
                users u ON o.userId = u.id
            ORDER BY
                o.createdAt DESC
        `;
        // Execute the raw query
        const orders = await Order.sequelize.query(query, { type: Order.sequelize.QueryTypes.SELECT });
        return res.json({ orders });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while retrieving all orders.', error });
    }
});


// Create order (accessible by Registered User)
router.post('/order/:id', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        const { id } = req.params;
        // Find the item being ordered
        const item = await Item.findOne({ where: { id } });
        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        if (item.stock === 0) {
            return res.status(400).json({ message: 'Item out of stock.' });
        }
        // Create the order
        const order = await Order.create({ userId });
        // Create the order item
        await OrderItem.create({
            orderId: order.id,
            itemId: item.id,
            quantity: 1,
            price: item.price
        });
        // Update the item's stock level
        item.stock -= 1;
        await item.save();
        return res.json({ message: 'Order created successfully.', order });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while creating the order.', error });
    }
});

// Update order status (accessible by Admin User)
router.put('/order/:id', authMiddleware, async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. Only Admin User can update the order status.' });
        }
        const { id } = req.params;
        const { status } = req.body;
        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        order.status = status;
        await order.save();
        return res.json({ message: 'Order status updated successfully.', order });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while updating the order status.', error });
    }
});

module.exports = router;
