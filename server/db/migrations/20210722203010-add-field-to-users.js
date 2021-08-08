module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('users', 'image', Sequelize.STRING)
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('users', 'image')
  }
}
