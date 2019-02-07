#!/usr/bin/env node

'use strict'

const appGenerator = require('./generators/fastify')
const serviceGenerator = require('./generators/service')
const commist = require('commist')()

commist.register('generate:project', appGenerator.cli)
commist.register('generate:service', serviceGenerator.generate)

const res = commist.parse(process.argv.splice(2))

if (res) {
  // no command was recognized
  console.log('mammt')
}
