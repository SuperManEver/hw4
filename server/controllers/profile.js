const Joi = require('joi')

const { User, Permission } = require('../models')

const profileUpdateParamsSchema = Joi.object({
  firstName: Joi.string().alphanum().min(3).max(30).required(),
  middleName: Joi.string().alphanum().max(30),
  surName: Joi.string().alphanum().min(3).max(30).required(),
  oldPassword: Joi.string()
    .pattern(/^[a-zA-Z0-9]{3,30}$/)
    .required(),
  newPassword: Joi.string()
    .pattern(/^[a-zA-Z0-9]{3,30}$/)
    .required(),
  avatar: Joi.string()
})

function normalizeUpdateResponse(values) {
  return {
    id: values.id,
    username: values.username,
    firstName: values.first_name,
    surName: values.sur_name,
    middleName: values.middle_name,
    image: values.image
  }
}

exports.getById = async userId => {
  const user = await User.findOne({
    attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
    where: {
      id: userId
    },
    raw: true
  })

  const permission = await Permission.getPermissionByUserId(userId)

  return { ...user, permission }
}

exports.update = async (userId, params) => {
  const values = await profileUpdateParamsSchema.validateAsync(params)

  const user = await User.findById(userId)

  if (!user) {
    throw new Error()
  }

  return new Promise(function (resolve, reject) {
    User.comparePassword(
      values.oldPassword,
      user.password,
      async (err, matched) => {
        if (err || !matched) {
          console.log(err, matched)
          reject(new Error())
        }

        const updatedUser = await User.profileInfoUpdate({
          id: userId,
          ...values
        })

        const userData = normalizeUpdateResponse(updatedUser)

        const permission = await Permission.getPermissionByUserId(userId)

        resolve({ ...userData, permission })
      }
    )
  })
}
