
'use strict'

const fp = require('fastify-plugin')
const net = require('net')
const REPL = require('./repl')

function fastifyREPL (fastify, opts, next) {
  const replServer = net.createServer(socket => {
    REPL(socket, fastify)
  })

  fastify
    .decorate('repl', replServer)
    .addHook('onClose', close)

  fastify.ready(err => {
    console.log(err)
    if (!err) {
      fastify.repl.listen(3033, () => console.log("repl server listening on port 3033"))
    }
  })

  next()
}

function close (fastify, done) {
  fastify
    .repl
    .close(err => {
      if (err) {
        console.error(err)
      }
      done()
    })
}

module.exports = fp(fastifyREPL, {
  fastify: '>= 2.0.0',
  name: 'fastify-repl'
})