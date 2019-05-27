'use strict'

const Fastify = require('fastify')
const fp = require('fastify-plugin')
const App = require('../src')

function config () {
  return {}
}

function build (t) {
  const app = Fastify()

  app.register(fp(App), config())
  t.tearDown(app.close.bind(app))

  return app
}

module.exports = {
  config,
  build
}
