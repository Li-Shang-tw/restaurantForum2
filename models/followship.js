'use strict';
module.exports = (sequelize, DataTypes) => {
  const followship = sequelize.define('followship', {
    followerId: DataTypes.INTEGER,
    followingId: DataTypes.INTEGER
  }, {});
  followship.associate = function(models) {
    // associations can be defined here
  };
  return followship;
};