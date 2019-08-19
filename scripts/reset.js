const { sendControlChange, stopNote, reset } = require('../lib/midi-util');

const run = () => {
  for (let controller = 0; controller < 128; controller += 1) {
    for (let channel = 0; channel < 16; channel += 1) {
      console.log(`sending cc ${controller} on channel ${channel}`);
      sendControlChange({ controller, value: 0, channel });
    }
  }

  for (let note = 0; note < 128; note += 1) {
    for (let channel = 0; channel < 16; channel += 1) {
      console.log(`sending stop ${note} on channel ${channel}`);
      stopNote({ note, velocity: 0, channel });
    }
  }

  reset();
};

setTimeout(run, 4000);
