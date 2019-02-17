'use strict'

const V2 = require('./v2')

const parse = (content) => {
  if (content.swagger && content.swagger.indexOf("2.0") === 0) {
    return V2.parse(content)
  }

  throw new Error('parameter must contain a valid Open Api Version 2.0 or 3.0.x')
}

module.exports = { parse }