'use strict'

const t = require('tap')
const { test } = t
const server = require('../run')
const path = require('path')
const { run, ENTER } = require('./helpers/inputify')
const { existsSync } = require('fs')

test('add mysql plugin and start server', (t) => {
  t.plan(3)

  run(
    ['create-fastify-app.js', 'add:mysql', '-d', './test/workdir'],
    [
      `localhost${ENTER}`,
      `3306${ENTER}`,
      `test${ENTER}`,
      `root${ENTER}`,
      `${ENTER}`
    ]
  ).then(_ => {
    server.start(['-f', path.join(__dirname, 'workdir', 'src', 'index.js')], function (err, fastify) {
      t.error(err)
      t.ok(fastify.mysql)

      fastify.close(() => {
        t.pass('server closed')
      })
    })
  })
})

test('add redis plugin and get error', (t) => {
  t.plan(1)

  run(
    ['create-fastify-app.js', 'add:mysql', '-d', './test/workdir'],
    [
      `localhost${ENTER}`,
      `3306${ENTER}`,
      `test${ENTER}`,
      `root${ENTER}`,
      `${ENTER}`
    ]
  ).then(out => {
    t.ok(out.indexOf('MySQL plugin already configured') !== -1)
  })
})

test('add mysql show help', (t) => {
  t.plan(1)

  run(
    ['create-fastify-app.js', 'add:mysql', '-h'],
    []
  ).then(out => {
    t.ok(out.indexOf('Generate Fastify projects and utilities') !== -1)
  })
})

test('add mysql error', (t) => {
  t.plan(1)

  run(
    ['create-fastify-app.js', 'add:mysql'],
    []
  ).then(out => {
    t.ok(out.indexOf('/src folder') !== -1)
  })
})

test('check mysql plugin files', (t) => {
  t.plan(3)

  t.ok(existsSync(path.join(__dirname, 'workdir', 'src')))
  t.ok(existsSync(path.join(__dirname, 'workdir', 'src', 'plugins')))
  t.ok(existsSync(path.join(__dirname, 'workdir', 'src', 'plugins', 'mysql.db.js')))
})
