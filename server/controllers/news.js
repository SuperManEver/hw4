const camelCase = require('lodash/camelCase')
const { v4: uuidv4 } = require('uuid')
const Joi = require('joi')

const { News, User } = require('../models')

const schema = Joi.object({
  title: Joi.string().min(3).required(),
  text: Joi.string().min(3).required()
})

function normalizeNewsItem(news) {
  const newObj = { user: {} }

  Object.keys(news).forEach(key => {
    if (key.includes('.')) {
      const [prefix, subKey] = key.split('.')

      newObj[prefix][camelCase(subKey)] = news[key]
    } else {
      newObj[camelCase(key)] = news[key]
    }
  })

  return newObj
}

exports.getAll = async () => {
  const allNews = await News.findAll({
    attributes: { exclude: ['user_id', 'userId', 'updatedAt'] },
    include: {
      model: User,
      as: 'user',
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
    },
    raw: true
  })

  return allNews.map(normalizeNewsItem)
}

exports.create = async (userId, params) => {
  const { title, text } = await schema.validateAsync(params)

  const { id } = await News.create({
    id: uuidv4(),
    text,
    title,
    user_id: userId
  })

  const news = await News.findOne({
    attributes: { exclude: ['user_id', 'userId', 'updatedAt'] },
    include: {
      model: User,
      as: 'user',
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
    },
    where: {
      id
    },
    raw: true
  })

  return normalizeNewsItem(news)
}

exports.update = async (newsId, params) => {
  const values = await schema.validateAsync(params)

  await News.update(values, {
    fields: ['title', 'text'],
    where: {
      id: newsId
    }
  })

  const updatedUser = await News.findOne({
    attributes: { exclude: ['user_id', 'userId', 'updatedAt'] },
    include: {
      model: User,
      as: 'user',
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
    },
    where: {
      id: newsId
    },
    raw: true
  })

  return normalizeNewsItem(updatedUser)
}

exports.delete = async newsId => {
  await News.destroy({
    where: {
      id: newsId
    }
  })

  const news = await News.findAll({
    attributes: { exclude: ['user_id', 'userId', 'updatedAt'] },
    include: {
      model: User,
      as: 'user',
      attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
    },
    raw: true
  })

  return news.map(normalizeNewsItem)
}
