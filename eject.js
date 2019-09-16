'use strict'

const fs = require('fs')
const parseArgs = require('./args/run')
const path = require('path')
const chalk = require('chalk')
const { isValidFastifyProject } = require('./lib/utils')
const { promisify } = require('util')
const mkdir = promisify(fs.mkdir)
const copyFile = promisify(fs.copyFile)
const generify = require('generify')
const log = require('./lib/log')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

function showHelp () {
  fs.readFile(path.join(__dirname, 'help', 'eject.txt'), 'utf8', (err, data) => {
    if (err) {
      module.exports.stop(err)
    }

    console.log(data)
    module.exports.stop()
  })
}

function stop (error) {
  if (error) {
    console.error(error)
    process.exit(1)
  }
  process.exit()
}

async function eject (args, cb) {
  const opts = parseArgs(args)

  if (!fs.existsSync(opts.file)) {
    console.error('Missing the required file index.js\n')
    return showHelp()
  }

  if (opts.help) {
    return showHelp()
  }

  const dir = opts.directory || process.cwd()
  try {
    await isValidFastifyProject(dir, null)
  } catch (e) {
    return cb(e)
  }

  try {
    await mkdir(path.join(dir, 'lib'))
    await mkdir(path.join(dir, 'args'))

    generify(path.join(__dirname, 'lib', 'watch'), path.join(dir, 'lib', 'watch'), {}, function (file) {
      log('debug', `generated ${path.join(dir, 'lib', 'watch')}`)
    })

    generify(path.join(__dirname, 'lib', 'repl'), path.join(dir, 'lib', 'repl'), {}, function (file) {
      log('debug', `generated ${path.join(dir, 'lib', 'repl')}`)
    })

    generify(path.join(__dirname, 'lib', 'plugins'), path.join(dir, 'lib', 'plugins'), {}, function (file) {
      log('debug', `generated ${path.join(dir, 'lib', 'plugins')}`)
    })

    await copyFile(path.join(__dirname, 'args', 'run.js'), path.join(dir, 'args', 'run.js'))
    log('debug', `generated ${path.join(dir, 'args', 'run.js')}`)

    await copyFile(path.join(__dirname, 'run.js'), path.join(dir, 'run.js'))
    log('debug', `generated ${path.join(dir, 'run.js')}`)

    let pkgLocal = await readFile(path.join(__dirname, 'package.json'), 'utf8')
    pkgLocal = JSON.parse(pkgLocal)
    let pkgApp = await readFile(path.join(dir, 'package.json'), 'utf8')
    pkgApp = JSON.parse(pkgApp)

    Object.assign(pkgApp, {
      dependencies: {
        ...pkgApp.dependencies,
        clui: pkgLocal.dependencies.clui,
        'tiny-human-time': pkgLocal.dependencies['tiny-human-time'],
        chalk: pkgLocal.dependencies.chalk
      },
      scripts: {
        test: 'tap test/**/*.test.js',
        start: 'node run.js',
        dev: 'node run.js -l info -P -w'
      }
    })

    await writeFile(path.join(dir, 'package.json'), JSON.stringify(pkgApp, null, 2), 'utf8')
    log('debug', 'package.json modified')
    log('success', `run '${chalk.bold('npm install')}'`)
    log('success', `run '${chalk.bold('npm run dev')}' to start the application`)
  } catch (e) {
    module.exports.stop(e)
  }
}

function cli (args) {
  eject(args)
}

module.exports = { cli, stop }

if (require.main === module) {
  cli(process.argv.slice(2))
}
