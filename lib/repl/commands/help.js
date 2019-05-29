'use strict'

const fs = require('fs')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const path = require('path')

async function command (socket, fastify) {
  const fileContent = await readFile(path.join(__dirname, '..', 'help.txt'))
  socket.write(fileContent)
}

module.exports.name = 'help'
module.exports.command = command
