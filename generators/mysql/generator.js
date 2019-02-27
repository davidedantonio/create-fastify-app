'use strict'

const fs = require('fs')
const path = require('path')
const { generateENV, readPkg, writePkg, getAbsolutePath } = require('./../../lib/utils')
const dependencies = require('./../../lib/dependencies')
const Handlebars = require('./../../lib/handlebars')

function createTemplate (template, data) {
  const pluginTemplate = Handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', template), 'utf8'))
  return pluginTemplate(data)
}

async function generatePlugin (pluginPath, answers) {
  const rootProjectPath = getAbsolutePath(path.join(pluginPath, '..', '..'))

  if (fs.existsSync(path.join(pluginPath, 'mysql.db.js'))) {
    throw new Error('MySQL plugin already configured')
  }

  generateENV(rootProjectPath)
  fs.appendFileSync(path.join(rootProjectPath, '.env'), '\n# MySQL configuration properties\n\n', 'utf8')

  for (var property in answers) {
    fs.appendFileSync(path.join(rootProjectPath, '.env'), `${property.toUpperCase()}=${answers[property]}\n`, 'utf8')
  }

  let content = createTemplate('mysql.db.hbs', answers)
  fs.writeFileSync(path.join(pluginPath, 'mysql.db.js'), content, 'utf8')

  try {
    const pkg = readPkg(rootProjectPath)

    Object.assign(pkg.dependencies, {
      'fastify-mysql': dependencies['fastify-mysql']
    })

    writePkg(rootProjectPath, pkg)
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = { generatePlugin }
