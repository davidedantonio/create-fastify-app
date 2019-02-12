'use strict'

const bundler = require('./bundler')
const _ = require('lodash')

async function swagger (filePath) {
  const authorizedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
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
      if (authorizedMethods.indexOf(methodName.toUpperCase()) === -1) return

      _.each(method.parameters, param => {
        param.type = param.type || (param.schema ? param.schema.type : undefined)
      })
    })
  })

  swaggerContent.endpoints = _.uniq(_.map(swaggerContent.paths, 'endpointName'))

  return swaggerContent
}

module.exports = swagger
