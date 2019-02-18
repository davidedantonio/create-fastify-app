'use strict'

const {
  copyProps,
  defineUrl,
  defineOperationId,
  defineRoutePrefix
} = require('./utils')
const _ = require('lodash')

const parseParams = data => {
  const params = {
    type: 'object',
    properties: {}
  }
  const required = []
  data.forEach(item => {
    // item.type 'file' breaks ajv, so treat is as a special here
    if (item.type === 'file') {
      item.type = 'string'
      item.isFile = true
    }
    //
    params.properties[item.name] = {}
    copyProps(item, params.properties[item.name], [
      'type',
      'description'
    ])
    // ajv wants 'required' to be an array, which seems to be too strict
    // see https://github.com/json-schema/json-schema/wiki/Properties-and-required
    if (item.required) {
      required.push(item.name)
    }
  })

  if (required.length > 0) {
    params.required = required
  }
  return params
}

const parseParameters = (schema, data) => {
  const params = []
  const querystring = []
  const headers = []
  const formData = []

  data.forEach(item => {
    switch (item.in) {
      case 'body':
        schema.body = item.schema
        break
      case 'formData':
        formData.push(item)
        break
      case 'path':
        params.push(item)
        break
      case 'query':
        querystring.push(item)
        break
      case 'header':
        headers.push(item)
        break
    }
  })

  if (params.length > 0) {
    schema.params = parseParams(params)
  }

  if (querystring.length > 0) {
    schema.querystring = parseParams(querystring)
  }

  if (headers.length > 0) {
    schema.headers = parseParams(headers)
  }

  if (formData.length > 0) {
    schema.body = parseParams(formData)
  }
}

const parseResponses = responses => {
  const result = {}
  let hasResponse = false
  for (let httpCode in responses) {
    if (responses[httpCode].schema !== undefined) {
      result[httpCode] = responses[httpCode].schema
      hasResponse = true
    }
  }
  return hasResponse ? result : null
}

const makeSchema = data => {
  const schema = {}
  const copyItems = [
    'tags',
    'summary',
    'description',
    'operationId',
    'produces',
    'consumes',
    'deprecated'
  ]

  copyProps(data, schema, copyItems)

  if (data.parameters) {
    parseParameters(schema, data.parameters)
  }

  const response = parseResponses(data.responses)
  if (response) {
    schema.response = response
  }

  return schema
}

const processOperation = (path, operation, data) => {
  const route = {
    method: operation.toUpperCase(),
    url: defineUrl(path),
    routePrefix: defineRoutePrefix(path),
    schema: makeSchema(data),
    operationId: data.operationId || defineOperationId(operation, path)
  }

  return route
}

const omitDeep = (obj, k) => {
  _.forIn(obj, function (value, key) {
    if (_.isObject(value)) {
      omitDeep(value, k)
    } else if (key === k) {
      delete obj[key]
    }
  })
}

const processPaths = paths => {
  let routes = []
  for (let path in paths) {
    for (let operation in paths[path]) {
      routes.push(processOperation(path, operation, paths[path][operation]))
    }
  }

  omitDeep(routes, 'format')
  return routes
}

const parse = spec => {
  const config = { generic: {}, routes: [], prefix: '' }

  for (let item in spec) {
    switch (item) {
      case 'paths':
        config.routes = processPaths(spec.paths)
        break
      case 'basePath':
        config.prefix = spec[item]
        break
      default:
        config.generic[item] = spec[item]
        break
    }
  }

  return config
}

module.exports = { parse }
