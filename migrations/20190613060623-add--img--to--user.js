'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Users', 'img', {
      type: Sequelize.STRING,
      allowNull: false,

    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Users', 'img')
  }
}