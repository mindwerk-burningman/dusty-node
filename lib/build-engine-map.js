const MuseEngine = require('./muse-engine.js');
const NoteEngine = require('./note-engine.js');
const RootManager = require('./root-manager.js');
const ControllerEngine = require('./controller-engine');
const DustMoreClient = require('./client.js');
const LightEngine = require('./light-engine.js');
const StatusEngine = require('./status-engine.js');

const {
  ADDRESS_ALPHA,
  ADDRESS_BETA,
  ADDRESS_GAMMA,
  ADDRESS_THETA,

  ADDRESS_BASS,
  ADDRESS_PADS,
  ADDRESS_SPARKLES,

  ADDRESS_IS_GOOD,

  ADDRESS_LIGHT_ALPHA,
  ADDRESS_LIGHT_BETA,

  NOTE_ON_PROBABILITY_BASS,
  NOTE_OFF_PROBABILITY_BASS,
  NOTE_ON_PROBABILITY_PADS,
  NOTE_OFF_PROBABILITY_PADS,
  NOTE_ON_PROBABILITY_SPARKLES,
  NOTE_OFF_PROBABILITY_SPARKLES,
  MIN_VELOCITY_BASS,
  MIN_VELOCITY_PADS,
  MIN_VELOCITY_SPARKLES,
  MAX_VELOCITY_BASS,
  MAX_VELOCITY_PADS,
  MAX_VELOCITY_SPARKLES,
  MAX_DURATION_BASS,
  MAX_DURATION_PADS,
  MAX_DURATION_SPARKLES,
  OCTAVE_OFFSET_BASS,
  OCTAVE_RANGE_BASS,
  OCTAVE_OFFSET_PADS,
  OCTAVE_RANGE_PADS,
  OCTAVE_OFFSET_SPARKLES,
  OCTAVE_RANGE_SPARKLES,
  CONTROLLER_ENGINE_CHANNEL,
} = require('./constants');

const { PI_HOST, PI_PORT } = process.env;

const buildEngineMap = () => {
  const engineMap = new Map();

  const rootManager = new RootManager();
  const lightClient = new DustMoreClient(PI_HOST, PI_PORT);
  const lightEngineAlpha = new LightEngine({ client: lightClient, address: ADDRESS_LIGHT_ALPHA });
  const lightEngineBeta = new LightEngine({ client: lightClient, address: ADDRESS_LIGHT_BETA });
  engineMap.set(ADDRESS_LIGHT_ALPHA, lightEngineAlpha);
  engineMap.set(ADDRESS_LIGHT_BETA, lightEngineBeta);

  const statusEngine = new StatusEngine({ address: ADDRESS_IS_GOOD, engineMap });
  engineMap.set(ADDRESS_IS_GOOD, statusEngine);

  // note engines
  const bassEngine = new NoteEngine({
    address: ADDRESS_BASS,
    octaveOffset: OCTAVE_OFFSET_BASS,
    octaveRange: OCTAVE_RANGE_BASS,
    rootManager,
    noteOnProbability: NOTE_ON_PROBABILITY_BASS,
    noteOffProbability: NOTE_OFF_PROBABILITY_BASS,
    minVelocity: MIN_VELOCITY_BASS,
    maxVelocity: MAX_VELOCITY_BASS,
    maxDuration: MAX_DURATION_BASS,
    channels: [0, 1, 2, 3],
  });

  const padsEngine = new NoteEngine({
    address: ADDRESS_PADS,
    octaveOffset: OCTAVE_OFFSET_PADS,
    octaveRange: OCTAVE_RANGE_PADS,
    rootManager,
    noteOnProbability: NOTE_ON_PROBABILITY_PADS,
    noteOffProbability: NOTE_OFF_PROBABILITY_PADS,
    minVelocity: MIN_VELOCITY_PADS,
    maxVelocity: MAX_VELOCITY_PADS,
    maxDuration: MAX_DURATION_PADS,
    notesAtATime: 5,
    channels: [4, 5, 6, 7],
  });

  const sparklesEngine = new NoteEngine({
    address: ADDRESS_SPARKLES,
    octaveOffset: OCTAVE_OFFSET_SPARKLES,
    octaveRange: OCTAVE_RANGE_SPARKLES,
    rootManager,
    noteOnProbability: NOTE_ON_PROBABILITY_SPARKLES,
    noteOffProbability: NOTE_OFF_PROBABILITY_SPARKLES,
    minVelocity: MIN_VELOCITY_SPARKLES,
    maxVelocity: MAX_VELOCITY_SPARKLES,
    maxDuration: MAX_DURATION_SPARKLES,
    notesAtATime: 6,
    channels: [8, 9, 10, 11],
  });

  const alphaEngine = new ControllerEngine({
    channel: CONTROLLER_ENGINE_CHANNEL,
    controllerNumber: 1,
  });

  const betaEngine = new ControllerEngine({
    channel: CONTROLLER_ENGINE_CHANNEL,
    controllerNumber: 2,
  });

  const thetaEngine = new ControllerEngine({
    channel: CONTROLLER_ENGINE_CHANNEL,
    controllerNumber: 3,
  });

  const gammaEngine = new ControllerEngine({
    channel: CONTROLLER_ENGINE_CHANNEL,
    controllerNumber: 4,
  });

  // muse engines
  engineMap.set(
    ADDRESS_ALPHA,
    new MuseEngine({ address: ADDRESS_ALPHA, controllerEngine: alphaEngine })
  );
  engineMap.set(
    ADDRESS_BETA,
    new MuseEngine({ address: ADDRESS_BETA, controllerEngine: betaEngine })
  );
  engineMap.set(
    ADDRESS_THETA,
    new MuseEngine({ address: ADDRESS_THETA, controllerEngine: thetaEngine })
  );
  engineMap.set(
    ADDRESS_GAMMA,
    new MuseEngine({ address: ADDRESS_GAMMA, controllerEngine: gammaEngine })
  );

  engineMap.set(`${ADDRESS_ALPHA}_sound`, bassEngine);
  engineMap.set(`${ADDRESS_BETA}_sound`, padsEngine);
  engineMap.set(`${ADDRESS_THETA}_sound`, sparklesEngine);

  return engineMap;
};

module.exports = { buildEngineMap };
