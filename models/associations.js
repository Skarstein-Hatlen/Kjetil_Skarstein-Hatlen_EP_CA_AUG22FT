const createAssociations = (models) => {
    const { User, Role, Category, Item, Cart, CartItem, Order, OrderItem } = models;

    // Users have one Role, and a Role can have many Users
    User.belongsTo(Role, { foreignKey: 'role_id' });
    Role.hasMany(User, { foreignKey: 'role_id' });

    // Users have one Cart, and a Cart belongs to a User
    User.hasOne(Cart, { foreignKey: 'user_id' });
    Cart.belongsTo(User, { foreignKey: 'user_id' });

    // Users have many Orders, and an Order belongs to a User
    User.hasMany(Order, { foreignKey: 'user_id' });
    Order.belongsTo(User, { foreignKey: 'user_id' });

    // Categories have many Items, and an Item belongs to a Category
    Category.hasMany(Item, { foreignKey: 'category_id' });
    Item.belongsTo(Category, { foreignKey: 'category_id' });

    // Carts have many CartItems, and a CartItem belongs to a Cart
    Cart.hasMany(CartItem, { foreignKey: 'cart_id' });
    CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });

    // Orders have many OrderItems, and an OrderItem belongs to an Order
    Order.hasMany(OrderItem, { foreignKey: 'order_id' });
    OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

    // Items have many CartItems, and a CartItem belongs to an Item
    Item.hasMany(CartItem, { foreignKey: 'item_id' });
    CartItem.belongsTo(Item, { foreignKey: 'item_id' });

    // Items have many OrderItems, and an OrderItem belongs to an Item
    Item.hasMany(OrderItem, { foreignKey: 'item_id' });
    OrderItem.belongsTo(Item, { foreignKey: 'item_id' });
};

module.exports = createAssociations;
