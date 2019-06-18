'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN,
    image: DataTypes.STRING,
  }, {});
  User.associate = function (models) {
    User.hasMany(models.Comment)
    User.belongsToMany(models.Restaurant,
      {
        through: models.Favorite,
        foreginKey: 'UserId',
        as: 'FavoritedRestaurants'

      })
    User.belongsToMany(models.Restaurant,
      {
        through: models.Like,
        foreginKey: 'UserId',
        as: 'LikedRestaurants'

      })
  };

  return User;
};