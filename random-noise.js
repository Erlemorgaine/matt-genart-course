const canvasSketch = require("canvas-sketch");
const { lerp } = require("canvas-sketch-util/math");

const settings = {
  dimensions: [2048, 2048],
};

const sketch = () => {
  const createGrid = () => {
    const points = [];
    const count = 45;

    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        // For now we are working in uv space instead of pixel values
        const u = x / (count - 1);
        const v = y / (count - 1);
        points.push([u, v]);
      }
    }

    return points;
  };

  const points = createGrid().filter(() => Math.random() > 0.6);
  const margin = 400;

  return ({ context, width, height }) => {
    // Fill the canvas with white
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    points.forEach(([u, v]) => {
      const x = lerp(margin, width - margin, u);
        const y = lerp(margin, height - margin, v);
        const radius = Math.abs(random.noise2D(u, v)) * 0.07,

      context.beginPath();
      context.arc(x, y, Math.random() * 7.5, 0, Math.PI * 2, false);
      context.strokeStyle = `hsl(20, ${Math.random() * 750}%, ${
        Math.random() * 100
      }%)`;
      context.lineWidth = 10;
      context.stroke();
    });
  };
};

canvasSketch(sketch, settings);
