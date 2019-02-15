'use strict'

const log = require('./log')
const fs = require('fs')
const path = require('path')

function showHelp () {
  log('info', fs.readFileSync(path.join(__dirname, 'help', 'usage.txt'), 'utf8'))
  process.exit(0)
}

function stop (err) {
  if (err) {
    log('error', err)
    process.exit(1)
  }
  process.exit(0)
}

function isValidFastifyProject (dir, serviceName, cb) {
  if (!fs.existsSync(dir)) {
    cb(new Error(`Missing ${dir} folder`))
  }

  if (!fs.existsSync(path.join(dir, 'package.json'))) {
    cb(new Error(`Missing ${path.join(dir, 'package.json')} file`))
  }

  if (!fs.existsSync(path.join(dir, 'app'))) {
    cb(new Error(`Missing ${path.join(dir, 'app')} folder`))
  }

  if (!fs.existsSync(path.join(dir, 'app', 'services'))) {
    cb(new Error(`Missing ${path.join(dir, 'app', 'services')} folder`))
  }

  if (fs.existsSync(path.join(dir, 'app', 'services', serviceName))) {
    cb(new Error(`Service ${path.join(dir, 'app', 'services', serviceName)} already exist`))
  }

  cb()
}

function getAbsolutePath (p) {
  if (path.normalize(p + '/') === path.normalize(path.resolve(p) + '/')) {
    return p
  }

  return path.resolve(path.dirname(process.argv[1]), p)
}

module.exports = {
  stop,
  showHelp,
  isValidFastifyProject,
  getAbsolutePath
}
