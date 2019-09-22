const jsyaml = require('js-yaml')
const fs = require('fs')
const { promisify } = require('util')
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const { fileExists, createTemplate } = require('./utils')
const path = require('path')
const slugify = require('slugify')

const generateDockerFile = async dir => {
  try {
    const exist = await fileExists(path.join(dir, 'Dockerfile'))
    if (!exist) {
      const data = {
        port: 3000
      }

      const content = await createTemplate(path.join(__dirname, '..', 'generators', 'fastify', 'templates', 'docker', 'Dockerfile.hbs'), data)
      await writeFile(path.join(dir, 'Dockerfile'), content, 'utf8')
    }
  } catch (e) {
    throw new Error(e)
  }
}

const generateDockerCompose = async (dir, appName = 'app', version) => {
  try {
    const exist = await fileExists(path.join(dir, 'docker-compose.yml'))
    if (!exist) {
      const data = {
        port: 3000,
        appName: slugify(appName),
        version: version
      }
      const content = await createTemplate(path.join(__dirname, '..', 'generators', 'fastify', 'templates', 'docker', 'docker-compose.hbs'), data)
      await writeFile(path.join(dir, 'docker-compose.yml'), content, 'utf8')
    }
  } catch (e) {
    throw new Error(e)
  }
}

const updateDockerCompose = async (dir, infos) => {
  try {
    const dockerComposeFile = path.join(dir, 'docker-compose.yml')
    const exist = await fileExists(dockerComposeFile)
    if (exist) {
      const file = await readFile(dockerComposeFile, 'utf-8')
      const dockerCompose = jsyaml.safeLoad(file)
      const app = dockerCompose.services[Object.keys(dockerCompose.services)[0]]
      delete dockerCompose.services[Object.keys(dockerCompose.services)[0]]

      if (!app.links) {
        Object.assign(app, {
          links: [Object.keys(infos)[0]]
        })
      } else {
        if (app.links.indexOf(Object.keys(infos)[0]) !== -1) {
          app.links.push(Object.keys(infos)[0])
        }
      }

      Object.assign(dockerCompose, {
        services: {
          app,
          ...dockerCompose.services,
          ...infos
        }
      })

      await writeFile(dockerComposeFile, jsyaml.safeDump(dockerCompose), 'utf-8')
    }
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  generateDockerFile,
  generateDockerCompose,
  updateDockerCompose
}
