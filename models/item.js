module.exports = (sequelize, Sequelize) => {
    const Item = sequelize.define('Item', {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        price: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        stock_quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        sku: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    },{
        timestamps: true
    });

    // Relationships
    Item.associate = function(models) {
        Item.belongsTo(models.Category, { foreignKey: 'categoryId' });
        Item.belongsToMany(models.Cart, { through: models.CartItem, foreignKey: 'itemId' });
        Item.belongsToMany(models.Order, { through: models.OrderItem });
    };

    return Item;
}
