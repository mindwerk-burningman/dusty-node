const EasyMidi = require('easymidi');

const outputs = EasyMidi.getOutputs();
const dustyOutputName = outputs.find((output) => output.toLowerCase().includes('dusty'));
if (dustyOutputName) {
  console.log(`connecting to '${dustyOutputName}'`);
} else {
  console.log('creating virtual env: From DustyNode');
}

const output = dustyOutputName
  ? new EasyMidi.Output(dustyOutputName)
  : new EasyMidi.Output('From DustyNode', true);

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
