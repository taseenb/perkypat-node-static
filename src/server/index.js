// import 'core-js/stable'
// import 'regenerator-runtime/runtime'
import config from './config'
import app from './express-app'
import d from 'debug'
import http from 'http'
import fs from 'fs'

const debug = d('app:www')

const port = normalizePort(config.port)
app.set('port', port)

const server = http.createServer(app)
server.listen(app.get('port'))
server.on('error', onError)
server.on('listening', onListening)

function onError (error) {
  if (error.syscall !== 'listen') {
    throw error //
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port

  console.log(error.code)

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
    default:
      throw error
  }
}

function normalizePort (val) {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

function onListening () {
  const addr = server.address()
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
  debug('Listening on ' + bind)
}
