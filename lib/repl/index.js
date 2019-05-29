'use strict'

const fp = require('fastify-plugin')
const net = require('net')
const REPL = require('./repl')

function fastifyREPL (fastify, opts, next) {
  const replServer = net.createServer(socket => {
    REPL(socket, fastify)
  })

  const options = Object.assign({}, {
    port: opts.port || 4000
  })

  fastify
    .decorate('repl', replServer)
    .addHook('onClose', close)

  fastify.ready(err => {
    if (!err) {
      fastify.repl.listen(options.port, () => fastify.log.info(`REPL server listen on port ${options.port}`))
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
