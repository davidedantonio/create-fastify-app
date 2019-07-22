'use strict'

const fs = require('fs')
const { promisify } = require('util')
const log = require('../../lib/log')
const path = require('path')
const inquirer = require('inquirer')
const { generatePlugin } = require('./generator')
const { parseArgs, isValidFastifyProject } = require('../../lib/utils')
const readFile = promisify(fs.readFile)

function stop (err) {
  if (err) {
    log('error', err)
    process.exit(1)
  }
  process.exit(0)
}

async function showHelp () {
  try {
    const file = await readFile(path.join(__dirname, '..', '..', 'help', 'usage.txt'), 'utf8')
    log('info', file)
  } catch (e) {
    return module.exports.stop(e)
  }
  return module.exports.stop()
}

async function generate (args, cb) {
  const opts = parseArgs(args)
  if (opts.help) {
    return showHelp()
  }

  const dir = opts.directory || process.cwd()
  const pluginPath = path.join(dir, 'app', 'plugins')

  try {
    await isValidFastifyProject(dir, null)
  } catch (e) {
    return cb(e)
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
  } catch (e) {
    return cb(e)
  }

  log('success', 'MySQL plugin correctly configured with given information')
}

function cli (args) {
  generate(args, module.exports.stop)
}

module.exports = { cli, stop, generate }
