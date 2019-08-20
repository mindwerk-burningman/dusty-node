const WebSocket = require('ws');
const { normalize } = require('./utils');
const { StatusMap } = require('./status-map');

const { WS_PORT } = process.env;

class VizDataServer {
  constructor(port = WS_PORT, addresses) {
    this.wsServer = new WebSocket.Server({ port });
    this.wsServer.on('connection', this.onConnect.bind(this));
    this.wsServer.on('error', this.onError.bind(this));
    this.send = this.send.bind(this);
    this.update = this.update.bind(this);

    this.clients = [];
    this.addresses = addresses; // the address to listen for
    this.statusMap = new StatusMap(addresses);
    this.dataMap = addresses.reduce((acc, curr) => {
      acc[curr] = 0;
      return acc;
    }, {});
  }

  onConnect(client) {
    console.log('connection established');
    client.isAlive = true;
    this.clients.push(client);
  }

  onError(error) {
    console.log('error!', error);
  }

  update(address, data) {
    if (!this.statusMap.addresses.includes(address)) {
      return null;
    }

    this.statusMap.setAddressStatus(address, true);
    this.dataMap[address] = normalize(data);
    // only send when all values have been grabbed
    if (this.statusMap.isReady()) {
      this.send(this.dataMap);
      this.statusMap.reset();
    }
  }

  send(data) {
    this.clients.forEach((client) => {
      if (client.isAlive) {
        client.send(JSON.stringify(data));
      }
    });
  }
}

module.exports = { VizDataServer };
