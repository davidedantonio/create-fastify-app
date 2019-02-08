'use strict'

const { test } = require('tap')
const { build } = require('../helper')

test('hello is loaded', async (t) => {
  const app = build(t)

  const res = await app.inject({
    url: '/hello'
  })
  t.equal(res.payload, 'hello, world!')
})
