'use strict'

const fs = require('fs')
const path = require('path')
const { readPkg, writePkg, getAbsolutePath } = require('./../../lib/utils')
const dependencies = require('./../../lib/dependencies')
const Handlebars = require('./../../lib/handlebars')

function createTemplate (template, data) {
  const pluginTemplate = Handlebars.compile(fs.readFileSync(path.join(__dirname, 'templates', template), 'utf8'))
  return pluginTemplate(data)
}

async function generatePlugin (pluginPath, answers) {
  const rootProjectPath = getAbsolutePath(path.join(pluginPath, '..', '..'))

  if (fs.existsSync(path.join(pluginPath, 'pov.js'))) {
    throw new Error('Point-of-view plugin already configured')
  }

  let content = createTemplate('pov.hbs', answers)
  fs.writeFileSync(path.join(pluginPath, 'pov.js'), content, 'utf8')

  try {
    const pkg = readPkg(rootProjectPath)

    Object.assign(pkg.dependencies, {
      'point-of-view': dependencies['point-of-view'],
      [answers.engine]: dependencies[`${answers.engine}`]
    })

    writePkg(rootProjectPath, pkg)
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = { generatePlugin }