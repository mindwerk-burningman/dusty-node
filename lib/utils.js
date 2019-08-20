const { mean } = require('lodash');

const normalize = (arr) => {
  const goodVals = arr.filter(Boolean);
  return mean(goodVals);
};

module.exports = { normalize };
