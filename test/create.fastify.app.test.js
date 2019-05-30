'use strict'

const t = require('tap')
const { test } = t
const { run } = require('./helpers/inputify')

test('generate project error', (t) => {
  t.plan(1)

  run(
    ['create-fastify-app.js', 'generate:project'],
    []
  ).then(out => {
    t.ok(out.indexOf(`Project folder ${process.cwd()} already exist`) !== -1)
  })
})

test('generate project show help', (t) => {
  t.plan(1)

  run(
    ['create-fastify-app.js'],
    []
  ).then(out => {
    t.ok(out.indexOf('Generate Fastify projects and utilities') !== -1)
  })
})
