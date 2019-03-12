'use strict'

const fs = require('fs')
const log = require('../../lib/log')
const path = require('path')
const inquirer = require('inquirer')
const { generatePlugin } = require('./generator')
const { stop, parseArgs, isValidFastifyProject } = require('../../lib/utils')

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
      { type: 'input', name: 'mysql_host', message: 'Host: ', default: 'localhost' },
      { type: 'input', name: 'mysql_port', message: 'Port: ', default: '3306' },
      { type: 'input', name: 'mysql_database', message: 'Database: ', default: 'fastify' },
      { type: 'input', name: 'mysql_user', message: 'User: ', default: 'root' },
      { type: 'input', name: 'mysql_password', message: 'Password: ' }
    ])

    try {
      await generatePlugin(pluginPath, answers)
    } catch (err) {
      return cb(err)
    }

    log('success', 'MySQL plugin correctly configured with given information')
  })
}

function cli (args) {
  generate(args, module.exports.stop)
}

module.exports = { cli, stop, generate }
