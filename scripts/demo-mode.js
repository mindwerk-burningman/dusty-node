const NoteEngine = require('../lib/note-engine');
const RootManager = require('../lib/root-manager');
const { ADDRESS_BASS, ADDRESS_PADS, ADDRESS_SPARKLES } = require('../lib/constants');

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

const engines = [bassEngine, padsEngine, sparklesEngine];

const valueMap = new Map();
valueMap.set(bassEngine.address, Math.random());
valueMap.set(padsEngine.address, Math.random());
valueMap.set(sparklesEngine.address, Math.random());

const VAL_INCR = 0.05;
const RUN_INTERVAL = 1000;

const updateValues = () => {
  engines.forEach((engine) => {
    const currVal = valueMap.get(engine.address);
    const newVal = Math.random() > 0.5 ? currVal + VAL_INCR : currVal - VAL_INCR;
    valueMap.set(engine.address, newVal);
  });
};

const run = () => {
  updateValues();
  // send to sound engines latest value
  engines.forEach((engine) => {
    engine.update(valueMap.get(engine.address));
  });
};

setInterval(run, RUN_INTERVAL);
