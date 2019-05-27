'use strict'

const t = require('tap')
const { test } = t
const server = require('./workdir/server')
const sget = require('simple-get').concat
const path = require('path')

test('start project succesfully', (t) => {
  t.plan(6)

  server.start(['-f', path.join(__dirname, 'workdir', 'src', 'index.js')], function (err, fastify) {
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

test('start project succesfully on given parameters', (t) => {
  t.plan(4)

  server.start(['-p', '3040', '-a', '127.0.0.1', '-f', path.join(__dirname, 'workdir', 'src', 'index.js')], function (err, fastify) {
    t.error(err)
    t.deepEqual(fastify.server.address().port, '3040')
    t.deepEqual(fastify.server.address().address, '127.0.0.1')
    fastify.close(() => {
      t.pass('server closed')
    })
  })
})

test('start project succesfully on given .env parameters', (t) => {
  t.plan(4)

  process.env.FASTIFY_PORT = '3040'
  process.env.FASTIFY_ADDRESS = '127.0.0.1'

  server.start(['-f', path.join(__dirname, 'workdir', 'src', 'index.js')], function (err, fastify) {
    t.error(err)
    t.deepEqual(fastify.server.address().port, '3040')
    t.deepEqual(fastify.server.address().address, '127.0.0.1')
    fastify.close(() => {
      t.pass('server closed')
    })
  })
})
