#!/usr/bin/env node

'use strict'

const fs = require('fs')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const path = require('path')
const appGenerator = require('./generators/fastify')
const serviceGenerator = require('./generators/service')
const mongoGenerator = require('./generators/mongodb')
const mysqlGenerator = require('./generators/mysql')
const corsGenerator = require('./generators/cors')
const redisGenerator = require('./generators/redis')
const postgresGenerator = require('./generators/postgres')
const povGenerator = require('./generators/point-of-view')
const commist = require('commist')()
const log = require('./lib/log')
const run = require('./run')
const eject = require('./eject')

require('make-promises-safe')

function stop (err) {
  if (err) {
    log('error', err)
    process.exit(1)
  }
  process.exit(0)
}

async function showHelp () {
  try {
    const file = await readFile(path.join(__dirname, 'help', 'usage.txt'), 'utf8')
    log('info', file)
  } catch (e) {
    return stop(e)
  }
  return stop()
}

commist.register('run', run.cli)
commist.register('eject', eject.cli)
commist.register('generate:project', appGenerator.cli)
commist.register('generate:service', serviceGenerator.cli)
commist.register('add:mysql', mysqlGenerator.cli)
commist.register('add:mongo', mongoGenerator.cli)
commist.register('add:cors', corsGenerator.cli)
commist.register('add:redis', redisGenerator.cli)
commist.register('add:postgres', postgresGenerator.cli)
commist.register('add:pov', povGenerator.cli)

const res = commist.parse(process.argv.splice(2))

if (res) {
  // no command was recognized
  showHelp()
}
