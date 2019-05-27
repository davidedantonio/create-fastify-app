'use strict'

const Fastify = require('fastify')
const fp = require('fastify-plugin')

function config () {
  return {}
}

function build (t) {
  const app = Fastify()

  app.register(fp(require('../workdir/src')), config())
  t.tearDown(app.close.bind(app))

  return app
}

module.exports = {
  config,
  build
}
