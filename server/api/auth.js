const express = require('express')
const router = express.Router()

const passport = require('passport')

const AuthController = require('../controllers/auth')
const { User } = require('../models')
const { decodeToken, signAccessToken } = require('../lib/auth')
const Cache = require('../lib/cache')

const { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_TTL } = require('../config')

router.post('/refresh-token', async (req, res) => {
  const { authorization } = req.headers

  const { token, expiredAt } = await Cache.get(authorization)

  if (!authorization || !token) {
    throw new Error()
  }

  const {
    user: { _id, username }
  } = await decodeToken(token, REFRESH_TOKEN_SECRET)

  const user = await User.findById(_id)

  if (!user) {
    throw new Error()
  }

  const accessToken = signAccessToken({ id: _id, username })

  res.status(201).json({
    accessToken,
    refreshToken: token,
    accessTokenExpiredAt: Date.now() + ACCESS_TOKEN_TTL,
    refreshTokenExpiredAt: expiredAt
  })
})

router.post('/registration', async (req, res, next) => {
  try {
    const newUser = await AuthController.registerUser(req.body)

    res.status(200).json(newUser)
  } catch (err) {
    console.error(err)
    res.status(400).send({ message: 'Error' })
  }
})

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      return res.status(400).json({ message: 'Error' })
    }

    req.login(user, async () => {
      const data = await AuthController.authorizeUser(user)

      res.json(data)
    })
  })(req, res, next)
})

module.exports = router
