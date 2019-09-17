'use strict'

const fs = require('fs')
const { promisify } = require('util')
const path = require('path')
const { createTemplate } = require('./../../lib/utils')
const { getAbsolutePath, fileExists } = require('./../../lib/utils')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

async function generatePlugin (pluginPath, answers) {
  const rootProjectPath = getAbsolutePath(path.join(pluginPath, '..', '..'))

  const postgresExist = await fileExists(path.join(pluginPath, 'postgres.db.js'))
  if (postgresExist) {
    throw new Error('Postgres plugin already configured')
  }

  try {
    const content = await createTemplate(path.join(__dirname, 'templates', 'postgres.db.hbs'), answers)
    await writeFile(path.join(pluginPath, 'postgres.db.js'), content, 'utf8')

    let rootPkg = await readFile(path.join(__dirname, '..', '..', 'package.json'), 'utf8')
    let pkg = await readFile(path.join(rootProjectPath, 'package.json'), 'utf8')
    pkg = JSON.parse(pkg)
    rootPkg = JSON.parse(rootPkg)

    Object.assign(pkg.dependencies, {
      'fastify-postgres': rootPkg.devDependencies['fastify-postgres'],
      pg: rootPkg.devDependencies.pg
    })

    await writeFile(path.join(rootProjectPath, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8')
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = { generatePlugin }
