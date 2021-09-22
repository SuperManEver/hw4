module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addIndex('users', {
      fields: ['username'],
      unique: true
    })
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeIndex('users', ['username'])
  }
}
