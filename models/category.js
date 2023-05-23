module.exports = (sequelize, Sequelize) => {
    const Category = sequelize.define('Category', {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
    },{
        timestamps: true
    });

    // Relationships
    Category.associate = function(models) {
        Category.hasMany(models.Item);
    };

    return Category;
}