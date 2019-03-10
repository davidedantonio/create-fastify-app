'use strict'

const fs = require('fs')
const path = require('path')
const { readPkg, writePkg, getAbsolutePath, fileExists } = require('./../../lib/utils')
const dependencies = require('./../../lib/dependencies')
const Handlebars = require('./../../lib/handlebars')

function createTemplate (template, data) {
  const pluginTemplate = Handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', template), 'utf8'))
  return pluginTemplate(data)
}

async function generatePlugin (pluginPath, answers) {
  const rootProjectPath = getAbsolutePath(path.join(pluginPath, '..', '..'))

  let corsExist = await fileExists(path.join(pluginPath, 'cors.js'))
  if (corsExist) {
    throw new Error('CORS plugin already configured')
  }

  let content = createTemplate('cors.hbs', answers.methods)
  fs.writeFileSync(path.join(pluginPath, 'cors.js'), content, 'utf8')

  try {
    const pkg = readPkg(rootProjectPath)

    Object.assign(pkg.dependencies, {
      'fastify-cors': dependencies['fastify-cors']
    })

    writePkg(rootProjectPath, pkg)
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = { generatePlugin }
