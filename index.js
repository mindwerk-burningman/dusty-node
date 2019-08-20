require('dotenv').config();
const osc = require('osc');
const DustMoreServer = require('./lib/server.js');
const Constants = require('./lib/constants.js');
// viz
const { startVizServer } = require('./viz/asset-server');
const { VizDataServer } = require('./lib/data-server');
const { buildEngineMap } = require('./lib/build-engine-map');

const { WS_PORT } = process.env;
const {
  ADDRESS_ALPHA,
  ADDRESS_BETA,
  ADDRESS_THETA,
  ADDRESS_GAMMA,
  ADDRESS_LIGHT_ALPHA,
  ADDRESS_LIGHT_BETA,
  ADDRESS_IS_GOOD,
} = Constants;

startVizServer();

const vizAddresses = [ADDRESS_ALPHA, ADDRESS_BETA, ADDRESS_THETA, ADDRESS_GAMMA];
const vizServer = new VizDataServer(WS_PORT, vizAddresses);

const { MUSE_LISTEN_PORT } = process.env;

const engineMap = buildEngineMap();

const cleanup = (err) => {
  if (err) {
    console.log('ERROR: ', err);
  }
  engineMap.forEach((engine) => engine.reset());
  console.log('cleaning up...');
  process.exit(0);
};

const onUpdate = (msg) => {
  const { address, args: data } = osc.readMessage(msg);
  const statusEngine = engineMap.get(ADDRESS_IS_GOOD);
  if (address === statusEngine.getAddress()) {
    statusEngine.update(data);
  }

  if (statusEngine.isTransmitting()) {
    if (engineMap.has(address)) {
      const engine = engineMap.get(address);
      engine.update(data);
      vizServer.update(address, data);
      if (engineMap.has(`${address}_sound`)) {
        engineMap.get(`${address}_sound`).update(engine.getLatestNormalized());
      }
    }
    // update lights on all updates
    engineMap
      .get(ADDRESS_LIGHT_ALPHA)
      .update(engineMap.get(ADDRESS_ALPHA).getLatestNormalized() || 0);
    engineMap
      .get(ADDRESS_LIGHT_BETA)
      .update(engineMap.get(ADDRESS_BETA).getLatestNormalized() || 0);
  }
};

const server = new DustMoreServer(MUSE_LISTEN_PORT, onUpdate);
server.start();

process.on('exit', cleanup);
process.on('error', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGUSR1', cleanup);
process.on('SIGUSR2', cleanup);
process.on('uncaughtException', cleanup);
