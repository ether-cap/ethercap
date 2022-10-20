#!/usr/bin/env node

const yargs = require('yargs')
const index = require('./index.js')

yargs
  .usage('$0 <cmd> [args]')
  .command('replayAll', 'replay all transactions', index.replayAll)  
  .command('replay [hash]', 'replay a single transaction', (yargs) => {
    yargs
      .positional('hash', {
        type: 'string',
        describe: 'hash of the transaction to be replayed',
      })
  }, (argv) => {
    index.replay(argv.hash)
  })  
  .help()
  .argv