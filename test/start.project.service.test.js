'use strict'

const t = require('tap')
const { test } = t
const server = require('./workdir/server')
const path = require('path')
const { run, ENTER } = require('./helpers/inputify')
const { existsSync } = require('fs')

test('generate service and start server', (t) => {
  t.plan(14)

  run(
    ['create-fastify-app.js', 'generate:service', '-d', `./test/workdir`],
    [
      `${ENTER}`,
      `${ENTER}`,
      `${ENTER}`
    ]
  ).then(_ => {
    server.start(['-f', path.join(__dirname, 'workdir', 'app', 'app.js')], function (err, fastify) {
      t.error(err)

      fastify.inject({
        method: 'POST',
        url: '/api/serviceName'
      }, (err, res) => {
        t.error(err)
        t.strictEqual(res.statusCode, 200)
        t.deepEqual(JSON.parse(res.payload), { data: 'POST ok!' })
      })

      fastify.inject({
        method: 'DELETE',
        url: '/api/serviceName'
      }, (err, res) => {
        t.error(err)
        t.strictEqual(res.statusCode, 200)
        t.deepEqual(JSON.parse(res.payload), { data: 'DELETE ok!' })
      })

      fastify.inject({
        method: 'PUT',
        url: '/api/serviceName'
      }, (err, res) => {
        t.error(err)
        t.strictEqual(res.statusCode, 200)
        t.deepEqual(JSON.parse(res.payload), { data: 'PUT ok!' })
      })

      fastify.inject({
        method: 'GET',
        url: '/api/serviceName'
      }, (err, res) => {
        t.error(err)
        t.strictEqual(res.statusCode, 200)
        t.deepEqual(JSON.parse(res.payload), { data: 'GET ok!' })
      })

      fastify.close(() => {
        t.pass('server closed')
      })
    })
  })
})

test('check generated service files', (t) => {
  t.plan(4)

  t.ok(existsSync(path.join(__dirname, 'workdir', 'app', 'services', 'serviceName')))
  t.ok(existsSync(path.join(__dirname, 'workdir', 'app', 'services', 'serviceName', 'index.js')))
  t.ok(existsSync(path.join(__dirname, 'workdir', 'app', 'services', 'serviceName', 'README.md')))
  t.ok(existsSync(path.join(__dirname, 'workdir', 'test', 'services', 'serviceName.test.js')))
})
