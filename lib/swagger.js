'use strict'

const bundler = require('./bundler')
const _ = require('lodash')
const wordWrap = require('word-wrap')

function generateOperationId(method_name, path_name) {
  if (path_name === '/') return method_name

  // clean url path for requests ending with '/'
  let clean_path = path_name
  if (clean_path.indexOf('/', clean_path.length - 1) !== -1) {
    clean_path = clean_path.substring(0, clean_path.length - 1)
  }

  let segments = clean_path.split('/').slice(1)
  segments = _.transform(segments, (result, segment) => {
    if (segment[0] === '{' && segment[segment.length - 1] === '}') {
      segment = `by-${_.capitalize(segment.substring(1, segment.length - 1))}}`
    }
    result.push(segment)
  })

  return _.camelCase(`${method_name.toLowerCase()}-${segments.join('-')}`)
}

async function swagger (filePath) {
  const authorized_methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
  let swaggerContent

  try {
    swaggerContent = await bundler(filePath)
  } catch (e) {
    throw e
  }

  swaggerContent.basePath = swaggerContent.basePath || ''

  _.each(swaggerContent.paths, (path, path_name) => {
    path.endpointName = path_name === '/' ? 'root' : path_name.split('/')[1]
    _.each(path, (method, method_name) => {
      if (authorized_methods.indexOf(method_name.toUpperCase()) === -1) return

      method.operationId = _.camelCase(method.operationId || generateOperationId(method_name, path_name).replace(/\s/g, '-'))
      method.descriptionLines = wordWrap(method.description || method.summary || '', { width: 60, indent: '' }).split(/\n/)
      _.each(method.parameters, param => {
        param.type = param.type || (param.schema ? param.schema.type : undefined)
      })
    })
  })

  swaggerContent.endpoints = _.uniq(_.map(swaggerContent.paths, 'endpointName'))

  return swaggerContent
}

module.exports = swagger
