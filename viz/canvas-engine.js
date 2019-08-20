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

const quads = [0, 1, 2, 3].map((i) => {
  const quadHeight = windowHeight / waves.length;
  return {
    wave: waves[i],
    origin: {
      x: 0,
      y: quadHeight * i,
    },
    entryPoint: {
      x: center.x,
      y: i === 0 ? quadHeight / 2 : quadHeight / 2 + quadHeight * i,
    },
    size: {
      w: windowWidth,
      y: quadHeight,
    },
    color: colors[i],
  };
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

setInterval(() => {
  quads.forEach(drawDot);
  shift();
}, 500);
