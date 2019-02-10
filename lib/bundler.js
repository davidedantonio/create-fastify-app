'use strict'

const fs = require('fs')
const path = require('path')
const YAML = require('js-yaml')
const RefParser = require('json-schema-ref-parser')

function parseFileContent (fileContent) {
  try {
    return JSON.parse(fileContent)
  } catch (e) {
    return YAML.safeLoad(fileContent)
  }
}

async function dereference (json) {
  return RefParser.dereference(json, {
    dereference: {
      circular: 'ignore'
    }
  })
}

async function bundle (json) {
  return RefParser.bundle(json, {
    dereference: {
      circular: 'ignore'
    }
  })
}

async function bundler (filePath) {
  let fileContent, parsedContent, dereferenceJson, bundledJson

  try {
    console.log(filePath)
    fileContent = fs.readFileSync(filePath, 'utf8')
  } catch (err) {
    throw 'Can not load the content of the Swagger specification file'
  }

  try {
    parsedContent = parseFileContent(fileContent)
  } catch (err) {
    throw 'Can not parse the content of the Swagger specification file'
  }

  try {
    dereferenceJson = await dereference(parsedContent)
  } catch (err) {
    throw 'Can not dereference the JSON obtained from the content of the Swagger specification file'
  }

  try {
    bundledJson = await bundle(dereferenceJson)
  } catch (err) {
    throw 'Can not bundle the JSON obtained from the content of the Swagger specification file'
  }

  return JSON.parse(JSON.stringify(bundledJson))
}

module.exports = bundler