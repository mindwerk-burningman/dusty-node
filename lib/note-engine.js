const random = require('random');
const Engine = require('./engine.js');
const { playNote } = require('./midi-util');

/**
 * channel ranges
 * bass = [0, 3]
 * pads = [4, 7]
 * sparkles = [8, 11]
 * wildcard = [12, 15]
 */

const ODD_NOTE_PROBABILITY = 0.002;
const WILDCARD_CHANNELS = [12, 13, 14, 15];

class NoteEngine extends Engine {
  constructor({
    address,
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
    channels = [0, 1, 2, 3],
  }) {
    super();
    this.address = address;
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
    this.channels = channels;
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
    this.updateChannel();
    console.log(`resetting ${this.instrumentName}...`);
  }

  updateChannel() {
    const chooseWildcard = Math.random() < 0.25;
    if (chooseWildcard) {
      return WILDCARD_CHANNELS[random.int(0, WILDCARD_CHANNELS.length)];
    }
    return this.channels[random.int(0, this.channels.length)];
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

  /**
   * get a note, send note on message, delay and note off message
   */
  playNote() {
    if (this.getOnNotes().length < this.getNotesAtATime()) {
      const noteNumber = this.getNoteNumber();
      const velocity = this.getVelocity();
      const duration = this.getDuration();
      const channel = this.getChannel();
      playNote({ note: noteNumber, velocity, channel, duration });

      this.addOnNote(noteNumber, duration);
      const lines = [
        ``,
        `address: ${this.getAddress()}`,
        `note: ${noteNumber}`,
        `velocity: ${velocity}`,
        `channel: ${channel}`,
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
