const express = require('express')
const router = express.Router()
const passport = require('passport')
const camelCase = require('lodash/camelCase')

const profileController = require('../controllers/profile')

function normalizeProfile(params) {
  return Object.keys(params).reduce((acc, key) => {
    acc[camelCase(key)] = params[key]

    return acc
  }, {})
}

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    if (!req.user) {
      res.status(400).json({ message: 'Error' })
      return
    }

    const user = await profileController.getById(req.user.id)

    res.json(normalizeProfile(user))
  }
)

router.patch(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      if (!req.user) {
        res.status(400).json({ message: 'Error' })
        return
      }

      const { id } = req.user

      const updatedUser = await profileController.update(id, req.body)

      res.json(updatedUser)
    } catch (err) {
      console.log(err)

      res.status(400).json({ message: 'Error' })
    }
  }
)

module.exports = router
