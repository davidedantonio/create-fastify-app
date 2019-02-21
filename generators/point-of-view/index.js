#! /usr/bin/env node

'use strict'

const fs = require('fs')
const log = require('../../lib/log')
const path = require('path')
const inquirer = require('inquirer')
const { generatePlugin } = require('./generator')
const {
  stop,
  parseArgs,
  isValidFastifyProject
} = require('../../lib/utils')

function showHelp () {
  log('info', fs.readFileSync(path.join(__dirname, '..', '..', 'help', 'plugin.txt'), 'utf8'))
  return module.exports.stop()
}

async function generate (args, cb) {
  let opts = parseArgs(args)
  if (opts.help) {
    return showHelp()
  }

  const dir = opts.directory || process.cwd()
  const pluginPath = path.join(dir, 'app', 'plugins')

  isValidFastifyProject(dir, null, async err => {
    if (err) {
      return cb(err)
    }

    const prompt = inquirer.createPromptModule()
    const answers = await prompt([{
      type: 'list',
      name: 'engine',
      message: 'What template engine do you prefer',
      choices: [
        { name: 'ejs' },
        { name: 'ejs-mate' },
        { name: 'nunjucks' },
        { name: 'pug' },
        { name: 'handlebars' },
        { name: 'marko' },
        { name: 'mustache' }
      ],
      validate: answers => {
        if (answers.length < 1) {
          return 'You must a template engine.'
        }
        return true
      }
    }])

    try {
      await generatePlugin(pluginPath, answers)
    } catch (err) {
      return cb(err)
    }

    log('success', 'Point-of-view plugin correctly configured with given information')
  })
}

function cli (args) {
  generate(args, module.exports.stop)
}

module.exports = { cli, stop, generate }

if (require.main === module) {
  cli(process.argv.slice(2))
}
