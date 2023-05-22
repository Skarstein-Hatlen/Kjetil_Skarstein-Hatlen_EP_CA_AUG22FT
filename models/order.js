module.exports = (sequelize, Sequelize) => {
  const Order = sequelize.define('Order', {
      status: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'Pending',
      },
  },{
      timestamps: true
  });

  // Relationships
  Order.associate = function(models) {
      Order.belongsTo(models.User);
      Order.belongsToMany(models.Item, { through: models.OrderItem });
  };

  return Order;
}