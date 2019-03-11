'use strict'

const beautify = require('js-beautify').js
const fs = require('fs')
const Handlebars = require('../../lib/handlebars')
const path = require('path')
const swagger = require('../../lib/swagger')
const { writeFile } = require('../../lib/utils')

function createTemplate (template, data) {
  const generateTemplate = Handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', template), 'utf8'))
  return generateTemplate(data)
}

async function generatePlugin (filePath, projectFolder) {
  let fileContent = await swagger(filePath)
  let content = createTemplate(path.join('plugins', 'swagger.hbs'), fileContent)
  await writeFile(path.join(projectFolder, 'app', 'plugins', 'swagger.js'), beautify(content, { indent_size: 2, space_in_empty_paren: true }), 'utf8')
}

async function generateServices (filePath, projectFolder) {
  let fileContent = await swagger(filePath)
  const files = {}

  for (let i in fileContent.routes) {
    let prefix = fileContent.routes[i].routePrefix
    if (files[prefix] === undefined) {
      files[prefix] = []
    }
    files[prefix].push(fileContent.routes[i])
  }

  const servicesPath = path.join(projectFolder, 'app', 'services')
  const basePath = fileContent.basePath || 'api'

  for (let prefix in files) {
    let serviceContent = createTemplate(path.join('services', 'service.hbs'), { basePath: basePath, prefix: prefix, data: files[prefix] })
    let schemaContent = createTemplate(path.join('services', 'schema.hbs'), { prefix: prefix, data: files[prefix] })

    fs.mkdirSync(path.join(servicesPath, prefix))
    await writeFile(path.join(servicesPath, prefix, 'routes.schema.js'), beautify(schemaContent, { indent_size: 2, space_in_empty_paren: true }), 'utf8')
    await writeFile(path.join(servicesPath, prefix, 'index.js'), beautify(serviceContent, { indent_size: 2, space_in_empty_paren: true }), 'utf8')
  }
}

module.exports = { generatePlugin, generateServices }
