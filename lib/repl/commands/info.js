'use strict'

const chalk = require('chalk')
const os = require('os')
const v8 = require('v8')
const _ = require('lodash')
const clui = require('clui')
const pretty = require('pretty-bytes')
const fs = require('fs')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const path = require('path')

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
  return '   ', _.padEnd(caption, 25) + (value != null ? ': ' + chalk.bold(value) : '') + '\n'
}

async function command (socket, fastify) {
  let pkgJson
  try {
    pkgJson = await readFile(path.resolve(process.cwd(), 'package.json'))
  } catch (e) {
    pkgJson = await readFile(path.resolve(__dirname, '../../../package.json'))
  }
  pkgJson = JSON.parse(pkgJson)

  const Gauge = clui.Gauge

  const heapStat = v8.getHeapStatistics()
  const heapUsed = heapStat.used_heap_size
  const maxHeap = heapStat.heap_size_limit

  socket.write(getHeader('General information'))
  socket.write(print('CPU', 'Arch: ' + (os.arch()) + ', Cores: ' + (os.cpus().length)))
  socket.write(print('Heap', Gauge(heapUsed, maxHeap, 50, maxHeap * 0.5, pretty(heapUsed))))
  socket.write(print('OS', (os.platform()) + ' (' + (os.type()) + ')'))
  socket.write(print('IP', fastify.server.address().address))
  socket.write(print('PORT', fastify.server.address().port))
  socket.write(print('Hostname', os.hostname()))
  socket.write('')
  socket.write(print('Node version', process.version))
  socket.write(print('Fastify version', pkgJson.dependencies.fastify))
  socket.write(print('Current time', new Date().toString()))
  socket.write(`\n\x0D`)

  socket.write(getHeader('Routes'))
  socket.write(print('Number of registered routes', fastify.routesInfo.size))
}

module.exports.name = 'info'
module.exports.command = command