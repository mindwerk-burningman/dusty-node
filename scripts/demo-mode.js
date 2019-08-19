const NoteEngine = require('../lib/note-engine');
const RootManager = require('../lib/root-manager');
const {
  ADDRESS_BASS,
  ADDRESS_PADS,
  ADDRESS_SPARKLES,
  ADDRESS_ALPHA,
  ADDRESS_BETA,
  ADDRESS_THETA,
  ADDRESS_GAMMA,
} = require('../lib/constants');
const ControllerEngine = require('../lib/controller-engine');

const rootManager = new RootManager();

const bassEngine = new NoteEngine({
  rootManager,
  address: ADDRESS_BASS,
  octaveOffset: 4,
  octaveRange: 1,
  noteOnProbability: 0.25,
  minVelocity: 40,
  maxVelocity: 80,
  maxDuration: 3000,
});

const padsEngine = new NoteEngine({
  rootManager,
  address: ADDRESS_PADS,
  octaveOffset: 6,
  octaveRange: 2,
  noteOnProbability: 0.5,
  minVelocity: 40,
  maxVelocity: 80,
  maxDuration: 5000,
  notesAtATime: 5,
});

const sparklesEngine = new NoteEngine({
  rootManager,
  address: ADDRESS_SPARKLES,
  octaveOffset: 6,
  octaveRange: 2,
  noteOnProbability: 0.14,
  minVelocity: 40,
  maxVelocity: 80,
  maxDuration: 240,
  notesAtATime: 6,
});

const alphaEngine = new ControllerEngine({
  address: ADDRESS_ALPHA,
  channel: 0,
  controllerNumber: 12,
});

const betaEngine = new ControllerEngine({
  address: ADDRESS_BETA,
  channel: 1,
  controllerNumber: 13,
});

const thetaEngine = new ControllerEngine({
  address: ADDRESS_THETA,
  channel: 2,
  controllerNumber: 14,
});

const gammaEngine = new ControllerEngine({
  address: ADDRESS_ALPHA,
  channel: 3,
  controllerNumber: 15,
});

const waveEngines = [alphaEngine, betaEngine, thetaEngine, gammaEngine];
const engines = [bassEngine, padsEngine, sparklesEngine, ...waveEngines];

const valueMap = new Map();
valueMap.set(bassEngine.address, Math.random());
valueMap.set(padsEngine.address, Math.random());
valueMap.set(sparklesEngine.address, Math.random());

const VAL_INCR = 0.05;
const RUN_INTERVAL = 1000;

const getNewVal = (val) => {
  if (val >= 1) {
    return val - 0.75;
  }

  if (val <= 0) {
    return val + 0.25;
  }

  return Math.random() > 0.5 ? val + VAL_INCR : val - VAL_INCR;
};

const updateValues = () => {
  engines.forEach((engine) => {
    const currVal = valueMap.get(engine.address);
    const newVal = getNewVal(currVal);
    valueMap.set(engine.address, newVal);
  });
};

const run = () => {
  updateValues();
  // send to engines latest value
  engines.forEach((engine) => {
    engine.update(valueMap.get(engine.address));
  });
};

setInterval(run, RUN_INTERVAL);
