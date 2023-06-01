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
        },
        salt: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: function() {
                return crypto.randomBytes(16).toString('hex');
            },
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
            set(value) {
                const hash = crypto.pbkdf2Sync(value, this.salt, 1000, 64, 'sha256').toString('hex');
                this.setDataValue('password', hash);
            },
        }
    },{
        timestamps: true
    });

    // Relationships
    User.associate = function(models) {
        User.belongsTo(models.Role, { foreignKey: 'roleId' });
        User.hasOne(models.Cart, { foreignKey: 'userId' });
        User.hasMany(models.Order);
    };

    return User;
}
