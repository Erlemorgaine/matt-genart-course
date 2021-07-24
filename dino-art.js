const canvasSketch = require("canvas-sketch");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

const settings = {
  dimensions: [2048, 2048],
};

const sketch = () => {
  const palette = random.pick(palettes); // Slice to limit colors since its an array of colors

  const createGrid = () => {
    const points = [];
    const count = 40;

    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        // For now we are working in uv space instead of pixel values
        const u = x / (count - 1);
        const v = y / (count - 1);
        points.push({
          color: random.pick(palette),
          radius: Math.abs(random.noise2D(u, v)) * 0.07,
          rotation: random.noise2D(u, v),
          position: [u, v],
        });
      }
    }

    return points;
  };

  const points = createGrid().filter(() => random.value() > 0.5);
  const margin = 400;

  return ({ context, width, height }) => {
    // Fill the canvas with white
    context.fillStyle = "hsl(190, 100%, 5%)";
    context.fillRect(0, 0, width, height);

    points.forEach(({ position, radius, color, rotation }) => {
      const [u, v] = position;
      const x = lerp(margin, width - margin, u);
      const y = lerp(margin, height - margin, v);

      context.save(); // Saves transformation state (all the stuff that comes next)
      context.fillStyle = color;
      context.font = `${radius * width}px "Fascinate"`;
      context.translate(x, y); // We need this to rotate from the grid point instead of from 0, 0. This sets the origin point
      context.rotate(rotation);
      context.fillText(
        ["d", "i", "n", "o"][Math.floor(Math.random() * 4)],
        //"➛",
        0,
        0
      ); // 0, 0 = x & y
      context.restore(); // Restores the canvas to how it was before
    });
  };
};

canvasSketch(sketch, settings);
