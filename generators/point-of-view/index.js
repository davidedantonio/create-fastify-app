'use strict'

const fs = require('fs')
const { promisify } = require('util')
const log = require('../../lib/log')
const path = require('path')
const inquirer = require('inquirer')
const _ = require('lodash')
const chalk = require('chalk')
const { parseArgs, isValidFastifyProject } = require('../../lib/utils')
const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)
const readFile = promisify(fs.readFile)
const { createTemplate } = require('./../../lib/utils')

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

  try {
    await isValidFastifyProject(dir, null)
  } catch (e) {
    return cb(e)
  }

  const prompt = inquirer.createPromptModule()
  const answers = await prompt([
    { type: 'input', name: 'views_directory', message: 'Views directory name?', default: 'views' },
    {
      name: 'engine',
      message: 'What engine do you want to use',
      choices: [
        'ejs',
        'ejs-mate',
        'nunjucks',
        'pug',
        'handlebars',
        'marko',
        'mustache',
        'art-template'
      ],
      validate: answers => {
        if (answers.length < 1) {
          return 'You must choose an engine.'
        }
        return true
      }
    }
  ])

  const viewDirectrory = path.join(dir, 'src', _.camelCase(answers.views_directory))
  const servicesPath = path.join(dir, 'src', 'plugins')

  try {
    await mkdir(viewDirectrory)

    const content = await createTemplate(path.join(__dirname, 'templates', 'point-of-view.hbs'), answers)
    await writeFile(path.join(servicesPath, 'point-of-view.js'), content, 'utf8')
    log('success', `File ${chalk.bold(path.join(servicesPath, 'point-of-view.js'))} generated successfully`)
  } catch (e) {
    return cb(e)
  }

  log('success', 'point-of-view enabled successfully')
  cb()
}

function cli (args) {
  generate(args, module.exports.stop)
}

module.exports = { cli, stop, generate }
