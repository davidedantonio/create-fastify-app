'use strict'

const chalk = require('chalk')
const { stop, run } = require('../../server')

const {
  GRACEFUL_SHUT,
  READY,
  TIMEOUT
} = require('./constants.js')

const fastify = run(process.argv.splice(2))
const type = process.env.childEvent

process.send({ type: type, err: null })

fastify.ready(err => {
  process.send({ type: READY, err: err })
  if (err) { stop(err) }
})

process.on('message', function (event) {
  if (event === GRACEFUL_SHUT) {
    const message = chalk.red('Process forced end')
    setTimeout(exit.bind({ message }), TIMEOUT).unref()
    fastify.close(() => {
      process.exit(0)
    })
  }
})

process.on('uncaughtException', (err) => {
  console.log(chalk.red(err))
  const message = chalk.red('App crashed - waiting for file changes before starting...')
  exit.bind({ message })()
})

function exit () {
  if (this) { console.log(chalk.red(this.message)) }
  process.exit(1)
}
