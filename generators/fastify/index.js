'use strict'

const fs = require('fs')
const log = require('./../../log')
const path = require('path')
const generify = require('generify')
const inquirer = require('inquirer')
const { execSync } = require('child_process')
const chalk = require('chalk')

async function generate (dir, cb) {
  const prompt = inquirer.createPromptModule()

  const answers = await prompt([
    { type: 'input', name: 'name', message: 'Application name', default: dir },
    { type: 'input', name: 'author', message: 'Author' },
    { type: 'input', name: 'email', message: 'Email' },
    { type: 'input', name: 'version', message: 'Version', default: '1.0.0' },
    { type: 'input', name: 'keywords', message: 'Keywords', default: 'fastify,nodejs' },
    { type: 'input', name: 'license', message: 'License', default: 'MIT' }
  ])

  generify(path.join(__dirname, 'templates', 'fastify-template-app'), dir, {}, function (file) {
    log('debug', `generated ${file}`)
  }, function (err) {
    if (err) {
      return cb(err)
    }

    process.chdir(dir)
    let pkg = fs.readFileSync('package.json','utf8')

    try {
      pkg = JSON.parse(pkg)
    } catch (err) {
      cb(err)
    }

    Object.assign(pkg, {
      name: answers.name,
      version: answers.version,
      author: `${answers.author} <${answers.email}>`,
      keywords: answers.keywords ? answers.keywords.split(',') : [],
      license: answers.license
    })

    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2))
    execSync('npm install', {stdio: 'inherit'})

    log('success', `${chalk.bold('package.json')} generated successfully with given information`)
    log('success', `project ${chalk.bold(pkg.name)} generated successfully`)
    log('success', `dependencies installed successfully`)
    log('success', `run '${chalk.bold(dir)}' and '${chalk.bold('node server.js')}' to start the application`)
    cb()
  })
}

module.exports = { generate }