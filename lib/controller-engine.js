const Engine = require('./engine.js');
const { sendControlChange } = require('./midi-util');

const FADEOUT_TIMEOUT = 50;

class ControllerEngine extends Engine {
  constructor({ address, channel, controllerNumber }) {
    super();
    this.address = address;
    this.maxValue = 127;
    this.minValue = 0;
    this.channel = channel;
    this.controllerNumber = controllerNumber;
  }

  // 0 - 1 => min - max
  normalizeValue(userValue) {
    const value = Math.floor(userValue * this.maxValue - this.minValue) + this.minValue;
    return value;
  }

  // 0 - 1
  update(value) {
    const normalized = this.normalizeValue(value);
    this.latestValue = normalized;
    sendControlChange({
      controller: this.controllerNumber,
      value: normalized,
      channel: this.channel,
    });
  }

  fadeOut(value) {
    if (value === 0) {
      return null;
    }

    sendControlChange({
      controller: this.controllerNumber,
      value: value - 1,
      channel: this.channel,
    });
    return setTimeout(() => this.fadeOut(value - 1), FADEOUT_TIMEOUT);
  }

  reset() {
    this.fadeOut(this.latestValue);
  }
}

module.exports = ControllerEngine;
