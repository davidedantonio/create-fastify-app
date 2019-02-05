#!/usr/bin/env node

'use strict'

const commander = require('commander')
const app = require('./generators/fastify')

commander
  .version(require('./package.json').version)
  .command('generate <project>')
  .description('Generate a new empty Fastify project')
  .action(function(project) {
    app.generate(project)
  })

commander.parse(process.argv)

if (process.argv.length === 2) {
  commander.help()
  process.exit(1)
}