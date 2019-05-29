'use strict'

const chalk = require('chalk')
const os = require('os')
const _ = require('lodash')
const clui = require('clui')
const fs = require('fs')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const path = require('path')
const getHealthStatus = require('../../plugins/health')
const humanize = require('tiny-human-time')

function getHeader (name) {
  const title = `${' '.repeat(15)}${name}${' '.repeat(15)}`
  const lines = '='.repeat(title.length)
  return `${title}\n
${chalk.yellow.bold(lines)}\n
${chalk.yellow.bold(title)}\n
${chalk.yellow.bold(lines)}\n
\n`
}

function print (caption, value) {
  return '   ' + _.padEnd(caption, 25) + (value != null ? ': ' + chalk.bold(value) : '') + '\n'
}

async function command (socket, fastify) {
  let pkgJson
  try {
    pkgJson = await readFile(path.resolve(process.cwd(), 'package.json'))
  } catch (e) {
    pkgJson = await readFile(path.resolve(__dirname, '../../../package.json'))
  }
  pkgJson = JSON.parse(pkgJson)

  const Progress = clui.Progress
  const health = getHealthStatus()

  socket.write(getHeader('General information'))
  socket.write(print('CPU', 'Arch: ' + (os.arch()) + ', Cores: ' + (os.cpus().length)))
  socket.write(print('Number of cpus', os.cpus().length))
  socket.write(print('OS', (os.platform()) + ' (' + (os.type()) + ')'))
  socket.write(print('IP', fastify.server.address().address))
  socket.write(print('PORT', fastify.server.address().port))
  socket.write(print('Hostname', os.hostname()))
  socket.write(print('Node version', process.version))
  socket.write(print('Fastify version', pkgJson.dependencies.fastify))
  socket.write(print('Current time', new Date().toString()))
  socket.write(print('Registered routes', fastify.routesInfo.size))

  socket.write(getHeader('Client'))
  socket.write(print('Type', health.client.type))
  socket.write(print('Version', health.client.langVersion))

  socket.write(getHeader('User'))
  socket.write(print('UID', health.os.user.uid))
  socket.write(print('GID', health.os.user.gid))
  socket.write(print('Username', health.os.user.username))
  socket.write(print('Home DIR', health.os.user.homedir))
  socket.write(print('Shell', health.os.user.shell))

  socket.write(getHeader('Health Status'))
  const progress = new Progress(50)
  const heapUsedPercentage = health.process.memory.heapUsed * 100 / health.process.memory.heapTotal
  socket.write(print('PID', health.process.pid))
  socket.write(print('Uptime', humanize(health.process.uptime * 1000)))
  socket.write(print('Memory', progress.update(health.mem.percent, 100)))
  socket.write(print('Heap', progress.update(heapUsedPercentage, 100)))
  socket.write(print('CPU', progress.update(health.cpu.utilization, 100)))
  socket.write(print('Load Average', `${health.cpu.load1.toFixed(2)}, ${health.cpu.load5.toFixed(2)}, ${health.cpu.load15.toFixed(2)}`))
}

module.exports.name = 'info'
module.exports.command = command
