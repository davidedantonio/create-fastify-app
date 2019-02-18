'use strict'

const swp = require('swagger-parser')
const parser = require('./parser')

async function swaggerParser (filePath) {
  let spec, data
  try {
    // Parse and validate data
    data = await swp.parse(filePath)
    spec = await swp.validate(data)
  } catch (e) {
    throw new Error('Error parsing data')
  }

  try {
    return parser.parse(spec)
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = swaggerParser
