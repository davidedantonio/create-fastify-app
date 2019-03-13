'use strict'

const log = require('./log')
const fs = require('fs')
const path = require('path')
const argv = require('yargs-parser')
const { fileExists, writeFile } = require('./fs')

const showHelp = _ => {
  fs.readFile(path.join(__dirname, '..', 'help', 'usage.txt'), 'utf8', (err, data) => {
    if (err) {
      log('error', err)
      process.exit(1)
    }

    log('info', data)
    process.exit(0)
  })
}

const stop = err => {
  if (err) {
    log('error', err)
    process.exit(1)
  }
  process.exit(0)
}

const isValidFastifyProject = async (dir, serviceName) => {
  try {
    let dirExist = await fileExists(dir)
    if (!dirExist) {
      throw new Error(`Missing ${dir} folder`)
    }

    let pkgExist = await fileExists(path.join(dir, 'package.json'))
    if (!pkgExist) {
      throw new Error(`Missing ${path.join(dir, 'package.json')} file`)
    }

    let appExist = await fileExists(path.join(dir, 'app'))
    if (!appExist) {
      throw new Error(`Missing ${path.join(dir, 'app')} folder`)
    }

    let servicesExist = await fileExists(path.join(dir, 'app', 'services'))
    if (!servicesExist) {
      throw new Error(`Missing ${path.join(dir, 'app', 'services')} folder`)
    }

    if (serviceName) {
      let servicesFolderExist = await fileExists(path.join(dir, 'app', 'services', serviceName))
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
    directory: parsedArgs.directory
  })
}

const generateENV = async projectPath => {
  let envExist = fileExists(path.join(projectPath, '.env'))
  if (!envExist) {
    await writeFile(
      path.join(projectPath, '.env'),
      '# This is Fastify .env file. Add here your environment variables\n',
      'utf8'
    )
  }
}

module.exports = {
  stop,
  showHelp,
  isValidFastifyProject,
  getAbsolutePath,
  parseArgs,
  generateENV
}
