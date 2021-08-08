const createError = require('http-errors')
const express = require('express')
const path = require('path')
const logger = require('morgan')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const passportJWT = require('passport-jwt')
const session = require('express-session')

const {
  SESSION_SECRET,
  ACCESS_TOKEN_SECRET,
  CLIENT_BUILD_PATH
} = require('../config')
const { User } = require('../models')

const newsApi = require('../api/news')
const profileApi = require('../api/profile')
const usersApi = require('../api/users')
const authApi = require('../api/auth')
const usersController = require('../controllers/auth')

const FileStore = require('session-file-store')(session)

const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt

const app = express()

app.use(
  session({
    store: new FileStore(),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  })
)
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await usersController.getById(id)

    done(null, user)
  } catch (err) {
    console.error(err)
    done(err, null)
  }
})

passport.use(
  new LocalStrategy(
    {
      usernameField: 'username'
    },
    async (username, password, done) => {
      try {
        const user = await User.findOne({
          where: {
            username
          },
          raw: true
        })

        User.comparePassword(password, user.password, (err, matched) => {
          if (err) {
            throw err
          }

          if (matched) {
            done(null, user)
          } else {
            done(null, false, { message: 'Invalid username / password' })
          }
        })
      } catch (err) {
        done(null, false, { message: 'Invalid username / password' })
      }
    }
  )
)

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: ACCESS_TOKEN_SECRET
    },
    async (jwtPaylod, done) => {
      try {
        const user = await User.findById(jwtPaylod.user._id)

        done(null, user)
      } catch (err) {
        done(err, null)
      }
    }
  )
)

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.normalize(path.join(process.cwd(), 'public'))))
app.use(express.static(CLIENT_BUILD_PATH))

app.use('/api/news', newsApi)
app.use('/api/profile', profileApi)
app.use('/api/users', usersApi)
app.use('/api', authApi)

app.get('*', (req, res) => {
  res.sendFile(path.normalize(path.join(CLIENT_BUILD_PATH, 'index.html')))
})

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.send(err.message)
})

module.exports = app
