'use strict'

const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const generify = require('generify')
const inquirer = require('inquirer')

async function generate (name) {

  const prompt = inquirer.createPromptModule()
  const anwers = await prompt([
    { type: 'input', name: 'name', message: 'Application name', default: name },
    { type: 'input', name: 'author', message: 'Author' },
    { type: 'input', name: 'email', message: 'Email' },
    { type: 'input', name: 'version', message: 'Version', default: '1.0.0' },
    { type: 'input', name: 'keywords', message: 'Keywords', default: 'fastify,nodejs' },
    { type: 'input', name: 'license', message: 'License', default: 'MIT' }
  ])
}

module.exports = { generate }