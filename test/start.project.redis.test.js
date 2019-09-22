'use strict'

const t = require('tap')
const { test } = t
const server = require('../run')
const path = require('path')
const { run, ENTER } = require('./helpers/inputify')
const { existsSync } = require('fs')

test('add redis plugin and start server', (t) => {
  t.plan(3)

  run(
    ['create-fastify-app.js', 'add:redis', '-d', './test/workdir'],
    [
      `127.0.0.1${ENTER}`,
      `6379${ENTER}`,
      `${ENTER}`,
      `${ENTER}`
    ]
  ).then(_ => {
    server.start(['-f', path.join(__dirname, 'workdir', 'src', 'index.js')], function (err, fastify) {
      t.error(err)
      t.ok(fastify.redis)

      fastify.redis.flushall(() => {
        fastify.close(() => {
          t.pass('server closed')
        })
      })
    })
  })
})

test('fastify.redis should be the redis client', (t) => {
  t.plan(6)

  server.start(['-f', path.join(__dirname, 'workdir', 'src', 'index.js')], function (err, fastify) {
    t.error(err)
    t.ok(fastify.redis)

    fastify.redis.set('key', 'value', err => {
      t.error(err)
      fastify.redis.get('key', (err, val) => {
        t.error(err)
        t.equal(val, 'value')
      })

      fastify.close(() => {
        t.pass('server closed')
      })
    })
  })
})

test('add redis plugin and get error', (t) => {
  t.plan(1)

  run(
    ['create-fastify-app.js', 'add:redis', '-d', './test/workdir'],
    [
      `127.0.0.1${ENTER}`,
      `6379${ENTER}`,
      `${ENTER}`,
      `${ENTER}`
    ]
  ).then(out => {
    t.ok(out.indexOf('Redis plugin already configured') !== -1)
  })
})

test('add redis show help', (t) => {
  t.plan(1)

  run(
    ['create-fastify-app.js', 'add:redis', '-h'],
    []
  ).then(out => {
    t.ok(out.indexOf('Generate Fastify projects and utilities') !== -1)
  })
})

test('add redis error', (t) => {
  t.plan(1)

  run(
    ['create-fastify-app.js', 'add:redis'],
    []
  ).then(out => {
    t.ok(out.indexOf('/src folder') !== -1)
  })
})

test('redis promises support', t => {
  t.plan(2)

  server.start(['-f', path.join(__dirname, 'workdir', 'src', 'index.js')], function (err, fastify) {
    t.error(err)

    fastify.redis.set('key', 'value')
      .then(() => {
        return fastify.redis.get('key')
      })
      .then(val => {
        t.equal(val, 'value')
        fastify.close()
      })
      .catch(err => t.fail(err))
  })
})

test('check redis plugin files', (t) => {
  t.plan(3)

  t.ok(existsSync(path.join(__dirname, 'workdir', 'src')))
  t.ok(existsSync(path.join(__dirname, 'workdir', 'src', 'plugins')))
  t.ok(existsSync(path.join(__dirname, 'workdir', 'src', 'plugins', 'redis.js')))
})
