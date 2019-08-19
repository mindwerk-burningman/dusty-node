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
  channels: [4, 5, 6, 7],
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
  channels: [8, 9, 10, 11],
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

const controlEngines = [alphaEngine, betaEngine, thetaEngine, gammaEngine];
const soundEngines = [bassEngine, padsEngine, sparklesEngine];

const valueMap = new Map();

// initialize starting val
[...soundEngines, ...controlEngines].forEach((engine) => {
  valueMap.set(engine.address, Math.random());
});

const SOUND_VAL_INCR = 0.05;
const SOUND_UPDATE_INTERVAL = 1000;

const CONTROL_VAL_INCR = 1;
const CONTROL_UPDATE_INTERVAL = 250;

const getNewVal = (val, incr) => {
  if (val >= 1) {
    return val - 0.75;
  }

  if (val <= 0) {
    return val + 0.25;
  }

  return Math.random() > 0.5 ? val + incr : val - incr;
};

const updateSoundValues = () => {
  soundEngines.forEach((engine) => {
    const currVal = valueMap.get(engine.address);
    const newVal = getNewVal(currVal, SOUND_VAL_INCR);
    valueMap.set(engine.address, newVal);
  });
};

const updateControlValues = () => {
  controlEngines.forEach((engine) => {
    const currVal = valueMap.get(engine.address);
    const newVal = getNewVal(currVal, CONTROL_VAL_INCR);
    valueMap.set(engine.address, newVal);
  });
};

const updateSoundEngines = () => {
  updateSoundValues();
  // send to engines latest value
  soundEngines.forEach((engine) => {
    engine.update(valueMap.get(engine.address));
  });
};

const updateControlEngines = () => {
  updateControlValues();
  controlEngines.forEach((engine) => {
    engine.update(valueMap.get(engine.address));
  });
};

setInterval(updateSoundEngines, SOUND_UPDATE_INTERVAL);
setInterval(updateControlEngines, CONTROL_UPDATE_INTERVAL);
