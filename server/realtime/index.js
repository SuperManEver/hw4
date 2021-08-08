const http = require('http')
const io = require('socket.io')

const app = require('../routes')
const { User } = require('../models')

class RealtimeProvider {
  constructor() {
    this.users = {} // все пользователи чата
    this.rooms = ['general', 'random', 'practice']

    const server = http.createServer(app)
    this.io = io(server)
    this.io.on('connection', this.handleConnect)
  }

  handleConnect(socket) {
    socket.on('users:connect', async userId => {
      const currentUser = User.findById(userId)

      if (!currentUser) return

      const defaultRoom = this.rooms[0]

      const userInfo = {
        username: currentUser.username || 'Guest',
        socketId: socket.id,
        activeRoom: defaultRoom,
        userId
      }

      socket.join(defaultRoom)

      socket.json.emit('users:list', Object.values(this.users))

      this.users[socket.id] = userInfo

      socket.broadcast.to(defaultRoom).emit('users:add', userInfo)
    })

    socket.on('message:add', () => {})

    socket.on('message:history', () => {})

    socket.on('disconnect', () => {})

    socket.on('users:leave', () => {})
  }
}

module.exports = RealtimeProvider
