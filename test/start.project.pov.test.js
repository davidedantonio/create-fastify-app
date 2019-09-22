'use strict'

const t = require('tap')
const { test } = t
const server = require('../run')
const path = require('path')
const { run, ENTER, SPACE } = require('./helpers/inputify')
const { existsSync } = require('fs')

test('add point-of-view plugin and start server', (t) => {
  t.plan(2)

  run(
    ['create-fastify-app.js', 'add:pov', '-d', './test/workdir'],
    [
      `views${ENTER}`,
      `${SPACE}${ENTER}`
    ]
  ).then(_ => {
    server.start(['-f', path.join(__dirname, 'workdir', 'src', 'index.js')], function (err, fastify) {
      t.error(err)

      fastify.close(() => {
        t.pass('server closed')
      })
    })
  })
})

test('add pov show help', (t) => {
  t.plan(1)

  run(
    ['create-fastify-app.js', 'add:pov', '-h'],
    []
  ).then(out => {
    t.ok(out.indexOf('Generate Fastify projects and utilities') !== -1)
  })
})

test('check point-of-view plugin files', (t) => {
  t.plan(6)

  t.ok(existsSync(path.join(__dirname, 'workdir', 'src')))
  t.ok(existsSync(path.join(__dirname, 'workdir', 'src', 'plugins', 'point-of-view.js')))
  t.ok(existsSync(path.join(__dirname, 'workdir', 'src', 'views')))
  t.ok(existsSync(path.join(__dirname, 'workdir', 'src', 'views', 'index.ejs')))
  t.ok(existsSync(path.join(__dirname, 'workdir', 'src', 'views', 'templates', 'header.ejs')))
  t.ok(existsSync(path.join(__dirname, 'workdir', 'src', 'views', 'templates', 'footer.ejs')))
})
