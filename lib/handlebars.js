'use strict'

const Handlebars = require('handlebars')
const _ = require('lodash')

Handlebars.registerHelper('toLowerCase', value => {
  return value.toLowerCase()
})

Handlebars.registerHelper('json', context => {
  return JSON.stringify(context, null, 2)
})

Handlebars.registerHelper('ifInMainInfo', (lvalue, options) => {
  if (['info', 'host', 'tags', 'schemes', 'securityDefinitions', 'externalDocs', 'endpoints'].includes(lvalue)) {
    return options.fn(this)
  }

  return options.inverse(this)
})

Handlebars.registerHelper('validMethod', (method, options) => {
  const authorizedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']

  /* eslint-disable no-undef */
  if (arguments.length < 3) {
    throw new Error('Handlebars Helper validMethod needs 1 parameter')
  }
  /* eslint-enable no-undef */

  if (authorizedMethods.indexOf(method.toUpperCase()) === -1) {
    return options.inverse(this)
  }

  return options.fn(this)
})

Handlebars.registerHelper('camelCase', str => {
  return _.camelCase(str)
})

Handlebars.registerHelper('checkSuccessResponses', (responses, options) => {
  const codes = responses ? Object.keys(responses) : [];
  const code = codes.find(code => Number(code) >= 200 && Number(code) < 300)
  let result = {}
  if (code) {
    result = options.fn({
      code: code,
      data: responses[code].description.replace(/"/g, '\'') || 'successful operation'
    })
  } else {
    result = options.fn({
      code: 200,
      data: 'successful operation'
    })
  }

  return result
})

Handlebars.registerHelper('concat', function () {
  let strings = []

  /* eslint-disable no-undef */
  for (let arg in arguments) {
    if (typeof arguments[arg] === 'string') {
      strings.push(arguments[arg])
    }
  }
  /* eslint-enable no-undef */

  return strings.join('')
})



module.exports = Handlebars
