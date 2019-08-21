const random = require('random');
const Engine = require('./engine.js');
const { playNote, stopNote } = require('./midi-util');

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
    instrumentName,
    channel,
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

    this.instrumentName = instrumentName;
    this.onNotes = [];
    this.channel = channel;

    const lines = [
      `initialized ${this.instrumentName}`,
      `address: ${this.address}`,
      `channel: ${this.channel}`,
    ];
    console.log(lines.join('\n'));
  }

  /**
   * randomly play notes
   * @param {Number} latest normalized value from MuseEngine
   */
  update(latest) {
    this.latest = latest;
    if (this.onNotes.length === this.notesAtATime) {
      return null;
    }

    if (random.float() < this.noteOnProbability * this.latest) {
      return this.playNote();
    }

    return null;
  }

  reset(channelMap) {
    // stop all notes
    this.rootManager.updateOffset();
    const channelMapKey = Object.keys(channelMap).find((address) => this.address.includes(address));
    this.channel = channelMap[channelMapKey];

    const lines = [
      `initialized ${this.instrumentName}`,
      `address: ${this.address}`,
      `channel: ${this.channel}`,
    ];
    console.log('re-initializing instruments');
    console.log(lines.join('\n'));

    this.onNotes.forEach((note) => {
      stopNote({ note, velocity: 0, channel: this.channel });
    });
  }

  setOctaveOffset(offset) {
    this.octaveOffset = offset;
  }

  addOnNote(note, duration) {
    this.onNotes.push(note);
    setTimeout(() => {
      this.onNotes = this.onNotes.filter((_note) => _note !== note);
    }, duration);
  }

  getNoteNumber() {
    const pitch = this.scale[random.int(0, this.scale.length - 1)];
    const rootOffset = this.rootManager.getOffset();
    let note = pitch + rootOffset + 12 * this.octaveOffset;
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
    const noteNumber = this.getNoteNumber();
    const velocity = this.getVelocity();
    const duration = this.getDuration();

    playNote({ note: noteNumber, velocity, channel: this.channel, duration });

    this.addOnNote(noteNumber, duration);
    const lines = [
      ``,
      `address: ${this.getAddress()}`,
      `note: ${noteNumber}`,
      `velocity: ${velocity}`,
      `channel: ${this.channel}`,
      `duration: ${duration}`,
      `rootOffset: ${this.rootManager.getOffset()}`,
      ``,
      `*******************************************`,
    ];
    // console.log(lines.join('\n'));
  }
}

module.exports = NoteEngine;
