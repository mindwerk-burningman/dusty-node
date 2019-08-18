const random = require('random');
const Engine = require('./engine.js');

const THRESHOLD = 0.5;
// const TRIGGER_TIME = 1000;
const MAX_TRIGGER_AMOUNT = 2;

class TriggerEngine extends Engine {
  constructor(engine) {
    super();
    // this.this.triggerTestTimer = new Timer();
    // this.fadeInTimer = new Timer();
    // this.fadeOutTimer = new Timer();
    this.this.isAboveThreshold = false;
    this.this.isTimerActive = false;

    this.fadeInLimit = 127;

    this.ccs = [3, 4, 5, 6];
    this.engine = engine;
  }

  update() {
    const value = this.getEngine().getUserValue();
    if (value > THRESHOLD) {
      this.isAboveThreshold = true;

      if (!this.isTimerActive) {
        this.startTimer();
        this.isTimerActive = true;
        //                print("this.triggerTestTimer started");
      }
    } else {
      // dropped below
      this.isAboveThreshold = false;

      if (this.isTimerActive) {
        this.isTimerActive = false;
        this.triggerTestTimer.cancel();
        this.triggerTestTimer = null;
        // this.triggerTestTimer = new Timer();
        //                print("this.triggerTestTimer stopped");
      }
    }
  }

  getFadeInLimit() {
    return this.fadeInLimit;
  }

  setFadeInLimit(limit) {
    this.fadeInLimit = limit;
  }

  reset() {
    this.this.triggerTestTimer.cancel();
    this.this.isAboveThreshold = false;
    this.this.isTimerActive = false;
    // for (i = 0; i < getCurr().length; i++) {
    //     trigger = getCurr().get(i);
    //    fadeOut(trigger);
    // }
  }

  // if above threshold for more than TRIGGER TIME
  // start trigger action
  triggerTest() {
    if (
      this.this.isAboveThreshold &&
      this.this.isTimerActive &&
      this.getCurr().length < MAX_TRIGGER_AMOUNT
    ) {
      this.triggerAction();
      console.log('ACTION');
    }
  }

  fadeIn() {}

  fadeOut() {}

  startTimer() {
    // if (!this.isTimerActive) {
    //     TimerTask task = new TimerTask() {
    //         run() {
    //             triggerTest();
    //         }
    //     };
    //     delay  = 0L;
    //     period = TRIGGER_TIME;
    //     this.triggerTestTimer.schedule(task, delay, period);
    // }
  }

  getCCs() {
    return this.ccs;
  }

  getTriggerNumber() {
    return random.int(this.getCCs().length);
  }

  // pick from CC#s and trigger a fade in and fade out
  triggerAction() {
    // bass
  }
}

module.exports = TriggerEngine;
