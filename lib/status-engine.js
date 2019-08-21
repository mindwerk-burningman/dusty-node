const Engine = require('./engine.js');
const { ERROR_THRESHOLD } = require('./constants.js');

class StatusEngine extends Engine {
  constructor({ address, engineMap }) {
    super({ address });
    this.address = address;
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
        this.stopTransmitting();
        this.reset();
      } else {
        this.errorCount += 1;
      }
    } else if (data.length > 1 && good.length > 0) {
      this.startTransmitting();
    }
  }

  getNextChannel(channels) {
    const anyChannels = [12, 13, 14, 15];
    const chooseWildcard = Math.random() < 0.25;
    if (chooseWildcard) {
      return anyChannels[random.int(0, anyChannels.length - 1)];
    }
    return channels[random.int(0, channels.length - 1)];
  }

  getChannelMap() {
    const bassChannels = [0, 1, 2, 3];
    const padChannels = [4, 5, 6, 7];
    const sparklesChannels = [8, 9, 10, 11];
    return {
      [ADDRESS_ALPHA]: this.getNextChannel(bassChannels),
      [ADDRESS_BETA]: this.getNextChannel(padChannels),
      [ADDRESS_THETA]: this.getNextChannel(sparklesChannels),
    };
  }

  reset() {
    console.log('headset taken off?');
    this.errorCount = 0;
    const channelMap = this.getChannelMap()
    this.engineMap.forEach((engine) => {
      if (engine.getAddress() !== this.address) {
        engine.reset(channelMap);
      }
    });
  }
}

module.exports = StatusEngine;
