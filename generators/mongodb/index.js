#! /usr/bin/env node

'use strict'

const fs = require('fs')
const log = require('../../lib/log')
const path = require('path')
const generify = require('generify')
const inquirer = require('inquirer')
const chalk = require('chalk')
const { generatePlugin } = require('./generator')
const {
  stop,
  parseArgs,
  isValidFastifyProject
} = require('../../lib/utils')

function showHelp () {
  log('info', fs.readFileSync(path.join(__dirname, '..', '..', 'help', 'plugin.txt'), 'utf8'))
  return module.exports.stop()
}

async function generate (args, cb) {
  let opts = parseArgs(args)
  if (opts.help) {
    return showHelp()
  }

  if (opts._.length !== 1) {
    log('error', 'Missing required <project-name> parameter\n')
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
      { type: 'input', name: 'mongodb_host', message: 'Host: ', default: 'localhost' },
      { type: 'input', name: 'mongodb_port', message: 'Port: ', default: '27017' },
      { type: 'input', name: 'mongodb_collection', message: 'Collection: ' },
      { type: 'input', name: 'mongodb_user', message: 'User: ' },
      { type: 'input', name: 'mongodb_password', message: 'Password: ' }
    ])

    try {
      await generatePlugin(pluginPath, answers)
    } catch (err) {
      return cb(err)
    }

    log('success', 'MongoDB plugin correctly configured with given information')
  })
}

function cli (args) {
  generate(args, module.exports.stop)
}

module.exports = { cli, stop, generate }

if (require.main === module) {
  cli(process.argv.slice(2))
}
