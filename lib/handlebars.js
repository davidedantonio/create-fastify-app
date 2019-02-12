'use strict'

const Handlebars = require('handlebars')
const _ = require('lodash')

Handlebars.registerHelper('toLowerCase', function (value) {
  return value.toLowerCase()
})

Handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context, null, 2)
})

Handlebars.registerHelper('ifInMainInfo', function(lvalue, options) {
  if (['info','host','tags','schemes','securityDefinitions','externalDocs','endpoints'].includes(lvalue)) {
    return options.fn(this)
  }

  return options.inverse(this)
})

Handlebars.registerHelper('validMethod', (method, options) => {
  const authorized_methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']

  if (arguments.length < 3) {
    throw new Error('Handlebars Helper validMethod needs 1 parameter')
  }

  if (authorized_methods.indexOf(method.toUpperCase()) === -1) {
    return options.inverse(this)
  }

  return options.fn(this)
})

Handlebars.registerHelper('camelCase', (str) => {
  return _.camelCase(str)
})

Handlebars.registerHelper('concat', function () {
  let strings = []

  for (let arg in arguments) {
    if (typeof arguments[arg] === 'string') {
      strings.push(arguments[arg])
    }
  }
  return strings.join('')
})

module.exports = Handlebars
