module.exports = (sequelize, Sequelize) => {
  const CartItem = sequelize.define('CartItem', {
      quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
      },
  },{
      timestamps: true
  });

  // Relationships
  CartItem.associate = function(models) {
      CartItem.belongsTo(models.Cart);
      CartItem.belongsTo(models.Item);
  };

  return CartItem;
}
