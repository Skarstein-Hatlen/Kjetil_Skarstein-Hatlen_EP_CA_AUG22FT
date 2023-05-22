module.exports = (sequelize, Sequelize) => {
  const Cart = sequelize.define('Cart', {},{
      timestamps: true
  });

  // Relationships
  Cart.associate = function(models) {
      Cart.belongsTo(models.User);
      Cart.belongsToMany(models.Item, { through: models.CartItem });
  };

  return Cart;
}