const EasyMidi = require('easymidi');

const ccMap = {
  alpha: {
    nano: 1,
    out: 12,
  },
  beta: {
    nano: 2,
    out: 13,
  },
  theta: {
    nano: 3,
    out: 14,
  },
  gamma: {
    nano: 4,
    out: 15,
  },
};

const inputs = EasyMidi.getInputs();
const lines = [`Inputs:`, ...inputs];
console.log(lines.join('\n'));
const nanoInput = inputs.find((input) => input.toLowerCase().includes('nano'));
if (!nanoInput) {
  console.log('did not find nano controller');
} else {
  const input = new EasyMidi.Input(nanoInput);
  input.on('cc', ({ value, controller }) => {
    if (controller === 1) {
      sendControlChange({
        value,
        controller: ccMap.out,
        channel: alphaEngine.channel,
      });
    }

    if (controller === 2) {
      sendControlChange({
        value,
        controller: betaEngine.controllerNumber,
        channel: betaEngine.channel,
      });
    }

    if (controller === 3) {
      sendControlChange({
        value,
        controller: thetaEngine.controllerNumber,
        channel: thetaEngine.channel,
      });
    }
  });
}
