'use strict'

const swagger = require('../../lib/swagger')
const Handlebars = require('../../lib/handlebars')
const path = require('path')
const fs = require('fs')
const beautify = require('js-beautify').js

function createTemplate (template, data) {
  const generateTemplate = Handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', template), 'utf8'))
  return generateTemplate(data)
}

async function generatePlugin (filePath, projectFolder)  {
  let fileContent = await swagger(path.resolve(__dirname, filePath))
  let content = createTemplate('plugins/swagger.hbs', fileContent)
  fs.writeFileSync(path.join(projectFolder, 'app', 'plugins', 'swagger.js'), beautify(content, { indent_size: 2, space_in_empty_paren: true }), 'utf8')
}

async function generateServices (filePath, projectFolder) {

}

module.exports = { generatePlugin, generateServices }