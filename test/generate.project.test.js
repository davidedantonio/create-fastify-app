'use strict'

const t = require('tap')
const path = require('path')
const walker = require('walker')
const { readFileSync, readFile } = require('fs')
const appTemplateDir = path.join(__dirname, '..', 'generators', 'fastify', 'templates', 'fastify-app')
const expected = {}
const workdir = path.join(__dirname, 'workdir')
const { exec } = require('child_process')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const { run, ENTER } = require('./helpers/inputify')
const {
  APPLICATION_NAME,
  APPLICATION_DESCRIPTION,
  APPLICATION_AUTHOR,
  APPLICATION_EMAIL,
  APPLICATION_VERSION,
  APPLICATION_KEYWORDS,
  APPLICATION_LICENSE
} = require('./helpers/constants')

;(function (cb) {
  var files = []
  walker(appTemplateDir)
    .on('file', function (file) {
      files.push(file)
    })
    .on('end', function () {
      var count = 0
      files.forEach(function (file) {
        readFile(file, function (err, data) {
          if (err) {
            return cb(err)
          }

          expected[file.replace(appTemplateDir, '').replace(/__/, '.')] = data.toString()

          count++
          if (count === files.length) {
            cb(null)
          }
        })
      })
    })
    .on('error', cb)
})(function (err) {
  t.error(err)
  define(t)
})

function define (t) {
  const { beforeEach, test } = t

  beforeEach((cb) => {
    rimraf(workdir, () => {
      // skip any errors

      mkdirp(workdir, cb)
    })
  })

  test('errors if project folder already exist', (t) => {
    t.plan(2)

    exec('node fastify-generator.js generate:project ./test/workdir', (err, stdout) => {
      t.error(err)
      t.is('Project folder already exist', stdout.toString().trim())
    })
  })

  test('should finish succesfully', async (t) => {
    rimraf(workdir, _ => {})
    await run(
      ['fastify-generator.js', 'generate:project', './test/workdir'],
      [
        `${APPLICATION_NAME}${ENTER}`,
        `${APPLICATION_DESCRIPTION}${ENTER}`,
        `${APPLICATION_AUTHOR}${ENTER}`,
        `${APPLICATION_EMAIL}${ENTER}`,
        `${APPLICATION_VERSION}${ENTER}`,
        `${APPLICATION_KEYWORDS}${ENTER}`,
        `${APPLICATION_LICENSE}${ENTER}`
      ]
    )

    verifyPkgJson(t)
  })

  function verifyPkgJson (t) {
    const pkgFile = readFileSync(path.join(workdir, 'package.json'), 'utf8')
    const pkg = JSON.parse(pkgFile)

    t.equal(pkg.name, APPLICATION_NAME)
    t.equal(pkg.description, APPLICATION_DESCRIPTION)
    t.equal(pkg.author, `${APPLICATION_AUTHOR} <${APPLICATION_EMAIL}>`)
    t.equal(pkg.version, APPLICATION_VERSION)
    t.equal(pkg.keywords.length, 2)
    t.equal(pkg.keywords.join(','), APPLICATION_KEYWORDS)
    t.equal(pkg.license, APPLICATION_LICENSE)
    t.equal(pkg.scripts.test, 'tap test/**/*.test.js')
    t.equal(pkg.scripts.start, 'node server.js')
    t.equal(pkg.scripts.dev, 'node server.js -l info -P')
  }
}
