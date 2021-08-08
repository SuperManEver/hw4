const { v4: uuidv4 } = require('uuid')

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.sequelize.transaction(async t => {
      const options = { transaction: t }

      await queryInterface.createTable(
        'users',
        {
          id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: () => uuidv4()
          },
          username: {
            type: Sequelize.STRING,
            allowNull: false
          },
          sur_name: {
            type: Sequelize.STRING,
            allowNull: false
          },
          first_name: { type: Sequelize.STRING, allowNull: false },
          middle_name: { type: Sequelize.STRING },
          password: { type: Sequelize.STRING, allowNull: false },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          }
        },
        options
      )
    }),
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users')
  }
}
