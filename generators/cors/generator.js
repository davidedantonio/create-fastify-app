'use strict'

const fs = require('fs')
const { promisify } = require('util')
const path = require('path')
const { getAbsolutePath, fileExists } = require('./../../lib/utils')
const Handlebars = require('./../../lib/handlebars')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

async function createTemplate (template, data) {
  const file = await readFile(path.join(__dirname, 'templates', template), 'utf8')
  const pluginTemplate = Handlebars.compile(file)
  return pluginTemplate(data)
}

async function generatePlugin (pluginPath, answers) {
  const rootProjectPath = getAbsolutePath(path.join(pluginPath, '..', '..'))

  const corsExist = await fileExists(path.join(pluginPath, 'cors.js'))
  if (corsExist) {
    throw new Error('CORS plugin already configured')
  }

  try {
    const content = await createTemplate('cors.hbs', answers.methods)
    await writeFile(path.join(pluginPath, 'cors.js'), content, 'utf8')

    const rootPkgFile = await readFile(path.join(__dirname, '..', '..', 'package.json'), 'utf8')
    const pkgFile = await readFile(path.join(rootProjectPath, 'package.json'), 'utf8')
    const rootPkg = JSON.parse(rootPkgFile)
    const pkg = JSON.parse(pkgFile)

    Object.assign(pkg.dependencies, {
      'fastify-cors': rootPkg.devDependencies['fastify-cors']
    })

    await writeFile(path.join(rootProjectPath, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8')
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = { generatePlugin }
