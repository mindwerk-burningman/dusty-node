const random = require('random');
const Engine = require('./engine.js');
const MaxMessage = require('./models/max-message.js');
const { ADDRESS_RESET } = require('./constants.js');

const ODD_NOTE_PROBABILITY = 0.002;

class NoteEngine extends Engine {
  constructor({
    museEngine,
    address,
    client,
    octaveOffset = 0,
    octaveRange,
    rootManager,
    statusManager,
    noteOnProbability,
    minVelocity = 0,
    maxVelocity = 127,
    minDuration = 240,
    maxDuration = 5000,
    notesAtATime = 1,
  }) {
    super();
    this.museEngine = museEngine;
    this.address = address;
    this.client = client;
    this.octaveOffset = octaveOffset;
    this.noteOnProbability = noteOnProbability;

    this.minVelocity = minVelocity;
    this.maxVelocity = maxVelocity;

    this.maxDuration = maxDuration;
    this.minDuration = minDuration;
    this.notesAtATime = notesAtATime;
    this.octaveOffset = octaveOffset;
    this.rootManager = rootManager;
    this.statusManager = statusManager;

    // defaults
    this.scale = [0, 4, 7, 11, 14, 18, 21]; // maj9#11 13
    this.rootOffset = rootManager.getOffset();
    this.octaveRange = octaveRange;

    this.instrumentName = this.address.replace('/dust_more/', '');
    this.onNotes = [];
  }

  /**
   * randomly play notes
   * @param {Number} latest normalized value from MuseEngine
   */
  update(latest) {
    this.latest = latest;
    if (random.float() < this.noteOnProbability * this.latest) {
      this.playNote();
    }
  }

  reset() {
    // send fadeout/flush message
    this.rootManager.updateOffset();
    const message = new MaxMessage({
      address: ADDRESS_RESET,
      data: 0,
    });
    this.client.send(message);
    console.log(`resetting ${this.instrumentName}...`);
  }

  getScale() {
    return this.scale;
  }

  setRootOffset(offset) {
    this.rootOffset = offset;
  }

  getOctaveOffset() {
    return this.octaveOffset;
  }

  getRootOffset() {
    return this.rootOffset;
  }

  setOctaveOffset(offset) {
    this.octaveOffset = offset;
  }

  getNoteNumber() {
    const scale = this.getScale();
    const pitch = scale[random.int(0, scale.length - 1)];
    const rootOffset = this.rootManager.getOffset();
    const octaveOffset = this.getOctaveOffset();
    let note = pitch + rootOffset + 12 * octaveOffset;
    if (Math.random() > ODD_NOTE_PROBABILITY) {
      note += 1;
      // console.log('odd note');
    }
    if (Math.random() > 0.25) {
      note += 12 * this.octaveRange;
    }
    return note;
  }

  /**
   * make a reasonable velocity based on muze value
   * @return velocity
   */
  getVelocity() {
    const normalized = this.latest;
    const range = this.maxVelocity - this.minVelocity;
    const velocity = Math.floor(range * normalized + this.minVelocity);
    return velocity;
  }

  /**
   * make a reasonable duration
   * @return velocity
   */
  getDuration() {
    const normalized = this.latest;
    const range = this.maxDuration - this.minDuration;
    const duration = Math.floor(range * normalized + this.minDuration);
    return duration;
  }

  getOnNotes() {
    return this.onNotes;
  }

  removeOnNote(toRemove) {
    this.onNotes = this.getOnNotes().filter((note) => note !== toRemove);
  }

  addOnNote(noteNumber, duration) {
    this.getOnNotes().push(noteNumber);
    setTimeout(() => {
      this.removeOnNote(noteNumber);
    }, duration);
  }

  hasOnNotes() {
    return this.getOnNotes().length !== 0;
  }

  setNotesAtAtime(notesAtAtime) {
    this.notesAtATime = notesAtAtime;
  }

  getNotesAtATime() {
    return this.notesAtATime;
  }

  /**
   * get a note, send note on message, delay and note off message
   */
  playNote() {
    if (this.getOnNotes().length < this.getNotesAtATime()) {
      const noteNumber = this.getNoteNumber();
      const velocity = this.getVelocity();
      const duration = this.getDuration();

      const data = [noteNumber, velocity, duration];
      const maxMessage = new MaxMessage({ address: this.address, data });
      this.client.send(maxMessage); // Send a Midi noteOn
      this.addOnNote(noteNumber, duration);
      const lines = [
        ``,
        `address: ${this.getAddress()}`,
        `note: ${noteNumber}`,
        `velocity: ${velocity}`,
        `duration: ${duration}`,
        `rootOffset: ${this.rootManager.getOffset()}`,
        ``,
        `*******************************************`,
      ];
      console.log(lines.join('\n'));
    }
  }
}

module.exports = NoteEngine;
