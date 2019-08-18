const dgram = require('dgram');

class DustMoreServer {
  constructor(client, port, onUpdate) {
    this.server = dgram.createSocket('udp4');
    this.client = client;
    this.port = port;
    this.onUpdate = onUpdate;
  }

  start() {
    this.server.on('message', this.onUpdate.bind(this));
    this.server.bind(this.port);
  }

  stop() {
    process.exit(0);
  }
}

module.exports = DustMoreServer;
