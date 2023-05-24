const crypto = require('crypto');

module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('User', {
        fullName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        username: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
            set(value) {
                const hash = crypto.createHash('sha256').update(value).digest('hex');
                this.setDataValue('password', hash);
            },
        }
    },{
        timestamps: true
    });

    User.associate = function(models) {
        User.belongsTo(models.Role, { foreignKey: 'roleId' });
        User.hasMany(models.Order);
    };

    return User;
}
