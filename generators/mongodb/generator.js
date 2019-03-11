'use strict'

const fs = require('fs')
const path = require('path')
const { generateENV, readPkg, getAbsolutePath, fileExists } = require('./../../lib/utils')
const dependencies = require('./../../lib/dependencies')
const Handlebars = require('./../../lib/handlebars')
const { writeFile } = require('./../../lib/utils')

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

  try {
    await writeFile(path.join(pluginPath, 'mongo.db.js'), content, 'utf8')
    const pkg = readPkg(rootProjectPath)

    Object.assign(pkg.dependencies, {
      'fastify-mongodb': dependencies['fastify-mongodb']
    })

    await writeFile(path.join(rootProjectPath, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8')
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = { generatePlugin }
