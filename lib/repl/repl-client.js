#!/usr/bin/env node
const net = require('net')
const log = require('../../lib/log')

function connect (args) {
  if (args.length !== 1) {
    log('error', 'Usage fastify-repl <host:port>')
    process.exit(1)
  }

  const url = args[0]
  const [host, port] = url.split(':')

  const socket = net.connect(parseInt(port), host)

  process.stdin.pipe(socket)
  socket.pipe(process.stdout)

  socket.on('connect', () => {
    process.stdin.setRawMode(true)
  })

  socket.on('close', () => {
    process.exit(0)
  })

  process.on('exit', () => {
    socket.end()
  })
}

if (require.main === module) {
  connect(process.argv.slice(2))
}
