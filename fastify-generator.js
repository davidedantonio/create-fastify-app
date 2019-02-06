#!/usr/bin/env node

'use strict'

const commander = require('commander')
const app = require('./generators/fastify')
const fs = require('fs')
const chalk = require('chalk')

function stop (err) {
  if (err) {
    console.error(chalk.bold.red(err))
    process.exit(1)
  }
  process.exit(0)
}

function cli () {
  commander
  .version(require('./package.json').version)
  .command('generate <project>')
  .description('Generate a new empty Fastify project')
  .action(function(project) {
    if (fs.existsSync(project)) {
      module.exports.stop('Project folder already exist')
    }

    app.generate(project, err => {
      module.exports.stop(err)
    })
  })

  commander.parse(process.argv)

  if (process.argv.length === 2) {
    commander.help()
    module.exports.stop()
  }
}

module.exports = { cli, stop }

if (require.main === module) {
  cli()
}