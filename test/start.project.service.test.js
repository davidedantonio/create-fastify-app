'use strict'

const t = require('tap')
const { test } = t
const server = require('./workdir/server')
const path = require('path')
const { run, ENTER } = require('./helpers/inputify')
const { existsSync } = require('fs')

test('generate service deid and start server', (t) => {
  t.plan(14)

  run(
    ['create-fastify-app.js', 'generate:service', 'deid', '-d', `./test/workdir`],
    [
      `${ENTER}`,
      `${ENTER}`
    ]
  ).then( _ => {
    server.start(['-f', path.join(__dirname, 'workdir', 'app', 'app.js')], function (err, fastify) {
      t.error(err)

      fastify.inject({
        method: 'POST',
        url: '/api/deid'
      }, (err, res) => {
        t.error(err)
        t.strictEqual(res.statusCode, 200)
        t.deepEqual(JSON.parse(res.payload), { data: 'POST ok!' })
      })

      fastify.inject({
        method: 'DELETE',
        url: '/api/deid'
      }, (err, res) => {
        t.error(err)
        t.strictEqual(res.statusCode, 200)
        t.deepEqual(JSON.parse(res.payload), { data: 'DELETE ok!' })
      })

      fastify.inject({
        method: 'PUT',
        url: '/api/deid'
      }, (err, res) => {
        t.error(err)
        t.strictEqual(res.statusCode, 200)
        t.deepEqual(JSON.parse(res.payload), { data: 'PUT ok!' })
      })

      fastify.inject({
        method: 'GET',
        url: '/api/deid'
      }, (err, res) => {
        t.error(err)
        t.strictEqual(res.statusCode, 200)
        t.deepEqual(JSON.parse(res.payload), { data: 'GET ok!' })
      })

      fastify.redis.flushall(() => {
        fastify.close(() => {
          t.pass('server closed')
        })
      })
    })
  })
})

test('check generated service files', (t) => {
  t.plan(4)

  t.ok(existsSync(path.join(__dirname, 'workdir', 'app', 'services', 'deid')))
  t.ok(existsSync(path.join(__dirname, 'workdir', 'app', 'services', 'deid', 'index.js')))
  t.ok(existsSync(path.join(__dirname, 'workdir', 'app', 'services', 'deid', 'README.md')))
  t.ok(existsSync(path.join(__dirname, 'workdir', 'test', 'services', 'deid.test.js')))
})