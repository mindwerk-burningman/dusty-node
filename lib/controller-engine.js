const ControlChange = require('./models/control-change.js');
const Engine = require('./engine.js');

class ControllerEngine extends Engine {
  constructor(channel, controllerNumber, midiBus) {
    super();
    this.last = null;
    this.maxValue = 127;
    this.minValue = 0;
    this.isInverse = false;
    this.isFadingOut = false;
    this.channel = channel;
    this.controllerNumber = controllerNumber;
    this.midiBus = midiBus;
  }

  getChannel() {
    return this.channel;
  }

  getControllerNumber() {
    return this.controllerNumber;
  }

  getIsInverse() {
    return this.isInverse;
  }

  setIsInverse(isInverse) {
    this.isInverse = isInverse;
  }

  // 0 - 1 => min - max
  getValue(userValue) {
    const value =
      Math.floor(userValue * this.getMaxValue() - this.getMinValue()) + this.getMinValue();
    if (this.getIsInverse()) {
      return this.getMaxValue() - value;
    }
    return value;
  }

  // 0 - 1
  update(engine) {
    const value = this.getValue(engine.getUserValue());
    const controlChange = new ControlChange(this.getChannel(), this.getControllerNumber(), value);
    this.midiBus.sendControllerChange(controlChange);
    this.setPrev(value);
  }

  fadeOut() {
    const newLast = this.getPrev() - 1;
    const controlChange = new ControlChange(this.getChannel(), this.getControllerNumber(), newLast);
    this.midiBus.sendControllerChange(controlChange);
    this.setPrev(newLast);
    if (this.isFadingOut) {
      if (newLast === 1) {
        this.timer.cancel();
        this.isFadingOut = false;
      }
    }
  }

  reset() {
    // if (!isFadingOut) {
    //     TimerTask resetTask = new TimerTask() {
    //         run() {
    //             fadeOut();
    //             isFadingOut = true;
    //         }
    //     };
    //     long delay  = 0L;
    //     long period = 500L;
    //     timer.scheduleAtFixedRate(resetTask, delay, period);
    // }
  }
}

module.exports = ControllerEngine;
