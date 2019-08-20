module.exports = {
  ERROR_THRESHOLD: 20,
  // input addresses / output from muse
  ADDRESS_ALPHA: '/muse/elements/alpha_absolute',
  ADDRESS_BETA: '/muse/elements/beta_absolute',
  ADDRESS_GAMMA: '/muse/elements/gamma_absolute',
  ADDRESS_THETA: '/muse/elements/theta_absolute',
  ADDRESS_IS_GOOD: '/muse/elements/is_good',

  // output addresses to max
  ADDRESS_BASS: '/dusty_node/bass',
  ADDRESS_PADS: '/dusty_node/pads',
  ADDRESS_SPARKLES: '/dusty_node/sparkles',
  ADDRESS_RESET: '/dusty_node/reset',
  ADDRESS_ATTENTION: '/dusty_node/attention',

  // output addresses to raspberry pi
  ADDRESS_LIGHT_ALPHA: '/sean/alpha',
  ADDRESS_LIGHT_BETA: '/sean/beta',

  NOTE_ON_PROBABILITY_BASS: 0.25,
  MIN_VELOCITY_BASS: 40,
  MAX_VELOCITY_BASS: 80,
  MAX_DURATION_BASS: 3000,
  OCTAVE_OFFSET_BASS: 3,
  OCTAVE_RANGE_BASS: 1,

  NOTE_ON_PROBABILITY_PADS: 0.5,
  MIN_VELOCITY_PADS: 40,
  MAX_VELOCITY_PADS: 80,
  MAX_DURATION_PADS: 5000,
  OCTAVE_OFFSET_PADS: 5,
  OCTAVE_RANGE_PADS: 2,

  NOTE_ON_PROBABILITY_SPARKLES: 0.14,
  MIN_VELOCITY_SPARKLES: 40,
  MAX_VELOCITY_SPARKLES: 80,
  MAX_DURATION_SPARKLES: 240,
  OCTAVE_OFFSET_SPARKLES: 6,
  OCTAVE_RANGE_SPARKLES: 2,

  CONTROLLER_ENGINE_CHANNEL: 13,
};
