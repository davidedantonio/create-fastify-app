'use strict'

const beautify = require('js-beautify').js
const fs = require('fs')
const Handlebars = require('../../lib/handlebars')
const path = require('path')
const swagger = require('../../lib/swagger')

function createTemplate (template, data) {
  const generateTemplate = Handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', template), 'utf8'))
  return generateTemplate(data)
}

async function generatePlugin (filePath, projectFolder) {
  let fileContent = await swagger(path.resolve(__dirname, filePath))
  let content = createTemplate(path.join('plugins', 'swagger.hbs'), fileContent)
  fs.writeFileSync(path.join(projectFolder, 'app', 'plugins', 'swagger.js'), beautify(content, { indent_size: 2, space_in_empty_paren: true }), 'utf8')
}

async function generateServices (filePath, projectFolder) {
  let fileContent = await swagger(path.resolve(__dirname, filePath))
  const files = {}

  for (let pathName in fileContent.paths) {
    let endpointName = fileContent.paths[pathName].endpointName
    if (files[endpointName] === undefined) {
      files[endpointName] = []
    }

    let realPathName = pathName.replace(/}/g, '').replace(/{/g, ':')
    files[endpointName].push({
      endpointName: (realPathName.substring(endpointName.length + 1) || '/').replace(/}/g, '').replace(/{/g, ':'),
      path: fileContent.paths[pathName]
    })
  }

  const servicesPath = path.join(projectFolder, 'app', 'services')

  for (let prefix in files) {
    let serviceContent = createTemplate(path.join('services', 'service.hbs'), { prefix: prefix, data: files[prefix] })
    let schemaContent = createTemplate(path.join('services', 'schema.hbs'), { prefix: prefix, data: files[prefix] })

    fs.mkdirSync(path.join(servicesPath, prefix))
    fs.writeFileSync(path.join(servicesPath, prefix, 'routes.schema.js'), beautify(schemaContent, { indent_size: 2, space_in_empty_paren: true }), 'utf8')
    fs.writeFileSync(path.join(servicesPath, prefix, 'index.js'), beautify(serviceContent, { indent_size: 2, space_in_empty_paren: true }), 'utf8')
  }
}

module.exports = { generatePlugin, generateServices }
