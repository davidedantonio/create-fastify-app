#!/usr/bin/env node

'use strict'

const commander = require('commander')
const app = require('./generators/fastify')

commander
  .version(require('./package.json').version)
  .command('<project-name>', 'The name of the project to be generated')
  .parse(process.argv)

if (commander.args.length === 0) {
  commander.help()
  process.exit(1)
}