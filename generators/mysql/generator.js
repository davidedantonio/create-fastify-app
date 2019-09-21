'use strict'

const fs = require('fs')
const { promisify } = require('util')
const path = require('path')
const { getAbsolutePath, fileExists, createTemplate } = require('./../../lib/utils')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const { updateDockerCompose } = require('./../../lib/docker')
const slugify = require('slugify')

async function generatePlugin (pluginPath, answers) {
  const rootProjectPath = getAbsolutePath(path.join(pluginPath, '..', '..'))

  const mySqlExist = await fileExists(path.join(pluginPath, 'mysql.db.js'))
  if (mySqlExist) {
    throw new Error('MySQL plugin already configured')
  }

  try {
    const content = await createTemplate(path.join(__dirname, 'templates', 'mysql.db.hbs'), answers)
    await writeFile(path.join(pluginPath, 'mysql.db.js'), content, 'utf8')

    let rootPkg = await readFile(path.join(__dirname, '..', '..', 'package.json'), 'utf8')
    let pkg = await readFile(path.join(rootProjectPath, 'package.json'), 'utf8')
    pkg = JSON.parse(pkg)
    rootPkg = JSON.parse(rootPkg)

    Object.assign(pkg.dependencies, {
      'fastify-mysql': rootPkg.devDependencies['fastify-mysql']
    })

    await writeFile(path.join(rootProjectPath, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8')
    const dockerComposePart = Object.assign({}, {
      mysql: {
        image: 'mysql:5.7',
        container_name: slugify(pkg.name.concat(' mysql')),
        ports: [`${answers.mysql_port}:3306`],
        expose: [`${answers.mysql_port}`],
        environment: {
          MYSQL_DATABASE: answers.mysql_database,
          MYSQL_USER: answers.mysql_user,
          MYSQL_PASSWORD: answers.mysql_password,
          MYSQL_ROOT_PASSWORD: answers.mysql_password
        }
      }
    })

    await updateDockerCompose(rootProjectPath, dockerComposePart)
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = { generatePlugin }
