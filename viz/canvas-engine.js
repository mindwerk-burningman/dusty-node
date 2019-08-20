/**
 * create 4 quadrants
 * draw 4 dots in center of each quadrant
 * get each to move across screen
 * move new dots to a value of quad.height * val (between -2 & 2)
 */

const ADDRESS_ALPHA = '/muse/elements/alpha_absolute';
const ADDRESS_BETA = '/muse/elements/beta_absolute';
const ADDRESS_GAMMA = '/muse/elements/gamma_absolute';
const ADDRESS_THETA = '/muse/elements/theta_absolute';

const WAVE_MIN_VAL = -2;
const WAVE_MAX_VAL = 2;

const canvas = document.getElementById('canvas');
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;
canvas.width = windowWidth;
canvas.height = windowHeight;
canvas.style.width = `${windowWidth}px`;
canvas.style.height = `${windowHeight}px`;

const center = {
  x: windowWidth / 2,
  y: windowHeight / 2,
};

const waves = [ADDRESS_ALPHA, ADDRESS_BETA, ADDRESS_THETA, ADDRESS_GAMMA];
const colors = ['blue', 'red', 'orange', 'purple'];

class Quad {
  constructor({ height, address, color, origin }) {
    this.address = address;
    this.color = color;
    this.height = height;
    this.origin = origin;
    this.entryPoint = {
      x: center.x,
      y: origin.y + this.height / 2,
    };
  }

  updateEntryPoint(val) {
    const negativeOffset = 0 - WAVE_MIN_VAL;
    const valRange = WAVE_MAX_VAL - WAVE_MIN_VAL;
    const percentOfValRange = (val + negativeOffset) / valRange;
    const scaledY = this.height * percentOfValRange;
    this.entryPoint = {
      x: center.x,
      y: this.origin.y + scaledY,
    };
  }
}

const quads = [0, 1, 2, 3].map((i) => {
  const quadHeight = windowHeight / waves.length;
  return new Quad({
    address: waves[i],
    height: quadHeight,
    origin: {
      x: 0,
      y: quadHeight * i,
    },
    color: colors[i],
  });
});

const ctx = canvas.getContext('2d');
ctx.fillRect(0, 0, windowWidth, windowHeight);

const dotSize = 4;

const drawDot = (quad) => {
  ctx.save();
  ctx.fillStyle = quad.color;
  ctx.translate(quad.entryPoint.x - dotSize, quad.entryPoint.y - dotSize);
  ctx.fillRect(0, 0, dotSize, dotSize);
  ctx.restore();
};

const shift = () => {
  const prevFrame = ctx.getImageData(dotSize, 0, ctx.canvas.width / 2, ctx.canvas.height);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, windowWidth, windowHeight);
  ctx.putImageData(prevFrame, 0, 0);
};

const update = (valMap) => {
  quads.forEach((quad) => {
    quad.updateEntryPoint(valMap[quad.address]);
    drawDot(quad);
  });
  shift();
};

const wsClient = new WebSocket('ws://localhost:4321');
wsClient.addEventListener('open', () => {
  console.log('connected to ws host');
});

wsClient.addEventListener('message', (event) => {
  try {
    const valMap = JSON.parse(event.data);
    update(valMap);
  } catch (err) {
    console.error('error attempting to parse event data');
  }
});
