'use strict'

const fs = require('fs')
const path = require('path')
const { readPkg, writePkg, getAbsolutePath } = require('./../../lib/utils')
const dependencies = require('./../../lib/dependencies')
const Handlebars = require('./../../lib/handlebars')

function createTemplate (template, data) {
  const pluginTemplate = Handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', template), 'utf8'))
  return pluginTemplate(data)
}

async function generatePlugin (pluginPath, answers) {
  const rootProjectPath = getAbsolutePath(path.join(pluginPath, '..', '..'))
  const servicesPath = getAbsolutePath(path.join(pluginPath, '..', 'services'))

  if (fs.existsSync(path.join(pluginPath, 'pov.js'))) {
    throw new Error('Point-of-view plugin already configured')
  }

  let content = createTemplate('pov.hbs', answers)
  fs.writeFileSync(path.join(pluginPath, 'pov.js'), content, 'utf8')

  fs.mkdirSync(path.join(pluginPath, '..', 'templates'))

  let fileExtension
  switch (answers.engine) {
    case 'handlebars':
      fileExtension = 'hbs'
      break
    case 'ejs-mate':
    case 'ejs':
      fileExtension = 'ejs'
      break
    case 'nunjucks':
      fileExtension = 'njk'
      break
    case 'pug':
      fileExtension = 'pug'
      break
    case 'mustache':
      fileExtension = 'mustache'
      break
    case 'marko':
      fileExtension = 'marko'
      break
  }

  const copyFrom = path.join(__dirname, 'templates', 'examples', `example.${fileExtension}`)
  const copyTo = path.join(pluginPath, '..', 'templates', `example.${fileExtension}`)
  fs.copyFileSync(copyFrom, copyTo)

  fs.mkdirSync(path.join(servicesPath, 'template-example'))
  let service = createTemplate('service.hbs')
  fs.writeFileSync(path.join(servicesPath, 'template-example', 'index.js'), service, 'utf8')

  try {
    const pkg = readPkg(rootProjectPath)

    Object.assign(pkg.dependencies, {
      'point-of-view': dependencies['point-of-view'],
      [answers.engine]: dependencies[`${answers.engine}`]
    })

    writePkg(rootProjectPath, pkg)
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = { generatePlugin }
