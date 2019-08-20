const Engine = require('./engine.js');
const { sendControlChange } = require('./midi-util');

const FADEOUT_TIMEOUT = 50;

class ControllerEngine extends Engine {
  constructor({ address, channel, controllerNumber, rampDuration }) {
    super();
    this.address = address;
    this.maxValue = 127;
    this.minValue = 0;
    this.channel = channel;
    this.controllerNumber = controllerNumber;
    this.rampDuration = rampDuration || 2000;
  }

  // 0 - 1 => min - max
  normalizeValue(userValue) {
    const value = Math.floor(userValue * this.maxValue - this.minValue) + this.minValue;
    return value;
  }

  rampTo(maxVal, currVal = 0, timeout = null) {
    if (currVal >= maxVal) {
      return null;
    }
    if (timeout !== null) {
      return setTimeout(() => {
        this.rampTo(maxVal, currVal + 1, timeout);
      }, timeout);
    }
    // figure out timeout based on number of times this will need called
    // if going from 0 -> 40, it will take 40 iterations
    // we want that to span over 2000 ms or every 50 ms
    const numIterations = maxVal - currVal;
    const computedTimeout = this.rampDuration / numIterations;
    return setTimeout(() => {
      this.rampTo(maxVal, currVal + 1, computedTimeout);
    }, computedTimeout);
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
