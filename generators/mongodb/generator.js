'use strict'

const fs = require('fs')
const { promisify } = require('util')
const path = require('path')
const { getAbsolutePath, fileExists } = require('./../../lib/utils')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const { createTemplate } = require('./../../lib/utils')
const slugify = require('slugify')
const { updateDockerCompose } = require('./../../lib/docker')

async function generatePlugin (pluginPath, answers) {
  const rootProjectPath = getAbsolutePath(path.join(pluginPath, '..', '..'))

  const mongoDBExist = await fileExists(path.join(pluginPath, 'mongo.db.js'))
  if (mongoDBExist) {
    throw new Error('MongoDB plugin already configured')
  }

  try {
    const content = await createTemplate(path.join(__dirname, 'templates', 'mongo.db.hbs'), answers)
    await writeFile(path.join(pluginPath, 'mongo.db.js'), content, 'utf8')

    let rootPkg = await readFile(path.join(__dirname, '..', '..', 'package.json'), 'utf8')
    let pkg = await readFile(path.join(rootProjectPath, 'package.json'), 'utf8')
    pkg = JSON.parse(pkg)
    rootPkg = JSON.parse(rootPkg)

    Object.assign(pkg.dependencies, {
      'fastify-mongodb': rootPkg.devDependencies['fastify-mongodb']
    })

    await writeFile(path.join(rootProjectPath, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8')
    const dockerComposePart = Object.assign({}, {
      mongodb: {
        image: 'mongo:latest',
        container_name: slugify(pkg.name.concat(' mongodb')),
        ports: [`${answers.mongodb_port}:27017`],
        expose: [`${answers.mongodb_port}`],
        environment: {
          MONGODB_USER: answers.mongodb_user,
          MONGODB_PASSWORD: answers.mongodb_password
        }
      }
    })

    await updateDockerCompose(rootProjectPath, dockerComposePart)
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = { generatePlugin }
