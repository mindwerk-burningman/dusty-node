class StatusMap {
  constructor(addresses) {
    this.addresses = addresses;
    this.statusMap = addresses.reduce((acc, curr) => {
      acc[curr] = false;
      return acc;
    }, {});
    this.reset();
  }

  isReady() {
    return Object.keys(this.statusMap).every((address) => {
      return this.statusMap[address];
    });
  }

  reset() {
    this.statusMap = Object.keys(this.statusMap).reduce((acc, curr) => {
      acc[curr] = false;
      return acc;
    }, {});
  }
}

module.exports = { StatusMap };
