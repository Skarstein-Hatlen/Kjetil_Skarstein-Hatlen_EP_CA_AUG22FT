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
    },{
        timestamps: true
    });

    // Relationships
    Item.associate = function(models) {
        Item.belongsTo(models.Category);
        Item.belongsToMany(models.Cart, { through: models.CartItem });
        Item.belongsToMany(models.Order, { through: models.OrderItem });
    };

    return Item;
}