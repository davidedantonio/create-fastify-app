'use strict'

const fs = require('fs')
const path = require('path')
const { generateENV, readPkg, getAbsolutePath, fileExists, writeFile } = require('./../../lib/utils')
const dependencies = require('./../../lib/dependencies')
const Handlebars = require('./../../lib/handlebars')

function createTemplate (template, data) {
  const pluginTemplate = Handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', template), 'utf8'))
  return pluginTemplate(data)
}

async function generatePlugin (pluginPath, answers) {
  const rootProjectPath = getAbsolutePath(path.join(pluginPath, '..', '..'))

  let mySqlExist = await fileExists(path.join(pluginPath, 'mysql.db.js'))
  if (mySqlExist) {
    throw new Error('MySQL plugin already configured')
  }

  generateENV(rootProjectPath)
  fs.appendFileSync(path.join(rootProjectPath, '.env'), '\n# MySQL configuration properties\n\n', 'utf8')

  for (var property in answers) {
    fs.appendFileSync(path.join(rootProjectPath, '.env'), `${property.toUpperCase()}=${answers[property]}\n`, 'utf8')
  }

  let content = createTemplate('mysql.db.hbs', answers)

  try {
    await writeFile(path.join(pluginPath, 'mysql.db.js'), content, 'utf8')
    const pkg = readPkg(rootProjectPath)

    Object.assign(pkg.dependencies, {
      'fastify-mysql': dependencies['fastify-mysql']
    })

    await writeFile(path.join(rootProjectPath, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8')
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = { generatePlugin }
