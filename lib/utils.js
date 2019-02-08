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
    cb(`Missing ${dir} folder`)
  }

  if (!fs.existsSync(path.join(dir, 'package.json'))) {
    cb(`Missing ${path.join(dir, 'package.json')} file`)
  }

  if (!fs.existsSync(path.join(dir, 'app'))) {
    cb(`Missing ${path.join(dir, 'app')} folder`)
  }

  if (!fs.existsSync(path.join(dir, 'app', 'services'))) {
    cb(`Missing ${path.join(dir, 'app', 'services')} folder`)
  }

  if (fs.existsSync(path.join(dir, 'app', 'services', serviceName))) {
    cb(`Service ${path.join(dir, 'app', 'services', serviceName)} already exist`)
  }

  cb()
}

module.exports = {
  stop,
  showHelp,
  isValidFastifyProject
}