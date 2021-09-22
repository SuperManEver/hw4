const express = require('express')
const router = express.Router()
const passport = require('passport')

const newsController = require('../controllers/news')

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const news = await newsController.getAll()

      res.json(news)
    } catch (err) {
      console.error('err', err)
      res.status(400).json({
        message: err
      })
    }
  }
)

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    if (!req.user) {
      res.status(400).json({ message: 'Error' })
      return
    }

    try {
      const news = await newsController.create(req.user.id, req.body)

      res.json(news)
    } catch (err) {
      console.error('err', err)
      res.status(400).json({
        message: err
      })
    }
  }
)

router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params

      if (!id) {
        throw new Error()
      }

      const result = await newsController.update(id, req.body)

      res.json(result)
    } catch (err) {
      console.error('err', err)
      res.status(400).json({
        message: err
      })
    }
  }
)

router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params

      if (!id) {
        throw new Error('Incorrect news ID')
      }

      const news = await newsController.delete(id)

      res.json(news)
    } catch (err) {
      console.error('err', err)
      res.status(400).json({
        message: err
      })
    }
  }
)

module.exports = router
