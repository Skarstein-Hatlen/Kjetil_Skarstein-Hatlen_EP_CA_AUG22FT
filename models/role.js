module.exports = (sequelize, Sequelize) => {
  const Role = sequelize.define('Role', {
      name: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
      },
  },{
      timestamps: true
  });

  // Relationships
  Role.associate = function(models) {
      Role.belongsTo(models.User);
  };

  return Role;
}