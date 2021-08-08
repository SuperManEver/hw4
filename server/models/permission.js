const { v4: uuidv4 } = require('uuid')
const pick = require('lodash/pick')
const { DataTypes, Model } = require('sequelize')

const { sequelize } = require('../lib/db')

class Permission extends Model {}

Permission.init(
  {
    user_id: { type: DataTypes.UUID, allowNull: false },

    chat: { type: DataTypes.STRING, allowNull: false },
    news: { type: DataTypes.STRING, allowNull: false },
    settings: { type: DataTypes.STRING, allowNull: false }
  },
  {
    sequelize,
    modelName: 'Permission',
    underscored: true,
    indexes: [
      {
        fields: ['user_id'],
        unique: true
      }
    ]
  }
)

Permission.defaultSettingsEntity = userId => {
  return { C: true, R: true, U: true, D: true }
}

Permission.serializePermission = permission => {
  return Object.keys(pick(permission, ['chat', 'news', 'settings'])).reduce(
    (acc, key) => {
      acc[key] = JSON.parse(permission[key])

      return acc
    },
    {}
  )
}

Permission.createPermission = async userId => {
  const { dataValues } = await Permission.create({
    id: uuidv4(),
    user_id: userId,
    chat: JSON.stringify(Permission.defaultSettingsEntity(), null, 4),
    news: JSON.stringify(Permission.defaultSettingsEntity(), null, 4),
    settings: JSON.stringify(Permission.defaultSettingsEntity(), null, 4)
  })

  const { id } = dataValues

  const permission = await Permission.findOne(
    {
      where: {
        id
      }
    },
    {
      raw: true
    }
  )

  return Permission.serializePermission(permission)
}

Permission.updatePermission = async (userId, permission) => {
  const { chat, news, settings } = permission

  const [_, result] = await Permission.update(
    {
      chat: JSON.stringify(chat, null, 2),
      news: JSON.stringify(news, null, 2),
      settings: JSON.stringify(settings, null, 2)
    },
    {
      where: {
        user_id: userId
      },
      returning: true
    }
  )

  const { dataValues } = result[0]

  return Permission.serializePermission(dataValues)
}

Permission.getPermissionByUserId = async userId => {
  const permission = await Permission.findOne(
    {
      where: {
        user_id: userId
      }
    },
    {
      raw: true
    }
  )

  return Permission.serializePermission(permission)
}

module.exports = Permission
