'use strict'

const fs = require('fs')
const path = require('path')
const dependencies = require('./../../lib/dependencies')
const Handlebars = require('./../../lib/handlebars')
const {
  readPkg,
  writePkg,
  getAbsolutePath,
  generateENV,
  fileExists
} = require('./../../lib/utils')

function createTemplate (template, data) {
  const pluginTemplate = Handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', template), 'utf8'))
  return pluginTemplate(data)
}

async function generatePlugin (pluginPath, answers) {
  const rootProjectPath = getAbsolutePath(path.join(pluginPath, '..', '..'))

  let redisExist = await fileExists(path.join(pluginPath, 'redis.js'))
  if (redisExist) {
    throw new Error('Redis plugin already configured')
  }

  let content = createTemplate('redis.hbs', answers)
  fs.writeFileSync(path.join(pluginPath, 'redis.js'), content, 'utf8')

  generateENV(rootProjectPath)
  fs.appendFileSync(path.join(rootProjectPath, '.env'), '# Redis configuration properties\n\n', 'utf8')

  for (var property in answers) {
    fs.appendFileSync(path.join(rootProjectPath, '.env'), `${property.toUpperCase()}=${answers[property]}\n`, 'utf8')
  }

  try {
    const pkg = readPkg(rootProjectPath)

    Object.assign(pkg.dependencies, {
      'fastify-redis': dependencies['fastify-redis']
    })

    writePkg(rootProjectPath, pkg)
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = { generatePlugin }
