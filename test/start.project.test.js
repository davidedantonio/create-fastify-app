'use strict'

const t = require('tap')
const { test } = t
const server = require('./workdir/server')
const sget = require('simple-get').concat
const path = require('path')

test('start project succesfully', (t) => {
  t.plan(6)

  server.start(['-f', path.join(__dirname, 'workdir', 'app', 'app.js')], function (err, fastify) {
    t.error(err)

    sget({
      method: 'GET',
      url: `http://localhost:${fastify.server.address().port}/hello`
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.deepEqual(body.toString(), 'hello, world!')

      fastify.close(() => {
        t.pass('server closed')
      })
    })
  })
})
