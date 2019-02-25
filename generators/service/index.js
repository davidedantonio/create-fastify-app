'use strict'

const log = require('../../lib/log')
const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const Handlebars = require('./../../lib/handlebars')
const _ = require('lodash')
const chalk = require('chalk')
const {
  stop,
  parseArgs,
  isValidFastifyProject
} = require('../../lib/utils')

function showHelp () {
  log('info', fs.readFileSync(path.join(__dirname, '..', '..', 'help', 'usage.txt'), 'utf8'))
  module.exports.stop()
}

function createTemplate (template, data) {
  const serviceTemplate = Handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', template), 'utf8'))
  return serviceTemplate(data)
}

function generate (args, cb) {
  let opts = parseArgs(args)
  if (opts.help) {
    return showHelp()
  }

  const dir = opts.directory || process.cwd()

  isValidFastifyProject(dir, null, async err => {
    if (err) {
      return cb(err)
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

    const servicesPath = path.join(dir, 'app', 'services')
    const testPath = path.join(dir, 'test', 'services')
    fs.mkdirSync(path.join(servicesPath, serviceName))

    try {
      let content = createTemplate('service.hbs', data)
      fs.writeFileSync(path.join(servicesPath, serviceName, 'index.js'), content, 'utf8')
      log('success', `File ${chalk.bold(path.join(servicesPath, serviceName, 'index.js'))} generated successfully with ${data.methods.join(', ')} methods`)

      content = createTemplate('README.md', data)
      fs.writeFileSync(path.join(servicesPath, serviceName, 'README.md'), content, 'utf8')
      log('success', `File ${chalk.bold(path.join(servicesPath, serviceName, 'README.md'))} generated successfully`)

      content = createTemplate('service.test.hbs', data)
      fs.writeFileSync(path.join(testPath, `${serviceName}.test.js`), content, 'utf8')
      log('success', `File ${chalk.bold(path.join(testPath, `${serviceName}.test.js`))} generated successfully`)
    } catch (err) {
      return cb(err)
    }

    log('success', `Service ${chalk.bold(serviceName)} generated successfully`)
    cb()
  })
}

function cli (args) {
  generate(args, module.exports.stop)
}

module.exports = { cli, stop, generate }
