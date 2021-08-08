const express = require('express')
const router = express.Router()
const passport = require('passport')
const camelCase = require('lodash/camelCase')

const { User } = require('../models')
const usersController = require('../controllers/users')

function normalizeUserInfo(params) {
  return Object.keys(params).reduce((acc, key) => {
    acc[camelCase(key)] = params[key]

    return acc
  }, {})
}

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const users = await User.findAll({
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'password']
      },
      raw: true
    })

    res.json(users.map(normalizeUserInfo))
  }
)

router.patch(
  '/:id/permission',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params

      const data = await usersController.updatePermissions(id, req.body)

      res.json(data)
    } catch (err) {
      console.error(err)
      res.status(400).send({ message: 'Error' })
    }
  }
)

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { id } = req.params

    await usersController.delete(id)

    res.json({})
  }
)

module.exports = router
