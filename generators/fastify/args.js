'use strict'

const argv = require('yargs-parser')

module.exports = function parseArgs (args) {
  const parsedArgs = argv(args, {
    alias: {
      help: ['h']
    }
  })

  return Object.assign({}, {
    _: parsedArgs._
  })
}
