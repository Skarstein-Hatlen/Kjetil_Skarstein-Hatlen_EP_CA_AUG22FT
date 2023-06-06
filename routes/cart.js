const express = require('express');
const { Op } = require('sequelize');
const { Cart, CartItem, Item, User, sequelize } = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Get cart for logged-in user
router.get('/cart', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
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
        return res.json({ cart });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching the cart.', error });
    }
});


// Get all carts (Admin user)
router.get('/allcarts', authMiddleware, async (req, res) => {
    try {
        const { id, role } = req.user;
        if (role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied.' });
        }
        const [results, metadata] = await sequelize.query(`
            SELECT Carts.id, Users.fullName, Items.name, CartItems.quantity, CartItems.price 
            FROM Carts
            JOIN Users ON Carts.userId = Users.id
            JOIN CartItems ON CartItems.cartId = Carts.id
            JOIN Items ON CartItems.itemId = Items.id
        `);
        return res.json({ carts: results });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching all carts.', error });
    }
});



// Add item to cart (Registered User)
router.post('/cart_item', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        const { itemId, quantity } = req.body;
        const item = await Item.findOne({ where: { id: itemId } });
        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        if (item.stock_quantity < quantity) {
            return res.status(400).json({ message: 'Not sufficient items in stock.' });
        }
        const cart = await Cart.findOne({ where: { userId } });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }
        const price = item.price;
        const cartItem = await CartItem.create({
            itemId: itemId,
            quantity: quantity,
            cartId: cart.id,
            price: price  
        });
        return res.json({ message: 'Item added to cart successfully.', cartItem });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while adding item to the cart.', error });
    }
});




// Update cart item quantity (Registered User)
router.put('/cart_item/:itemId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        const { itemId } = req.params;
        const { quantity } = req.body;
        const userCart = await Cart.findOne({ where: { userId } });
        if (!userCart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }
        // Find the cart item related to this item and user's cart
        const cartItem = await CartItem.findOne({
            where: {
                itemId,
                cartId: userCart.id,
            }
        });
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found.' });
        }
        // Check if item are in stock
        const item = await Item.findOne({ where: { id: itemId } });
        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        if (item.stock_quantity < quantity) {
            return res.status(400).json({ message: 'Not sufficient items in stock.' });
        }
        // Update cart item quantity
        cartItem.quantity = quantity;
        await cartItem.save();
        return res.json({ message: 'Cart item quantity updated successfully.', cartItem });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while updating cart item quantity.', error });
    }
});




// Delete cart item (Registered User)
router.delete('/cart_item/:id', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        const itemId = req.params.id; 
        const cartItem = await CartItem.findOne({
            where: {
                itemId,
                '$Cart.userId$': userId
            },
            include: Cart
        });
        if (!cartItem) {
            return res.status(404).json({ message: 'Cart item not found.' });
        }
        await cartItem.destroy();
        return res.json({ message: 'Cart item deleted successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while deleting cart item.', error });
    }
});


// Delete all items in cart (Registered User)
router.delete('/cart/:id', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        const { id } = req.params;
        const cart = await Cart.findOne({ where: { id, userId } });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }
        await CartItem.destroy({ where: { cartId: id } });
        return res.json({ message: 'Items in the cart deleted successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while deleting items in the cart.', error });
    }
});




module.exports = router;
