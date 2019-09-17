'use strict'

const fs = require('fs')
const { promisify } = require('util')
const path = require('path')
const { getAbsolutePath, fileExists } = require('./../../lib/utils')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const { createTemplate } = require('./../../lib/utils')

async function generatePlugin (pluginPath, answers) {
  const rootProjectPath = getAbsolutePath(path.join(pluginPath, '..', '..'))

  const corsExist = await fileExists(path.join(pluginPath, 'cors.js'))
  if (corsExist) {
    throw new Error('CORS plugin already configured')
  }

  try {
    const content = await createTemplate(path.join(__dirname, 'templates', 'cors.hbs'), answers.methods)
    await writeFile(path.join(pluginPath, 'cors.js'), content, 'utf8')

    let rootPkg = await readFile(path.join(__dirname, '..', '..', 'package.json'), 'utf8')
    let pkg = await readFile(path.join(rootProjectPath, 'package.json'), 'utf8')
    pkg = JSON.parse(pkg)
    rootPkg = JSON.parse(rootPkg)

    Object.assign(pkg.dependencies, {
      'fastify-cors': rootPkg.devDependencies['fastify-cors']
    })

    await writeFile(path.join(rootProjectPath, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8')
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = { generatePlugin }
