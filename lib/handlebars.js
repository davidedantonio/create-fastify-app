'use strict'

const Handlebars = require('handlebars')

Handlebars.registerHelper('toLowerCase', function (value) {
  return value.toLowerCase()
})

module.exports = Handlebars
