const { mean } = require('lodash');
const random = require('random');
const {
  ADDRESS_ALPHA,
  ADDRESS_BETA,
  ADDRESS_THETA,
} = require('./constants');

const normalize = (arr) => {
  const goodVals = arr.filter(Boolean);
  return mean(goodVals);
};

const getNextChannel = (channels) => {
  const anyChannels = [12, 13, 14, 15];
  const chooseWildcard = Math.random() < 0.25;
  if (chooseWildcard) {
    return anyChannels[random.int(0, anyChannels.length - 1)];
  }
  return channels[random.int(0, channels.length - 1)];
};

const getChannelMap = () => {
  const bassChannels = [0, 1, 2, 3];
  const padChannels = [4, 5, 6, 7];
  const sparklesChannels = [8, 9, 10, 11];
  const channelMap = {
    [ADDRESS_ALPHA]: getNextChannel(bassChannels),
    [ADDRESS_BETA]: getNextChannel(padChannels),
    [ADDRESS_THETA]: getNextChannel(sparklesChannels),
  };
  console.log('channel map:');
  console.log(JSON.stringify(channelMap, null, 2));
  return channelMap;
};

const getChannelForAddress = (channelMap, address) => {
  const channelMapKey = Object.keys(channelMap).find((_address) => address.includes(_address));
  return channelMap[channelMapKey];
};

module.exports = { normalize, getChannelMap, getChannelForAddress };
