class LightEngine {
  constructor({ client, address }) {
    this.client = client;
    this.address = address;
  }

  update(value) {
    this.client.send({ address: this.address, data: value });
  }

  reset() {
    this.client.send({ address: this.address, data: 0 });
  }
}

module.exports = LightEngine;
