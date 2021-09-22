const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')

const {
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
  REFRESH_TOKEN_SECRET,
  SALT_WORK_FACTOR
} = require('../config')

const genSalt = promisify(bcrypt.genSalt)
const generatePasswordHash = promisify(bcrypt.hash)
const decodeToken = promisify(jwt.verify)

function signAccessToken({ id, username }) {
  const body = { _id: id, username: username }

  return jwt.sign({ user: body }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL
  })
}

function signRefreshToken({ id, username }) {
  const body = { _id: id, username: username }

  return jwt.sign({ user: body }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL
  })
}

async function encryptPassword(password) {
  const salt = await genSalt(SALT_WORK_FACTOR)
  return generatePasswordHash(password, salt)
}

module.exports = {
  genSalt,
  decodeToken,
  signAccessToken,
  signRefreshToken,
  encryptPassword
}
