module.exports = (sequelize, Sequelize) => {
    const OrderItem = sequelize.define('OrderItem', {
        quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        price: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        orderId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Orders',
                key: 'id'
            }
        },
        itemId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Items',
                key: 'id'
            }
        },
    },{
        timestamps: true
    });
    
    // Relationships
    OrderItem.associate = function(models) {
        OrderItem.belongsTo(models.Item, { foreignKey: 'itemId' }); 
        OrderItem.belongsTo(models.Order, { foreignKey: 'orderId' }); 
    };

    return OrderItem;
};
