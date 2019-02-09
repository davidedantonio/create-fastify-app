'use strict'

const argv = require('yargs-parser')

module.exports = function parseArgs (args) {
  const parsedArgs = argv(args, {
    number: ['port', 'body-limit', 'plugin-timeout'],
    boolean: ['pretty-logs', 'options'],
    string: ['log-level', 'address', 'prefix', 'file'],
    envPrefix: 'FASTIFY_',
    alias: {
      address: ['a'],
      port: ['p'],
      options: ['o'],
      watch: ['W'],
      prefix: ['r'],
      'log-level': ['l'],
      'pretty-logs': ['P'],
      'plugin-timeout': ['T']
    },
    default: {
      'log-level': 'error',
      'pretty-logs': true,
      'options': false,
      'plugin-timeout': 10 * 1000,
      'file': 'app/app.js'
    }
  })

  return Object.assign({}, {
    _: parsedArgs._,
    address: parsedArgs.address,
    bodyLimit: parsedArgs.bodyLimit,
    file: parsedArgs.file,
    ignoreWatch: parsedArgs.ignoreWatch,
    logLevel: parsedArgs.logLevel,
    options: parsedArgs.options,
    pluginTimeout: parsedArgs.pluginTimeout,
    port: parsedArgs.port,
    prefix: parsedArgs.prefix,
    prettyLogs: parsedArgs.prettyLogs,
    socket: parsedArgs.socket,
    watch: parsedArgs.watch
  })
}
