const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Order, OrderItem, Item, User, Cart, CartItem, sequelize } = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');

// Checkout (Registered User)
router.post('/checkout', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        const discountMap = {
            2: 0.1,
            3: 0.3,
            4: 0.4,
        };
        // Find the user's cart
        const cart = await Cart.findOne({
            where: { userId },
            include: {
                model: CartItem,
                as: 'cartItems',
                include: Item
            }
        });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }
        // Discount based on the number of users with the same email
        const user = await User.findByPk(userId);
        const usersWithSameEmail = await User.count({
            where: {
                email: user.email,
            },
        });
        let totalDiscount = discountMap[usersWithSameEmail] || 0;
        // Create the order
        const order = await Order.create({ status: 'Pending', UserId: userId, totalPrice: 0 });
        let totalPriceBeforeDiscount = 0;
        // Loop through the cart items and create order items
        for (const cartItem of cart.cartItems) {
            const item = cartItem.Item;
            if (item.stock_quantity < cartItem.quantity) {
                return res.status(400).json({ message: `Not sufficient items in stock for ${item.name}.` });
            }
            const itemPrice = cartItem.price;
            const totalPriceForItem = itemPrice * cartItem.quantity;
            totalPriceBeforeDiscount += totalPriceForItem;
            await OrderItem.create({
                orderId: order.id,
                itemId: item.id,
                quantity: cartItem.quantity,
                price: itemPrice
            });
            // Update the item's stock level
            item.stock_quantity -= cartItem.quantity;
            await item.save();
        }
        let totalPrice = totalPriceBeforeDiscount * (1 - totalDiscount);
        order.totalPrice = totalPrice;
        await order.save();
        // Delete the cart items associated with cart
        await CartItem.destroy({ where: { cartId: cart.id } });
        // Delete the cart
        await cart.destroy();
        return res.json({ message: 'Order created successfully.', order, totalPriceBeforeDiscount, discount: totalDiscount, totalPrice });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while creating the order.', error });
    }
});





// Get orders for logged-in user (Registered User)
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

// Get all orders (Admin User)
router.get('/allorders', authMiddleware, async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. Only Admin User can access this endpoint.' });
        }
        // Raw SQL query to get all orders with items and user information
        const query = `
            SELECT
                o.id AS order_id,
                o.status,
                o.createdAt,
                o.updatedAt,
                o.totalPrice,
                oi.quantity,
                i.id as item_id,
                i.name,
                oi.price,
                u.fullName
            FROM
                Orders o
            INNER JOIN
                OrderItems oi ON o.id = oi.orderId
            INNER JOIN
                Items i ON oi.itemId = i.id
            INNER JOIN
                Users u ON o.userId = u.id
            ORDER BY
                o.createdAt DESC
        `;
        // Execute the raw query
        const rawOrders = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
        const orderMap = rawOrders.reduce((acc, order) => {
            const {
                order_id,
                status,
                createdAt,
                updatedAt,
                totalPrice,
                quantity,
                item_id,
                name,
                price,
                fullName,
            } = order;
            if (!acc[order_id]) {
                acc[order_id] = {
                    order_id,
                    fullName,
                    status,
                    totalPrice,
                    items: [],
                };
            }
            acc[order_id].items.push({
                id: item_id,
                name,
                quantity,
                price,
            });
            return acc;
        }, {});
        const orders = Object.values(orderMap);
        return res.json({ orders });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while retrieving all orders.', error });
    }
});





// Create order (Registered User)
router.post('/order/:id', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        const { id } = req.params;
        // Find the item being ordered
        const item = await Item.findOne({ where: { id } });
        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        if (item.stock_quantity === 0) {
            return res.status(400).json({ message: 'Item out of stock.' });
        }
        // Create the order
        const order = await Order.create({ status: 'Pending', userId });
        // Create the order item with the item price
        await OrderItem.create({
            orderId: order.id,
            itemId: item.id,
            quantity: 1,
            price: item.price
        });
        // Update the item's stock level
        item.stock_quantity -= 1;
        await item.save();
        return res.json({ message: 'Order created successfully.', order });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while creating the order.', error });
    }
});


// Update order status (Admin User)
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
