module.exports = (sequelize, Sequelize) => {
    const Order = sequelize.define('Order', {
        status: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'Pending',
        },
        totalPrice: {
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue: 0,
        },
    },{
        timestamps: true
    });

    // Relationships
    Order.associate = function(models) {
        Order.belongsTo(models.User);
        Order.belongsToMany(models.Item, { through: models.OrderItem, foreignKey: 'orderId', as: 'items' });
        Order.hasMany(models.OrderItem, { foreignKey: 'orderId' });
    };

    return Order;
}
