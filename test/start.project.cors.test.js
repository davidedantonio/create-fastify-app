'use strict'

const t = require('tap')
const { test } = t
const server = require('../run')
const path = require('path')
const { run, ENTER } = require('./helpers/inputify')
const { existsSync } = require('fs')

test('add cors plugin and start server', (t) => {
  t.plan(6)

  run(
    ['create-fastify-app.js', 'add:cors', '-d', `./test/workdir`],
    [
      `a${ENTER}`
    ]
  ).then(_ => {
    server.start(['-f', path.join(__dirname, 'workdir', 'src', 'index.js')], function (err, fastify) {
      t.error(err)

      fastify.inject({
        method: 'OPTIONS',
        url: '/'
      }, (err, res) => {
        t.error(err)
        delete res.headers.date
        t.strictEqual(res.statusCode, 204)
        t.strictEqual(res.payload, '')
        t.deepEqual({
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'DELETE, GET, HEAD, PATCH, POST, PUT, OPTIONS',
          vary: 'Access-Control-Request-Headers',
          'content-length': '0',
          connection: 'keep-alive'
        }, res.headers)
      })

      fastify.close(() => {
        t.pass('server closed')
      })
    })
  })
})

test('add cors plugin and get error', (t) => {
  t.plan(1)

  run(
    ['create-fastify-app.js', 'add:cors', '-d', `./test/workdir`],
    [
      `a${ENTER}`
    ]
  ).then(out => {
    t.ok(out.indexOf('CORS plugin already configured') !== -1)
  })
})

test('add cors show help', (t) => {
  t.plan(1)

  run(
    ['create-fastify-app.js', 'add:cors', '-h'],
    []
  ).then(out => {
    t.ok(out.indexOf('Generate Fastify projects and utilities') !== -1)
  })
})

test('add cors error', (t) => {
  t.plan(1)

  run(
    ['create-fastify-app.js', 'add:cors'],
    []
  ).then(out => {
    t.ok(out.indexOf('/src folder') !== -1)
  })
})

test('check cors plugin files', (t) => {
  t.plan(3)

  t.ok(existsSync(path.join(__dirname, 'workdir', 'src')))
  t.ok(existsSync(path.join(__dirname, 'workdir', 'src', 'plugins')))
  t.ok(existsSync(path.join(__dirname, 'workdir', 'src', 'plugins', 'cors.js')))
})
