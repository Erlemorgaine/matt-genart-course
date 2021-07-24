const canvasSketch = require("canvas-sketch");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");

const settings = {
  dimensions: [2048, 2048],
};

const sketch = () => {
  const createGrid = () => {
    const points = [];
    const count = 20; // other option: 40

    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        // For now we are working in uv space instead of pixel values
        const u = x / (count - 1);
        const v = y / (count - 1);
        points.push({
          radius: Math.abs(random.gaussian() * 0.01), // abs makes the negativse positives (gaussian is between -0.3 (?))
          // noise option:  Math.abs(random.noise2D(u, v)) * 0.02
          position: [u, v],
        });
      }
    }

    return points;
  };

  random.setSeed(512); // With this deterministic seed you will always end up with the same randomness. Can be any number
  const points = createGrid().filter(() => random.value() > 0.5);
  const margin = 400;

  return ({ context, width, height }) => {
    // Fill the canvas with white
    context.fillStyle = "hsl(200, 100%, 5%)";
    context.fillRect(0, 0, width, height);

    points.forEach(({ position, radius }) => {
      const [u, v] = position;
      const x = lerp(margin, width - margin, u);
      const y = lerp(margin, height - margin, v);

      context.beginPath();
      context.arc(x, y, radius * width, 0, Math.PI * 2, false);
      // Other color posibilities: 0, 150,

      context.fillStyle = `hsla(${Math.abs(random.gaussian() * 25) + 200},
      ${Math.abs(random.gaussian() * 50) + 30}%, 
      ${Math.abs(random.gaussian() * 50) + 10}%,
      ${Math.random()})`;
      context.fill();
    });
  };
};

canvasSketch(sketch, settings);
