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
  const pluginPath = path.join(dir, 'src', 'plugins')

  try {
    await isValidFastifyProject(dir, null)
  } catch (e) {
    return cb(e)
  }

  const prompt = inquirer.createPromptModule()
  const answers = await prompt([{
    type: 'checkbox',
    name: 'methods',
    message: 'What methods do you want to enable for cors',
    choices: [
      {
        name: 'DELETE',
        checked: true
      },
      {
        name: 'GET',
        checked: true
      },
      'HEAD',
      'PATCH',
      {
        name: 'POST',
        checked: true
      },
      {
        name: 'PUT',
        checked: true
      },
      'OPTIONS'
    ],
    validate: answers => {
      if (answers.length < 1) {
        return 'You must choose at least one method.'
      }
      return true
    }
  }])

  try {
    await generatePlugin(pluginPath, answers)
  } catch (e) {
    return cb(e)
  }

  log('success', 'CORS plugin correctly configured with given information')
}

function cli (args) {
  generate(args, module.exports.stop)
}

module.exports = { cli, stop, generate }
