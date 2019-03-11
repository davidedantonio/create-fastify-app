'use strict'

const fs = require('fs')
const log = require('../../lib/log')
const path = require('path')
const inquirer = require('inquirer')
const { generatePlugin } = require('./generator')
const {
  stop,
  parseArgs,
  isValidFastifyProject
} = require('../../lib/utils')

function showHelp () {
  fs.readFile(path.join(__dirname, '..', '..', 'help', 'usage.txt'), 'utf8', (err, data) => {
    if (err) {
      module.exports.stop(err)
    }

    log('info', data)
    module.exports.stop()
  })
}

async function generate (args, cb) {
  let opts = parseArgs(args)
  if (opts.help) {
    return showHelp()
  }

  const dir = opts.directory || process.cwd()
  const pluginPath = path.join(dir, 'app', 'plugins')

  isValidFastifyProject(dir, null, async err => {
    if (err) {
      return cb(err)
    }

    const prompt = inquirer.createPromptModule()
    const answers = await prompt([
      { type: 'input', name: 'redis_host', message: 'Host', default: '127.0.0.1' },
      { type: 'input', name: 'redis_port', message: 'Port', default: '6379' },
      { type: 'input', name: 'redis_password', message: 'Password' },
      { type: 'input', name: 'redis_db', message: 'Database index', default: '0' }
    ])

    try {
      await generatePlugin(pluginPath, answers)
    } catch (err) {
      return cb(err)
    }

    log('success', 'Redis plugin correctly configured with given information')
  })
}

function cli (args) {
  generate(args, module.exports.stop)
}

module.exports = { cli, stop, generate }
