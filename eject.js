'use strict'

const fs = require('fs')
const parseArgs = require('./args/run')
const path = require('path')
const { isValidFastifyProject } = require('./lib/utils')
const { promisify } = require('util')
const mkdir = promisify(fs.mkdir)
const generify = require('generify')
const log = require('./lib/log')

function showHelp () {
  fs.readFile(path.join(__dirname, 'help', 'eject.txt'), 'utf8', (err, data) => {
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

async function eject (args, cb) {
  let opts = parseArgs(args)

  if (!fs.existsSync(opts.file)) {
    console.error('Missing the required file index.js\n')
    return showHelp()
  }

  if (opts.help) {
    return showHelp()
  }

  const dir = opts.directory || process.cwd()
  try {
    await isValidFastifyProject(dir, null)
  } catch (e) {
    return cb(e)
  }

  try {
    await mkdir(path.join(dir, 'lib'))
    await mkdir(path.join(dir, 'args'))

    generify(path.join(__dirname, 'lib', 'watch'), path.join(dir, 'lib'), {}, function (file) {
      log('debug', `generated ${file}`)
    })
  } catch (e) {
    module.exports.stop(e)
  }
  // create a directory named lib inside root project folder
  // copy inside ./lib/watch
  // copy inside ./lib/repl
  // copy inside ./lib/plugins
  // create a directory named args inside root project folder
  // copy inside ./args/args
  // copy inside root run.js
  // Update package.json
}

function cli (args) {
  eject(args)
}

module.exports = { cli, stop }

if (require.main === module) {
  cli(process.argv.slice(2))
}
