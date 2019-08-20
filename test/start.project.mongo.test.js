'use strict'

const t = require('tap')
const { test } = t
const server = require('./workdir/server')
const path = require('path')
const { run, ENTER } = require('./helpers/inputify')
const { existsSync } = require('fs')

test('add mongo plugin and start server', (t) => {
  t.plan(6)

  run(
    ['create-fastify-app.js', 'add:mongo', '-d', './test/workdir'],
    [
      `localhost${ENTER}`,
      `27017${ENTER}`,
      `config${ENTER}`,
      `${ENTER}`,
      `${ENTER}`
    ]
  ).then(_ => {
    server.start(['-f', path.join(__dirname, 'workdir', 'app', 'app.js')], function (err, fastify) {
      t.error(err)
      t.ok(fastify.mongo)
      t.ok(fastify.mongo.client)
      t.ok(fastify.mongo.ObjectId)
      t.ok(fastify.mongo.db)

      fastify.close(() => {
        t.pass('server closed')
      })
    })
  })
})

test('add mongodb plugin and get error', (t) => {
  t.plan(1)

  run(
    ['create-fastify-app.js', 'add:mongo', '-d', './test/workdir'],
    [
      `localhost${ENTER}`,
      `27017${ENTER}`,
      `config${ENTER}`,
      `${ENTER}`,
      `${ENTER}`
    ]
  ).then(out => {
    t.ok(out.indexOf('MongoDB plugin already configured') !== -1)
  })
})

test('add mongo show help', (t) => {
  t.plan(1)

  run(
    ['create-fastify-app.js', 'add:mongo', '-h'],
    []
  ).then(out => {
    t.ok(out.indexOf('Generate Fastify projects and utilities') !== -1)
  })
})

test('add mongo error', (t) => {
  t.plan(1)

  run(
    ['create-fastify-app.js', 'add:mongo'],
    []
  ).then(out => {
    t.ok(out.indexOf('/app folder') !== -1)
  })
})

test('check mongo plugin files', (t) => {
  t.plan(3)

  t.ok(existsSync(path.join(__dirname, 'workdir', 'app')))
  t.ok(existsSync(path.join(__dirname, 'workdir', 'app', 'plugins')))
  t.ok(existsSync(path.join(__dirname, 'workdir', 'app', 'plugins', 'mongo.db.js')))
})
