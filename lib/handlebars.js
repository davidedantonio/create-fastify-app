'use strict'

const Handlebars = require('handlebars')

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

module.exports = Handlebars
