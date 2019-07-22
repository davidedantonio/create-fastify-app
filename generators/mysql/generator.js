'use strict'

const fs = require('fs')
const { promisify } = require('util')
const path = require('path')
const Handlebars = require('./../../lib/handlebars')
const { getAbsolutePath, fileExists } = require('./../../lib/utils')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

async function createTemplate (template, data) {
  let file
  try {
    file = await readFile(path.join(__dirname, 'templates', template), 'utf8')
  } catch (e) {
    throw new Error(e)
  }

  const pluginTemplate = Handlebars.compile(file)
  return pluginTemplate(data)
}

async function generatePlugin (pluginPath, answers) {
  const rootProjectPath = getAbsolutePath(path.join(pluginPath, '..', '..'))

  const mySqlExist = await fileExists(path.join(pluginPath, 'mysql.db.js'))
  if (mySqlExist) {
    throw new Error('MySQL plugin already configured')
  }

  try {
    const content = await createTemplate('mysql.db.hbs', answers)
    await writeFile(path.join(pluginPath, 'mysql.db.js'), content, 'utf8')

    let rootPkg = await readFile(path.join(__dirname, '..', '..', 'package.json'), 'utf8')
    let pkg = await readFile(path.join(rootProjectPath, 'package.json'), 'utf8')
    pkg = JSON.parse(pkg)
    rootPkg = JSON.parse(rootPkg)

    Object.assign(pkg.dependencies, {
      'fastify-mysql': rootPkg.devDependencies['fastify-mysql']
    })

    await writeFile(path.join(rootProjectPath, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8')
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = { generatePlugin }
