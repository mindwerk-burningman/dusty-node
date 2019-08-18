const { mean } = require('lodash');
const MaxMessage = require('./models/max-message.js');

const MIN_MAX_BUFFER = 0.001;

/**
 * base class for storing common values/methods
 */
class Engine {
  getWaveName() {
    return this.waveName;
  }

  updateRange(value) {
    if (value < this.min - MIN_MAX_BUFFER) {
      this.min = value - MIN_MAX_BUFFER;
    }
    if (value > this.max + MIN_MAX_BUFFER) {
      this.max = value + MIN_MAX_BUFFER;
    }
  }

  /**
   * drop outlier values and avg the values
   * @param values values to average
   * @return float
   */
  getCleanAverage(values) {
    const validValues = values.filter((v) => v !== 0);

    if (validValues.length > 0) {
      return mean(values);
    }
    return 0;
  }

  getAddress() {
    return this.address;
  }

  getLatest() {
    return this.latestSma;
  }

  sendValue(value) {
    const message = new MaxMessage({
      address: this.getAddress(),
      data: value,
    });
    this.client.send(message);
  }

  update() {
    throw new Error(`Engines must implement 'update'`);
  }

  reset() {
    throw new Error(`Engines must implement 'reset'`);
  }
}

module.exports = Engine;
