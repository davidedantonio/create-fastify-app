'use strict'

const chalk = require('chalk')
const prompt = chalk.cyan(`fastify → `)
const fs = require('fs')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const path = require('path')

const say = message => async socket => {
  const fileContent = await readFile(path.join(__dirname, 'help.txt'))
  if (socket) {
    socket.write(`${message}\n`)
    socket.write(fileContent)
  }
}

const sayWelcome = say(`
  Hello, ${process.env.USER}!
  You're running the Fastify REPL in ${process.cwd()}
`)

module.exports = {
  prompt,
  sayWelcome
}
