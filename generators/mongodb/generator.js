'use strict'

const path = require('path')
const dependencies = require('./../../lib/dependencies')
const Handlebars = require('./../../lib/handlebars')
const {
  writeFile,
  readFile,
  generateENV,
  getAbsolutePath,
  fileExists,
  appendFile
} = require('./../../lib/utils')

async function createTemplate (template, data) {
  const file = await readFile(path.join(__dirname, 'templates', template), 'utf8')
  const pluginTemplate = Handlebars.compile(file)
  return pluginTemplate(data)
}

async function generatePlugin (pluginPath, answers) {
  const rootProjectPath = getAbsolutePath(path.join(pluginPath, '..', '..'))

  let mongoDBExist = await fileExists(path.join(pluginPath, 'mongo.db.js'))
  if (mongoDBExist) {
    throw new Error('MongoDB plugin already configured')
  }

  generateENV(rootProjectPath)

  try {
    await appendFile(path.join(rootProjectPath, '.env'), '# MongoDB configuration properties\n\n', 'utf8')

    for (var property in answers) {
      await appendFile(path.join(rootProjectPath, '.env'), `${property.toUpperCase()}=${answers[property]}\n`, 'utf8')
    }

    let content = await createTemplate('mongo.db.hbs', answers)
    await writeFile(path.join(pluginPath, 'mongo.db.js'), content, 'utf8')
    let pkg = await readFile(path.join(rootProjectPath, 'package.json'), 'utf8')
    pkg = JSON.parse(pkg)

    Object.assign(pkg.dependencies, {
      'fastify-mongodb': dependencies['fastify-mongodb']
    })

    await writeFile(path.join(rootProjectPath, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8')
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = { generatePlugin }
