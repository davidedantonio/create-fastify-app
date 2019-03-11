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

const isValidFastifyProject = async (dir, serviceName, cb) => {
  try {
    let dirExist = await fileExists(dir)
    if (!dirExist) {
      cb(new Error(`Missing ${dir} folder`))
    }

    let pkgExist = await fileExists(path.join(dir, 'package.json'))
    if (!pkgExist) {
      cb(new Error(`Missing ${path.join(dir, 'package.json')} file`))
    }

    let appExist = await fileExists(path.join(dir, 'app'))
    if (!appExist) {
      cb(new Error(`Missing ${path.join(dir, 'app')} folder`))
    }

    let servicesExist = await fileExists(path.join(dir, 'app', 'services'))
    if (!servicesExist) {
      cb(new Error(`Missing ${path.join(dir, 'app', 'services')} folder`))
    }

    if (serviceName) {
      let servicesFolderExist = await fileExists(path.join(dir, 'app', 'services', serviceName))
      if (servicesFolderExist) {
        cb(new Error(`Service ${path.join(dir, 'app', 'services', serviceName)} already exist`))
      }
    }
  } catch (e) {
    cb(e)
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

const generateENV = async projectPath => {
  let envExist = await fileExists(path.join(projectPath, '.env'))
  if (!envExist) {
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

const fileExists = file => new Promise((resolve, reject) => {
  fs.access(file, fs.F_OK, err => {
    if (err) {
      if (err.code !== 'ENOENT') {
        return reject(err)
      }
      return resolve(false)
    }
    resolve(true)
  })
})

const writeFile = (file, data, opts) => new Promise((resolve, reject) => {
  fs.writeFile(file, data, opts, err => {
    if (err) {
      reject(err)
    }
    resolve(true)
  })
})

const readFile = (file, opts) => new Promise((resolve, reject) => {
  fs.readFile(file, opts, (err, data) => {
    if (err) {
      reject(err)
    }
    resolve(data)
  })
})

module.exports = {
  stop,
  showHelp,
  isValidFastifyProject,
  getAbsolutePath,
  parseArgs,
  generateENV,
  readPkg,
  fileExists,
  writeFile,
  readFile
}
