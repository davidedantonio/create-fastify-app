'use strict'

const chalk = require('chalk')
const prompt = chalk.cyan(`fastify → `)

const say = message => socket => {
  if (socket) {
    socket.write(`${message}\n`)
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
