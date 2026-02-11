const EventEmitter = require('events')

const binlogEmitter = new EventEmitter();

function emitBinlog(payload) {

    console.log("EXECUTED THIS:_")
  binlogEmitter.emit('binlog', payload);
}

 function onBinlog(handler) {
  binlogEmitter.on('binlog', handler);
}


module.exports = {emitBinlog,onBinlog}

