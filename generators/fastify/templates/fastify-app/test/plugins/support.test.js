'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const Support = require('../../src/plugins/support')

test('support works standalone', async (t) => {
  const fastify = Fastify()
  fastify.register(Support)

  await fastify.ready()
  t.equal(fastify.someSupport(), 'here support')
})
