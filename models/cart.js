// cart.js
module.exports = (sequelize, Sequelize) => {
  const Cart = sequelize.define('Cart', {},{
      timestamps: true
  });

  // Relationships
  Cart.associate = function(models) {
      Cart.belongsTo(models.User, { foreignKey: 'userId' });
      Cart.hasMany(models.CartItem, { foreignKey: 'cartId', as: 'cartItems' }); 
      Cart.belongsToMany(models.Item, { through: models.CartItem, foreignKey: 'cartId' });
  };

  return Cart;
}
