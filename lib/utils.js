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
      '# This is Fastify .env file. Add here your environment variables\n',
      'utf8'
    )
  }
}

const readPkg = projectFolder => {
  let pkg = fs.readFileSync(path.join(projectFolder, 'package.json'), 'utf8')
  try {
    return JSON.parse(pkg)
  } catch (err) {
    throw new Error(err)
  }
}

const writePkg = (projectFolder, content) => {
  try {
    fs.writeFileSync(path.join(projectFolder, 'package.json'), JSON.stringify(content, null, 2), 'utf8')
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = {
  stop,
  showHelp,
  isValidFastifyProject,
  getAbsolutePath,
  parseArgs,
  generateENV,
  readPkg,
  writePkg
}
