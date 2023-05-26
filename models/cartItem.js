module.exports = (sequelize, Sequelize) => {
    const CartItem = sequelize.define('CartItem', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        cartId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Carts',
                key: 'id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        },
        itemId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Items',
                key: 'id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        },
        price: {
            type: Sequelize.FLOAT,
            allowNull: false,
        }
    },{
        timestamps: true
    });
    CartItem.associate = function(models) {
        CartItem.belongsTo(models.Cart, { foreignKey: 'cartId' });
        CartItem.belongsTo(models.Item, { foreignKey: 'itemId' });
    }

    return CartItem;
}
