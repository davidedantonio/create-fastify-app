'use strict'

const fs = require('fs')
const path = require('path')
const { generateENV, readPkg, writePkg, getAbsolutePath, fileExists } = require('./../../lib/utils')
const dependencies = require('./../../lib/dependencies')
const Handlebars = require('./../../lib/handlebars')

function createTemplate (template, data) {
  const pluginTemplate = Handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', template), 'utf8'))
  return pluginTemplate(data)
}

async function generatePlugin (pluginPath, answers) {
  const rootProjectPath = getAbsolutePath(path.join(pluginPath, '..', '..'))

  let mongoDBExist = await fileExists(path.join(pluginPath, 'mongo.db.js'))
  if (mongoDBExist) {
    throw new Error('MongoDB plugin already configured')
  }

  generateENV(rootProjectPath)
  fs.appendFileSync(path.join(rootProjectPath, '.env'), '# MongoDB configuration properties\n\n', 'utf8')

  for (var property in answers) {
    fs.appendFileSync(path.join(rootProjectPath, '.env'), `${property.toUpperCase()}=${answers[property]}\n`, 'utf8')
  }

  let content = createTemplate('mongo.db.hbs', answers)
  fs.writeFileSync(path.join(pluginPath, 'mongo.db.js'), content, 'utf8')

  try {
    const pkg = readPkg(rootProjectPath)

    Object.assign(pkg.dependencies, {
      'fastify-mongodb': dependencies['fastify-mongodb']
    })

    writePkg(rootProjectPath, pkg)
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = { generatePlugin }
