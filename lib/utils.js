'use strict'

const log = require('./log')
const fs = require('fs')
const path = require('path')
const argv = require('yargs-parser')

const showHelp = _ => {
  log('info', fs.readFileSync(path.join(__dirname, '..', 'help', 'usage.txt'), 'utf8'))
  process.exit(0)
}

const stop = err => {
  if (err) {
    log('error', err)
    process.exit(1)
  }
  process.exit(0)
}

const isValidFastifyProject = (dir, serviceName, cb) => {
  if (!fs.existsSync(dir)) {
    cb(new Error(`Missing ${dir} folder`))
  }

  if (!fs.existsSync(path.join(dir, 'package.json'))) {
    cb(new Error(`Missing ${path.join(dir, 'package.json')} file`))
  }

  if (!fs.existsSync(path.join(dir, 'app'))) {
    cb(new Error(`Missing ${path.join(dir, 'app')} folder`))
  }

  if (!fs.existsSync(path.join(dir, 'app', 'services'))) {
    cb(new Error(`Missing ${path.join(dir, 'app', 'services')} folder`))
  }

  if (serviceName && fs.existsSync(path.join(dir, 'app', 'services', serviceName))) {
    cb(new Error(`Service ${path.join(dir, 'app', 'services', serviceName)} already exist`))
  }

  cb()
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

const generateENV = projectPath => {
  if (!fs.existsSync(path.join(projectPath, '.env'))) {
    fs.writeFileSync(
      path.join(projectPath, '.env'),
      '# This is Fastify .env file. Add here your environment variables',
      'utf8'
    )
  }
}

module.exports = {
  stop,
  showHelp,
  isValidFastifyProject,
  getAbsolutePath,
  parseArgs
}
