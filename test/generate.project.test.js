'use strict'

const t = require('tap')
const path = require('path')
const walker = require('walker')
const { build } = require('./helpers')
const { execSync } = require('child_process')
const { readFileSync, readFile, existsSync } = require('fs')
const appTemplateDir = path.join(__dirname, '..', 'generators', 'fastify', 'templates', 'fastify-app')
const expected = {}
const workdir = path.join(__dirname, 'workdir')
const { run, ENTER } = require('./helpers/inputify')
const {
  APPLICATION_NAME,
  APPLICATION_DESCRIPTION,
  APPLICATION_AUTHOR,
  APPLICATION_EMAIL,
  APPLICATION_VERSION,
  APPLICATION_KEYWORDS,
  APPLICATION_LICENSE,
  SWAGGER_FILE_EMPTY,
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
  const { test } = t

  test('should create project succesfully', async (t) => {
    if (existsSync(workdir)) {
      execSync(`rm -R ${workdir}`)
    }

    t.plan(18)
    await run(
      ['create-fastify-app.js', 'generate:project', '-d', './test/workdir'],
      [
        `${APPLICATION_NAME}${ENTER}`,
        `${APPLICATION_DESCRIPTION}${ENTER}`,
        `${APPLICATION_AUTHOR}${ENTER}`,
        `${APPLICATION_EMAIL}${ENTER}`,
        `${APPLICATION_VERSION}${ENTER}`,
        `${APPLICATION_KEYWORDS}${ENTER}`,
        `${APPLICATION_LICENSE}${ENTER}`,
        `${SWAGGER_FILE_EMPTY}${ENTER}`
      ]
    ).then( _ => {
      verifyPkgJson(t)
      verifyProjectFolder(t)
    })
  })

  async function checkHelloWorld (t) {
    const app = build(t)
    const res = await app.inject({
      url: '/hello'
    })
    t.equal(res.payload, 'hello, world!')
    t.end()
  }

  function verifyProjectFolder (t) {
    t.ok(existsSync(path.join(workdir, 'app')))
    t.ok(existsSync(path.join(workdir, 'app', 'plugins')))
    t.ok(existsSync(path.join(workdir, 'app', 'plugins', 'support.js')))
    t.ok(existsSync(path.join(workdir, 'app', 'services')))
    t.ok(existsSync(path.join(workdir, 'app', 'app.js')))
    t.ok(existsSync(path.join(workdir, 'app', 'services', 'root.js')))
    t.ok(existsSync(path.join(workdir, 'app', 'services', 'hello')))
    t.ok(existsSync(path.join(workdir, 'app', 'services', 'hello', 'index.js')))
  }

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
