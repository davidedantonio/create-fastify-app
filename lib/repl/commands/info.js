'use strict'

const chalk = require('chalk')
const os = require('os')
const v8 = require('v8')
const _ = require('lodash')
const clui = require('clui')
const pretty = require('pretty-bytes')

function getHeader (name) {
  const title = `${' '.repeat(15)}${name}${' '.repeat(15)}`
    const lines = '='.repeat(title.length)
    return `${title}\n
${chalk.yellow.bold(lines)}\n
${chalk.yellow.bold(title)}\n
${chalk.yellow.bold(lines)}\n
\n`
}

function getPrint (caption, value) {
  return '   ', _.padEnd(caption, 25) + (value != null ? ': ' + chalk.bold(value) : '') + '\n'
}

async function command (socket, fastify) {
  const Gauge = clui.Gauge

  const heapStat = v8.getHeapStatistics()
  const heapUsed = heapStat.used_heap_size
  const maxHeap = heapStat.heap_size_limit

  socket.write(getHeader('General information'))
  socket.write(getPrint('CPU', 'Arch: ' + (os.arch()) + ', Cores: ' + (os.cpus().length)))
  socket.write(getPrint('Heap', Gauge(heapUsed, maxHeap, 20, maxHeap * 0.5, pretty(heapUsed))))
  socket.write(getPrint('OS', (os.platform()) + ' (' + (os.type()) + ')'))
  socket.write(getPrint('IP', fastify.server.address().address))
  socket.write(getPrint('PORT', fastify.server.address().port))
  socket.write(getPrint('Hostname', os.hostname()))
  socket.write(`\n\x0D`)

  console.log(fastify.routing())
}

module.exports.name = 'info'
module.exports.command = command