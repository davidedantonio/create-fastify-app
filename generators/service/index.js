'use strict'

const fs = require('fs')
const { promisify } = require('util')
const log = require('../../lib/log')
const path = require('path')
const inquirer = require('inquirer')
const Handlebars = require('./../../lib/handlebars')
const _ = require('lodash')
const chalk = require('chalk')
const { parseArgs, isValidFastifyProject } = require('../../lib/utils')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)

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

async function createTemplate (template, data) {
  let file
  try {
    file = await readFile(path.join(__dirname, 'templates', template), 'utf8')
  } catch (e) {
    module.exports.stop(e)
  }

  const serviceTemplate = Handlebars.compile(file)
  return serviceTemplate(data)
}

async function generate (args, cb) {
  let opts = parseArgs(args)
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
    { type: 'input', name: 'serviceName', message: 'Service Name', default: 'serviceName' },
    {
      type: 'checkbox',
      name: 'methods',
      message: 'What methods do you want to generate',
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
    },
    { type: 'input', name: 'autoPrefix', message: 'Route Prefix', default: '/api' }
  ])

  const serviceName = _.camelCase(answers.serviceName)

  let data = Object.assign(answers, {
    serviceName: serviceName
  })

  const servicesPath = path.join(dir, 'src', 'services')
  const testPath = path.join(dir, 'test', 'services')

  try {
    await mkdir(path.join(servicesPath, serviceName))

    let content = await createTemplate('service.hbs', data)
    await writeFile(path.join(servicesPath, serviceName, 'index.js'), content, 'utf8')
    log('success', `File ${chalk.bold(path.join(servicesPath, serviceName, 'index.js'))} generated successfully with ${data.methods.join(', ')} methods`)

    content = await createTemplate('README.md', data)
    await writeFile(path.join(servicesPath, serviceName, 'README.md'), content, 'utf8')
    log('success', `File ${chalk.bold(path.join(servicesPath, serviceName, 'README.md'))} generated successfully`)

    content = await createTemplate('service.test.hbs', data)
    await writeFile(path.join(testPath, `${serviceName}.test.js`), content, 'utf8')
    log('success', `File ${chalk.bold(path.join(testPath, `${serviceName}.test.js`))} generated successfully`)
  } catch (e) {
    return cb(e)
  }

  log('success', `Service ${chalk.bold(serviceName)} generated successfully`)
  cb()
}

function cli (args) {
  generate(args, module.exports.stop)
}

module.exports = { cli, stop, generate }
