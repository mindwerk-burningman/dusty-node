const { mean } = require('lodash');
const SMA = require('@solstice.sebastian/simple-moving-average');
const Constants = require('@solstice.sebastian/constants');
const Engine = require('./engine.js');

const INC_DEC_AMOUNT = 0.01;
const SMA_PERIOD = 30;
const TIME_AFTER_FIRST_MESSAGE = 1400;
const MIN_CALIBRATION_TIME = 1500;

class MuseEngine extends Engine {
  /**
   * set the signal pattern for this object
   * @param address for getting correct values
   */
  constructor({
    address,
    controllerEngines,
    incDecAmount = INC_DEC_AMOUNT,
    smaPeriod = SMA_PERIOD,
    channelMap,
  }) {
    super();

    this.latestSma = 0;

    this.address = address;
    this.waveName = address.replace('/muse/elements/', '');
    this.incDecAmount = incDecAmount;
    this.controllerEngines = controllerEngines;
    this.smaPeriod = smaPeriod;
    this.sma = SMA({ period: smaPeriod, values: [] });

    this.reset(channelMap);
  }

  setDefaults() {
    this.isUpdating = false;
    this.isCalibrated = false;
    this.isFirstMessage = true;
    this.isSendingFirstMessage = false;
    this.isCalibrated = false;
    this.originalMin = 0.25;
    this.originalMax = 0.75;
    this.min = this.originalMin;
    this.max = this.originalMax;
    this.firstMessageState = {
      isWaiting: true, // waiting to send
      isSending: false, // sending, waiting for timeout
      isSent: false, // sent
    };
  }

  getLatest() {
    return this.latestSma;
  }

  getLatestNormalized() {
    return this.latestNormalized;
  }

  // scale latestSma `range` -> 0-1
  getNormalized(val) {
    const range = this.max - this.min;
    return (val - this.min) / range;
  }

  isCloserToMin() {
    return Math.abs(this.latestSma - this.min) < Math.abs(this.max - this.latestSma); // closer to min
  }

  isCalibratedEnough() {
    if (this.latestSma !== Constants.INSUFFICIENT_DATA && this.isCalibrated === false) {
      setTimeout(() => {
        this.isCalibrated = true;
      }, MIN_CALIBRATION_TIME);
    }
    return this.isCalibrated;
  }

  shouldSendMessage() {
    if (this.isUpdating) {
      return true;
    }
    if (this.isCalibratedEnough() && this.isCloserToMin()) {
      console.log(
        `starting ${this.waveName} with min: ${this.min}, max: ${this.max}, val: ${this.latestSma}`
      );
      this.isUpdating = true;
      return true;
    }
    return false;
  }

  sendFirstMessage(normalized) {
    this.controllerEngines.forEach((engine) => engine.update(normalized));

    this.firstMessageState.isSending = true;
    setTimeout(() => {
      this.firstMessageState.isSending = false;
      this.firstMessageState.isSent = true;
    }, TIME_AFTER_FIRST_MESSAGE);
  }

  update(data) {
    const values = this.getValues(data);
    const averaged = mean(values);
    this.sma.update(averaged);
    this.latestSma = this.sma.calc();
    this.updateRange(this.latestSma);

    if (this.shouldSendMessage()) {
      this.send(this.latestSma);
    }
  }

  send(value) {
    this.latestNormalized = this.getNormalized(value);

    // send first message, then wait N seconds for next
    if (this.firstMessageState.isWaiting) {
      this.firstMessageState.isWaiting = false;
      this.controllerEngines.forEach((engine) => engine.rampTo(this.latestNormalized));
      this.sendFirstMessage(this.latestNormalized);
    } else if (this.firstMessageState.isSending) {
      // lower average so it can ramp up
      this.sma.update(this.min);
    } else if (this.firstMessageState.isSent) {
      this.controllerEngines.forEach((engine) => engine.update(this.latestNormalized));
    }
  }

  /**
   * get raw values of muse message
   * @param data from osc event
   * @return float[]
   */
  getValues(data) {
    if (Array.isArray(data)) {
      return [...data];
    }
    return [data];
  }

  reset(channelMap) {
    this.setDefaults();
    console.log(`resetting ${this.waveName}...`);
    const channelMapKey = Object.keys(channelMap).find((address) => this.address.includes(address));
    const channel = channelMap[channelMapKey];
    this.controllerEngines.forEach((engine) => engine.reset(channel));
  }
}

module.exports = MuseEngine;
