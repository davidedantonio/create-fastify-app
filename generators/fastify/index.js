#! /usr/bin/env node

'use strict'

const fs = require('fs')
const log = require('../../lib/log')
const path = require('path')
const generify = require('generify')
const inquirer = require('inquirer')
const chalk = require('chalk')
const parseArgs = require('./args')
const { stop, getAbsolutePath, readPkg, fileExists, writeFile } = require('../../lib/utils')
const { generateServices, generatePlugin } = require('./generator')
const dependencies = require('./../../lib/dependencies')

function showHelp () {
  log('info', fs.readFileSync(path.join(__dirname, '..', '..', 'help', 'fastify.txt'), 'utf8'))
  return module.exports.stop()
}

async function generate (args, cb) {
  let opts = parseArgs(args)
  if (opts.help) {
    return showHelp()
  }

  const dir = opts.directory || process.cwd()
  try {
    console.log(dir)
    let dirExist = await fileExists(dir)
    if (dirExist) {
      log('error', 'Project folder already exist\n')
      module.exports.stop()
    }
  } catch (err) {
    log('error', err)
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

  generify(path.join(__dirname, 'templates', 'fastify-app'), dir, {}, function (file) {
    log('debug', `generated ${file}`)
  }, async function (err) {
    if (err) {
      return cb(err)
    }
    let swaggerPath = getAbsolutePath(answers.swagger)
    let projectPath = getAbsolutePath(dir)
    let pkg

    try {
      pkg = readPkg(projectPath)
    } catch (err) {
      return cb(err)
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
        'fastify-swagger': dependencies['fastify-swagger']
      })

      try {
        await generatePlugin(swaggerPath, projectPath)
        await generateServices(swaggerPath, projectPath)
      } catch (err) {
        return cb(err)
      }
    }

    try {
      await writeFile(path.join(projectPath, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8')
    } catch (err) {
      return cb(err)
    }

    log('success', `${chalk.bold('package.json')} generated successfully with given information`)
    log('success', `project ${chalk.bold(pkg.name)} generated successfully`)
    log('success', `run 'cd ${chalk.bold(dir)}'`)
    log('success', `run '${chalk.bold('npm install')}'`)
    log('success', `run '${chalk.bold('npm run dev')}' to start the application`)
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
