'use strict'

const fs = require('fs')
const { promisify } = require('util')
const path = require('path')
const argv = require('yargs-parser')
const access = promisify(fs.access)

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

    const appExist = await fileExists(path.join(dir, 'app'))
    if (!appExist) {
      throw new Error(`Missing ${path.join(dir, 'app')} folder`)
    }

    const servicesExist = await fileExists(path.join(dir, 'app', 'services'))
    if (!servicesExist) {
      throw new Error(`Missing ${path.join(dir, 'app', 'services')} folder`)
    }

    if (serviceName) {
      const servicesFolderExist = await fileExists(path.join(dir, 'app', 'services', serviceName))
      if (servicesFolderExist) {
        throw new Error(`Service ${path.join(dir, 'app', 'services', serviceName)} already exist`)
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

module.exports = {
  isValidFastifyProject,
  getAbsolutePath,
  parseArgs,
  fileExists
}
