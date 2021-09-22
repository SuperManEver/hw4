const camelCase = require('lodash/camelCase')

const { User, Permission, News } = require('../models')

function serializeValues(params) {
  return Object.keys(params).reduce((acc, key) => {
    acc[camelCase(key)] = params[key]

    return acc
  }, {})
}

exports.updatePermissions = async (userId, params) => {
  const { permission } = params

  if (!permission) {
    throw new Error()
  }

  const { dataValues } = await User.findOne({
    attributes: {
      exclude: ['password', 'createdAt', 'updatedAt']
    },
    where: {
      id: userId
    }
  })

  const updatePermissions = await Permission.updatePermission(
    userId,
    permission
  )

  return { ...serializeValues(dataValues), permission: updatePermissions }
}

exports.delete = async userId => {
  await News.destroy({
    where: {
      user_id: userId
    }
  })

  await Permission.destroy({
    where: {
      user_id: userId
    }
  })

  return await User.destroy({
    where: {
      id: userId
    }
  })
}
