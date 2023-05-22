const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    status: {
      type: DataTypes.ENUM('In Progress', 'Completed', 'Cancelled')
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2)
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2)
    },
    created_at: {
      type: DataTypes.DATE
    },
    updated_at: {
      type: DataTypes.DATE
    }
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tableName: 'orders'
  });

  return Order;
};
