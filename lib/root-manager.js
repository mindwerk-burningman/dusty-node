const random = require('random');

class RootManager {
  constructor() {
    this.offset = null;
  }

  updateOffset() {
    this.offset = random.int(0, 11);
    console.log(`updating offset to: ${this.offset}`);
  }

  getOffset() {
    if (this.offset === null) {
      this.updateOffset();
    }
    return this.offset;
  }
}

module.exports = RootManager;
