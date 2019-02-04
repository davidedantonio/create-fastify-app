#!/usr/bin/env node

'use strict'

const commander = require('commander')
const app = require('./generators/app')

commander
  .version('0.1.0')
  .usage('option')
  .option('-p, --peppers', 'Add peppers')
  .option('-P, --pineapple', 'Add pineapple')
  .option('-b, --bbq-sauce', 'Add bbq sauce')
  .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
  .parse(process.argv);

if (commander.args.length === 0) {
  commander.help()
}