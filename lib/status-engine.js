const Engine = require('./engine.js');
const MaxMessage = require('./models/max-message.js');
const { ADDRESS_RESET, ERROR_THRESHOLD } = require('./constants.js');

class StatusEngine extends Engine {
  constructor({ address, client, engineMap }) {
    super({ address, client });
    this.address = address;
    this.client = client;
    this.engineMap = engineMap;
    this._isTransmitting = false;
    this.timeoutId = null;
    this.errorThreshold = ERROR_THRESHOLD;
    this.errorCount = 0;
  }

  isTransmitting() {
    return this._isTransmitting;
  }

  startTransmitting() {
    this._isTransmitting = true;
  }

  stopTransmitting() {
    this._isTransmitting = false;
  }

  isPastThreshold() {
    return this.errorCount > this.errorThreshold;
  }

  update(data = []) {
    // if data is received, we are still transmitting
    const good = data.filter((x) => x === 1);
    if (data.length > 1 && good.length < 1 && this.isTransmitting() === true) {
      if (this.isPastThreshold()) {
        const message = new MaxMessage({
          address: ADDRESS_RESET,
          data: [1],
        });
        this.client.send(message);
        this.stopTransmitting();
        this.reset();
      } else {
        this.errorCount += 1;
      }
    } else if (data.length > 1 && good.length > 0) {
      this.startTransmitting();
    }
  }

  reset() {
    console.log('headset taken off?');
    this.errorCount = 0;
    this.engineMap.forEach((engine) => {
      if (engine.getAddress() !== this.address) {
        engine.reset();
      }
    });
  }
}

module.exports = StatusEngine;
