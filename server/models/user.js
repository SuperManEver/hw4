const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcrypt')

const { sequelize, DataTypes } = require('../lib/db')
const { encryptPassword } = require('../lib/auth')

const User = sequelize.define(
  'users',
  {
    username: {
      type: DataTypes.STRING
    },
    sur_name: {
      type: DataTypes.STRING
    },
    first_name: { type: DataTypes.STRING },
    middle_name: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
    image: { type: DataTypes.STRING }
  },
  { underscored: true }
)

function normalizeParams(values) {
  return {
    id: uuidv4(),
    username: values.username,
    ...normalizeFields(values)
  }
}

function normalizeFields(values) {
  const { surName, firstName, middleName, password } = values

  return {
    sur_name: surName,
    first_name: firstName,
    middle_name: middleName,
    password: password
  }
}

User.beforeCreate(async user => {
  user.password = await encryptPassword(user.password)
})

User.createUser = async params => {
  return User.create(normalizeParams(params), {
    raw: true
  })
}

User.comparePassword = (candidatePassword, password, next) => {
  bcrypt.compare(candidatePassword, password, (err, same) => {
    if (err) {
      return next(err)
    }
    next(null, same)
  })
}

User.findById = async id => {
  try {
    return await User.findOne({
      where: {
        id
      }
    })
  } catch (e) {
    console.error('User.findById()', e)
    return null
  }
}

User.profileInfoUpdate = async params => {
  const { avatar } = params

  const fields = normalizeFields(params)

  try {
    const passwordHash = await encryptPassword(params.newPassword)
    const values = { ...fields, image: avatar, password: passwordHash }

    const [_, updated] = await User.update(values, {
      where: { id: params.id },
      returning: true
    })

    return updated[0]
  } catch (err) {
    console.error('User.profileInfoUpdate()', err)
  }
}

module.exports = User
