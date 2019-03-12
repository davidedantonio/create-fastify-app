#!/usr/bin/env node

'use strict'

const appGenerator = require('./generators/fastify')
const serviceGenerator = require('./generators/service')
const mongoGenerator = require('./generators/mongodb')
const mysqlGenerator = require('./generators/mysql')
const corsGenerator = require('./generators/cors')
const redisGenerator = require('./generators/redis')
const commist = require('commist')()
const utils = require('./lib/utils')
require('make-promises-safe')

commist.register('generate:project', appGenerator.cli)
commist.register('generate:service', serviceGenerator.cli)
commist.register('add:mysql', mysqlGenerator.cli)
commist.register('add:mongo', mongoGenerator.cli)
commist.register('add:cors', corsGenerator.cli)
commist.register('add:redis', redisGenerator.cli)

const res = commist.parse(process.argv.splice(2))

if (res) {
  // no command was recognized
  utils.showHelp()
}
