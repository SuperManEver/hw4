const { DataTypes, Model } = require('sequelize')
const { sequelize } = require('../lib/db')
const User = require('./user')

class News extends Model {}

News.init(
  {
    text: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    user_id: { type: DataTypes.UUID, allowNull: false }
  },
  {
    sequelize,
    modelName: 'News',
    underscored: true,
    indexes: [
      {
        fields: ['user_id']
      }
    ]
  }
)

News.belongsTo(User)

module.exports = News
