'use strict'

const chalk = require('chalk')
const { table, getBorderCharacters } = require('table')
const _ = require('lodash')
const os = require('os')

async function command (socket, fastify) {
  const hLines = []
  const data = [
    [
      chalk.bold('Interface'),
      chalk.bold('Address'),
      chalk.bold('Netmask'),
      chalk.bold('Family'),
      chalk.bold('MAC'),
      chalk.bold('Internal'),
      chalk.bold('IPv6 scope ID'),
      chalk.bold('Assigned IPv4 or IPv6')
    ]
  ]

  const interfaces = os.networkInterfaces()
  for (let type in interfaces) {
    for (let row of interfaces[type]) {
      data.push([
        type,
        row.address || '-',
        row.netmask || '-',
        row.family || '-',
        row.mac || '-',
        row.internal ? 'YES' : 'NO',
        row.scopeid || '-',
        row.cidr
      ])
    }
  }

  const tableConf = {
    border: _.mapValues(getBorderCharacters('honeywell'), char => chalk.gray(char)),
    drawHorizontalLine: (index, count) => index === 0 || index === 1 || index === count || hLines.indexOf(index) !== -1
  }

  socket.write(table(data, tableConf))
}

module.exports.name = 'network'
module.exports.command = command
