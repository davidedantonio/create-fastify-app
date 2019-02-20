#!/usr/bin/env node

'use strict'

const appGenerator = require('./generators/fastify')
const serviceGenerator = require('./generators/service')
const mongoGenerator = require('./generators/mongodb')
const commist = require('commist')()
const utils = require('./lib/utils')

commist.register('generate:project', appGenerator.cli)
commist.register('generate:service', serviceGenerator.cli)
commist.register('add:mongo', mongoGenerator.cli)

const res = commist.parse(process.argv.splice(2))

if (res) {
  // no command was recognized
  utils.showHelp()
}
