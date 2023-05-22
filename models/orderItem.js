module.exports = (sequelize, Sequelize) => {
  const OrderItem = sequelize.define('OrderItem', {
      quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
      },
  },{
      timestamps: true
  });

  // Relationships
  OrderItem.associate = function(models) {
      OrderItem.belongsTo(models.Order);
      OrderItem.belongsTo(models.Item);
  };

  return OrderItem;
}