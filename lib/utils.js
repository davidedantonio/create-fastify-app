'use strict'

const fs = require('fs')
const { promisify } = require('util')
const path = require('path')
const argv = require('yargs-parser')
const access = promisify(fs.access)
const readFile = promisify(fs.readFile)
const Handlebars = require('./handlebars')

const fileExists = async file => {
  try {
    await access(file, fs.F_OK)
  } catch (e) {
    return false
  }
  return true
}

const isValidFastifyProject = async (dir, serviceName) => {
  try {
    const dirExist = await fileExists(dir)
    if (!dirExist) {
      throw new Error(`Missing ${dir} folder`)
    }

    const pkgExist = await fileExists(path.join(dir, 'package.json'))
    if (!pkgExist) {
      throw new Error(`Missing ${path.join(dir, 'package.json')} file`)
    }

    const appExist = await fileExists(path.join(dir, 'src'))
    if (!appExist) {
      throw new Error(`Missing ${path.join(dir, 'src')} folder`)
    }

    const servicesExist = await fileExists(path.join(dir, 'src', 'services'))
    if (!servicesExist) {
      throw new Error(`Missing ${path.join(dir, 'src', 'services')} folder`)
    }

    if (serviceName) {
      const servicesFolderExist = await fileExists(path.join(dir, 'src', 'services', serviceName))
      if (servicesFolderExist) {
        throw new Error(`Service ${path.join(dir, 'src', 'services', serviceName)} already exist`)
      }
    }
  } catch (e) {
    throw new Error(e)
  }

  return true
}

const getAbsolutePath = p => {
  if (path.normalize(p + '/') === path.normalize(path.resolve(p) + '/')) {
    return p
  }

  return path.resolve(path.dirname(process.argv[1]), p)
}

const parseArgs = (args) => {
  const parsedArgs = argv(args, {
    string: ['directory'],
    alias: {
      help: ['h'],
      directory: ['d']
    }
  })

  return Object.assign({}, {
    _: parsedArgs._,
    directory: parsedArgs.directory,
    help: parsedArgs.help
  })
}

const createTemplate = async (templateFile, data) => {
  let file
  try {
    file = await readFile(templateFile, 'utf8')
  } catch (e) {
    throw new Error(e)
  }

  const pluginTemplate = Handlebars.compile(file)
  return pluginTemplate(data)
}

module.exports = {
  isValidFastifyProject,
  getAbsolutePath,
  parseArgs,
  fileExists,
  createTemplate
}
