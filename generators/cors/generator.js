'use strict'

const path = require('path')
const { getAbsolutePath, fileExists, writeFile, readFile } = require('./../../lib/utils')
const dependencies = require('./../../lib/dependencies')
const Handlebars = require('./../../lib/handlebars')

async function createTemplate (template, data) {
  const file = await readFile(path.join(__dirname, 'templates', template), 'utf8')
  const pluginTemplate = Handlebars.compile(file)
  return pluginTemplate(data)
}

async function generatePlugin (pluginPath, answers) {
  const rootProjectPath = getAbsolutePath(path.join(pluginPath, '..', '..'))

  let corsExist = await fileExists(path.join(pluginPath, 'cors.js'))
  if (corsExist) {
    throw new Error('CORS plugin already configured')
  }

  try {
    let content = await createTemplate('cors.hbs', answers.methods)
    await writeFile(path.join(pluginPath, 'cors.js'), content, 'utf8')

    let pkg = await readFile(path.join(rootProjectPath, 'package.json'), 'utf8')
    pkg = JSON.parse(pkg)

    Object.assign(pkg.dependencies, {
      'fastify-cors': dependencies['fastify-cors']
    })

    await writeFile(path.join(rootProjectPath, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8')
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = { generatePlugin }
