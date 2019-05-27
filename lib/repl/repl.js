'use strict'

const Repl = require('repl')
const log = require('../log')
const { sayWelcome, prompt } = require('./client')
const registerCommands = require('./commands')
const chalk = require('chalk')

function REPL (socket, fastify) {
  log('info', 'REPL Client Connected')
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
    console.log(`REPL socket error: ${e}`);
  })

  // on exit
  repl.on('exit', () => {
    console.log(chalk.red('REPL client Disconnected'))
    socket.end()
  })
}

module.exports = REPL
