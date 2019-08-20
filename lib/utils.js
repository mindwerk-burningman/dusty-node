const { mean } = require('lodash');

const normalize = (arr) => {
  const goodVals = arr.map(Boolean);
  return mean(goodVals);
};

module.exports = { normalize };
