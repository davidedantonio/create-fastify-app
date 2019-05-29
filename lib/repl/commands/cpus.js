'use strict'

const chalk = require('chalk')
const { table, getBorderCharacters } = require('table')
const _ = require('lodash')
const humanize = require('tiny-human-time').short
const getCpuUsage = require('../../plugins/cpu')

async function command (socket, fastify) {
  const hLines = []
  const data = [
    [
      chalk.bold('#'),
      chalk.bold('CPU Model'),
      chalk.bold('Usage')
    ]
  ]

  const cpus = await getCpuUsage()
  for (let i in cpus.infos) {
    hLines.push(data.length)
    data.push([
      i + 1,
      cpus.infos[i].model,
      cpus.infos[i].usage ? humanize(cpus.infos[i].usage) : '-'
    ])
  }

  const tableConf = {
    border: _.mapValues(getBorderCharacters('honeywell'), char => chalk.gray(char)),
    drawHorizontalLine: (index, count) => index === 0 || index === 1 || index === count || hLines.indexOf(index) !== -1
  }

  socket.write(table(data, tableConf))
}

module.exports.name = 'cpus'
module.exports.command = command
