'use strict'

const argv = require('yargs-parser')

module.exports = function parseArgs (args) {
  const parsedArgs = argv(args, {
    string: ['directory'],
    boolean: ['help'],
    alias: {
      directory: ['d'],
      help: ['h']
    }
  })

  return Object.assign({}, {
    _: parsedArgs._,
    directory: parsedArgs.directory,
    help: parsedArgs.help
  })
}
