#! /usr/bin/env node

'use strict'

const { stop } = require('../../lib/utils')
const parseArgs = require('./args')
const log = require('../../lib/log')
const fs = require('fs')
const path = require('path')
const { isValidFastifyProject } = require('../../lib/utils')
const inquirer = require('inquirer')
const Handlebars = require('./../../lib/handlebars')
const _ = require('lodash')
const chalk = require('chalk')

function showHelp () {
  log('info', fs.readFileSync(path.join(__dirname, '..', '..', 'help', 'service.txt'), 'utf8'))
  module.exports.stop()
}

function generate (args, cb) {
  let opts = parseArgs(args)
  if (opts.help) {
    return showHelp()
  }

  if (opts._.length !== 1) {
    log('error', 'Missing required <service-name> parameter\n')
    return showHelp()
  }

  const dir = opts.directory || process.cwd()
  const serviceName = _.camelCase(opts._[0])

  isValidFastifyProject(dir, serviceName, async err => {
    if (err) {
      return cb(err)
    }

    const prompt = inquirer.createPromptModule()
    const answers = await prompt([{
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
            return 'You must choose at least one method.';
          }
          return true;
        }
      },
      { type: 'input', name: 'routePrefix', message: 'Route Prefix', default: '/api' }
    ])

    let data = Object.assign(answers, {
      serviceName: serviceName
    })

    let serviceTemplate = undefined
    let serviceContent = undefined
    let readmeTemplate = undefined
    let readmeContent = undefined

    try {
      serviceTemplate = Handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', 'service.hbs'), 'utf8'))
      serviceContent = serviceTemplate(data)
      readmeTemplate = Handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', 'README.md'), 'utf8'))
      readmeContent = readmeTemplate(data)
    } catch (err) {
      cb(err)
    }

    const servicesPath = path.join(dir, 'app', 'services')

    fs.mkdirSync(path.join(servicesPath, serviceName))
    fs.writeFileSync(path.join(servicesPath, serviceName, 'index.js'), serviceContent, 'utf8')
    fs.writeFileSync(path.join(servicesPath, serviceName, 'README.md'), readmeContent, 'utf8')

    log('success', `Folder ${chalk.bold(path.join(servicesPath, serviceName))} created successfully`)
    log('success', `File ${chalk.bold(path.join(servicesPath, serviceName, 'index.js'))} generated successfully with ${data.methods.join(', ')} methods`)
    log('success', `File ${chalk.bold(path.join(servicesPath, serviceName, 'README.md'))} generated successfully`)
    cb()
  })
}

function cli (args) {
  generate(args, module.exports.stop)
}

module.exports = { cli, stop }

if (require.main === module) {
  cli(process.argv.slice(2))
}