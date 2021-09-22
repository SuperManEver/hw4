const { v4: uuidv4 } = require('uuid')

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.sequelize.transaction(async t => {
      const options = { transaction: t }

      await queryInterface.createTable(
        'news',
        {
          id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: () => uuidv4()
          },
          user_id: {
            type: Sequelize.UUID,
            allowNull: false
          },
          text: {
            type: Sequelize.STRING,
            allowNull: false
          },
          title: {
            type: Sequelize.STRING,
            allowNull: false
          },
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
    await queryInterface.dropTable('news')
  }
}
