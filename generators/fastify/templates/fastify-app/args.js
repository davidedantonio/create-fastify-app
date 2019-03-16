'use strict'

const argv = require('yargs-parser')

module.exports = function parseArgs (args) {
  const parsedArgs = argv(args, {
    number: ['port', 'body-limit', 'plugin-timeout'],
    boolean: ['pretty-logs', 'options', 'help'],
    string: ['log-level', 'address', 'prefix', 'file'],
    envPrefix: 'FASTIFY_',
    alias: {
      help: ['h'],
      file: ['f'],
      address: ['a'],
      port: ['p'],
      options: ['o'],
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
    help: parsedArgs.help,
    address: parsedArgs.address,
    bodyLimit: parsedArgs.bodyLimit,
    file: parsedArgs.file,
    logLevel: parsedArgs.logLevel,
    options: parsedArgs.options,
    pluginTimeout: parsedArgs.pluginTimeout,
    port: parsedArgs.port,
    prefix: parsedArgs.prefix,
    prettyLogs: parsedArgs.prettyLogs
  })
}
