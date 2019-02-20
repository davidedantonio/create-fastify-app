'use strict'

const fs = require('fs')
const path = require('path')
const { generateENV } = require('./../../lib/utils')

async function generatePlugin (pluginPath, answers) {
  const rootProjectPath = path.join(pluginPath, '..', '..')

  if (fs.existsSync(path.join(pluginPath, 'mongo.db.js'))) {
    throw new Error('MongoDB plugin already configured')
  }

  generateENV(rootProjectPath)
  for (var property in answers) {
    fs.appendFileSync(path.join(rootProjectPath, '.env'), `${property.toUpperCase()}=${answers[property]}`)
  }


}

module.exports = { generatePlugin }