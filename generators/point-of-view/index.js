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
const { createTemplate, fileExists } = require('./../../lib/utils')
const generify = require('generify')

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

  const povExist = await fileExists(path.join(dir, 'src', 'plugins', 'point-of-view.js'), fs.F_OK)
  if (povExist) {
    return cb(new Error('point-of-view plugin already configured'))
  }

  try {
    await isValidFastifyProject(dir, null)
  } catch (e) {
    return cb(e)
  }

  const prompt = inquirer.createPromptModule()
  const answers = await prompt([
    { type: 'input', name: 'views_directory', message: 'Views directory name?', default: 'views' },
    {
      type: 'checkbox',
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
  const pluginPath = path.join(dir, 'src', 'plugins')
  const servicePath = path.join(dir, 'src', 'services')

  try {
    await mkdir(viewDirectrory)
    await mkdir(path.join(servicePath, 'pov'))

    Object.assign(answers, {
      partials: answers.engine[0] === 'handlebars' || answers.engine[0] === 'mustache',
      extension: answers.engine[0] === 'handlebars' ? 'hbs' : 'mustache'
    })

    const content = await createTemplate(path.join(__dirname, 'templates', 'point-of-view.hbs'), answers)
    await writeFile(path.join(pluginPath, 'point-of-view.js'), content, 'utf8')
    log('success', `File ${chalk.bold(path.join(pluginPath, 'point-of-view.js'))} generated successfully`)

    const contentService = await createTemplate(path.join(__dirname, 'templates', 'service.hbs'))
    await writeFile(path.join(servicePath, 'pov', 'index.js'), contentService, 'utf8')
    log('success', `File ${chalk.bold(path.join(servicePath, 'pov', 'index.js'))} generated successfully`)

    generify(path.join(__dirname, 'templates', answers.engine[0]), viewDirectrory, {}, function (file) {
      log('debug', `generated ${file}`)
    }, async function (err) {
      if (err) {
        return cb(err)
      }

      let rootPkg = await readFile(path.join(__dirname, '..', '..', 'package.json'), 'utf8')
      let pkg = await readFile(path.join(dir, 'package.json'), 'utf8')
      rootPkg = JSON.parse(rootPkg)
      pkg = JSON.parse(pkg)

      Object.assign(pkg.dependencies, {
        [answers.engine[0]]: rootPkg.devDependencies[answers.engine[0]],
        'point-of-view': rootPkg.devDependencies['point-of-view']
      })

      await writeFile(path.join(dir, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8')
      log('success', 'package.json updated successfully')
      log('success', 'point-of-view enabled successfully')
      cb()
    })
  } catch (e) {
    return cb(e)
  }
}

function cli (args) {
  generate(args, module.exports.stop)
}

module.exports = { cli, stop, generate }
