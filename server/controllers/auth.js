const camelCase = require('lodash/camelCase')
const omit = require('lodash/omit')
const Joi = require('joi')

const { User, Permission } = require('../models')
const Cache = require('../lib/cache')
const { signAccessToken, signRefreshToken } = require('../lib/auth')

const { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } = require('../config')

const registrationParamsSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  surName: Joi.string().alphanum().min(3).max(30).required(),
  firstName: Joi.string().alphanum().min(3).max(30).required(),
  middleName: Joi.string().alphanum().max(30),
  password: Joi.string().pattern(/^[a-zA-Z0-9]{3,30}$/)
})

function prepareAuthorisedUserResponse(params) {
  const accessToken = signAccessToken({
    id: params.id,
    username: params.username
  })
  const refreshToken = signRefreshToken({
    id: params.id,
    username: params.username
  })

  Cache.set(refreshToken, {
    token: refreshToken,
    expiredAt: Date.now() + REFRESH_TOKEN_TTL
  })

  const values = Object.keys(params).reduce((acc, key) => {
    acc[camelCase(key)] = params[key]

    return acc
  }, {})

  return {
    ...values,
    accessToken,
    refreshToken,
    accessTokenExpiredAt: Date.now() + ACCESS_TOKEN_TTL,
    refreshTokenExpiredAt: Date.now() + REFRESH_TOKEN_TTL
  }
}

async function registerUser(params) {
  const values = await registrationParamsSchema.validateAsync(params)

  const { dataValues } = await User.createUser(values)

  const { id } = dataValues

  const permissions = await Permission.createPermission(id)

  const userData = prepareAuthorisedUserResponse(
    omit(dataValues, ['password', 'updatedAt', 'createdAt'])
  )

  return {
    ...userData,
    permission: permissions
  }
}

async function getById(userId) {
  const user = await User.findOne({
    where: {
      id: userId
    }
  })

  return user
}

async function authorizeUser(user) {
  const { id } = user

  const permission = await Permission.getPermissionByUserId(id)

  const userInfo = omit(user, ['password', 'createdAt', 'updatedAt'])

  return { ...prepareAuthorisedUserResponse(userInfo), permission }
}

module.exports = {
  registerUser,
  prepareAuthorisedUserResponse,
  getById,
  authorizeUser
}
