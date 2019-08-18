class ControlChange {
  constructor(channel, number, value) {
    this.channel = channel;
    this.number = number;
    this.value = value;
  }
}

module.exports = ControlChange;
