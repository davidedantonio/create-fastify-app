'use strict'

const t = require('tap')
const path = require('path')
const walker = require('walker')
const { readFileSync, readFile, existsSync } = require('fs')
const { execSync } = require('child_process')
const appTemplateDir = path.join(__dirname, '..', 'generators', 'fastify', 'templates', 'fastify-app')
const expected = {}
const workdir = path.join(__dirname, 'workdirSwagger')
const { run, ENTER } = require('./helpers/inputify')
const {
  APPLICATION_NAME,
  APPLICATION_DESCRIPTION,
  APPLICATION_AUTHOR,
  APPLICATION_EMAIL,
  APPLICATION_VERSION,
  APPLICATION_KEYWORDS,
  APPLICATION_LICENSE,
  SWAGGER_FILE
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

  test('should create project succesfully with given swagger file', async t => {
    if (existsSync(workdir)) {
      execSync(`rm -R ${workdir}`)
    }

    await run(
      ['create-fastify-app.js', 'generate:project', '-d', `./test/workdirSwagger`],
      [
        `${APPLICATION_NAME}${ENTER}`,
        `${APPLICATION_DESCRIPTION}${ENTER}`,
        `${APPLICATION_AUTHOR}${ENTER}`,
        `${APPLICATION_EMAIL}${ENTER}`,
        `${APPLICATION_VERSION}${ENTER}`,
        `${APPLICATION_KEYWORDS}${ENTER}`,
        `${APPLICATION_LICENSE}${ENTER}`,
        `${process.cwd()}/test/${SWAGGER_FILE}${ENTER}`
      ]
    )

    await verifyPkgJson(t)
    await verifyProjectSwaggerFolder(t)
  })

  function verifyProjectSwaggerFolder (t) {
    t.ok(existsSync(path.join(workdir, 'app')))
    t.ok(existsSync(path.join(workdir, 'app', 'plugins')))
    t.ok(existsSync(path.join(workdir, 'app', 'plugins', 'support.js')))
    t.ok(existsSync(path.join(workdir, 'app', 'plugins', 'swagger.js')))
    t.ok(existsSync(path.join(workdir, 'app', 'services')))
    t.ok(existsSync(path.join(workdir, 'app', 'app.js')))
    t.ok(existsSync(path.join(workdir, 'app', 'services', 'root.js')))
    t.ok(existsSync(path.join(workdir, 'app', 'services', 'hello')))
    t.ok(existsSync(path.join(workdir, 'app', 'services', 'hello', 'index.js')))
    t.ok(existsSync(path.join(workdir, 'app', 'services', 'pet')))
    t.ok(existsSync(path.join(workdir, 'app', 'services', 'pet', 'index.js')))
    t.ok(existsSync(path.join(workdir, 'app', 'services', 'pet', 'routes.schema.js')))
    t.ok(existsSync(path.join(workdir, 'app', 'services', 'store')))
    t.ok(existsSync(path.join(workdir, 'app', 'services', 'store', 'index.js')))
    t.ok(existsSync(path.join(workdir, 'app', 'services', 'store', 'routes.schema.js')))
    t.ok(existsSync(path.join(workdir, 'app', 'services', 'user')))
    t.ok(existsSync(path.join(workdir, 'app', 'services', 'user', 'index.js')))
    t.ok(existsSync(path.join(workdir, 'app', 'services', 'user', 'routes.schema.js')))
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
