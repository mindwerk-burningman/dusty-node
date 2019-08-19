const Easymidi = require('easymidi');

const output = new Easymidi.Output('From DustyNode', true);

const playNote = ({ note, velocity, channel, duration }) => {
  output.send('noteon', {
    note,
    velocity,
    channel,
  });

  setTimeout(() => {
    output.send('noteoff', { note, channel });
  }, duration);
};

const sendControlChange = ({ controller, value, channel }) => {
  output.send('cc', { controller, value, channel });
};

const stopNote = ({ note, velocity, channel }) => {
  output.send('noteoff', { note, velocity, channel });
};

const reset = () => {
  output.send('reset');
};

module.exports = { playNote, sendControlChange, stopNote, reset };
