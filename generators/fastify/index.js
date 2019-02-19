#! /usr/bin/env node

'use strict'

const fs = require('fs')
const log = require('../../lib/log')
const path = require('path')
const generify = require('generify')
const inquirer = require('inquirer')
const chalk = require('chalk')
const parseArgs = require('./args')
const { stop, getAbsolutePath } = require('../../lib/utils')
const { generateServices, generatePlugin } = require('./generator')

function showHelp () {
  log('info', fs.readFileSync(path.join(__dirname, '..', '..', 'help', 'fastify.txt'), 'utf8'))
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

  if (fs.existsSync(opts._[0])) {
    log('error', 'Project folder already exist\n')
    module.exports.stop()
  }

  const prompt = inquirer.createPromptModule()
  const answers = await prompt([
    { type: 'input', name: 'name', message: 'Application name: ', default: 'fastify-app' },
    { type: 'input', name: 'description', message: 'Description: ', default: 'A beautiful fastify app' },
    { type: 'input', name: 'author', message: 'Author: ' },
    { type: 'input', name: 'email', message: 'Email: ' },
    { type: 'input', name: 'version', message: 'Version: ', default: '1.0.0' },
    { type: 'input', name: 'keywords', message: 'Keywords: ', default: 'fastify,nodejs' },
    { type: 'input', name: 'license', message: 'License: ', default: 'MIT' },
    { type: 'input', name: 'swagger', message: 'Swagger File: ' }
  ])

  generify(path.join(__dirname, 'templates', 'fastify-app'), opts._[0], {}, function (file) {
    log('debug', `generated ${file}`)
  }, async function (err) {
    if (err) {
      return cb(err)
    }

    process.chdir(opts._[0])
    let pkg = fs.readFileSync('package.json', 'utf8')

    try {
      pkg = JSON.parse(pkg)
    } catch (err) {
      cb(err)
    }

    Object.assign(pkg, {
      name: answers.name,
      description: answers.description,
      version: answers.version,
      author: `${answers.author} <${answers.email}>`,
      keywords: answers.keywords ? answers.keywords.split(',') : [],
      license: answers.license,
      scripts: {
        'test': 'tap test/**/*.test.js',
        'start': 'node server.js',
        'dev': 'node server.js -l info -P'
      }
    })

    if (answers.swagger) {
      Object.assign(pkg.dependencies, {
        'fastify-swagger': '^2.3.0'
      })

      try {
        let swaggerPath = getAbsolutePath(answers.swagger)
        let projectPath = getAbsolutePath(opts._[0])

        await generatePlugin(swaggerPath, projectPath)
        await generateServices(swaggerPath, projectPath)
      } catch (err) {
        module.exports.stop(err)
      }
    }

    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2))

    const other = await prompt([{
      type: 'checkbox',
      name: 'methods',
      message: 'Add other plugin to your application',
      choices: [
        { name: 'CORS' },
        { name: 'MongoDB' },
        { name: 'NextJS' },
        { name: 'NATS' },
        { name: 'Point-Of-View' },
        { name: 'Redis' },
        { name: 'Static' }
      ]
    }])

    log('success', `${chalk.bold('package.json')} generated successfully with given information`)
    log('success', `project ${chalk.bold(pkg.name)} generated successfully`)
    log('success', `run 'cd ${chalk.bold(opts._[0])}'`)
    log('success', `run '${chalk.bold('npm install')}'`)
    log('success', `run '${chalk.bold('node server.js')}' to start the application`)
    cb()
  })
}

function cli (args) {
  generate(args, module.exports.stop)
}

module.exports = { cli, stop, generate }

if (require.main === module) {
  cli(process.argv.slice(2))
}
