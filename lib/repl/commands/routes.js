'use strict'

const chalk = require('chalk')
const { table, getBorderCharacters } = require('table')
const _ = require('lodash')
const humanize = require('tiny-human-time').short

function getPrettyMethod (method) {
  let color = ''
  switch (method) {
    case 'GET':
      color = '#0F6AB4'
      break
    case 'POST':
      color = '#10A54A'
      break
    case 'PUT':
      color = '#C5862B'
      break
    case 'HEAD':
      color = '#ffd20f'
      break
    case 'DELETE':
      color = '#A41E22'
      break
    case 'OPTIONS':
      color = '#777'
      break
    case 'PATCH':
      color = '#D38042'
      break
    default:
      color = '#777'
  }

  return chalk.bgHex(color).bold(` ${method} `)
}

async function command (socket, fastify) {
  const hLines = []
  const data = [
    [
      chalk.bold('Method'),
      chalk.bold('Route'),
      chalk.bold('Prefix'),
      chalk.bold('Log Level'),
      chalk.bold('Requests'),
      chalk.bold('AVG Response')
    ]
  ]

  console.log(fastify.routesInfo)
  fastify.routesInfo.forEach(route => {
    data.push([
      getPrettyMethod(route.method),
      route.url,
      route.prefix,
      route.logLevel,
      route.requests,
      route.requestsAverage ? humanize(route.requestsAverage) : '-'
    ])
    hLines.push(data.length)
  })

  const tableConf = {
    border: _.mapValues(getBorderCharacters('honeywell'), char => chalk.gray(char)),
    columns: {
      0: { alignment: 'center', width: 10 }
    },
    drawHorizontalLine: (index, count) => index === 0 || index === 1 || index === count || hLines.indexOf(index) !== -1
  }

  socket.write(table(data, tableConf))
}

module.exports.name = 'routes'
module.exports.command = command
