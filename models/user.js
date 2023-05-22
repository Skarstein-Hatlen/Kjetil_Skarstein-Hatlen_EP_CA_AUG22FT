const bcrypt = require('bcrypt');

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
        password: {
            type: Sequelize.STRING,
            allowNull: false,
            set(value) {
                const hash = bcrypt.hashSync(value, 10);
                this.setDataValue('password', hash);
            },
        },
        role: {
            type: Sequelize.STRING,
            defaultValue: "member",
            allowNull: false
        }
    },{
        timestamps: true
    });
    
    //Relationships
    User.associate = function(models) {
        User.hasOne(models.Role);
        User.hasMany(models.Order);
    };

    return User;
}