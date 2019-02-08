'use strict'

const Handlebars = require('handlebars')
const _ = require('lodash')

Handlebars.registerHelper('toLowerCase', function (value) {
  return value.toLowerCase()
})

module.exports = Handlebars