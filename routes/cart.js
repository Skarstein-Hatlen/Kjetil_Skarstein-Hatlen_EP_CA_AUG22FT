const express = require('express');
const { Op } = require('sequelize');
const { Cart, CartItem, Item, User } = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Get cart for the logged-in user
router.get('/cart', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;

        // Find the cart for the logged-in user
        const cart = await Cart.findOne({
            where: { userId },
            include: {
                model: CartItem,
                include: Item
            }
        });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }

        return res.json({ cart });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching the cart.', error });
    }
});

// Get all carts (accessible by Admin user)
router.get('/allcarts', authMiddleware, async (req, res) => {
    try {
        const { userId, role } = req.user;

        if (role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        // Fetch all carts with users' full names
        const carts = await Cart.findAll({
            include: [
                {
                    model: User,
                    attributes: ['firstName', 'lastName']
                },
                {
                    model: CartItem,
                    include: Item
                }
            ]
        });

        return res.json({ carts });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching all carts.', error });
    }
});

// Add item to the cart (accessible by Registered User)
router.post('/cart_item', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        const { itemId, quantity } = req.body;
        // Check if the item exists
        const item = await Item.findOne({ where: { id: itemId } });
        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        // Check if the item is in stock
        if (item.stock < quantity) {
            return res.status(400).json({ message: 'Item is out of stock.' });
        }
        // Find the cart for the logged-in user
        const cart = await Cart.findOne({ where: { userId } });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }
        // Create a cart item and associate it with the item and cart
        const cartItem = await CartItem.create({ itemId, quantity, price: item.price });
        await cart.addItem(cartItem);
        return res.json({ message: 'Item added to cart successfully.', cartItem });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while adding item to the cart.', error });
    }
});

// Update cart item quantity (accessible by Registered User)
router.put('/cart_item/:id', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        const { id } = req.params;
        const { quantity } = req.body;
        // Find the cart item for the logged-in user
        const cartItem = await CartItem.findOne({
            where: {
                id, '$cart.userId$': userId
            },
            include: {
                model: Cart,
                as: 'cart',
                where: { userId }
            }
        });
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found.' });
        }
        // Check if the item is in stock
        const item = await Item.findOne({ where: { id: cartItem.itemId } });
        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        if (item.stock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock.' });
        }
        // Update the cart item quantity
        cartItem.quantity = quantity;
        await cartItem.save();
        return res.json({ message: 'Cart item quantity updated successfully.', cartItem });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while updating cart item quantity.', error });
    }
});

// Delete cart item (accessible by Registered User)
router.delete('/cart_item/:id', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        const { id } = req.params;
        // Find the cart item for the logged-in user
        const cartItem = await CartItem.findOne({
            where: {
                id,
                '$cart.userId$': userId
            },
            include: {
                model: Cart,
                as: 'cart',
                where: { userId }
            }
        });
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found.' });
        }
        // Delete the cart item
        await cartItem.destroy();
        return res.json({ message: 'Cart item deleted successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while deleting cart item.', error });
    }
});

// Delete entire cart (accessible by Registered User)
router.delete('/cart/:id', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        const { id } = req.params;
        // Find the cart for the logged-in user
        const cart = await Cart.findOne({ where: { id, userId } });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }
        // Delete the cart and associated cart items
        await cart.destroy();
        return res.json({ message: 'Cart deleted successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while deleting cart.', error });
    }
});

module.exports = router;
