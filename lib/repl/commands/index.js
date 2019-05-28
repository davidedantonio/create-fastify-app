'use strict'

const fs = require('fs')
const { promisify } = require('util')
const readdir = promisify(fs.readdir)
const path = require('path')

module.exports = async function (repl, fastify, socket) {
  const folder = await readdir(path.join(__dirname, '.'))
  for (let filename of folder) {
    filename = path.basename(filename, path.extname(filename))
    if (filename !== 'index') {
      let { name, command } = require(`./${filename}`)
      repl.defineCommand(name, _ => { command(socket, fastify) })
    }
  }
}
