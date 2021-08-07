const canvasSketch = require("canvas-sketch");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");

const settings = {
  dimensions: [2048, 2048],
  pixelsPerInch: 300,
};

const sketch = () => {
  const createGrid = () => {
    const points = [];
    const count = 5;

    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        // For now we are working in uv space instead of pixel values
        const u = Math.abs(x / (count - 1) + random.gaussian()) / 2;
        const v = Math.abs(y / (count - 1) + random.gaussian()) / 2;

        points.push({
          rectWidth: Math.abs(random.gaussian() * 5000),
          rectHeight: Math.abs(random.gaussian() * 5000),
          // noise option:  Math.abs(random.noise2D(u, v)) * 0.02
          position: [u, v],
          color: `hsla(${Math.abs(random.gaussian() * 25) + 200},
            ${Math.abs(random.gaussian() * 50) + 30}%, 
            ${Math.abs(random.gaussian() * 50) + 10}%,
            1)`,
        });
      }
    }

    return points;
  };

  random.setSeed(512); // With this deterministic seed you will always end up with the same randomness. Can be any number
  const points = createGrid().filter(() => random.value() > 0.5);
  const margin = -100;

  return ({ context, width, height }) => {
    // Fill the canvas with white
    context.fillStyle = "hsl(20, 100%, 50%)";
    context.fillRect(0, 0, width, height);

    points.forEach(({ position, rectWidth, rectHeight, color }) => {
      console.log(position);

      const [u, v] = position;
      const x = lerp(margin, width - margin, u);
      const y = lerp(margin, height - margin, v);

      context.beginPath();
      context.rect(x, y, rectWidth, rectHeight);

      context.strokeStyle = `hsl(0, 0%, 0%)`;
      context.lineWidth = 50;
      context.stroke();

      context.fillStyle = color;
      context.fill();
    });
  };
};

canvasSketch(sketch, settings);
