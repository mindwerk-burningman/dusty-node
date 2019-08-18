require('dotenv').config();
const osc = require('osc');
const DustMoreServer = require('./lib/server.js');
const DustMoreClient = require('./lib/client.js');
const LightEngine = require('./lib/light-engine.js');
const MuseEngine = require('./lib/muse-engine.js');
const NoteEngine = require('./lib/note-engine.js');
const StatusEngine = require('./lib/status-engine.js');
const AttentionEngine = require('./lib/attention-engine.js');
const Constants = require('./lib/constants.js');
const RootManager = require('./lib/root-manager.js');

const {
  ADDRESS_ALPHA,
  ADDRESS_BETA,
  ADDRESS_GAMMA,
  ADDRESS_THETA,
  ADDRESS_IS_GOOD,
  ADDRESS_ATTENTION,

  ADDRESS_BASS,
  ADDRESS_PADS,
  ADDRESS_SPARKLES,

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
} = Constants;

const { MUSE_LISTEN_PORT, MAX_SEND_PORT, LOCALHOST, PI_HOST, PI_PORT } = process.env;

const engineMap = new Map();
const client = new DustMoreClient(LOCALHOST, MAX_SEND_PORT);
const lightClient = new DustMoreClient(PI_HOST, PI_PORT);
const rootManager = new RootManager();
const lightEngineAlpha = new LightEngine({ client: lightClient, address: ADDRESS_LIGHT_ALPHA });
const lightEngineBeta = new LightEngine({ client: lightClient, address: ADDRESS_LIGHT_BETA });

// note engines
const bassEngine = new NoteEngine({
  address: ADDRESS_BASS,
  client,
  octaveOffset: OCTAVE_OFFSET_BASS,
  octaveRange: OCTAVE_RANGE_BASS,
  rootManager,
  noteOnProbability: NOTE_ON_PROBABILITY_BASS,
  noteOffProbability: NOTE_OFF_PROBABILITY_BASS,
  minVelocity: MIN_VELOCITY_BASS,
  maxVelocity: MAX_VELOCITY_BASS,
  maxDuration: MAX_DURATION_BASS,
});

const padsEngine = new NoteEngine({
  address: ADDRESS_PADS,
  client,
  octaveOffset: OCTAVE_OFFSET_PADS,
  octaveRange: OCTAVE_RANGE_PADS,
  rootManager,
  noteOnProbability: NOTE_ON_PROBABILITY_PADS,
  noteOffProbability: NOTE_OFF_PROBABILITY_PADS,
  minVelocity: MIN_VELOCITY_PADS,
  maxVelocity: MAX_VELOCITY_PADS,
  maxDuration: MAX_DURATION_PADS,
  notesAtATime: 5,
});

const sparklesEngine = new NoteEngine({
  address: ADDRESS_SPARKLES,
  client,
  octaveOffset: OCTAVE_OFFSET_SPARKLES,
  octaveRange: OCTAVE_RANGE_SPARKLES,
  rootManager,
  noteOnProbability: NOTE_ON_PROBABILITY_SPARKLES,
  noteOffProbability: NOTE_OFF_PROBABILITY_SPARKLES,
  minVelocity: MIN_VELOCITY_SPARKLES,
  maxVelocity: MAX_VELOCITY_SPARKLES,
  maxDuration: MAX_DURATION_SPARKLES,
  notesAtATime: 6,
});

// muse engines
engineMap.set(ADDRESS_GAMMA, new MuseEngine({ address: ADDRESS_GAMMA, client }));
engineMap.set(ADDRESS_ALPHA, new MuseEngine({ address: ADDRESS_ALPHA, client }));
engineMap.set(ADDRESS_BETA, new MuseEngine({ address: ADDRESS_BETA, client }));
engineMap.set(ADDRESS_THETA, new MuseEngine({ address: ADDRESS_THETA, client }));

engineMap.set(`${ADDRESS_ALPHA}_sound`, bassEngine);
engineMap.set(`${ADDRESS_BETA}_sound`, padsEngine);
engineMap.set(`${ADDRESS_THETA}_sound`, sparklesEngine);

engineMap.set(
  ADDRESS_ATTENTION,
  new AttentionEngine({ address: ADDRESS_ATTENTION, client, engineMap })
);
const statusEngine = new StatusEngine({ address: ADDRESS_IS_GOOD, client, engineMap });
engineMap.set(ADDRESS_IS_GOOD, statusEngine);

const cleanup = () => {
  engineMap.forEach((engine) => engine.reset());
  lightEngineAlpha.reset();
  lightEngineBeta.reset();
  console.log('cleaning up...');
  process.exit(0);
};

const onUpdate = (msg) => {
  const { address, args: data } = osc.readMessage(msg);
  if (address === statusEngine.getAddress()) {
    statusEngine.update(data);
  }

  if (statusEngine.isTransmitting()) {
    if (engineMap.has(address)) {
      const engine = engineMap.get(address);
      engine.update(data);
      if (engineMap.has(`${address}_sound`)) {
        engineMap.get(`${address}_sound`).update(engine.getLatestNormalized());
      }
      // attention and lights get updated on all inputs
      engineMap.get(ADDRESS_ATTENTION).update(data);
    }
    lightEngineAlpha.update(engineMap.get(ADDRESS_ALPHA).getLatestNormalized() || 0);
    lightEngineBeta.update(engineMap.get(ADDRESS_BETA).getLatestNormalized() || 0);
  }
};

const server = new DustMoreServer(client, MUSE_LISTEN_PORT, onUpdate);
server.start();

process.on('exit', cleanup);
process.on('error', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGUSR1', cleanup);
process.on('SIGUSR2', cleanup);
process.on('uncaughtException', cleanup);

module.exports = { client, server, engineMap };
