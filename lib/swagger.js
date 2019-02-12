'use strict'

const bundler = require('./bundler')
const _ = require('lodash')
const wordWrap = require('word-wrap')

function generateOperationId(methodName, pathName) {
  if (pathName === '/') return methodName

  // clean url path for requests ending with '/'
  let clean_path = pathName
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

  return _.camelCase(`${methodName.toLowerCase()}-${segments.join('-')}`)
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

  _.each(swaggerContent.paths, (path, pathName) => {
    path.endpointName = pathName === '/' ? 'root' : pathName.split('/')[1]
    _.each(path, (method, methodName) => {

      if (authorized_methods.indexOf(methodName.toUpperCase()) === -1) return

      _.each(method.parameters, param => {
        param.type = param.type || (param.schema ? param.schema.type : undefined)
      })
    })
  })

  swaggerContent.endpoints = _.uniq(_.map(swaggerContent.paths, 'endpointName'))

  return swaggerContent
}

module.exports = swagger
