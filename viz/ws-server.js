const WebSocket = require('ws');

const { WS_PORT } = process.env;

class WsServer {
  constructor(port = WS_PORT) {
    this.wsServer = new WebSocket.Server({ port });
    this.wsServer.on('connection', this.onConnect.bind(this));
    this.wsServer.on('error', this.onError.bind(this));
    this.send = this.send.bind(this);
    this.clients = [];
  }

  onConnect(client) {
    console.log('connection established');
    client.isAlive = true;
    this.clients.push(client);
  }

  onError(error) {
    console.log('error!', error);
  }

  send(data) {
    this.clients.forEach((client) => {
      if (client.isAlive) {
        client.send(JSON.stringify(data));
      }
    });
  }
}

module.exports = { WsServer };
