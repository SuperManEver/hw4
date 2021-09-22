const http = require('http')
const app = require('./routes')
const RealtimeProvider = require('./realtime')

const { PORT } = require('./config')

const server = http.createServer(app)
const realtime = new RealtimeProvider()

server.listen(PORT, () => {
  console.log('Сервер запущен на порте: ' + PORT)
})
