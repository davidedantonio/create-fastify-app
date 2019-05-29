'use strict'

const Repl = require('repl')
const { sayWelcome, prompt } = require('./client')
const registerCommands = require('./commands')

function REPL (socket, fastify) {
  fastify.log.info('REPL Client Connected')
  sayWelcome(socket)

  const repl = Repl.start({
    prompt,
    input: socket,
    output: socket,
    terminal: true
  })

  // Register general Commands
  registerCommands(repl, fastify, socket)

  socket.on('error', e => {
    fastify.log.info(`REPL socket error: ${e}`)
  })

  // on exit
  repl.on('exit', () => {
    fastify.log.info('REPL Client Disconnected')
    socket.end()
  })
}

module.exports = REPL
