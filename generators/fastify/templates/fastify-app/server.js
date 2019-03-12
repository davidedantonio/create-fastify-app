'use strict'

const assert = require('assert')
const fp = require('fastify-plugin')
const fs = require('fs')
const isDocker = require('is-docker')
const resolveFrom = require('resolve-from')
const parseArgs = require('./args')
const path = require('path')
const PinoColada = require('pino-colada')
const pump = require('pump')

let Fastify = null

function showHelp () {
  fs.readFile(path.join(__dirname, 'help', 'start.txt'), 'utf8', (err, data) => {
    if (err) {
      module.exports.stop(err)
    }

    console.log(data)
    module.exports.stop()
  })
}

function stop (error) {
  if (error) {
    console.error(error)
    process.exit(1)
  }
  process.exit()
}

function loadModules (opts) {
  try {
    const basedir = path.resolve(process.cwd(), opts.file)

    Fastify = require(resolveFrom.silent(basedir, 'fastify') || 'fastify')
  } catch (e) {
    module.exports.stop(e)
  }
}

function start (args, cb) {
  let opts = parseArgs(args)

  if (!fs.existsSync(opts.file)) {
    console.error('Missing the required file app.js\n')
    return showHelp()
  }

  require('make-promises-safe')
  loadModules(opts)
  return run(args, cb)
}

function run (args, cb) {
  require('dotenv').config()
  let opts = parseArgs(args)

  opts.port = opts.port || process.env.PORT || 3000
  cb = cb || assert.ifError

  loadModules(opts)

  var file = null
  try {
    file = require(path.resolve(process.cwd(), opts.file))
  } catch (e) {
    return module.exports.stop(e)
  }

  if (file.length !== 3 && file.constructor.name === 'Function') {
    return module.exports.stop(`Plugin function should contain 3 arguments. Refer to\n
      docs for more information about it`)
  }

  if (file.length !== 2 && file.constructor.name === 'AsyncFunction') {
    return module.exports.stop(`Aysnc/Await plugin function should contain 2 arguments. Refer to\n
      docs for more information about it`)
  }

  const options = {
    logger: {
      level: opts.logLevel
    },
    pluginTimeout: opts.pluginTimeout
  }

  if (opts.bodyLimit) {
    options.bodyLimit = opts.bodyLimit
  }

  if (opts.prettyLogs) {
    const pinoColada = PinoColada()
    options.logger.stream = pinoColada
    pump(pinoColada, process.stdout, assert.ifError)
  }

  const fastify = Fastify(opts.option ? Object.assign(options, file.options) : options)

  const pluginOptions = {}
  if (opts.prefix) {
    pluginOptions.prefix = opts.prefix
    pluginOptions._routePrefix = opts.prefix || ''
  }

  fastify.register(fp(file), pluginOptions)

  if (opts.address) {
    fastify.listen(opts.port, opts.address, wrap)
  } else if (isDocker()) {
    fastify.listen(opts.port, '0.0.0.0', wrap)
  } else {
    fastify.listen(opts.port, wrap)
  }

  function wrap (err) {
    cb(err, fastify)
  }

  return fastify
}

function cli (args) {
  start(args)
}

module.exports = { start, run, stop }

if (require.main === module) {
  cli(process.argv.slice(2))
}
