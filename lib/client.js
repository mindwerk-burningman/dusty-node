const dgram = require('dgram');
const osc = require('osc');

class DustMoreClient {
  constructor(host, port) {
    this.client = dgram.createSocket('udp4');
    this.host = host;
    this.port = port;
  }

  send({ address, data }) {
    if (Number.isNaN(data)) {
      return null;
    }
    const args = data;
    const msg = osc.writeMessage({ address, args });
    return this.client.send(Buffer.from(msg), this.port, this.host);
  }
}

module.exports = DustMoreClient;
