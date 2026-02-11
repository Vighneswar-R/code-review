const { onBinlog } = require('./binLogBus.js');
const { getIO } = require('./server.js')

function bindBinlogSocketBridge() {
  const io = getIO();

  onBinlog((payload) => {
    // if (payload.source === 'permissionmapping') {
    //   io.emit('binlog:permissionmapping', payload.data);
    // }

          io.emit('binlog:permissionmapping', payload.data);

  });
}

module.exports = {bindBinlogSocketBridge}
